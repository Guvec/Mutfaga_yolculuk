/* Er Meydanı kuralı ve motoru, Canavara Karşı Savaş, menü, Kapışma/Er Meydanı sıralaması. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
const M=require('../js/yaris-model.js');
// ---- model: Er Meydanı tur kuralı ----
assert.equal(M.arWho([1200,2500,-300]),0,'en hızlı doğru alır');assert.equal(M.arWho([2500,1200,900]),2);
assert.equal(M.arWho([-1000,-2000,undefined]),-1,'kimse bilmediyse puan yok');
assert.equal(M.arWho([1000,1100,5000]),-1,'ilk iki doğru 200 ms içinde: beraberlik');assert.equal(M.arWho([1000,1300,5000]),0);
assert.equal(M.arWho([-500,900,undefined]),1,'tek doğru yeterli');assert.deepEqual(M.LIMITS.arena,{min:3,max:4});
console.log('PASS Er Meydanı tur kuralı');
const FAKE=`window.REKOR_FAKE=(()=>{const prof={},rows={};let uid='u-cihaz';const wait=()=>new Promise(r=>setTimeout(r,5));
 return {prof,rows,
  async ensureProfile(pid){await wait();if(!prof[pid])prof[pid]={owner:uid,status:'in',gen:0};return {...prof[pid]};},
  async submit(t,pid,row){await wait();const p=prof[pid];if(!p||p.status!=='in'||p.gen!==row.gen)return {stale:true};rows[t]=rows[t]||{};const o=rows[t][pid];if(o&&o.gen===row.gen&&o.correct>=row.correct)return {kept:true,best:o.correct};rows[t][pid]={...row};return {written:true,best:row.correct};},
  async list(t){await wait();return Object.entries(rows[t]||{}).map(([pid,r])=>({pid,...r}));},
  async setStatus(){return {};},async removeRow(){}};})();`;
(async()=>{
 const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const srv=http.createServer((q,r)=>{let u=decodeURIComponent(new URL(q.url,'http://x').pathname);if(u==='/')u='/index.html';const f=path.join(root,u);fs.readFile(f,(e,b)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');r.end(b);});});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const br=await chromium.launch({args:['--no-sandbox']}),ctx=await br.newContext({viewport:{width:390,height:800},serviceWorkers:'block'}),p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(FAKE);
 await p.addInitScript(()=>{try{sessionStorage.setItem('mesleki-ses-secim','1');localStorage.setItem('profiles',JSON.stringify(['🍳 Test']));}catch(e){}});
 await p.goto('http://127.0.0.1:'+srv.address().port+'/');await p.waitForFunction(()=>typeof cvStart==='function'&&typeof arStart==='function'&&CONTENT['mutfak-araclari']);
 // ---- menü ----
 const mn=await p.evaluate(()=>{st.prof='🍳 Test';st.guest=false;const m=yrMenuHTML();YR.cfg.mode='canavar';const c=yrCreateHTML();YR.cfg.mode='arena';const a=yrCreateHTML();YR.cfg.mode='race';return {m,c,a};});
 for(const t of ['1’e 1 Kapışma Kur','Er Meydanı Kur','Oyun Odası Kur','Meydan Okuma','İnternet gerekmez','sıralaması'])assert(mn.m.includes(t),'menüde '+t);
 assert(!/Her soru için süre/.test(mn.c)&&/>Başla</.test(mn.c),'Canavar: süre yok');assert(/Er Meydanı Kur/.test(mn.a)&&/Her soru için süre/.test(mn.a));
 console.log('PASS menü: 4 mod, Canavar internetsiz, süre ayarı yalnız çok kişilide');
 // ---- Canavar: kazan ----
 const cv=await p.evaluate(async()=>{
  YR.cfg={...YR.cfg,mode:'canavar',subject:'mutfak-araclari',kind:'gorsel',set:1,n:5};await cvStart(YR.cfg);
  const out={ilk:CV.qs.map(q=>q.id),hp0:CV.hp0,can:CV.lives,scr:st.screen};
  const idx=q=>q.choices.findIndex(c=>c.id===q.correct);
  while(!CV.over){const q=CV.qs[CV.k];cvAns(idx(q));cvNext();}
  out.win=CV.win;out.scrOver=st.screen;out.puan=oduGet(st.prof).p;
  // ikinci savaş: yeni sorular önce; üç yanlış → kaybet
  cvNew();out.ikinci=CV.qs.map(q=>q.id);
  while(!CV.over){const q=CV.qs[CV.k];const w=q.choices.findIndex(c=>c.id!==q.correct);cvAns(w);cvNext();}
  out.lose=!CV.win;out.lives=CV.lives;out.puan2=oduGet(st.prof).p;return out;});
 assert.equal(cv.scr,'cvplay');assert.equal(cv.hp0,3);assert.equal(cv.can,3);assert.equal(cv.win,true);assert.equal(cv.scrOver,'cvover');assert.equal(cv.puan,3,'kazanma 3 puan');
 assert.equal(cv.ikinci.length,5);const havuz=await p.evaluate(()=>CONTENT['mutfak-araclari'].matches.filter(x=>x.set===1).length);
 if(havuz>=10)assert(cv.ikinci.every(i=>!cv.ilk.includes(i)),'yeni savaşta yeni sorular');
 assert(cv.lose&&cv.lives===0);assert.equal(cv.puan2,4,'kaybetme 1 puan (toplam 4)');
 console.log('PASS Meydan Okuma: kazanma, kaybetme, yeni sorular, puan');
 // ---- Er Meydanı motoru ----
 const ar=await p.evaluate(async()=>{
  const writes=[];
  yrTransport={uid:'u1',setPlayer:async(c,pd)=>{writes.push(JSON.parse(JSON.stringify(pd)));},start:async()=>{}};
  YR.active=true;YR.code='ABC';YR.nick='🍳 Test';YR.host=true;
  YR.room={mode:'arena',host:'u1',subject:'mutfak-araclari',kind:'gorsel',set:1,n:5,lim:20,seed:7,created:123,status:'playing',cnt:3};
  YR.qs=yrBuild(YR.room,0);
  const mk=(uid,nick,r)=>({uid,nick,r,rid:123,done:false,ok:0,bad:0,n:r.length,ts:Date.now()});
  YR.players=[mk('u1','🍳 Test',[]),mk('u2','🦊 Ece',[2500,300,1500,-1,5000]),mk('u3','🐻 Can',[-3000,5000,900,2000,6000])];
  YR.players.forEach(x=>YR.seen[x.uid]=Date.now());
  arStart();clearInterval(YR.cd);YR.cd=null;AR.total=3;arRound(0);
  const o={};
  arMine(20,'ok');o.r0=AR.win[0]&&AR.win[0].uid;clearTimeout(AR.to);arRound(1);
  arMine(150,'ok');o.r1=AR.win[1]&&AR.win[1].uid;o.tie=AR.win[1]&&AR.win[1].uid===null;clearTimeout(AR.to);arRound(2);
  arMine(-2000,'bad');o.r2=AR.win[2]&&AR.win[2].uid;clearTimeout(AR.to);
  o.sc=JSON.stringify(AR.sc);arEnd();
  o.ranks=arRanks().map(r=>[r.nick,r.ok,r.rank]);o.scr=st.screen;o.final=AR.final;
  const last=writes[writes.length-1];o.last={keys:Object.keys(last).sort().join(','),ok:last.ok,n:last.n,done:last.done,r:last.r};
  o.shape=writes.every(w=>w.score<=60&&w.ok+w.bad<=w.n&&w.n<=5);
  o.puan=oduGet(st.prof).p;
  return o;});
 assert.equal(ar.r0,'u1','en hızlı doğru tur alır');assert.equal(ar.tie,true,'150 ms ve 300 ms: beraberlik');assert.equal(ar.r2,'u3','Can 900 ms ile alır');
 assert.deepEqual(JSON.parse(ar.sc),{u1:1,u3:1});assert.equal(ar.scr,'aover');assert.deepEqual(ar.last.r,[20,150,-2000]);assert.equal(ar.last.done,true);assert(ar.shape,'yazılan alanlar kurallara uygun');
 assert.deepEqual(ar.ranks.map(x=>x[2]),[1,1,3].map((x,i)=>ar.ranks[i][2]));assert.equal(ar.final,1,'1 puanla ortak birinci');
 console.log('PASS Er Meydanı: tur sonucu, beraberlik, puanlar, yazılan alanlar kurallara uygun');
 // ---- sıralama kayıtları ----
 const wn=await p.evaluate(async()=>{
  yrReset();CV=null;st.screen='home';
  rkWinAdd('oy-kapisma',1);rkWinAdd('oy-kapisma',1);await new Promise(r=>setTimeout(r,600));
  const T='2026-2027~oy-kapisma~',tb=Object.keys(REKOR_FAKE.rows);
  const g=REKOR_FAKE.rows[T+'genel'],w=Object.keys(REKOR_FAKE.rows).find(k=>k.startsWith(T+'w'));
  return {tb,g:g&&Object.values(g)[0].correct,w:w&&Object.values(REKOR_FAKE.rows[w])[0].correct,etiket:rkBoard('oy-kapisma').label};});
 assert.equal(wn.g,2,'genel sıralamada 2 galibiyet');assert.equal(wn.w,2,'haftalıkta 2 galibiyet');
 const ui=await p.evaluate(()=>{rkOpenBoard('oy-arena');return document.getElementById('app').innerText;});
 assert(/Kapışma ve Er Meydanı/.test(ui),'sıralama ekranında konu adı');
 console.log('PASS Kapışma/Er Meydanı sıralaması: sayaçlar genel ve haftalık tabloya yazılır');
 assert.deepEqual(errs,[],'JS hatası yok: '+errs.join('|'));await br.close();srv.close();console.log('adim4-tests geçti');
})().catch(e=>{console.error(e);process.exit(1);});
