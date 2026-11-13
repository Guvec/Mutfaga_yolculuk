const http=require('node:http'),fs=require('node:fs'),path=require('node:path');const {chromium}=require('playwright');
const root=path.join(__dirname,'..');const assert=require('assert');
(async()=>{const server=http.createServer((q,r)=>{const rel=new URL(q.url,'http://x').pathname;const f=path.join(root,decodeURIComponent(rel==='/'?'/index.html':rel));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404).end();return;}r.writeHead(200,{'Content-Type':{'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://localhost:'+server.address().port+'/';
const b=await chromium.launch({args:['--no-sandbox']});const c=await b.newContext({viewport:{width:390,height:844}});await c.route('https://**/*',r=>r.abort());
const p=await c.newPage();p.on('pageerror',e=>console.log('HATA',e.message));
await p.goto(url);await p.locator('.ae-home').waitFor();
await p.waitForFunction(()=>CONTENT['baharat']);
const ac=async()=>{await p.evaluate(()=>{st.guest=true;YOL_AYAR.subject='baharat';const plan=yolPlan();yolBaslat(plan[0].id);});};
await ac();
// Öğren -> sorular
for(let i=0;i<20;i++){const ph=await p.evaluate(()=>Y.phase);if(ph!=='ogren')break;await p.click('.yol-alt .yol-btn:last-child');}
assert.equal(await p.evaluate(()=>Y.phase),'s1');
await p.click('[data-i="2"]');
assert.equal(await p.evaluate(()=>document.activeElement.getAttribute('data-i')),'2','odak secenekte kalmali');
await p.click('.yol-nav .yol-btn:last-child');
assert.ok((await p.evaluate(()=>document.activeElement.className)).startsWith('yol-soru'),'yeni soruda odak baslikta');
await p.click('[data-i="1"]');
const once=await p.evaluate(()=>({k:Y.k,sels:Y.qs.map(q=>q.sel)}));
await p.click('.yol-asama-don');
assert.equal(await p.evaluate(()=>Y.phase),'ogren');
assert.ok(await p.locator('.yol-donus').isVisible());
await p.click('.yol-alt .yol-btn:last-child');await p.click('.yol-alt .yol-btn:last-child');
await p.click('.yol-donus');
const sonra=await p.evaluate(()=>({k:Y.k,sels:Y.qs.map(q=>q.sel),ph:Y.phase}));
assert.deepEqual({k:sonra.k,sels:sonra.sels},once);assert.equal(sonra.ph,'s1');
// Öğren'deyken yenile: soruya dönüş korunmalı
await p.click('.yol-asama-don');
await p.reload();await p.locator('.ae-home').waitFor();await p.waitForFunction(()=>CONTENT['baharat']);await ac();
const yenile=await p.evaluate(()=>({k:Y.k,sels:Y.qs.map(q=>q.sel),ph:Y.phase}));
assert.equal(yenile.ph,'s1');assert.deepEqual({k:yenile.k,sels:yenile.sels},once);
// bölüm listesine çık, devam et
await p.evaluate(()=>yolKapat());await ac();
assert.deepEqual(await p.evaluate(()=>({k:Y.k,sels:Y.qs.map(q=>q.sel)})),once);
// hepsini cevapla, gözden geçir ekranında yenile
const n=await p.evaluate(()=>Y.qs.length);
for(let i=await p.evaluate(()=>Y.k);i<n;i++){await p.click('[data-i="0"]');await p.click('.yol-nav .yol-btn:last-child');}
assert.equal(await p.evaluate(()=>Y.sub),'onay');
await p.reload();await p.locator('.ae-home').waitFor();await p.waitForFunction(()=>CONTENT['baharat']);await ac();
assert.equal(await p.evaluate(()=>Y.sub),'onay','gozden gecirme geri gelmeli');
await p.screenshot({path:'/tmp/gz/ogrendon.png'});
console.log('GECTI: ogrene don, cevap kaydi, yenileme, odak');
await b.close();server.close();})().catch(e=>{console.error('KALDI',e.message);process.exit(1);});
