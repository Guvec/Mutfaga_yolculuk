const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
(async()=>{
 const server=http.createServer((req,res)=>{
  const rel=new URL(req.url,'http://localhost').pathname.replace(/^\/Mutfaga_yolculuk\//,'/');
  const f=path.resolve(root,'.'+decodeURIComponent(rel==='/'?'/index.html':rel));
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f)){res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://localhost:'+server.address().port+'/Mutfaga_yolculuk/';
 let browser;
 try{
  const executablePath=process.env.MUTFAK_CHROMIUM_PATH;
  browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-gpu',...(executablePath?['--single-process']:[])]});
  const errors=[];
  const context=await browser.newContext({viewport:{width:360,height:640},isMobile:true,hasTouch:true,serviceWorkers:'allow'});
  await context.addInitScript(()=>localStorage.setItem('mesleki-ses-soru','1'));
  await context.route('https://**/*',route=>route.abort());
  const p=await context.newPage();
  p.on('pageerror',error=>errors.push(error.message));
  p.on('response',r=>{if(r.url().startsWith(url)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
  await p.goto(url);await p.locator('.ae-home').waitFor();
  assert.equal(await p.locator('.ae-rank-note').innerText(),'100 puan kaldı');
  assert.equal(await p.locator('.ae-progress').getAttribute('aria-valuenow'),'0');
  for(const [width,height] of [[360,640],[390,760],[1366,768],[1920,1080]]){
   await p.setViewportSize({width,height});
   const dim=await p.evaluate(()=>{
    const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,height:r.height}};
    return {width:innerWidth,height:innerHeight,page:document.documentElement.scrollHeight,wide:document.documentElement.scrollWidth,dost:rect('.ae-dost'),paths:rect('.ae-paths'),yolgir:rect('.ae-yolgir'),nav:rect('.ae-bottom')};
   });
   assert(dim.page<=height&&dim.wide<=width);
   assert(dim.nav.bottom<=height&&dim.dost.bottom<=dim.paths.top&&dim.paths.bottom<=dim.nav.top&&dim.yolgir.bottom<=dim.nav.top);
   console.log('PASS Ana ekran kaydırmasız: '+width+' × '+height);
  }
  await p.setViewportSize({width:390,height:760});
  await p.getByRole('button',{name:/Çalışmaya başla/}).click();await p.waitForFunction(()=>st.screen==='profiles');
  await p.evaluate(()=>guest());await p.waitForFunction(()=>st.screen==='yolum'||st.screen==='yolplay');
  await p.evaluate(()=>go('home'));
  await p.getByRole('button',{name:'Görünüm ve Hareketler'}).click();
  assert.deepEqual(await p.locator('#gOptions button span').allTextContents(),['Panda','Tavşan','Koala','Civciv','Penguen','Papağan','Kedi','Keçi','Geyik']);
  assert.equal(await p.locator('[data-dost-item=koala]').getAttribute('class').then(c=>/dost-locked/.test(c)),true);
  await p.locator('#gStart').click();
  assert.equal(await p.locator('.ae-dost-artwork').getAttribute('data-dost'),'panda');
  await p.getByRole('button',{name:'Lezzetleri Keşfet',exact:true}).click();
  await p.getByRole('button',{name:'Kek',exact:true}).click();
  await p.locator('#panda').click();
  assert.deepEqual(await p.locator('.food strong').allTextContents(),['Kek','Limon','Yoğurt','Süt','Ayran','Elma']);
  await p.getByRole('button',{name:'Limon',exact:true}).click();
  assert.equal(await p.locator('#speech').textContent(),'Limon ekşi.');
  assert.match(await p.locator('.dost-portrait').getAttribute('src'),/panda-limon/);
  assert.equal(await p.locator('#replay').isEnabled(),true);
  await p.locator('#replay').click();
  assert.match(await p.locator('.dost-portrait').getAttribute('src'),/panda-limon/);
  await p.waitForFunction(()=>Array.from(document.querySelectorAll('.food img')).every(img=>img.naturalWidth>0));
  const foodNames=new Set();
  for(let i=0;i<3;i++){
   (await p.locator('.food strong').allTextContents()).forEach(name=>foodNames.add(name));
   await p.locator('#otherFoods').click();
  }
  assert.equal(foodNames.size,14);
  await p.locator('#panda').click();await p.locator('#gMotion').click();await p.locator('[data-food=lemon]').click();
  assert.equal(await p.locator('#actor').getAttribute('data-effect'),'');
  assert.match(await p.locator('.dost-portrait').getAttribute('src'),/panda-limon/);
  await p.locator('#gEditor').click();await p.locator('[data-dost-item=krema]').click();
  await p.locator('#gWatch').click();assert.equal(await p.locator('#gApplied').textContent(),'Sabit hareket görünümü.');
  await p.locator('#gUse').click();assert.match(await p.locator('#gPreview img').getAttribute('src'),/panda-krema/);
  assert.equal(await p.locator('[data-dost-item=krema]').getAttribute('aria-pressed'),'true');
  await p.locator('[data-dost-tab=kiyafet]').click();await p.locator('[data-dost-item=krem]').click();await p.locator('#gUse').click();
  await p.locator('#gStart').click();assert.match(await p.locator('.dost-portrait').getAttribute('src'),/panda-krem/);
  await p.locator('#gLezzet').click();await p.waitForFunction(()=>st.screen==='lezzet');
  await p.evaluate(()=>back());await p.waitForFunction(()=>st.screen==='giris');
  await p.locator('#gStart').click();await p.waitForFunction(()=>st.screen==='market');
  await p.evaluate(()=>back());await p.waitForFunction(()=>st.screen==='home');
  await p.waitForFunction(()=>!!navigator.serviceWorker.controller, null, {timeout:10000});
  assert(await p.evaluate(async()=>!!(await caches.match('assets/ascidostum/panda-limon.webp'))));
  await context.setOffline(true);await p.reload();await p.getByRole('button',{name:'Lezzetleri Keşfet',exact:true}).click();
  await p.getByRole('button',{name:'Limon',exact:true}).click();await p.waitForFunction(()=>document.querySelector('.dost-portrait').naturalWidth>0);
  assert.equal(await p.locator('#speech').textContent(),'Limon ekşi.');
  assert.deepEqual(errors,[]);
  console.log('PASS İlk çalışma, 14 besin, panda, tekrar, sabit poz, görünüm, lezzetler ve çevrimdışı açılış');
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
