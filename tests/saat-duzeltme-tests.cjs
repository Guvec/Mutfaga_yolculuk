const http=require('node:http'),fs=require('node:fs'),path=require('node:path');const {chromium}=require('playwright');const assert=require('assert');
const root=path.join(__dirname,'..');let kayma=0;
(async()=>{const server=http.createServer((q,r)=>{const u=new URL(q.url,'http://x'),rel=u.pathname;const f=path.join(root,decodeURIComponent(rel==='/'?'/index.html':rel));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404).end();return;}
 const h={'Content-Type':{'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json'}[path.extname(f)]||'application/octet-stream'};
 if(u.searchParams.has('saat'))h['Date']=new Date(Date.now()+kayma).toUTCString();
 r.writeHead(200,h);if(q.method==='HEAD')r.end();else fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://localhost:'+server.address().port+'/';
const b=await chromium.launch({args:['--no-sandbox']});const c=await b.newContext();await c.route('https://**/*',r=>r.abort());const p=await c.newPage();p.on('pageerror',e=>console.log('HATA',e.message));
await p.goto(url);await p.locator('.ae-home').waitFor();
const olc=async k=>{kayma=k;return p.evaluate(async()=>{YR_SAAT_AN=0;await yrSaatAyarla();return [YR_SAAT,yrNow()-Date.now(),yrPlayerBase('👤 Misafir',1).ts-Date.now()];});};
let r=await olc(0);console.log('dogru saat',r);assert.equal(r[0],0);
r=await olc(180000);console.log('cihaz 3 dk geri',r);assert.ok(Math.abs(r[0]-180000)<2500&&Math.abs(r[2]-180000)<2500);
r=await olc(-95000);console.log('cihaz 95 sn ileri',r);assert.ok(Math.abs(r[0]+95000)<2500);
r=await olc(3000);console.log('3 sn fark',r);assert.equal(r[0],0);
console.log('GECTI: saat duzeltmesi');await b.close();server.close();})().catch(e=>{console.error('KALDI',e.message);process.exit(1);});
