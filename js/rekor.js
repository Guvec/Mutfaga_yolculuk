/* Bireysel rekor, haftalık/genel sıralama ve Pekiştiriyorum turu (v15 taslak).
   Kurallar: sıralamayı yalnız doğru sayısı belirler; süre yalnız telefonda kalır; skoru yalnız Uyguluyorum yazar.
   Öğreniyorum, Pekiştiriyorum ve oda yarışı sıralamaya yazmaz. Tasarım: claude/oyun-siralama-tasarimi.md */
'use strict';
const RK_TERM='2026-2027', RK_VERSION=1;
const RK_SUBJ={baharat:'bh','mutfak-araclari':'ma','bulasik-makinesi-temizligi':'bl'};
const RK_MCQ={
 'mutfak-araclari':['Tabaklar, kâseler, bardaklar ve fincanlar','Çatal, bıçak ve kaşıklar','Servis araçları','Pişirme kapları ve tavalar','Hazırlık ve doğrama araçları','Ölçme, süzme, aktarma ve kontrol araçları','Hamur ve tatlı araçları','Pişirme ve ısıtma cihazları','Hazırlık cihazları','Saklama araçları ve artan yemek','Temizlik araçları','Koruyucular','1. Bölüm · Bölüm sonu','2. Bölüm · Bölüm sonu','3. Bölüm · Bölüm sonu'],
 'bulasik-makinesi-temizligi':['Bulaşık Yıkama ve Atık Yönetimi · Bütün bölümler']
};
/* Kurallardaki tablo listesiyle aynı olmalı. İçerikteki soru/kart sayısı tutmazsa o tablo sıralamaya yazmaz. */
const RK_BOARDS=(()=>{const a=[];
 for(let i=1;i<=8;i++)a.push({id:'bh-e'+i,subject:'baharat',kind:'match',set:i,total:12,label:i+'. takım · Eşleştirme'});
 for(let i=1;i<=12;i++)a.push({id:'ma-e'+i,subject:'mutfak-araclari',kind:'match',set:i,total:12,label:i+'. takım · Eşleştirme'});
 a.push({id:'bl-e1',subject:'bulasik-makinesi-temizligi',kind:'match',set:1,total:12,label:'1. takım · Eşleştirme'});
 a.push({id:'kv-basit',subject:'kuver',kind:'kur',lvl:1,total:5,label:'Basit Kuver · Kuveri Kur'});
 a.push({id:'kv-tabldot',subject:'kuver',kind:'kur',lvl:3,total:9,label:'Tabldot Kuver · Kuveri Kur'});
 const mt=[10,5,6,6,7,6,5,5,5,7,8,4,7,7,7];
 RK_MCQ['mutfak-araclari'].forEach((g,i)=>a.push({id:'ma-s'+String(i+1).padStart(2,'0'),subject:'mutfak-araclari',kind:'mcq',group:g,total:mt[i],label:g+' · Sorular'}));
 a.push({id:'bl-s1',subject:'bulasik-makinesi-temizligi',kind:'mcq',group:RK_MCQ['bulasik-makinesi-temizligi'][0],total:13,label:'Bütün bölümler · Sorular'});
 return a;})();
const RK_SUBJECT_NAMES={baharat:'Baharatlar','mutfak-araclari':'Mutfak Araçları',kuver:'Kuver','bulasik-makinesi-temizligi':'Bulaşık Yıkama ve Atık Yönetimi'};
const RK={backend:null,busy:false,view:{board:null,period:'hafta',rows:null,state:'idle',err:''},msg:null};

/* ---------- Yardımcılar ---------- */
function rkBoard(id){return RK_BOARDS.find(b=>b.id===id)||null;}
function rkWeekNo(ms){return Math.floor(((ms||Date.now())+10800000+259200000)/604800000);}
function rkWeekLabel(w){const start=w*604800000-259200000,d=ms=>{const x=new Date(ms);return pad(x.getUTCDate())+'.'+pad(x.getUTCMonth()+1)+'.'+x.getUTCFullYear();};return d(start)+' – '+d(start+6*86400000);}
function rkTable(boardId,period,w){return RK_TERM+'~'+boardId+'~'+(period==='genel'?'genel':'w'+(w||rkWeekNo()));}
function rkName(n){return String(n||'').trim().replace(/\s+/g,' ').slice(0,16);}
function rkRandomId(){const c='abcdefghijklmnopqrstuvwxyz0123456789',b=crypto.getRandomValues(new Uint8Array(20));return Array.from(b,x=>c[x%c.length]).join('');}
function rkIds(){return ls('rk_ids',{});}
function rkPid(name,create){const m=rkIds();if(!m[name]&&create){m[name]=rkRandomId();lsSet('rk_ids',m);}return m[name]||null;}
function rkProfAll(){return ls('rk_prof',{});}
function rkProf(pid){return rkProfAll()[pid]||{status:'in',gen:0,synced:false};}
function rkProfSet(pid,v){const a=rkProfAll();a[pid]={...rkProf(pid),...v};lsSet('rk_prof',a);}
function rkBestAll(){return ls('rk_best',{});}
function rkQueue(){return ls('rk_queue',[]);}
function rkClean(){return ls('rk_clean',{});}
function rkCleanAdd(pid,table){const c=rkClean();c[pid]=c[pid]||[];if(!c[pid].includes(table))c[pid].push(table);lsSet('rk_clean',c);}
function rkCleanDel(pid,table){const c=rkClean();c[pid]=(c[pid]||[]).filter(t=>t!==table);if(!c[pid].length)delete c[pid];lsSet('rk_clean',c);}
function rkPekAll(){return ls('rk_pek',{});}
function rkPek(pid){return rkPekAll()[pid]||{};}
function rkPekSave(pid,v){const a=rkPekAll();a[pid]=v;lsSet('rk_pek',a);}
function rkRaceActive(){return typeof YR!=='undefined'&&YR.active;}
function rkBackend(){if(RK.backend)return RK.backend;if(window.REKOR_FAKE)RK.backend=window.REKOR_FAKE;else if(typeof RekorFirebase!=='undefined')RK.backend=new RekorFirebase(window.YARIS_FIREBASE_CONFIG);return RK.backend;}
function rkOnline(){return navigator.onLine!==false;}
function rkErrCode(e){return (e&&(e.code||e.message))||'';}

