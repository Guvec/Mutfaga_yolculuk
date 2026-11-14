/* Blitz ve 2’ye 2 (4 telefon) arayüz testi. Bellek içi sahte bağlantı; Firestore kurallarını denemez. */
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
  watchList(on){on([]);return Promise.resolve(()=>{});}
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
 const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://x');const f=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}const ext=path.extname(f);res.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
 await new Promise(r=>server.listen(0,r));const url='http://localhost:'+server.address().port;
 const browser=await chromium.launch({executablePath:fs.existsSync('/usr/bin/google-chrome')?'/usr/bin/google-chrome':undefined}),errors=[];
 async function phone(){
  const c=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await c.exposeFunction('__hub',async(op,...a)=>{try{return hub.ops[op](...a);}catch(e){throw new Error(e.message);}});
  await c.route('**/js/yaris-baglanti.js',r=>r.fulfill({contentType:'text/javascript',body:MOCK}));
  await c.route('**/js/yaris-ayar.js',r=>r.fulfill({contentType:'text/javascript',body:'window.YARIS_FIREBASE_CONFIG={projectId:"demo-test",apiKey:"demo"};'}));
  const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(url+'/');await p.waitForFunction(()=>typeof bzKur==='function'&&CONTENT.baharat&&CONTENT['mutfak-araclari']&&CONTENT['bulasik-makinesi-temizligi']);return p;
 }
 const ad=['🦊 Kurnaz Tilki','🐼 Cesur Panda','🐻 Sakin Ayı','🐥 Huzurlu Civciv'];
 async function giris(p,n){await p.evaluate(n=>{if(st.modalOpen)closeModal();st.prof=n;st.guest=false;yrOpen();},n);}
 try{
  const ps=[await phone(),await phone(),await phone(),await phone()];
  await giris(ps[0],ad[0]);
  await ps[0].evaluate(()=>bzKur('takim'));
  await ps[0].waitForFunction(()=>YR.active&&st.screen==='racelobby',null,{timeout:15000});
  const code=await ps[0].evaluate(()=>YR.code);
  assert(/^takim-/.test(await ps[0].evaluate(()=>YR.room.rev)),'oda türü takim');
  for(let i=1;i<3;i++){await giris(ps[i],ad[i]);await ps[i].evaluate(c=>yrJoin(c),code);await ps[i].waitForFunction(()=>YR.active&&st.screen==='racelobby');}
  for(const p of ps.slice(0,3))await p.evaluate(()=>yrSetReady());
  await ps[0].waitForFunction(()=>YR.players.length===3);
  assert(/tam 4 oyuncu/.test(await ps[0].evaluate(()=>yrStartNeden())),'3 kişiyle başlamaz');
  await giris(ps[3],ad[3]);await ps[3].evaluate(c=>yrJoin(c),code);await ps[3].waitForFunction(()=>YR.active&&st.screen==='racelobby');await ps[3].evaluate(()=>yrSetReady());
  await ps[0].waitForFunction(()=>YR.players.length===4&&YR.players.every(p=>p.ready)&&!yrStartNeden());
  const lobi=await ps[1].innerText('#app');assert(lobi.includes('Ateş Takımı')&&lobi.includes('Fesleğen Takımı'),'lobide takımlar');
  const t0=await ps[0].evaluate(()=>bzTakimlar().map(t=>t.map(p=>p.uid).join(',')).join('|')),t1=await ps[2].evaluate(()=>bzTakimlar().map(t=>t.map(p=>p.uid).join(',')).join('|'));
  assert.strictEqual(t0,t1,'takımlar her telefonda aynı');
  await ps[0].evaluate(()=>yrStart());
  for(const p of ps)await p.waitForFunction(()=>st.screen==='raceplay'&&YR.g&&YR.g.bz,null,{timeout:15000});
  assert((await ps[0].innerText('#app')).includes('puan'),'blitz üst çubuğu');
  // her telefon: 2 doğru, 1 yanlış; ardından son 20 saniyeye atla, 1 doğru (2 puan)
  const cevap=async(p,dogru)=>{const k=await p.evaluate(()=>YR.g.k);await p.evaluate(d=>{const q=YR.qs[YR.g.k],c=q.choices.findIndex(x=>x.id===q.correct);yrRaceAnswer(d?c:(c+1)%q.choices.length);},dogru);await p.waitForFunction(k=>YR.g.k===k+1||YR.g.done,k,{timeout:5000});};
  for(const p of ps){await cevap(p,true);await cevap(p,true);await cevap(p,false);}
  for(const p of ps)await p.evaluate(()=>{YR.g.bz.t0=performance.now()-(BZ.SURE-15000);});
  for(const p of ps)await cevap(p,true);
  assert.strictEqual(await ps[0].evaluate(()=>YR.g.bz.puan),4,'son 20 saniyede doğru 2 puan');
  for(const p of ps)await p.evaluate(()=>{YR.g.bz.t0=performance.now()-BZ.SURE-10;});
  for(const p of ps)await p.waitForFunction(()=>st.screen==='raceover',null,{timeout:5000});
  await ps[0].waitForFunction(()=>yrAllDone(),null,{timeout:5000});
  const son=await ps[0].innerText('#app');
  assert(son.includes('Ateş Takımı')&&/8\s*puan/.test(son),'takım puanı 8');
  assert(son.includes('Berabere'),'eşit takım puanı berabere');
  await ps[1].waitForFunction(()=>yrAllDone(),null,{timeout:5000});
  const pl=await ps[1].evaluate(()=>YR.players.map(p=>p.score+'/'+p.n+'/'+p.done));
  assert(pl.every(x=>x==='4/4/true'),'kayıtlar: '+pl);
  /* Blitz tek başına ve Kapışma "Tüm konular" ile kurulabilir. */
  const q=await phone();await giris(q,'🐢 Garson Kaplumbağa');
  await q.evaluate(()=>{yrCreateOpen('duel');yrCfg('scope','butun');});
  assert((await q.innerText('#app')).includes('Tüm konular'),'kapışma tüm konular');
  await q.evaluate(()=>yrCreate());await q.waitForFunction(()=>YR.active&&st.screen==='racelobby',null,{timeout:15000});
  assert.strictEqual(await q.evaluate(()=>YR.room.scope),'butun');
  await q.evaluate(()=>yrLeaveNow());await q.evaluate(()=>bzKur('blitz'));await q.waitForFunction(()=>YR.active&&st.screen==='racelobby',null,{timeout:15000});
  assert(/^blitz-/.test(await q.evaluate(()=>YR.room.rev))&&(await q.innerText('#app')).includes('120 saniye'),'blitz lobisi');
  assert.deepStrictEqual(errors,[],'sayfa hatası yok');
  console.log('blitz-ui-tests: tamam');
 }catch(e){console.error(e);console.error(errors);process.exitCode=1;}finally{await browser.close();server.close();}
})();
