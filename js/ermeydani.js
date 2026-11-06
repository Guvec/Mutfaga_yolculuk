/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Er Meydanı 2: herkes kendi hızında; final yalnız ortak, bitmiş kayıtlardan üretilir. */
'use strict';
let AR=null;
function arErrors(){return ArenaModel.errorLimit(YR.room);}
function arStats(r){return ArenaModel.stats(r,arErrors(),YR.room);}
function arLeadersHTML(){return typeof rkInlineHTML==='function'?rkInlineHTML('oy-arena2','genel',undefined,3).replace('İlgili sıralama','Er Meydanı liderleri · kazanılan oyun')+'<button type="button" class="btn sm" onclick="go(\'rekor\')">Rekorlarım</button>':'';}
function arOn(){return !!(YR.room&&YR.room.mode==='arena');}
function arSorted(){return YR.players.filter(p=>AR&&AR.roster.includes(p.uid)).slice().sort((a,b)=>String(a.uid).localeCompare(String(b.uid)));}
function arGone(p){return !!p.left;}
function arPts(uid){const p=arRanks().find(p=>p.uid===uid);return p?p.ok:0;}
function arCacheKey(){return YR.code+'|'+YR.room.created+'|'+yrMe();}
function arCache(){const all=ls('arena_devam',{});all[arCacheKey()]={r:AR.myR.slice(),deadline:AR.deadline||0,k:AR.k};const keys=Object.keys(all);while(keys.length>20)delete all[keys.shift()];lsSet('arena_devam',all);}
function arStart(){
 if(YR.tm){clearInterval(YR.tm);YR.tm=null;}
 const p=YR.resumePlayer,cache=ls('arena_devam',{})[arCacheKey()],remote=p&&Array.isArray(p.r)?p.r:[];
 let r=remote.slice();if(cache&&!p?.done&&Array.isArray(cache.r)&&remote.every((v,i)=>cache.r[i]===v)&&arStats(cache.r).n===cache.r.length)r=cache.r.slice();
 AR={k:r.length,total:YR.qs.length,myR:r,roster:YR.room.roster.slice(),ph:'intro',over:!!p?.done,quit:!!p?.left,finalized:false,awarded:false,final:null,pick:null,t0:0,lim:ArenaModel.limit(0,YR.room),to:null,expiring:new Set()};
 for(let n=remote.length+1;n<=r.length;n++){const part=r.slice(0,n),ps=arStats(part);yrSend(arRow(part,ps.bad>=arErrors()||n>=AR.total,false));}
 if(AR.over){AR.ph='over';st.screen='aover';render();arSync();return;}
 if(arStats(r).bad>=arErrors()||r.length>=AR.total){arEnd();return;}
 if(typeof EFEKT!=='undefined')EFEKT.cal('kilic');
 rkCountLeaders(YR.room);st.screen='aintro';YR.count=3;render();
 if(YR.cd)clearInterval(YR.cd);
 YR.cd=setInterval(()=>{YR.count--;if(YR.count<=0){clearInterval(YR.cd);YR.cd=null;if(st.screen==='aintro'&&AR)arRound(AR.myR.length,cache);return;}if(st.screen==='aintro')render();},1000);
 arWrite();
}
function arRow(r,done,left){const s=arStats(r);return {nick:YR.nick,score:s.ok,ok:s.ok,bad:s.bad,n:s.n,tt:s.tt,done:!!done,left:!!left,ts:Date.now(),rid:YR.room.created,m:0,r:r.slice(),pr:[]};}
function arWrite(){
 if(!AR||!yrTransport||!YR.room)return;
 return yrSend(arRow(AR.myR,AR.over||AR.quit,AR.quit));
}
function arRound(k,resume){
 if(!AR||AR.over)return;
 if(AR.to){clearTimeout(AR.to);AR.to=null;}
 const s=arStats(AR.myR);AR.k=k;AR.ph='q';AR.pick=null;AR.why='';AR.lim=ArenaModel.limit(s.ok,YR.room);
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
 if(YR.tm){clearInterval(YR.tm);YR.tm=null;}AR.ph='fb';AR.why=why;AR.hizli=hizliTebrik(AR,v>0,Math.abs(v));AR.myR.push(v);arCache();
 if(typeof EFEKT!=='undefined')EFEKT.cal(v>0?'dogru':'yanlis');
 const s=arStats(AR.myR);if(s.bad>=arErrors()||s.n>=AR.total){arEnd();return;}
 arWrite();render();const a=AR;a.to=setTimeout(()=>{if(AR===a&&a.ph==='fb'&&!a.over)arNext();},v>0?(a.hizli?2200:350):1400);
}
function arNext(){if(!AR||AR.over||AR.ph!=='fb')return;arRound(AR.myR.length);}
function arRanks(){return ArenaModel.ranks(arSorted(),arErrors(),YR.room);}
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
  AR.finalized=true;arReviewSave();const rows=arRanks(),me=rows.find(p=>p.uid===yrMe());AR.final=me?.rank||null;
  if(!AR.awarded&&me&&!me.left){AR.awarded=true;const top=AR.final===1,key=arCacheKey(),awards=ls('arena_odul',{});
   if(awards[key])AR.rapor={...awards[key].rapor,zaman:new Date(awards[key].rapor.zaman)};
   else{
    AR.rapor=sonucUret('Er Meydanı',yrLabel(YR.room),(yrArenaSelected(YR.room)?'arena3|'+YR.room.scope+'|'+YR.room.subject+'|'+YR.room.n+'|'+YR.room.rev:'arena2|ma-bh|75'),me.r.map(v=>({ok:v>0,ms:Math.abs(v)})),top?'Sıralamada 1. oldun.':'');
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
function arIntroHTML(){return '<div class="yr-full"><p>'+esc(yrLabel(YR.room))+' · '+YR.qs.length+' soru</p><h1>Er Meydanı</h1><div class="yr-big" id="yrHeading" tabindex="-1" role="status">'+Math.max(1,YR.count)+'</div><p>Kendi hızında ilerle. '+arErrors()+' yanlışta denemen biter.</p>'+arLeadersHTML()+'</div>';}
function arPlayHTML(){
 const q=YR.qs[AR.k],s=arStats(AR.myR),asking=AR.ph==='q',correct=q.choices.find(c=>c.id===q.correct);
 return yrTop('Er Meydanı')+'<div class="wrap ar-play"><div class="ar-status"><strong>'+s.ok+' doğru</strong><span>Yanlış: '+s.bad+' / '+arErrors()+'</span><span>Soru '+(AR.k+1)+' / '+AR.total+'</span></div>'+(YR.warn?'<p class="ar-network" role="status">Bağlantı bekleniyor; sonuçlar saklanıyor.</p>':'')+
 '<div class="yr-bar" aria-hidden="true"><div class="yr-fill" id="yrFill"></div></div><p class="yr-sec" id="yrSec">'+(asking?Math.ceil(AR.lim/1000)+' sn':'')+'</p>'+yrQuestionHTML(q)+yrChoicesHTML(q,'arAns',asking?null:{pick:AR.pick})+
 '<div class="ar-feedback" role="status">'+(asking?'':AR.why==='ok'?(AR.hizli?'Çok hızlısın, minik şef! ⚡':'Doğru!'):(AR.why==='time'?'Süre doldu. ':'')+'Doğru yanıt: '+esc(correct.text))+'</div>'+
 (asking?'':'<button type="button" class="btn pri ar-next" onclick="arNext()">Sıradaki soru</button>')+
 '<details class="ar-score"><summary>Canlı sıralama</summary><div id="arRank">'+arScoreHTML()+'</div></details></div>';
}
function arOverHTML(){
 const s=arStats(AR.myR),pending=!AR.finalized,first=pending?[]:arRanks().filter(p=>p.rank===1&&!p.left),winners=first.map(p=>p.nick).join(', ');
 return yrTop('Er Meydanı sonucu')+'<div class="wrap ar-over"><h1 id="yrHeading" tabindex="-1">'+(pending?'Denemen bitti':AR.final===1?'Birinci sensin!':'Oyun tamamlandı')+'</h1>'+yrWarnHTML()+
 (!pending&&first.length?'<section class="ar-winner" role="status"><span class="ar-winner-crown" role="img" aria-label="Kral tacı">👑</span><strong>'+esc(winners)+'</strong><span>'+(first.length>1?'Bu oyunun ortak birincileri':'Bu oyunun birincisi')+'</span></section>':'')+
 '<section class="card ar-final-ranks"><h2>'+(pending?'Geçici maç sıralaması':'Bu oyunun kesin sıralaması')+'</h2>'+(pending?'<p role="status">Diğer katılımcıların sunucu onaylı sonuçları bekleniyor.</p>':'<p>Eşit doğruda toplam yanıt süresi kullanılır.</p>')+arScoreHTML()+'</section>'+
 (!pending&&typeof rkInlineHTML==='function'?rkInlineHTML('oy-arena2','genel',undefined,3).replace('İlgili sıralama','Genel Er Meydanı sıralaması · kazanılan oyun'):'')+
 '<p>'+s.ok+' doğru · '+s.bad+' yanlış · '+s.n+' soru</p>'+(!pending&&AR.reviewCount?'<button type="button" class="btn pri" onclick="arReviewOpen()">Pekiştiriyorum ('+AR.reviewCount+' soru)</button>':'')+(AR.rapor?sonucGoster(AR.rapor):'')+
 (!pending?'<button type="button" class="btn" onclick="rkOpenBoard(\'oy-arena2\')">Er Meydanı listesinin tamamı</button>':'')+
 (!pending&&typeof frBtn==='function'?arRanks().filter(p=>p.uid!==yrMe()).map(p=>frBtn(p,true)).join(''):'')+'<button type="button" class="btn" onclick="yrLeave()">Çık</button></div>';
}
YR_SCREENS.push('aintro','aplay','aover');
const AR_SCR=yrScreenHTML;yrScreenHTML=function(){switch(st.screen){case 'aintro':return AR?arIntroHTML():yrMenuHTML();case 'aplay':return AR?arPlayHTML():yrMenuHTML();case 'aover':return AR?arOverHTML():yrMenuHTML();}return AR_SCR();};

/* Sunucu onaylı maçın yalnız yanıtlanmış yanlışları; bitmeyen sorular eklenmez. */
let AR_REVIEW=null;
function arReviewData(){if(st.guest||!st.prof)return null;const pid=rkPid(st.prof,true);return {pid,all:ls('arena_pek',{})};}
function arReviewSave(){
 if(!AR||!AR.finalized)return;const data=arReviewData();if(!data)return;
 const key=arCacheKey(),old=data.all[data.pid]||{};if(old.games&&old.games.includes(key)){AR.reviewCount=(old.items||[]).filter(q=>q.game===key).length;return;}
 const items=AR.myR.flatMap((v,i)=>v<0&&YR.qs[i]?[{...JSON.parse(JSON.stringify(YR.qs[i])),game:key}]:[]);
 const unique=new Map((old.items||[]).map(q=>[q.id,q]));items.forEach(q=>unique.set(q.id,q));
 data.all[data.pid]={games:[...(old.games||[]),key].slice(-20),items:[...unique.values()].slice(-150)};lsSet('arena_pek',data.all);AR.reviewCount=items.length;
}
function arReviewOpen(subject){
 const data=arReviewData(),entry=data&&data.all[data.pid],items=(entry&&entry.items||[]).filter(q=>!subject||q.subject===subject);
 if(!items.length)return;AR_REVIEW={pid:data.pid,items:JSON.parse(JSON.stringify(items)),k:0,pick:null,study:true,from:st.screen,subject:subject||null};go('arenapek');window.scrollTo(0,0);
}
function arReviewAnswer(i){if(!AR_REVIEW||AR_REVIEW.study||AR_REVIEW.pick!==null)return;const r=AR_REVIEW,q=r.items[r.k];if(!q||!q.choices[i])return;r.pick=i;
 if(q.choices[i].id===q.correct){const d=arReviewData();if(d&&d.pid===r.pid&&d.all[d.pid]){d.all[d.pid].items=d.all[d.pid].items.filter(x=>x.id!==q.id);lsSet('arena_pek',d.all);}}render();
}
function arReviewNext(){if(!AR_REVIEW)return;if(AR_REVIEW.study){AR_REVIEW.study=false;}else{if(AR_REVIEW.pick===null)return;AR_REVIEW.k++;AR_REVIEW.pick=null;AR_REVIEW.study=true;}render();window.scrollTo(0,0);}
function arReviewExit(){const from=AR_REVIEW&&AR_REVIEW.from;AR_REVIEW=null;go(from==='aover'&&AR?'aover':'pekmenu');}
function arReviewHTML(){
 const r=AR_REVIEW;if(!r||r.pid!==rkPid(st.prof))return topBar('Pekiştiriyorum')+'<div class="wrap"><p>Bu profile ait tekrar bulunamadı.</p></div>';
 if(r.k>=r.items.length)return topBar('Pekiştiriyorum')+'<div class="wrap"><h1>Tekrar tamamlandı</h1><p>Yeniden yanlış yapılanlar daha sonra çalışmak için listende kalır. Bu çalışma puan veya sıralama sonucu üretmez.</p><button class="btn pri" onclick="arReviewExit()">Geri dön</button></div>';
 const q=r.items[r.k],answer=q.choices.find(c=>c.id===q.correct),answered=r.pick!==null;
 return topBar('Pekiştiriyorum')+'<div class="wrap ar-play"><h1>Er Meydanı tekrarım</h1><p>'+ (r.k+1)+' / '+r.items.length+' · Süresiz ve sıralamasız</p>'+yrQuestionHTML(q)+(r.study?'<section class="card"><h2>Doğru cevap</h2>'+(answer.image?'<img class="yr-img" src="'+esc(answer.image)+'" alt="'+esc(answer.alt||'Doğru seçeneğin görseli')+'">':'')+'<p>'+esc(answer.text||answer.alt||answer.id)+'</p><p>'+esc(q.explanation||'')+'</p>'+(typeof sesDugme==='function'?sesDugme('Doğru cevap: '+(answer.text||answer.alt||answer.id)+'. '+(q.explanation||''),'Doğru cevabı dinle'):'')+'</section><button class="btn pri" onclick="arReviewNext()">Şimdi dene</button>':yrChoicesHTML(q,'arReviewAnswer',answered?{pick:r.pick}:null)+(answered?'<p role="status">'+(q.choices[r.pick].id===q.correct?'Doğru.':'Doğru cevap: '+esc(answer.text||answer.alt||answer.id))+'</p><button class="btn pri" onclick="arReviewNext()">Sonraki soru</button>':''))+'</div>';
}
const AR_REVIEW_SCR=yrScreenHTML;yrScreenHTML=function(){return st.screen==='arenapek'?arReviewHTML():AR_REVIEW_SCR();};YR_SCREENS.push('arenapek');
const AR_REVIEW_BACK=back;back=function(){if(st.screen==='arenapek'){arReviewExit();return;}AR_REVIEW_BACK();};
