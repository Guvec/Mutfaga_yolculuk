/* Karışık setler, 10/15/20 soru, rövanşta yeni sorular, oyun adı otomatik, kaydırmasız soru düzeni. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const srv=http.createServer((q,r)=>{let u=decodeURIComponent(new URL(q.url,'http://x').pathname);if(u==='/')u='/index.html';const f=path.join(root,u);fs.readFile(f,(e,b)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');r.end(b);});});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const br=await chromium.launch({args:['--no-sandbox']}),ctx=await br.newContext({viewport:{width:390,height:800},serviceWorkers:'block'}),p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:'+srv.address().port+'/');await p.waitForFunction(()=>typeof yrOpen==='function'&&typeof adAuto==='function');
 /* 1) Maç uzunlukları */
 assert.deepStrictEqual(await p.evaluate(()=>YarisModel.MATCH_CHOICES.map(x=>x.n)),[10,15,20]);
 /* 2) Karışık setler: varsayılan set 0; 20 soru çıkar; farklı takımlardan gelir; rövanşlarda tekrar yok */
 await p.evaluate(()=>yrReady('baharat'));
 const r=await p.evaluate(()=>{
  const d=yrData('baharat'),sp={subject:'baharat',kind:'gorsel',set:0,n:20},q0=YarisModel.buildQuestions(d,sp,11);
  const sets=new Set(q0.map(q=>String(q.id).split('-')[1]));
  const room={subject:'baharat',kind:'gorsel',set:0,n:10,seed:99};
  const a=yrBuild(room,0).map(q=>q.id),b=yrBuild(room,1).map(q=>q.id),c=yrBuild(room,2).map(q=>q.id);
  return {def:YR.cfg.set,n:q0.length,sets:sets.size,ab:a.filter(x=>b.includes(x)).length,bc:b.filter(x=>c.includes(x)).length,ac:a.filter(x=>c.includes(x)).length};
 });
 assert.strictEqual(r.def,0);assert.strictEqual(r.n,20);assert(r.sets>=3,'birden çok takımdan: '+r.sets);
 assert.strictEqual(r.ab+r.bc+r.ac,0,'rövanşlarda aynı soru gelmez');
 /* 3) Profil yoksa oyun adı kendiliğinden verilir; profil varsa doğrudan girilir */
 await p.evaluate(()=>{try{localStorage.removeItem('profiles');}catch(e){}st.prof=null;st.guest=true;yrOpen();});
 await p.waitForFunction(()=>st.prof&&!st.guest&&st.screen==='racemenu',null,{timeout:8000});
 const nm=await p.evaluate(()=>st.prof);assert(nm&&!/Misafir/.test(nm),'oyun adı verildi: '+nm);
 await p.evaluate(()=>{closeModal&&closeModal();yrReset();st.screen='home';yrOpen();});
 assert.strictEqual(await p.evaluate(()=>st.screen),'racemenu');assert.strictEqual(await p.evaluate(()=>st.prof),nm,'profil varken ad değişmez');
 /* 4) Soru ekranı: seçenekler görselle aynı ekranda (390x650) */
 await p.setViewportSize({width:390,height:650});
 const m=await p.evaluate(()=>{
  YR.room={mode:'duel',host:'a',subject:'baharat',kind:'gorsel',set:0,n:10,lim:20,seed:5,created:1,status:'playing'};YR.nick='A';YR.active=true;
  YR.qs=YarisModel.buildQuestions(yrData('baharat'),{subject:'baharat',kind:'gorsel',set:0,n:10},5);
  DU={m:0,k:2,total:10,myR:[],prevR:[],ph:'q',t0:performance.now(),sc:[0,0],over:false,onick:'B',lim:20000,iAmHost:true};st.screen='dplay';render();
  return {cls:document.body.classList.contains('yr-oyun'),bottom:Math.round(document.querySelector('.yr-opts').getBoundingClientRect().bottom),n:document.querySelectorAll('.yr-opt').length};});
 assert(m.cls&&m.n===4&&m.bottom<=650,'seçenekler kaydırmadan görünür: '+JSON.stringify(m));
 assert.deepStrictEqual(errs,[],'JS hatası yok: '+errs.join('|'));
 console.log('adim5-tests geçti');await br.close();srv.close();
})().catch(e=>{console.error(e);process.exit(1);});
