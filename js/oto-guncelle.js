/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Yeni sürüm gelince: ana sayfadaysa sayfa kendiliğinden yenilenir; başka ekrandaysa "Yeni sürüm hazır" bildirimi çıkar
   (oyun ya da sınav sırasında sayfa kendiliğinden yenilenmez). */
(function(){
 if(!('serviceWorker' in navigator))return;
 let eskiVardi=!!navigator.serviceWorker.controller,hazir=false,yenileniyor=false;
 function yenile(){if(yenileniyor)return;yenileniyor=true;location.reload();}
 function bildirim(){
  if(document.getElementById('yeniSurum'))return;
  const d=document.createElement('div');d.id='yeniSurum';d.className='yeni-surum';d.setAttribute('role','status');
  d.innerHTML='<span>Yeni sürüm hazır</span><button type="button" id="yeniSurumBtn">Yenile</button>';
  document.body.appendChild(d);document.getElementById('yeniSurumBtn').onclick=yenile;
 }
 function kontrol(){
  if(!hazir)return;
  if(typeof st!=='undefined'&&st.screen==='home'&&!st.modalOpen)yenile();else bildirim();
 }
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!eskiVardi){eskiVardi=true;return;}hazir=true;kontrol();});
 const onceki=render;render=function(){onceki();if(hazir){const b=document.getElementById('yeniSurum');if(st.screen==='home'&&!st.modalOpen)yenile();else if(!b)bildirim();}};
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&navigator.onLine)navigator.serviceWorker.getRegistration().then(r=>r&&r.update()).catch(()=>{});});
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
