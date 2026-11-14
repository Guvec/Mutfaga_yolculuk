/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Er Meydanı 2: herkes kendi hızında; final yalnız ortak, bitmiş kayıtlardan üretilir. */
'use strict';
let AR=null;
function arErrors(){return ArenaModel.errorLimit(YR.room);}
function arJ(){return AR&&AR.j||{kl:-1,sn:-1,tad:-1};}
function arStats(r){const j=arJ();return ArenaModel.stats(r,arErrors(),YR.room,{kl:j.kl,sn:j.sn,uid:yrMe()});}
/* Şans kutusu: bu soru için kutudan ne çıktı (altin / tadim / yok). */
function arKutu(k){if(!arM5())return null;const x=arStats(AR.myR.slice(0,k)).kutu.find(b=>b.at===k);return x?x.tur:null;}
function arM5(){return !!(YR.room&&ArenaModel.modern5(YR.room));}
function arGold(k){return arM5()&&(ArenaModel.goldIdx(YR.room).includes(k)||(AR&&arKutu(k)==='altin'));}
/* Tüm zamanların en iyi 3 oyunu (tek oyunda en yüksek puan; eşit puanda kısa süre önde). */
function arRekor3HTML(){if(typeof rkInlineHTML!=='function'||typeof rkBoard!=='function'||!rkBoard('ar-puan'))return '';return rkInlineHTML('ar-puan','genel',undefined,3).replace('İlgili sıralama · ilk 10','🏆 Tüm zamanların en iyi 3 oyunu').replace('class="card rk-inline"','class="card rk-inline ar-rekor3"');}
function arSure(ms){return typeof rkSaliseYaz==='function'?rkSaliseYaz((Number(ms)||0)/10):'';}
/* Biten oyunun puanı ve salise süresi 'ar-puan' tablosuna yazılır (genel ve haftalık); sunucu yalnız daha iyisini saklar. */
function arPuanYaz(s){
 if(AR.puanYazildi||AR.quit||st.guest||!st.prof||typeof rkQueue!=='function')return;AR.puanYazildi=true;
 try{const pid=rkPid(st.prof,true),p=rkProf(pid);if(p.status!=='in'||!(s.score>0))return;const q=rkQueue(),name=rkName(st.prof),dur=Math.max(1,Math.round((s.tt||0)/10));
  ['genel','hafta'].forEach(period=>q.push({qid:rkRandomId(),pid,board:'ar-puan',period,name,correct:s.score,gen:p.gen,at:Date.now(),sess:null,meta:{dur}}));
  lsSet('rk_queue',q);Promise.resolve(rkFlush(0)).then(()=>{if(typeof RK_INLINE!=='undefined')RK_INLINE.delete(rkInlineKey('ar-puan','genel'));}).catch(()=>{});}catch(e){}
}
function arLeadersHTML(){return arRekor3HTML()+'<button type="button" class="btn sm" onclick="rkOpenBoard(\'oy-arena2\')">Sıralama</button>';}
function arOn(){return !!(YR.room&&YR.room.mode==='arena');}
function arSorted(){return YR.players.filter(p=>AR&&AR.roster.includes(p.uid)).slice().sort((a,b)=>String(a.uid).localeCompare(String(b.uid)));}
function arGone(p){return !!p.left;}
function arPts(uid){const p=arRanks().find(p=>p.uid===uid);return p?p.ok:0;}
function arCacheKey(){return YR.code+'|'+YR.room.created+'|'+yrMe();}
function arCache(){const all=ls('arena_devam',{});all[arCacheKey()]={r:AR.myR.slice(),j:AR.j,deadline:AR.deadline||0,k:AR.k,reviewResponses:AR.reviewResponses};const keys=Object.keys(all);while(keys.length>20)delete all[keys.shift()];lsSet('arena_devam',all);}
function arStart(){
 if(YR.tm){clearInterval(YR.tm);YR.tm=null;}
 const p=YR.resumePlayer,cache=ls('arena_devam',{})[arCacheKey()],remote=p&&Array.isArray(p.r)?p.r:[];
 let r=remote.slice();if(cache&&!p?.done&&Array.isArray(cache.r)&&remote.every((v,i)=>cache.r[i]===v)&&arStats(cache.r).n===cache.r.length)r=cache.r.slice();
 const j0=(cache&&cache.j)||{kl:Number.isInteger(p?.kl)?p.kl:-1,sn:Number.isInteger(p?.sn)?p.sn:-1,tad:-1};
 AR={j:{kl:j0.kl??-1,sn:j0.sn??-1,tad:j0.tad??-1},k:r.length,total:YR.qs.length,myR:r,roster:YR.room.roster.slice(),ph:'intro',over:!!p?.done,quit:!!p?.left,finalized:false,awarded:false,final:null,pick:null,t0:0,lim:ArenaModel.limit(0,YR.room),to:null,expiring:new Set()};
 if(cache?.reviewResponses)AR.reviewResponses=cache.reviewResponses.slice(0,r.length);
 for(let n=remote.length+1;n<=r.length;n++){const part=r.slice(0,n),ps=arStats(part);yrSend(arRow(part,ps.bad>=arErrors()||n>=AR.total,false));}
 if(AR.over){AR.ph='over';st.screen='aover';render();arSync();return;}
 if(arStats(r).bad>=arErrors()||r.length>=AR.total){arEnd();return;}
 if(typeof EFEKT!=='undefined')EFEKT.cal('bilen');
 rkCountLeaders(YR.room);st.screen='aintro';YR.count=3;render();
 if(YR.cd)clearInterval(YR.cd);
 YR.cd=setInterval(()=>{YR.count--;if(YR.count<=0){clearInterval(YR.cd);YR.cd=null;if(st.screen==='aintro'&&AR)arRound(AR.myR.length,cache);return;}if(st.screen==='aintro')render();},1000);
 arWrite();
}
function arRow(r,done,left){const s=arStats(r),j=arJ(),x={};if(j.kl>=0&&j.kl<s.n)x.kl=j.kl;if(j.sn>=0&&j.sn<s.n)x.sn=j.sn;return {...x,nick:YR.nick,score:s.score,ok:s.ok,bad:s.bad,n:s.n,tt:s.tt,done:!!done,left:!!left,ts:Date.now(),rid:YR.room.created,m:0,r:r.slice(),pr:[]};}
function arWrite(){
 if(!AR||!yrTransport||!YR.room)return;
 return yrSend(arRow(AR.myR,AR.over||AR.quit,AR.quit));
}
function arRound(k,resume){
 if(!AR||AR.over)return;
 if(AR.to){clearTimeout(AR.to);AR.to=null;}
 const s=arStats(AR.myR);AR.k=k;AR.ph='q';AR.pick=null;AR.why='';AR.lim=ArenaModel.limit(s.ok,YR.room)+(arJ().sn===k?10000:0);
 const remaining=resume&&resume.k===k?Math.min(AR.lim,Math.max(0,resume.deadline-Date.now())):AR.lim;
 AR.t0=performance.now()-(AR.lim-remaining);AR.deadline=Date.now()+remaining;arCache();st.screen='aplay';render();
 if(YR.tm)clearInterval(YR.tm);YR.tm=setInterval(arTick,80);arTick();
}
function arTick(){
 if(!AR||AR.ph!=='q'||st.screen!=='aplay')return;
 const elapsed=performance.now()-AR.t0,left=Math.max(0,AR.lim-elapsed),f=document.getElementById('yrFill'),t=document.getElementById('yrSec');
 if(f){f.style.width=(left/AR.lim*100)+'%';f.className='yr-fill'+(left<AR.lim*.25?' low':'');}if(t)t.textContent=Math.ceil(left/1000)+' sn';efektSaniye(left);
 if(elapsed>=AR.lim)arMine(-AR.lim,'time');
}
function arAns(i){
 if(!AR||AR.over||AR.ph!=='q')return;const q=YR.qs[AR.k];if(!q||!q.choices[i])return;
 const elapsed=performance.now()-AR.t0;if(elapsed>=AR.lim){arMine(-AR.lim,'time');return;}
 if(arTadGizli(q).includes(i))return;AR.pick=i;const ok=q.choices[i].id===q.correct,ms=Math.max(1,Math.round(elapsed));arMine(ok?ms:-ms,ok?'ok':'bad');
}
function arMine(v,why){
 if(!AR||AR.over||AR.ph!=='q')return;
 (AR.reviewResponses=AR.reviewResponses||[])[AR.k]={ok:v>0,pick:why==='bad'?AR.pick:null,reason:why==='time'?'Süre doldu':''};
 if(YR.tm){clearInterval(YR.tm);YR.tm=null;}AR.ph='fb';AR.why=why;AR.hizli=hizliTebrik(AR,v>0,Math.abs(v));AR.myR.push(v);arCache();
 if(typeof EFEKT!=='undefined')EFEKT.cal(why==='time'?'tirr':v>0?'dogru':'yanlis');
 const s=arStats(AR.myR);if(s.bad>=arErrors()||s.n>=AR.total){arEnd();return;}
 const kutu=v>0&&s.kutu.length&&s.kutu[s.kutu.length-1].at===AR.myR.length;AR.kutuAcik=kutu?s.kutu[s.kutu.length-1].tur:null;if(kutu){if(typeof EFEKT!=='undefined')EFEKT.cal('win');setTimeout(()=>arSesli(AR&&AR.kutuAcik==='altin'?'Şans kutusu açıldı! Sonraki soru altın soru.':'Şans kutusu açıldı! Sonraki soruda iki yanlış seçenek gizlenecek.'),300);}
 arWrite();render();const a=AR;a.to=setTimeout(()=>{if(AR===a&&a.ph==='fb'&&!a.over)arNext();},v>0?(a.kutuAcik?2600:a.hizli?2200:350):1400);arRakip();
}
function arNext(){if(!AR||AR.over||AR.ph!=='fb')return;arRound(AR.myR.length);}
/* Oyun sürerken kendi satırın telefondaki son yanıtlarla hesaplanır (sunucu kaydı birkaç saniye geriden gelebilir). */
function arRanks(){const me=yrMe(),ps=arSorted().map(p=>p.uid===me&&AR&&!AR.over&&AR.myR.length>=(p.r||[]).length?{...p,r:AR.myR.slice(),kl:AR.j.kl>=0?AR.j.kl:p.kl,sn:AR.j.sn>=0?AR.j.sn:p.sn}:p);return ArenaModel.ranks(ps,arErrors(),YR.room);}
/* Jokerler (v3.13): her maçta herkese aynı set, her biri bir kez. Tadımlık iki yanlışı gizler; Kalkan o sorudaki yanlışı saymaz; +10 sn süreyi uzatır. */
function arTadGizli(q){if(arJ().tad!==AR.k&&arKutu(AR.k)!=='tadim')return [];const w=q.choices.map((c,i)=>({i,id:c.id})).filter(x=>x.id!==q.correct);let h=(Number(YR.room.seed)>>>0)+AR.k*7919;w.sort((a,b)=>((h^a.i*2654435761)>>>0)%97-((h^b.i*2654435761)>>>0)%97);return w.slice(0,2).map(x=>x.i);}
function arJoker(t){
 if(!AR||AR.over||AR.ph!=='q'||!arM5())return;const j=AR.j;
 if(t==='tad'&&j.tad<0){j.tad=AR.k;}
 else if(t==='kl'&&j.kl<0){j.kl=AR.k;}
 else if(t==='sn'&&j.sn<0){j.sn=AR.k;AR.lim+=10000;AR.deadline+=10000;}
 else return;
 if(typeof EFEKT!=='undefined')EFEKT.cal('tak');arCache();render();
}
function arJokerHTML(){
 if(!arM5()||AR.ph!=='q')return '';const j=arJ(),b=(t,ic,ad,used)=>'<button type="button" class="ar-joker'+(used?' kullanildi':'')+'" onclick="arJoker(\''+t+'\')"'+(used?' disabled':'')+' aria-label="'+ad+(used?' (kullanıldı)':'')+'"><span aria-hidden="true">'+ic+'</span>'+ad+'</button>';
 return '<div class="ar-jokerler" role="group" aria-label="Jokerler">'+b('tad','½','Tadımlık',j.tad>=0)+b('kl','🛡️','Kalkan',j.kl>=0&&j.kl!==AR.k)+b('sn','⏱️','+10 sn',j.sn>=0)+'</div>'+(j.kl===AR.k?'<p class="ar-kalkan-acik" role="status">🛡️ Kalkan açık: bu soruda yanlış yaparsan sayılmaz.</p>':'');
}
/* Rekor: bu cihazdaki profilin en yüksek puanı ve soru sayısı. Hedefler 25 · 50 · 100 · 150 soru. */
const AR_HEDEF=[25,50,100,150];
function arRekorAl(){if(st.guest||!st.prof)return null;return ls('arena_rekor',{})[rkPid(st.prof,true)]||{score:0,n:0};}
function arRekorYaz(s){if(st.guest||!st.prof||AR.rekorYazildi)return;AR.rekorYazildi=true;const pid=rkPid(st.prof,true),all=ls('arena_rekor',{}),o=all[pid]||{score:0,n:0};AR.oncekiRekor=o;all[pid]={score:Math.max(o.score,s.score),n:Math.max(o.n,s.n)};lsSet('arena_rekor',all);}
function arRekorHTML(s){
 const o=AR.oncekiRekor||arRekorAl();if(!o)return '';const yeni=s.score>o.score,best=Math.max(o.n,s.n),h=AR_HEDEF.find(x=>x>best);
 return '<section class="card ar-rekor">'+(yeni&&o.score>0?'<p class="ar-yeni-rekor">🎉 Yeni rekor!</p>':'')+'<p>Bu oyun: <b>'+s.score+' puan</b> · '+s.n+' soru</p><p>Rekorun: <b>'+Math.max(o.score,s.score)+' puan</b> · '+best+' soru</p>'+(h?'<p>Sıradaki hedef: <b>'+h+' soru</b></p>':'<p>Bütün hedefleri geçtin. Meydan Şampiyonusun!</p>')+'</section>';
}
/* Maç sonu ünvanları: yalnız hak eden alır, en çok 3. */
function arUnvanlar(rows){
 const a=rows.filter(p=>!p.left&&p.n>0),out=[];if(!a.length)return out;
 const hatasiz=a.filter(p=>p.bad===0&&p.n>=10);if(hatasiz.length)out.push(['🍽️','Hatasız Tabak',hatasiz]);
 const hiz=a.filter(p=>p.ok>=10).sort((x,y)=>x.tt/x.n-y.tt/y.n)[0];if(hiz)out.push(['⚡','Hızlı El',[hiz]]);
 const alt=a.filter(p=>p.gold>0).sort((x,y)=>y.gold-x.gold);if(alt.length)out.push(['⭐','Altın Soru Avcısı',[alt[0]]]);
 const seri=a.filter(p=>p.best>=10).sort((x,y)=>y.best-x.best)[0];if(seri&&out.length<3)out.push(['🔥','Seri Ustası',[seri]]);
 return out.slice(0,3);
}
function arUnvanHTML(){
 const u=arUnvanlar(arRanks());if(!u.length)return '';
 return '<section class="card ar-unvan"><h2>Günün ünvanları</h2>'+u.map(([ic,ad,ps])=>'<p><span aria-hidden="true">'+ic+'</span> <b>'+ad+'</b>: '+ps.map(p=>esc(p.nick)+(p.uid===yrMe()?' (Sen)':'')).join(', ')+'</p>').join('')+'</section>';
}

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
  arCache();if(st.screen!=='yanlislarim')st.screen='aover';
 }
 if(ArenaModel.complete(AR.roster,arSorted())&&AR.over){
  AR.finalized=true;if(typeof yanlisKaydet!=='function')arReviewSave();const rows=arRanks(),me=rows.find(p=>p.uid===yrMe());AR.final=me?.rank||null;
  if(!AR.awarded&&me&&!me.left){AR.awarded=true;const top=AR.final===1,key=arCacheKey(),awards=ls('arena_odul',{});
   if(awards[key])AR.rapor={...awards[key].rapor,zaman:new Date(awards[key].rapor.zaman)};
   else{
    AR.rapor=sonucUret('Er Meydanı',yrLabel(YR.room),(yrArenaSelected(YR.room)?'arena3|'+YR.room.scope+'|'+YR.room.subject+'|'+YR.room.n+'|'+YR.room.rev:'arena2|ma-bh|75'),me.r.map(v=>({ok:v>0,ms:Math.abs(v)})),top?'Sıralamada 1. oldun.':'');
    awards[key]={rapor:AR.rapor,at:Date.now()};
    if(lsSet('arena_odul',awards)){
     rutbeMatch('arena',AR);
     if(top&&me.ok>0&&typeof rkWinAdd==='function')rkWinAdd('oy-arena2',1);
    }
    if(typeof EFEKT!=='undefined')EFEKT.cal(top?'win':'tur');
    if(typeof sesSoyle==='function')sesSoyle(top?'Er Meydanı’nda birinci oldun! Tebrikler.':AR.final?'Oyun bitti. Sıralamada '+AR.final+'. oldun. İyi mücadele!':'Oyun bitti. İyi mücadele!');
   }
  }
 }
 if(st.screen==='aover')render();else if(st.screen==='aplay'){const e=document.getElementById('arRank');if(e)e.innerHTML=arScoreHTML();const sr=document.querySelector('.ar-sira');if(sr)sr.outerHTML=arSiraHTML()||'<span></span>';arRakip();}
}
function arBeat(){
 if(!AR)return;
 for(const p of arSorted())if(!p.done&&p.uid!==yrMe()&&yrNow()-p.ts>65000&&!AR.expiring.has(p.uid)){
  AR.expiring.add(p.uid);yrService().arenaExpire(YR.code,p.uid).catch(()=>{}).finally(()=>{if(AR)AR.expiring.delete(p.uid);});
 }
 arSync();
}
function arScoreHTML(){const rows=arRanks(),m5=arM5(),fin=m5&&rows.filter(p=>!p.left).length>3;return '<ul class="yr-rank ar-rank">'+rows.map((p,i)=>(fin&&i===3?'<li class="ar-final-cizgi" aria-hidden="true"><span>Podyum çizgisi</span></li>':'')+'<li class="yr-row'+(p.uid===yrMe()?' me':'')+'"><span class="yr-rk">'+(p.rank||'—')+'</span><span class="yr-nm">'+(m5&&p.rank===1?'<span class="ar-tac" role="img" aria-label="Taç">👑</span> ':'')+esc(p.nick)+(p.uid===yrMe()?' (Sen)':'')+(p.left?' · ayrıldı':p.done?' · bitti':'')+'</span><span class="yr-sc">'+(m5?p.score+' puan · ':p.ok+' doğru · ')+p.n+'/'+AR.total+(p.n?' · '+arSure(p.tt):'')+'</span></li>').join('')+'</ul>';}
function arSiraHTML(){if(!arM5())return '';const rows=arRanks().filter(p=>!p.left),me=rows.find(p=>p.uid===yrMe());if(!me||rows.length<2)return '';
 const i=rows.indexOf(me),ust=i>0?rows[i-1]:null,alt=rows[i+1]||null;let hedef='';
 if(ust){const fark=Math.max(1,ust.score-me.score+(ust.tt<=me.tt?1:0));hedef='<span class="ar-hedef">🎯 Hedef: <b>'+esc(ust.nick)+'</b> · '+(fark<=1?'bir doğruyla geçersin!':fark+' puan önde')+'</span>';}
 else if(alt){hedef='<span class="ar-hedef">👑 Taç sende! En yakın rakibin <b>'+esc(alt.nick)+'</b>, '+(me.score-alt.score)+' puan geride.</span>';}
 return '<p class="ar-sira" role="status">Sıran: <b>'+me.rank+' / '+rows.length+'</b>'+(me.rank===4&&rows.length>3?' · Podyuma 1 adım kaldı!':'')+hedef+'</p>';}
