const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('js/eslestirme.js','utf8');
const funcs=src.slice(src.indexOf('function tapImg('),src.indexOf('function tryPair('));
let calls=[],paired=0;const c={st:{practice:'learn',board:{names:['Kaşık'],res:{},sel:'x'}},boardUsed:()=>false,boardIntroClose(){},boardItem:()=>({answer:'Kaşık',task:'Çorba içmek için kullanılır.'}),render(){},tryPair(){paired++;calls.push('pair')},sesAd:x=>x,sesSoyle:x=>{if(c.SES.acik)calls.push(x)},SES:{acik:true,pending:null},MUZIK:{acikMi:()=>c.music,okumaIcinDuraklat(){calls.push('pause')}},music:false};
vm.createContext(c);vm.runInContext(funcs,c);const mus=fs.readFileSync('js/muzik.js','utf8');vm.runInContext(mus.slice(mus.indexOf('function sesAdOku('),mus.indexOf('/* 🔊')),c);
c.tapName(0);assert.deepEqual(calls,['pair','Kaşık']);assert.equal(paired,1);
calls=[];c.st.board.sel=null;c.tapName(0);assert.deepEqual(calls,['Kaşık']);
calls=[];c.SES.acik=false;c.tapName(0);assert.deepEqual(calls,[]);
calls=[];c.music=true;c.tapName(0);assert.deepEqual(calls,['Kaşık','pause']);
calls=[];c.st.board.selName=null;c.tapImg('x');assert.deepEqual(calls,[]);
c.music=false;c.SES.acik=true;c.tapImg('x');assert.deepEqual(calls,['Çorba içmek için kullanılır.']);
calls=[];c.st.practice='check';c.tapImg('x');assert.deepEqual(calls,[]);
assert(!src.includes('onmouseover'));assert(!src.includes('onfocus='));assert(src.includes('<button class="bname'));
console.log('PASS: seçili/seçili olmayan görselde ad; önce eşleşme; Sessiz; müzikte yalnız ad; öğrenmede task; değerlendirmede sessiz görsel; doğal button klavye semantiği; hover/odak okuyucusu yok.');
const elements={ov:{className:'',innerHTML:''}},saved={};let paused=0;
Object.assign(c,{sessionStorage:{getItem:k=>saved[k],setItem:(k,v)=>saved[k]=v},document:{querySelectorAll:()=>[],activeElement:{},getElementById:id=>elements[id]||(elements[id]={focus(){}})},pauseT(){paused++},sesSus(){},sesTurkce:()=>[],setTimeout:()=>{},modalFocus:null,lsSet:(k,v)=>saved[k]=v,closeModal(){c.st.modalOpen=false},EFEKT:{ayarla:v=>saved.efekt=v}});
c.MUZIK.kapat=()=>c.music=false;c.MUZIK.ac=()=>{c.music=true;c.SES.acik=false;saved.ses=false};c.st.modalOpen=false;
const ef=fs.readFileSync('js/efekt.js','utf8');vm.runInContext(ef.slice(ef.indexOf('function sesSecimiSor')),c);
c.sesSecimiSor();assert.equal(paused,1);assert(elements.ov.innerHTML.includes('Sesi dene'));assert(elements.sesSecUyari.textContent.includes('Türkçe ses bulunamadı'));
elements.sesSecSessiz.onclick();assert.equal(saved.ses,false);assert.equal(saved.efekt,false);c.sesSecimiSor();assert.equal(paused,1);
console.log('PASS: giriş sorusu bir kez, timer durdurma, seçim kaydı, Türkçe ses yok uyarısı, Sesi dene düğmesi.');
/* Tam sayfa: profil başına giriş, Esc/odak, klavye ve gerçek speak çağrısı. */
(async()=>{
const {chromium}=require('playwright'),http=require('http'),path=require('path');
const root=path.resolve(__dirname,'..');const server=http.createServer((q,r)=>{const f=path.resolve(root,'.'+new URL(q.url,'http://x').pathname.replace(/^\/$/,'/index.html'));if(!f.startsWith(root+path.sep)){r.writeHead(403).end();return;}fs.readFile(f,(e,b)=>{if(e){r.writeHead(404).end();return;}r.setHeader('content-type',({'.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.jpg':'image/jpeg','.png':'image/png'})[path.extname(f)]||'application/octet-stream');r.end(b);});});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1100,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
await page.route('https://**/*',r=>r.abort());await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>CONTENT.baharat&&typeof startBoard==='function');
await page.evaluate(()=>{window.reads=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};speechSynthesis.getVoices=()=>[{lang:'tr-TR',voiceURI:'mock',localService:true}];speechSynthesis.cancel=()=>{};speechSynthesis.speak=u=>{reads.push(u.text);if(u.onend)u.onend()};pickProfile('Deneme');});
assert.equal(await page.locator('#sesSecimBaslik').count(),0);
await page.evaluate(()=>{st.subject='baharat';st.op='match';st.contentSet=1;startBoard('learn',4)});assert.equal(await page.locator('#sesSecimBaslik').count(),1);await page.click('#sesSecDene');assert.equal(await page.evaluate(()=>reads.at(-1)),'Ses denemesi. Hazır olduğunda başlayabilirsin.');await page.click('#sesSecOku');
await page.evaluate(()=>render());assert.equal(await page.locator('#sesSecimBaslik').count(),0);assert.equal(await page.locator('.top .ses-ac').count(),1);assert(await page.locator('.top .back').isVisible());
const n=await page.evaluate(()=>reads.length),card=page.locator('.bname').first();await card.hover();await card.focus();assert.equal(await page.evaluate(()=>reads.length),n);await card.press('Enter');assert.equal(await page.evaluate(()=>reads.length),n+1);await card.press('Space');assert.equal(await page.evaluate(()=>reads.length),n+2);
await page.evaluate(()=>{pickProfile('Başka');st.subject='baharat';st.op='match';st.contentSet=1;startBoard('learn',4)});assert.equal(await page.locator('#sesSecimBaslik').count(),1);await page.keyboard.press('Escape');assert.equal(await page.locator('#ov.on').count(),0);assert.equal(await page.evaluate(()=>st.modalOpen),false);
await page.click('.top .ses-paket-ayar');await page.evaluate(()=>closeModal());assert(await page.locator('.top .ses-paket-ayar').evaluate(el=>el===document.activeElement));
await page.evaluate(()=>{speechSynthesis.getVoices=()=>[];sessionStorage.removeItem('mesleki-ses-secim');sesSecimiSor()});assert((await page.locator('#sesSecUyari').innerText()).includes('Türkçe ses bulunamadı'));assert.deepEqual(errors,[]);
console.log('PASS Chromium: profil başına bir giriş, ana sayfada yok; gerçek Sesi dene; Enter/Boşluk okur, hover/odak okumaz; tek ses kontrolü, görünür Geri; Esc; ayar kapanınca odak dönüşü; Türkçe ses uyarısı.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
