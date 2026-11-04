/* Açılış ekranı (Aşçı Dostlar) testi. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const server=http.createServer((req,res)=>{let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(rel==='/')rel='/index.html';const file=path.resolve(root,'.'+rel);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-gpu']});const ok=m=>console.log('PASS '+m);
 const open=async(w,h)=>{const ctx=await browser.newContext({viewport:{width:w,height:h},serviceWorkers:'block'});await ctx.addInitScript(()=>{try{sessionStorage.setItem('mesleki-ses-secim','1');localStorage.setItem('ses','false');}catch(e){}});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('response',r=>{if(r.status()>=400)p.errs.push(r.status()+' '+r.url());});await p.goto('http://127.0.0.1:'+server.address().port);await p.waitForFunction(()=>st.screen==='giris'&&document.querySelector('#actor'));return p;};
 try{
  const d=await open(1100,800);
  assert.equal(await d.locator('h1').count(),1);assert.equal(await d.evaluate(()=>{const i=document.querySelector('h1 img');return i&&i.alt==='Herkes yemek yapabilir'&&i.naturalWidth>0;}),true);ok('Açılış ekranı ilk gelir; tek başlık slogan görseli (alt metinli)');
  assert.equal(await d.locator('.food').count(),6);assert.equal(await d.textContent('#pageLabel'),'1 / 3');ok('Masaüstünde 6 besin, 3 sayfa');
  const seen=new Set();for(let i=0;i<3;i++){(await d.locator('.food .name').allTextContents()).forEach(n=>seen.add(n));await d.click('#otherFoods');}
  assert.equal(seen.size,14);ok('14 besinin hepsine sayfalarla ulaşılır');
  // hareket kapalı: her besin
  await d.click('#gMotion');assert.equal(await d.evaluate(()=>GIRIS.motion),false);
  const effects={cake:'happy',lemon:'sour',pepper:'spicy',honey:'happy',egg:'happy',yogurt:'happy',cheese:'happy',apple:'happy',carrot:'happy',milk:'milky',ayran:'milky',water:'relaxed',tea:'relaxed',cola:'relaxed'};
  for(const [id,ef] of Object.entries(effects)){
   await d.evaluate(i=>{const f=GIRIS.foods.find(x=>x.id===i);const pg=Math.floor(GIRIS.foods.indexOf(f)/6);while(GIRIS.page!==pg)document.querySelector('#otherFoods').click();},id);
   await d.locator('[data-food="'+id+'"]').click();
   if(id==='cola'){await d.waitForFunction(()=>actor.className.includes('refuse')||document.querySelector('#actor').className.includes('refuse'));const held=await d.innerHTML('#held');assert(!held.includes('🥤'));}
   await d.waitForFunction(e=>document.querySelector('#actor').classList.contains(e),ef,{timeout:8000});
   if(id==='cola'){const held=await d.innerHTML('#held');assert(held.includes('<svg'),'kola yerine su');assert.equal(await d.evaluate(()=>GIRIS.last.id),'cola');}
   await d.waitForFunction(()=>document.querySelector('#actor').className.trim()==='actor',null,{timeout:8000});
  }
  ok('14 besinin tepkisi doğru; kola içilmez, su seçilir; tepkiden sonra merkeze dönülür');
  // hızlı art arda dokunma
  await d.click('#gMotion');await d.evaluate(()=>{while(GIRIS.page!==0)document.querySelector('#otherFoods').click();});
  await d.locator('[data-food="cake"]').click();await d.waitForTimeout(150);await d.locator('[data-food="pepper"]').click();
  assert.equal(await d.evaluate(()=>GIRIS.last.id),'pepper');await d.waitForFunction(()=>document.querySelector('#actor').classList.contains('spicy'),null,{timeout:9000});
  assert.equal(await d.evaluate(()=>document.querySelector('#speech').textContent),'Biber acı.');ok('Hızlı seçimde eski hareket iptal olur, son seçim görülür');
  // karakter değişimi yürüyüşü durdurur
  await d.waitForFunction(()=>document.querySelector('#actor').className.trim()==='actor',null,{timeout:9000});
  await d.locator('[data-food="honey"]').click();await d.waitForFunction(()=>document.querySelector('#actor').classList.contains('walking'));await d.click('#rabbit');
  const af=await d.evaluate(()=>({c:document.querySelector('#actor').className.trim(),t:document.querySelector('#actor').style.transform}));assert.equal(af.c,'actor rabbit');assert.equal(af.t,'translate(0px, 0px)');ok('Karakter değişince yürüyüş durur, karakter merkeze döner');
  await d.waitForTimeout(1500);assert.equal(await d.evaluate(()=>document.querySelector('#actor').className.trim()),'actor rabbit');ok('Eski hareket sonradan karışmaz');
  // ayrılırken yürüyüş
  await d.locator('[data-food="honey"]').click();await d.waitForFunction(()=>document.querySelector('#actor').classList.contains('walking'));await d.click('#gStart');await d.waitForFunction(()=>st.screen==='pedit');
  const ilk=await d.evaluate(()=>({tabs:[...document.querySelectorAll('.ad-tab button')].map(b=>b.innerText.replace(/\s+/g,' ').trim()),sel:AD_KAR[st.pe.e][2],ret:st.pe.ret}));
  assert.equal(ilk.tabs.length,11);assert(/Mutfak/.test(ilk.tabs[0]));assert.equal(ilk.sel,10);assert.equal(ilk.ret,'profiles');
  ok('İlk girişte profil yoksa isim seçimi açılır; Mutfak sekmesi ilk sırada ve mutfak karakteri seçili');
  await d.evaluate(()=>{guest();});await d.waitForFunction(()=>st.screen==='home');await d.waitForTimeout(1200);ok('Misafir olarak devam edince ana sayfa açılır');
  assert.equal(await d.evaluate(()=>!!document.querySelector('.gs')),false);
  // kılavuz
  await d.evaluate(()=>go('giris'));await d.click('#gHelp');await d.waitForFunction(()=>st.screen==='guide');await d.evaluate(()=>back());await d.waitForFunction(()=>st.screen==='giris');ok('Kılavuz açılır, Geri açılış ekranına döner');
  // oyun ekranında slogan şeridi
  await d.evaluate(()=>{lsSet('profiles',['Deneme']);pickProfile('Deneme');st.subject='baharat';st.op='match';st.contentSet=1;startBoard('learn',12);});assert.equal(await d.locator('.gs-strip').count(),1);ok('Oyun ekranında sağ üstte "Herkes yemek yapabilir" şeridi');
  await d.evaluate(()=>go('home'));assert.equal(await d.locator('.gs-strip').count(),0);
  assert.deepEqual(d.errs,[]);ok('Hata ve 404 yok (masaüstü)');
  // 360 px
  const m=await open(360,740);assert.equal(await m.locator('.food').count(),4);assert.equal(await m.textContent('#pageLabel'),'1 / 4');
  assert.equal(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);ok('360 px: 4 besin, yatay taşma yok');
  await m.locator('.food').first().click();await m.waitForTimeout(400);assert.equal(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(m.errs,[]);ok('360 px: yürüyüş sırasında taşma ve hata yok');
 }catch(e){console.error('FAIL',e);process.exitCode=1;}finally{await browser.close();server.close();}
})();
