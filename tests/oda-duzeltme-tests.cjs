/* İki gerçek uygulama bağlamı; gecikmeli taşıma ve denetlenen ortak saat. */
const assert=require('node:assert/strict'),open=require('./helpers/dom-app.cjs');
const flush=async()=>{for(let i=0;i<4;i++)await new Promise(setImmediate)};
(async()=>{
 let checks=0;const pass=s=>{checks++;console.log('PASS '+s)};
 const apps=await Promise.all([open(),open()]),ws=apps.map(x=>x.w);let now=1800000000000,id=0;const jobs=new Map(),rows={};
 const after=(fn,ms,interval)=>{const key=++id;jobs.set(key,{fn,at:now+Math.max(0,ms||0),interval});return key};
 const advance=async ms=>{const until=now+ms;for(let guard=0;guard<100000;guard++){let best=null;for(const [key,j]of jobs)if(j.at<=until&&(!best||j.at<best[1].at))best=[key,j];if(!best)break;const [key,j]=best;now=j.at;if(j.interval)j.at+=j.interval;else jobs.delete(key);j.fn();await flush();}now=until;await flush()};
 const room={mode:'duel',subject:'baharat',scope:'konu',kind:'gorsel',set:0,n:10,lim:20,seed:42,host:'a',created:now,status:'playing'};
 function publish(){const data=Object.entries(rows).map(([uid,x])=>({uid,...JSON.parse(JSON.stringify(x)),pending:false,fromCache:false}));ws.forEach((w,i)=>after(()=>w.yrPlayersChanged(JSON.parse(JSON.stringify(data))),i?650:20));}
 for(let i=0;i<2;i++){
  const w=ws[i],uid=i?'b':'a';w.Date.now=()=>now;Object.defineProperty(w.performance,'now',{value:()=>now-1800000000000,configurable:true});w.setTimeout=(fn,ms)=>after(fn,ms);w.clearTimeout=key=>jobs.delete(key);w.setInterval=(fn,ms)=>after(fn,ms,ms);w.clearInterval=w.clearTimeout;
  w.st.prof=i?'🐨 Şef Koala':'🐼 Aşçı Panda';w.st.guest=false;w.sesSus=()=>{w.audioStops=(w.audioStops||0)+1};w.yrSaatAyarla=async()=>{};w.yrPreload=async()=>{};w.rutbeMatch=()=>{};w.rkSettingSubmit=()=>{};w.rkWinAdd=()=>{};w.rkCountLeaders=()=>{};
  rows[uid]={nick:w.st.prof,r:[],pr:[],m:0,n:0,ok:0,bad:0,score:0,done:false,tt:0,rid:room.created,ts:now,ready:true,loaded:true};
  w.__svc={uid,async setPlayer(code,pd){rows[uid]={...rows[uid],...JSON.parse(JSON.stringify(pd))};publish();},async duelRound(code,m,k){rows[uid]={...rows[uid],dm:m,dk:k,dt:now};publish();}};
  w.eval('yrTransport=window.__svc');w.yrService=()=>w.__svc;Object.assign(w.eval('YR'),{active:true,code:'TEST1',room:{...room},nick:w.st.prof,host:i===0,players:[]});
 }
 room.rev=ws[0].yrRoomRev(room);for(const w of ws)w.eval('YR').room.rev=room.rev;assert(room.rev.startsWith('duel3-'));
 publish();await advance(700);for(const w of ws)w.duStart(0);await flush();await advance(3300);
 for(const w of ws){assert.equal(w.eval('DU.k'),0);assert.equal(w.eval('DU.ph'),'q');assert(w.document.querySelector('.yr-q'));}assert.equal(ws[0].eval('DU.roundAt'),ws[1].eval('DU.roundAt'));pass('650 ms farklı ağ gecikmesinde iki oyuncu aynı tur zamanı ve görünür soruyla başlar');
 // First player answers correctly; second receives result and timer submits late answer.
 const answer=(i,correct)=>{const w=ws[i],q=w.eval('YR.qs[DU.k]');w.duAns(q.choices.findIndex(c=>(c.id===q.correct)===correct))};
 await advance(1000);answer(0,true);await advance(1000);await advance(3500);
 assert.equal(ws[0].eval('DU.k'),1);assert.equal(ws[1].eval('DU.k'),1);assert.equal(ws[0].eval('DU.sc[0]'),1);pass('Önce doğru cevap veren puanı alır, iki cihaz ikinci tura geçer');
 // Leading player is wrong. Opponent retains question and can score.
 answer(0,false);await advance(700);assert.equal(ws[1].eval('DU.ph'),'q');answer(1,true);await advance(4000);
 assert.equal(ws[0].eval('DU.k'),2);assert.equal(ws[1].eval('DU.k'),2);assert.deepEqual(Array.from(ws[0].eval('DU.sc')),[1,1]);pass('Öndeki yanlış verince rakibin cevap hakkı korunur, maç takılmadan aynı sonraki soruya geçer');
 assert(ws.every(w=>w.audioStops>=3));pass('Her tur ve cevap geçişi önceki soru sesini durdurur');
 // Complete a short match, then confirm a new synchronized rematch.
 for(const w of ws)w.eval('DU.total=3');answer(1,true);await advance(6000);assert(ws.every(w=>w.eval('DU.over')));await Promise.all(ws.map(w=>w.duRematch()));await advance(5000);assert(ws.every(w=>w.eval('DU.m')===1&&w.eval('DU.k')===0&&w.eval('DU.ph')==='q'));pass('İki oyunculu rövanş yeni ortak turla ve sıfır skorla başlar');
 // Heartbeat without response must not keep the other player waiting forever.
 ws[1].eval("DU.ph='paused'");answer(0,false);await advance(33000);assert.equal(ws[0].eval('DU.result'),'left');assert.equal(ws[0].eval('DU.over'),true);pass('Yanıtsız tur süre ve bağlantı payından sonra puan/galibiyet uydurmadan kapanır');
 // Lobby update and profile modal use actual DOM.
 const w=ws[1];w.eval('YR.active=false');w.st.screen='racelobby';let updates=0;const original=w.render;w.render=()=>updates++;w.frUi();assert.equal(updates,1);w.render=original;pass('Arkadaş bilgisi geldiğinde oda içi liste yenilenir');
 w.st.screen='home';w.closeModal();Object.assign(w.eval('FR'),{ready:true,prof:w.st.prof,pid:'ABCDEFG',error:''});w.profilAyrintiAc();assert(w.document.getElementById('profileCode').textContent.includes('ABCDEFG'));assert(w.document.getElementById('profileCode').textContent.includes('Kopyala'));w.closeModal();pass('Profil kartında oyuncu kodu ve kopyalama/paylaşma görünür');
 Object.defineProperty(w.navigator,'onLine',{value:true,configurable:true});w.st.screen='friends';w.render();assert(w.document.getElementById('fr-code'));assert(!w.document.querySelector('.ark-code'));pass('Arkadaşlarım ekranı arkadaş kodu girişi ve liste içindir');
 // Writes fail once, do not loop six times and hide original failure.
 let attempts=0;const svc=new w.YarisFirebase({});svc.connect=async()=>svc;svc.uid='a';svc.randomCode=()=> 'ABCDE';svc.room=x=>x;svc.sdk={getDoc:async()=>({exists:()=>false}),setDoc:async()=>{attempts++;throw Error('permission-denied')}};await assert.rejects(svc.create({mode:'duel'},'',''),/permission-denied/);assert.equal(attempts,1);pass('İzin hatası altı kez denenmeden gerçek nedenle iletilir');
 // Preserve rank/profile progress; no destructive migration in this patch.
 w.lsSet('rutbe',{keep:42});w.__svc.watchList=async()=>()=>{};w.st.screen='racemenu';w.render();assert.equal(w.sessionStorage.getItem('yr_menu_profil'),w.st.prof);assert.equal(w.ls('rutbe',{}).keep,42);pass('Lobi tercihi profil kapsamında saklanır, ilerleme değişmez');
 const boot=await open('',{seed:{kv_profiles:['🐼 Aşçı Panda'],kv_sonProfil:'🐼 Aşçı Panda',kv_sifirlama:'2026-11-10-tam'},sessionSeed:{yr_menu_profil:'🐼 Aşçı Panda'}});assert.equal(boot.w.st.screen,'racemenu');boot.dom.window.close();pass('Yeni açılışta saklanan profilin lobisi gerçekten geri yüklenir');
 w.render=()=>{};Object.assign(w.eval('YR'),{active:true,code:'READY1',ready:false,readyBusy:false,room:{mode:'duel',status:'lobby',created:now,n:10}});w.__svc.setPlayer=async()=>{throw Error('permission-denied')};await w.yrSetReady();assert.equal(w.eval('YR.ready'),false);assert.match(w.eval('YR.error'),/permission-denied/);w.__svc.setPlayer=async()=>{};await w.yrSetReady();assert.equal(w.eval('YR.ready'),true);pass('Hazır kaydı reddedilince yanlış hazır gösterilmez; yeniden deneme çalışır');
 const sent=[];w.adFb=async()=>({db:{},sdk:{doc:(db,...p)=>p.join('/'),serverTimestamp:()=>123,getDoc:async()=>({exists:()=>true,data:()=>({nick:'🐰 Aşçı Tavşan'})}),setDoc:async(path,data)=>{sent.push({path,data})}}});Object.assign(w.eval('FR'),{ready:true,prof:w.st.prof,pid:'ABCDEFG',list:[],inc:[],out:[],error:''});await w.frAddId('HJKLMNP');assert(sent.some(x=>x.path.startsWith('yrFr/')));assert.equal(w.eval('FR.addBusy'),false);assert.equal(w.eval('FR.codeDraft'),'');pass('Arkadaş ekleme tamamlanır, bekleme durumu ve kod alanı temizlenir');
 w.eval("FR.call={to:'HJKLMNP',nick:'Arkadaş'};YR.room.subject='baharat';YR.room.mode='duel'");assert.equal(await w.frInvSend(),true);assert(sent.some(x=>x.path.startsWith('yrDav/')&&x.data.to==='HJKLMNP'&&x.data.code==='READY1'));pass('Oda daveti doğru arkadaş ve oda koduyla gönderilir');
 w.adFb=async()=>({db:{},sdk:{doc:(db,...p)=>p.join('/'),serverTimestamp:()=>123,setDoc:async()=>{throw Error('permission-denied')}}});w.eval("FR.call={to:'HJKLMNP',nick:'Arkadaş'}");assert.equal(await w.frInvSend(),false);assert.match(w.document.getElementById('toast').textContent,/permission-denied/);pass('Davet reddi sessizce kaybolmaz, gerçek hata gösterilir');
 for(const a of apps)a.dom.window.close();console.log(checks+' kontrol geçti.');
})().catch(e=>{console.error(e);process.exitCode=1});
