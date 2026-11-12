const assert=require('node:assert/strict'),open=require('./helpers/dom-app.cjs');
(async()=>{
 const x=await open(),w=x.w;let n=0;
 w.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
 w.HTMLMediaElement.prototype.pause=function(){};
 const ok=s=>{n++;console.log('PASS '+s);};
 try{
  assert.equal(w.st.screen,'home');assert(w.document.querySelector('.ae-home'));ok('İlk açılış yeni ana sayfadır');
  if(w.st.modalOpen)w.closeModal();
  w.anaDost();assert(!w.document.getElementById('gWardrobe').hidden);w.document.getElementById('gStart').click();
  assert.equal(w.st.screen,'home');assert.equal(w.st.prof,null);assert(w.document.querySelector('.ae-home'));ok('Profilsiz dost dönüşü profil seçtirmez');
  w.anaKitap();assert.equal(w.document.querySelectorAll('.ae-list > .ae-list-item').length,5);w.back();assert.equal(w.st.screen,'home');ok('Kitap konuları ve geri dönüş');
  w.anaAtolye();assert.equal(w.document.querySelectorAll('.ae-list-item').length,2);w.back();assert.equal(w.st.screen,'home');ok('Atölye yolları ve geri dönüş');
  w.anaTarif('sicak');assert.equal(w.document.querySelectorAll('.ae-list-item').length,3);w.anaTarifKart('mercimek');assert.match(w.document.body.textContent,/Kırmızı mercimek/);w.anaSayfa();ok('Sıcak mutfak ve örnek malzemeler');
  w.SES.acik=true;w.MUZIK.ac();assert.equal(w.SES.acik,true);w.MUZIK.kapat();w.anaSes();assert.equal(w.MUZIK.acikMi(),false);ok('Müzik ve okuma birbirinin tercihini değiştirmez');
  w.sesSoruSec('okuma');
  assert.equal(w.SES.acik,true);assert.equal(w.MUZIK.acikMi(),false);
  assert(w.document.querySelector('.ae-devam'));assert.match(w.document.querySelector('.ae-rank-note').textContent,/100 puan kaldı/);
  assert.deepEqual([...w.document.querySelectorAll('.ae-bottom button span')].map(el=>el.textContent),['Birlikte Oyna','Sıralama','Rozetlerim']);
  assert(w.document.querySelector('.ae-rank-hat'));assert(!w.document.querySelector('.ae-points'));
  assert(w.document.querySelector('.ae-friends-open'));ok('Arkadaşlarım şeridi ve üç alt kısayol görünür');
  assert.match(w.document.querySelector('.ae-devam').getAttribute('aria-label'),/Çalışmaya başla.*Mutfak Araçları/);assert(!w.document.querySelector('.ae-home-topic'),'İlerleme yokken Kaldığın yer çıkmaz');
  w.st.prof='Huzurlu Civciv';w.lsSet('rk_ids',{'Huzurlu Civciv':'test-profil'});
  w.dostGorevYaz(w.dostPid(),{unlocked:{rabbit:true,koala:true},total:100,spent:100,seen:{}});
  for(const id of ['panda','rabbit','koala']){
   w.anaDost();assert.equal(w.document.querySelectorAll('[data-dost-item]:not(.dost-locked)').length,3);
   w.document.querySelector('[data-dost-item='+id+']').click();w.document.getElementById('gUse').click();w.document.getElementById('gStart').click();
   const images=[...w.document.querySelectorAll('.ae-paths img')].map(img=>img.getAttribute('src'));
   assert.deepEqual(images,['sicak','pasta','servis'].map(dal=>'assets/ascidostum/dal-'+id+'-'+dal+'.webp'));
   assert.equal(w.document.querySelector('.ae-dost-artwork').dataset.dost,id);
  }
  ok('Aşçı Dostum seçimi üç dal görselini birlikte değiştirir');
  w.st.prof='Huzurlu Civciv';w.lsSet('rk_ids',{'Huzurlu Civciv':'test-profil'});
  w.lsSet('kaptan_onbellek3',{ts:Date.now(),hafta:w.rkWeekNo(),kayit:{pid:'test-profil',ad:'Huzurlu Civciv',dogru:10}});
  w.render();
  assert(w.document.querySelector('.ae-kaptan-tac'));
  assert.equal(w.document.querySelectorAll('.ae-header .ae-avatar').length,1);
  w.st.prof='Neşeli Tavşan';w.render();
  assert(!w.document.querySelector('.ae-kaptan-tac'));ok('Tek profil portresi ve kaptan tacı');
  w.st.prof='Huzurlu Civciv';w.st.guest=false;w.lsSet('ana_son_konu_Huzurlu Civciv','mutfak-araclari');
  w.lsSet('yol_ma',{'Huzurlu Civciv':{done:{e1b1:true}}});w.render();
  const progress=w.document.querySelector('.ae-kald progress');
  assert.equal(progress.value,1);assert(progress.max>1);assert.equal(w.document.querySelector('.ae-devam b').textContent,'Devam et');
  assert.match(w.document.querySelector('.ae-home-topic').textContent,/Mutfak Araçları/);ok('Kayıtlı ilerleme ve doğru ders');
  w.anaKitap();w.go('gunlukgorevler');assert.match(w.document.body.textContent,/Kuver çalışması/);
  w.rutbeComplete({id:'test-kuver',table:'kv-basit',total:5,correct:5});w.render();
  assert.match(w.document.querySelector('.ae-list-item').textContent,/Tamamlandı/);
  w.anaSayfa();
  w.anaAyarlar();assert(w.document.querySelector('#ov .modal'));w.closeModal();ok('Ayarlar açılır ve kapanır');
  console.log(n+' kontrol geçti.');
 }finally{x.dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
