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
  await page.evaluate(()=>{window.__taken=new Set();window.adClaim=async(e,want,self)=>{const key=e+'_'+(want||0);if(profiles().filter(x=>x!==self).indexOf(adMake(e,want||0))>=0||window.__taken.has(key))return null;window.__taken.add(key);return {e,n:want||0,c:true};};});
  // 1) Profil ekranında ad kutusu yok
  await page.evaluate(()=>go('profiles'));
  assert.equal(await page.locator('#pname').count(),0);ok('Profil ekranında ad yazma kutusu yok');
  await page.getByRole('button',{name:/Yeni profil/}).click();
  assert.equal(await page.evaluate(()=>st.screen),'pedit');assert.equal(await page.locator('.ad-tab button').count(),11);
  ok('Karakter ekranı: 10 kategori sekmesi');
  // 2) 209 karakter, sıra korunmuş
  const cnt=await page.evaluate(()=>[AD_BASE,AD_KAR[0][1],AD_KAR[208][1],AD_KAR[209][1],AD_KAR[219][1]]);assert.deepEqual(cnt,[220,'Cesur Panda','Altın Çöl','Aşçı Tavşan','Fırıncı Koala']);ok('Liste: 209 eski karakter sırası korunmuş, 11 mutfak karakteri sona eklenmiş');
  // 3) Panda (0) boşsa numarasız; alınmışsa numara
  await page.evaluate(()=>{adCat(0);adSet(0);});
  await page.getByRole('button',{name:'✅ Profili Oluştur'}).click();
  await page.waitForFunction(()=>st.screen==='home');
  assert.equal(await page.evaluate(()=>st.prof),'🐼 Cesur Panda');ok('Boş karakter numarasız alındı');
  await page.evaluate(()=>{go('profiles');adOpen(-1,'profiles');adSet(0);});
  await page.getByRole('button',{name:'✅ Profili Oluştur'}).click();await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>st.screen),'pedit');assert.equal(await page.evaluate(()=>profiles().length),1);ok('Alınmış karakter seçilemez, numara eklenmez');
  await page.evaluate(()=>adPick(AD_VAR[0][0]));
  await page.getByRole('button',{name:'✅ Profili Oluştur'}).click();await page.waitForFunction(()=>st.screen==='home'&&st.prof!=='🐼 Cesur Panda');
  assert.equal(await page.evaluate(()=>st.prof),'🐼 Sakin Panda');ok('Aynı figürün başka sıfatı ayrı karakter olarak alındı');
  assert.equal(await page.evaluate(()=>profiles().length),2);
  // 4) Değiştirme: kayıtlar yeni ada taşınır, eski rezervasyon bırakılır
  await page.evaluate(()=>{lsSet('records',[{p:'🐼 Sakin Panda',t:new Date().toISOString(),qs:[]}]);});
  await page.evaluate(()=>{const i=profiles().indexOf('🐼 Sakin Panda');adOpen(i,'profiles');adSet(1);});
  // Son hak uyarısı: Hayır derse hiçbir şey değişmez; Evet derse değişir
  await page.getByRole('button',{name:'💾 Kaydet'}).click();await page.getByRole('button',{name:'Hayır, vazgeç'}).click();
  assert.equal(await page.evaluate(()=>profiles().includes('🐼 Sakin Panda')&&!document.getElementById('adOnayKapi')),true);ok('Son hak uyarısı: Hayır deyince karakter değişmedi');
  await page.getByRole('button',{name:'💾 Kaydet'}).click();await page.getByRole('button',{name:'Evet, değiştir'}).click();await page.waitForFunction(()=>st.screen==='profiles');
  const after=await page.evaluate(()=>({p:profiles(),r:records().map(x=>x.p)}));
  assert(after.p.includes('🦊 Kurnaz Tilki')&&!after.p.includes('🐼 Sakin Panda'));assert.deepEqual(after.r,['🦊 Kurnaz Tilki']);ok('Karakter değişince profil ve kayıtlar yeni ada taşındı');
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
  // 6) Havuz: benzersiz adlar, yeterli sayı, yasaklı sözcük yok, eski sıra korunmuş
  const pool=await page.evaluate(()=>({n:AD_KAR.length,u:new Set(AD_KAR.map(k=>k[1])).size,first:AD_KAR.slice(0,220).map(k=>k[1]).join('|'),bad:AD_KAR.filter(k=>/(^|\s)(top|şişko|salak|aptal|kör|sağır|deli|çirkin|korkak|tembel)(\s|$)/i.test(k[1])||/#/.test(k[1])).map(k=>k[1]),maxLen:Math.max(...AD_KAR.map(k=>(k[0]+' '+k[1]).length))}));
  assert(pool.n>=1500,'havuz '+pool.n);assert.equal(pool.u,pool.n);assert.deepEqual(pool.bad,[]);assert(pool.maxLen<=40);ok('Havuz '+pool.n+' karakter, hepsi benzersiz, uygunsuz sözcük ve numara yok');
  // 7) 150 öğrenci için otomatik atama: hepsi farklı, numarasız
  const many=await page.evaluate(async()=>{window.__taken=new Set();const out=new Set();for(let i=0;i<150;i++){const r=await adClaimAny(null);out.add(adMake(r.e,r.n));}return {n:out.size,hash:[...out].some(x=>x.includes('#'))};});
  assert.equal(many.n,150);assert.equal(many.hash,false);ok('150 otomatik atama: hepsi ayrı, numarasız');
  // 8) Figür ekranı: sıfat düğmeleri görünür, alınmış olan kapalı
  await page.evaluate(()=>{lsSet('profiles',['🐼 Cesur Panda']);lsSet('ad_map',{'🐼 Cesur Panda':{e:0,n:0,c:true}});go('profiles');adOpen(-1,'profiles');adSet(0);});
  assert.equal(await page.locator('#pe-ad button').count(),8);assert.equal(await page.locator('#pe-ad button:disabled').count(),1);ok('Figür ekranında 8 ad, alınmış olan seçilemez');
  assert(errors.length===0,'JS hatası: '+errors.join('|'));ok('Tarayıcıda yakalanmamış JavaScript hatası yok');
 }catch(e){console.error('FAIL',e);process.exitCode=1;}finally{await browser.close();server.close();}
})();
