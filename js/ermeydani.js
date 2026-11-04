/* Er Meydanı (3–4 kişi): herkes aynı soruyu aynı anda görür; önce doğru basan puanı alır.
   Oda ve oyuncu altyapısı Oyun Odası ile aynıdır (yaris.js); tur sonucu her telefonda aynı kuralla hesaplanır:
   oyuncular kimliğe göre sıralanır, en hızlı doğru cevap puan alır, ilk iki doğru 200 ms'den yakınsa tur berabere sayılır. */
'use strict';
let AR=null;
const AR_WAIT_MS=2000;
function arOn(){return !!(YR.room&&YR.room.mode==='arena');}
function arSorted(){return YR.players.slice().sort((a,b)=>a.uid<b.uid?-1:a.uid>b.uid?1:0);}
function arGone(p){return p.uid!==yrMe()&&(!!p.done||!!(YR.seen[p.uid]&&Date.now()-YR.seen[p.uid]>45000));}
function arPts(uid){return AR&&AR.sc[uid]|0;}
function arStart(){
 if(YR.tm){clearInterval(YR.tm);YR.tm=null;}
 AR={k:-1,total:YR.qs.length,myR:[],win:[],sc:{},ph:'intro',over:false,quit:false,to:null,lim:YR.room.lim*1000,t0:0,pick:null,why:'',res:null,final:null};
 st.screen='aintro';YR.count=3;render();
 if(YR.cd)clearInterval(YR.cd);
 YR.cd=setInterval(()=>{YR.count--;if(YR.count<=0){clearInterval(YR.cd);YR.cd=null;if(st.screen==='aintro'&&AR)arRound(0);return;}if(st.screen==='aintro')render();},1000);
 arWrite();
}
function arWrite(){
 if(!AR||!yrTransport||!YR.room)return;
 const pts=Math.min(arPts(yrMe()),AR.myR.length);
 yrSend({nick:YR.nick,score:pts,ok:pts,bad:0,n:Math.min(AR.myR.length,60),tt:0,done:!!(AR.over||AR.quit),ts:Date.now(),rid:YR.room.created,m:0,r:AR.myR.slice(),pr:[]});
}
function arRound(k){
 if(!AR||AR.over)return;
 AR.k=k;AR.ph='q';AR.t0=performance.now();AR.res=null;AR.pick=null;
 st.screen='aplay';render();
 if(YR.tm)clearInterval(YR.tm);YR.tm=setInterval(arTick,80);
}
function arTick(){
 if(!AR||AR.ph!=='q'||st.screen!=='aplay')return;
 const el=performance.now()-AR.t0,left=Math.max(0,AR.lim-el),f=document.getElementById('yrFill'),t=document.getElementById('yrSec');
 if(f){f.style.width=(left/AR.lim*100)+'%';f.className='yr-fill'+(left<AR.lim*.25?' low':'');}
 if(t)t.textContent=Math.ceil(left/1000)+' sn';
 if(el>=AR.lim)arMine(-AR.lim,'time');
}
function arAns(i){
 if(!AR||AR.ph!=='q')return;
 const q=YR.qs[AR.k],ms=Math.max(1,Math.round(performance.now()-AR.t0));
 if(ms>AR.lim){arMine(-AR.lim,'time');return;}
 AR.pick=i;const ok=q.choices[i].id===q.correct;
 arMine(ok?ms:-ms,ok?'ok':'bad');
}
function arMine(v,why){
 if(!AR||AR.ph!=='q')return;
 AR.ph='wait';AR.why=why;if(YR.tm){clearInterval(YR.tm);YR.tm=null;}
 AR.myR[AR.k]=Math.round(v);arWrite();render();arSync();
 /* Doğru bilen oyuncu, diğerlerinin cevabını en fazla AR_WAIT_MS bekler; ağ gecikmesi yüzünden takılı kalmaz. */
 if(why==='ok'&&AR.ph==='wait'){const a=AR,kk=a.k;a.fto=setTimeout(()=>{if(AR!==a||a.over||a.ph!=='wait'||a.k!==kk)return;a.force=a.force||{};a.force[kk]=1;arSync();},AR_WAIT_MS);}
}
/* Her telefon, turun sonucunu aynı kuralla ve aynı veriyle hesaplar. */
function arSync(){
 if(!AR||AR.over)return;
 if(AR.ph!=='wait')return;
 const k=AR.k,ps=arSorted(),me=yrMe();
 const f=AR.force&&AR.force[k],val=p=>p.uid===me?AR.myR[k]:(((p.r||[])[k]===undefined||(p.r||[])[k]===null)&&f?-1:(p.r||[])[k]);
 const live=ps.filter(p=>!arGone(p));
 if(!live.length||!live.every(p=>val(p)!==undefined&&val(p)!==null))return;
 const times=ps.map(val),w=YarisModel.arWho(times),uid=w>=0?ps[w].uid:null;
 AR.win[k]={uid,times:ps.map((p,i)=>({uid:p.uid,nick:p.uid===me?YR.nick:p.nick,t:times[i]}))};
 if(uid)AR.sc[uid]=(AR.sc[uid]|0)+1;
 if(AR.fto){clearTimeout(AR.fto);AR.fto=null;}
 AR.ph='res';AR.res=AR.win[k];
 if(uid===me&&typeof EFEKT!=='undefined')EFEKT.cal('tur');
 render();arWrite();
 const last=k+1>=AR.total;
 AR.to=setTimeout(()=>{if(!AR||AR.over)return;if(last)arEnd();else if(st.screen==='aplay')arRound(k+1);},last?2200:2600);
}
function arRanks(){
 const me=yrMe();
 return YarisModel.ranks(YR.players.map(p=>({...p,nick:p.uid===me?YR.nick:p.nick,ok:arPts(p.uid)})));
}
function arEnd(){
 if(!AR||AR.over)return;AR.over=true;AR.ph='over';if(AR.to){clearTimeout(AR.to);AR.to=null;}if(AR.fto){clearTimeout(AR.fto);AR.fto=null;}if(YR.tm){clearInterval(YR.tm);YR.tm=null;}
 const r=arRanks(),me=r.find(p=>p.uid===yrMe());AR.final=me?me.rank:null;
 const top=AR.final===1&&r.filter(p=>p.rank===1).length===1;
 AR.rapor=sonucUret('Er Meydanı',yrLabel(YR.room),['arena',YR.room.subject,YR.room.kind,YR.room.set,YR.room.n].join('|'),AR.myR.filter(v=>v!==undefined&&v!==null).map(v=>({ok:v>0,ms:Math.abs(v)})),AR.final===1?'Sıralamada 1. oldun!':AR.final?'Sıralaman: '+AR.final+'.':'');
 if(typeof EFEKT!=='undefined'){if(top&&AR.rapor.durum==='yeni')EFEKT.cal('rekor');else EFEKT.cal(top?'win':'tur');}
 if(typeof sesSoyle==='function')sesSoyle(top?'Er Meydanı\'nın birincisi sensin! Tebrikler.':AR.final===1?'Berabere birinci oldun! Tebrikler.':'Oyun bitti. Sıralamana bakabilirsin.');
 arWrite();
 if(typeof oduKazan==='function')oduKazan('arena',null,{rank:AR.final|0});
 if(typeof rkWinAdd==='function')rkWinAdd('oy-arena',arPts(yrMe()));
 st.screen='aover';render();window.scrollTo(0,0);
}
function arBeat(){
 if(!AR||AR.over)return;
 const ps=YR.players.filter(p=>p.uid!==yrMe());
 if(AR.k>=0&&ps.length&&ps.every(arGone)){arEnd();return;}/* herkes ayrıldı */
 arSync();
}
/* ---------- ekranlar ---------- */
function arScoreHTML(){
 const r=arRanks();
 return '<ul class="yr-rank ar-rank" aria-label="Puanlar">'+r.map(p=>'<li class="yr-row'+(p.uid===yrMe()?' me':'')+(AR.res&&AR.res.uid===p.uid?' hit':'')+'"><span class="yr-rk">'+p.rank+'.</span><span class="yr-nm">'+esc(p.nick)+(p.uid===yrMe()?' (Sen)':'')+(arGone(p)?' 📶':'')+'</span><span class="yr-sc">'+p.ok+' puan</span></li>').join('')+'</ul>';
}
function arIntroHTML(){return '<div class="yr-full"><p>'+esc(yrLabel(YR.room))+' · '+(AR?AR.total:YR.room.n)+' soru</p><h1>⚔️ Er Meydanı</h1><div class="yr-big" id="yrHeading" tabindex="-1" role="status">'+Math.max(1,YR.count)+'</div><p>Önce doğru basan puanı alır. Hazır ol!</p></div>';}
function arPlayHTML(){
 const q=YR.qs[AR.k],asking=AR.ph==='q';
 let h=yrTop('Er Meydanı')+'<div class="wrap">'+yrWarnHTML()+arScoreHTML()+'<p class="yr-prog" id="yrHeading" tabindex="-1">Soru '+(AR.k+1)+' / '+AR.total+'</p>';
 if(asking)h+='<div class="yr-bar" aria-hidden="true"><div class="yr-fill" id="yrFill"></div></div><p class="yr-sec" id="yrSec">'+YR.room.lim+' sn</p>';
 h+=yrQuestionHTML(q)+yrChoicesHTML(q,'arAns',asking?null:{pick:AR.pick});
 if(AR.ph==='wait'){const m={ok:'✓ Doğru! Diğerlerinin cevabına bakılıyor…',bad:'Yanlış! Bu soruda kilitlendin. Diğerleri bekleniyor…',time:'Süre doldu. Diğerleri bekleniyor…'}[AR.why]||'Sonuç bekleniyor…';h+='<p class="yr-wait" role="status">'+m+'</p>';}
 if(AR.ph==='res'){
  const r=AR.res,s=n=>(Math.round(Math.abs(n)/100)/10).toFixed(1).replace('.',','),w=r.uid&&r.times.find(x=>x.uid===r.uid);
  const msg=r.uid===yrMe()?'<b>🎉 Bu tur senin!</b><br><small>'+s(w.t)+' sn</small>':r.uid?'<b>⚡ '+esc(w.nick)+' bildi!</b><br><small>'+s(w.t)+' sn</small>':(r.times.filter(x=>x.t>0).length>=2?'<b>🤝 En hızlı iki kişi aynı anda bildi.</b><br><small>Bu turda puan yok.</small>':'<b>Kimse bilemedi.</b><br><small>Doğrusu: '+esc(q.choices.find(c=>c.id===q.correct).text||q.correct)+'</small>');
  h+='<div class="yr-fb '+(r.uid===yrMe()?'ok':r.uid?'bad':'')+'" role="status">'+msg+(q.explanation?'<p>'+esc(q.explanation)+'</p>':'')+'</div>';
 }
 return h+'<button class="btn ghost" onclick="yrLeave()">Er Meydanı\'ndan çık</button></div>';
}
function arOverHTML(){
 const r=arRanks(),med=['🥇','🥈','🥉'],me=r.find(p=>p.uid===yrMe());
 const t=AR.final===1?'🏆 Birinci sensin!':'Oyun bitti';
 let h=yrTop('Er Meydanı bitti')+'<div class="wrap" style="text-align:center">'+yrWarnHTML()+'<h1 id="yrHeading" tabindex="-1">'+t+'</h1>';
 if(AR.rapor)h+=sonucGoster(AR.rapor);
 h+='<ul class="yr-rank">'+r.map(p=>'<li class="yr-row'+(p.uid===yrMe()?' me':'')+'"><span class="yr-rk">'+(med[p.rank-1]||p.rank+'.')+'</span><span class="yr-nm">'+esc(p.nick)+(p.uid===yrMe()?' (Sen)':'')+'</span><span class="yr-sc">'+p.ok+' puan</span></li>').join('')+'</ul>';
 if(typeof frBtn==='function')r.filter(p=>p.uid!==yrMe()).forEach(p=>{h+=frBtn(p,true);});
 return h+'<button class="btn" onclick="rkOpenBoard(\'oy-arena\')">🏅 Er Meydanı sıralaması</button><button class="btn ghost" onclick="yrLeave()">Çık</button></div>';
}
YR_SCREENS.push('aintro','aplay','aover');
const AR_SCR=yrScreenHTML;
yrScreenHTML=function(){
 switch(st.screen){
  case 'aintro':return AR?arIntroHTML():yrMenuHTML();
  case 'aplay':return AR?arPlayHTML():yrMenuHTML();
  case 'aover':return AR?arOverHTML():yrMenuHTML();
 }
 return AR_SCR();
};
