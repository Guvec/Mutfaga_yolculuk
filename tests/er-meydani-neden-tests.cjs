/* Er Meydanı / oda başlat düğmesi: kapalıysa nedeni yazılır. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'};
 const srv=http.createServer((q,r)=>{let u=decodeURIComponent(new URL(q.url,'http://x').pathname);if(u==='/')u='/index.html';fs.readFile(path.join(root,u),(e,b)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('Content-Type',types[path.extname(u)]||'application/octet-stream');r.end(b);});});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const br=await chromium.launch({args:['--no-sandbox']}),p=await (await br.newContext({serviceWorkers:'block'})).newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
 await p.addInitScript(()=>{try{sessionStorage.setItem('mesleki-ses-secim','1');}catch(e){}});
 await p.goto('http://127.0.0.1:'+srv.address().port+'/');await p.waitForFunction(()=>typeof yrStartNeden==='function');
 const r=await p.evaluate(()=>{const o={};
  YR.room={mode:'arena'};YR.players=[{nick:'A',loaded:true},{nick:'B',loaded:true}];o.az=yrStartNeden();
  YR.players=[{nick:'A',loaded:true},{nick:'B',loaded:true},{nick:'Cem',loaded:false}];o.yuk=yrStartNeden();
  YR.players=[{nick:'A',loaded:true},{nick:'B',loaded:true},{nick:'C',loaded:true}];o.tamam=yrStartNeden();
  YR.room={mode:'race'};YR.players=[{nick:'A',loaded:true}];o.yaris=yrStartNeden();return o;});
 assert.match(r.az,/En az üç kişi gerekir\. Şu an 2 kişi var/);assert.match(r.yuk,/Cem için sorular yükleniyor/);assert.equal(r.tamam,'');assert.match(r.yaris,/En az iki kişi/);
 assert.deepEqual(er,[]);console.log('PASS 4 kontrol: az kişi, yükleniyor, hazır, yarış odası nedeni');await br.close();srv.close();
})().catch(e=>{console.error(e);process.exit(1);});
