/* Yarış, mevcut bireysel modlardan ayrı bir oturumdur; yalnız bağımsız yanıtlar. */
'use strict';
const YR={active:false,code:null,room:null,players:[],results:[],unsubs:[],resultUnsub:null,host:false,started:false,submitted:false,submitting:false,phase:'menu',error:'',busy:false,paused:false,notice:'',saved:null,seen:0,networkError:false};
let yrTransport=null;
function yrStore(key,value){try{if(value===undefined)return JSON.parse(sessionStorage.getItem('mesleki-race-'+key)||'null');if(value===null)sessionStorage.removeItem('mesleki-race-'+key);else sessionStorage.setItem('mesleki-race-'+key,JSON.stringify(value));}catch(e){}return null;}
function yrConfigured(){return !!(window.YARIS_FIREBASE_CONFIG&&window.YARIS_FIREBASE_CONFIG.projectId&&window.YARIS_FIREBASE_CONFIG.apiKey);}
function yrService(){if(!yrTransport)yrTransport=new YarisFirebase(window.YARIS_FIREBASE_CONFIG);return yrTransport;}
function yrTimeout(p){let timer;return Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Bağlantı tamamlanamadı. İnterneti kontrol edip yeniden dene.')),12000);})]).finally(()=>clearTimeout(timer));}
function yrError(e){YR.error=e&&e.message&&!String(e.message).includes('Firebase')?e.message:'Odaya bağlanılamadı. İnterneti ve oda ayarlarını kontrol et.';render();}
async function yrDo(fn){if(YR.busy)return;const token=YR.opToken=(YR.opToken||0)+1;YR.busy=true;YR.error='';render();try{await yrTimeout(Promise.resolve().then(()=>fn(token)));}catch(e){if(YR.opToken===token)yrError(e);}finally{if(YR.opToken===token){YR.opToken++;YR.busy=false;render();}}}
async function yrPlan(subject,set,level){
 if(!YarisModel.labels[subject])throw Error('Konu seçimini kontrol et.');
 let payload,total;
 if(subject==='kuver'){
  if(![1,3].includes(level))throw Error('Kuver türünü seç.');
  total=LEVELS[level].items.length;payload={items:LEVELS[level].items.map(k=>({key:k,...ITEMS[k],place:PLACE_LABEL[k],image:IMG[k]})),mode:'kur'};
 }else{
  const d=CONTENT[subject];if(!d)throw Error('Konu dosyası yüklenemedi. Sayfayı yenile.');
  const items=d.matches.filter(x=>x.set===set);if(items.length!==12)throw Error('Bu takım kullanılamıyor.');total=12;payload={items,names:d.distractors[String(set)]};
 }
 const fingerprint=await YarisModel.fingerprint({engine:'mesleki-race-13',subject,set:subject==='kuver'?0:set,level:subject==='kuver'?level:0,payload});
 return {subject,set:subject==='kuver'?0:set,level:subject==='kuver'?level:0,total,fingerprint,version:13};
}
function yrOpen(){sesSus();YR.phase='menu';YR.error='';st.screen='racemenu';render();window.scrollTo(0,0);}
function yrSubjectChanged(){const s=document.getElementById('yrSubject').value;document.getElementById('yrSetRow').hidden=s==='kuver';document.getElementById('yrLevelRow').hidden=s!=='kuver';const select=document.getElementById('yrSet');select.innerHTML=Array.from({length:s==='baharat'?8:12},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'. takım</option>').join('');}
function yrCreate(){const subject=document.getElementById('yrSubject').value,set=Number(document.getElementById('yrSet').value),level=Number(document.getElementById('yrLevel').value);yrDo(async token=>{const plan=await yrPlan(subject,set,level),code=await yrService().create(plan);if(YR.opToken===token)await yrEnter(code);else if(!YR.active||YR.code!==code)await yrService().remove(code).catch(()=>{});});}
function yrJoin(){const code=document.getElementById('yrCode').value.trim().toUpperCase(),nick=document.getElementById('yrNick').value.trim();if(!/^[A-Z2-9]{8}$/.test(code)){yrError(Error('Sekiz karakterli oda kodunu yaz.'));return;}if(!YarisModel.validNick(nick)){yrError(Error('En fazla 16 karakterli öğrenci kodu yaz. Harf ve rakam kullan.'));return;}yrDo(token=>yrJoinWork(code,nick,token));}
async function yrEnter(code){
 sesSus();const generation=YR.generation=(YR.generation||0)+1;YR.unsubs.forEach(f=>f());if(YR.resultUnsub)YR.resultUnsub();
 if(!YR.active)YR.saved={prof:st.prof,guest:st.guest,subject:st.subject,op:st.op,lvl:st.lvl,practice:st.practice};
 YR.active=true;YR.code=code;YR.room=null;YR.players=[];YR.results=[];YR.started=false;YR.submitted=false;YR.submitting=false;YR.paused=false;YR.host=false;YR.phase='lobby';YR.error='';YR.seen=0;YR.closing=false;YR.resultUnsub=null;YR.networkError=false;
 yrStore('room',code);st.screen='raceroom';
 const current=()=>YR.active&&YR.generation===generation&&YR.code===code;
 YR.unsubs=yrService().watch(code,room=>{if(current())yrRoomChanged(room,generation,code);},players=>{if(!current())return;YR.players=players;if(YR.host)yrUpdateRoster();else if(['lobby','waiting','closed','unavailable'].includes(YR.phase))render();yrMaybeClose();},e=>{if(current()){YR.networkError=true;yrError(e);}});render();
}
async function yrRoomChanged(room,generation=YR.generation,code=YR.code){
 const current=()=>YR.active&&YR.generation===generation&&YR.code===code;
 if(!current())return;YR.room=room;if(!room){YR.error='Oda kapatılmış veya silinmiş. Öğretmenden yeni oda kodu iste.';YR.phase='unavailable';st.screen='raceroom';render();return;}
 YR.host=room.host===yrService().uid;
 if(room.createdAt&&Date.now()-room.createdAt.toMillis()>86400000){YR.error='Bu odanın süresi doldu.';YR.phase='unavailable';st.screen='raceroom';render();return;}
 if(room.status==='closed'){
  tStop();sesSus();closeModal();yrRestoreSaved(room);YR.paused=false;st.inBreak=false;YR.phase='closed';st.screen='raceroom';
  if(!YR.resultUnsub)YR.resultUnsub=yrService().watchResults(code,data=>{if(!current())return;YR.results=data;if(YR.phase==='closed')render();},e=>{if(current())yrError(e);});
  render();return;
 }
 if(room.status==='playing'&&!YR.host&&!YR.started){
  // Engelleme erken işaretlenir: eş zamanlı oda/oyuncu bildirimleri iki oyun başlatmasın.
  YR.started=true;
  try{
   const own=await yrPlan(room.subject,room.set,room.level);if(!current()||YR.room?.status!=='playing')return;
   if(own.fingerprint!==room.fingerprint||own.total!==room.total)throw Error('İçerik sürümü oda ile aynı değil. Oyunu güncelleyip yeniden katıl.');
   const me=await yrService().self(code);
   if(!current()||YR.room?.status!=='playing')return;
   if(!me)throw Error('Bu odanın katılım kaydı bulunamadı. Oda koduyla yeniden katıl.');
   if(me&&me.status==='submitted'){yrRestoreSaved(room);YR.submitted=true;YR.phase='waiting';st.screen='raceroom';render();return;}
   if(me&&me.status==='left'){YR.phase='unavailable';st.screen='raceroom';render();return;}
   yrStartGame(room);
  }catch(e){if(current()){YR.phase='unavailable';st.screen='raceroom';yrError(e);}}
 }else if(YR.host||room.status==='lobby'){st.screen='raceroom';render();}
}
function yrStartGame(plan){
 const saved=yrStore('answers'),restore=saved&&saved.code===YR.code&&saved.fingerprint===plan.fingerprint;
 st.guest=true;st.practice='check';st.subject=plan.subject;st.modalOpen=false;st.inBreak=false;
 YR.phase='playing';YR.paused=false;YR.initializing=true;YR.rng=YarisModel.seeded(plan.seed);YR.seeded=true;
 try{if(plan.subject==='kuver'){st.op='kur';st.lvl=plan.level;startSession();}else{st.op='match';st.contentSet=plan.set;startBoard('check');}}finally{YR.seeded=false;YR.initializing=false;}
 st.sess.race={room:YR.code,subject:plan.subject,fingerprint:plan.fingerprint};
 const generation=YR.generation;yrService().progress(YR.code,0).catch(()=>{if(YR.active&&YR.generation===generation)YR.networkError=true;});
 if(restore){Object.assign(st,saved.state);st.guest=true;st.practice='check';st.modalOpen=false;st.inBreak=false;st.t0=st.run?Date.now():0;}
 if(st.kDone){yrComplete();return;}render();window.scrollTo(0,0);
}
function yrRestoreSaved(room){const saved=yrStore('answers');if(st.sess?.race?.room===YR.code)return;if(saved&&saved.code===YR.code&&saved.fingerprint===room.fingerprint&&saved.state?.sess?.race?.room===YR.code){Object.assign(st,saved.state);st.guest=true;st.practice='check';st.modalOpen=false;st.inBreak=false;st.run=false;st.t0=0;}}
function yrPersist(){if(!YR.active||YR.host||YR.phase!=='playing'||!st.sess||!st.sess.race)return;yrStore('answers',{code:YR.code,fingerprint:YR.room.fingerprint,state:JSON.parse(JSON.stringify(st))});}
function yrProgress(){if(!YR.active||YR.host||YR.phase!=='playing'||!st.sess)return;const generation=YR.generation;const completed=st.op==='match'?Object.keys(st.board.pair).length:st.sess.qs.length;if(completed>YR.seen){YR.seen=completed;yrService().progress(YR.code,completed).catch(()=>{if(YR.active&&YR.generation===generation)YR.networkError=true;});}}
function yrComplete(){
 if(!YR.active||YR.host||YR.phase!=='playing')return;
 if(st.op==='kur'&&st.sess.qs.length!==YR.room.total)return;
 if(st.op==='kur'){st.sess.duration=st.sess.qs.reduce((n,x)=>n+(x.s||0),0);tStop();}
 st.kDone=true;YR.phase='waiting';sesSus();PHONE.open=false;st.screen='raceroom';
 yrStore('answers',{code:YR.code,fingerprint:YR.room.fingerprint,state:JSON.parse(JSON.stringify(st))});render();yrSubmit();
}
function yrSubmit(){
 if(YR.submitted||YR.submitting||!YR.active||!YR.room||YR.room.status!=='playing'||!st.sess||!st.kDone)return;
 YR.submitting=true;YR.error='';
 const room=YR.room,code=YR.code,generation=YR.generation;const current=()=>YR.active&&YR.code===code&&YR.generation===generation;const me=YR.players.find(x=>x.uid===yrService().uid);
 const result={nick:me?.nick||yrStore('nick')||'Öğrenci',subject:room.subject,fingerprint:room.fingerprint,total:room.total,correct:st.sess.ok,score:st.sess.ok*10};
 yrTimeout(yrService().submit(code,result)).then(()=>{if(current()){YR.submitted=true;YR.networkError=false;}}).catch(e=>{if(current())yrError(e);}).finally(()=>{if(current()){YR.submitting=false;render();}});
}
function yrMaybeClose(){if(YR.active&&YR.host&&YR.room?.status==='playing'&&YR.players.some(p=>p.status==='submitted')&&YR.players.every(p=>['submitted','left'].includes(p.status))&&!YR.closing){const generation=YR.generation,code=YR.code;YR.closing=true;yrService().close(code).catch(e=>{if(YR.active&&YR.generation===generation)yrError(e);}).finally(()=>{if(YR.generation===generation)YR.closing=false;});}}
function yrStart(){if(!YR.host||!YR.players.some(p=>p.status==='waiting'))return;yrDo(()=>yrService().start(YR.code));}
function yrClose(){if(!YR.host||!confirm('Oturum kapatılsın mı? Bitirmeyen öğrenciler sıralamaya katılmayacak.'))return;yrDo(()=>yrService().close(YR.code));}
function yrPause(){if(!YR.active||YR.phase!=='playing')return;sesSus();YR.paused=!YR.paused;st.inBreak=YR.paused;if(YR.paused)pauseT();else resumeT();yrPersist();render();}
function yrLeave(force=false){
 if(!force&&YR.active&&YR.room&&YR.phase!=='unavailable'&&YR.room.status!=='closed'&&!confirm(YR.host?'Odadan ayrılırsan oturumu yönetmek için bu kodla geri dönmen gerekir. Ayrılmak istiyor musun?':'Çalışmadan ayrılmak istiyor musun? Tamamlanmayan çalışma sıralamaya katılmaz.'))return;
 const service=yrTransport,code=YR.code;YR.generation=(YR.generation||0)+1;YR.opToken=(YR.opToken||0)+1;YR.busy=false;
 if(YR.active&&!YR.host&&!YR.submitted&&YR.room?.status!=='closed')service.leave(code).catch(()=>{});
 sesSus();tStop();YR.unsubs.forEach(f=>f());if(YR.resultUnsub)YR.resultUnsub();YR.active=false;YR.room=null;YR.phase='menu';YR.unsubs=[];YR.resultUnsub=null;yrStore('room',null);yrStore('answers',null);st.inBreak=false;st.modalOpen=false;closeModal();if(YR.saved)Object.assign(st,YR.saved);st.sess=null;st.board=null;st.q=null;st.screen='home';render();window.scrollTo(0,0);
}
function yrDelete(){if(!YR.host||!confirm('Bu odanın öğrenci kodları ve sonuçları kalıcı olarak silinsin mi?'))return;const code=YR.code,generation=YR.generation;yrDo(async token=>{await yrService().remove(code);if(YR.active&&YR.code===code&&YR.generation===generation&&YR.opToken===token)yrLeave(true);});}
async function yrCopy(){try{await navigator.clipboard.writeText(new URL('?oda='+YR.code,location.href).href);YR.notice='Davet bağlantısı kopyalandı.';}catch(e){YR.notice='Bağlantıyı aşağıdaki kutudan seçip kopyalayabilirsin.';}render();}
function yrResultHTML(){
 const ranked=YarisModel.ranks(YR.results,YR.room),me=yrService().uid;
 return '<h2>'+esc(YarisModel.taskLabel(YR.room))+' sıralaması</h2><p>Doğru sayıları eşitse sıra paylaşılır. Süre sıralamayı değiştirmez.</p>'+(ranked.length?'<ol class="race-ranks">'+ranked.map(p=>'<li value="'+p.rank+'"'+(p.uid===me?' class="race-me"':'')+'><strong>'+esc(p.nick)+(p.uid===me?' (Sen)':'')+'</strong><span>'+p.rank+'. sıra · '+p.correct+' / '+p.total+' doğru'+(Number.isInteger(p.score)?' · '+p.score+' puan':'')+'</span></li>').join('')+'</ol>':'<p>Henüz kaydedilmiş bir sonuç yok veya sonuçlar yükleniyor.</p>')+'<p>Çalışmayı bitirmeyenler sıralamaya katılmaz.</p>';
}
/* Bekleme ekranı: puan gösterilmez, yalnız kimin bitirdiği görünür. Puanlar herkes bitirince açılır (Firebase kuralı da böyledir). */
function yrDurumHTML(){const me=yrService().uid,total=YR.room?.total||12;const list=YR.players.slice().sort((a,b)=>(a.uid===me?-1:b.uid===me?1:0)||String(a.nick).localeCompare(String(b.nick),'tr'));return '<h2>Katılımcılar</h2><ul class="race-players">'+list.map(p=>'<li'+(p.uid===me?' class="race-me"':'')+'>'+esc(p.nick)+(p.uid===me?' (Sen)':'')+' · '+({waiting:'Başlamadı',working:'Devam ediyor · '+(p.completed||0)+' / '+total+' yanıt',submitted:'Tamamladı',left:'Ayrıldı'}[p.status]||'Bağlanıyor')+'</li>').join('')+'</ul><p>Puanlar, herkes bitirince ya da öğretmen oturumu kapatınca burada görünür.</p>';}
function yrRosterHTML(){return YR.players.map(p=>'<li>'+esc(p.nick)+' · '+({waiting:'Hazır',working:p.completed+' / '+(YR.room?.total||12)+' yanıt',submitted:'Tamamladı',left:'Ayrıldı'}[p.status]||'Bağlanıyor')+'</li>').join('');}
function yrUpdateRoster(){const list=document.querySelector('.race-players');if(!list){render();return;}list.innerHTML=yrRosterHTML();const start=document.getElementById('yrStartButton');if(start)start.disabled=YR.busy||!YR.players.some(p=>p.status==='waiting');}
function yrFocusPhase(){const key=[YR.code,YR.phase,YR.room?.status,st.screen,st.op==='kur'?st.q?.key:''].join(':');if(YR.focusKey===key)return false;YR.focusKey=key;const el=document.querySelector('#yrHeading,.board-help,.qtext');if(el){el.setAttribute('tabindex','-1');el.focus({preventScroll:true});return true;}return false;}
function yrRenderRoom(){const app=document.getElementById('app'),active=document.activeElement,inside=app.contains(active),id=inside?active.id:null,action=inside?active.getAttribute('onclick'):null;app.innerHTML=yrRoomHTML();if(!yrFocusPhase()&&inside){const target=id?document.getElementById(id):action?Array.from(app.querySelectorAll('button[onclick]')).find(x=>x.getAttribute('onclick')===action):null;if(target&&!target.disabled)target.focus({preventScroll:true});}}
function yrRoomHTML(){
 const room=YR.room,url=new URL('?oda='+YR.code,location.href).href;
 let h=topBar('Birlikte Oynayalım',true)+'<div class="wrap"><h1 id="yrHeading" tabindex="-1">'+(YR.phase==='closed'?'Yarış sonuçları':YR.phase==='waiting'?'Çalışmanı tamamladın':YR.phase==='unavailable'?'Oturuma devam edilemiyor':YR.host?'Öğretmen oturumu':'Yarış odası')+'</h1><p class="race-code">Oda kodu: <strong>'+esc(YR.code)+'</strong></p>';
 if(room)h+='<p>'+esc(YarisModel.taskLabel(room))+'</p>';
 if(YR.phase==='unavailable'){h+='<p>Bu oturuma devam edilemiyor.</p>';if(YR.host&&room)h+='<button class="btn" onclick="yrDelete()"'+(YR.busy?' disabled':'')+'>Odayı ve sonuçları sil</button>';}
 else if(room?.status==='closed'){
  h+='<p class="card">Oturum tamamlandı.</p>'+yrResultHTML();
  if(st.sess?.race?.room===YR.code&&st.kDone)h+='<button class="btn pri" onclick="yrShowReport()">'+(room.subject==='baharat'?'Yanıtlarımı ve ürün bilgilerini incele':'Yanıtlarımı incele')+'</button>';
  if(YR.host)h+='<button class="btn" onclick="yrDelete()"'+(YR.busy?' disabled':'')+'>Odayı ve sonuçları sil</button>';
 }else if(YR.phase==='waiting')h+='<section class="card"><h2>Çalışmanı tamamladın.</h2><p>'+(YR.submitted?'Yanıtların gönderildi. Diğer öğrenciler bitirince sonuçlar açılacak.':YR.submitting?'Yanıtların gönderiliyor.':'Yanıtların bu sekmede duruyor. Bağlantıyı kontrol edip yeniden gönder.')+'</p>'+(!YR.submitted&&!YR.submitting?'<button class="btn pri" onclick="yrSubmit()">Yeniden gönder</button>':'')+'</section>'+(YR.players.length?yrDurumHTML():'');
 if(YR.host&&room?.status==='lobby')h+='<p>Öğrencilere oda kodunu ver. Katılanları kontrol et, sonra yarışı başlat.</p><label for="yrInvite">Davet bağlantısı</label><input id="yrInvite" readonly value="'+esc(url)+'"><button class="btn" onclick="yrCopy()">Bağlantıyı kopyala</button><p role="status">'+esc(YR.notice)+'</p><button id="yrStartButton" class="btn pri" onclick="yrStart()"'+(!YR.players.some(p=>p.status==='waiting')||YR.busy?' disabled':'')+'>Yarışı başlat</button>';
 else if(!YR.host&&room?.status==='lobby')h+='<p class="card">Odaya katıldın. Öğretmenin başlatmasını bekle.</p>';
 if(YR.host){h+='<h2>Katılanlar</h2><ul class="race-players">'+yrRosterHTML()+'</ul>';if(room?.status==='playing')h+='<button class="btn" onclick="yrClose()">Oturumu kapat</button>';}
 return h+yrMessages()+'<button class="btn" onclick="yrLeave()">'+(room?.status==='closed'?'Oyun menüsüne dön':'Odadan ayrıl')+'</button></div>';
}
function yrMessages(){return (YR.error?'<p class="card" role="alert">'+esc(YR.error)+'</p>':'')+(!navigator.onLine?'<p role="status">İnternet bağlantısı yok. Sonuç göndermek için bağlantı gerekiyor.</p>':'');}
function yrMenuHTML(){
 const code=new URLSearchParams(location.search).get('oda')||'',saved=yrStore('room'),config=yrConfigured();
 return topBar('Birlikte Oynayalım')+'<div class="wrap"><h1>Yarış odası</h1><p>Baharat, mutfak araçları ve kuver ayrı yarışılır. Bu bölümde ipucu verilmez. Can kaybı ve eleme yoktur. Eşit doğrular aynı sırayı paylaşır.</p>'+(!config?'<p class="card" role="status">Oda bağlantısı henüz ayarlanmadı. Bireysel oyunları kullanabilirsin.</p>':'')+'<section class="card"><h2>Odaya katıl</h2><label for="yrNick">Öğrenci kodun (örnek: A07)</label><input id="yrNick" maxlength="16" autocomplete="off" value="'+esc(yrStore('nick')||'')+'"><p>Gerçek ad ve soyad yazma.</p><label for="yrCode">Oda kodu</label><input id="yrCode" maxlength="8" autocapitalize="characters" autocomplete="off" value="'+esc(code||saved||'')+'"><button class="btn pri" onclick="yrJoin()"'+(!config||YR.busy?' disabled':'')+'>Odaya katıl</button></section><section class="card"><h2>Öğretmen: oda oluştur</h2><label for="yrSubject">Konu</label><select id="yrSubject" onchange="yrSubjectChanged()"><option value="baharat">Baharatlar</option><option value="mutfak-araclari">Mutfak Araçları</option><option value="kuver">Kuver</option></select><div id="yrSetRow"><label for="yrSet">Takım</label><select id="yrSet">'+Array.from({length:8},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'. takım</option>').join('')+'</select></div><div id="yrLevelRow" hidden><label for="yrLevel">Kuver türü</label><select id="yrLevel"><option value="1">Basit Kuver · 5 yer</option><option value="3">Tabldot Kuver · 9 yer</option></select></div><p>Öğretmen bu ekrandan oturumu yönetir; öğrenci olarak yarışmaz.</p><button class="btn pri" onclick="yrCreate()"'+(!config||YR.busy?' disabled':'')+'>Oda oluştur</button></section>'+(saved&&config?'<button class="btn" onclick="yrResume()">Önceki odama dön</button>':'')+yrMessages()+'<button class="btn" onclick="go(\'home\')">Bireysel oyunlara dön</button></div>';
}
async function yrJoinWork(code,nick,token){YR.pendingJoin={code,token};try{await yrService().join(code,nick);if(YR.opToken!==token){if(!(YR.active&&YR.code===code)&&!(YR.pendingJoin?.code===code&&YR.pendingJoin.token!==token))await yrService().leave(code).catch(()=>{});return;}yrStore('nick',nick);await yrEnter(code);}finally{if(YR.pendingJoin?.token===token)YR.pendingJoin=null;}}
function yrResume(){const code=yrStore('room');if(code)yrDo(token=>yrJoinWork(code,yrStore('nick')||'Öğrenci',token));}
function yrShowReport(){if(!YR.active||YR.room?.status!=='closed'||st.sess?.race?.room!==YR.code)return;YR.phase='review';sesSus();if(st.subject==='baharat')openSpiceReview();else{st.screen='summary';render();}}
const YR_GO=go,YR_STARTBOARD=startBoard,YR_STARTSESSION=startSession;
function yrReturnRoom(){YR.phase='closed';st.screen='raceroom';render();}
go=function(screen){if(st.screen==='racemenu'&&screen!=='racemenu'&&!YR.active){YR.opToken=(YR.opToken||0)+1;YR.busy=false;}if(YR.active&&YR.phase==='review'&&!['summary','board','spicereview'].includes(screen)){yrReturnRoom();return;}YR_GO(screen);};
startBoard=function(){if(YR.active&&YR.phase==='review'){yrReturnRoom();return;}return YR_STARTBOARD.apply(this,arguments);};
startSession=function(){if(YR.active&&YR.phase==='review'){yrReturnRoom();return;}return YR_STARTSESSION.apply(this,arguments);};
const YR_RENDER=render,YR_CHECK=checkBoard,YR_SHUFFLE=shuffle,YR_FINISH=finish,YR_BACK=back,YR_ASKFINISH=askFinish,YR_ASKBREAK=askBreak;
shuffle=function(items){return YR.active&&YR.seeded?YarisModel.shuffle(items,YR.rng):YR_SHUFFLE(items);};
checkBoard=function(){
 if(!YR.active)return YR_CHECK();
 if(YR.phase!=='playing'||YR.paused||st.practice!=='check'||!st.board||st.board.checked||Object.keys(st.board.pair).length!==st.board.items.length)return;
 st.board.checked=true;st.board.items.forEach(it=>boardRow(it,st.board.pair[it.id]===it.answer?1:0));boardFinished();yrComplete();
};
finish=function(){if(!YR.active)return YR_FINISH();if(YR.room?.status==='closed'&&YR.phase==='review')return YR_FINISH();if(st.kDone)yrComplete();else yrLeave();};
askFinish=function(){if(YR.active)yrLeave();else YR_ASKFINISH();};
askBreak=function(){if(YR.active)yrPause();else YR_ASKBREAK();};
back=function(){if(YR.active){if(YR.phase==='review'){YR.phase='closed';st.screen='raceroom';render();}else yrLeave();return;}if(st.screen==='racemenu'){go('home');return;}YR_BACK();};
render=function(){
 if(YR.initializing)return;
 const app=document.getElementById('app');
 if(st.screen==='racemenu'){app.innerHTML=yrMenuHTML();return;}
 if(YR.active){
  if(YR.phase==='playing'&&st.kDone){yrComplete();return;}
  if(YR.host||['waiting','closed','unavailable','lobby'].includes(YR.phase)){yrRenderRoom();return;}
  if(YR.paused){app.innerHTML=topBar('Mola',true)+'<div class="wrap"><h1>Mola</h1><p>Hazır olduğunda devam et.</p><button class="btn pri" onclick="yrPause()">Çalışmaya dön</button><button class="btn" onclick="yrLeave()">Odadan ayrıl</button></div>';return;}
 }
 YR_RENDER();
 if(st.screen==='home'){
  const list=app.querySelector('.list');if(list)list.insertAdjacentHTML('beforeend',menuButton('Birlikte Oynayalım','Baharat, mutfak araçları ve kuver için ayrı odalar.',"yrOpen()"));
 }
 if(YR.active){
  const wrap=app.querySelector('.wrap');if(wrap)wrap.insertAdjacentHTML('afterbegin','<section class="card race-bar"><strong>'+esc(YarisModel.taskLabel(YR.room))+'</strong><p>Birlikte Oynayalım</p>'+(YR.phase==='review'?'<button class="btn" onclick="back()">Oda sonuçlarına dön</button>':'<button class="btn" onclick="yrPause()">Mola ver</button><button class="btn" onclick="yrLeave()">Odadan ayrıl</button>')+'</section>');
  // Yarışta tamamlanmadan rapor/ipuçları açılmaz. Normal oyunlarda mevcut davranış korunur.
  if(YR.phase==='review')app.querySelectorAll('button[onclick]').forEach(b=>{if(/startBoard|startSession|newKuverBtn/.test(b.getAttribute('onclick')))b.remove();});
  if(YR.phase==='playing'){yrPersist();yrProgress();}yrFocusPhase();
 }
};
window.addEventListener('online',()=>{if(YR.active){YR.networkError=false;if(YR.phase==='waiting')yrSubmit();render();}});
window.addEventListener('offline',()=>{if(YR.active)render();});
document.addEventListener('visibilitychange',()=>{if(YR.active&&YR.phase==='playing')yrPersist();});
if(new URLSearchParams(location.search).has('oda')){st.screen='racemenu';render();}
