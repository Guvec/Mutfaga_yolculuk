/* Haftalık yarışma: ileri akan çalışma süresi, eşit doğruda kısa süre sıralaması, kural öncesi geri dönüş. Sahte rekor arka ucu kullanır. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..'),types={'.svg':'image/svg+xml','.webp':'image/webp','.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const srv=http.createServer((q,r)=>{let u=decodeURIComponent(new URL(q.url,'http://x').pathname);if(u==='/')u='/index.html';const f=path.join(root,u);fs.readFile(f,(e,b)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');r.end(b);});});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const br=await chromium.launch({args:['--no-sandbox']}),ctx=await br.newContext({viewport:{width:390,height:800},serviceWorkers:'block'}),p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1')?r.continue():r.abort());
 await p.addInitScript(()=>{try{sessionStorage.setItem('mesleki-ses-secim','1');}catch(e){}window.REKOR_FAKE={sent:[],mode:'ok',async ensureProfile(){return {status:'in',gen:0};},async submit(t,pid,row){this.sent.push({t,row:{...row}});if(this.mode==='old'&&'dur' in row){throw Object.assign(Error('denied'),{code:'permission-denied'});}return {written:true,best:row.correct};},async list(){return [];}};});
 await p.goto('http://127.0.0.1:'+srv.address().port+'/');await p.waitForFunction(()=>typeof haftaStart==='function'&&typeof rkSorted==='function');
 let n=0;const ok=m=>{n++;console.log('PASS '+m);};

 // 1) Sıralama: doğru → kısa süre → süresiz altta → ad
 const s=await p.evaluate(()=>{const rows=[{pid:'a',name:'Ceren',correct:20,dur:300},{pid:'b',name:'Ali',correct:20,dur:200},{pid:'c',name:'Bora',correct:20},{pid:'d',name:'Deniz',correct:22,dur:900},{pid:'e',name:'Efe',correct:20,dur:200}];
  return {order:rkSorted(rows).map(r=>r.name),rankB:rkRank(rows,'b'),rankA:rkRank(rows,'a'),rankC:rkRank(rows,'c'),crown:rkCrownNames(rows),crown2:rkCrownNames([{pid:'x',name:'X',correct:5,dur:90},{pid:'y',name:'Y',correct:5,dur:60}]),plain:rkSorted([{pid:'1',name:'Zeynep',correct:3},{pid:'2',name:'Ada',correct:3}]).map(r=>r.name)};});
 assert.deepStrictEqual(s.order,['Deniz','Ali','Efe','Ceren','Bora']);ok('Doğru sayısı, sonra kısa süre, süresiz satır altta, sonra ad');
 assert.strictEqual(s.rankB.rank,2);assert.strictEqual(s.rankB.tie,2);assert.strictEqual(s.rankA.rank,4);assert.strictEqual(s.rankC.rank,5);ok('Sıra numaraları ve aynı süredeki eşitlik');
 assert.deepStrictEqual(s.crown,['Deniz']);assert.deepStrictEqual(s.crown2,['Y']);ok('Haftanın birincisi doğru sonra kısa süreye göre');
 assert.deepStrictEqual(s.plain,['Ada','Zeynep']);ok('Süresiz diğer tablolarda eski davranış (eşitte alfabetik)');

 // 2) Süre: yukarı sayar; mola, gizli sekme, pencere ve uyku sıçraması sayılmaz
 await p.evaluate(()=>{st.guest=false;st.prof='🍳 Test';});
 await p.evaluate(()=>haftaStart());await p.waitForFunction(()=>st.screen==='haftaplay');
 const ms=()=>p.evaluate(()=>HAFTA.ms);
 await p.waitForTimeout(1300);const t1=await ms();assert(t1>=900&&t1<=1700,'t1='+t1);ok('Süre ileri akar ('+t1+' ms)');
 assert.match(await p.textContent('#haftaSure'),/^\d\d:\d\d$/);assert.ok(/⏳/.test(await p.textContent('#app')));ok('Ekranda ⏳ ve mm:ss süre görünür');
 await p.evaluate(()=>{HAFTA.paused=true;});await p.waitForTimeout(1200);const t2=await ms();assert(t2-t1<400,'mola '+(t2-t1));await p.evaluate(()=>{HAFTA.paused=false;HAFTA_T=performance.now();});ok('Mola sayılmaz');
 await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));});const t3=await ms();await p.waitForTimeout(1200);const t4=await ms();assert(t4-t3<400,'gizli '+(t4-t3));
 await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});document.dispatchEvent(new Event('visibilitychange'));});ok('Gizli sekme sayılmaz');
 await p.evaluate(()=>{st.modalOpen=true;});const t5=await ms();await p.waitForTimeout(1200);const t6=await ms();assert(t6-t5<400,'modal '+(t6-t5));await p.evaluate(()=>{st.modalOpen=false;HAFTA_T=performance.now();});ok('Açık pencere (ses seçimi vb.) sayılmaz');
 const t7=await ms();await p.evaluate(()=>{HAFTA_T=performance.now()-60000;});await p.waitForTimeout(600);const t8=await ms();assert(t8-t7<900,'sıçrama '+(t8-t7));ok('Uyku/donma sıçraması süreye eklenmez');
 await p.evaluate(()=>{haftaSave();});const saved=await p.evaluate(()=>ls('haftalik',{})[HAFTA.pid].resume.ms);assert(saved>=1500);ok('Süre devam kaydında saklanır ('+saved+' ms)');

 // 3) Bitiş: sıralamalı deneme, süre kuyruğa ve satıra yazılır
 // (ilk deneme zaten devam ediyor)
 await p.evaluate(()=>{REKOR_FAKE.mode='ok';});
 await p.evaluate(async()=>{const idx=q=>q.choices.findIndex(c=>c.id===q.correct);HAFTA.ms=65000;while(!HAFTA.done){haftaAnswer(idx(HAFTA.qs[HAFTA.k]));haftaNext();}});
 await p.waitForFunction(()=>rkQueue().length===0,null,{timeout:5000});
 let sent=await p.evaluate(()=>REKOR_FAKE.sent);const row=sent[sent.length-1].row;
 assert.strictEqual(row.correct,100);assert.ok(Number.isInteger(row.dur)&&row.dur>=65&&row.dur<=70,'dur='+row.dur);assert.strictEqual(row.game,'haftalik');ok('Sıralamalı denemede satıra tamsayı süre (dur='+row.dur+' sn) yazılır');
 const over=await p.evaluate(()=>document.getElementById('app').innerText);assert.ok(/100 doğru/.test(over)&&/Çalışma süresi: 01:0\d/.test(over)&&/eşit doğru sayılarında/.test(over));ok('Sonuç ekranı doğru + çalışma süresi');
 const best=await p.evaluate(()=>{const m=ls('haftalik',{})[haftaPid()];return {b:m.best[rkWeekNo()],d:m.bestDur[rkWeekNo()]};});assert.strictEqual(best.b,100);assert.ok(best.d>=65);ok('Yerel en iyi: doğru ve süre birlikte tutulur');

 // 4) Kural henüz yayınlanmamışsa (dur reddedilir) süresiz eski biçime inilir, sonuç kaybolmaz
 await p.evaluate(async()=>{REKOR_FAKE.sent.length=0;REKOR_FAKE.mode='old';await haftaStart();const idx=q=>q.choices.findIndex(c=>c.id===q.correct);HAFTA.ms=70000;while(!HAFTA.done){haftaAnswer(idx(HAFTA.qs[HAFTA.k]));haftaNext();}});
 await p.waitForFunction(()=>rkQueue().length===0,null,{timeout:5000});
 sent=await p.evaluate(()=>REKOR_FAKE.sent);const last=sent[sent.length-1].row;assert.ok(!('dur' in last)&&last.correct===100);assert.ok(sent.some(x=>'dur' in x.row));ok('Eski kuralda dur reddedilince süresiz yazılır ('+sent.length+' deneme)');

 // 5) 86400 sn üstü süre kırpılmaz, kaydedilmez ve açıkça söylenir
 await p.evaluate(async()=>{REKOR_FAKE.sent.length=0;REKOR_FAKE.mode='ok';await haftaStart();const idx=q=>q.choices.findIndex(c=>c.id===q.correct);HAFTA.ms=90000*1000;while(!HAFTA.done){haftaAnswer(idx(HAFTA.qs[HAFTA.k]));haftaNext();}});
 await p.waitForFunction(()=>rkQueue().length===0,null,{timeout:5000});
 sent=await p.evaluate(()=>REKOR_FAKE.sent);assert.ok(sent.length&&!('dur' in sent[sent.length-1].row));assert.ok(/Süre kaydedilemedi/.test(await p.evaluate(()=>document.getElementById('app').innerText)));ok('86400 sn üstü süre kırpılmaz; kaydedilmez ve ekranda söylenir');

 // 6) Menü metni
 await p.evaluate(()=>{haftaOpen();});const menu=await p.evaluate(()=>document.getElementById('app').innerText);assert.ok(/sınır yoktur\..*doğru sayısı eşitse daha kısa sürede bitiren üstte sayılır\./.test(menu)&&!/hız bonusu/.test(menu));ok('Menü metni güncel');
 assert.deepStrictEqual(errs,[]);ok('Sayfa hatası yok');
 console.log('Toplam '+n+' kontrol geçti.');await br.close();srv.close();
})().catch(e=>{console.error('FAIL',e&&e.stack||e);process.exit(1);});