/* İçerikteki gerçek kart/soru sayısı tablo sınırıyla aynı mı? Değilse o tablo sıralamaya yazılmaz. */
function rkBoardValid(b){
 if(b.kind==='kur')return typeof LEVELS!=='undefined'&&LEVELS[b.lvl]&&LEVELS[b.lvl].items.length===b.total;
 const d=CONTENT[b.subject];if(!d)return false;
 if(b.kind==='match')return d.matches.filter(x=>x.set===b.set).length===b.total;
 const saveSub=st.subject,saveOp=st.op;st.subject=b.subject;st.op='mcq';let n=0;try{const g=mcqGroups().find(x=>x.label===b.group);n=g?g.count:0;}finally{st.subject=saveSub;st.op=saveOp;}
 return n===b.total;
}
/* Biten oturumun tablosu. Hazırlık turları, yer değiştirme tekrarı ve puansız yoklama sıralamaya girmez. */
function rkBoardForSession(){
 const s=st.sess;if(!s||s.practice!=='check'||s.unranked)return null;
 if(st.op==='match'&&st.board&&st.board.size===12&&!st.board.variant&&RK_SUBJ[st.subject])return rkBoard(RK_SUBJ[st.subject]+'-e'+st.contentSet);
 if(st.op==='kur')return rkBoard(st.lvl===3?'kv-tabldot':st.lvl===1?'kv-basit':'');
 if(st.op==='mcq')return RK_BOARDS.find(b=>b.kind==='mcq'&&b.subject===st.subject&&b.group===st.mcqGroup)||null;
 return null;
}
function rkSessionDone(){
 const s=st.sess;if(!s)return false;
 if(st.op==='match')return !!(st.board&&(s.practice==='check'?st.board.checked:st.kDone));
 return !!st.kDone;
}

