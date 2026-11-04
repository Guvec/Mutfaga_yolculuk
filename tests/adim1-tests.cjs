/* Dinle düğmesi, Paylaş yedeği, Sessiz seçimi efektleri de kapatır. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const srv=http.createServer((q,r)=>{let u=decodeURIComponent(new URL(q.url,'http://x').pathname);if(u==='/')u='/index.html';const f=path.join(root,u);fs.readFile(f,(e,b)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');r.end(b);});});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const br=await chromium.launch({args:['--no-sandbox']}),ctx=await br.newContext({viewport:{width:390,height:800},serviceWorkers:'block'}),p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:'+srv.address().port+'/');await p.waitForFunction(()=>typeof yrQuestionHTML==='function'&&typeof frShare==='function');
 const h=await p.evaluate(()=>yrQuestionHTML({prompt:'Bu görseldeki mutfak aracı nedir?',image:'x.jpg',choices:[{id:'A',text:'Rende'},{id:'B',text:'Elek'},{id:'C',text:'Kevgir'},{id:'D',text:'Maşa'}]}));
 assert(/class="spk"/.test(h)&&/Soruyu ve seçenekleri dinle/.test(h),'Soru ekranında Dinle düğmesi var');
 assert(await p.evaluate(()=>SES.sira[SES.sira.length-1]).then(t=>/Bu görseldeki mutfak aracı nedir\? A\. Rende\. B\. Elek\. C\. Kevgir\. D\. Maşa\./.test(t)),'Okunan metin soru + seçenekler');
 console.log('PASS Dinle düğmesi soruyu ve seçenekleri okur');
 const r=await p.evaluate(async()=>{FR.pid='ABC123';let copied=null,toast=null;window.adToast=t=>{toast=t;};
  Object.defineProperty(navigator,'share',{value:()=>Promise.reject(Object.assign(new Error('x'),{name:'NotAllowedError'})),configurable:true});
  Object.defineProperty(navigator,'clipboard',{value:{writeText:t=>{copied=t;return Promise.resolve();}},configurable:true});
  frShare();await new Promise(r=>setTimeout(r,100));const a=[copied,toast];copied=null;toast=null;
  Object.defineProperty(navigator,'share',{value:()=>Promise.reject(Object.assign(new Error('x'),{name:'AbortError'})),configurable:true});
  frShare();await new Promise(r=>setTimeout(r,100));return [a,[copied,toast]];});
 assert.equal(r[0][0],'ABC123');assert(/ABC123/.test(r[0][1]),'Paylaş başarısızsa kod kopyalanır');assert.equal(r[1][0],null,'Paylaşma penceresi kapatılırsa kopyalanmaz');
 console.log('PASS Paylaş başarısız olunca kopyalama yedeği; kapatınca sessiz');
 const e=await p.evaluate(()=>{sessionStorage.removeItem('mesleki-ses-secim');EFEKT.ayarla(true);sesSecimiSor();document.getElementById('sesSecSessiz').onclick();return [SES.acik,EFEKT.acikMi()];});
 assert.deepEqual(e,[false,false],'Sessiz: okuma ve efekt kapalı');console.log('PASS Sessiz seçimi efekt seslerini de kapatır');
 assert.deepEqual(errs,[],'JS hatası yok');await br.close();srv.close();console.log('adim1-tests geçti');
})().catch(e=>{console.error(e);process.exit(1);});
