/* Ödüller: puan, koleksiyon, yıldız, günlük sınır, belge. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const srv=http.createServer((q,r)=>{let u=decodeURIComponent(new URL(q.url,'http://x').pathname);if(u==='/')u='/index.html';const f=path.join(root,u);fs.readFile(f,(e,b)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');r.end(b);});});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const br=await chromium.launch({args:['--no-sandbox']}),ctx=await br.newContext({viewport:{width:390,height:800},serviceWorkers:'block'}),p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{try{sessionStorage.setItem('mesleki-ses-secim','1');localStorage.setItem('profiles',JSON.stringify(['🍳 Test']));}catch(e){}});
 await p.goto('http://127.0.0.1:'+srv.address().port+'/');await p.waitForFunction(()=>typeof oduKazan==='function');
 const r=await p.evaluate(()=>{
  const out={};st.prof=null;st.guest=true;out.misafir=oduKazan('kapisma','win');
  st.prof='🍳 Test';st.guest=false;
  out.win=oduKazan('kapisma','win');out.draw=oduKazan('kapisma','draw');out.lose=oduKazan('kapisma','lose');out.left=oduKazan('kapisma','left');
  out.oda=oduKazan('oda',null,{ok:9,total:10});out.odaTam=oduKazan('oda',null,{ok:10,total:10});out.odaDusuk=oduKazan('oda',null,{ok:2,total:10});
  out.p1=oduGet(st.prof).p;
  for(let i=0;i<30;i++)oduKazan('kapisma','win');
  out.sinir=oduGet(st.prof).p;out.gp=oduGet(st.prof).gp;
  const o=oduGet(st.prof);o.p=24;oduSet(st.prof,o);out.s24=oduSeviye(24);out.s25=oduSeviye(25);out.y=[oduYildiz(99),oduYildiz(100),oduYildiz(500)];out.sn=oduSonraki(30);
  o.g='2000-01-01';o.p=24;oduSet(st.prof,o);oduKazan('kapisma','lose');out.yeni=document.getElementById('toast').textContent;out.lv=oduSeviye(oduGet(st.prof).p);
  return out;
 });
 assert.equal(r.misafir,0,'misafir puan almaz');assert.deepEqual([r.win,r.draw,r.lose,r.left],[3,2,1,0]);assert.deepEqual([r.oda,r.odaTam,r.odaDusuk],[2,3,1]);
 assert.equal(r.p1,12);assert.equal(r.sinir,40,'günlük sınır 40');assert.equal(r.gp,40);
 assert.equal(r.s24,0);assert.equal(r.s25,1);assert.deepEqual(r.y,[0,1,3]);assert.equal(r.sn,45);
 assert(/Yeni ödül: 🍦 Dondurma/.test(r.yeni),'25. puanda dondurma açılır: '+r.yeni);assert.equal(r.lv,1);
 console.log('PASS puan kuralları, günlük sınır, eşikler, yeni ödül bildirimi');
 const e=await p.evaluate(()=>{oduAc();const ilk=document.getElementById('app').innerText;const sec=/Tatlı koleksiyonu/.test(ilk)&&/Yemek koleksiyonu/.test(ilk);oduKolSec('yemek');const a=document.getElementById('app').innerText;
  const o=oduGet(st.prof);o.p=500;oduSet(st.prof,o);render();const b=document.getElementById('app').innerText;return {sec,a:/Yemek koleksiyonu/.test(a)&&/Pizza/.test(a),b:/⭐ ⭐ ⭐/.test(b)&&/Başarı Belgemi/.test(b),btn:!!document.querySelector('button[onclick="oduBelge()"]'),scr:st.screen};});
 assert(e.sec&&e.a&&e.b&&e.btn&&e.scr==='odul');console.log('PASS ilk açılışta koleksiyon seçimi; yemek koleksiyonu; 3 yıldızda belge düğmesi');
 const b=await p.evaluate(()=>{oduBelge();const im=document.querySelector('.odul-belge');return {src:im&&im.src.startsWith('data:image/png'),dl:!!document.getElementById('oduIndir'),b:oduGet(st.prof).b};});
 assert(b.src&&b.dl&&b.b);console.log('PASS başarı belgesi resim olarak üretilir ve kaydedilebilir');
 const q=await p.evaluate(()=>{closeModal();back();return st.screen;});assert.equal(q,'home');
 assert.deepEqual(errs,[],'JS hatası yok');await br.close();srv.close();console.log('adim3-tests geçti');
})().catch(e=>{console.error(e);process.exit(1);});
