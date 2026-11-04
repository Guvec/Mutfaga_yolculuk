/* Sonuç kartı (puan, doğru/yanlış, seri, rekor, süre), resim olarak kaydetme ve yeni sesler. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const srv=http.createServer((q,r)=>{let u=decodeURIComponent(new URL(q.url,'http://x').pathname);if(u==='/')u='/index.html';const f=path.join(root,u);fs.readFile(f,(e,b)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');r.end(b);});});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const br=await chromium.launch({args:['--no-sandbox']}),ctx=await br.newContext({viewport:{width:390,height:800},serviceWorkers:'block'}),p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{try{sessionStorage.setItem('mesleki-ses-secim','1');localStorage.setItem('profiles',JSON.stringify(['🍳 Test']));}catch(e){}});
 await p.goto('http://127.0.0.1:'+srv.address().port+'/');await p.waitForFunction(()=>typeof sonucUret==='function'&&CONTENT['mutfak-araclari']);
 const r=await p.evaluate(async()=>{
  const o={};
  o.ist=sonucIst([{ok:1,ms:1000},{ok:1,ms:2000},{ok:1,ms:3000},{ok:0,ms:2000},{ok:1,ms:2000}]);
  o.sesler=['dogru','yanlis','vurus','can','seri','rekor','win','kayip','tur','bera'].map(a=>EFEKT.cal(a));
  const calls=[];const oc=EFEKT.cal;EFEKT.cal=a=>{calls.push(a);return true;};
  st.prof='🍳 Test';st.guest=false;
  YR.cfg={...YR.cfg,mode:'canavar',subject:'mutfak-araclari',kind:'gorsel',set:1,n:5};await cvStart(YR.cfg);
  const idx=q=>q.choices.findIndex(c=>c.id===q.correct);
  while(!CV.over){cvAns(idx(CV.qs[CV.k]));cvNext();}
  o.r1={durum:CV.rapor.durum,puan:CV.rapor.puan,dogru:CV.rapor.dogru,yanlis:CV.rapor.yanlis,seri:CV.rapor.seri,top:CV.rapor.toplam,oyun:CV.rapor.oyun};
  o.sesA=calls.slice();
  const all=ls('rk_oyun',{});const k=Object.keys(all['🍳 Test'])[0];all['🍳 Test'][k]=10;lsSet('rk_oyun',all);
  calls.length=0;cvNew();
  // ilk soru yanlış, sonra doğrular
  cvAns(CV.qs[0].choices.findIndex(c=>c.id!==CV.qs[0].correct));cvNext();
  while(!CV.over){cvAns(idx(CV.qs[CV.k]));cvNext();}
  o.r2={durum:CV.rapor.durum,puan:CV.rapor.puan,yanlis:CV.rapor.yanlis,rekor:CV.rapor.rekor};o.sesB=calls.slice();
  o.html=document.getElementById('app').innerText;
  o.resim=sonucResim(CV.rapor).slice(0,22);
  sonucKaydet();o.modal=!!document.querySelector('#snIndir')&&document.querySelector('.sn-resim').src.startsWith('data:image/png');
  EFEKT.cal=oc;return o;});
 assert.deepEqual(r.ist,{dogru:4,yanlis:1,seri:3,toplam:5,ort:2,puan:40});
 assert(r.sesler.every(x=>x===true),'tüm sesler üretilir: '+r.sesler);
 assert.deepEqual(r.r1,{durum:'ilk',puan:30,dogru:3,yanlis:0,seri:3,top:3,oyun:'Meydan Okuma'});
 assert.deepEqual(r.sesA,['vurus','vurus','seri','rekor'.replace('rekor','win')],'vuruş, vuruş, 3. seri, bitişte kazanma sesi: '+r.sesA);
 assert.equal(r.r2.durum,'yeni');assert.equal(r.r2.puan,30);assert.equal(r.r2.yanlis,1);assert.equal(r.r2.rekor,30);
 assert.equal(r.sesB[0],'can');assert.equal(r.sesB[r.sesB.length-1],'rekor','yeni rekor sesi');
 for(const t of ['PUAN','Doğru','Yanlış / süre doldu','En iyi seri','Rekor','Toplam soru','Ortalama süre / soru','YENİ REKOR!','Kartı resim olarak kaydet','Meydan Okuma'])assert(r.html.includes(t),'kartta '+t);
 assert(r.resim.startsWith('data:image/png'));assert(r.modal);
 console.log('PASS sonuç kartı, rekor şeridi, seriler, sesler, resim olarak kaydetme');
 await p.evaluate(()=>closeModal());await p.screenshot({path:process.env.SHOT||'/tmp/sonuc.png',fullPage:true});
 assert.deepEqual(errs,[],'JS hatası yok: '+errs.join('|'));await br.close();srv.close();console.log('sonuc-tests geçti');
})().catch(e=>{console.error(e);process.exit(1);});