/* ---------- Sonucu işleme ---------- */
function rkSessionCorrect(){return st.sess.ok;}
function rkSessionDuration(){const s=st.sess;if(typeof s.duration==='number')return s.duration;return Math.round(s.qs.reduce((n,q)=>n+(Number(q.s)||0),0)*10)/10;}
function rkAfterAssessment(){
 const s=st.sess;s.rkDone=true;
 if(st.guest){RK.msg={sess:s.id,head:'Misafir oturumu',text:'Misafir oturumunda rekor ve sıralama kaydedilmez.',cloud:''};return;}
 const pid=rkPid(st.prof,true);
 rkPekFromAssessment(pid);
 const b=rkBoardForSession();if(!b)return;
 if(!rkBoardValid(b)){RK.msg={sess:s.id,head:'Sonucun kaydedildi.',text:'Bu çalışmanın içeriği güncellendiği için sonuç şimdilik sıralamaya yazılmıyor.',cloud:''};return;}
 const correct=rkSessionCorrect(),dur=rkSessionDuration(),now=new Date().toISOString();
 const all=rkBestAll(),mine=all[pid]||{},old=mine[b.id];
 let head,text;
 if(!old){head='İlk sonucun kaydedildi.';text='Bu denemede '+correct+' / '+b.total+' doğru.';}
 else if(correct>old.best){head='Yeni rekor!';text='Bu denemede '+correct+' / '+b.total+' doğru. Önceki en iyi sonucun: '+old.best+' / '+b.total+'.';}
 else if(correct===old.best){head='En iyi sonucuna ulaştın.';text='Bu denemede '+correct+' / '+b.total+' doğru.';}
 else{head='Sonucun kaydedildi.';text='Bu denemede '+correct+' / '+b.total+' doğru. En iyi sonucun korunuyor: '+old.best+' / '+b.total+'.';}
 const better=!old||correct>old.best||(correct===old.best&&dur&&(!old.bestDur||dur<old.bestDur));
 mine[b.id]={best:old?Math.max(old.best,correct):correct,bestAt:better?now:old.bestAt,bestDur:better?dur:old.bestDur,last:correct,lastAt:now,lastDur:dur,n:(old?old.n:0)+1};
 all[pid]=mine;lsSet('rk_best',all);
 RK.msg={sess:s.id,board:b.id,head,text,cloud:''};
 const p=rkProf(pid);
 if(p.status!=='in'){RK.msg.cloud='Sıralamada görünmüyorsun. İstersen Rekorlarım ekranından listeye dönebilirsin.';return;}
 const q=rkQueue(),name=rkName(st.prof);
 ['genel','hafta'].forEach(period=>q.push({qid:rkRandomId(),pid,board:b.id,period,name,correct,gen:p.gen,at:Date.now(),sess:s.id}));
 lsSet('rk_queue',q);
 RK.msg.cloud=rkOnline()?'Sıralama güncelleniyor…':'Sıran internete bağlanınca görünecek.';
 if(!p.synced)RK.msg.note='Adın sıralamada görünür. İstemezsen Rekorlarım ekranından listeden çıkabilirsin.';
 rkFlush(s.id);
}
/* Sıradaki sonuçları gönderir. Listeden çıkıldıktan sonra kalan ya da eski nesilden gelen sonuçlar atılır. */
async function rkFlush(sessId){
 if(RK.busy||!rkOnline()||!rkQueue().length)return;const be=rkBackend();if(!be)return;RK.busy=true;
 let outcome=null;
 try{
  const checked={};
  while(rkQueue().length){
   const item=rkQueue()[0],drop=()=>lsSet('rk_queue',rkQueue().filter(x=>x!==null&&(item.qid?x.qid!==item.qid:JSON.stringify(x)!==JSON.stringify(item)))),p=rkProf(item.pid);
   if(p.status!=='in'||item.gen!==p.gen){drop();continue;}
   if(!checked[item.pid]){const sp=await be.ensureProfile(item.pid);rkProfSet(item.pid,{status:sp.status,gen:sp.gen,synced:true});checked[item.pid]=sp;}
   const sp=checked[item.pid];if(sp.status!=='in'||sp.gen!==item.gen){drop();continue;}
   const row={name:item.name,correct:item.correct,term:RK_TERM,version:RK_VERSION,gen:item.gen};
   let res=null,table=null;
   const tries=item.period==='genel'?[rkTable(item.board,'genel')]:[0,1,-1].map(d=>rkTable(item.board,'hafta',rkWeekNo()+d));
   for(const t of tries){try{rkCleanAdd(item.pid,t);res=await be.submit(t,item.pid,row);table=t;break;}catch(e){if(!/permission/i.test(rkErrCode(e)))throw e;}}
   drop();
   if(item.sess===sessId&&!res){outcome=outcome||{};outcome.failed=true;}
   if(item.sess===sessId&&res)outcome=outcome||{};
   if(item.sess===sessId&&res&&!res.stale)outcome[item.period]={table,kept:!!res.kept};
  }
  if(outcome&&RK.msg&&RK.msg.sess===sessId){
   const pid=rkPid(st.prof);const parts=[];
   for(const period of ['hafta','genel']){const o=outcome[period];if(!o)continue;const rows=await be.list(o.table);const r=rkRank(rows,pid);if(r)parts.push((period==='hafta'?'Bu haftaki sıran: ':'Genel sıran: ')+r.rank+(r.tie>1?' ('+r.tie+' kişiyle aynı sırada)':''));}
   const kept=outcome.genel&&outcome.genel.kept;RK.msg.cloud=parts.length?parts.join(' · ')+(kept?' · En iyi sonucun korunuyor.':''):outcome.failed?'Bu sonuç sıralamaya yazılamadı. Sonucun bu telefonda kayıtlı.':'Bu sonuç sıralamaya gönderilmedi.';
  }
 }catch(e){if(RK.msg&&RK.msg.sess===sessId)RK.msg.cloud='Sıralamaya şu anda ulaşılamadı. Sonucun telefonda kayıtlı; internet olduğunda yeniden gönderilir.';}
 finally{RK.busy=false;if(RK.again){RK.again=false;setTimeout(rkMaintenance,0);}}
 if(RK.msg&&RK.msg.sess===sessId&&['board','quiz','summary','spicereview'].includes(st.screen))render();
}
/* Sıra: kendisinden daha çok doğru yapan kişi sayısı + 1. Eşitler aynı sırayı paylaşır; ekranda alfabetik dizilir. */
function rkSorted(rows){return rows.slice().sort((a,b)=>b.correct-a.correct||String(a.name).localeCompare(String(b.name),'tr'));}
function rkRank(rows,pid){const me=rows.find(r=>r.pid===pid);if(!me)return null;return {rank:rows.filter(r=>r.correct>me.correct).length+1,tie:rows.filter(r=>r.correct===me.correct).length,row:me};}

