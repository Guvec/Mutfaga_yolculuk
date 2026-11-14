/* Gerçek Firebase web SDK + Auth/Firestore emülatörleri ile rekor akışı (rekor-baglanti.js + firestore.rules birlikte).
   FIREBASE_SDK_CACHE: firebase-app.js, firebase-auth.js, firebase-firestore.js (10.12.2). Fiziksel Android değildir. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.jpg':'image/jpeg','.png':'image/png'};
 const server=http.createServer((req,res)=>{let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(rel==='/')rel='/index.html';const file=path.resolve(root,'.'+rel);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const sdk=process.env.FIREBASE_SDK_CACHE||'/tmp/race13-qa',errors=[],browsers=[];const ok=m=>console.log('PASS '+m);
 async function device(){
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-gpu']});browsers.push(browser);
  const c=await browser.newContext({viewport:{width:390,height:844}});
  await c.route('**/js/ad.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(root,'js/ad.js'),'utf8').replace('function adMigrate(){','function adMigrate(){return;').replace('async function adSync(){','async function adSync(){return;')}));
  await c.route('**/js/yaris-ayar.js',r=>r.fulfill({contentType:'text/javascript',body:'window.YARIS_FIREBASE_CONFIG={projectId:"demo-mesleki-yaris",apiKey:"demo-test-key",authDomain:"demo-mesleki-yaris.firebaseapp.com"};'}));
  await c.route('https://www.gstatic.com/firebasejs/10.12.2/*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(sdk,new URL(r.request().url()).pathname.split('/').pop()))}));
  await require('./helpers/hazir.cjs')(c);const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await require('./helpers/sound-choice.cjs')(p);await p.goto(url);await p.waitForFunction(()=>typeof rkFlush==='function'&&CONTENT.baharat&&CONTENT['mutfak-araclari']);await p.evaluate(()=>{adMigrate=()=>{};AD_STATE.busy=true;rkBefore=async(b,fn)=>fn();});p.ctx=c;return p;
 }
 const play=(p,name,wrong,set=1)=>p.evaluate(([name,wrong,set])=>{if(!profiles().includes(name))lsSet('profiles',profiles().concat([name]));pickProfile(name);st.subject='baharat';st.op='match';st.contentSet=set;startBoard('check',12);const b=st.board;b.items.forEach((it,i)=>{const nm=i<wrong?b.items[(i+1)%wrong].answer:it.answer;tryPair(it.id,nm);});checkBoard();return st.sess.ok;},[name,wrong,set]);
 const settle=p=>p.waitForFunction(()=>!RK.busy&&!RK.maint&&!rkQueue().length,null,{timeout:20000});
 const list=(p,t)=>p.evaluate(t=>rkBackend().list(t),t);
 try{
  const A=await device(),B=await device();
  const T=await A.evaluate(()=>RK_TERM+'~'),W=await A.evaluate(()=>rkWeekNo()),G1=T+'bh-e1~genel',H1=T+'bh-e1~w'+W;

  assert.equal(await play(A,'Ali',2),10);await settle(A);await A.waitForFunction(()=>RK.msg&&/sıran/.test(RK.msg.cloud),null,{timeout:20000});
  const aid=await A.evaluate(()=>rkPid('Ali'));let rows=await list(A,G1);assert.equal(rows.find(r=>r.pid===aid).correct,10);rows=await list(A,H1);assert.equal(rows.find(r=>r.pid===aid).correct,10);
  assert.deepEqual(Object.keys(rows.find(r=>r.pid===aid)).sort(),['correct','gen','name','pid','rank','term','version']);ok('Gerçek kurallarla ilk sonuç genel ve haftalık tabloya yazıldı; açık satırda süre/hesap kimliği yok');

  // Görünen ad değişince: önce ad, sonra puan ayrı işlemlerle; düşük sonuçta yalnız ad güncellenir.
  await A.evaluate(([p])=>{lsSet('rk_queue',[{qid:'n1',pid:p,board:'bh-e1',period:'genel',name:'Ali K',correct:11,gen:rkProf(p).gen,at:Date.now(),sess:1}]);rkFlush(null);},[aid]);await settle(A);
  let me=(await list(A,G1)).find(r=>r.pid===aid);assert.equal(me.name,'Ali K','oyun adı olduğu gibi kaydedilir');assert.equal(me.correct,11);
  await A.evaluate(([p])=>{lsSet('rk_queue',[{qid:'n2',pid:p,board:'bh-e1',period:'genel',name:'Ali',correct:9,gen:rkProf(p).gen,at:Date.now(),sess:1}]);rkFlush(null);},[aid]);await settle(A);
  me=(await list(A,G1)).find(r=>r.pid===aid);assert.equal(me.name,'Ali');assert.equal(me.correct,11);ok('Ad değişikliği + yüksek sonuç, ad değişikliği + düşük sonuç kurallarla uyumlu');

  // Haftalık tablo reddedilirse (yanlış hafta) genel yazılır, haftalık başarısızlık öğrenciye ayrı söylenir.
  await A.evaluate(()=>{window.__wk=rkWeekNo;rkWeekNo=()=>window.__wk()+5;});await play(A,'Ali',0);await A.waitForFunction(()=>!RK.busy&&!RK.maint);
  assert((await A.evaluate(()=>RK.msg.cloud)).includes('kaydediliyor'));assert(await A.evaluate(()=>rkQueue().length>0));await A.evaluate(()=>{rkWeekNo=window.__wk;rkFlush(null);});await settle(A);
  me=(await list(A,G1)).find(r=>r.pid===aid);assert.equal(me.correct,12);ok('Kural reddinde öğrenciye yazma hatası gösterilmedi; sonuç kuyrukta tutulup tekrar gönderildi');

  // İkinci cihaz: farklı hesap, aynı listeyi görür; başkasının satırına yazamaz.
  await play(B,'Ayşe',0);await settle(B);const bid=await B.evaluate(()=>rkPid('Ayşe'));rows=await list(B,G1);assert(rows.some(r=>r.pid===aid)&&rows.some(r=>r.pid===bid));
  const hijack=await B.evaluate(async([p,t])=>{try{await rkBackend().submit(t,p,{name:'X',correct:12,term:RK_TERM,version:1,gen:0});return 'yazdı';}catch(e){return e.code||e.message;}},[aid,G1]);assert(/permission/i.test(hijack),hijack);ok('İki ayrı cihaz aynı listeyi görüyor; başka cihaz yabancı satıra yazamıyor');

  // Listeden çık → satırlar sunucuda silinir; sonraki sonuç yazılmaz; listeye dön → nesil 2.
  await A.evaluate(()=>{pickProfile('Ali');go('rekor');});await A.getByRole('button',{name:'Listeden çık'}).click();await A.waitForFunction(()=>/kaldırıldı/.test(RK.view.notice),null,{timeout:20000});
  assert(!(await list(A,G1)).some(r=>r.pid===aid));assert(!(await list(A,H1)).some(r=>r.pid===aid));
  await play(A,'Ali',0);await settle(A);assert(!(await list(A,G1)).some(r=>r.pid===aid));ok('Listeden çık: sunucudaki satırlar silindi, sonraki sonuç yazılmadı');
  await A.evaluate(()=>go('rekor'));await A.getByRole('button',{name:'Listeye dön'}).click();await A.waitForFunction(()=>/Listeye döndün/.test(RK.view.notice),null,{timeout:20000});
  await play(A,'Ali',1);await settle(A);me=(await list(A,G1)).find(r=>r.pid===aid);assert.equal(me.gen,2);ok('Listeye dön: yeni nesil (2) ile yazıldı');

  // Puansız yoklama: kayıtta puan 0, buluta gönderim yok.
  const yk=await A.evaluate(async()=>{let n=0;const be=rkBackend(),sub=be.submit.bind(be);be.submit=(...a)=>{n++;return sub(...a);};st.subject='baharat';st.op='match';st.pekRound={kind:'m',set:1};rkPekFullCheck();st.board.items.forEach(it=>tryPair(it.id,it.answer));checkBoard();await new Promise(r=>setTimeout(r,800));be.submit=sub;const rec=records().filter(r=>r.unranked).at(-1);return {n,s:rec&&rec.s};});
  assert.equal(yk.n,0);assert.equal(yk.s,0);await A.reload();await A.waitForFunction(()=>typeof records==='function');assert.equal(await A.evaluate(()=>records().filter(r=>r.unranked).at(-1).s),0);ok('Puansız yoklama: geçmiş kaydında puan 0 (yenileme sonrası), gönderim çağrısı 0');

  // Çevrimdışı profil silme engellenir; çevrimiçi silmede sunucu durumu deleted, satırlar silinir.
  await A.waitForFunction(()=>CONTENT.baharat);await A.ctx.setOffline(true);await A.evaluate(()=>{go('profiles');askDelProfile('Ali');});assert((await A.locator('#ov').innerText()).includes('internete bağlan'));await A.evaluate(()=>closeModal());assert(await A.evaluate(()=>profiles().includes('Ali')));
  await A.ctx.setOffline(false);await A.evaluate(()=>window.dispatchEvent(new Event('online')));await A.evaluate(()=>askDelProfile('Ali'));await A.locator('#mYes').click();
  await A.waitForFunction(p=>!rkProfAll()[p],aid,{timeout:20000});assert.equal(await A.evaluate(async p=>{const d=await rkBackend().profile(p);return d&&d.status;},aid),'deleted');
  for(const t of [G1,H1])assert(!(await list(B,t)).some(r=>r.pid===aid));ok('Çevrimdışı profil silme engellendi; çevrimiçi silmede durum deleted ve satırlar silindi');

  assert.deepEqual(errors,[]);ok('Tarayıcıda yakalanmamış JavaScript hatası yok (gerçek SDK + emülatör; fiziksel Android değil)');
 }finally{for(const b of browsers)await b.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1);});
