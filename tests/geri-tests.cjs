/* Geri düğmesi, ipucu ve görsel oranı kuralları. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const server=http.createServer((req,res)=>{let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(rel==='/')rel='/index.html';const file=path.resolve(root,'.'+rel);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-gpu']});const ctx=await browser.newContext({viewport:{width:1100,height:900},serviceWorkers:'block'});
 await ctx.addInitScript(()=>{try{sessionStorage.setItem('mesleki-ses-secim','1');}catch(e){}});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const ok=m=>console.log('PASS '+m);
 try{
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>typeof oyunGeri==='function'&&typeof startBoard==='function');
  const setup=p=>page.evaluate(p=>{lsSet('profiles',['Deneme']);lsSet('records',[]);pickProfile('Deneme');st.subject='baharat';st.op='match';st.contentSet=1;startBoard(p,12);},p);
  // İpucu: yalnız Öğreniyorum'da
  await setup('learn');const nLearn=await page.locator('.card-task').count();const withTask=await page.evaluate(()=>st.board.items.filter(i=>i.task).length);
  await setup('check');const nCheck=await page.locator('.card-task').count();const desc=await page.locator('[aria-describedby^="task-"]').count();
  assert(withTask>0&&nLearn===withTask,'Öğreniyorum: kullanım bilgisi görünmeli');assert.equal(nCheck,0);assert.equal(desc,0);ok('Kullanım bilgisi yalnız Öğreniyorum\'da ('+nLearn+' kart); Uyguluyorum\'da yok');
  // Geri düğmesi görünür
  assert(await page.locator('.top .back').first().isVisible());ok('Oyun ekranında görünür "← Geri" var');
  // Yanıt yok → doğrudan geri
  await page.locator('.top .back').first().click();await page.waitForFunction(()=>st.screen==='boardmode');assert.equal(await page.locator('#ov.on').count(),0);ok('Yanıt yokken Geri doğrudan çalışma biçimi ekranına döner');
  await page.locator('.top .back').first().click();await page.waitForFunction(()=>st.screen==='content');ok('Çalışma biçimi → takım listesi');
  await page.locator('.top .back').first().click();await page.waitForFunction(()=>st.screen==='subject');ok('Takım listesi → konu menüsü');
  // Yanıt var → onay
  await setup('learn');await page.evaluate(()=>{const it=st.board.items[0];tapImg(it.id);tapName(st.board.names.indexOf(it.answer));});
  assert(await page.evaluate(()=>Object.keys(st.board.res).length>0));
  await page.evaluate(()=>saveProgress());const before=await page.evaluate(()=>records().length);assert.equal(before,1);
  await page.locator('.top .back').first().click();assert((await page.locator('.modal').textContent()).includes('Geri dönülürse bu çalışmadaki yanıtlar silinecek.'));ok('Yanıt varken onay sorusu çıkar');
  await page.locator('#mNo').click();assert.equal(await page.evaluate(()=>st.screen),'board');ok('Hayır: oyunda kalır');
  await page.evaluate(()=>history.back());await page.waitForSelector('.modal');ok('Tarayıcı/telefon geri tuşu aynı soruyu sorar');
  await page.locator('#mYes').click();await page.waitForFunction(()=>st.screen==='boardmode');
  const after=await page.evaluate(()=>({n:records().length,sess:st.sess,run:st.run}));assert.equal(after.n,0);assert.equal(after.sess,null);assert.equal(after.run,false);ok('Evet: yanıtlar silinir, yarım oturum kayıt listesinde kalmaz, süre durur');
  // Görsel oranı
  await setup('learn');const fits=await page.evaluate(()=>[...document.querySelectorAll('.bimg-btn img')].map(i=>getComputedStyle(i).objectFit));assert(fits.length&&fits.every(f=>f==='contain'));
  await page.locator('.zoom-btn').first().click();await page.waitForSelector('.modal.zoom img');const z=await page.evaluate(()=>{const i=document.querySelector('.modal.zoom img');return [getComputedStyle(i).objectFit,i.naturalWidth>0];});assert.equal(z[0],'contain');assert(z[1]);ok('Kart ve büyütülmüş görselde object-fit: contain');
  assert.deepEqual(errors,[]);ok('Tarayıcıda JavaScript hatası yok');
 }catch(e){console.error('FAIL',e);process.exitCode=1;}finally{await browser.close();server.close();}
})();
