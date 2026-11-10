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
