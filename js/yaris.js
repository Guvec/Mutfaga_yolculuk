/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Birlikte Oynayalım: öğrencilerin kendi kurduğu odalar.
   • Oyun Odası (2–8 kişi): herkes aynı soruları kendi hızında çözer, sıralama canlı görünür.
   • 1'e 1 Kapışma (2 kişi): aynı soru iki telefonda aynı anda çıkar; önce doğru basan puanı alır.
   Her soruda görsel/yazı gösterilir ve dört seçenekli soru sorulur. Can kaybı ve eleme yoktur.
   Sorular odadaki tohumdan (seed) üretilir; her telefonda aynıdır (js/yaris-model.js). */
'use strict';
const YR={notice:'',count:0,focusKey:'',codeDraft:'',active:false,code:null,room:null,players:[],host:false,nick:'',qs:[],unsubs:[],hb:null,cd:null,tm:null,seen:{},sig:{},started:false,ast:false,g:null,busy:false,error:'',cfg:{mode:'race',subject:'baharat',kind:'gorsel',scope:'konu',set:0,lim:20,n:10,code:''}};
let DU=null,yrTransport=null;
const YR_SCREENS=['raceinvite','racemenu','racecreate','racelobby','racecount','raceplay','raceover','dintro','dplay','dover'];
const YR_SUBJECTS=[{id:'baharat',name:'Baharatlar',sets:8},{id:'mutfak-araclari',name:'Mutfak Araçları',sets:12,text:true},{id:'bulasik-makinesi-temizligi',name:'Bulaşık Yıkama ve Atık Yönetimi',sets:1,text:true},{id:'kuver',name:'Kuver'}];
function yrConfigured(){return !!(window.YARIS_FIREBASE_CONFIG&&window.YARIS_FIREBASE_CONFIG.projectId&&window.YARIS_FIREBASE_CONFIG.apiKey);}
function yrService(){if(!yrTransport)yrTransport=new YarisFirebase(window.YARIS_FIREBASE_CONFIG);return yrTransport;}
function yrOn(){return YR.active&&YR.room;}
function yrDuel(){return !!(YR.room&&YR.room.mode==='duel');}
function yrMe(){return yrTransport&&yrTransport.uid;}
function yrWithTimeout(p,ms){let t;return Promise.race([p,new Promise((_,rej)=>{t=setTimeout(()=>rej(Error('Bağlantı tamamlanamadı. İnterneti kontrol edip yeniden dene.')),ms||15000);})]).finally(()=>clearTimeout(t));}
function yrErrText(e){const m=e&&e.message?String(e.message):'';if(/permission|insufficient|PERMISSION/i.test(m))return 'İzin yok: oda bulunamadı, dolu ya da oyun başlamış olabilir.';if(!m||/Firebase|firestore|auth\//i.test(m))return 'Odaya bağlanılamadı. İnterneti kontrol edip yeniden dene.';return m;}
function yrSetError(e){YR.error=typeof e==='string'?e:yrErrText(e);render();}
function yrGuestName(){let g='';try{g=sessionStorage.getItem('yr_misafir')||'';if(!g){g='👤 Misafir '+(100+crypto.getRandomValues(new Uint16Array(1))[0]%900);sessionStorage.setItem('yr_misafir',g);}}catch(e){}return g||'👤 Misafir';}
/* Oyun adı profilden gelir (hazır karakter adı); gerçek ad yazılmaz. */
function yrNickGet(){return st.prof&&!st.guest?YarisModel.cleanNick(st.prof):yrGuestName();}
function yrNickOk(){return yrNickGet();}
/* ---------- içerik ve soru yardımcıları ---------- */
function yrData(subject){return subject==='kuver'?{LEVELS,ITEMS,IMG,PLACE_LABEL}:CONTENT[subject];}
async function yrReady(subject){if(subject==='butun'){await Promise.all(YarisModel.SUBJECT_ORDER.map(yrReady));return;}if(subject==='kuver')return;for(let i=0;i<80;i++){if(CONTENT[subject])return;if(CONTENT[subject]===null)break;await new Promise(r=>setTimeout(r,100));}throw Error('Konu dosyası yüklenemedi. Sayfayı yenileyip yeniden dene.');}
function yrRev(subject){if(subject==='butun'){const t=YarisModel.SUBJECT_ORDER.map(yrRev).join('|');let h=0;for(const c of t)h=(Math.imul(h,31)+c.charCodeAt(0))|0;return 'scope2-'+(h>>>0);}if(subject==='kuver')return 'kuver-2';const d=CONTENT[subject]||{};return ('ready2-'+String(d.revision||'0')+'#'+((d.matches||[]).length)+'.'+((d.questions||[]).length)).slice(0,40);}
function yrBuild(room,match){
 if(room.mode==='arena'){if(room.av!==2)throw Error('Er Meydanı sürümü eski. Yeni bir oda kur.');return /^arena[34]-/.test(room.rev||'')?ArenaModel.buildSelected(yrAllData(),room.seed,YarisModel,room):ArenaModel.build(yrAllData(),room.seed,YarisModel);}
 /* Her rövanş önceki maçlardaki soruları sona bırakır; iki telefon aynı sırayı üretir. */
 let used=[],qs=[];
 for(let m=0;m<=(match||0);m++){qs=YarisModel.buildScoped(yrAllData(),room,YarisModel.seedFor(room.seed,m),used);used=used.concat(qs.map(q=>q.id));}
 return qs;
}
function yrAllData(){const d={...CONTENT};d.kuver={...yrData('kuver'),questions:(CONTENT.kuver&&CONTENT.kuver.questions)||[]};return d;}
function yrArenaSelected(c){return c.mode==='arena'&&(c.scope==='konu'||c.arenaTopic==='butun'||/^arena[345]-/.test(c.rev||''));}
function yrRoomRev(c){const selected=yrArenaSelected(c),subjects=c.mode==='arena'?(selected?ArenaModel.selectedSubjects(c,YarisModel):['mutfak-araclari','baharat']):c.scope==='butun'?YarisModel.SUBJECT_ORDER:[c.subject];let h=0;const parts=subjects.map(yrRev);if(selected)parts.push(c.scope,c.subject,String(c.n));for(const ch of parts.join('|'))h=(Math.imul(h,31)+ch.charCodeAt(0))|0;return (c.mode==='arena'?(selected?(c.rev&&/^arena[34]-/.test(c.rev)?c.rev.slice(0,7):'arena5-'):'arena2-'):'rooms2-')+(h>>>0);}
async function yrReadyRoom(c){if(c.mode==='arena'){await Promise.all((yrArenaSelected(c)?ArenaModel.selectedSubjects(c,YarisModel):['mutfak-araclari','baharat']).map(yrReady));return;}await yrReady(yrScopeSubject(c));}
function yrScopeSubject(c){return c.scope==='butun'?'butun':c.subject;}
function yrTitles(subject){const d=CONTENT[subject];return d&&d.setTitles;}
function yrLabel(room){return room.mode==='arena'&&!yrArenaSelected(room)?'Baharatlar ve Mutfak Araçları':YarisModel.taskLabel(room,yrTitles(room.subject));}
/* ---------- giriş ---------- */
/* Oyun adı yoksa kendiliğinden verilir ("Beğendin mi?" penceresi çıkar); profil varsa doğrudan girilir. */
function yrHasName(){return !!(st.prof&&!st.guest);}
async function yrNeedName(){
 if(yrHasName())return true;
 if(typeof profilDevamEt==='function'&&profilDevamEt())return true;
 if(typeof adAuto!=='function'||profiles().length>0)return false;
 try{await adAuto();}catch(e){}
 return yrHasName();
}
function yrOpen(){
 sesSus();YR.error='';
 if(!yrHasName()&&typeof profilDevamEt==='function')profilDevamEt();
 if(!yrHasName()){
  if(profiles().length>0){st.profileReturn='racemenu';go('profiles');return;}
  yrNeedName().then(ok=>{if(ok){st.screen='racemenu';render();window.scrollTo(0,0);}});return;
 }
 st.screen='racemenu';render();window.scrollTo(0,0);
}
function yrCreateOpen(mode){if(!yrNickOk())return;YR.cfg.mode=mode;if(mode!=='arena'&&YR.cfg.n>20)YR.cfg.n=10;if(mode==='arena')Object.assign(YR.cfg,{arenaTopic:'butun',subject:'mutfak-araclari',scope:'butun',kind:'gorsel',set:0,n:100,lim:20,av:2});YR.error='';st.screen='racecreate';render();window.scrollTo(0,0);}
function yrArenaTopic(topic){
 if(topic!=='butun'&&!YR_SUBJECTS.some(x=>x.id===topic))return;
 Object.assign(YR.cfg,{arenaTopic:topic,scope:topic==='ikili'||topic==='butun'?'butun':'konu',subject:topic==='ikili'||topic==='butun'?'mutfak-araclari':topic,kind:'gorsel',set:0,n:100,lim:20});render();
}
function yrCfg(k,v){YR.cfg[k]=v;if(k==='scope')YR.cfg.set=0;if(k==='subject'){const s=YR_SUBJECTS.find(x=>x.id===v);YR.cfg.kind=v==='kuver'?'kuver':'gorsel';YR.cfg.set=v==='kuver'?1:0;}render();}
function yrCfgKind(kind,set){YR.cfg.kind=kind;YR.cfg.set=set;render();}
async function yrCreate(){
 if(YR.busy)return;const nick=yrNickGet(),c=YR.cfg,raw=c.code,wanted=YarisModel.slug(raw);
 if(c.mode==='canavar'){cvStart(c);return;}
 if(String(raw||'').trim()&&!YarisModel.validCode(wanted)){YR.error='Oda kodu 3–10 harf ya da rakam olmalı.';render();return;}
 YR.busy=true;YR.error='';render();
 try{
  if(typeof frEnsure==='function')await Promise.race([frEnsure(),new Promise(r=>setTimeout(r,4000))]);
  await yrWithTimeout(yrReadyRoom(c),9000);
  const base={mode:c.mode,subject:c.subject,scope:c.scope||'tek',kind:c.kind,set:c.set,n:c.n||YarisModel.N_DEFAULT,lim:c.lim,seed:crypto.getRandomValues(new Uint32Array(1))[0],rev:yrRoomRev(c),hostNick:nick};
  if(c.mode==='arena')Object.assign(base,{av:2,roster:[],n:100,lim:20,kind:'gorsel',set:0});
  const qs=c.mode==='arena'?yrBuild(base,0):YarisModel.buildScoped(yrAllData(),{...base,n:base.n},base.seed);
  if(c.mode!=='arena'&&qs.length!==base.n)throw Error('Bu seçimde '+base.n+' soru yok ('+qs.length+' soru var). Başka kapsam veya maç uzunluğu seç.');
  base.n=qs.length;if(c.mode==='arena')base.rev=yrRoomRev(base);
  const made=await yrWithTimeout(yrService().create(base,wanted||''));
  await yrEnter(made.code,made.room);
 }catch(e){YR.error=yrErrText(e);}finally{YR.busy=false;render();}
}
async function yrJoin(code,invite){
 if(YR.busy)return false;
 const input=document.getElementById('yrCode'),requested=YarisModel.slug(code!==undefined?code:(input?input.value:YR.codeDraft));
 YR.codeDraft=requested;
 if(!yrHasName()){const e0=document.getElementById('yrCode');if(e0)YR.codeDraft=YarisModel.slug(e0.value);const ok=await yrNeedName();if(!ok){st.profileReturn='racemenu';go('profiles');return;}st.screen='racemenu';render();}
 const nick=yrNickOk();if(!nick)return;
 const c=requested;
 YR.codeDraft=c;
 if(!YarisModel.validCode(c)){YR.error='Oda kodunu yaz.';render();return;}
 YR.busy=true;YR.error='';render();
 try{
  if(typeof frEnsure==='function')await Promise.race([frEnsure(),new Promise(r=>setTimeout(r,4000))]);
  YR.ready=false;const pd={...yrPlayerBase(nick,0),loaded:false};
  /* Önce odayı oku ve sürümü denetle: uyumsuz telefon kapışmada yer almaz, listeye girmez. */
  const seen=await yrWithTimeout(yrService().peek(c));
  if(!seen)throw Error('Oda bulunamadı. Kodu kontrol et.');
  await yrReadyRoom(seen);
  if(seen.mode==='arena'&&seen.av===2)pd.left=false;else delete pd.left;
  if(seen.rev!==yrRoomRev(seen))throw Error('Oda sürümü farklı. Tüm telefonları güncelleyin ve yeni bir oda kurun.');
  if(!yrInviteLive(invite))return false;
  const svc=yrService(),room=await yrWithTimeout(svc.join(c,nick,pd,seen.created));
  const entered=yrInviteLive(invite)&&await yrEnter(c,room,invite);
  if(!entered){if(room.status==='lobby')await svc.leave(c,true,false).catch(()=>{});return false;}
  if(invite)invite.entered=true;return true;
 }catch(e){if(yrInviteLive(invite))YR.error=yrErrText(e);return false;}finally{YR.busy=false;if(yrInviteLive(invite))render();}
}
function yrWithPid(pd){if(typeof FR!=='undefined'&&FR.ready&&FR.pid&&st.prof&&!st.guest)pd.pid=FR.pid;return pd;}
function yrPlayerBase(nick,rid){return yrWithPid({...(YR.room&&YR.room.av===2?{left:false}:{}),ready:!!YR.ready,loaded:true,nick,score:0,ok:0,bad:0,n:0,tt:0,done:false,ts:Date.now(),rid,m:0,r:[],pr:[]});}
async function yrEnter(code,room,invite){
 await yrPreload(yrBuild(room,0));if(!yrInviteLive(invite))return false;yrReset();YR.active=true;YR.code=code;YR.room=room;YR.nick=yrNickGet();YR.host=room.host===yrMe();YR.started=false;
 YR.resumePlayer=null;
 if(room.status==='playing'&&room.mode==='arena'&&room.av===2){YR.resumePlayer=await yrService().getPlayer(code);if(!YR.resumePlayer)throw Error('Bu oyunda kayıtlı katılımcı değilsin.');}
 else await yrService().setPlayer(code,yrPlayerBase(YR.nick,room.created));
 if(!yrInviteLive(invite)){yrReset();return false;}
 YR.unsubs=yrService().watch(code,yrRoomChanged,yrPlayersChanged,e=>{if(YR.active)yrSetError(e);});
 YR.hb=setInterval(yrBeat,duelOr(8000,10000));st.screen='racelobby';render();
 if(typeof frInvSend==='function')frInvSend();if(typeof sesSecimiSor==='function')sesSecimiSor();return true;
}
function duelOr(a,b){return yrDuel()?a:b;}
function yrReset(){
 YR.unsubs.forEach(f=>{try{f();}catch(e){}});YR.unsubs=[];if(YR.hb)clearInterval(YR.hb);if(YR.cd)clearInterval(YR.cd);if(YR.tm)clearInterval(YR.tm);
 if(DU&&DU.to){clearTimeout(DU.to);}if(DU&&DU.fto)clearTimeout(DU.fto);YR.hb=YR.cd=YR.tm=null;YR.warn='';YR.pend=null;YR.writer=null;YR.resumePlayer=null;YR.active=false;YR.code=null;YR.room=null;YR.players=[];YR.qs=[];YR.seen={};YR.sig={};YR.started=false;YR.ast=false;YR.ready=false;YR.g=null;DU=null;if(typeof AR!=='undefined'&&AR&&AR.to)clearTimeout(AR.to);if(typeof AR!=='undefined'&&AR&&AR.fto)clearTimeout(AR.fto);if(typeof AR!=='undefined')AR=null;YR.error='';
}
/* ---------- oda ve oyuncu bildirimleri ---------- */
function yrRoomChanged(room){
 if(!YR.active)return;
 if(!room){yrReset();YR.error='Oda kapatıldı.';st.screen='racemenu';render();return;}
 YR.room=room;
 if(room.status==='playing'&&!YR.started){YR.started=true;yrStartGame();return;}
 if(st.screen==='racelobby')render();
}
function yrPlayersChanged(list){
 if(!YR.active||!YR.room)return;const now=Date.now(),out=[];
 list.forEach(p=>{if(p.rid===YR.room.created){out.push(p);const sg=p.ts+'|'+p.n+'|'+p.ok+'|'+p.done+'|'+(p.m||0)+'|'+((p.r||[]).length);if(YR.sig[p.uid]!==sg){YR.sig[p.uid]=sg;YR.seen[p.uid]=now;}}});
 YR.players=out;
 if(st.screen==='racelobby'){
  if(yrDuel()&&YR.host&&out.length===2&&out.every(p=>p.ready&&p.loaded)&&!YR.ast&&YR.room.status==='lobby'){YR.ast=true;yrService().start(YR.code).catch(()=>{YR.ast=false;});}
  render();return;
 }
 if(st.screen==='raceplay')yrRankUi();else if(st.screen==='raceover')render();
 if(DU)duSync();
 if(typeof AR!=='undefined'&&AR)arSync();
}
function yrLost(p){return !!(p&&!p.done&&p.uid!==yrMe()&&YR.seen[p.uid]&&Date.now()-YR.seen[p.uid]>30000);}
function yrBeat(){
 if(!YR.active||!YR.room)return;
 /* Oyun bitmişken yazılamayan son sonuç, bağlantı gelince yeniden gönderilir. */
 if(YR.pend&&((DU&&DU.over)||(YR.g&&YR.g.done)||(typeof AR!=='undefined'&&AR&&AR.over))){if(YR.writer)yrDrain(YR.writer);else yrSend(YR.pend);if(st.screen==='raceover')render();return;}
 if(DU&&!DU.over)duWrite();
 else if(YR.g&&!YR.g.done)yrRaceWrite(false);
 else if(YR.room.status==='lobby'&&!DU&&!YR.g&&!(typeof AR!=='undefined'&&AR))yrService().setPlayer(YR.code,yrPlayerBase(YR.nick,YR.room.created)).catch(()=>{});
 if(DU)duBeat();
 if((DU&&DU.ph==='wait'||typeof AR!=='undefined'&&AR&&AR.ph==='wait')&&YR.players.some(yrLost))render();
 if(typeof AR!=='undefined'&&AR){if(!AR.over)arWrite();arBeat();}
 if(st.screen==='raceover')render();
}
function yrSetReady(){if(!YR.room||YR.room.status!=='lobby')return;YR.ready=true;yrService().setPlayer(YR.code,yrPlayerBase(YR.nick,YR.room.created)).catch(yrSetError);render();}
/* Başlat düğmesi kapalıysa nedeni yazılır; boş dönerse başlatılabilir. */
function yrStartNeden(){
 const L=YarisModel.LIMITS[YR.room.mode],n=YR.players.length;
 if(n<L.min)return 'En az '+(L.min===2?'iki':'üç')+' kişi gerekir. Şu an '+n+' kişi var. Arkadaşların odaya girince düğme açılır.';
 const y=YR.players.filter(p=>!p.loaded);
 if(y.length)return y.map(p=>p.nick).join(', ')+' için sorular yükleniyor. Birkaç saniye bekle, düğme kendiliğinden açılır.';
 return '';
}
function yrStart(){if(!YR.host||yrDuel()||YR.players.length<YarisModel.LIMITS[YR.room.mode].min||YR.players.some(p=>!p.loaded)||YR.room.status!=='lobby')return;yrService().start(YR.code).catch(e=>yrSetError(e));}
function yrLink(){return location.origin+location.pathname+'?oda='+encodeURIComponent(YR.code||'');}
async function yrCopy(){let ok=false;try{await navigator.clipboard.writeText(yrLink());ok=true;}catch(e){}YR.notice=ok?'Bağlantı kopyalandı.':'Bağlantıyı kutudan seçip kopyalayabilirsin.';render();}
function yrShare(){if(navigator.share)navigator.share({title:'Birlikte Oynayalım',text:'Oyuna katıl! Oda kodu: '+YR.code,url:yrLink()}).catch(e=>{if(!e||e.name!=='AbortError')yrCopy();});else yrCopy();}
/* ---------- çıkış ---------- */
function yrLeaveNow(target){
 yrInviteClear();
 const code=YR.code,svc=yrTransport,lobby=YR.room&&YR.room.status==='lobby',host=YR.host;
 if(svc&&code&&YR.room){
  if(lobby)svc.leave(code,true,host).catch(()=>{});
  else if(DU&&!DU.over){DU.quit=true;duWrite();}
  else if(typeof AR!=='undefined'&&AR&&!AR.over){arEnd(true);}
  else if(YR.g&&!YR.g.done){YR.g.done=true;yrRaceWrite(true);}
 }
 yrReset();YR.notice='';st.screen=target==='home'?'home':'racemenu';render();window.scrollTo(0,0);
}
function yrLeave(target){
 if(!YR.active){go('home');return;}
 const playing=YR.room&&YR.room.status==='playing'&&!(YR.g&&YR.g.done)&&!(DU&&DU.over)&&!(typeof AR!=='undefined'&&AR&&AR.over);
 if(playing){modal('Oyundan çıkarsan oyun senin için biter. Çıkmak istiyor musun?',()=>{closeModal();yrLeaveNow(target);});return;}
 yrLeaveNow(target);
}
/* ---------- oyun başlangıcı ---------- */
async function yrPreload(qs){const urls=[...new Set(qs.flatMap(q=>[q.image,...q.choices.map(c=>c.image)]).filter(Boolean))];await Promise.all(urls.map(src=>new Promise((resolve,reject)=>{const im=new Image();const t=setTimeout(()=>reject(Error('Soru görselleri yüklenemedi. Bağlantını kontrol edip yeniden dene.')),15000);im.onload=()=>{clearTimeout(t);resolve();};im.onerror=()=>{clearTimeout(t);reject(Error('Soru görseli yüklenemedi: '+src));};im.src=src;})));}
function yrStartGame(){
 sesSus();YR.leaderRows=null;YR.qs=yrBuild(YR.room,0);
 if(yrDuel()){duStart(0);return;}
 if(YR.room.mode==='arena'){arStart();return;}
 st.screen='racecount';YR.count=3;render();
 YR.cd=setInterval(()=>{YR.count--;if(YR.count<=0){clearInterval(YR.cd);YR.cd=null;yrRaceBegin();return;}if(st.screen==='racecount')render();},1000);
}
/* ====================== OYUN ODASI ====================== */
function yrRaceBegin(){
 YR.g={k:0,ph:'q',pick:null,ok:0,bad:0,tt:0,done:false,t0:performance.now(),log:[]};
 st.screen='raceplay';render();yrQTimer();yrRaceWrite(false);
}
function yrQTimer(){if(YR.tm)clearInterval(YR.tm);YR.tm=setInterval(yrTick,100);}
function yrTick(){
 const g=YR.g;if(!g||g.ph!=='q'||st.screen!=='raceplay'){return;}
 const lim=YR.room.lim*1000,el=performance.now()-g.t0,left=Math.max(0,lim-el),f=document.getElementById('yrFill'),t=document.getElementById('yrSec');
 if(f){f.style.width=(left/lim*100)+'%';f.className='yr-fill'+(left<lim*.25?' low':'');}
 if(t)t.textContent=Math.ceil(left/1000)+' sn';efektSaniye(left);
 if(el>=lim)yrRaceAnswer(-1);
}
function yrRaceAnswer(i){
 const g=YR.g;if(!g||g.ph!=='q')return;
 const q=YR.qs[g.k],raw=performance.now()-g.t0,ms=Math.min(Math.round(raw),YR.room.lim*1000);
 if(raw>YR.room.lim*1000)i=-1;/* süre dolduktan sonra gelen tıklama sayılmaz */
 g.ph='fb';g.pick=i;g.ms=ms;g.right=i>=0&&q.choices[i].id===q.correct;g.hizli=hizliTebrik(g,g.right,ms);
 (g.log=g.log||[]).push({ok:g.right,ms,pick:i,reason:i<0?'Süre doldu':''});
 if(typeof EFEKT!=='undefined')EFEKT.cal(g.right?'dogru':i<0?'tirr':'yanlis');
 if(g.right)g.ok++;else g.bad++;g.tt+=ms;
 if(YR.tm){clearInterval(YR.tm);YR.tm=null;}
 yrRaceWrite(false);render();
}
function yrRaceNext(){
 const g=YR.g;if(!g||g.ph!=='fb')return;
 if(g.k+1>=YR.qs.length){g.done=true;g.ph='done';rutbeComplete({id:'oda-'+YR.room.created,table:['oda',YR.room.subject,YR.room.scope,YR.room.kind,YR.room.set,YR.room.n].join('|'),correct:g.ok,total:YR.qs.length,scope:YR.room.scope});yrRaceWrite(true);if(typeof oduKazan==='function')oduKazan('oda',null,{ok:g.ok,total:YR.qs.length});g.rapor=sonucUret('Oyun Odası',yrLabel(YR.room),['oda',YR.room.subject,YR.room.kind,YR.room.set,YR.room.n].join('|'),g.log,'');sonucSes(g.rapor,true);st.screen='raceover';render();window.scrollTo(0,0);return;}
 g.k++;g.ph='q';g.pick=null;g.t0=performance.now();render();yrQTimer();
}
/* Yazma hatası sessizce yutulmaz: öğrenciye kısa uyarı çıkar, yazma düzelince kalkar. */
function yrSend(pd){
 pd=yrWithPid({...pd,r:Array.isArray(pd.r)?pd.r.slice():[],pr:Array.isArray(pd.pr)?pd.pr.slice():[]});const code=YR.code,rid=YR.room&&YR.room.created;
 let w=YR.writer;if(!w||w.code!==code||w.rid!==rid){w={code,rid,svc:yrService(),items:[],running:false};YR.writer=w;}
 const last=w.items[w.items.length-1];
 if(!last||JSON.stringify({...last,ts:0})!==JSON.stringify({...pd,ts:0}))w.items.push(pd);
 YR.pend=pd;return yrDrain(w);
}
function yrDrain(w){
 if(w.running)return w.promise;
 if(w.retired)return Promise.resolve(true);
 w.running=true;
 const current=()=>!w.retired&&YR.active&&YR.code===w.code&&YR.room&&YR.room.created===w.rid&&YR.writer===w;
 w.promise=(async()=>{while(w.items.length){const pd={...w.items[0],ts:Date.now()};
  try{await w.svc.setPlayer(w.code,pd);if(w.retired)return true;w.items.shift();}
  catch(e){if(current()){YR.warn='Bağlantı sorunu: sonuçlar sırayla yeniden gönderilecek.';render();}return false;}
 }
 if(current()){YR.pend=null;if(YR.warn){YR.warn='';render();}}return true;
 })().finally(()=>{w.running=false;});return w.promise;
}
function yrRaceWrite(done){
 const g=YR.g;if(!g||!yrTransport||!YR.room)return;
 const n=g.ph==='fb'||g.ph==='done'?g.k+1:g.k;
 yrSend({nick:YR.nick,score:g.ok,ok:g.ok,bad:g.bad,n:Math.min(n,60),tt:Math.round(g.tt),done:!!done,ts:Date.now(),rid:YR.room.created,m:0,r:[],pr:[]});
}
function yrAllPlayers(){
 const me=yrMe(),g=YR.g;
 return YR.players.map(p=>p.uid===me&&g?{...p,nick:YR.nick,ok:g.ok,n:g.ph==='fb'||g.ph==='done'?g.k+1:g.k,done:g.done}:p);
}
function yrAllDone(){return YR.players.length>0&&YR.players.every(p=>p.done&&p.pending===false&&p.fromCache===false);}
function yrRankUi(){
 const e=document.getElementById('yrRank');if(e)e.innerHTML=yrRankHTML(true);
}
function yrRankHTML(compact){
 const r=YarisModel.ranks(yrAllPlayers()),me=yrMe(),total=YR.qs.length;
 const rows=compact?r.filter((p,i)=>i<3||p.uid===me):r;
 return rows.map(p=>'<li class="yr-row'+(p.uid===me?' me':'')+'"><span class="yr-rk">'+p.rank+'.</span><span class="yr-nm">'+esc(p.nick)+(p.uid===me?' (Sen)':'')+'</span><span class="yr-sc">'+p.ok+' doğru · '+(p.done?'🏁':(yrLost(p)?'📶 koptu':(p.n|0)+'/'+total))+'</span></li>').join('');
}
/* ====================== 1'e 1 KAPIŞMA ====================== */
function duOpp(){const me=yrMe();return YR.players.find(p=>p.uid!==me)||null;}
function duOppR(){
 const o=duOpp();if(!o||!DU)return null;const m=o.m|0;
 if(m===DU.m)return o.r||[];if(m===DU.m+1)return o.pr||[];return null;
}
function duNew(m){
 const o=duOpp(),prev=DU&&DU.m===m-1?DU.myR:[];
 YR.qs=yrBuild(YR.room,m);
 DU={m,k:-1,total:YR.qs.length,myR:[],prevR:prev,ph:'intro',t0:0,sc:[0,0],over:false,left:false,want:false,go2:false,quit:false,onick:o?o.nick:'Rakip',oid:o?o.uid:null,to:null,lim:YR.room.lim*1000,iAmHost:YR.host,res:null};
}
function duStart(m){
 if(YR.tm){clearInterval(YR.tm);YR.tm=null;}if(DU&&DU.to)clearTimeout(DU.to);
 duNew(m);rkCountLeaders(YR.room);st.screen='dintro';YR.count=3;render();
 if(YR.cd)clearInterval(YR.cd);
 YR.cd=setInterval(()=>{YR.count--;if(YR.count<=0){clearInterval(YR.cd);YR.cd=null;if(st.screen==='dintro'&&DU)duRound(0);return;}if(st.screen==='dintro')render();},1000);
 duWrite();
}
function duWrite(){
 if(!DU||!yrTransport||!YR.room)return;
 yrSend({nick:YR.nick,score:DU.sc[0],ok:DU.sc[0],bad:DU.sc[1],n:DU.myR.length,tt:0,done:!!DU.quit,ts:Date.now(),rid:YR.room.created,m:DU.want?DU.m+1:DU.m,r:DU.want?[]:DU.myR,pr:DU.want?DU.myR:DU.prevR});
}
function duBeat(){
 if(!DU||DU.over||DU.left)return;
 const o=duOpp(),seen=o&&YR.seen[o.uid];
 if(DU.k>=0&&(!o||o.done||(seen&&Date.now()-seen>45000)))duLeft(!!(o&&o.done));
}
function duRound(k){
 if(!DU||DU.over)return;
 DU.k=k;yrMilestone(k,DU.total);DU.ph='q';DU.t0=performance.now();DU.res=null;
 st.screen='dplay';render();
 if(YR.tm)clearInterval(YR.tm);YR.tm=setInterval(duTick,60);
}
function duTick(){
 if(!DU||DU.ph!=='q'||st.screen!=='dplay')return;
 const el=performance.now()-DU.t0,left=Math.max(0,DU.lim-el),f=document.getElementById('yrFill'),t=document.getElementById('yrSec'),ob=duOppR(),ot=ob?ob[DU.k]:undefined;
 if(f){f.style.width=(left/DU.lim*100)+'%';f.className='yr-fill'+(left<DU.lim*.25?' low':'');}
 if(t)t.textContent=Math.ceil(left/1000)+' sn';efektSaniye(left);
 if(ot>0&&el>=ot){duMine(-Math.max(1,Math.round(el)),'late');return;}
 if(el>=DU.lim)duMine(-DU.lim,'time');
}
function duAns(i){
 if(!DU||DU.ph!=='q')return;
 const q=YR.qs[DU.k],ms=Math.max(1,Math.round(performance.now()-DU.t0));
 if(ms>DU.lim){duMine(-DU.lim,'time');return;}/* süre dolduktan sonra gelen tıklama sayılmaz */
 const ok=q.choices[i].id===q.correct,ob=duOppR(),ot=ob?ob[DU.k]:undefined;
 DU.pick=i;
 duMine(ok?ms:-ms,ok?'ok':'bad');
}
/* Eksik yanıt yerel olarak yanlış sayılmaz; iki paylaşılan yanıtla hesaplanır. */
function duTheirs(){return (duOppR()||[]).slice();}
function duMine(v,why){
 if(!DU||DU.ph!=='q')return;
 if(why==='time'&&typeof EFEKT!=='undefined')EFEKT.cal('tirr');
 (DU.reviewResponses=DU.reviewResponses||[])[DU.k]={ok:v>0,pick:why==='bad'?DU.pick:null,skip:why==='late',reason:why==='time'?'Süre doldu':''};
 DU.ph='wait';DU.why=why;DU.hizli=hizliTebrik(DU,v>0,Math.abs(v));if(YR.tm){clearInterval(YR.tm);YR.tm=null;}
 DU.myR[DU.k]=Math.round(v);duWrite();render();duSync();
}
function duSync(){
 if(!DU)return;
 {const o0=duOpp();if(o0){DU.onick=o0.nick;DU.oid=o0.uid;}}
 if(!DU.over&&!DU.left&&DU.k>=0){const o=duOpp();if(o&&o.done){duLeft(true);return;}}
 if(DU.ph==='wait'){const ob=duOppR();if(ob&&ob[DU.k]!==undefined&&ob[DU.k]!==null)duResolve();}
 if(DU.over&&st.screen==='dover')duOverSync();
}
function duResolve(){
 if(DU.fto){clearTimeout(DU.fto);DU.fto=null;}
 const k=DU.k,a=DU.myR[k],ob=duTheirs(),b=ob[k],w=YarisModel.duWho(a,b,DU.iAmHost);
 DU.ph='res';DU.w=w;if(w===1&&typeof EFEKT!=='undefined')EFEKT.cal('tur');DU.sc=YarisModel.duScore(DU.myR,ob,DU.iAmHost);DU.at=a;DU.bt=b;
 render();
 const done=YarisModel.duDecided(DU.sc,k+1,DU.total);
 DU.to=setTimeout(()=>{if(!DU||DU.over)return;if(done)duEnd();else if(st.screen==='dplay')duRound(k+1);},done?2200:2600);
}
function duEnd(){
 if(!DU||DU.over)return;DU.over=true;DU.ph='over';if(DU.to){clearTimeout(DU.to);DU.to=null;}if(DU.fto){clearTimeout(DU.fto);DU.fto=null;}if(YR.tm){clearInterval(YR.tm);YR.tm=null;}
 DU.result=DU.left?(DU.forfeit?'win':'left'):YarisModel.duResult(DU.sc);
 /* Maç sonu: kısa ses efekti ve (sesli okuma açıksa) sonuç cümlesi. */
 DU.rapor=sonucUret('1’e 1 Kapışma',yrLabel(YR.room),['kapisma',YR.room.subject,YR.room.kind,YR.room.set,YR.room.n].join('|'),DU.myR.filter(v=>v!==undefined&&v!==null).map(v=>({ok:v>0,ms:Math.abs(v)})),{win:DU.forfeit?'Rakip oyundan çıktı':'Kazandın!',lose:'Bu maçı kaybettin',draw:'Berabere',left:'Rakip ayrıldı'}[DU.result]||'');
 if(typeof EFEKT!=='undefined'){const es={win:'win',lose:'kayip',draw:'bera'}[DU.result];if(DU.result==='win'&&DU.rapor.durum==='yeni')EFEKT.cal('rekor');else if(es)EFEKT.cal(es);}
 if(typeof sesSoyle==='function'){const sm={win:DU.forfeit?'Rakip oyundan çıktı. Maçı sen kazandın.':'Kazandın! Tebrikler.',lose:'İyi mücadele! Rövanşta sen kazanabilirsin.',draw:'Berabere! İkiniz de iyi oynadınız.',left:'Rakip ayrıldı. Bu maçın sonucu sayılmadı.'}[DU.result];if(sm)sesSoyle(sm);}
 rutbeMatch('kapisma',DU);if(!DU.left)rkSettingSubmit(YR.room,DU.result==='win'?1:0);duWrite();if(DU.result==='win'&&typeof rkWinAdd==='function')rkWinAdd('oy-kapisma',1);st.screen='dover';render();window.scrollTo(0,0);
}
/* Rakip oyundan bilerek çıktıysa (quit) maçı sen kazanırsın; bağlantısı koptuysa sonuç sayılmaz. */
function duLeft(quit){if(!DU||DU.over)return;DU.left=true;DU.forfeit=!!quit;duEnd();}
async function duRematch(){if(!DU||!DU.over||DU.want||DU.left)return;const d=DU;try{await yrPreload(yrBuild(YR.room,DU.m+1));}catch(e){yrSetError(e);return;}if(DU!==d||!YR.active)return;DU.want=true;duWrite();render();duOverSync();}
function duOverSync(){
 if(!DU||!DU.want||DU.go2)return;const o=duOpp();
 if(o&&!o.done&&(o.m|0)===DU.m+1){DU.go2=true;const nm=DU.m+1;duStart(nm);}
}
/* ====================== EKRANLAR ====================== */
function yrTop(title){return topBar(title);}
function yrWarnHTML(){return YR.warn?'<p class="yr-err" role="status">'+esc(YR.warn)+'</p>':'';}
/* Yanlış cevapta: doğru kart ile seçilen kart yan yana (görsel, ad, kartın kendi açıklaması). */
function yrCompareHTML(q,pick){
 if(!(pick>=0)||!q||!q.subject)return '';
 const pc=q.choices[pick],cc=q.choices.find(c=>c.id===q.correct),d=yrAllData()[q.subject];
 if(!pc||!cc||pc.id===cc.id||!d||!d.matches)return '';
 const card=t=>d.matches.find(x=>x.answer===t&&x.image);
 const a=card(cc.text),b=card(pc.text);
 if(!a||!b)return '';
 const fig=(c,label)=>'<figure><img src="'+esc(c.image)+'" alt="'+esc(c.imageAlt||c.answer)+'"><figcaption><small>'+label+'</small><b>'+esc(c.answer)+'</b>'+(c.explanation?'<span>'+esc(c.explanation)+'</span>':'')+'</figcaption></figure>';
 return '<div class="yr-vs" aria-label="Karşılaştırma">'+fig(a,'Doğru cevap')+fig(b,'Seçtiğin')+'</div>';
}
function yrExplanationHTML(q){return q.explanation?'<details class="yr-explain"><summary>Neden?</summary><p>'+esc(q.explanation)+'</p></details>':'';}
function yrErr(){return (YR.error?'<p class="yr-err" role="alert">'+esc(YR.error)+'</p>':'')+(!navigator.onLine?'<p class="sub" role="status">İnternet bağlantısı yok.</p>':'');}
function yrChoicesHTML(q,onclick,state){
 const long=q.choices.some(c=>(c.text||'').length>26);
 return '<div class="yr-opts'+(long?' long':'')+'">'+q.choices.map((c,i)=>{let cls='yr-opt';
  if(state){if(c.id===q.correct)cls+=' ok';else if(state.pick===i)cls+=' bad';}
  return '<button type="button" class="'+cls+'" onclick="'+onclick+'('+i+')"'+(state?' disabled':'')+'><span class="yr-let">'+c.id+'</span>'+(c.image?'<img class="yr-cimg" src="'+esc(c.image)+'" alt="'+esc(c.alt||('Seçenek '+c.id))+'">':'')+(c.text?'<span>'+esc(c.text)+'</span>':'')+'</button>';}).join('')+'</div></div>';
}
function yrSpeakText(q){return q.prompt+(q.comparisonPosition?' Üçgen '+q.comparisonPosition+'. aracı gösteriyor.':'')+' '+q.choices.filter(c=>c.text).map(c=>c.id+'. '+c.text+'.').join(' ');}
function yrQuestionHTML(q){return '<div class="yr-qa"><div class="yr-qside">'+(q.image?'<img class="yr-img" src="'+esc(q.image)+'" alt="'+esc(q.imageAlt||'Soru görseli')+'">':'')+'<div class="yr-qrow"><h2 class="yr-q">'+mcqPromptHTML(q)+'</h2>'+(typeof sesDugme==='function'?sesDugme(yrSpeakText(q),'Soruyu ve seçenekleri dinle'):'')+'</div></div>';}
function yrMenuHTML(){
 const code=YR.codeDraft||new URLSearchParams(location.search).get('oda')||'',cfg=yrConfigured();
 return yrTop('Birlikte Oynayalım')+'<div class="wrap"><h1>Birlikte Oynayalım</h1><p class="sub">Arkadaşınla ya da sınıfla aynı sorulara birlikte cevap ver. Meydan Okuma dışındaki oyunlar için internet gerekir.</p>'+(!cfg?'<p class="card" role="status">Oda bağlantısı henüz ayarlanmadı. Bireysel oyunları kullanabilirsin.</p>':'')+
  (yrHasName()?'<p class="card" id="yrNick">Oyundaki adın: <b>'+esc(yrNickGet())+'</b></p>':'<p class="card" id="yrNick">Odaya girerken sana bir oyun adı verilecek.</p>')+
  '<button class="btn pri" onclick="yrCreateOpen(\'duel\')"'+(cfg?'':' disabled')+'>1’e 1 Kapışma Kur<span class="yr-sm">İki kişi aynı soruya aynı anda bakar. Önce doğru basan puanı alır.</span></button>'+
  '<button class="btn pri" onclick="yrCreateOpen(\'arena\')"'+(cfg?'':' disabled')+'>Er Meydanı Kur<span class="yr-sm">3–10 kişi kendi hızında ilerler. En çok 100 soru, 12 yanlışta bitiş.</span></button>'+
  '<button class="btn" onclick="yrCreateOpen(\'canavar\')">Meydan Okuma<span class="yr-sm">Kendi hızında çalış, hakların bitmeden hedefe ulaş. İnternet gerekmez.</span></button>'+
  '<button class="btn ghost" onclick="rkOpenBoard(\'oy-kapisma\')">🏅 Kapışma ve Er Meydanı sıralaması</button>'+
  (code?'<div class="yr-sep"></div><input id="yrCode" type="hidden" value="'+esc(code.toUpperCase())+'"><button class="btn pri" onclick="yrJoin()"'+(cfg&&!YR.busy?'':' disabled')+'>Davet edildiğin odaya gir</button>':'')+yrErr()+'</div>';
}
function yrCreateHTML(){
 const c=YR.cfg,s=YR_SUBJECTS.find(x=>x.id===c.subject),d=CONTENT[c.subject],titles=d&&d.setTitles||{};
 if(c.mode==='arena')return yrTop('Er Meydanı Kur')+'<div class="wrap"><h1>Er Meydanı</h1>'+arLeadersHTML()+'<h2>Konu</h2><div class="yr-chips">'+[{id:'butun',name:'Tüm konular'},...YR_SUBJECTS].map(x=>'<button type="button" class="yr-chip'+((c.arenaTopic||'butun')===x.id?' on':'')+'" aria-pressed="'+((c.arenaTopic||'butun')===x.id)+'" onclick="yrArenaTopic(\''+x.id+'\')"'+(YR.busy?' disabled':'')+'>'+esc(x.name)+'</button>').join('')+'</div><p>En çok 75 farklı soru · 3–10 kişi. Seçilen konunun havuzu daha küçükse tüm soruları kullanır.</p><p>Herkes kendi hızında ilerler. Yedi yanlışta denemen biter.</p><p>Süre 20 saniyeyle başlar; her 6 doğru cevapta 1 saniye azalır, en az 7 saniye olur.</p><button class="btn pri" onclick="yrCreate()"'+(YR.busy?' disabled':'')+'>Odayı kur</button>'+yrErr()+'</div>';
 let h=yrTop({duel:'1’e 1 Kapışma Kur',arena:'Er Meydanı Kur',canavar:'Meydan Okuma'}[c.mode]||'Oyun Odası Kur')+'<div class="wrap"><h2>Konu</h2><div class="yr-chips">'+YR_SUBJECTS.map(x=>'<button class="yr-chip'+(c.subject===x.id?' on':'')+'" onclick="yrCfg(\'subject\',\''+x.id+'\')">'+esc(x.name)+'</button>').join('')+'</div>';
 h+='<h2>Kapsam</h2><div class="yr-chips">'+[['tek','Tek konu'],['konu','Konu içinde karışık'],['butun','Bütün konular']].map(x=>'<button class="yr-chip'+(c.scope===x[0]?' on':'')+'" onclick="yrCfg(\'scope\',\''+x[0]+'\')">'+x[1]+'</button>').join('')+'</div>';
 if(c.subject==='kuver')h+='<h2>Kuver türü</h2><div class="yr-chips"><button class="yr-chip'+(c.set===1?' on':'')+'" onclick="yrCfgKind(\'kuver\',1)">Basit Kuver</button><button class="yr-chip'+(c.set===3?' on':'')+'" onclick="yrCfgKind(\'kuver\',3)">Tabldot Kuver</button><button class="yr-chip'+(c.kind==='bilgi'?' on':'')+'" onclick="yrCfgKind(\'bilgi\',0)">Bilgi soruları</button></div>';
 else{
  h+='<h2>Sorular</h2><div class="yr-chips">';
  h+='<button class="yr-chip'+(c.kind==='gorsel'&&c.set===0?' on':'')+'" onclick="yrCfgKind(\'gorsel\',0)">'+'Görsel sorular<small>Tüm takımlardan karışık</small>'+'</button>';
  if(s.text)h+='<button class="yr-chip'+(c.kind==='bilgi'?' on':'')+'" onclick="yrCfgKind(\'bilgi\',0)">Bilgi soruları</button>';
  h+='</div>';
 }
 h+='<h2>Maç uzunluğu</h2><div class="yr-chips">'+YarisModel.MATCH_CHOICES.map(x=>'<button class="yr-chip'+(c.n===x.n?' on':'')+'" onclick="yrCfg(\'n\','+x.n+')">'+x.name+'<small>'+x.note+'</small></button>').join('')+'</div>';
 if(c.mode!=='canavar')h+='<h2>Her soru için süre</h2><div class="yr-chips">'+YarisModel.SEC_CHOICES.map(x=>'<button class="yr-chip'+(c.lim===x?' on':'')+'" onclick="yrCfg(\'lim\','+x+')">'+x+' sn</button>').join('')+'</div>';
 h+='<button class="btn pri" onclick="yrCreate()"'+(YR.busy?' disabled':'')+'>'+(c.mode==='canavar'?'Başla':YR.busy?'Oda kuruluyor…':'Odayı kur')+'</button>'+yrErr()+'</div>';
 return h;
}
function yrPlayersListHTML(){
 return YR.players.slice().sort((a,b)=>(b.uid===YR.room.host)-(a.uid===YR.room.host)||String(a.nick).localeCompare(String(b.nick),'tr')).map(p=>'<li class="yr-row'+(p.uid===yrMe()?' me':'')+'"><span class="yr-nm">'+(p.uid===YR.room.host?'Kurucu · ':'')+esc(p.nick)+(p.uid===yrMe()?' (Sen)':'')+'</span><span class="yr-sc">'+(p.ready?'Hazır':'Bekliyor')+'</span>'+(yrLost(p)?'<span class="yr-sc">📶 koptu</span>':'')+'</li>').join('');
}
function yrLobbyHTML(){
 const r=YR.room,duel=r.mode==='duel',arena=r.mode==='arena',cap=arena?ArenaModel.maxPlayers(r):YarisModel.LIMITS[r.mode].max,minP=YarisModel.LIMITS[r.mode].min;
 let h=yrTop(duel?'1’e 1 Kapışma':arena?'Er Meydanı':'Oyun Odası')+'<div class="wrap"><p class="sub">'+esc(yrLabel(r))+' · '+r.n+' soru · her soru '+r.lim+' sn</p><h1 id="yrHeading" tabindex="-1">'+(duel?'Rakip bekleniyor':'Oyuncular geliyor')+'</h1>';
 if(arena)h+=arLeadersHTML();
 h+='<h2>Oyuncular ('+YR.players.length+'/'+cap+')</h2><ul class="yr-list" id="yrList">'+yrPlayersListHTML()+'</ul>';
 h+='<p class="note">Seçtiğin karakterle katılıyorsun.</p><button class="btn pri" onclick="yrSetReady()"'+(YR.ready?' disabled':'')+'>'+(YR.ready?'Hazır':'Hazırım')+'</button>';
 if(duel)h+='<p class="card" role="status">'+(YR.players.length<2?'Rakip bekleniyor.':'İki oyuncu da hazır olunca kapışma başlar.')+'</p>';
 else if(YR.host)h+=(YR.players.some(p=>!p.ready)?'<p class="note" role="status">'+YR.players.filter(p=>!p.ready).length+' hazır değil.</p>':'')+'<button class="btn pri" onclick="yrStart()" aria-describedby="yrStartNeden"'+(yrStartNeden()?' disabled':'')+'>'+(arena?'Er Meydanı\'nı başlat':'Yarışı başlat')+'</button><p class="sub" id="yrStartNeden" role="status">'+esc(yrStartNeden())+'</p>';
 else h+='<p class="card" role="status">⏳ Odayı kuran kişi başlatınca oyun açılır.</p>';
 h+=(typeof frLobbyHTML==='function'?frLobbyHTML():'')+'<div class="card"><small>Ya da bağlantıyla davet et</small><input id="yrInvite" class="inp" readonly value="'+esc(yrLink())+'"><div class="row"><button class="btn sm" onclick="yrCopy()">Kopyala</button><button class="btn sm" onclick="yrShare()">Paylaş</button></div><p role="status" class="sub">'+esc(YR.notice||'')+'</p></div>'+yrErr()+'<button class="btn ghost" onclick="yrLeave()">Odadan çık</button></div>';
 return h;
}
function yrCountHTML(){return '<div class="yr-full"><p>'+esc(yrLabel(YR.room))+'</p><div class="yr-big" id="yrHeading" tabindex="-1" role="status">'+Math.max(1,YR.count)+'</div><p>Hazır ol!</p>'+rkCountdownHTML()+'</div>';}
function yrRaceHTML(){
 const g=YR.g,q=YR.qs[g.k],lim=YR.room.lim;
 let h=yrTop(yrLabel(YR.room))+'<div class="wrap'+(g.ph==='fb'?' yr-feedback':'')+'">'+yrWarnHTML()+'<details class="yr-live-ranks"><summary>Canlı sıralama</summary><ul class="yr-rank" id="yrRank" aria-label="Canlı sıralama">'+yrRankHTML(true)+'</ul></details><p class="yr-prog" id="yrHeading" tabindex="-1">Soru '+(g.k+1)+' / '+YR.qs.length+'</p>';
 if(g.ph==='q')h+='<div class="yr-bar" aria-hidden="true"><div class="yr-fill" id="yrFill"></div></div><p class="yr-sec" id="yrSec">'+lim+' sn</p>';
 h+=yrQuestionHTML(q)+yrChoicesHTML(q,'yrRaceAnswer',g.ph==='fb'?{pick:g.pick}:null);
 if(g.ph==='fb'){
  const last=g.k+1>=YR.qs.length;
  h+='<div class="yr-fb '+(g.right?'ok':'bad')+'" role="status"><b>'+(g.right?(g.hizli?'Çok hızlısın, minik şef! ⚡':'✓ Doğru!'):(g.pick<0?'Süre doldu.':'Yanlış.'))+'</b>'+(g.right?'':'<br>Doğru cevap: <b>'+esc(q.choices.find(c=>c.id===q.correct).text)+'</b>')+yrCompareHTML(q,g.pick)+yrExplanationHTML(q)+'</div><button class="btn pri" onclick="yrRaceNext()" id="yrNext">'+(last?'Bitir':'Sonraki soru')+'</button>';
 }
 return h+'<button class="btn ghost" onclick="yrLeave()">Oyundan çık</button></div>';
}
function yrOverHTML(){
 const all=yrAllDone(),r=YarisModel.ranks(yrAllPlayers()),me=r.find(p=>p.uid===yrMe()),med=['🥇','🥈','🥉'];
 let h=yrTop('Oyun Odası')+'<div class="wrap">'+yrWarnHTML()+'<h1 id="yrHeading" tabindex="-1">'+(all?'Yarış bitti!':'Bitirdin!')+'</h1>';
 if(YR.g&&YR.g.rapor)h+=sonucGoster(YR.g.rapor);
 if(all&&me&&me.rank===1)h+='<p role="status">Bu odada birinci oldun!</p>';
 if(me)h+='<p class="card"><b>'+me.ok+' / '+YR.qs.length+' doğru.</b> '+(all?'Sıran: <b>'+me.rank+'.</b>'+(me.rank===1?' Tebrikler!':' İyi oynadın!'):'Diğer oyuncular bitirince son sıra belli olur.')+'</p>';
 h+='<ol class="yr-list yr-podium">'+r.map(p=>'<li class="yr-row'+(p.uid===yrMe()?' me':'')+'"><span class="yr-rk">'+(all&&p.rank<=3?med[p.rank-1]:p.rank+'.')+'</span><span class="yr-nm">'+esc(p.nick)+(p.uid===yrMe()?' (Sen)':(typeof frBtn==='function'?frBtn(p,false):''))+'</span><span class="yr-sc">'+p.ok+' doğru'+(p.done?'':(yrLost(p)?' · 📶':' · ⏳'))+'</span></li>').join('')+'</ol><button class="btn pri" onclick="yrLeave()">'+(all?'Oyundan çık':'Çık')+'</button></div>';
 return h;
}
function duScoreHTML(){
 const me=DU.sc[0],op=DU.sc[1];
 return '<div class="yr-duel"><div class="yr-side'+(DU.w===1&&DU.ph==='res'?' hit':'')+'"><small>'+esc(YR.nick)+'</small><b>'+me+'</b></div><div class="yr-vs">⚔️<small>'+(DU.k+1>0?Math.min(DU.k+1,DU.total):0)+'/'+DU.total+'</small></div><div class="yr-side'+(DU.w===2&&DU.ph==='res'?' hit':'')+'"><small>'+esc(DU.onick)+'</small><b>'+op+'</b></div></div>';
}
function duIntroHTML(){return '<div class="yr-full"><div class="yr-vsline"><span>🙂 '+esc(YR.nick)+'</span><span>⚔️</span><span>'+esc(DU?DU.onick:'Rakip')+' 🙂</span></div><p>'+esc(yrLabel(YR.room))+' · '+(DU?DU.total:YR.room.n)+' soru</p><div class="yr-big" id="yrHeading" tabindex="-1" role="status">'+Math.max(1,YR.count)+'</div><p>Önce doğru basan puanı alır. Rakibin yetişemeyeceği kadar öne geçen maçı kazanır.</p><p>Hazır ol!</p>'+rkCountdownHTML()+'</div>';}
function duPlayHTML(){
 const q=YR.qs[DU.k],asking=DU.ph==='q',res=DU.ph==='res';
 let h=yrTop('Kapışma')+'<div class="wrap'+(res?' yr-feedback':'')+'">'+yrWarnHTML()+duScoreHTML()+'<p class="yr-prog" id="yrHeading" tabindex="-1">Soru '+(DU.k+1)+' / '+DU.total+'</p>';
 if(asking)h+='<div class="yr-bar" aria-hidden="true"><div class="yr-fill" id="yrFill"></div></div><p class="yr-sec" id="yrSec">'+YR.room.lim+' sn</p>';
 h+=yrQuestionHTML(q)+yrChoicesHTML(q,'duAns',asking?null:{pick:DU.pick});
 if(DU.ph==='wait'){if(yrLost(duOpp()))h+='<p role="status">Bağlantısı koptu olabilir. Bekleyebilir ya da çıkabilirsin.</p>';const m={ok:(DU.hizli?'Çok hızlısın, minik şef! ⚡':'✓ Doğru!')+' Rakibin cevabına bakılıyor…',bad:'Yanlış! Bu soruda kilitlendin. Rakibin cevabı bekleniyor…',time:'Süre doldu. Rakibin cevabı bekleniyor…',late:'⚡ '+esc(DU.onick)+' senden önce doğru bastı.'}[DU.why]||'Sonuç bekleniyor…';h+='<p class="yr-wait" role="status">'+m+'</p>';}
 if(res){
  const s=n=>(Math.round(Math.abs(n)/100)/10).toFixed(1).replace('.',',');
  const msg=DU.w===1?'<b>🎉 Bu tur senin!</b><br><small>'+s(DU.at)+' sn'+(DU.bt>0?' · '+esc(DU.onick)+' '+s(DU.bt)+' sn':'')+'</small>':DU.w===2?'<b>⚡ '+esc(DU.onick)+' bildi!</b><br><small>'+s(DU.bt)+' sn'+(DU.at>0?' · Sen '+s(DU.at)+' sn, biraz geç kaldın':'')+'</small>':(DU.at>0&&DU.bt>0?'<b>🤝 İkiniz de aynı anda bildiniz.</b><br><small>Bu turda puan yok.</small>':'<b>İkiniz de bilemediniz.</b><br><small>Doğrusu: '+esc(q.choices.find(c=>c.id===q.correct).text)+'</small>');
  h+='<div class="yr-fb '+(DU.w===1?'ok':DU.w===2?'bad':'')+'" role="status">'+msg+yrExplanationHTML(q)+'</div>';
 }
 return h+'<button class="btn ghost" onclick="yrLeave()">Kapışmadan çık</button></div>';
}
function duOverHTML(){
 const r=DU.result,t=r==='left'?'Rakip ayrıldı ya da bağlantısı koptu. Bu maçın sonucu sayılmadı.':r==='win'?'🏆 Kazandın!':r==='lose'?'İyi mücadele! 💪':'Berabere! İkiniz de iyi oynadınız.',o=duOpp();
 let sub=DU.forfeit?'Rakip oyundan çıktı, maçı sen kazandın.':r==='win'?'Tebrikler, '+esc(YR.nick)+'!':r==='lose'?'Rövanşta sen kazanabilirsin!':'Rövanş oynayabilirsiniz.';
 let h=yrTop('Kapışma bitti')+'<div class="wrap" style="text-align:center">'+yrWarnHTML()+'<h1 id="yrHeading" tabindex="-1">'+t+'</h1>'+duScoreHTML()+'<p class="sub">'+sub+'</p>'+(DU.rapor?sonucGoster(DU.rapor):'')+rkSettingInline(YR.room);
 if(DU.left||!o||o.done)h+='<p class="sub">Rakip ayrıldı.</p>';
 else if(DU.want)h+='<button class="btn" disabled>⏳ '+esc(DU.onick)+' bekleniyor…</button>';
 else h+='<button class="btn pri" onclick="duRematch()">🔁 Rövanş'+(o&&(o.m|0)===DU.m+1?' · '+esc(DU.onick)+' hazır!':'')+'</button>';
 if(typeof frBtn==='function')h+=frBtn(o,true);
 return h+'<button class="btn ghost" onclick="yrLeave()">Çık</button></div>';
}
function yrScreenHTML(){
 switch(st.screen){
  case 'raceinvite':return yrInviteHTML();
  case 'racemenu':return yrMenuHTML();
  case 'racecreate':return yrCreateHTML();
  case 'racelobby':return YR.room?yrLobbyHTML():yrMenuHTML();
  case 'racecount':return yrCountHTML();
  case 'raceplay':return YR.g?yrRaceHTML():yrMenuHTML();
  case 'raceover':return yrOverHTML();
  case 'dintro':return duIntroHTML();
  case 'dplay':return DU?duPlayHTML():yrMenuHTML();
  case 'dover':return DU?duOverHTML():yrMenuHTML();
 }
 return '';
}
/* ---------- bağlama: ana ekran, geri tuşu, çizim ---------- */
const YR_RENDER=render,YR_BACK=back;
back=function(){
 if(YR_SCREENS.includes(st.screen)){
  if(st.screen==='raceinvite'){yrInviteCancel();return;}
  if(st.screen==='racemenu'){go('home');return;}
  if(st.screen==='racecreate'){YR.error='';st.screen='racemenu';render();return;}
  yrLeave();return;
 }
 YR_BACK();
};
const YR_PLAY=['raceplay','dplay','aplay','cvplay'];
render=function(){
 document.body.classList.toggle('yr-oyun',YR_PLAY.includes(st.screen));
 if(YR_SCREENS.includes(st.screen)){
  const app=document.getElementById('app');app.innerHTML=yrScreenHTML();
  const h=document.getElementById('yrHeading');
  if(h&&YR.focusKey!==st.screen+':'+(YR.g?YR.g.k:DU?DU.k:'')+':'+(DU?DU.ph:YR.g?YR.g.ph:'')){YR.focusKey=st.screen+':'+(YR.g?YR.g.k:DU?DU.k:'')+':'+(DU?DU.ph:YR.g?YR.g.ph:'');h.focus({preventScroll:true});}
  return;
 }
 YR_RENDER();
 if(st.screen==='home'){const list=document.getElementById('app').querySelector('.list');if(list&&!list.querySelector('[data-yr]'))list.insertAdjacentHTML('beforeend',menuButton('Birlikte Oynayalım','Arkadaşınla ya da sınıfla aynı sorulara birlikte cevap ver.',"yrOpen()").replace('<button ','<button data-yr="1" '));}
};
window.addEventListener('online',()=>{if(YR.active)render();});
window.addEventListener('offline',()=>{if(YR.active)render();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&YR.active&&DU&&!DU.over)duWrite();});
/* Davet, menüde gizlenen ikinci bir düğme değil doğrudan katılım isteğidir. */
function yrInviteLive(invite){return !invite||(YR.invite===invite&&!invite.cancelled);}
function yrInviteClear(){
 if(YR.invite)YR.invite.cancelled=true;YR.invite=null;YR.codeDraft='';st.profileReturn=null;
 const url=new URL(location.href);if(url.searchParams.has('oda')){url.searchParams.delete('oda');history.replaceState(history.state,'',url.pathname+url.search+url.hash);}
}
function yrInviteCancel(){yrInviteClear();YR.error='';go('home');}
function yrInvitePick(i){const n=profiles()[i];if(!n)return;st.profileReturn='raceinvite';pickProfile(n);yrInviteResume();}
async function yrInviteResume(){
 const invite=YR.invite;if(!invite||invite.pending||invite.cancelled||invite.entered||st.screen!=='raceinvite')return;
 invite.choose=false;YR.error='';
 if(!YarisModel.validCode(invite.code)){YR.error='Davet bağlantısındaki oda kodu geçersiz.';invite.attempted=true;render();return;}
 if(!yrConfigured()||!navigator.onLine){YR.error=!yrConfigured()?'Oda bağlantısı henüz ayarlanmadı.':'Odaya bağlanmak için internet bağlantısı gerekiyor.';invite.attempted=true;render();return;}
 invite.pending=true;invite.attempted=true;render();
 try{
  st.profileReturn='raceinvite';const ready=await yrNeedName();if(!yrInviteLive(invite))return;
  st.profileReturn=null;st.screen='raceinvite';
  if(!ready){invite.choose=profiles().length>0;if(!invite.choose)YR.error='Profil hazırlanamadı. Yeniden dene.';return;}
  await yrJoin(invite.code,invite);
 }catch(e){if(yrInviteLive(invite))YR.error=yrErrText(e);}
 finally{invite.pending=false;if(yrInviteLive(invite)&&st.screen==='raceinvite')render();}
}
function yrInviteHTML(){
 const invite=YR.invite;if(!invite)return yrTop('Oda daveti');
 let h=yrTop('Oda daveti')+'<div class="wrap"><h1>Davet edildiğin oda</h1><p>Oda kodu: <b>'+esc(invite.code)+'</b></p>';
 if(invite.choose)h+='<p>Bu cihazda birden fazla eski kayıt var. Kullanacağın profili bir kez seç.</p>'+profiles().map((n,i)=>'<button class="btn" onclick="yrInvitePick('+i+')">'+esc(n)+'</button>').join('');
 else if(invite.pending)h+='<p role="status" aria-live="polite">Odaya bağlanılıyor…</p>';
 else if(YR.error)h+='<button class="btn pri" onclick="yrInviteResume()">Yeniden dene</button>';
 h+=yrErr()+'<button class="btn ghost" onclick="yrInviteCancel()">Ana sayfaya dön</button></div>';return h;
}
if(new URLSearchParams(location.search).has('oda')){
 YR.invite={code:YarisModel.slug(new URLSearchParams(location.search).get('oda')),pending:false,attempted:false,cancelled:false};
 st.screen='raceinvite';render();Promise.resolve().then(yrInviteResume);
}
window.addEventListener('online',()=>{if(st.screen==='raceinvite')yrInviteResume();});

/* Ana sayfadaki Birlikte Oyna düğmesi (v3.0'da tasarım.js temizlenirken silinmişti). */
window.tasarimOda=function(){yrOpen();};