/* ---------- Listeden çık / listeye dön / profil silme ---------- */
async function rkCleanup(pid){const be=rkBackend();for(const t of (rkClean()[pid]||[]).slice()){try{await be.removeRow(t,pid);rkCleanDel(pid,t);}catch(e){if(/not.?found/i.test(rkErrCode(e)))rkCleanDel(pid,t);else throw e;}}return !(rkClean()[pid]||[]).length;}
async function rkLeave(){
 const pid=rkPid(st.prof,true);if(!rkOnline()){RK.view.notice='Listeden çıkmak için internete bağlan.';render();return;}
 RK.view.notice='Bu cihazdan yeni sonuç gönderilmeyecek. Kayıtların kaldırılıyor…';render();
 try{const be=rkBackend();lsSet('rk_queue',rkQueue().filter(x=>x.pid!==pid));const sp=await be.ensureProfile(pid);rkProfSet(pid,{status:sp.status,gen:sp.gen,synced:true});
  if(sp.status==='in'){const n=await be.setStatus(pid,'out');rkProfSet(pid,{status:n.status,gen:n.gen});}
  const done=await rkCleanup(pid);RK.view.notice=done?'Kayıtların listeden kaldırıldı.':'Bazı kayıtlar kaldırılamadı. İnternet olduğunda yeniden denenecek.';
 }catch(e){RK.view.notice='Şu anda tamamlanamadı. İnternet bağlantını kontrol edip yeniden dene.';}
 render();
}
async function rkJoin(){
 const pid=rkPid(st.prof,true);if(!rkOnline()){RK.view.notice='Listeye dönmek için internete bağlan.';render();return;}
 try{const be=rkBackend();if(!(await rkCleanup(pid))){RK.view.notice='Eski kayıtlar henüz kaldırılamadı. Biraz sonra yeniden dene.';render();return;}
  const sp=await be.ensureProfile(pid);if(sp.status==='out'){const n=await be.setStatus(pid,'in');rkProfSet(pid,{status:n.status,gen:n.gen,synced:true});}else rkProfSet(pid,{status:sp.status,gen:sp.gen,synced:true});
  RK.view.notice='Listeye döndün. Bundan sonraki Uyguluyorum sonuçların sıralamaya yazılır.';
 }catch(e){RK.view.notice='Şu anda tamamlanamadı. İnternet bağlantını kontrol edip yeniden dene.';}
 render();
}
function rkForgetProfile(name){
 const ids=rkIds(),pid=ids[name];if(!pid)return;delete ids[name];lsSet('rk_ids',ids);
 const b=rkBestAll();delete b[pid];lsSet('rk_best',b);const pk=rkPekAll();delete pk[pid];lsSet('rk_pek',pk);
 lsSet('rk_queue',rkQueue().filter(x=>x.pid!==pid));rkProfSet(pid,{pendingDelete:true});rkMaintenance();
}
/* Açılışta ve bağlantı gelince: yarım kalan silme/temizlik işlerini bitirir, bekleyen sonuçları gönderir. */
async function rkMaintenance(){
 if(!rkOnline())return;if(RK.busy||RK.maint){RK.again=true;return;}RK.maint=true;try{await rkMaintenanceRun();}finally{RK.maint=false;}if(RK.again){RK.again=false;setTimeout(rkMaintenance,0);}
}
async function rkMaintenanceRun(){const all=rkProfAll(),clean=rkClean(),be=rkBackend();if(!be)return;
 for(const pid of Object.keys(all)){
  const p=all[pid];
  try{
   if(p.pendingDelete&&p.status!=='deleted'){
    if(!p.synced&&!(clean[pid]||[]).length){const a=rkProfAll();delete a[pid];lsSet('rk_prof',a);continue;}
    const n=await be.setStatus(pid,'deleted');rkProfSet(pid,{status:n.status,gen:n.gen});
   }
   if(['out','deleted'].includes(rkProf(pid).status)&&(clean[pid]||[]).length)await rkCleanup(pid);
   if(rkProf(pid).status==='deleted'&&!(rkClean()[pid]||[]).length){const a=rkProfAll();delete a[pid];lsSet('rk_prof',a);}
  }catch(e){if(rkErrCode(e)==='NO_PROFILE'){const a=rkProfAll();delete a[pid];lsSet('rk_prof',a);}}
 }
 rkFlush(null);
}

