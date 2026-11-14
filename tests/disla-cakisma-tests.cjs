const http=require('node:http'),fs=require('node:fs'),path=require('node:path');const {chromium}=require('playwright');
const root=path.join(__dirname,'..');
(async()=>{const server=http.createServer((q,r)=>{const rel=new URL(q.url,'http://x').pathname;const f=path.join(root,decodeURIComponent(rel==='/'?'/index.html':rel));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404).end();return;}r.writeHead(200,{'Content-Type':{'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://localhost:'+server.address().port+'/';
const b=await chromium.launch({args:['--no-sandbox']});const c=await b.newContext();await c.route('https://**/*',r=>r.abort());await require('./helpers/hazir.cjs')(c);const p=await c.newPage();
await p.goto(url);await p.locator('.ae-home').waitFor();await p.waitForFunction(()=>CONTENT['baharat']&&CONTENT['mutfak-araclari']);
const r=await p.evaluate(()=>{const out={};for(const sub of ['baharat','mutfak-araclari','bulasik-makinesi-temizligi']){YOL_AYAR.subject=sub;const d=yolVeri();const plan=yolPlan();let bad=[],kisa=0,top=0;const byAd={};d.matches.forEach(m=>byAd[m.answer]=m);
 for(const node of plan)for(const ph of ['s2','s3'])for(let t=0;t<40;t++){const qs=yolSorular(node,ph,'T'+t,false);for(const q of qs){if(q.tip!=='ad')continue;top++;const n=ph==='s3'?5:4;if(q.sec.length<n)kisa++;const ad=q.sec.map(x=>x.text);
  for(let i=0;i<ad.length;i++)for(let j=i+1;j<ad.length;j++){const a=ad[i],b2=ad[j];if(yolKok(a)===yolKok(b2)||((byAd[a]||{}).disla||[]).includes(b2)||((byAd[b2]||{}).disla||[]).includes(a))bad.push(a+' / '+b2);}}}
 out[sub]={soru:top,cakisma:bad.length,ornek:[...new Set(bad)].slice(0,4),eksikSecenek:kisa};}return out;});
console.log(JSON.stringify(r,null,1));await b.close();server.close();})();
