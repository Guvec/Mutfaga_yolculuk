/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Yeni sürüm gelince hangi ekranda olursa olsun "Yeni sürüm hazır · Güncelle" bildirimi çıkar; Güncelle sayfayı hemen yeniler.
   Sayfa kendiliğinden yenilenmez (oyun ya da sınav sırasında kesinti olmasın). */
(function(){
 if(!('serviceWorker' in navigator))return;
 let eskiVardi=!!navigator.serviceWorker.controller,yenileniyor=false;
 function yenile(){if(yenileniyor)return;yenileniyor=true;location.reload();}
 function bildirim(){
  if(document.getElementById('yeniSurum'))return;
  const d=document.createElement('div');d.id='yeniSurum';d.className='yeni-surum';d.setAttribute('role','alert');
  d.innerHTML='<span>Yeni sürüm hazır</span><button type="button" id="yeniSurumBtn">Güncelle</button>';
  document.body.appendChild(d);document.getElementById('yeniSurumBtn').onclick=yenile;
 }
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!eskiVardi){eskiVardi=true;return;}bildirim();});
 /* Yeni sürüm açık sayfaya da çabuk ulaşsın: sayfa öne gelince ve her 2 dakikada bir denetlenir. */
 function denetle(){if(document.visibilityState==='visible'&&navigator.onLine)navigator.serviceWorker.getRegistration().then(r=>r&&r.update()).catch(()=>{});}
 document.addEventListener('visibilitychange',denetle);
 setInterval(denetle,120000);
})();

/* İlk giriş: ana sayfa ilk kez açıldığında (bu cihazda bir kez) müzik sorusu. Sesli okuma ayrıdır ve bu soruyla değişmez. */
(function(){
 const KEY='ana_muzik_soruldu';
 function sor(){
  if(st.screen!=='home'||st.modalOpen||ls(KEY,false))return;
  if(typeof MUZIK==='undefined')return;
  modalFocus=document.activeElement;st.modalOpen=true;pauseT();const ov=document.getElementById('ov');ov.className='on';
  ov.innerHTML='<div class="modal muzik-ilk" role="dialog" aria-modal="true" aria-label="Müzik açılsın mı?"><p class="muzik-ilk-nota" aria-hidden="true">♫</p><h2>Müzik açılsın mı?</h2><p>İstersen daha sonra değiştirebilirsin.</p><div class="row"><button class="btn pri" id="muzikEvet">Müziği aç</button><button class="btn" id="muzikHayir">Sessiz devam et</button></div><p class="sub">Sesli okuma ayrı çalışır.</p></div>';
  const bitir=ac=>{lsSet(KEY,true);if(ac)MUZIK.ac();else MUZIK.kapat();closeModal();render();};
  document.getElementById('muzikEvet').onclick=()=>bitir(true);document.getElementById('muzikHayir').onclick=()=>bitir(false);
  document.getElementById('muzikEvet').focus();
 }
 const onceki=render;render=function(){onceki();if(st.screen==='home'&&!st.modalOpen&&!ls(KEY,false))setTimeout(sor,400);};
})();