/* Canlı bildirim: biri seni geçince ya da sen birini geçince kısa bir uyarı çıkar. */
/* Uyarılar sesli de okunur (ses açıksa). Emoji okunmaz. */
function arSesli(m){if(typeof sesSoyle==='function')sesSoyle(String(m).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{FE0F}½]/gu,'').trim());}
/* Uyarılar üst üste binmez: sıraya girer, tek tek gösterilir ve okunur (en çok 3 bekler, aynısı tekrar eklenmez). */
const AR_BQ=[];let AR_BQ_ON=false;
function arBildir(m,tur){if(AR_BQ.some(x=>x[0]===m))return;if(AR_BQ.length>=3)AR_BQ.shift();AR_BQ.push([m,tur]);if(!AR_BQ_ON)arBildirSira();}
function arBildirSira(){const x=AR_BQ.shift();if(!x){AR_BQ_ON=false;return;}AR_BQ_ON=true;const [m,tur]=x;arSesli(m);const e=document.createElement('div');e.className='ar-bildirim '+(tur||'');e.setAttribute('role','status');e.textContent=m;document.body.appendChild(e);setTimeout(()=>e.classList.add('git'),2300);setTimeout(()=>{e.remove();arBildirSira();},2900);}
function arRakip(){
 if(!AR||!arM5()||AR.over)return;const rows=arRanks().filter(p=>!p.left),i=rows.findIndex(p=>p.uid===yrMe());if(i<0)return;
 const ust=new Set(rows.slice(0,i).map(p=>p.uid)),onceki=AR.ustSet;AR.ustSet=ust;if(!onceki)return;
 const gecen=rows.filter(p=>ust.has(p.uid)&&!onceki.has(p.uid)),gecilen=rows.filter(p=>onceki.has(p.uid)&&!ust.has(p.uid));
 if(gecen.length){arBildir('⚡ '+gecen[0].nick+' seni geçti!','geri');if(typeof EFEKT!=='undefined')EFEKT.cal('tak');}
 else if(gecilen.length){arBildir(i===0?'👑 '+gecilen[0].nick+' geride kaldı. Taç sende!':'🚀 '+gecilen[0].nick+' geride kaldı!','ileri');}
}
function arIntroHTML(){return '<div class="yr-full"><p>'+esc(yrLabel(YR.room))+' · '+YR.qs.length+' soru</p><h1>Er Meydanı</h1><div class="yr-big" id="yrHeading" tabindex="-1" role="status">'+Math.max(1,YR.count)+'</div><p>Kendi hızında ilerle. '+arErrors()+' yanlışta denemen biter.</p>'+arLeadersHTML()+'</div>';}
function arPlayHTML(){
 const q=YR.qs[AR.k],s=arStats(AR.myR),asking=AR.ph==='q',correct=q.choices.find(c=>c.id===q.correct);
 const gold=arGold(AR.k),gizli=asking?arTadGizli(q):[];let ch=yrChoicesHTML(q,'arAns',asking?null:{pick:AR.pick});if(gizli.length){let n=-1;ch=ch.replace(/<button type="button" class="yr-opt/g,m=>{n++;return gizli.includes(n)?'<button type="button" disabled aria-hidden="true" class="yr-opt ar-gizli':m;});}
 const kazanc=asking?0:s.score-arStats(AR.myR.slice(0,-1)).score,fbTxt=AR.why==='ok'?(kazanc>1?(gold?'⭐ Altın soru! ':'🔥 Seri ateşi! ')+'+'+kazanc+' puan':AR.hizli?'Çok hızlısın, minik şef! ⚡':'Doğru!'):(AR.why==='time'?'Süre doldu. ':'')+(arJ().kl===AR.k&&AR.myR[AR.k]<0?'🛡️ Kalkan bu yanlışı saymadı. ':'')+'Doğru yanıt: '+esc(correct.text||correct.ad||correct.id);
 return yrTop('Er Meydanı')+'<div class="wrap ar-play'+(gold&&asking?' ar-altin':'')+'"><div class="ar-status"><strong>'+(arM5()?s.score+' puan':s.ok+' doğru')+'</strong><span>Yanlış: '+s.bad+' / '+arErrors()+'</span><span>Soru '+(AR.k+1)+' / '+AR.total+'</span></div>'+(YR.warn?'<p class="ar-network" role="status">Bağlantı bekleniyor; sonuçlar saklanıyor.</p>':'')+
 arSiraHTML()+(arM5()&&s.run>=5?'<p class="ar-seri" role="status">🔥 '+s.run+' doğru üst üste'+(s.boost>0?' · sonraki '+s.boost+' doğru +1 puan':'')+'</p>':'')+(gold&&asking?'<p class="ar-altin-bant" role="status">⭐ ALTIN SORU · doğru bilirsen +3 puan</p>':'')+
 '<div class="yr-bar" aria-hidden="true"><div class="yr-fill" id="yrFill"></div></div><p class="yr-sec" id="yrSec">'+(asking?Math.ceil(AR.lim/1000)+' sn':'')+'</p>'+yrQuestionHTML(q)+ch+(asking?arJokerHTML():'')+
 '<div class="ar-feedback" role="status">'+(asking?'':fbTxt)+'</div>'+(!asking&&AR.kutuAcik?'<div class="ar-kutu" role="status"><span class="ar-kutu-ic" aria-hidden="true">🎁</span><b>Şans kutusu açıldı!</b><span>'+(AR.kutuAcik==='altin'?'⭐ Sonraki soru altın soru!':'½ Sonraki soruda iki yanlış seçenek gizlenecek!')+'</span></div>':'')+(asking&&arKutu(AR.k)==='tadim'?'<p class="ar-kalkan-acik" role="status">🎁 Şans kutusundan: iki yanlış seçenek gizlendi.</p>':'')+
 (asking?'':'<button type="button" class="btn pri ar-next" onclick="arNext()">Sıradaki soru</button>')+
 '<details class="ar-score"><summary>Canlı sıralama</summary><div id="arRank">'+arScoreHTML()+'</div></details></div>';
}
/* Dönüm noktası: aynı soru sayısında puanlar karşılaştırılır; birincinin öne geçip bir daha bırakmadığı soru bulunur. */
function arDonum(first){
 try{if(!first||!arM5())return '';const ps=arRanks().filter(p=>!p.left),er=arErrors();if(ps.length<2)return '';
  const kim=first.uid,max=Math.max(...ps.map(p=>(p.r||[]).length));let son=0;
  for(let k=1;k<=max;k++){let ust=null,ustP=-1;ps.forEach(p=>{const r=(p.r||[]).slice(0,k);const sc=ArenaModel.stats(r,er,YR.room,{kl:p.kl,sn:p.sn,uid:p.uid}).score;if(sc>ustP||(sc===ustP&&p.uid===kim)){ustP=sc;ust=p.uid;}});if(ust!==kim)son=k;}
  const ad=esc(first.nick);
  return '<p class="ar-donum">🔄 <b>Dönüm noktası:</b> '+(son===0?ad+' ilk sorudan sonuna kadar önde kaldı.':ad+' '+(son+1)+'. soruda öne geçti ve birinciliği bir daha bırakmadı.')+'</p>';
 }catch(e){return '';}
}
function arOverHTML(){
 const s=arStats(AR.myR),pending=!AR.finalized,first=pending?[]:arRanks().filter(p=>p.rank===1&&!p.left),winners=first.map(p=>p.nick).join(', ');
 return yrTop('Er Meydanı sonucu')+'<div class="wrap ar-over"><h1 id="yrHeading" tabindex="-1">'+(pending?'Denemen bitti':AR.final===1?'Birinci sensin!':'Oyun tamamlandı')+'</h1>'+yrWarnHTML()+
 (!pending&&first.length?'<section class="ar-winner" role="status"><span class="ar-winner-crown" role="img" aria-label="Kral tacı">👑</span><strong>'+esc(winners)+'</strong><span>'+(first.length>1?'Bu oyunun ortak birincileri':'Bu oyunun birincisi')+'</span><span class="ar-winner-sure">'+(arM5()?first[0].score+' puan · ':'')+first[0].ok+' doğru · '+arSure(first[0].tt)+'</span></section>'+(first.length===1?arDonum(first[0]):''):'')+
 '<section class="card ar-final-ranks"><h2>'+(pending?'Geçici maç sıralaması':'Bu oyunun kesin sıralaması')+'</h2>'+(pending?'<p role="status">Diğer katılımcıların sunucu onaylı sonuçları bekleniyor.</p>':'<p>Puanı eşit olanlarda toplam süresi kısa olan öne geçer.</p>')+arScoreHTML()+'</section>'+
 (!pending&&typeof rkInlineHTML==='function'?rkInlineHTML('oy-arena2','genel',undefined,10).replace('İlgili sıralama','Genel Er Meydanı sıralaması'):'')+
 (arM5()?(arRekorYaz(s),(!pending&&arPuanYaz(s)),arRekorHTML(s)):'')+(!pending&&arM5()?arUnvanHTML():'')+'<p>'+(arM5()?s.score+' puan · ':'')+s.ok+' doğru · '+s.bad+' yanlış · '+s.n+' soru'+(s.n>=AR.total&&arM5()?' · 🏆 Meydan Şampiyonu!':'')+'</p>'+(!pending&&AR.reviewCount?'<button type="button" class="btn pri" onclick="arReviewOpen()">Pekiştiriyorum ('+AR.reviewCount+' soru)</button>':'')+(AR.rapor?sonucGoster(AR.rapor):'')+
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
