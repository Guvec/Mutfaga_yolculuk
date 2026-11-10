const assert=require('node:assert/strict'),open=require('./helpers/dom-app.cjs');
(async()=>{
 const x=await open(),w=x.w;let n=0;
 w.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
 w.HTMLMediaElement.prototype.pause=function(){};
 const ok=s=>{n++;console.log('PASS '+s);};
 try{
  assert.equal(w.st.screen,'home');assert(w.document.querySelector('.ae-home'));ok('İlk açılış yeni ana sayfadır');
  if(w.st.modalOpen)w.closeModal();
  w.anaDost();assert(w.document.getElementById('foods'));w.document.getElementById('gStart').click();
  assert.equal(w.st.screen,'home');assert.equal(w.st.prof,null);assert(w.document.querySelector('.ae-home'));ok('Profilsiz dost dönüşü profil seçtirmez');
  w.anaKitap();assert.equal(w.document.querySelectorAll('.ae-topic').length,4);w.back();assert.equal(w.st.screen,'home');ok('Kitap konuları ve geri dönüş');
  w.anaAtolye();assert.equal(w.document.querySelectorAll('.ae-recipe-paths .ae-topic').length,2);w.back();assert.equal(w.st.screen,'home');ok('Atölye yolları ve geri dönüş');
  w.anaYol('pasta');assert(w.document.body.textContent.includes('Tarif çalışmaları hazırlanıyor.'));w.anaYol('sicak');ok('Hazır olmayan tariflerin durumu görünür');
  w.SES.acik=true;w.MUZIK.ac();assert.equal(w.SES.acik,true);w.MUZIK.kapat();w.anaSes();assert.equal(w.MUZIK.acikMi(),false);ok('Müzik ve okuma birbirinin tercihini değiştirmez');
  w.sesSoruSec('okuma');assert(w.document.querySelector('.ae-preferences .ses-ac').textContent.includes('Açık'));assert(w.document.querySelector('.ae-preferences .muzik-ac').textContent.includes('Kapalı'));ok('İlk ses seçiminden sonra ana sayfa etiketleri güncellenir');
  w.anaAyarlar();assert(w.document.querySelector('#ov .modal'));w.closeModal();ok('Ayarlar açılır ve kapanır');
  console.log(n+' kontrol geçti.');
 }finally{x.dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
