const http=require('node:http'),fs=require('node:fs'),path=require('node:path');const {chromium}=require('playwright');const assert=require('assert');
const root=path.join(__dirname,'..');
(async()=>{const server=http.createServer((q,r)=>{const rel=new URL(q.url,'http://x').pathname;const f=path.join(root,decodeURIComponent(rel==='/'?'/index.html':rel));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404).end();return;}r.writeHead(200,{'Content-Type':{'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://localhost:'+server.address().port+'/';
const b=await chromium.launch({args:['--no-sandbox']});const c=await b.newContext({viewport:{width:390,height:844}});await c.route('https://**/*',r=>r.abort());const p=await c.newPage();p.on('pageerror',e=>console.log('HATA',e.message));
await p.goto(url);await p.locator('.ae-home').waitFor();await p.waitForFunction(()=>CONTENT['baharat']&&CONTENT['mutfak-araclari']);
const oyna=async(sub,ozIste)=>p.evaluate(([sub,ozIste])=>{st.guest=true;lsSet('yol',{});YOL_AYAR.subject=sub;const plan=yolPlan();const s0=yolS();plan.forEach(n=>s0.done[n.id]=1);yolYaz(s0);
 const node=plan.find(n=>n.tur==='bolum'&&yolOzVar(n)===ozIste);yolBaslat(node.id);const iz=[Y.phase];
 const coz=()=>{Y.qs.forEach(q=>q.sel=q.dogru);Y.sub='onay';yolOnayla();};
 Y.phase='s1';yolFazHazirla();const n4=Y.qs.every(q=>q.sec.length===4);coz();iz.push(Y.phase);const n4b=Y.qs.every(q=>q.sec.length===4);coz();iz.push(Y.phase);
 let ozN=null;if(Y.phase==='s3'){ozN=Y.qs.length;const hepsiOz=Y.qs.every(q=>q.oz);Y.qs.forEach(q=>q.sel=q.sec.find(x=>x.id!==q.dogru).id);Y.sub='onay';yolOnayla();iz.push(Y.sub);for(let i=0;i<8&&Y.sub==='inceleme'&&Y.ik<Y.yanlis.length-1;i++)yolIncSonraki();yolFazBitir();iz.push(Y.phase);return {iz,n4,n4b,ozN,hepsiOz,serit:document.querySelectorAll('.yol-asama>*').length};}
 render();return {iz,n4,n4b,serit:document.querySelectorAll('.yol-asama>*').length};},[sub,ozIste]);
const a=await oyna('baharat',true);console.log(JSON.stringify(a));
assert.deepEqual(a.iz.slice(0,3),['ogren','s2','s3']);assert.ok(a.n4&&a.n4b&&a.hepsiOz&&a.ozN>=1);assert.equal(a.iz[a.iz.length-1],'esles','ozellik asamasi yanlis yapilsa da esles gelir');
const m=await oyna('mutfak-araclari',false);console.log(JSON.stringify(m));
assert.deepEqual(m.iz,['ogren','s2','esles']);assert.equal(m.serit,4);
console.log('GECTI: asama akisi');await b.close();server.close();})().catch(e=>{console.error('KALDI',e.message);process.exit(1);});