/* ---------- Pekiştiriyorum verisi ---------- */
function rkPekMark(map,key,info,correct,wrongName){
 const it=map[key];
 if(correct){if(!it)return;it.streak=(it.streak||0)+1;it.at=Date.now();if(it.streak>=2)delete map[key];return;}
 const n=it||{...info,streak:0,wrong:[]};n.streak=0;n.at=Date.now();if(wrongName&&!n.wrong.includes(wrongName))n.wrong.push(wrongName);map[key]=n;
}
function rkPekFromAssessment(pid){
 const map=rkPek(pid),s=st.sess;
 if(st.op==='match'&&st.board){st.board.items.forEach(it=>{const nm=st.board.pair[it.id];rkPekMark(map,'m|'+st.subject+'|'+st.contentSet+'|'+it.id,{kind:'m',subject:st.subject,set:st.contentSet,id:it.id},nm===it.answer,nm&&nm!==it.answer?nm:null);});}
 else if(st.op==='mcq'){(st.contentItems||[]).forEach(q=>{const row=s.qs.find(x=>x.q===q.prompt&&x.r!==null);if(!row)return;rkPekMark(map,'q|'+st.subject+'|'+q.id,{kind:'q',subject:st.subject,id:q.id},row.r===1,null);});}
 else if(st.op==='kur'){s.qs.forEach(row=>{if(!row.prompt)return;rkPekMark(map,'k|'+st.lvl+'|'+row.prompt,{kind:'k',subject:'kuver',lvl:st.lvl,id:row.prompt},row.r===1,null);});}
 rkPekSave(pid,map);
}
function rkPekItems(subject){if(st.guest||!st.prof)return [];const pid=rkPid(st.prof);if(!pid)return [];return Object.entries(rkPek(pid)).filter(([k,v])=>v.subject===subject).map(([k,v])=>({key:k,...v}));}
function rkPekGroups(subject){
 const items=rkPekItems(subject),out=[];
 const q=items.filter(x=>x.kind==='q');if(q.length)out.push({kind:'q',label:'Çoktan seçmeli sorular',n:q.length,arg:0});
 [...new Set(items.filter(x=>x.kind==='m').map(x=>x.set))].sort((a,b)=>a-b).forEach(n=>out.push({kind:'m',label:n+'. takım · Eşleştirme',n:items.filter(x=>x.kind==='m'&&x.set===n).length,arg:n}));
 [1,3].forEach(l=>{const c=items.filter(x=>x.kind==='k'&&x.lvl===l).length;if(c)out.push({kind:'k',label:(l===3?'Tabldot':'Basit')+' Kuver',n:c,arg:l});});
 return out;
}
/* Tur bitince sayaç güncellenir. Yalnız ilk ve yardımsız yanıt (r===1) bağımsız doğru sayılır. */
function rkPekProcess(){
 const s=st.sess;s.rkPekDone=true;if(st.guest||!st.prof)return;const pid=rkPid(st.prof,true),map=rkPek(pid),r=st.pekRound||{};
 if(r.kind==='q')(st.contentItems||[]).forEach(q=>{const row=s.qs.find(x=>x.q===q.prompt);if(row)rkPekMark(map,'q|'+st.subject+'|'+q.id,{kind:'q',subject:st.subject,id:q.id},row.r===1,null);});
 if(r.kind==='m'&&st.board)st.board.items.forEach(it=>{const res=st.board.res[it.id];if(res===undefined)return;const at=(st.board.attempts[it.id]||[]).find(x=>!x.correct);rkPekMark(map,'m|'+st.subject+'|'+st.contentSet+'|'+it.id,{kind:'m',subject:st.subject,set:st.contentSet,id:it.id},res===1,at?at.answer:null);});
 if(r.kind==='k')s.qs.forEach(row=>{if(row.prompt&&(r.targets||[]).includes(row.prompt))rkPekMark(map,'k|'+st.lvl+'|'+row.prompt,{kind:'k',subject:'kuver',lvl:st.lvl,id:row.prompt},row.r===1,null);});
 rkPekSave(pid,map);
 const left=rkPekItems(st.subject).length;
 RK.msg={sess:s.id,head:'Bu turu tamamladın.',text:left?'Tekrar edilecek '+left+' madde kaldı. Bir madde arka arkaya iki kez ilk denemede doğru yapılınca listeden çıkar.':'Bu konuda tekrar edilecek madde kalmadı.',cloud:'',pek:true};
}
function rkPekStart(kind,arg){
 const items=rkPekItems(st.subject).sort((a,b)=>(a.streak||0)-(b.streak||0)||(a.at||0)-(b.at||0));
 st.brk=0;st.kDone=false;st.done=false;st.inBreak=false;RK.msg=null;
 if(kind==='q'){
  st.op='mcq';const qs=getData().questions,pick=items.filter(x=>x.kind==='q').slice(0,8).map(x=>qs.find(q=>q.id===x.id)).filter(Boolean);
  if(!pick.length){go('pekmenu');return;}
  st.practice='pek';st.mcqGroup='Pekiştiriyorum';st.pekRound={kind:'q'};st.contentItems=shuffle(pick).map(mcqShuffled);st.contentIndex=0;st.contentSet=null;
  st.sess={id:Date.now(),p:st.prof,t:new Date().toISOString(),op:'mcq',subject:st.subject,practice:'pek',total:pick.length,group:'Pekiştiriyorum',s:0,ok:0,fix:0,bad:0,br:0,qs:[]};
  st.savedMsg='';contentNext();st.screen='quiz';render();window.scrollTo(0,0);return;
 }
 if(kind==='m'){
  st.op='match';st.contentSet=arg;const full=contentArr().filter(x=>x.set===arg),targets=items.filter(x=>x.kind==='m'&&x.set===arg).slice(0,4);
  const its=targets.map(t=>full.find(x=>x.id===t.id)).filter(Boolean);if(!its.length){go('pekmenu');return;}
  /* Ad havuzu: hedeflerin doğru adları + öğrencinin gerçekten seçtiği yanlış adlar + gerekirse aynı takımın öğretilmiş adları. Dolgu çeldirici yok. */
  const names=[];const add=n=>{if(n&&!names.includes(n))names.push(n);};its.forEach(x=>add(x.answer));targets.forEach(t=>(t.wrong||[]).forEach(add));
  shuffle(full.filter(x=>!its.includes(x)).map(x=>x.answer)).forEach(n=>{if(names.length<its.length+2)add(n);});
  st.practice='learn';st.pekRound={kind:'m',set:arg};
  st.board={items:shuffle(its),names:shuffle(names),extra:names.length-its.length,pair:{},sel:null,selName:null,tries:{},res:{},attempts:{},responseTime:{},checked:false,size:its.length,variant:true};
  st.lastRes={cls:'',head:'Pekiştiriyorum: '+its.length+' görsel ve '+names.length+' ad var.',text:'Bir görsele dokun, sonra adını seç. Bazı adlar hiçbir görselle eşleşmez.',intro:true};
  st.sess={id:Date.now(),p:st.prof,t:new Date().toISOString(),op:'match',subject:st.subject,practice:'pek',set:arg,s:0,ok:0,fix:0,bad:0,br:0,total:its.length,qs:[]};
  st.savedMsg='';if(typeof PHONE!=='undefined'){PHONE.open=false;PHONE.expanded=false;}tStart();st.screen='board';render();window.scrollTo(0,0);return;
 }
 if(kind==='k'){
  const targets=items.filter(x=>x.kind==='k'&&x.lvl===arg).map(x=>x.id);if(!targets.length){go('pekmenu');return;}
  st.op='kur';st.lvl=arg;st.practice='learn';st.pekRound={kind:'k',targets};RK.startingPek=true;try{startSession();}finally{RK.startingPek=false;}st.sess.practice='pek';
  /* Yanlış yerleştirilen parçalar önce sorulur; ekmek tabağı tereyağı bıçağından önce gelir. */
  let first=st.order.filter(k=>targets.includes(k)),rest=st.order.filter(k=>!targets.includes(k));
  const fix=a=>{const i=a.indexOf('ekmek_tabagi'),j=a.indexOf('tereyagi_bicagi');if(i>-1&&j>-1&&j<i){a[i]='tereyagi_bicagi';a[j]='ekmek_tabagi';}return a;};
  if(first.includes('tereyagi_bicagi')&&!first.includes('ekmek_tabagi')&&rest.includes('ekmek_tabagi')){rest=rest.filter(k=>k!=='ekmek_tabagi');first.unshift('ekmek_tabagi');}
  st.order=fix(first).concat(rest);newQ(true);st.lastRes={cls:'',head:'Pekiştiriyorum: önce yanlış yerleştirdiğin parçalar gelecek.',text:ITEMS.kuver_tabagi.kural};render();return;
 }
}
function rkPekMenuHTML(){
 const gs=rkPekGroups(st.subject);let h=topBar(subjectName())+'<div class="wrap"><h1>Pekiştiriyorum</h1>';
 if(!gs.length)return h+'<p class="card">Bu konuda tekrar edilecek madde yok. Uyguluyorum bölümünde yanlış yaptıkların burada toplanır.</p></div>';
 h+='<p class="sub">Uyguluyorum\'da yanlış yaptığın maddeler burada listelenir. Bir madde arka arkaya iki kez ilk denemede doğru yapılınca listeden çıkar. Bu tur sıralamaya yazılmaz.</p><div class="list">';
 gs.forEach(g=>h+=menuButton(g.label,g.n+' madde',"rkPekStart('"+g.kind+"',"+g.arg+")"));
 return h+'</div></div>';
}

