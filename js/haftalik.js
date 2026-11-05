/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Haftalık yarışma: sabit haftalık set, yerel deneme ve devam kaydı. Sunucu doğrulaması yoktur. */
'use strict';
const HAFTA_AYAR={attempts:3,distribution:[{subject:'mutfak-araclari',n:8},{subject:'baharat',n:7},{subject:'bulasik-makinesi-temizligi',n:5},{subject:'kuver',n:5}],contentVersion:'hafta-1'};
let HAFTA=null,HAFTA_ERROR='';
/* Çalışma süresi: yukarı sayar. Mola, gizli sekme, açık pencere (ses seçimi vb.) ve ekran dışı bekleme sayılmaz.
   Süre yalnız eşit doğru sayısında sıralamayı belirler; cihazda ölçülür, sunucuda doğrulanmaz. */
const HAFTA_DUR_MAX=86400;let HAFTA_T=0,HAFTA_TIMER=null;
function haftaRunning(){const ov=document.getElementById('ov');return !!HAFTA&&!HAFTA.done&&!HAFTA.paused&&st.screen==='haftaplay'&&document.visibilityState==='visible'&&!st.modalOpen&&!(ov&&ov.classList.contains('on'));}
function haftaFmt(ms){const s=Math.floor((ms||0)/1000),m=Math.floor(s/60);return String(m).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function haftaShowTime(){const e=document.getElementById('haftaSure');if(e&&HAFTA)e.textContent=haftaFmt(HAFTA.ms);}
function haftaTick(){const now=performance.now(),d=now-HAFTA_T;HAFTA_T=now;if(!HAFTA||HAFTA.done){if(HAFTA_TIMER){clearInterval(HAFTA_TIMER);HAFTA_TIMER=null;}return;}if(!haftaRunning())return;if(d>0&&d<=2000)HAFTA.ms=(HAFTA.ms||0)+d;haftaShowTime();}
function haftaTimerOn(){HAFTA_T=performance.now();if(!HAFTA_TIMER)HAFTA_TIMER=setInterval(haftaTick,250);}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){haftaTick();if(HAFTA&&!HAFTA.done)haftaSave();}else HAFTA_T=performance.now();});
addEventListener('pagehide',()=>{haftaTick();if(HAFTA&&!HAFTA.done)haftaSave();});
RK_BOARDS.push({id:'haftalik',subject:'haftalik',kind:'weekly',total:25,label:'Haftalık Mutfak Yarışması'});
RK_SUBJECT_NAMES.haftalik='Haftalık Mutfak Yarışması';
function haftaPid(){return !st.guest&&st.prof?rkPid(st.prof,true):null;}
function haftaKey(){return haftaPid()||'misafir';}
function haftaState(){return ls('haftalik',{});}
function haftaSave(){if(!HAFTA||!HAFTA.pid)return;haftaTick();const all=haftaState();all[HAFTA.pid]=all[HAFTA.pid]||{};all[HAFTA.pid].resume=HAFTA;lsSet('haftalik',all);}
function haftaSafe(q){
 if(q.ambiguous||q.conflict||q.unsafe||q.belirsiz||q.cakisma||q.guvensiz||q.disabled||q.exclude)return false;
 const correct=q.choices&&q.choices.find(c=>c.id===q.correct),a=correct?correct.text||'':q.answer||'';
 return !(/(?:yangın|gaz kaçağı|kırık cam|kırık bardak)/i.test(q.prompt||q.kok||'')&&/(?:müdahale eder|toplar|toplamalı|süpürür|vanayı kapat|söndür)/i.test(a));
}
function haftaData(){const all=yrAllData();return Object.fromEntries(Object.entries(all).filter(([k,v])=>v).map(([k,v])=>[k,k==='kuver'?v:{...v,matches:(v.matches||[]).filter(haftaSafe),questions:(v.questions||[]).filter(haftaSafe)}]));}
function haftaOpen(){HAFTA_ERROR='';go('haftamenu');}
async function haftaStart(){
 HAFTA_ERROR='';try{
 await yrReady('butun');const week=rkWeekNo(),pid=haftaPid(),store=haftaState()[pid]||{},saved=store.resume;
 if(saved&&saved.week===week&&saved.version===HAFTA_AYAR.contentVersion+'-'+yrRev('butun')&&!saved.done){HAFTA=saved;HAFTA.ms=HAFTA.ms||0;haftaTimerOn();go('haftaplay');return;}
 const count=(store.attempts||{})[week]||0,ranked=!!pid&&count<HAFTA_AYAR.attempts;
 const qs=YarisModel.buildScoped(haftaData(),{scope:'butun',n:25,distribution:HAFTA_AYAR.distribution},(week*2654435761)>>>0,[]);
 await yrPreload(qs);HAFTA={id:rkRandomId(),pid,week,version:HAFTA_AYAR.contentVersion+'-'+yrRev('butun'),ranked,qs,k:0,answers:[],paused:false,breakUsed:false,done:false,ms:0};haftaTimerOn();haftaSave();go('haftaplay');
 }catch(e){HAFTA_ERROR=e.message;render();}
}
function haftaAnswer(i){if(!HAFTA||HAFTA.done||HAFTA.paused||HAFTA.answers.length!==HAFTA.k)return;const q=HAFTA.qs[HAFTA.k];if(!q.choices[i])return;HAFTA.answers.push({ok:q.choices[i].id===q.correct,pick:i});haftaSave();render();}
function haftaNext(){if(!HAFTA||HAFTA.paused||HAFTA.answers.length!==HAFTA.k+1)return;if(HAFTA.answers.length===HAFTA.qs.length){haftaFinish();return;}HAFTA.k++;haftaSave();render();}
function haftaBreak(){if(!HAFTA||HAFTA.breakUsed||HAFTA.done||!HAFTA.answers.length||HAFTA.answers.length%5)return;HAFTA.breakUsed=true;HAFTA.paused=true;haftaSave();render();}
function haftaResume(){if(!HAFTA)return;HAFTA.paused=false;HAFTA_T=performance.now();haftaSave();render();}
function haftaFinish(){
 if(!HAFTA||HAFTA.done||HAFTA.answers.length!==HAFTA.qs.length)return;
 haftaTick();const h=HAFTA,score=h.answers.filter(a=>a.ok).length;h.score=score;h.dur=Math.max(1,Math.round((h.ms||0)/1000));h.durOk=h.dur<=HAFTA_DUR_MAX;h.done=true;const all=haftaState(),mine=all[h.pid]||{attempts:{},best:{}};mine.attempts=mine.attempts||{};mine.best=mine.best||{};
 const freshWeek=h.week===rkWeekNo();h.ranked=h.ranked&&freshWeek&&h.pid===haftaPid()&&(mine.attempts[h.week]||0)<HAFTA_AYAR.attempts;
 if(h.ranked){mine.attempts[h.week]=(mine.attempts[h.week]||0)+1;mine.bestDur=mine.bestDur||{};const ob=mine.best[h.week]||0,od=mine.bestDur[h.week];
  if(score>ob||(score===ob&&h.durOk&&(!od||h.dur<od))){mine.best[h.week]=score;if(h.durOk)mine.bestDur[h.week]=h.dur;else delete mine.bestDur[h.week];}
  all[h.pid]=mine;lsSet('haftalik',all);
  if(typeof rutbeComplete==='function')rutbeComplete({id:h.id,table:'haftalik',correct:score,total:25,weekly:true,week:h.week});
  const p=rkProf(h.pid);if(p.status==='in'){const q=rkQueue();q.push({qid:rkRandomId(),pid:h.pid,board:'haftalik',period:'hafta',name:rkName(st.prof),correct:score,gen:p.gen,at:Date.now(),sess:h.id,week:h.week,meta:{game:'haftalik',scope:'butun',total:25,contentVersion:h.version,week:h.week,...(h.durOk?{dur:h.dur}:{})}});lsSet('rk_queue',q);rkFlush(h.id);}
 }
 haftaSave();go('haftaover');
}
function haftaMenuHTML(){const pid=haftaPid(),mine=haftaState()[pid]||{},count=(mine.attempts||{})[rkWeekNo()]||0,saved=mine.resume;return topBar('Haftalık Mutfak Yarışması')+'<div class="wrap"><h1>Haftalık Mutfak Yarışması</h1><p class="card">Dört konu · 25 soru<br>Her soruya bir yanıt verilir. Süre sınırı yoktur. Doğru sayısı eşitse daha kısa sürede bitiren üstte sayılır.</p><p>'+(!pid?'Misafir olarak antrenman oynarsın. Sonucun sıralamaya yazılmaz.':count+' / '+HAFTA_AYAR.attempts+' sıralamalı deneme tamamlandı. En iyi sonucun tutulur.')+'</p><button class="btn pri" onclick="haftaStart()">'+(saved&&!saved.done&&saved.week===rkWeekNo()?'Kaldığın yerden devam et':!pid||count>=HAFTA_AYAR.attempts?'Antrenmana başla':'Başla')+'</button><button class="btn" onclick="rkOpenBoard(\'haftalik\')">Bu haftanın lideri</button><button class="btn" onclick="haftaPrevious()">Geçen haftanın birincisi</button>'+(HAFTA_ERROR?'<p role="alert">'+esc(HAFTA_ERROR)+'</p>':'')+'</div>';}
function haftaPrevious(){RK.view.period='hafta';rkOpenBoard('haftalik');RK.view.week=rkWeekNo()-1;rkLoadRows();}
function haftaPlayHTML(){const h=HAFTA;if(!h)return haftaMenuHTML();if(h.paused)return topBar('Mola')+'<div class="wrap"><h1>Mola</h1><p>Mola süresi sonucunu etkilemez.</p><button class="btn pri" onclick="haftaResume()">Devam et</button></div>';const q=h.qs[h.k],a=h.answers[h.k];return topBar('Haftalık Mutfak Yarışması')+'<div class="wrap"><p class="hafta-ust"><span>Soru '+(h.k+1)+' / '+h.qs.length+' · '+(h.ranked?'Sıralamalı deneme':'Antrenman')+'</span><span role="timer" aria-live="off">Çalışma süresi: <b id="haftaSure">'+haftaFmt(h.ms)+'</b></span></p>'+yrQuestionHTML(q)+yrChoicesHTML(q,'haftaAnswer',a?{pick:a.pick}:null)+(a?'<p role="status">'+(a.ok?'Doğru.':'Doğru yanıt: '+esc(q.choices.find(c=>c.id===q.correct).text||q.correct))+'</p><button class="btn pri" onclick="haftaNext()">'+(h.k===h.qs.length-1?'Bitir':'Sonraki soru')+'</button>':'')+'<div class="hafta-alt">'+(!h.breakUsed&&h.answers.length>0&&h.answers.length%5===0&&h.answers.length<25?'<button class="btn" onclick="haftaBreak()">Mola ver</button>':'')+'<button class="btn ghost" onclick="haftaSave();haftaOpen()">Kaydet ve çık</button></div></div>';}
function haftaOverHTML(){return topBar('Yarışma sonucu')+'<div class="wrap"><h1>'+HAFTA.score+' / '+HAFTA.qs.length+' doğru</h1><p>Çalışma süresi: <b>'+haftaFmt(HAFTA.ms)+'</b>'+(HAFTA.durOk?'':' · Süre kaydedilemedi.')+'<br>Süre yalnız eşit doğru sayılarında sıralamayı belirler.</p><p>'+(HAFTA.ranked?(rkQueue().some(q=>q.sess===HAFTA.id)?'Sonucun kaydediliyor.':'Sonucun kaydedildi.'):'Antrenman tamamlandı. Bu sonuç sıralamaya yazılmaz.')+'</p>'+rkInlineHTML('haftalik','hafta',HAFTA.week)+'<button class="btn" onclick="haftaOpen()">Yarışmaya dön</button></div>';}
