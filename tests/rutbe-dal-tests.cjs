const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium,devices}=require('playwright');

const root=path.join(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};

(async()=>{
 const server=http.createServer((req,res)=>{
  const rel=new URL(req.url,'http://localhost').pathname;
  const file=path.join(root,decodeURIComponent(rel==='/'?'/index.html':rel));
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  const url='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch();
  const context=await browser.newContext({...devices['iPhone 13'],viewport:{width:390,height:844},serviceWorkers:'block'});
  await context.route('**/*',route=>route.request().url().startsWith(url)?route.continue():route.abort());
  await require('./helpers/hazir.cjs')(context);
  await context.addInitScript(()=>{
   const rows=[];
   window.REKOR_FAKE={
    rows,
    async ensureProfile(){return {status:'in',gen:0};},
    async submit(table,pid,row){rows.push({table,pid,...row});return {written:true};},
    async list(){return rows;}
   };
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const cdp=await context.newCDPSession(page);
  const safeTop=47;
  await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets:{top:safeTop,bottom:34,left:0,right:0}});
  await page.goto(url);
  async function baslikGuvenliMi(title){
   const baslik=page.locator('#app > .top .ttl');
   assert.equal(await baslik.innerText(),title);
   const top=()=>baslik.evaluate(el=>el.getBoundingClientRect().top);
   assert.ok(await top()>=safeTop,title+' üst güvenli alan');
   await page.evaluate(()=>window.scrollTo(0,260));
   assert.ok(await top()>=safeTop,title+' kaydırırken üst güvenli alan');
   await page.evaluate(()=>window.scrollTo(0,0));
  }
  async function evDugmesiniDogrula(){
   const top=page.locator('#app > .top');
   const home=top.getByRole('button',{name:'Ana sayfa',exact:true});
   assert.equal(await home.innerText(),'');
   assert.equal(await home.locator('svg').count(),1);
   const frame=button=>button.evaluate(el=>{
    const css=getComputedStyle(el);
    const {width,height}=el.getBoundingClientRect();
    return [width,height,css.border,css.borderRadius,css.backgroundColor];
   });
   const sound=top.locator('.ses-ac');
   assert.deepEqual(await frame(home),await frame(sound));
   assert.ok((await home.boundingBox()).x<(await sound.boundingBox()).x);
   return home;
  }
  const result=await page.evaluate(()=>{
   const prof='🐼 Cesur Panda';
   lsSet('profiles',[prof]);st.prof=prof;st.guest=false;
   adToast=()=>{};
   const pid=rkPid(prof,true),legacy={mp:320,rank:5,badges:{kuver:true,temizlik:true,karisik:true}};
   lsSet('rutbe',{[pid]:legacy});lsSet('rutbe_dal',{});
   lsSet('ana_yol','sicak');
   const before=RUTBE_DALLAR.map(dal=>rutbeDalState(pid,dal));
   const storedBefore=ls('rutbe',{})[pid],branchesBefore=ls('rutbe_dal',{});
   function award(table,puan=8,extra={}){
    return rutbeComplete({id:table,table,correct:1,total:1,ilerleme:true,puan,...extra});
   }
   const kuver=award('yol-kv-e1b1').dal;
   const kuverTekrar=award('yol-tk-kv-su-bardagi').dal;
   const kuverDegerlendirme=award('kv-basit').dal;
   const kuverMac=award('oda|kuver|tek|gorsel|0|10').dal;
   const karisik=award('okuma|kuver|butun|gorsel|0|10',8,{scope:'butun'}).dal;
   lsSet('ana_yol','servis');
   const pastacilik=award('yol-pasta-malzeme-1').dal;
   lsSet('ana_yol','pasta');
   const ortak=['ma-s1','bh-kutu-1','bl-s1','be-s1'].map(table=>award(table).dal);
   award('pastacilik-altinci-rutbe',1400);
   document.querySelector('#rutbeYeni')?.remove();
   document.querySelector('#rutbeKutlama')?.remove();
   const ranks=RUTBE_DALLAR.map(dal=>rutbeDalState(pid,dal));
   const total=rutbeGenel(pid).mp;
   const badges=rutbeGenel(pid).badges;
   const rank=rutbeNumber(pid);
   const label=rank=>new DOMParser().parseFromString(rutbeLabel(rank),'text/html').body.textContent;
   rkProfSet(pid,{status:'in',gen:0,synced:true});
   lsSet('rk_queue',[{qid:'rank-test',pid,board:'bh-e1',period:'genel',name:prof,correct:1,gen:0}]);
   return {before,storedBefore,branchesBefore,kuver,kuverTekrar,kuverDegerlendirme,kuverMac,karisik,pastacilik,ortak,ranks,total,badges,rank,labels:[1,2,3,4,5,6,16].map(label)};
  });
  assert.deepEqual(result.before,Array.from({length:3},()=>({mp:320,rank:3})));
  assert.equal(result.storedBefore.rank,5);
  assert.deepEqual(result.branchesBefore,{});
  for(const key of ['kuver','kuverTekrar','kuverDegerlendirme','kuverMac'])assert.equal(result[key],'servis');
  assert.equal(result.karisik,'sicak');
  assert.equal(result.pastacilik,'pasta');
  assert.deepEqual(result.ortak,Array(4).fill('pasta'));
  assert.deepEqual(result.ranks.map(x=>[x.mp,x.rank]),[[328,3],[1760,6],[352,3]]);
  assert.equal(result.total,1800);
  for(const k of ['kuver','temizlik','karisik'])assert.equal(result.badges[k],true);
  assert.equal(result.rank,6);
  assert.deepEqual(result.labels,['Stajyer','Çırak','Aşçı Yardımcısı','Aşçı','Kaptan','Şef Yardımcısı','']);
  await page.evaluate(()=>rkFlush('rank-test'));
  await page.waitForFunction(()=>!rkQueue().length&&!RK.busy);
  assert.deepEqual(await page.evaluate(()=>REKOR_FAKE.rows.map(x=>x.rank)),[6]);

  await page.evaluate(()=>{
   const pid=rkPid(st.prof),d=rutbeDalAll();
   d[pid].sicak={mp:160,rank:5};
   lsSet('rutbe_dal',d);lsSet('ana_yol','sicak');
   go('home');
  });
  assert.equal(await page.locator('.ae-serit-adlar strong [aria-hidden="true"]').innerText(),'Çırak ★★');
  assert.match(await page.locator('.ae-serit').getAttribute('aria-label'),/Çırak, ikinci yıldız/);
  await page.locator('.ae-serit').first().dispatchEvent('click');
  const card=page.locator('.ry-ust');
  assert.equal(await card.locator('h1 [aria-hidden="true"]').innerText(),'Çırak ★★');
  assert.equal(await card.locator('h1 .sr-only').textContent(),'Çırak, ikinci yıldız');
  assert.equal(await card.getByRole('heading',{name:'Çırak, ikinci yıldız'}).count(),1);
  assert.equal(await card.locator('progress').getAttribute('value'),'10');
  assert.equal(await card.locator('progress').getAttribute('max'),'50');
  assert.equal(await page.locator('.ry-yol li').count(),16);
  assert.equal(await page.locator('.ry-yol [aria-current="step"] strong [aria-hidden="true"]').innerText(),'Çırak ★★');
  await page.waitForFunction(()=>[...document.querySelectorAll('.ry img')].every(x=>x.complete&&x.naturalWidth>0));
  await baslikGuvenliMi('Rütbe Yolu');
  await evDugmesiniDogrula();
  const yol=page.locator('.ry-yol');
  assert.equal(await yol.evaluate(el=>el.previousElementSibling.matches('.ry-rozet-gecis')),true);
  assert.equal(await yol.evaluate(el=>el.nextElementSibling),null);
  assert.equal(await yol.evaluate(el=>getComputedStyle(el,'::before').zIndex),'-1');
  async function rutbeAdlariSigiyorMu(){
   return page.locator('.ry-serit li').evaluateAll(tiles=>tiles.every(tile=>{
    const text=tile.querySelector('strong > [aria-hidden="true"]')||tile.querySelector('strong');
    const box=tile.getBoundingClientRect(),range=document.createRange();
    range.selectNodeContents(text);
    return [...range.getClientRects()].every(r=>r.left>=box.left-.5&&r.right<=box.right+.5&&r.top>=box.top&&r.bottom<=box.bottom);
   }));
  }
  assert.equal(await rutbeAdlariSigiyorMu(),true);
  assert.equal(await yol.locator('li').first().locator('strong').evaluate(el=>getComputedStyle(el).fontSize),'11.5px');
  const rankTile=await yol.locator('li').first().boundingBox();
  const secondRankTile=await yol.locator('li').nth(1).boundingBox();
  const nextRankRow=await yol.locator('li').nth(5).boundingBox();
  const colGap=secondRankTile.x-rankTile.x-rankTile.width;
  const rowGap=nextRankRow.y-rankTile.y-rankTile.height;
  const cardStyle=tile=>tile.evaluate(el=>{
   const css=getComputedStyle(el);
   return [css.backgroundImage,css.backgroundColor,css.border,css.borderRadius,css.boxShadow];
  });
  const bodyBackground=()=>page.evaluate(()=>getComputedStyle(document.body).backgroundImage);
  const rankBackground=await bodyBackground();
  const rankStyle=await cardStyle(yol.locator('li.ry-ok').first());
  const lockedRanks=page.locator('.ry-serit .ry-kilit');
  const lockedStyle=await cardStyle(lockedRanks.first());
  const tones=await lockedRanks.evaluateAll(tiles=>tiles.map(tile=>[
   getComputedStyle(tile).opacity,getComputedStyle(tile.querySelector('img')).filter
  ]));
  assert.equal(new Set(tones.map(t=>t.join(' '))).size,1);
  assert.deepEqual(tones[0],['1','brightness(0) invert(0.53)']);
  const shots=process.env.RUTBE_SHOTS;
  if(shots){
   await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:path.join(shots,'iPhone_Rutbe_Yolu_Ust_Dugmeler.png'),fullPage:true,scale:'device',animations:'disabled'});
  }
  await page.locator('.ry-rozet-gecis').dispatchEvent('click');
  await baslikGuvenliMi('Rozetlerim');
  await evDugmesiniDogrula();
  const badges=page.locator('.ry-rozetler');
  const panel=await badges.boundingBox();
  assert.equal(panel.x,0);
  assert.equal(panel.width,390);
  const grid=badges.locator('.ry-rozet-izgara');
  const tiles=grid.locator('button.ry-roz-kart');
  const counter=badges.locator('.ry-roz-sayac');
  const detail=badges.locator('#ryRozetAyrinti');
  assert.equal(await detail.isVisible(),false);
  assert.equal(await detail.evaluate(el=>el.previousElementSibling.matches('.ry-roz-sayac')&&el.nextElementSibling.matches('.ry-rozet-izgara')),true);
  assert.equal(await counter.innerText(),'3 / 6 rozet kazanıldı');
  assert.equal(await bodyBackground(),rankBackground);
  assert.deepEqual(await cardStyle(tiles.filter({hasText:'Kazanıldı'}).first()),rankStyle);
  assert.deepEqual(await cardStyle(badges.locator('.ry-roz-kilit').first()),lockedStyle);
  assert.equal(await tiles.count(),6);
  assert.equal(await tiles.locator('p, button').count(),0);
  const coordinates=await tiles.evaluateAll(elements=>elements.map(el=>[el.getBoundingClientRect().x,el.getBoundingClientRect().y]));
  assert.equal(new Set(coordinates.map(([x])=>x)).size,3);
  assert.equal(new Set(coordinates.map(([,y])=>y)).size,2);
  const baharatAdi=tiles.filter({hasText:'Baharatları Tanıyorum'}).locator('strong');
  assert.equal(await baharatAdi.evaluate(el=>{
   const word=document.createRange();
   word.setStart(el.firstChild,0);
   word.setEnd(el.firstChild,'Baharatları'.length);
   return word.getClientRects().length;
  }),1);
  const [first,second,third,fourth]=await Promise.all([0,1,2,3].map(i=>tiles.nth(i).boundingBox()));
  const gridBox=await grid.boundingBox();
  assert.ok(Math.abs(first.x-gridBox.x)<.1);
  assert.ok(Math.abs((third.x+third.width)-(gridBox.x+gridBox.width))<.1);
  assert.ok(Math.abs(second.x-first.x-first.width-colGap)<.1);
  assert.ok(Math.abs(fourth.y-first.y-first.height-rowGap)<.1);
  const namesHavePadding=await tiles.evaluateAll(elements=>elements.every(tile=>{
   const label=tile.querySelector('strong'),box=tile.getBoundingClientRect(),range=document.createRange();
   range.selectNodeContents(label);
   return [...range.getClientRects()].every(r=>r.left>=box.left+8&&r.right<=box.right-8);
  }));
  assert.equal(namesHavePadding,true);
  async function rozetlerSigiyorMu(){
   return page.evaluate(()=>document.scrollingElement.scrollHeight<=window.innerHeight+1&&
    [...document.querySelectorAll('.ry-roz-kart')].every(tile=>tile.getBoundingClientRect().bottom<=window.innerHeight));
  }
  assert.equal(await rozetlerSigiyorMu(),true);
  const metinler=[
   ['arac','Araçları Tanıyorum','Mutfak Araçları yolculuğunun bütün bölümlerini ve etap sonlarını bitir.','Mutfak Araçları yolculuğunun bütün bölümlerini ve etap sonlarını bitirdin.'],
   ['baharat','Baharatları Tanıyorum','Baharat yolculuğunun bütün bölümlerini ve etap sonlarını bitir.','Baharat yolculuğunun bütün bölümlerini ve etap sonlarını bitirdin.'],
   ['kuver','Kuver Ustası','Basit Kuver ve Tabldot Kuver değerlendirmelerinde hatasız ol.','Basit Kuver ve Tabldot Kuver değerlendirmelerinde hatasız oldun.'],
   ['temizlik','Temizlik ve Düzen','Bulaşık eşleştirmede en az 10/12, bulaşık sorularında 65 sorudan en az 55 doğru.','Bulaşık eşleştirmede en az 10/12, bulaşık sorularında 65 sorudan en az 55 doğru yaptın.'],
   ['karisik','Karışık Oyun Ustası','Bütün konular kapsamında 5 oturum tamamla; birinde en az %70 doğru yap.','Bütün konular kapsamında 5 oturum tamamladın; birinde en az %70 doğru yaptın.'],
   ['rekor','Kendi Rekorumu Aştım','En az 5 farklı tabloda kendi rekorunu geç.','En az 5 farklı tabloda kendi rekorunu geçtin.']
  ];
  await page.evaluate(()=>{window.sonRozetOkumasi=null;sesSoyle=metin=>{window.sonRozetOkumasi=metin;};});
  async function rozetleriDogrula(kazanilan){
   let secilen;
   for(const [kod,ad,kosul,tamam] of metinler){
    const kazanildi=kazanilan.includes(kod);
    const badge=badges.locator(kazanildi?'.ry-roz-ok':'.ry-roz-kilit').filter({hasText:ad});
    assert.equal(await badge.locator('.ry-roz-durum').innerText(),kazanildi?'Kazanıldı':'🔒');
    assert.equal(await badge.locator('.ry-roz-gorsel').evaluate(el=>getComputedStyle(el).filter),kazanildi?'none':'grayscale(1)');
    await badge.click();
    const heading=detail.getByRole('heading',{name:ad,exact:true});
    assert.equal(await heading.isVisible(),true);
    assert.equal(await detail.locator('p').innerText(),kazanildi?tamam:kosul);
    assert.equal(await badge.getAttribute('aria-expanded'),'true');
    assert.equal(await tiles.and(badges.locator('[aria-expanded="true"]')).count(),1);
    if(secilen)assert.equal(await secilen.getAttribute('aria-expanded'),'false');
    assert.equal(await page.locator('#ov.on').count(),0);
    const detailBox=await detail.boundingBox(),counterBox=await counter.boundingBox(),gridBox=await grid.boundingBox();
    assert.ok(detailBox.y>=counterBox.y+counterBox.height);
    assert.ok(detailBox.y+detailBox.height<=gridBox.y);
    const read=detail.getByRole('button',{name:kazanildi?'Rozetini dinle':'Rozet koşulunu dinle'});
    assert.ok((await read.boundingBox()).x>=(await heading.boundingBox()).x+(await heading.boundingBox()).width);
    await read.click();
    assert.equal(await page.evaluate(()=>window.sonRozetOkumasi),ad+'. '+(kazanildi?tamam:kosul));
    secilen=badge;
   }
   await detail.getByRole('button',{name:'Kapat'}).click();
   assert.equal(await detail.isVisible(),false);
   assert.equal(await secilen.getAttribute('aria-expanded'),'false');
   assert.equal(await secilen.evaluate(el=>document.activeElement===el),true);
  }
  await rozetleriDogrula(['kuver','temizlik','karisik']);
  await page.waitForFunction(()=>[...document.querySelectorAll('.ry-rozetler img')].every(x=>x.complete&&x.naturalWidth>0));
  if(shots){
   await page.screenshot({path:path.join(shots,'iPhone_Rozetlerim_Ust_Ayrinti.png'),scale:'device',animations:'disabled'});
   await badges.getByRole('button',{name:'Kuver Ustası. Kazanıldı',exact:true}).tap();
   await detail.waitFor({state:'visible'});
   await page.screenshot({path:path.join(shots,'iPhone_Rozet_Ayrinti_Karti.png'),scale:'device',animations:'disabled'});
   await detail.getByRole('button',{name:'Kapat'}).click();
  }
  await page.getByRole('button',{name:'Geri',exact:true}).dispatchEvent('click');
  assert.equal(await page.locator('#app > .top .ttl').innerText(),'Rütbe Yolu');
  await page.evaluate(()=>{
   const a=rutbeAll(),pid=rkPid(st.prof);
   a[pid].badges={arac:true,baharat:true,rekor:true};
   lsSet('rutbe',a);go('home');loncaRozetAc();
  });
  await rozetleriDogrula(['arac','baharat','rekor']);
  await page.evaluate(()=>{
   const a=rutbeAll(),pid=rkPid(st.prof);
   a[pid].badges.baharat=false;
   lsSet('rutbe',a);render();
  });
  assert.equal(await counter.innerText(),'2 / 6 rozet kazanıldı');
  await page.setViewportSize({width:360,height:740});
  await baslikGuvenliMi('Rozetlerim');
  await evDugmesiniDogrula();
  assert.equal((await badges.boundingBox()).width,360);
  assert.equal(await rozetlerSigiyorMu(),true);
  await page.setViewportSize({width:320,height:568});
  assert.equal(await rozetlerSigiyorMu(),true);
  await page.setViewportSize({width:320,height:400});
  await tiles.last().tap();
  await tiles.nth(4).tap();
  assert.ok((await detail.boundingBox()).y>=(await page.locator('#app > .top').boundingBox()).height);
  await detail.getByRole('button',{name:'Kapat'}).tap();
  await page.setViewportSize({width:360,height:740});
  await (await evDugmesiniDogrula()).tap();
  assert.equal(await page.locator('.lc-home').count(),1);
  await page.evaluate(()=>rutbeYolAc());
  await baslikGuvenliMi('Rütbe Yolu');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),360);
  for(const dal of ['sicak','pasta','servis']){
   await page.evaluate(d=>rutbeYolDal(d),dal);
   assert.equal(await rutbeAdlariSigiyorMu(),true,dal);
  }
  await (await evDugmesiniDogrula()).tap();
  assert.equal(await page.locator('.lc-home').count(),1);

  await page.evaluate(()=>kilavuzAc('rutbe'));
  const guide=page.locator('.guide-item[open]');
  assert.match(await guide.innerText(),/Şef Garson Yardımcısı · 1700 \/ 1900 \/ 2100 puan/);
  assert.match(await guide.innerText(),/Pastacılık Kaptanı · 1100 \/ 1300 \/ 1500 puan/);
  assert.deepEqual(errors,[]);
  console.log('PASS dal puanları, eski kayıtlar, rütbe kartı, erişilebilir yıldız adları, rozetler, kılavuz ve sıralama yükü.');
 }finally{
  await browser?.close();
  server.closeAllConnections();
  server.close();
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