/* ---------- Rekorlarım ve sıralama ekranları ---------- */
function rkTabs(active){return '<div class="rk-tabs" role="tablist">'+(st.guest?'':'<button role="tab" aria-selected="'+(active==='rekor')+'" class="btn'+(active==='rekor'?' pri':'')+'" onclick="go(\'rekor\')">Rekorlarım</button>')+'<button role="tab" aria-selected="'+(active==='siralama')+'" class="btn'+(active==='siralama'?' pri':'')+'" onclick="rkOpenBoard()">Sıralama</button></div>';}
function rkFmtDate(iso){return iso?fmtDate(iso):'';}
function rkParticipationHTML(){
 const pid=rkPid(st.prof);const p=pid?rkProf(pid):{status:'in'};const pending=pid&&(rkClean()[pid]||[]).length;
 let h='<section class="card rk-part"><h2>Sıralamada görünme</h2>';
 if(p.status==='in')h+='<p>Adın (<b>'+esc(rkName(st.prof))+'</b>) Uyguluyorum sonuçlarıyla sıralamada görünür.</p><button class="btn" onclick="rkLeave()">Listeden çık</button>';
 else h+='<p>Şu anda sıralamada görünmüyorsun. Rekorların yalnız bu telefonda tutuluyor.</p><button class="btn" onclick="rkJoin()"'+(pending&&!rkOnline()?' disabled':'')+'>Listeye dön</button>';
 if(RK.view.notice)h+='<p class="note" role="status">'+esc(RK.view.notice)+'</p>';
 return h+'</section>';
}
function rkRecordsHTML(){
 let h=topBar('Rekorlarım')+'<div class="wrap">'+rkTabs('rekor');
 const pid=rkPid(st.prof),mine=pid?(rkBestAll()[pid]||{}):{};
 h+=rkParticipationHTML();
 const ids=Object.keys(mine);
 if(!ids.length)return h+'<p class="card">Henüz rekor yok. Uyguluyorum bölümünü bitirince sonuçların burada görünür.</p></div>';
 Object.keys(RK_SUBJECT_NAMES).forEach(sub=>{
  const bs=RK_BOARDS.filter(b=>b.subject===sub&&mine[b.id]);if(!bs.length)return;
  h+='<h2 class="grp-h">'+esc(RK_SUBJECT_NAMES[sub])+'</h2><div class="rk-list">';
  bs.forEach(b=>{const r=mine[b.id];h+='<div class="rk-rec"><div><b>'+esc(b.label)+'</b><span>En iyi sonucun: <b>'+r.best+' / '+b.total+'</b>'+(r.bestDur?' · '+fmtDur(r.bestDur):'')+'</span><span class="note">Son deneme: '+r.last+' / '+b.total+' · '+rkFmtDate(r.lastAt)+'</span></div><button class="btn sm" onclick="rkOpenBoard(\''+b.id+'\')">Sıralama</button></div>';});
  h+='</div>';
 });
 return h+'<p class="note">Süre yalnız bu telefonda tutulur, sıralamayı etkilemez.</p></div>';
}
function rkOpenBoard(id){
 const pid=st.prof?rkPid(st.prof):null,mine=pid?(rkBestAll()[pid]||{}):{};
 const last=Object.entries(mine).sort((a,b)=>String(b[1].lastAt).localeCompare(String(a[1].lastAt)))[0];
 RK.view.board=id||RK.view.board||(last&&last[0])||'bh-e1';RK.view.rows=null;RK.view.state='idle';RK.view.err='';go('siralama');rkLoadRows();
}
function rkPickSubject(sub){const b=RK_BOARDS.find(x=>x.subject===sub);if(b)rkOpenBoard(b.id);}
function rkPickPeriod(p){RK.view.period=p;RK.view.rows=null;render();rkLoadRows();}
async function rkLoadRows(){
 const v=RK.view,key=v.board+'|'+v.period;if(!rkOnline()){v.state='offline';render();return;}
 v.state='loading';render();
 try{const be=rkBackend();if(!be)throw Error('NO_CONFIG');const rows=await be.list(rkTable(v.board,v.period==='genel'?'genel':'hafta'));if(v.board+'|'+v.period!==key)return;v.rows=rows;v.state='ready';}
 catch(e){if(v.board+'|'+v.period!==key)return;v.state='error';v.err=rkErrCode(e)==='NO_CONFIG'?'Sıralama bağlantısı ayarlanmadı.':'Sıralamaya şu anda ulaşılamadı.';}
 if(st.screen==='siralama')render();
}
function rkBoardHTML(){
 const v=RK.view,b=rkBoard(v.board)||RK_BOARDS[0],pid=st.prof&&!st.guest?rkPid(st.prof):null;
 let h=topBar('Sıralama')+'<div class="wrap">'+rkTabs('siralama');
 h+='<div class="card rk-pick"><label>Konu <select onchange="rkPickSubject(this.value)">'+Object.keys(RK_SUBJECT_NAMES).map(s=>'<option value="'+s+'"'+(s===b.subject?' selected':'')+'>'+esc(RK_SUBJECT_NAMES[s])+'</option>').join('')+'</select></label>';
 h+='<label>Çalışma <select onchange="rkOpenBoard(this.value)">'+RK_BOARDS.filter(x=>x.subject===b.subject).map(x=>'<option value="'+x.id+'"'+(x.id===b.id?' selected':'')+'>'+esc(x.label)+'</option>').join('')+'</select></label>';
 h+='<div class="rk-period" role="group" aria-label="Dönem"><button class="btn sm'+(v.period==='hafta'?' pri':'')+'" aria-pressed="'+(v.period==='hafta')+'" onclick="rkPickPeriod(\'hafta\')">Bu hafta</button><button class="btn sm'+(v.period==='genel'?' pri':'')+'" aria-pressed="'+(v.period==='genel')+'" onclick="rkPickPeriod(\'genel\')">Genel</button></div></div>';
 h+='<h2 class="rk-title">'+esc(RK_SUBJECT_NAMES[b.subject]+' · '+b.label)+'</h2><p class="note">'+(v.period==='hafta'?'Hafta: '+rkWeekLabel(rkWeekNo())+'. Liste pazartesi yeniden başlar.':'Bu eğitim yılının en iyi sonuçları.')+' Her öğrencinin bu çalışmadaki en iyi doğru sayısı gösterilir. Sırayı yalnız doğru sayısı belirler.</p>';
 if(v.state==='offline')return h+'<p class="card" role="status">Sıralamayı görmek için internete bağlan.</p></div>';
 if(v.state==='loading'||v.state==='idle')return h+'<p class="card" role="status">Sıralama yükleniyor…</p></div>';
 if(v.state==='error')return h+'<p class="card" role="alert">'+esc(v.err)+'</p><button class="btn" onclick="rkLoadRows()">Yeniden dene</button></div>';
 const rows=rkSorted(v.rows||[]);if(!rows.length)return h+'<p class="card">Bu listede henüz sonuç yok. Uyguluyorum bölümünü bitiren ilk kişi sen olabilirsin.</p></div>';
 let shown=rows;const big=rows.length>100;if(big){shown=rows.slice(0,50);const me=rows.find(r=>r.pid===pid);if(me&&!shown.includes(me))shown=shown.concat([me]);}
 h+='<ol class="rk-rows">';shown.forEach(r=>{const rank=rows.filter(x=>x.correct>r.correct).length+1,me=r.pid===pid;h+='<li class="rk-row'+(me?' rk-me':'')+'"><span class="rk-rank">'+rank+'.</span><span class="rk-name">'+esc(r.name)+(me?' <b>(sen)</b>':'')+'</span><span class="rk-score">'+r.correct+' / '+b.total+'</span></li>';});
 h+='</ol>'+(big?'<p class="note">İlk 50 sonuç ve senin sıran gösteriliyor.</p>':'')+'<p class="note">Bu liste sınıf içi tekrar içindir. Bir çalışmadaki sonuç, atölyede bağımsız uygulamayı tek başına göstermez.</p></div>';
 return h;
}
function rkBannerHTML(){
 const m=RK.msg;if(!m||!st.sess||m.sess!==st.sess.id)return '';
 return '<section class="card rk-banner'+(m.head==='Yeni rekor!'?' rk-new':'')+'" role="status"><strong>'+esc(m.head)+'</strong><p>'+esc(m.text)+'</p>'+(m.cloud?'<p class="note">'+esc(m.cloud)+'</p>':'')+(m.note?'<p class="note">'+esc(m.note)+'</p>':'')+(m.board?'<button class="btn sm" onclick="rkOpenBoard(\''+m.board+'\')">Sıralamayı gör</button>':'')+(m.pek&&rkPekItems(st.subject).length?'<button class="btn sm" onclick="go(\'pekmenu\')">Pekiştiriyorum listesine dön</button>':'')+(m.pek&&st.pekRound&&st.pekRound.kind==='m'?'<button class="btn sm" onclick="rkPekFullCheck()">Takımın tamamıyla yokla (puansız)</button>':'')+'</section>';
}
/* Pekiştirme sonrası 12 görsel / 18 adlık yoklama. Puansızdır ve sıralamaya yazılmaz. */
function rkPekFullCheck(){const n=st.pekRound&&st.pekRound.set;if(!n)return;st.pekRound=null;st.op='match';st.contentSet=n;startBoard('check',12);st.sess.unranked=true;st.lastRes={...st.lastRes,head:'Puansız yoklama. '+st.lastRes.head};render();}

