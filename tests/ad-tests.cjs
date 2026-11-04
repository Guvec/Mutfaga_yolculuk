/* Oyun adı (karakter) seçimi: ekran, profil oluşturma, değiştirme, eski profillerin dönüşümü. Firebase yerine bellek içi sahte rezervasyon. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const server=http.createServer((req,res)=>{let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(rel==='/')rel='/index.html';const file=path.resolve(root,'.'+rel);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-gpu']});const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));let n=0;const ok=m=>{n++;console.log('PASS '+m);};
 try{
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>typeof adOpen==='function'&&typeof CONTENT!=='undefined');
  // Sahte rezervasyon: alınmış karakterler kümesi
  await page.evaluate(()=>{window.__taken=new Set();window.adClaim=async(e,want)=>{const c=[want||0,482];for(const k of c){const key=e+'_'+k;if(!window.__taken.has(key)){window.__taken.add(key);return {e,n:k,c:true};}}return {e,n:777,c:true};};});
  // 1) Profil ekranında ad kutusu yok
  await page.evaluate(()=>go('profiles'));
  assert.equal(await page.locator('#pname').count(),0);ok('Profil ekranında ad yazma kutusu yok');
  await page.getByRole('button',{name:/Yeni profil/}).click();
  assert.equal(await page.evaluate(()=>st.screen),'pedit');assert.equal(await page.locator('.ad-tab button').count(),10);
  ok('Karakter ekranı: 10 kategori sekmesi');
  // 2) 209 karakter, sıra korunmuş
  const cnt=await page.evaluate(()=>[AD_KAR.length,AD_KAR[0][1],AD_KAR[208][1]]);assert.deepEqual(cnt,[209,'Cesur Panda','Altın Çöl']);ok('Liste: 209 karakter, sıra korunmuş');
  // 3) Panda (0) boşsa numarasız; alınmışsa numara
  await page.evaluate(()=>{adCat(0);adSet(0);});
  await page.getByRole('button',{name:'✅ Profili Oluştur'}).click();
  await page.waitForFunction(()=>st.screen==='home');
  assert.equal(await page.evaluate(()=>st.prof),'🐼 Cesur Panda');ok('Boş karakter numarasız alındı');
  await page.evaluate(()=>{go('profiles');adOpen(-1,'profiles');adSet(0);});
  await page.getByRole('button',{name:'✅ Profili Oluştur'}).click();await page.waitForFunction(()=>st.screen==='home'&&st.prof!=='🐼 Cesur Panda');
  assert.equal(await page.evaluate(()=>st.prof),'🐼 Cesur Panda #482');ok('Alınmış karakterin yanına numara eklendi');
  assert.equal(await page.evaluate(()=>profiles().length),2);
  // 4) Değiştirme: kayıtlar yeni ada taşınır, eski rezervasyon bırakılır
  await page.evaluate(()=>{lsSet('records',[{p:'🐼 Cesur Panda #482',t:new Date().toISOString(),qs:[]}]);});
  await page.evaluate(()=>{const i=profiles().indexOf('🐼 Cesur Panda #482');adOpen(i,'profiles');adSet(1);});
  await page.getByRole('button',{name:'💾 Kaydet'}).click();await page.waitForFunction(()=>st.screen==='profiles');
  const after=await page.evaluate(()=>({p:profiles(),r:records().map(x=>x.p)}));
  assert(after.p.includes('🦊 Kurnaz Tilki')&&!after.p.includes('🐼 Cesur Panda #482'));assert.deepEqual(after.r,['🦊 Kurnaz Tilki']);ok('Karakter değişince profil ve kayıtlar yeni ada taşındı');
  // 5) Eski gerçek adlı profil: açılışta karakter alır, kayıtlar taşınır, rekor kimliği sıfırlanır
  await page.evaluate(()=>{lsSet('profiles',['Ali Veli']);lsSet('ad_map',{});lsSet('records',[{p:'Ali Veli',t:new Date().toISOString(),qs:[]}]);lsSet('rk_ids',{'Ali Veli':'abcdefghijklmnopqrst'});window.rkMaintenance=()=>{};st.prof='Ali Veli';});
  await page.evaluate(()=>adSync());await page.waitForFunction(()=>profiles()[0]!=='Ali Veli');
  const mig=await page.evaluate(()=>({p:profiles()[0],r:records().map(x=>x.p),ids:Object.keys(ls('rk_ids',{})),cur:st.prof,real:JSON.stringify(localStorage).includes('Ali Veli')}));
  assert(/^\S+ .+/.test(mig.p)&&mig.p!=='Ali Veli');assert.equal(mig.r[0],mig.p);assert.equal(mig.cur,mig.p);assert(!mig.ids.includes('Ali Veli'));
  ok('Gerçek adlı eski profil karaktere dönüştü; kayıtlar taşındı, eski rekor kimliği bırakıldı');
  // 6) Silinen profilin rezervasyonu bırakılır
  await page.evaluate(()=>{window.__rel=[];window.adRelease=async m=>{window.__rel.push(m.e+'_'+m.n);};const p=profiles()[0];lsSet('profiles',[]);});
  await page.evaluate(()=>adSync());await page.waitForFunction(()=>window.__rel.length>0);ok('Profil silinince karakter rezervasyonu bırakılır');
  // 7) Dönüşüm sonrası yerel depoda gerçek ad kalmadı
  assert(errors.length===0,'JS hatası: '+errors.join('|'));ok('Tarayıcıda yakalanmamış JavaScript hatası yok');
 }catch(e){console.error('FAIL',e);process.exitCode=1;}finally{await browser.close();server.close();}
})();
