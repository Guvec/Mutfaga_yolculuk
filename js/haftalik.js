/* Haftalık yarışma: sabit haftalık set, yerel deneme ve devam kaydı. Sunucu doğrulaması yoktur. */
'use strict';
const HAFTA_AYAR={attempts:3,distribution:[{subject:'mutfak-araclari',n:8},{subject:'baharat',n:7},{subject:'bulasik-makinesi-temizligi',n:5},{subject:'kuver',n:5}],contentVersion:'hafta-1'};
let HAFTA=null,HAFTA_ERROR='';
RK_BOARDS.push({id:'haftalik',subject:'haftalik',kind:'weekly',total:25,label:'Haftalık Mutfak Yarışması'});
RK_SUBJECT_NAMES.haftalik='Haftalık Mutfak Yarışması';
function haftaPid(){return !st.guest&&st.prof?rkPid(st.prof,true):null;}
function haftaKey(){return haftaPid()||'misafir';}
function haftaState(){return ls('haftalik',{});}
function haftaSave(){if(!HAFTA||!HAFTA.pid)return;const all=haftaState();all[HAFTA.pid]=all[HAFTA.pid]||{};all[HAFTA.pid].resume=HAFTA;lsSet('haftalik',all);}
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
 if(saved&&saved.week===week&&saved.version===HAFTA_AYAR.contentVersion+'-'+yrRev('butun')&&!saved.done){HAFTA=saved;go('haftaplay');return;}
 const count=(store.attempts||{})[week]||0,ranked=!!pid&&count<HAFTA_AYAR.attempts;
 const qs=YarisModel.buildScoped(haftaData(),{scope:'butun',n:25,distribution:HAFTA_AYAR.distribution},(week*2654435761)>>>0,[]);
 await yrPreload(qs);HAFTA={id:rkRandomId(),pid,week,version:HAFTA_AYAR.contentVersion+'-'+yrRev('butun'),ranked,qs,k:0,answers:[],paused:false,breakUsed:false,done:false};haftaSave();go('haftaplay');
 }catch(e){HAFTA_ERROR=e.message;render();}
}
function haftaAnswer(i){if(!HAFTA||HAFTA.done||HAFTA.paused||HAFTA.answers.length!==HAFTA.k)return;const q=HAFTA.qs[HAFTA.k];if(!q.choices[i])return;HAFTA.answers.push({ok:q.choices[i].id===q.correct,pick:i});haftaSave();render();}
function haftaNext(){if(!HAFTA||HAFTA.paused||HAFTA.answers.length!==HAFTA.k+1)return;if(HAFTA.answers.length===HAFTA.qs.length){haftaFinish();return;}HAFTA.k++;haftaSave();render();}
function haftaBreak(){if(!HAFTA||HAFTA.breakUsed||HAFTA.done||!HAFTA.answers.length||HAFTA.answers.length%5)return;HAFTA.breakUsed=true;HAFTA.paused=true;haftaSave();render();}
function haftaResume(){if(!HAFTA)return;HAFTA.paused=false;haftaSave();render();}
function haftaFinish(){
 if(!HAFTA||HAFTA.done||HAFTA.answers.length!==HAFTA.qs.length)return;
 const h=HAFTA,score=h.answers.filter(a=>a.ok).length;h.done=true;h.score=score;const all=haftaState(),mine=all[h.pid]||{attempts:{},best:{}};mine.attempts=mine.attempts||{};mine.best=mine.best||{};
 const freshWeek=h.week===rkWeekNo();h.ranked=h.ranked&&freshWeek&&h.pid===haftaPid()&&(mine.attempts[h.week]||0)<HAFTA_AYAR.attempts;
 if(h.ranked){mine.attempts[h.week]=(mine.attempts[h.week]||0)+1;mine.best[h.week]=Math.max(mine.best[h.week]||0,score);all[h.pid]=mine;lsSet('haftalik',all);
  if(typeof rutbeComplete==='function')rutbeComplete({id:h.id,table:'haftalik',correct:score,total:25,weekly:true,week:h.week});
  const p=rkProf(h.pid);if(p.status==='in'){const q=rkQueue();q.push({qid:rkRandomId(),pid:h.pid,board:'haftalik',period:'hafta',name:rkName(st.prof),correct:score,gen:p.gen,at:Date.now(),sess:h.id,week:h.week,meta:{game:'haftalik',scope:'butun',total:25,contentVersion:h.version,week:h.week}});lsSet('rk_queue',q);rkFlush(h.id);}
 }
 haftaSave();go('haftaover');
}
function haftaMenuHTML(){const pid=haftaPid(),mine=haftaState()[pid]||{},count=(mine.attempts||{})[rkWeekNo()]||0,saved=mine.resume;return topBar('Haftalık Mutfak Yarışması')+'<div class="wrap"><h1>Haftalık Mutfak Yarışması</h1><p class="card">Dört konu · 25 soru<br>Her soruya bir yanıt verilir. Süre sınırı ve hız bonusu yoktur. Eşit doğru sayıları aynı sırayı paylaşır.</p><p>'+(!pid?'Misafir olarak antrenman oynarsın. Sonucun sıralamaya yazılmaz.':count+' / '+HAFTA_AYAR.attempts+' sıralamalı deneme tamamlandı. En iyi sonucun tutulur.')+'</p><button class="btn pri" onclick="haftaStart()">'+(saved&&!saved.done&&saved.week===rkWeekNo()?'Kaldığın yerden devam et':!pid||count>=HAFTA_AYAR.attempts?'Antrenmana başla':'Başla')+'</button><button class="btn" onclick="rkOpenBoard(\'haftalik\')">Bu haftanın lideri</button><button class="btn" onclick="haftaPrevious()">Geçen haftanın birincisi</button>'+(HAFTA_ERROR?'<p role="alert">'+esc(HAFTA_ERROR)+'</p>':'')+'</div>';}
function haftaPrevious(){RK.view.period='hafta';rkOpenBoard('haftalik');RK.view.week=rkWeekNo()-1;rkLoadRows();}
function haftaPlayHTML(){const h=HAFTA;if(!h)return haftaMenuHTML();if(h.paused)return topBar('Mola')+'<div class="wrap"><h1>Mola</h1><p>Mola süresi sonucunu etkilemez.</p><button class="btn pri" onclick="haftaResume()">Devam et</button></div>';const q=h.qs[h.k],a=h.answers[h.k];return topBar('Haftalık Mutfak Yarışması')+'<div class="wrap"><p>Soru '+(h.k+1)+' / '+h.qs.length+' · '+(h.ranked?'Sıralamalı deneme':'Antrenman')+'</p>'+yrQuestionHTML(q)+yrChoicesHTML(q,'haftaAnswer',a?{pick:a.pick}:null)+(a?'<p role="status">'+(a.ok?'Doğru.':'Doğru yanıt: '+esc(q.choices.find(c=>c.id===q.correct).text||q.correct))+'</p><button class="btn pri" onclick="haftaNext()">'+(h.k===h.qs.length-1?'Bitir':'Sonraki soru')+'</button>':'')+(!h.breakUsed&&h.answers.length>0&&h.answers.length%5===0&&h.answers.length<25?'<button class="btn" onclick="haftaBreak()">Mola ver</button>':'')+'<button class="btn ghost" onclick="haftaSave();haftaOpen()">Kaydet ve çık</button></div>';}
function haftaOverHTML(){return topBar('Yarışma sonucu')+'<div class="wrap"><h1>'+HAFTA.score+' / '+HAFTA.qs.length+' doğru</h1><p>'+(HAFTA.ranked?(rkQueue().some(q=>q.sess===HAFTA.id)?'Sonucun kaydediliyor.':'Sonucun kaydedildi.'):'Antrenman tamamlandı. Bu sonuç sıralamaya yazılmaz.')+'</p>'+rkInlineHTML('haftalik','hafta',HAFTA.week)+'<button class="btn" onclick="haftaOpen()">Yarışmaya dön</button></div>';}
