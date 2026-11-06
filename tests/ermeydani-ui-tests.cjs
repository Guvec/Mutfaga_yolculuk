/* Er Meydanı (4 telefon) arayüz testi. Firestore yerine bellek içi sahte bağlantı kullanır (iki telefon aynı depoyu paylaşır).
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
  async getPlayer(code){const s=await window.__hub('state',code);return s.players.find(p=>p.uid===this.uid);}
  async arenaExpire(){return;}
  async leave(code,lobby,host){return window.__hub('leave',this.uid,code,lobby,host);}
  watch(code,onRoom,onPlayers){let last='';const t=setInterval(async()=>{const s=await window.__hub('state',code);const j=JSON.stringify(s);if(j!==last){last=j;onRoom(s.room);onPlayers(s.players);}},60);return [()=>clearInterval(t)];}
 }
 window.YarisFirebase=YarisFirebase;
})();`;
const hub={rooms:{},n:0,ops:{
 uid(){return 'u'+(++hub.n);},
 peek(code){const r=hub.rooms[code];return r?r.room:null;},
 create(uid,spec,wanted){const code=wanted||('R'+Math.random().toString(36).slice(2,6).toUpperCase());if(hub.rooms[code])throw Error('Bu kod kullanılıyor. Başka bir kod seç.');const room={...spec,host:uid,status:'lobby',guest:null,created:Date.now(),qv:1};if(spec.mode==='race'||spec.mode==='arena')room.cnt=1;hub.rooms[code]={room,players:{}};return {code,room};},
 join(uid,code,nick,pd){const r=hub.rooms[code];if(!r)throw Error('Oda bulunamadı. Kodu kontrol et.');const room=r.room;if(room.host!==uid){if(room.status!=='lobby')throw Error('Yarış başlamış, katılamazsın.');if(room.mode==='duel'){if(room.guest&&room.guest!==uid)throw Error('Bu kapışma dolu.');room.guest=uid;}else if(!r.players[uid]){if((room.cnt||1)>=(room.mode==='arena'?4:8))throw Error('Bu oda dolu (en çok '+(room.mode==='arena'?4:8)+' kişi).');room.cnt=(room.cnt||1)+1;}}r.players[uid]={...pd,rid:room.created};return room;},
 set(uid,code,pd){if(hub.fail)throw Error('ağ yok');const r=hub.rooms[code];if(!r)return;r.players[uid]={...pd};},
 start(uid,code){const r=hub.rooms[code];if(r.room.host!==uid)throw Error('izin yok');if(r.room.mode==='arena')r.room.roster=Object.keys(r.players).sort();r.room.status='playing';},
 leave(uid,code,lobby,host){const r=hub.rooms[code];if(!r)return;if(lobby){if(r.players[uid]&&!host&&r.room.mode==='race'&&r.room.cnt>1)r.room.cnt--;delete r.players[uid];if(host)delete hub.rooms[code];}},
 state(code){const r=hub.rooms[code];return r?{room:r.room,players:Object.entries(r.players).map(([uid,p])=>({uid,...p,pending:false,fromCache:false}))}:{room:null,players:[]};}
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
  await require('./helpers/sound-choice.cjs')(p);await p.goto(url+'/'+query);await p.waitForFunction(()=>typeof yrOpen==='function'&&CONTENT.baharat&&CONTENT['mutfak-araclari']);await p.evaluate(()=>{const o=duResolve;duResolve=function(){o();(window.__ws=window.__ws||[]).push([DU.m,DU.k,DU.w]);};});return p;
 }
 const text=p=>p.locator('#app').innerText();
 async function openMenu(p,nick){await p.evaluate(n=>{st.prof=n;st.guest=false;yrOpen();},nick);}
 async function createRoom(p,nick,mode,cfg={}){
  await openMenu(p,nick);await p.getByRole('button',{name:mode==='duel'?/Kapışma Kur/:/Oyun Odası Kur/}).click();
  if(cfg.subject)await p.getByRole('button',{name:cfg.subject,exact:true}).click();
  await p.getByRole('button',{name:'Odayı kur'}).click();await p.waitForFunction(()=>YR.active&&st.screen==='racelobby');return p.evaluate(()=>YR.code);
 }
 async function joinRoom(p,nick,code){await openMenu(p,nick);await p.evaluate(c=>yrJoin(c),code);await p.waitForFunction(()=>YR.active&&st.screen==='racelobby');}
 const correctIdx=p=>p.evaluate(()=>{const q=YR.qs[st.screen==='dplay'?DU.k:YR.g.k];return q.choices.findIndex(c=>c.id===q.correct);});
 const wrongIdx=async p=>{const c=await correctIdx(p);return (c+1)%4;};
 async function raceAnswer(p,right){const k=await p.evaluate(()=>YR.g.k);await p.locator('.yr-opt').nth(right?await correctIdx(p):await wrongIdx(p)).click();await p.waitForFunction(k=>YR.g.ph==='fb'&&YR.g.k===k,k);await p.locator('#yrNext').click();}
 try{
  const a=await phone(),b=await phone(),c=await phone();
  const nick={a:'🦊 Kurnaz Tilki',b:'🐼 Cesur Panda',c:'🐻 Sakin Ayı'};
  await openMenu(a,nick.a);
  const mt=await text(a);for(const t of ['Er Meydanı Kur','1’e 1 Kapışma Kur','Oyun Odası Kur','Meydan Okuma'])assert(mt.includes(t),'menüde '+t);
  await a.getByRole('button',{name:/Er Meydanı Kur/}).click();
  await a.getByRole('button',{name:'Odayı kur'}).click();await a.waitForFunction(()=>YR.active&&st.screen==='racelobby');
  const code=await a.evaluate(()=>YR.code);
  assert((await text(a)).includes('En az üç kişi gerekir'));assert(await a.getByRole('button',{name:/Er Meydanı.nı başlat/}).isDisabled());
  await joinRoom(b,nick.b,code);await a.waitForFunction(()=>YR.players.length===2);assert(await a.getByRole('button',{name:/Er Meydanı.nı başlat/}).isDisabled(),'iki kişiyle başlamaz');
  await joinRoom(c,nick.c,code);await a.waitForFunction(()=>YR.players.length===3);
  assert(!(await a.getByRole('button',{name:/Er Meydanı.nı başlat/}).isDisabled()),'üç kişiyle başlar');
  const d=await phone();await openMenu(d,'Dördüncü');await d.evaluate(x=>yrJoin(x),code);await d.waitForFunction(()=>st.screen==='racelobby');
  const e5=await phone();await openMenu(e5,'Beşinci');await e5.evaluate(x=>yrJoin(x),code);await e5.waitForFunction(()=>YR.error.length>0);assert((await text(e5)).includes('dolu'),'beşinci kişi giremez');
  await a.waitForFunction(()=>YR.players.length===4);
  await a.getByRole('button',{name:/Er Meydanı.nı başlat/}).click();
  for(const p of [a,b,c,d])await p.waitForFunction(()=>st.screen==='aintro'||st.screen==='aplay',null,{timeout:15000});
  for(const p of [a,b,c,d])await p.waitForFunction(()=>st.screen==='aplay',null,{timeout:15000});
  assert.equal(await a.locator('.yr-opt').count(),4);assert(await a.locator('.spk').count()>=1,'Dinle düğmesi');
  const qs=await Promise.all([a,b,c,d].map(p=>p.evaluate(()=>YR.qs.map(q=>q.id+':'+q.correct).join(','))));assert(qs.every(x=>x===qs[0]),'dört telefonda aynı sorular');
  assert.equal(await a.evaluate(()=>AR.total),75);
  const answer=async(p,right,ms)=>p.evaluate(([right,ms])=>{const q=YR.qs[AR.k],i=q.choices.findIndex(c=>c.id===q.correct);AR.t0=performance.now()-ms;arAns(right?i:(i+1)%4);if(!AR.over)arNext();},[right,ms]);
  await answer(a,true,200);assert.equal(await a.evaluate(()=>AR.k),1);assert.equal(await b.evaluate(()=>AR.k),0);
  for(const [p,correct,ms] of [[a,4,200],[b,3,300],[c,1,500],[d,4,400]]){
   for(let k=0;k<correct;k++)await answer(p,true,ms);
   for(let k=0;k<4;k++)await answer(p,false,ms);
  }
  for(const p of [a,b,c,d])await p.waitForFunction(()=>st.screen==='aover'&&AR.finalized,null,{timeout:20000});
  const ranks=await Promise.all([a,b,c,d].map(p=>p.evaluate(()=>arRanks().map(r=>r.nick+':'+r.ok+':'+r.rank).sort().join('|'))));assert(ranks.every(x=>x===ranks[0]),'dört telefonda aynı kesin sıralama');
  assert(ranks[0].includes('Kurnaz Tilki:5:1'),ranks[0]);assert((await text(a)).includes('Birinci sensin'));assert(!(await text(b)).includes('Birinci sensin'));
  for(const p of [a,b,c,d]){const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert(!ov,'yatay taşma yok');}
  assert.deepEqual(errors,[],'JS hatası yok: '+errors.join('|'));
  console.log('PASS Er Meydanı (4 telefon): lobi sınırları, aynı sorular, bağımsız ilerleme, dört yanlışta bitiş, aynı kesin sıralama');
 }catch(e){console.error(e);process.exitCode=1;}
 await browser.close();server.close();
})();
