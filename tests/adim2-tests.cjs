/* "Bu 3 aracı çalış": çalışma kartları, sonra yalnız bu maddelerle deneme. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const srv=http.createServer((q,r)=>{let u=decodeURIComponent(new URL(q.url,'http://x').pathname);if(u==='/')u='/index.html';const f=path.join(root,u);fs.readFile(f,(e,b)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');r.end(b);});});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const br=await chromium.launch({args:['--no-sandbox']}),ctx=await br.newContext({viewport:{width:390,height:800},serviceWorkers:'block'}),p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{try{sessionStorage.setItem('mesleki-ses-secim','1');localStorage.setItem('profiles',JSON.stringify(['🍳 Test']));}catch(e){}});
 await p.goto('http://127.0.0.1:'+srv.address().port+'/');await p.waitForFunction(()=>typeof rkCalisBasla==='function'&&CONTENT['mutfak-araclari']);
 const r=await p.evaluate(async()=>{
  st.prof='🍳 Test';st.guest=false;st.subject='mutfak-araclari';
  const ms=CONTENT['mutfak-araclari'].matches.filter(x=>x.set===1).slice(0,5);
  const keys=ms.map(x=>'m|mutfak-araclari|1|'+x.id);
  {const pid=rkPid(st.prof,true),map=rkPek(pid);keys.forEach(k=>rkPekMark(map,k,rkPekKnown(k),false,null));rkPekSave(pid,map);}
  RK.tk={sess:1,prof:st.prof,kind:'m',arg:1,subject:'mutfak-araclari',keys,known:[],n:4,more:true};
  st.sess={id:1};
  const kart=rkTekrarHTML();
  rkCalisBasla();
  const h1=document.querySelector('#app h1')&&document.querySelector('#app h1').textContent,k1=document.querySelectorAll('.rk-cal-kart').length,spk=document.querySelectorAll('.rk-cal-kart .spk').length,sonraki=/Sıradaki 2 aracı çalış/.test(document.getElementById('app').innerText);
  rkCalisSonraki();const k2=document.querySelectorAll('.rk-cal-kart').length,h2=document.querySelector('#app h1').textContent,sonraki2=/Sıradaki/.test(document.getElementById('app').innerText);
  return {kart:/Bu 5 aracı çalış|Bu 3 aracı çalış/.test(kart),h1,k1,spk,sonraki,k2,h2,sonraki2,screen:st.screen};
 });
 assert(r.kart,'Oyun sonu kartında düğme');assert.equal(r.h1,'Bu 3 aracı çalış');assert.equal(r.k1,3);assert.equal(r.spk,3,'her kartta dinle');assert(r.sonraki);
 assert.equal(r.k2,2);assert.equal(r.h2,'Bu 2 aracı çalış');assert.equal(r.sonraki2,false);
 console.log('PASS 3 kart, sıradaki 2, dinle düğmeleri');
 const d=await p.evaluate(()=>{const c=RK.cal;const keys=c.keys.slice(c.pos,c.pos+3);rkCalisDene();return {screen:st.screen,n:st.board&&st.board.items.length,pek:st.sess&&st.sess.practice,keys:keys.length};});
 assert.equal(d.screen,'board');assert.equal(d.n,d.keys);assert.equal(d.pek,'pek');console.log('PASS Şimdi dene: yalnız çalışılan maddelerle Pekiştiriyorum turu başlar');
 assert.deepEqual(errs,[],'JS hatası yok');await br.close();srv.close();console.log('adim2-tests geçti');
})().catch(e=>{console.error(e);process.exit(1);});
