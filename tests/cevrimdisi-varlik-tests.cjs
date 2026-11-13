const http=require('node:http'),fs=require('node:fs'),path=require('node:path');const {chromium}=require('playwright');const assert=require('assert');
const root=process.argv[2]||path.join(__dirname,'..');let surum='A';
(async()=>{const server=http.createServer((q,r)=>{const rel=new URL(q.url,'http://x').pathname;const f=path.join(root,decodeURIComponent(rel==='/'?'/index.html':rel));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404).end();return;}
 const ct={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.svg':'image/svg+xml'}[path.extname(f)]||'application/octet-stream';
 if(rel==='/sw.js'){r.writeHead(200,{'Content-Type':ct,'Cache-Control':'no-store'});r.end(fs.readFileSync(f,'utf8').replace(/const CACHE='[^']+'/,"const CACHE='mesleki-oyunlar-test-"+surum+"'"));return;}
 r.writeHead(200,{'Content-Type':ct});fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://localhost:'+server.address().port+'/';
const b=await chromium.launch({args:['--no-sandbox']});const c=await b.newContext();await c.route('https://**/*',r=>r.abort());const p=await c.newPage();
await p.goto(url);await p.evaluate(()=>navigator.serviceWorker.ready);await p.reload();await p.evaluate(()=>navigator.serviceWorker.ready);
const img='assets/baharat/t03_05.jpg',mp3='assets/muzik/satie-sade-gece.mp3';
// Eski sürüm gibi: varlıklar yalnız sürüm önbelleğinde
await p.evaluate(async([a,m])=>{const o=await caches.open('mesleki-oyunlar-eski');for(const u of [a,m]){const r=await fetch(u,{cache:'no-store'});await o.put(new URL(u,location.href).href,r);}await caches.delete('mesleki-varlik-1');},[img,mp3]);
surum='B';await p.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});
for(let i=0;i<60;i++){const ks=await p.evaluate(()=>caches.keys());if(ks.includes('mesleki-oyunlar-test-B')&&!ks.includes('mesleki-oyunlar-eski'))break;await p.waitForTimeout(500);}
console.log('onbellekler',await p.evaluate(()=>caches.keys()));
await c.setOffline(true);
const sonuc=await p.evaluate(async([a,m])=>{const x=await fetch(a);const y=await fetch(m);return [x.ok,(await x.blob()).size,y.ok,(await y.blob()).size];},[img,mp3]);
console.log('cevrimdisi',sonuc);assert.ok(sonuc[0]&&sonuc[1]>1000&&sonuc[2]&&sonuc[3]>1000);
console.log('GECTI: guncellemeden sonra cevrimdisi fotograf ve muzik aciliyor');await b.close();server.close();})().catch(e=>{console.error('KALDI',e.message);process.exit(1);});
