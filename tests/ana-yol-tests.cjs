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
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-gpu']});
  const context=await browser.newContext({viewport:{width:390,height:760},isMobile:true,hasTouch:true});
  await context.route('https://**/*',route=>route.abort());
  const p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(url);await p.locator('.ae-home').waitFor();
  await p.evaluate(()=>guest());await p.evaluate(()=>go('home'));
  const screen=()=>p.evaluate(()=>st.screen);
  assert.equal(await p.locator('.ae-kald .ae-devam b').innerText(),'Çalışmaya başla');
  assert.equal(await p.locator('.ae-home-topic').count(),0);
  console.log('PASS İlerleme yokken "Kaldığın yer" çıkmaz, "Çalışmaya başla" görünür');
  assert.equal(await p.locator('.ae-yolgir').innerText().then(t=>t.includes('Sıcak Mutfak: Konular ve Uygulama')),true);
  await p.getByRole('button',{name:/^Servis$/}).click();
  assert.match(await p.locator('.ae-yolgir').innerText(),/Servis: Konular ve Uygulama/);
  await p.locator('.ae-yolgir').click();assert.equal(await screen(),'yolpenceresi');
  const rows=await p.locator('.ae-list-item strong').allTextContents();
  assert.deepEqual(rows,['Servant ve Kuver','Bulaşık Yıkama ve Atık Yönetimi']);
  await p.getByText('Servant ve Kuver').click();assert.equal(await screen(),'servantkuver');
  await p.evaluate(()=>back());assert.equal(await screen(),'yolpenceresi');
  await p.evaluate(()=>back());assert.equal(await screen(),'home');
  console.log('PASS Servis yol penceresi: konular ve geri dönüş');
  await p.getByRole('button',{name:/^Pastacılık$/}).click();await p.locator('.ae-yolgir').click();
  assert.deepEqual(await p.locator('.ae-list-item strong').allTextContents(),['Mutfak Araçları','Baharatlar','Yeterli ve Dengeli Beslenme','Bulaşık Yıkama ve Atık Yönetimi','Kek']);
  await p.getByText('Yeterli ve Dengeli Beslenme').click();assert.equal(await screen(),'beslenmeokuma');
  await p.getByRole('button',{name:'Sorulara geç'}).click();assert.equal(await screen(),'subject');
  await p.getByText('Çoktan Seçmeli Sorular').click();await p.waitForFunction(()=>st.screen==='content');
  assert.equal(await p.locator('.mq-kutu').count()>=7,true);
  await p.evaluate(()=>back());assert.equal(await screen(),'subject');
  await p.evaluate(()=>back());assert.equal(await screen(),'beslenmeokuma');
  await p.evaluate(()=>go('yolpenceresi'));
  await p.getByText('Kek',{exact:true}).click();assert.equal(await screen(),'tarifkart');
  await p.evaluate(()=>back());assert.equal(await screen(),'yolpenceresi');
  console.log('PASS Pastacılık yol penceresi: konular, uygulama ve geri dönüş');
  await p.evaluate(()=>go('home'));
  for(const name of ['Arkadaşlarım','Mutfak Kitabım','Görünüm ve Hareketler','Lezzetleri Keşfet','Birlikte Oyna','Sıralama','Rozetlerim'])
   assert.equal(await p.getByRole('button',{name,exact:true}).count(),1,name);
  console.log('PASS Profil düğmeleri ve alt menü görünür');
  await p.locator('.ae-dost').click();await p.waitForFunction(()=>st.screen==='giris',null,{timeout:3000});
  assert.equal(await p.locator('#gKitchen').isVisible(),true);assert.equal(await p.locator('#gWardrobe').isVisible(),false);
  await p.locator('[data-food=lemon]').first().click().catch(()=>{});
  await p.locator('#gStart').click();assert.equal(await screen(),'home');
  console.log('PASS Aşçı Dostum kartı besleme ekranını açar, geri ana sayfaya döner');
  assert.deepEqual(errors,[]);
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