/* ---------- Ekran ve akış bağlantıları ---------- */
const RK_RENDER=render,RK_BACK=back,RK_CAT=catName,RK_STATS=statsHtml,RK_ANSWER=answer,RK_START=startSession,RK_STARTBOARD=startBoard,RK_STARTCONTENT=startContent;
/* Yeni normal oturum başlarken önceki pekiştirme/yoklama işaretleri taşınmaz. */
startSession=function(){if(!RK.startingPek)st.pekRound=null;return RK_START.apply(this,arguments);};
startBoard=function(){st.pekRound=null;return RK_STARTBOARD.apply(this,arguments);};
startContent=function(){st.pekRound=null;return RK_STARTCONTENT.apply(this,arguments);};
catName=function(r){const s=RK_CAT(r);if(r.unranked)return s.replace(' · Uyguluyorum','')+' · Puansız yoklama';return r.practice==='pek'?s.replace(' · Öğreniyorum','')+' · Pekiştiriyorum':s;};
statsHtml=function(){if(st.practice==='pek'&&st.op==='mcq'&&st.sess&&st.screen!=='summary')return '<div class="stats"><span class="chip">Yanıtlanan '+st.sess.qs.length+' / '+(st.contentItems||[]).length+'</span></div>';return RK_STATS();};
/* Pekiştiriyorum'da çoktan seçmeli: tek yanıt, hemen geri bildirim ve açıklama. İpucuyla ikinci deneme yok. */
answer=function(v){
 if(!(st.practice==='pek'&&st.op==='mcq'))return RK_ANSWER(v);
 if(st.done||!st.q||st.inBreak||st.modalOpen)return;if(typeof sesSus==='function')sesSus();
 const q=st.q,c=q.choices.find(x=>x.id===v);if(!c)return;const right=v===q.correct,secs=tStop();
 st.done=true;st.res=right?1:0;st.wrong=right?[]:[v];if(right)st.sess.ok++;else st.sess.bad++;
 st.sess.qs.push({q:q.prompt,a:q.correctText,r:st.res,s:secs,selectedAnswer:c.text||c.id+' seçeneği',firstAnswer:c.text||c.id+' seçeneği',attemptCount:1,hintUsed:false,assessment:false,explanation:q.explanation||'',source:q.source});
 st.lastRes={cls:right?'ok':'fix',head:right?'Doğru.':'Doğru yanıt: '+q.correctText,text:q.explanation||''};saveProgress();render();
};
back=function(){if(st.screen==='rekor'||st.screen==='siralama'){go('home');return;}if(st.screen==='pekmenu'){go('subject');return;}RK_BACK();};
const RK_DELPROF=askDelProfile;
askDelProfile=function(n){
 modal('“'+esc(n)+'” profili ve bütün kayıtları silinsin mi? Sıralamadaki satırları da kaldırılır.',function(){
  lsSet('profiles',profiles().filter(x=>x!==n));lsSet('records',records().filter(r=>r.p!==n));rkForgetProfile(n);closeModal();render();
 });
};
render=function(){
 if(st.sess&&!rkRaceActive()&&rkSessionDone()){
  if(st.sess.practice==='check'&&!st.sess.rkDone)rkAfterAssessment();
  else if(st.sess.practice==='pek'&&!st.sess.rkPekDone)rkPekProcess();
 }
 if(st.sess&&st.sess.unranked)st.sess.s=0;
 const app=document.getElementById('app');
 if(st.screen==='rekor'){if(st.guest){st.screen='siralama';}else{app.innerHTML=rkRecordsHTML();return;}}
 if(st.screen==='siralama'){app.innerHTML=rkBoardHTML();return;}
 if(st.screen==='pekmenu'){app.innerHTML=rkPekMenuHTML();return;}
 RK_RENDER();
 if(st.screen==='home'){const list=app.querySelector('.wrap .list');if(list)list.insertAdjacentHTML('beforeend',menuButton(st.guest?'Sıralama':'Rekorlarım ve Sıralama',st.guest?'Uyguluyorum sonuçlarının haftalık ve genel listesi.':'Kendi en iyi sonuçların, haftalık ve genel liste.',st.guest?"rkOpenBoard()":"go('rekor')"));}
 if(st.screen==='subject'&&!st.guest&&!rkRaceActive()){const list=app.querySelector('.wrap .list'),n=rkPekItems(st.subject).length;if(list)list.insertAdjacentHTML('beforeend',menuButton('Pekiştiriyorum'+(n?' ('+n+')':''),n?'Uyguluyorum\'da yanlış yaptıklarını tekrar et.':'Uyguluyorum\'da yanlış yaptıkların burada toplanır.',"go('pekmenu')"));}
 if(['mode','boardmode','mcqmode'].includes(st.screen)){const list=app.querySelector('.wrap .list'),ranked=st.screen==='boardmode'?!!RK_SUBJ[st.subject]:st.screen==='mode'?st.op==='kur':RK_BOARDS.some(x=>x.kind==='mcq'&&x.subject===st.subject&&x.group===st.mcqGroup);
  const note=ranked?'Uyguluyorum sonucun Rekorlarım\'a ve sıralamaya yazılır. Öğreniyorum yazılmaz.':st.screen==='mcqmode'?'Bu bölümün sonucu sıralamaya yazılmaz. Sıralama için “Bütün bölümler” denemesini çöz.':'Bu çalışmanın sonucu sıralamaya yazılmaz.';
  if(list)list.insertAdjacentHTML('afterend','<p class="note">'+note+'</p>');}
 /* Pekiştirme turunun sonunda normal tur başlatan düğmeler gizlenir; dönüş banner'daki düğmelerle yapılır. */
 if(st.pekRound&&st.kDone&&['board','quiz'].includes(st.screen))app.querySelectorAll('button[onclick]').forEach(b=>{if(/startBoard|newKuverBtn|startSession/.test(b.getAttribute('onclick')))b.remove();});
 if(st.sess&&st.sess.unranked)app.querySelectorAll('.stats .chip').forEach(c=>{if(/Puan/.test(c.textContent))c.remove();});
 if(['board','quiz','summary','spicereview'].includes(st.screen)){const ban=rkBannerHTML();if(ban){const w=app.querySelector('.wrap');if(w)w.insertAdjacentHTML('afterbegin',ban);}}
};
window.addEventListener('online',()=>{rkMaintenance();});
setTimeout(()=>{if(Object.keys(rkProfAll()).length||rkQueue().length)rkMaintenance();},1500);
render();
