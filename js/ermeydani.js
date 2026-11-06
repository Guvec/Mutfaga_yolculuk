/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Er Meydanı 2: herkes kendi hızında; final yalnız ortak, bitmiş kayıtlardan üretilir. */
'use strict';
let AR=null;
function arOn(){return !!(YR.room&&YR.room.mode==='arena');}
function arSorted(){return YR.players.filter(p=>AR&&AR.roster.includes(p.uid)).slice().sort((a,b)=>String(a.uid).localeCompare(String(b.uid)));}
function arGone(p){return !!p.left;}
function arPts(uid){const p=arRanks().find(p=>p.uid===uid);return p?p.ok:0;}
function arCacheKey(){return YR.code+'|'+YR.room.created+'|'+yrMe();}
function arCache(){const all=ls('arena_devam',{});all[arCacheKey()]={r:AR.myR.slice(),deadline:AR.deadline||0,k:AR.k};const keys=Object.keys(all);while(keys.length>20)delete all[keys.shift()];lsSet('arena_devam',all);}
function arStart(){
 if(YR.tm){clearInterval(YR.tm);YR.tm=null;}
 const p=YR.resumePlayer,cache=ls('arena_devam',{})[arCacheKey()],remote=p&&Array.isArray(p.r)?p.r:[];
 let r=remote.slice();if(cache&&!p?.done&&Array.isArray(cache.r)&&remote.every((v,i)=>cache.r[i]===v)&&ArenaModel.stats(cache.r).n===cache.r.length)r=cache.r.slice();
 AR={k:r.length,total:YR.qs.length,myR:r,roster:YR.room.roster.slice(),ph:'intro',over:!!p?.done,quit:!!p?.left,finalized:false,awarded:false,final:null,pick:null,t0:0,lim:15000,to:null,expiring:new Set()};
 for(let n=remote.length+1;n<=r.length;n++){const part=r.slice(0,n),ps=ArenaModel.stats(part);yrSend(arRow(part,ps.bad>=4||n>=AR.total,false));}
 if(AR.over){AR.ph='over';st.screen='aover';render();arSync();return;}
 if(ArenaModel.stats(r).bad>=4||r.length>=AR.total){arEnd();return;}
 if(typeof EFEKT!=='undefined')EFEKT.cal('kilic');
 rkCountLeaders(YR.room);st.screen='aintro';YR.count=3;render();
 if(YR.cd)clearInterval(YR.cd);
 YR.cd=setInterval(()=>{YR.count--;if(YR.count<=0){clearInterval(YR.cd);YR.cd=null;if(st.screen==='aintro'&&AR)arRound(AR.myR.length,cache);return;}if(st.screen==='aintro')render();},1000);
 arWrite();
}
function arRow(r,done,left){const s=ArenaModel.stats(r);return {nick:YR.nick,score:s.ok,ok:s.ok,bad:s.bad,n:s.n,tt:s.tt,done:!!done,left:!!left,ts:Date.now(),rid:YR.room.created,m:0,r:r.slice(),pr:[]};}
function arWrite(){
 if(!AR||!yrTransport||!YR.room)return;
 return yrSend(arRow(AR.myR,AR.over||AR.quit,AR.quit));
}
function arRound(k,resume){
 if(!AR||AR.over)return;
 if(AR.to){clearTimeout(AR.to);AR.to=null;}
 const s=ArenaModel.stats(AR.myR);AR.k=k;AR.ph='q';AR.pick=null;AR.why='';AR.lim=ArenaModel.limit(s.ok);
 const remaining=resume&&resume.k===k?Math.min(AR.lim,Math.max(0,resume.deadline-Date.now())):AR.lim;
 AR.t0=performance.now()-(AR.lim-remaining);AR.deadline=Date.now()+remaining;arCache();st.screen='aplay';render();
 if(YR.tm)clearInterval(YR.tm);YR.tm=setInterval(arTick,80);arTick();
}
function arTick(){
 if(!AR||AR.ph!=='q'||st.screen!=='aplay')return;
 const elapsed=performance.now()-AR.t0,left=Math.max(0,AR.lim-elapsed),f=document.getElementById('yrFill'),t=document.getElementById('yrSec');
 if(f){f.style.width=(left/AR.lim*100)+'%';f.className='yr-fill'+(left<AR.lim*.25?' low':'');}if(t)t.textContent=Math.ceil(left/1000)+' sn';
 if(elapsed>=AR.lim)arMine(-AR.lim,'time');
}
function arAns(i){
 if(!AR||AR.over||AR.ph!=='q')return;const q=YR.qs[AR.k];if(!q||!q.choices[i])return;
 const elapsed=performance.now()-AR.t0;if(elapsed>=AR.lim){arMine(-AR.lim,'time');return;}
 AR.pick=i;const ok=q.choices[i].id===q.correct,ms=Math.max(1,Math.round(elapsed));arMine(ok?ms:-ms,ok?'ok':'bad');
}
function arMine(v,why){
 if(!AR||AR.over||AR.ph!=='q')return;
 if(YR.tm){clearInterval(YR.tm);YR.tm=null;}AR.ph='fb';AR.why=why;AR.myR.push(v);arCache();
 if(typeof EFEKT!=='undefined')EFEKT.cal(v>0?'dogru':'yanlis');
 const s=ArenaModel.stats(AR.myR);if(s.bad>=4||s.n>=AR.total){arEnd();return;}
 arWrite();render();const a=AR;a.to=setTimeout(()=>{if(AR===a&&a.ph==='fb'&&!a.over)arNext();},v>0?350:1400);
}
function arNext(){if(!AR||AR.over||AR.ph!=='fb')return;arRound(AR.myR.length);}
function arRanks(){return ArenaModel.ranks(arSorted());}
function arEnd(left){
 if(!AR||AR.over)return;AR.over=true;AR.quit=!!left;AR.ph='over';if(AR.to){clearTimeout(AR.to);AR.to=null;}if(YR.tm){clearInterval(YR.tm);YR.tm=null;}
 arCache();arWrite();st.screen='aover';render();window.scrollTo(0,0);arSync();
}
function arSync(){
 if(!AR||!YR.room)return;
 const own=arSorted().find(p=>p.uid===yrMe());
 if(own?.done&&own.pending===false&&own.fromCache===false){
  AR.myR=own.r.slice();AR.over=true;AR.quit=!!own.left;AR.ph='over';
  if(YR.tm){clearInterval(YR.tm);YR.tm=null;}if(AR.to){clearTimeout(AR.to);AR.to=null;}
  if(YR.writer&&YR.writer.code===YR.code&&YR.writer.rid===YR.room.created){YR.writer.retired=true;YR.writer.items=[];YR.pend=null;YR.warn='';}
  arCache();st.screen='aover';
 }
 if(ArenaModel.complete(AR.roster,arSorted())&&AR.over){
  AR.finalized=true;const rows=arRanks(),me=rows.find(p=>p.uid===yrMe());AR.final=me?.rank||null;
  if(!AR.awarded&&me&&!me.left){AR.awarded=true;const top=AR.final===1,key=arCacheKey(),awards=ls('arena_odul',{});
   if(awards[key])AR.rapor={...awards[key].rapor,zaman:new Date(awards[key].rapor.zaman)};
   else{
    AR.rapor=sonucUret('Er Meydanı',yrLabel(YR.room),'arena2|ma-bh|75',me.r.map(v=>({ok:v>0,ms:Math.abs(v)})),top?'Sıralamada 1. oldun.':'');
    awards[key]={rapor:AR.rapor,at:Date.now()};
    if(lsSet('arena_odul',awards)){
     rutbeMatch('arena',AR);if(typeof oduKazan==='function')oduKazan('arena',null,{rank:AR.final|0});
     if(top&&me.ok>0&&typeof rkWinAdd==='function')rkWinAdd('oy-arena2',1);
    }
    if(typeof EFEKT!=='undefined')EFEKT.cal(top?'win':'tur');
   }
  }
 }
 if(st.screen==='aover')render();else if(st.screen==='aplay'){const e=document.getElementById('arRank');if(e)e.innerHTML=arScoreHTML();}
}
function arBeat(){
 if(!AR)return;
 for(const p of arSorted())if(!p.done&&p.uid!==yrMe()&&Date.now()-p.ts>65000&&!AR.expiring.has(p.uid)){
  AR.expiring.add(p.uid);yrService().arenaExpire(YR.code,p.uid).catch(()=>{}).finally(()=>{if(AR)AR.expiring.delete(p.uid);});
 }
 arSync();
}
function arScoreHTML(){return '<ul class="yr-rank ar-rank">'+arRanks().map(p=>'<li class="yr-row'+(p.uid===yrMe()?' me':'')+'"><span class="yr-rk">'+(p.rank||'—')+'</span><span class="yr-nm">'+esc(p.nick)+(p.uid===yrMe()?' (Sen)':'')+(p.left?' · ayrıldı':p.done?' · bitti':'')+'</span><span class="yr-sc">'+p.ok+' doğru · '+p.n+'/'+AR.total+'</span></li>').join('')+'</ul>';}
function arIntroHTML(){return '<div class="yr-full"><p>Baharatlar ve Mutfak Araçları · En çok 75 soru</p><h1>Er Meydanı</h1><div class="yr-big" id="yrHeading" tabindex="-1" role="status">'+Math.max(1,YR.count)+'</div><p>Kendi hızında ilerle. Dört yanlışta denemen biter.</p>'+rkCountdownHTML()+'</div>';}
function arPlayHTML(){
 const q=YR.qs[AR.k],s=ArenaModel.stats(AR.myR),asking=AR.ph==='q',correct=q.choices.find(c=>c.id===q.correct);
 return yrTop('Er Meydanı')+'<div class="wrap ar-play"><div class="ar-status"><strong>'+s.ok+' doğru</strong><span>Yanlış: '+s.bad+' / 4</span><span>Soru '+(AR.k+1)+' / '+AR.total+'</span></div>'+(YR.warn?'<p class="ar-network" role="status">Bağlantı bekleniyor; sonuçlar saklanıyor.</p>':'')+
 '<div class="yr-bar" aria-hidden="true"><div class="yr-fill" id="yrFill"></div></div><p class="yr-sec" id="yrSec">'+(asking?Math.ceil(AR.lim/1000)+' sn':'')+'</p>'+yrQuestionHTML(q)+yrChoicesHTML(q,'arAns',asking?null:{pick:AR.pick})+
 '<div class="ar-feedback" role="status">'+(asking?'':AR.why==='ok'?'Doğru!':(AR.why==='time'?'Süre doldu. ':'')+'Doğru yanıt: '+esc(correct.text))+'</div>'+
 (asking?'':'<button type="button" class="btn pri ar-next" onclick="arNext()">Sıradaki soru</button>')+
 '<details class="ar-score"><summary>Canlı sıralama</summary><div id="arRank">'+arScoreHTML()+'</div></details></div>';
}
function arOverHTML(){
 const s=ArenaModel.stats(AR.myR),pending=!AR.finalized;
 return yrTop('Er Meydanı sonucu')+'<div class="wrap"><h1 id="yrHeading" tabindex="-1">'+(pending?'Denemen bitti':AR.final===1?'Birinci sensin!':'Oyun tamamlandı')+'</h1><p>'+s.ok+' doğru · '+s.bad+' yanlış · '+s.n+' soru</p>'+yrWarnHTML()+
 (pending?'<p role="status">Ortak sonuçlar bekleniyor. Sıralama henüz kesinleşmedi.</p>':'<p>Kesin sıralama · Eşit doğruda toplam yanıt süresi kullanılır.</p>')+arScoreHTML()+
 (AR.rapor?sonucGoster(AR.rapor):'')+(!pending?'<button type="button" class="btn" onclick="rkOpenBoard(\'oy-arena2\')">Er Meydanı sıralaması</button>':'')+(!pending&&typeof frBtn==='function'?arRanks().filter(p=>p.uid!==yrMe()).map(p=>frBtn(p,true)).join(''):'')+'<button type="button" class="btn" onclick="yrLeave()">Çık</button></div>';
}
YR_SCREENS.push('aintro','aplay','aover');
const AR_SCR=yrScreenHTML;yrScreenHTML=function(){switch(st.screen){case 'aintro':return AR?arIntroHTML():yrMenuHTML();case 'aplay':return AR?arPlayHTML():yrMenuHTML();case 'aover':return AR?arOverHTML():yrMenuHTML();}return AR_SCR();};
