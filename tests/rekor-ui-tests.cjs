/* Rekor, sıralama ve Pekiştiriyorum akışı. Firebase yerine bellek içi sahte arka uç kullanılır;
   Firestore kuralları ayrıca tests/rekor-rules-tests.cjs ile emülatörde sınanır. Fiziksel Android değildir. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
const FAKE=`window.REKOR_FAKE=(()=>{const prof={},rows={};let uid='u-cihaz';const wait=()=>new Promise(r=>setTimeout(r,5));
 return {prof,rows,
  async ensureProfile(pid){await wait();if(!navigator.onLine)throw Error('OFFLINE');if(!prof[pid])prof[pid]={owner:uid,status:'in',gen:0};if(prof[pid].owner!==uid)throw Error('permission-denied');return {...prof[pid]};},
  async submit(t,pid,row){await wait();const p=prof[pid];if(!p||p.status!=='in'||p.gen!==row.gen)return {stale:true};rows[t]=rows[t]||{};const o=rows[t][pid];if(o&&o.gen===row.gen&&o.correct>=row.correct)return {kept:true,best:o.correct};rows[t][pid]={...row};return {written:true,best:row.correct};},
  async list(t){await wait();if(!navigator.onLine)throw Error('OFFLINE');return Object.entries(rows[t]||{}).map(([pid,r])=>({pid,...r}));},
  async setStatus(pid,s){await wait();const p=prof[pid];if(!p)throw Error('NO_PROFILE');if(p.status==='deleted')throw Error('permission-denied');if(p.status===s)return {...p};p.status=s;p.gen++;return {...p};},
  async removeRow(t,pid){await wait();const p=prof[pid],r=(rows[t]||{})[pid];if(!r)return;if(!(p.status==='out'||p.status==='deleted'||r.gen<p.gen))throw Error('permission-denied');delete rows[t][pid];}
 };})();`;
(async()=>{
 const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'};
 const server=http.createServer((req,res)=>{let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(rel==='/')rel='/index.html';const file=path.resolve(root,'.'+rel);if(!file.startsWith(root+path.sep)){res.statusCode=403;res.end();return;}try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch(e){res.statusCode=404;res.end('missing')}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-gpu']});const ctx=await browser.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(FAKE);
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const shots=process.env.REKOR_SHOTS;
 const ok=m=>console.log('PASS '+m);
 try{
  await require('./helpers/sound-choice.cjs')(page);await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>typeof CONTENT!=='undefined'&&CONTENT.baharat&&CONTENT['mutfak-araclari']);
  const kep=await page.evaluate(()=>{const rows=[{pid:'a',name:'Bir',correct:10,rank:3},{pid:'b',name:'İki',correct:10},{pid:'c',name:'Üç',correct:8,rank:2}];const host=document.createElement('div');host.innerHTML=rkRowsHTML(rows,'bh-e1','genel',10);const li=host.querySelectorAll('li');return {hats:[...li].map(x=>x.querySelectorAll('.rk-hat').length),rank:[...li].map(x=>x.querySelector('.rutbe-small')?.textContent||'')};});
  assert.deepEqual(kep.hats,[1,1,0]);assert(kep.rank[0].includes('Aşçı'));assert.equal(kep.rank[1],'');assert(kep.rank[2].includes('Aşçı Yardımcısı'));ok('Kep eşit birincilerin hepsinde; rank olmayan satırda simge yok');
  const T=await page.evaluate(()=>RK_TERM+'~');
  const W=await page.evaluate(()=>rkWeekNo());
  // Bütün tabloların içerik sayıları kurallardaki sınırlarla aynı olmalı.
  const invalid=await page.evaluate(()=>RK_BOARDS.filter(b=>!rkBoardValid(b)).map(b=>b.id));assert.deepEqual(invalid,[]);ok('40 tablonun kart/soru sayısı içerikle aynı');
  const rulesBoards=fs.readFileSync(path.resolve(root,'ci/firebase/firestore.rules'),'utf8').match(/rkBoards\(\) \{ return \{([^}]*)\}/)[1];
  // Harita anahtarlarının yazılış sırası sıralama kuralı değildir; kimlik ve sınırları karşılaştır.
  const rulesEntries=Array.from(rulesBoards.matchAll(/'([^']+)':\s*(\d+)/g),m=>[m[1],Number(m[2])]).sort();
  const jsEntries=await page.evaluate(()=>RK_BOARDS.map(b=>[b.id,b.total]).sort());
  const rulesMap=new Map(rulesEntries);
  // Uygulamadaki her tablo kurallarda aynı sınırla bulunmalı. Kurallarda fazladan yalnız hazırlanmış (henüz yayımlanmamış) tablolar olabilir.
  jsEntries.forEach(([id,total])=>assert.equal(rulesMap.get(id),total,'Kurallarda eksik veya farklı sınır: '+id));
  const hazir=rulesEntries.map(([id])=>id).filter(id=>!jsEntries.some(([j])=>j===id));
  assert.deepEqual(hazir,['bh-tur','bl-tur','kv-tur','ma-tur']);ok('Kurallardaki tablo sınırları uygulamayla aynı; yalnız Büyük Tur tabloları hazır bekliyor');

  await page.evaluate(()=>{rkBefore=async function(board,fn){return fn();};adMigrate=()=>{};});
  const play=async(name,wrong)=>page.evaluate(([name,wrong])=>{
   if(!profiles().includes(name))lsSet('profiles',profiles().concat([name]));pickProfile(name);
   st.subject='baharat';st.op='match';st.contentSet=1;startBoard('check',12);
   const b=st.board;b.items.forEach((it,i)=>{const nm=i<wrong?b.items[(i+1)%wrong].answer:it.answer;tryPair(it.id,nm);});checkBoard();return st.sess.ok;},[name,wrong]);
  const banner=()=>page.locator('.rk-banner').innerText();
  const settle=()=>page.waitForFunction(()=>!RK.busy&&!rkQueue().length);

  assert.equal(await play('Ali',2),10);await settle();let t=await banner();assert(t.includes('İlk sonucun kaydedildi.'),t);await page.waitForFunction(()=>RK.msg&&/sıran/.test(RK.msg.cloud));t=await banner();assert(t.includes('Bu haftaki sıran: 1')&&t.includes('Genel sıran: 1'),t);ok('İlk sonuç: yerel kayıt + haftalık ve genel tabloya yazıldı');
  if(shots)await page.screenshot({path:shots+'/1-sonuc-390.png',fullPage:false});
  assert.equal(await play('Ali',0),12);await settle();t=await banner();assert(t.includes('Yeni kişisel rekor!'),t);
  let rows=await page.evaluate(([a,b])=>[REKOR_FAKE.rows[a],REKOR_FAKE.rows[b]],[T+'bh-e1~genel',T+'bh-e1~w'+W]);assert.equal(Object.values(rows[0])[0].correct,12);assert.equal(Object.values(rows[1])[0].correct,12);
  assert.deepEqual(Object.keys(Object.values(rows[0])[0]).sort(),['correct','gen','name','rank','term','version']);ok('Yeni rekor; açık satırda yalnız ad, doğru, dönem, sürüm, nesil');
  assert.equal(await play('Ali',3),9);await settle();t=await banner();assert(t.includes('En iyi sonucun korunuyor: 12 / 12'),t);rows=await page.evaluate(a=>REKOR_FAKE.rows[a],T+'bh-e1~genel');assert.equal(Object.values(rows)[0].correct,12);ok('Düşük sonuç rekoru bozmuyor, hata gibi gösterilmiyor');

  // Pekiştiriyorum: 3 yanlış listede; tur 2–4 hedef ve gerçek karışıklıklardan oluşan ad havuzuyla açılır.
  // Aynı günkü eski doğrular maddeyi listeden çıkarmaz; bu testte yalnız son oyunun 3 yanlışı bırakılır.
  await page.evaluate(()=>{const pid=rkPid('Ali'),m=rkPek(pid);Object.keys(m).forEach(k=>{const id=k.split('|')[3],it=st.board.items.find(x=>x.id===id);if(!it||st.board.pair[id]===it.answer)delete m[k];});rkPekSave(pid,m);});
  // Öğrenme yolu olan konularda eşleştirme pekiştirmesi menüde çıkmaz; eşleştirme 6'lı yolun ve Tekrar Çalışması'nın içindedir.
  await page.evaluate(()=>{st.subject='baharat';go('subject');});assert.equal(await page.getByRole('button',{name:/Pekiştiriyorum/}).count(),0);
  await page.evaluate(()=>{st.subject='baharat';rkPekStart('m',1);});
  const pb=await page.evaluate(()=>({n:st.board.items.length,names:st.board.names.length,all:st.board.items.every(it=>st.board.names.includes(it.answer)),variant:st.board.variant}));assert.equal(pb.n,3);assert(pb.names>=3&&pb.names<=5,JSON.stringify(pb));assert(pb.all&&pb.variant);
  if(shots)await page.screenshot({path:shots+'/2-pekistiriyorum-390.png'});
  await page.evaluate(()=>{st.board.items.forEach(it=>tryPair(it.id,it.answer));render();});t=await banner();assert(t.includes('Bu turu tamamladın.'),t);
  assert.equal(await page.evaluate(()=>rkPekItems('baharat').length),3);ok('Pekiştirme turu: tek bağımsız doğru maddeyi listeden çıkarmıyor');
  assert.equal(await page.locator('button[onclick*="startBoard"]').count(),0);
  const roundM=()=>page.evaluate(()=>{rkPekStart('m',1);st.board.items.forEach(it=>tryPair(it.id,it.answer));render();});
  const shiftDay=d=>page.evaluate(d=>{const a=rkPekAll();Object.values(a).forEach(m=>Object.values(m).forEach(it=>{it.day=d;}));lsSet('rk_pek',a);},d);
  assert.deepEqual(await page.evaluate(()=>Object.values(rkPek(rkPid('Ali'))).map(i=>i.streak)),[0,0,0]);ok('Aynı günkü doğru sayaca eklenmiyor');
  await shiftDay('2000-01-01');await roundM();assert.equal(await page.evaluate(()=>rkPekItems('baharat').length),3);
  await roundM();assert.equal(await page.evaluate(()=>rkPekItems('baharat').length),3);ok('Aynı gün ikinci tur maddeyi listeden çıkarmıyor');
  await shiftDay('2000-01-02');await roundM();assert.equal(await page.evaluate(()=>rkPekItems('baharat').length),0);ok('İki ayrı günde bağımsız doğru yapılınca madde listeden çıkıyor');
  assert.equal(await page.evaluate(()=>typeof rkPekFullCheck),'undefined');ok('12 görsel / 18 adlık yoklama kaldırıldı');

  // İkinci profil aynı cihazda: eşit puan ortak sıra, alfabetik.
  await play('Ayşe',0);await settle();await page.evaluate(()=>rkOpenBoard('bh-e1'));await page.waitForSelector('.rk-row');
  let list=await page.locator('.rk-row').allInnerTexts();assert.equal(list.length,2);assert(list[0].startsWith('1.')&&list[1].startsWith('1.'),list.join('|'));assert(list[0].includes('Ali')&&list[1].includes('Ayşe'),list.join('|'));assert(list[1].includes('(sen)'));ok('Eşitler aynı sırada (1, 1), alfabetik; kendi satırı işaretli');
  if(shots)await page.screenshot({path:shots+'/3-siralama-390.png',fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.evaluate(()=>{pickProfile('Ali');go('rekor');});await page.waitForSelector('.rk-rec');const rec=await page.locator('.rk-rec').first().innerText();assert(rec.includes('En iyi sonucun'),rec);if(shots)await page.screenshot({path:shots+'/4-rekorlarim-390.png',fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));

  // Listeden çık → satırlar silinir, yeni sonuç yazılmaz → listeye dön → yeni nesille yazılır.
  await page.getByRole('button',{name:'Listeden çık'}).click();await page.waitForFunction(()=>/kaldırıldı/.test(RK.view.notice));
  const aliPid=await page.evaluate(()=>rkPid('Ali'));rows=await page.evaluate(([a,p])=>Object.keys(REKOR_FAKE.rows[a]).includes(p),[T+'bh-e1~genel',aliPid]);assert.equal(rows,false);
  await play('Ali',0);await settle();rows=await page.evaluate(([a,p])=>Object.keys(REKOR_FAKE.rows[a]).includes(p),[T+'bh-e1~genel',aliPid]);assert.equal(rows,false);t=await banner();assert(t.includes('Sıralamada görünmüyorsun'),t);ok('Listeden çık: satırlar silindi, sonraki sonuç gönderilmedi');
  await page.evaluate(()=>go('rekor'));await page.getByRole('button',{name:'Listeye dön'}).click();await page.waitForFunction(()=>/Listeye döndün/.test(RK.view.notice));assert.equal(await page.evaluate(p=>REKOR_FAKE.prof[p].gen,aliPid),2);
  await play('Ali',2);await settle();rows=await page.evaluate(([a,p])=>REKOR_FAKE.rows[a][p],[T+'bh-e1~genel',aliPid]);assert.equal(rows.gen,2);assert.equal(rows.correct,10);ok('Listeye dön: yeni nesil (2) ile yazılıyor');
  // Eski nesilden kalmış bekleyen gönderim atılır.
  await page.evaluate(p=>lsSet('rk_queue',[{pid:p,board:'bh-e2',period:'genel',name:'Ali',correct:12,gen:0,at:Date.now(),sess:1}]),aliPid);await page.evaluate(()=>rkFlush(null));await settle();assert.equal(await page.evaluate(a=>!!REKOR_FAKE.rows[a],T+'bh-e2~genel'),false);ok('Eski nesille bekleyen gönderim atılıyor');

  // Çevrimdışı: sonuç kuyrukta bekler, bağlantı gelince gönderilir.
  await ctx.setOffline(true);await play('Ayşe',0);t=await banner();assert(t.includes('internete bağlanınca'),t);await page.evaluate(()=>{st.subject='mutfak-araclari';st.op='match';st.contentSet=2;startBoard('check',12);st.board.items.forEach(it=>tryPair(it.id,it.answer));checkBoard();});assert(await page.evaluate(()=>rkQueue().length>=2));
  await ctx.setOffline(false);await page.evaluate(()=>window.dispatchEvent(new Event('online')));await settle();assert.equal(await page.evaluate(a=>Object.values(REKOR_FAKE.rows[a]||{}).length,T+'ma-e2~genel'),1);ok('Çevrimdışı sonuç bağlantı gelince gönderildi');

  // Birleşik çoktan seçmeli deneme: sabit 10 soru, karışık sıra ve seçenek; harfler A-D.
  const mc=await page.evaluate(()=>{st.subject='mutfak-araclari';st.op='mcq';st.mcqGroup='Tabaklar, kâseler, bardaklar ve fincanlar';st.practice='check';startContent();const n=st.contentItems.length,ids=st.contentItems.map(q=>q.choices.map(c=>c.id).join(''));let guard=0;while(!st.kDone&&guard++<30){answer(st.q.correct);nextQ();}return {n,ids:[...new Set(ids)],ok:st.sess.ok};});
  assert.equal(mc.n,10);assert.deepEqual(mc.ids,['ABCD']);assert.equal(mc.ok,10);await settle();assert.equal(await page.evaluate(a=>Object.values(REKOR_FAKE.rows[a]||{})[0].correct,T+'ma-s01~genel'),10);ok('Birleşik soru denemesi (10 soru) sonlu, karışık ve ma-s01 tablosuna yazıldı');
  const learnOrder=await page.evaluate(()=>{st.practice='learn';startContent();return st.contentItems.map(q=>q.id).join(',');});const src=await page.evaluate(()=>getData().questions.filter(q=>['Tabaklar ve kâseler','Bardaklar ve fincanlar'].includes(q.group)).map(q=>q.id).join(','));assert.equal(learnOrder,src);ok('Öğreniyorum: kaynak sırası korunuyor');
  const bl=await page.evaluate(()=>{st.subject='bulasik-makinesi-temizligi';st.op='mcq';return mcqGroups().map(g=>g.label+':'+g.count);});assert.deepEqual(bl,['1. Bölüm:4','2. Bölüm:5','3. Bölüm:5','4. Bölüm:6','5. Bölüm · Atık yönetimi:5','Genel tekrar · Set 1:10','Genel tekrar · Set 2:10','Genel tekrar · Set 3:10','Genel tekrar · Set 4:10','Bulaşık Yıkama ve Atık Yönetimi · Bütün bölümler:65']);
  const blOne=await page.evaluate(()=>{st.mcqGroup='2. Bölüm';st.practice='check';startContent();let g=0;while(!st.kDone&&g++<10){answer(st.q.correct);nextQ();}return st.sess.ok;});assert.equal(blOne,5);await settle();assert.equal(await page.evaluate(a=>!!REKOR_FAKE.rows[a],T+'bl-s1~genel'),false);
  // Bütün bölümler, diğer bölümler bitmeden kilitlidir (kayıtlı profilde).
  await page.evaluate(()=>{go('content');});assert.equal(await page.locator('.mq-kutu.mq-kilit',{hasText:'Bütün bölümler'}).count(),1);assert.equal(await page.locator('.mq-kutu:not([disabled])',{hasText:'Bütün bölümler'}).count(),0);
  const blAll=await page.evaluate(()=>{st.mcqGroup='Bulaşık Yıkama ve Atık Yönetimi · Bütün bölümler';st.practice='check';startContent();const n=st.contentItems.length;let g=0;while(!st.kDone&&g++<80){answer(st.q.correct);nextQ();}return n;});assert.equal(blAll,65);await settle();assert.equal(await page.evaluate(a=>Object.values(REKOR_FAKE.rows[a]||{})[0].correct,T+'bl-s1~genel'),65);
  ok('Bulaşık: 9 bölüm yerinde, bölüm denemesi sıralamaya yazmıyor, Bütün bölümler (65) kilitli ve tabloya yazıyor');

  // Kuver: Basit ve Tabldot ayrı tablolar.
  const kv=await page.evaluate(()=>{st.subject='kuver';st.op='kur';st.lvl=1;st.practice='check';startSession();let g=0;while(!st.kDone&&g++<20){answer(st.q.key);nextQ();}return st.sess.ok;});assert.equal(kv,4);await settle();assert.equal(await page.evaluate(a=>Object.values(REKOR_FAKE.rows[a]||{})[0].correct,T+'kv-basit~genel'),4);assert.equal(await page.evaluate(a=>!!REKOR_FAKE.rows[a],T+'kv-tabldot~genel'),false);ok('Basit Kuver kendi tablosuna yazıldı, Tabldot ayrı');
  // Kuver Pekiştiriyorum: yanlış parçalar önce gelir.
  await page.evaluate(()=>{st.lvl=3;st.practice='check';startSession();let g=0;while(!st.kDone&&g++<30){if(['tatli_kasigi','su_bardagi'].includes(st.q.key)){answer('yemek_catali'===st.q.key?'pecete':'yemek_catali');showSol();}else answer(st.q.key);nextQ();}});await settle();
  const order=await page.evaluate(()=>{rkPekStart('k',3);return st.order.slice(0,2).sort().join(',');});assert.equal(order,'su_bardagi,tatli_kasigi');ok('Kuver Pekiştiriyorum: yanlış yerleştirilen parçalar önce');

  // Profil silme: durum 'deleted', satırlar kaldırılır.
  const ayse=await page.evaluate(()=>rkPid('Ayşe'));await page.evaluate(()=>{rkForgetProfile('Ayşe');});await page.waitForFunction(p=>!rkProfAll()[p],ayse);assert.equal(await page.evaluate(p=>REKOR_FAKE.prof[p].status,ayse),'deleted');assert.equal(await page.evaluate(([p])=>Object.values(REKOR_FAKE.rows).some(t=>t[p]),[ayse]),false);ok('Profil silinince sunucu durumu deleted, bütün satırlar silindi');

  // Gönderim sürerken bir profil listeden çıkarsa başka profilin sonucu kuyruktan düşmez.
  await page.evaluate(()=>{lsSet('profiles',profiles().concat(['Can','Ece']));});
  const ids=await page.evaluate(()=>{const c=rkPid('Can',true),e=rkPid('Ece',true);rkProfSet(c,{status:'in',gen:0});rkProfSet(e,{status:'in',gen:0});return [c,e];});
  await page.evaluate(([c,e])=>{const sub=REKOR_FAKE.submit;REKOR_FAKE.submit=async(...a)=>{await new Promise(r=>setTimeout(r,120));return sub(...a);};
   lsSet('rk_queue',[{qid:'q1',pid:c,board:'bh-e3',period:'genel',name:'Can',correct:7,gen:0,at:Date.now(),sess:1},{qid:'q2',pid:e,board:'bh-e3',period:'genel',name:'Ece',correct:9,gen:0,at:Date.now(),sess:1}]);
   rkFlush(null);setTimeout(()=>lsSet('rk_queue',rkQueue().filter(x=>x.pid!==c)),40);},ids);
  await page.waitForFunction(()=>!RK.busy&&!rkQueue().length);await page.evaluate(()=>{const s=REKOR_FAKE.submit;});
  assert.equal(await page.evaluate(([a,e])=>!!(REKOR_FAKE.rows[a]||{})[e],[T+'bh-e3~genel',ids[1]]),true);ok('Gönderim sürerken başka profilin kuyruktaki sonucu korunuyor');
  // Gönderim sürerken profil silinirse bulut silmesi gönderim bitince yapılır.
  await page.evaluate(([c])=>{lsSet('rk_queue',[{qid:'q3',pid:c,board:'bh-e4',period:'genel',name:'Can',correct:5,gen:0,at:Date.now(),sess:1}]);rkFlush(null);setTimeout(()=>rkForgetProfile('Can'),30);},ids);
  await page.waitForFunction(c=>!rkProfAll()[c],ids[0],{timeout:5000});assert.equal(await page.evaluate(c=>REKOR_FAKE.prof[c].status,ids[0]),'deleted');assert.equal(await page.evaluate(c=>Object.values(REKOR_FAKE.rows).some(t=>t[c]),ids[0]),false);ok('Gönderim sürerken silinen profilin bulut kaydı gönderim bitince temizleniyor');
  // Puansız oturum düzeneği (st.sess.unranked): puan üretmez, puan göstermez, rekor ve bulut yazmaz.
  await page.evaluate(()=>{pickProfile('Ali');const best=JSON.stringify(rkBestAll()[rkPid('Ali')]);st.subject='baharat';st.op='match';st.contentSet=1;startBoard('check',12);st.sess.unranked=true;st.board.items.forEach(it=>tryPair(it.id,it.answer));checkBoard();window.__best=best;});
  const yk=await page.evaluate(()=>({s:st.sess.s,chip:[...document.querySelectorAll('.stats .chip')].some(c=>/Puan/.test(c.textContent)),best:JSON.stringify(rkBestAll()[rkPid('Ali')])===window.__best,cat:catName(st.sess)}));
  assert.equal(yk.s,0);assert.equal(yk.chip,false);assert.equal(yk.best,true);assert(yk.cat.includes('Puansız deneme'),yk.cat);ok('Puansız oturum: puan 0, puan gösterilmiyor, kişisel rekor değişmiyor');
  // Oda yarışı oturumu, yarış kapandıktan sonra ekran yeniden çizilse de rekor/pekiştirme yazmaz.
  const race=await page.evaluate(()=>{pickProfile('Ali');const before=JSON.stringify([rkBestAll(),rkPekAll(),rkQueue()]);st.subject='mutfak-araclari';st.op='match';st.contentSet=7;startBoard('check',12);st.sess.race={room:'TEST'};st.board.items.forEach((it,i)=>tryPair(it.id,st.board.items[(i+1)%12].answer));checkBoard();YR.active=false;render();return before===JSON.stringify([rkBestAll(),rkPekAll(),rkQueue()]);});
  assert.equal(race,true);ok('Oda yarışı oturumu rekor, kuyruk ve Pekiştiriyorum yazmıyor');
  // Aynı metinli iki soru Pekiştiriyorum'da karışmaz.
  const dup=await page.evaluate(()=>{st.subject='mutfak-araclari';st.op='mcq';const qs=getData().questions.filter(q=>['m-kd-103-1','m-bd-3-6'].includes(q.id));const pid=rkPid('Ali');const m={};qs.forEach(q=>m['q|mutfak-araclari|'+q.id]={kind:'q',subject:'mutfak-araclari',id:q.id,streak:1,wrong:[],at:1});rkPekSave(pid,m);
   st.mcqGroup=null;rkPekStart('q');const first=st.contentItems.find(q=>['m-kd-103-1','m-bd-3-6'].includes(q.id));let g=0;while(!st.kDone&&g++<20){const q=st.q;answer(q.id===first.id?q.choices.find(c=>c.id!==q.correct).id:q.correct);nextQ();}
   const left=rkPek(pid);return {n:qs.length,firstLeft:!!left['q|mutfak-araclari|'+first.id],otherLeft:qs.filter(q=>q.id!==first.id).some(q=>!!left['q|mutfak-araclari|'+q.id]),asked:st.contentItems.filter(q=>q.equivalenceKey==='cig-et-raf').length};});
  assert.equal(dup.n,2);assert.equal(dup.firstLeft,true);assert.equal(dup.otherLeft,true);assert.equal(dup.asked,1);ok('Eşdeğer iki sorudan biri soruluyor; sorulmayan madde doğru sayılmıyor');
  // Bu telefondan ulaşılamayan profil (başka oturuma ait) kuyruğu kilitlemez; diğer profilin sonucu gönderilir.
  const lost=await page.evaluate(async()=>{const be=REKOR_FAKE,ens=be.ensureProfile;const x='xxxxxxxxxxxxxxxxxxxx',y=rkPid('Ayşe2',true);rkProfSet(x,{status:'in',gen:0});rkProfSet(y,{status:'in',gen:0});be.ensureProfile=async p=>{if(p===x){const e=Error('permission-denied');e.code='permission-denied';throw e;}return ens(p);};
   lsSet('rk_queue',[{qid:'l1',pid:x,board:'bh-e5',period:'genel',name:'Eski',correct:3,gen:0,at:1,sess:1},{qid:'l2',pid:y,board:'bh-e5',period:'genel',name:'Ayşe2',correct:6,gen:0,at:1,sess:1}]);await rkFlush(null);be.ensureProfile=ens;return {q:rkQueue().length,st:rkProf(x).status,row:!!(REKOR_FAKE.rows[RK_TERM+'~bh-e5~genel']||{})[y]};});
  assert.deepEqual(lost,{q:0,st:'lost',row:true});ok('Ulaşılamayan profil kuyruğu kilitlemiyor; diğer profilin sonucu gönderildi');
  // Uyguluyorum adı; eski ad kalmadı.
  await page.evaluate(()=>{st.subject='baharat';st.op='match';st.contentSet=1;go('boardmode');});assert(await page.getByRole('button',{name:/Uyguluyorum/}).isVisible());assert.equal(await page.getByText('Kendimi Deniyorum').count(),0);
  // Oyun sonunda "Birlikte tekrar edelim": yalnız yanlış varsa, en fazla 4 yanlış (doğru yapılan madde girmez), puansız, sıralamayı etkilemez.
  await play('Tekrar Bir',0);assert.equal(await page.getByRole('button',{name:/Birlikte tekrar edelim/}).count(),0);ok('Hiç yanlış yoksa tekrar düğmesi çıkmıyor');
  await play('Tekrar Iki',6);await settle();
  const tb=page.getByRole('button',{name:/Yanlışlarımı çalış \(\d+\)/});assert(await tb.isVisible());assert.equal(await page.locator('.rk-tekrar').count(),0);ok('v3.8: oyun sonunda eski "Birlikte tekrar edelim" düğmesi yerine "Yanlışlarımı çalış" düğmesi çıkıyor');
  await settle();await page.waitForTimeout(300);await settle();
  const bestBefore=await page.evaluate(()=>JSON.stringify([rkBestAll()[rkPid('Tekrar Iki')],REKOR_FAKE.rows]));
  await page.evaluate(()=>rkTekrarBasla());
  const tr=await page.evaluate(()=>({kind:st.pekRound.kind,n:st.board.items.length,prac:st.sess.practice,left:rkPekItems('baharat').length}));
  assert.deepEqual(tr,{kind:'m',n:4,prac:'pek',left:6});ok('Tekrar turu yalnız 4 yanlış maddeyle açılıyor, doğru yapılan madde girmiyor, kalan 2 yanlış listede');
  await page.evaluate(()=>{st.board.items.forEach(it=>tryPair(it.id,it.answer));render();});await settle();
  assert.equal(await page.evaluate(()=>JSON.stringify([rkBestAll()[rkPid('Tekrar Iki')],REKOR_FAKE.rows])),bestBefore);assert.equal(await page.evaluate(()=>rkPekItems('baharat').length),6);ok('Tekrar turu rekoru ve sıralamayı değiştirmiyor; aynı günkü doğrular maddeyi çıkarmıyor');
  // Tekrar turu puan vermez; başka profile geçince eski düğme çıkmaz; kuverde düğme yoktur; eski kuyruktaki tam ad kısaltılır.
  const pz=await page.evaluate(()=>({s:st.sess.s,head:st.lastRes&&st.lastRes.head}));assert.equal(pz.s,0);
  const ph=await page.evaluate(()=>{pickProfile('Başka Kişi');return rkTekrarHTML();});assert.equal(ph,'');ok('Tekrar turu puan yazmıyor; başka profilde eski tekrar düğmesi çıkmıyor');
  const kvt=await page.evaluate(()=>{pickProfile('Ali');st.subject='kuver';st.op='kur';st.lvl=3;startSession();st.sess.qs.push({prompt:'su_bardagi',r:0});st.sess.practice='check';rkPekFromAssessment(rkPid('Ali',true));return RK.tk;});assert.equal(kvt,null);ok('Kuverde "Birlikte tekrar edelim" düğmesi çıkmıyor');
  const qn=await page.evaluate(()=>{const pid=rkPid('Ali',true);lsSet('rk_queue',[]);const p=rkProf(pid);return rkName('🦊  Kurnaz Tilki #482');});assert.equal(qn,'🦊 Kurnaz Tilki #482');ok('Gönderimde oyun adı (karakter) olduğu gibi gider, boşluklar düzenlenir');
  // Sıralamada yalnız ilk ad; ilk sonuçtan önce açıklama; ana sayfada sıralama düğmesi.
  const fn=await page.evaluate(()=>[rkName('🐼 Cesur Panda'),rkName('  🦁   Kral Aslan '),rkName(''),rkName('A'.repeat(50))]);
  assert.deepEqual(fn,['🐼 Cesur Panda','🦁 Kral Aslan','','A'.repeat(40)]);ok('Sıralamaya oyun adı gider, 40 karakterle sınırlı');
  const first=await page.evaluate(()=>{lsSet('rk_prof',{});lsSet('profiles',['Yeni Kişi']);pickProfile('Yeni Kişi');st.subject='baharat';st.op='match';st.contentSet=1;go('boardmode');return document.getElementById('app').textContent;});
  assert(first.includes('Sıralamada yalnız adın görünür'));ok('İlk sonuçtan önce sıralama açıklaması görünüyor');
  await page.evaluate(()=>{go('home');});assert(await page.getByRole('button',{name:'Sıralama'}).isVisible());await page.getByRole('button',{name:'Sıralama'}).click();await page.waitForFunction(()=>['siralama','rekor'].includes(st.screen));assert((await page.textContent('#app')).includes('Sıralama'));ok('Ana sayfadaki Sıralama düğmesi sıralama ekranını açıyor');
  if(shots){await page.setViewportSize({width:1200,height:844});await page.evaluate(()=>rkOpenBoard('bh-e1'));await page.waitForSelector('.rk-row');await page.screenshot({path:shots+'/5-siralama-1200.png'});}
  assert.deepEqual(errors,[]);ok('Tarayıcıda yakalanmamış JavaScript hatası yok');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
