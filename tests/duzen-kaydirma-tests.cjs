const http=require('node:http'),fs=require('node:fs'),path=require('node:path');const {chromium}=require('playwright');
const root=path.join(__dirname,'..');
(async()=>{const server=http.createServer((q,r)=>{const rel=new URL(q.url,'http://x').pathname;const f=path.join(root,decodeURIComponent(rel==='/'?'/index.html':rel));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404).end();return;}r.writeHead(200,{'Content-Type':{'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://localhost:'+server.address().port+'/';
const b=await chromium.launch({args:['--no-sandbox']});const c=await b.newContext({viewport:{width:390,height:844}});await c.route('https://**/*',r=>r.abort());const p=await c.newPage();p.on('pageerror',e=>console.log('HATA',e.message));
await p.goto(url);await p.locator('.ae-home').waitFor();await p.waitForFunction(()=>CONTENT['baharat']&&CONTENT['mutfak-araclari']);
const sub=process.argv[2]||'mutfak-araclari';let kotu=0;
await p.evaluate((sub)=>{st.guest=true;YOL_AYAR.subject=sub;const plan=yolPlan();yolBaslat(plan[0].id);},sub);
for(const ph of ['ogren','s1','s2','esles'])for(const [w,h] of [[360,640],[360,740],[390,844],[412,915],[1090,938],[1366,768],[1920,1080]])for(const yz of ['normal','cok']){
 await p.setViewportSize({width:w,height:h});
 await p.evaluate(([ph,yz])=>{document.documentElement.setAttribute('data-yz',yz);Y.phase=ph;Y.k=0;Y.donus=null;yolFazHazirla();render();},[ph,yz]);
 await p.waitForFunction(()=>[...document.images].every(i=>i.complete));await p.waitForTimeout(80);
 const sh=await p.evaluate(()=>document.documentElement.scrollHeight);
 if(sh>h){kotu++;console.log('KAYDIRMA',ph,w+'x'+h,yz,sh);}
 if(yz==='normal'&&((w===390)||(w===1090))&&['esles','s1','ogren'].includes(ph))await p.screenshot({path:'/tmp/gz/dz-'+ph+'-'+w+'.png'});
}
console.log(kotu?'KALDI '+kotu:'GECTI duzen '+sub);await b.close();server.close();})();
