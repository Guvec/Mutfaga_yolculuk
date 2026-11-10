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
