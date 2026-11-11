/* Bilgi kutuları: bölüm bitişinde ve sonuç ekranında bir kutu çıkar, sırayla değişir, ekranı bozmaz. */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..')+'/';
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(root,u);if(!fs.existsSync(f)||!f.startsWith(root)){r.writeHead(404);return r.end();}const e=path.extname(f);const t={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'}[e]||'text/plain';r.writeHead(200,{'Content-Type':t});r.end(fs.readFileSync(f));});
const ok=m=>console.log('PASS '+m);
const bitir=p=>p.evaluate(()=>{let g=0;while(Y&&g++<90){const f=Y.phase;
 if(f==='ogren'){yolSonraki();continue;}
 if(['s1','s2','s3'].includes(f)){if(Y.sub==='onay'){yolOnayla();continue;}if(Y.sub==='inceleme'){yolIncSonraki();continue;}const q=Y.qs[Y.k];yolCevap(q.sec.findIndex(c=>c.id===q.dogru));yolSonraki();continue;}
 if(f==='esles'){const it=Y.m.ogeler.find(x=>!Y.m.eslesen.includes(x.id));if(!it)break;yolEsGorsel(it.id);yolEsAd(it.id);continue;}
 break;}});
srv.listen(0,async()=>{
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:390,height:844}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await require('./helpers/sound-choice.cjs')(p);await p.goto('http://127.0.0.1:'+srv.address().port);
 await p.waitForFunction(()=>typeof CONTENT!=='undefined'&&CONTENT.baharat);

 // Metinlerin bütünlüğü
 const kutular=await p.evaluate(()=>BILGI_KUTU.map(k=>({id:k.id,konu:k.konu,b:k.baslik.length,m:k.metin.length})));
 assert(kutular.length>=7,'En az yedi kutu olmalı');
 kutular.forEach(k=>{assert(k.b>5&&k.b<60,k.id+' başlık uzunluğu');assert(k.m>80&&k.m<420,k.id+' metin uzunluğu');});
 assert(kutular.some(k=>k.id==='kahve-kesif')&&kutular.some(k=>k.id==='kahve-avrupa'));ok('Yedi bilgi kutusu, kahve kutuları dâhil, ölçülü uzunlukta');
 const rivayet=await p.evaluate(()=>BILGI_KUTU.find(k=>k.id==='kahve-kesif').metin);
 assert(/[Rr]ivayet/.test(rivayet));ok('Kahvenin keşfi rivayet olarak veriliyor');

 await p.evaluate(()=>{lsSet('profiles',['🐼 Panda']);pickProfile('🐼 Panda');yolAc('baharat');const plan=yolPlan();yolBaslat(plan[0].id);});
 await bitir(p);await p.waitForTimeout(150);
 assert.equal(await p.locator('.bilgi-kutu').count(),1);
 const ilk=await p.locator('.bilgi-kutu h3').innerText();
 assert.equal(ilk,'Bir gram safran için yüzlerce çiçek');ok('Baharat bölümünden sonra baharat kutusu geliyor');
 await p.evaluate(()=>render());await p.waitForTimeout(100);
 assert.equal(await p.locator('.bilgi-kutu').count(),1);
 assert.equal(await p.locator('.bilgi-kutu h3').innerText(),ilk);ok('Ekran yeniden çizilince kutu çoğalmıyor ve değişmiyor');
 // Kutu, alttaki düğmelerden önce
 const sira=await p.evaluate(()=>{const k=document.querySelector('.bilgi-kutu'),d=document.querySelector('.yol-alt');return !!(k&&d)&&(k.compareDocumentPosition(d)&Node.DOCUMENT_POSITION_FOLLOWING)>0;});
 assert.equal(sira,true);ok('Kutu, Devam et düğmelerinin üstünde duruyor');

 await p.evaluate(()=>{go('yolum');const plan=yolPlan();yolBaslat(plan[1].id);});
 await bitir(p);await p.waitForTimeout(150);
 const ikinci=await p.locator('.bilgi-kutu h3').innerText();
 assert.notEqual(ikinci,ilk);ok('Sonraki bölümde sıradaki kutu geliyor');

 // Çoktan seçmeli sonuç ekranında da çıkar
 await p.evaluate(()=>{st.subject='bulasik-makinesi-temizligi';st.op='mcq';st.mcqGroup='1. Bölüm';st.practice='check';startContent();let g=0;while(!st.kDone&&g++<20){answer(st.q.correct);nextQ();}finish();});
 await p.waitForTimeout(200);
 assert.equal(await p.evaluate(()=>st.screen),'summary');
 assert.equal(await p.locator('.bilgi-kutu').count(),1);ok('Sonuç ekranında da bir kutu çıkıyor');

 assert.deepEqual(errs,[]);ok('Tarayıcıda yakalanmamış JavaScript hatası yok');
 await b.close();srv.close();console.log('Bilgi kutusu testleri tamam.');
});
