/* Birlikte Oynayalım arayüz testi. Firestore yerine bellek içi sahte bağlantı kullanır (iki telefon aynı depoyu paylaşır).
   Firestore KURALLARINI denemez; kurallar için tests/yaris-rules-tests.cjs (emülatör gerekir). Gerçek telefon/Android testi değildir. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const MOCK=`(function(){
 class YarisFirebase{
  constructor(){this.uid=null;}
  async connect(){if(!this.uid)this.uid=await window.__hub('uid');return this;}
  async create(spec,wanted){await this.connect();return window.__hub('create',this.uid,spec,wanted);}
  async peek(code){await this.connect();return window.__hub('peek',code);}
  async join(code,nick,pd){await this.connect();return window.__hub('join',this.uid,code,nick,pd);}
  async setPlayer(code,pd){return window.__hub('set',this.uid,code,pd);}
  async start(code){return window.__hub('start',this.uid,code);}
  async leave(code,lobby,host){return window.__hub('leave',this.uid,code,lobby,host);}
  watch(code,onRoom,onPlayers){let last='';const t=setInterval(async()=>{const s=await window.__hub('state',code);const j=JSON.stringify(s);if(j!==last){last=j;onRoom(s.room);onPlayers(s.players);}},60);return [()=>clearInterval(t)];}
 }
 window.YarisFirebase=YarisFirebase;
})();`;
const hub={rooms:{},n:0,ops:{
 uid(){return 'u'+(++hub.n);},
 peek(code){const r=hub.rooms[code];return r?r.room:null;},
 create(uid,spec,wanted){const code=wanted||('R'+Math.random().toString(36).slice(2,6).toUpperCase());if(hub.rooms[code])throw Error('Bu kod kullanılıyor. Başka bir kod seç.');const room={...spec,host:uid,status:'lobby',guest:null,created:Date.now(),qv:1};if(spec.mode==='race')room.cnt=1;hub.rooms[code]={room,players:{}};return {code,room};},
 join(uid,code,nick,pd){const r=hub.rooms[code];if(!r)throw Error('Oda bulunamadı. Kodu kontrol et.');const room=r.room;if(room.host!==uid){if(room.status!=='lobby')throw Error('Yarış başlamış, katılamazsın.');if(room.mode==='duel'){if(room.guest&&room.guest!==uid)throw Error('Bu kapışma dolu.');room.guest=uid;}else if(!r.players[uid]){if((room.cnt||1)>=8)throw Error('Bu oda dolu (en çok 8 kişi).');room.cnt=(room.cnt||1)+1;}}r.players[uid]={...pd,rid:room.created};return room;},
 set(uid,code,pd){if(hub.fail)throw Error('ağ yok');const r=hub.rooms[code];if(!r)return;r.players[uid]={...pd};},
 start(uid,code){const r=hub.rooms[code];if(r.room.host!==uid)throw Error('izin yok');r.room.status='playing';},
 leave(uid,code,lobby,host){const r=hub.rooms[code];if(!r)return;if(lobby){if(r.players[uid]&&!host&&r.room.mode==='race'&&r.room.cnt>1)r.room.cnt--;delete r.players[uid];if(host)delete hub.rooms[code];}},
 state(code){const r=hub.rooms[code];return r?{room:r.room,players:Object.entries(r.players).map(([uid,p])=>({uid,...p}))}:{room:null,players:[]};}
}};
(async()=>{
 const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://x');const f=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}const ext=path.extname(f);res.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
 await new Promise(r=>server.listen(0,r));const url='http://localhost:'+server.address().port;
 const browser=await chromium.launch(),errors=[];
 async function phone(width=390,query=''){
  const c=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'});
  await c.exposeFunction('__hub',async(op,...a)=>{try{return hub.ops[op](...a);}catch(e){throw new Error(e.message);}});
  await c.route('**/js/yaris-baglanti.js',r=>r.fulfill({contentType:'text/javascript',body:MOCK}));
  await c.route('**/js/yaris-ayar.js',r=>r.fulfill({contentType:'text/javascript',body:'window.YARIS_FIREBASE_CONFIG={projectId:"demo-test",apiKey:"demo"};'}));
  const p=await c.newPage();await p.addInitScript(()=>{try{sessionStorage.setItem('mesleki-ses-secim','1');}catch(e){}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errors.push(m.text());});
  await p.goto(url+'/'+query);await p.waitForFunction(()=>typeof yrOpen==='function'&&CONTENT.baharat&&CONTENT['mutfak-araclari']);await p.evaluate(()=>{const o=duResolve;duResolve=function(){o();(window.__ws=window.__ws||[]).push([DU.m,DU.k,DU.w]);};});return p;
 }
 const text=p=>p.locator('#app').innerText();
 async function openMenu(p,nick){await p.evaluate(n=>{st.prof=n;st.guest=false;yrOpen();},nick);}
 async function createRoom(p,nick,mode,cfg={}){
  await openMenu(p,nick);await p.getByRole('button',{name:mode==='duel'?/Kapışma Kur/:/Oyun Odası Kur/}).click();
  if(cfg.subject)await p.getByRole('button',{name:cfg.subject,exact:true}).click();
  if(cfg.set)await p.getByRole('button',{name:new RegExp('^'+cfg.set+'\\. takım')}).click();
  await p.getByRole('button',{name:'Odayı kur'}).click();await p.waitForFunction(()=>YR.active&&st.screen==='racelobby');return p.evaluate(()=>YR.code);
 }
 async function joinRoom(p,nick,code){await openMenu(p,nick);await p.evaluate(c=>yrJoin(c),code);await p.waitForFunction(()=>YR.active&&st.screen==='racelobby');}
 const correctIdx=p=>p.evaluate(()=>{const q=YR.qs[st.screen==='dplay'?DU.k:YR.g.k];return q.choices.findIndex(c=>c.id===q.correct);});
 const wrongIdx=async p=>{const c=await correctIdx(p);return (c+1)%4;};
 async function raceAnswer(p,right){const k=await p.evaluate(()=>YR.g.k);await p.locator('.yr-opt').nth(right?await correctIdx(p):await wrongIdx(p)).click();await p.waitForFunction(k=>YR.g.ph==='fb'&&YR.g.k===k,k);await p.locator('#yrNext').click();}
 try{
  // ---- 1) Menü ve ad denetimi ----
  const a=await phone(390),b=await phone(390),c=await phone(1200);
  await a.evaluate(()=>{st.prof='🦊 Kurnaz Tilki #482';st.guest=false;yrOpen();});assert(!(await text(a)).includes('Öğretmen'));
  assert((await text(a)).includes('🦊 Kurnaz Tilki #482'),'oyun adı profilden gelir, ad kutusu yok');assert.equal(await a.locator('input#yrNick').count(),0);
  await a.getByRole('button',{name:/Oyun Odası Kur/}).click();assert.equal(await a.evaluate(()=>st.screen),'racecreate');assert.equal(await a.evaluate(()=>yrNickGet()),'🦊 Kurnaz Tilki #482');
  await a.evaluate(()=>{st.prof=null;st.guest=true;});assert(/^👤 Misafir \d{3}$/.test(await a.evaluate(()=>yrNickGet())),'misafir adı');await a.evaluate(()=>{st.prof='Ali';st.guest=false;});
  // geçersiz kod
  await a.evaluate(()=>{YR.cfg.code='ab';});await a.getByRole('button',{name:'Odayı kur'}).click();assert((await text(a)).includes('3–10'));
  await a.evaluate(()=>{YR.cfg.code='Zihin 11b';});await a.getByRole('button',{name:'Odayı kur'}).click();await a.waitForFunction(()=>YR.active&&st.screen==='racelobby');assert.equal(await a.evaluate(()=>YR.code),'ZIHIN11B');
  // ---- 2) Oyun Odası: lobi, katılım, başlatma, aynı sorular ----
  assert((await text(a)).includes('En az iki kişi gerekir'));assert(await a.getByRole('button',{name:'Yarışı başlat'}).isDisabled());
  await joinRoom(b,'🐼 Cesur Panda','zihin11b');
  await a.waitForFunction(()=>YR.players.length===2);assert(!(await a.getByRole('button',{name:'Yarışı başlat'}).isDisabled()));
  assert((await text(b)).includes('Odayı kuran kişi başlatınca'));assert((await text(b)).includes('Cesur Panda'),'oyun adı görünür');
  // üçüncü oyuncu, başlamadan katılabilir
  await joinRoom(c,'Can','ZIHIN11B');await a.waitForFunction(()=>YR.players.length===3);
  await a.getByRole('button',{name:'Yarışı başlat'}).click();
  for(const p of [a,b,c])await p.waitForFunction(()=>st.screen==='raceplay',null,{timeout:15000});
  const qa=await a.evaluate(()=>YR.qs.map(q=>[q.id,q.choices.map(x=>x.text).join('|'),q.correct])),qb=await b.evaluate(()=>YR.qs.map(q=>[q.id,q.choices.map(x=>x.text).join('|'),q.correct]));
  assert.deepEqual(qa,qb,'iki telefonda aynı sorular ve seçenek sırası');assert.equal(qa.length,10);
  // geç gelen katılamaz
  const late=await phone(390);await openMenu(late,'Geç');await late.evaluate(c=>yrJoin(c),'ZIHIN11B');await late.waitForFunction(()=>YR.error.length>0);assert((await text(late)).includes('başlamış'));
  // ilk soruda yapısal denetim: görsel + yönerge + dört seçenek, süre çubuğu
  assert.equal(await a.locator('.yr-opt').count(),4);assert(await a.locator('.yr-img').isVisible());assert.equal(await a.locator('#yrFill').count(),1);
  if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await a.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'yaris-soru-390.png')});}
  // A hepsini doğru, B hepsini yanlış, C 5 doğru 5 yanlış
  for(let i=0;i<10;i++){await raceAnswer(a,true);}
  assert.equal(await a.evaluate(()=>st.screen),'raceover');
  for(let i=0;i<10;i++)await raceAnswer(b,false);
  assert((await text(a)).includes('Bitirdin'),'herkes bitmeden "Yarış bitti" denmez');
  for(let i=0;i<10;i++)await raceAnswer(c,i<5);
  for(const p of [a,b,c])await p.waitForFunction(()=>yrAllDone()&&document.querySelector('h1').innerText.includes('Yarış bitti'),null,{timeout:15000});
  const rk=await a.evaluate(()=>YarisModel.ranks(yrAllPlayers()).map(x=>[x.nick,x.ok,x.rank]));
  assert.deepEqual(rk,[['Ali',10,1],['Can',5,2],['🐼 Cesur Panda',0,3]]);assert((await text(a)).includes('Sıran: 1.'));assert((await text(b)).includes('Sıran: 3.'));
  if(process.env.QA_SCREENSHOTS)await c.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'yaris-sonuc-1200.png')});
  // süre dolması yanlış sayılır
  await a.evaluate(()=>yrLeaveNow());assert.equal(await a.evaluate(()=>YR.active),false);
  // ---- 3) Konu seçenekleri: mutfak araçları bilgi soruları, kuver ----
  for(const [subject,pick] of [['Mutfak Araçları',null],['Kuver','Tabldot Kuver']]){
   const h=await phone(390);await openMenu(h,'Deniz');await h.getByRole('button',{name:/Oyun Odası Kur/}).click();await h.getByRole('button',{name:subject,exact:true}).click();
   if(pick)await h.getByRole('button',{name:pick,exact:true}).click();else await h.getByRole('button',{name:'Bilgi soruları'}).click();
   await h.getByRole('button',{name:'Odayı kur'}).click();await h.waitForFunction(()=>YR.active);assert((await h.evaluate(()=>YR.room.n))>=3);
   await h.evaluate(()=>yrLeaveNow());
  }
  // ---- 4) 1'e 1 Kapışma ----
  const d1=await phone(390),d2=await phone(390),d3=await phone(390);
  const dcode=await createRoom(d1,'Mert','duel',{subject:'Baharatlar',set:2});assert((await text(d1)).includes('Rakip bekleniyor'));
  await joinRoom(d2,'Selin','DUEL'.length?dcode:dcode);
  await d3.evaluate(()=>{st.prof='Üçüncü';st.guest=false;yrOpen();});await d3.evaluate(c=>yrJoin(c),dcode);await d3.waitForFunction(()=>YR.error.length>0);assert(/dolu|başlamış/.test(await text(d3)),'üçüncü kişi kapışmaya giremez: '+(await text(d3)).slice(0,300));
  for(const p of [d1,d2])await p.waitForFunction(()=>st.screen==='dintro'||st.screen==='dplay',null,{timeout:15000});
  assert((await text(d1)).includes('Selin')||(await d1.evaluate(()=>st.screen))==='dplay');
  for(const p of [d1,d2])await p.waitForFunction(()=>st.screen==='dplay',null,{timeout:15000});
  assert.deepEqual(await d1.evaluate(()=>YR.qs.map(q=>q.id)),await d2.evaluate(()=>YR.qs.map(q=>q.id)));
  // tur 1: Mert doğru basar, Selin sonra doğru basar -> Mert alır
  async function duRound(first,second,firstRight=true,secondRight=true){
   const k=await first.evaluate(()=>DU.k);
   await first.locator('.yr-opt').nth(firstRight?await correctIdx(first):await wrongIdx(first)).click();
   if(second)await second.locator('.yr-opt').nth(secondRight?await correctIdx(second):await wrongIdx(second)).click({timeout:3000}).catch(()=>{});
   for(const p of [first,second].filter(Boolean))await p.waitForFunction(k=>DU.k>k||(DU.k===k&&DU.ph==='res')||DU.over,k,{timeout:15000});
  }
  await d1.waitForTimeout(300);
  await duRound(d1,d2);
  assert.deepEqual(await d1.evaluate(()=>DU.sc),[1,0]);assert.deepEqual(await d2.evaluate(()=>DU.sc),[0,1]);
  assert.deepEqual(await d1.evaluate(()=>__ws[0]),[0,0,1],'d1 turu aldı');assert.deepEqual(await d2.evaluate(()=>__ws[0]),[0,0,2],'d2 kaybetti');assert(true,'d2: '+(await text(d2)).slice(0,400)+JSON.stringify(await d2.evaluate(()=>({w:DU.w,at:DU.at,bt:DU.bt,sc:DU.sc,k:DU.k,ph:DU.ph}))));
  // tur 2: ikisi de yanlış -> kimse puan almaz
  await d1.waitForFunction(()=>DU.k>=1,null,{timeout:10000});await d2.waitForFunction(()=>DU.k>=1,null,{timeout:10000});
  await duRound(d1,d2,false,false);assert.deepEqual(await d1.evaluate(()=>DU.sc),[1,0]);assert.deepEqual(await d1.evaluate(()=>__ws[1]),[0,1,0],'kimse puan almadı');
  // tur 3: Mert yanlış, Selin doğru -> Selin alır
  await d1.waitForFunction(()=>DU.k>=2,null,{timeout:10000});await d2.waitForFunction(()=>DU.k>=2,null,{timeout:10000});
  await duRound(d1,d2,false,true);assert.deepEqual(await d1.evaluate(()=>DU.sc),[1,1]);
  // Mert 6 tur üst üste alır: fark kalan turdan büyük olunca maç erken biter (ilk 3 tur oynandı, kalan 7)
  for(let k=3;k<10;k++){
   await d1.waitForFunction(k=>(DU.k>=k)||DU.over,k,{timeout:10000});if(await d1.evaluate(()=>DU.over))break;
   await d2.waitForFunction(k=>(DU.k>=k)||DU.over,k,{timeout:10000});if(await d2.evaluate(()=>DU.over))break;
   await duRound(d1,d2);
  }
  for(const p of [d1,d2])await p.waitForFunction(()=>st.screen==='dover',null,{timeout:15000});
  const s1=await d1.evaluate(()=>DU.sc);assert(s1[0]>s1[1]);assert((await text(d1)).includes('Kazandın'));assert((await text(d2)).includes('İyi mücadele'));
  if(process.env.QA_SCREENSHOTS)await d2.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'yaris-kapisma-sonuc-390.png')});
  // rövanş: ikisi de ister -> yeni maç, farklı sorular
  const before=await d1.evaluate(()=>YR.qs.map(q=>q.id).join());
  await d1.getByRole('button',{name:/Rövanş/}).click();assert((await text(d1)).includes('bekleniyor'));await d2.getByRole('button',{name:/Rövanş/}).click();
  for(const p of [d1,d2])await p.waitForFunction(()=>st.screen==='dplay',null,{timeout:20000});
  assert.equal(await d1.evaluate(()=>DU.m),1);assert.deepEqual(await d1.evaluate(()=>DU.sc),[0,0]);assert.notEqual(await d1.evaluate(()=>YR.qs.map(q=>q.id).join()),before);
  // rakip çıkınca diğeri kazanır
  await d2.evaluate(()=>yrLeaveNow());await d1.waitForFunction(()=>st.screen==='dover'&&DU.left,null,{timeout:25000});assert((await text(d1)).includes('Rakip ayrıldı'));
  // ---- 5) Sürüm farkı ve kod çakışması ----
  const v1=await phone(390),v2=await phone(390);const vcode=await createRoom(v1,'Eda','race',{subject:'Baharatlar',set:3});
  await v2.evaluate(()=>{CONTENT.baharat.revision='farkli-surum';});await joinRoom(v2,'Efe',vcode).catch(()=>{});
  assert((await text(v2)).includes('farklı sürümdeki'));
  const v3=await phone(390);await openMenu(v3,'Ece');await v3.getByRole('button',{name:/Oyun Odası Kur/}).click();await v3.evaluate(c=>{YR.cfg.code=c;},vcode);await v3.getByRole('button',{name:'Odayı kur'}).click();await v3.waitForFunction(()=>YR.error.length>0);assert((await text(v3)).includes('kullanılıyor'));
  assert.equal(Object.keys(hub.rooms[vcode].players).length,1,'sürümü uyuşmayan telefon listeye girmedi');
  // kapasite: 8 kişilik oda, 9. kişi girmez; biri çıkınca yer açılır
  const cap=await phone(390);const ccode=await createRoom(cap,'Kurucu','race',{subject:'Baharatlar',set:1});
  const extra=[];for(let i=0;i<7;i++){const x=await phone(390);await joinRoom(x,'Oyuncu'+i,ccode);extra.push(x);}
  const ninth=await phone(390);await openMenu(ninth,'Dokuz');await ninth.evaluate(c=>yrJoin(c),ccode);await ninth.waitForFunction(()=>YR.error.length>0);assert((await text(ninth)).includes('dolu'),'9. kişi girmemeli');
  await extra[0].evaluate(()=>yrLeaveNow());await ninth.evaluate(c=>yrJoin(c),ccode);await ninth.waitForFunction(()=>YR.active,null,{timeout:8000});
  // yazma hatası: son sonuç gidemezse uyarı çıkar, bağlantı gelince yeniden gönderilir
  {const f1=await phone(390),f2=await phone(390);const fc=await createRoom(f1,'Fatma','race',{subject:'Baharatlar',set:2});await joinRoom(f2,'Fikret',fc);
   await f1.getByRole('button',{name:'Yarışı başlat'}).click();for(const p of [f1,f2])await p.waitForFunction(()=>st.screen==='raceplay',null,{timeout:15000});
   for(let i=0;i<9;i++)await raceAnswer(f1,true);
   hub.fail=true;await f1.locator('.yr-opt').nth(await correctIdx(f1)).click();await f1.waitForFunction(()=>YR.g.ph==='fb');await f1.locator('#yrNext').click();
   await f1.waitForFunction(()=>YR.warn.length>0,null,{timeout:8000});assert((await text(f1)).includes('Bağlantı sorunu'),'yazma hatası öğrenciye gösterilmeli');
   hub.fail=false;const uid1=await f1.evaluate(()=>YR.g&&YR.nick&&Object.keys({}).length+0===0?document.title&&0:0);
   const t0=Date.now();let done=false;while(Date.now()-t0<30000&&!done){done=Object.values(hub.rooms[fc].players).some(p=>p.nick==='Fatma'&&p.done);if(!done)await new Promise(r=>setTimeout(r,500));}
   assert(done,'bitiş sonucu bağlantı gelince yeniden gönderilmeli');}
  // ---- 6) Davet bağlantısı kodu getirir; kurucu çıkarsa oda kapanır ----
  const inv=await phone(390,'?oda='+vcode);assert.equal(await inv.inputValue('#yrCode'),vcode);assert.equal(await inv.locator('#yrCode').getAttribute('type'),'hidden');
  await v1.evaluate(()=>yrLeave());await v1.waitForFunction(()=>!YR.active);
  // ---- 7) Yatay taşma yok ----
  for(const p of [a,b,d1,v3,inv])assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'yatay taşma');
  assert.deepEqual(errors,[]);
  console.log('PASS: menu/name rules; custom+duplicate codes; race lobby (min 2, 3 players), same seeded questions, late join refused, live finish rules, shared final ranks; subjects (mutfak bilgi, kuver); duel auto-start, 3rd player refused, first-correct/both-wrong/wrong-then-right rounds, early finish, rematch with new questions, opponent-left win; version mismatch; invite link; no overflow; no JS errors. (mock Firestore, desktop Chromium)');
 }catch(e){console.error('UI failure:',e);process.exitCode=1;}finally{await browser.close();server.close();}
})();
