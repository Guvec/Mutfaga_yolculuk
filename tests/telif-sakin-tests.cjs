/* Telif bildirimi, Hakkında penceresi, Sakin mod. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const srv=http.createServer((q,r)=>{let u=decodeURIComponent(new URL(q.url,'http://x').pathname);if(u==='/')u='/index.html';fs.readFile(path.join(root,u),(e,b)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('Content-Type',types[path.extname(u)]||'application/octet-stream');r.end(b);});});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+srv.address().port+'/';
 const br=await chromium.launch({args:['--no-sandbox']});let n=0;const ok=m=>{n++;console.log('PASS '+m);};
 const L='© 2026 Ali Arıkoğlu. Tüm hakları saklıdır.';
 async function sayfa(rm){
  const ctx=await br.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:rm}),p=await ctx.newPage();p.__e=[];p.on('pageerror',e=>p.__e.push(e.message));
  await p.addInitScript(()=>{try{sessionStorage.setItem('mesleki-ses-secim','1');}catch(e){}window.__ses=0;window.AudioContext=function(){this.currentTime=0;this.state='running';this.destination={};this.createOscillator=()=>({frequency:{},connect(){},start(){window.__ses++;},stop(){}});this.createGain=()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});};});
  await p.goto(base);await p.waitForFunction(()=>typeof hakkindaAc==='function'&&typeof sakinAcik==='function');return p;
 }
 let p=await sayfa('no-preference');
 // 1) Karşılama ekranında telif; oyun ekranında yok
 await p.evaluate(()=>{st.screen='welcome';render();});
 assert.ok((await p.textContent('.telif')).includes(L));assert.ok((await p.textContent('.telif')).includes('izinsiz kopyalanamaz, çoğaltılamaz, dağıtılamaz ve yeniden yayımlanamaz'));
 assert.equal(await p.getAttribute('.telif','aria-label'),'Telif hakkı 2026 Ali Arıkoğlu. Tüm hakları saklıdır.');ok('Karşılama ekranında telif satırı ve ekran okuyucu etiketi var');
 await p.evaluate(()=>{st.guest=true;st.prof='Misafir';go('home');});assert.equal(await p.locator('.telif').count(),0);
 assert.ok(await p.locator('button:has-text("Güncelle")').count()>0);assert.ok(await p.locator('button[aria-label="Uygulamayı paylaş"]').count()>0);
 await p.context().setOffline(true);await p.locator('button:has-text("Güncelle")').first().click();assert.ok((await p.textContent('#toast')).includes('İnternet yok'));await p.context().setOffline(false);ok('Ana sayfada Güncelle ve Paylaş düğmeleri var; internet yokken güncelleme yapılmaz');
 await p.evaluate(()=>{go('profiles');});assert.equal(await p.locator('.telif').count(),0);ok('Ana sayfa ve diğer ekranlarda telif satırı yok');
 // 2) Hakkında
 await p.evaluate(()=>hakkindaAc());const h=await p.textContent('#ov');
 assert.ok(h.includes(L)&&h.includes('İşin Mutfağına Yolculuk')&&h.includes('Sürüm'));assert.ok(!/@|okul|telefon|e-posta/i.test(h));ok('Hakkında: ad, sürüm, telif; kişisel bilgi yok');
 await p.evaluate(()=>closeModal());
 // 3) Sakin varsayılanı: hareket azaltma kapalı → Kapalı
 assert.equal(await p.evaluate(()=>sakinAcik()),false);assert.equal(await p.getAttribute('html','data-sakin'),'0');ok('Varsayılan: cihaz hareket azaltmıyorsa Sakin mod Kapalı');
 // 4) Kapalıyken efekt sesi çalar; açıkken çalmaz; müzik ve sesli okuma etkilenmez
 await p.evaluate(()=>{SES.acik=true;EFEKT.ayarla(true);__ses=0;EFEKT.cal('dogru');});assert.ok(await p.evaluate(()=>__ses)>0);ok('Sakin mod kapalıyken efekt sesi çalar');
 const mz0=await p.evaluate(()=>MUZIK.acikMi());
 await p.evaluate(()=>{voiceSettings();});assert.ok(await p.$('#sakinAc'));assert.ok((await p.textContent('#sakinAc')).includes('Kapalı'));
 await p.click('#sakinAc');assert.equal(await p.getAttribute('html','data-sakin'),'1');assert.ok((await p.textContent('#sakinAc')).includes('Açık'));assert.equal(await p.getAttribute('#sakinAc','aria-pressed'),'true');
 await p.evaluate(()=>{__ses=0;EFEKT.cal('dogru');EFEKT.cal('win');});assert.equal(await p.evaluate(()=>__ses),0);
 assert.equal(await p.evaluate(()=>SES.acik),true);assert.equal(await p.evaluate(()=>MUZIK.acikMi()),mz0);assert.equal(await p.evaluate(()=>EFEKT.acikMi()),true);ok('Sakin mod açıkken efekt sesi kapanır; sesli okuma, müzik ve efekt tercihi değişmez');
 // 5) Animasyon ve geçişler kapanır
 const an=await p.evaluate(()=>{const d=document.createElement('div');d.id='tdiv';d.style.cssText='animation:x 1s infinite;transition:all 2s';document.body.appendChild(d);const c=getComputedStyle(d);return [c.animationName,c.transitionDuration];});
 assert.equal(an[0],'none');assert.ok(/^0s/.test(an[1]));ok('Sakin mod açıkken animasyon ve geçişler kapalı');
 // 6) Hatırlanır
 await p.reload();await p.waitForFunction(()=>typeof sakinAcik==='function');assert.equal(await p.evaluate(()=>sakinAcik()),true);assert.equal(await p.evaluate(()=>ls('sakin',null)),true);ok('Seçim hatırlanır');
 await p.evaluate(()=>{voiceSettings();});await p.click('#sakinAc');assert.equal(await p.getAttribute('html','data-sakin'),'0');
 await p.evaluate(()=>{__ses=0;EFEKT.cal('dogru');});assert.ok(await p.evaluate(()=>__ses)>0);ok('Kapatınca efekt sesleri geri gelir');
 assert.deepEqual(p.__e,[]);await p.context().close();
 // 7) Hareket azaltma açık → varsayılan Açık; elle kapatınca onun seçimi geçerli
 p=await sayfa('reduce');assert.equal(await p.evaluate(()=>sakinAcik()),true);assert.equal(await p.getAttribute('html','data-sakin'),'1');ok('Cihaz hareketi azaltıyorsa varsayılan Açık');
 await p.evaluate(()=>{voiceSettings();});await p.click('#sakinAc');await p.reload();await p.waitForFunction(()=>typeof sakinAcik==='function');assert.equal(await p.evaluate(()=>sakinAcik()),false);ok('Elle yapılan seçim cihaz tercihinden önce gelir');
 assert.deepEqual(p.__e,[]);await p.context().close();
 // 8) Dosyalar
 const root2=root;assert.ok(fs.readFileSync(path.join(root2,'LICENSE'),'utf8').includes('Copyright (c) 2026 Ali Arıkoğlu'));assert.ok(fs.readFileSync(path.join(root2,'README.md'),'utf8').includes(L));
 const bos=[...fs.readdirSync(path.join(root2,'js')).map(f=>'js/'+f),...fs.readdirSync(path.join(root2,'css')).map(f=>'css/'+f),'sw.js'].filter(f=>!fs.readFileSync(path.join(root2,f),'utf8').slice(0,200).includes(L));
 assert.deepEqual(bos,[]);ok('LICENSE, README ve tüm js/css/sw.js dosyalarında telif başlığı var');
 console.log(n+' kontrol geçti');await br.close();srv.close();
})().catch(e=>{console.error(e);process.exit(1);});
