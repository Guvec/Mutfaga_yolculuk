/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Yeni sürüm gelince hangi ekranda olursa olsun "Yeni sürüm hazır · Güncelle" bildirimi çıkar; Güncelle sayfayı hemen yeniler.
   Sayfa kendiliğinden yenilenmez (oyun ya da sınav sırasında kesinti olmasın). */
(function(){
 if(!('serviceWorker' in navigator))return;
 let eskiVardi=!!navigator.serviceWorker.controller,yenileniyor=false;
 function yenile(){if(yenileniyor)return;yenileniyor=true;location.reload();}
 function bildirim(){
  window.YENI_SURUM_HAZIR=true;if(window.surumKapiDene)window.surumKapiDene();
  if(document.getElementById('yeniSurum'))return;
  const d=document.createElement('div');d.id='yeniSurum';d.className='yeni-surum';d.setAttribute('role','alert');
  d.innerHTML='<span>🎁 Yeni güncelleme geldi! Oyuna yeni şeyler eklendi.</span><button type="button" id="yeniSurumBtn">Hemen aç</button>';try{if(typeof sesEfekt==='function')sesEfekt('rekor');}catch(e){}
  document.body.appendChild(d);document.getElementById('yeniSurumBtn').onclick=yenile;
 }
 /* Yeni sürüm hazırsa: oyun sürerken küçük bildirim; oyun bitince ya da başka ekrana geçince kapı çıkar ve güncellenmeden devam edilmez. */
 window.YENI_SURUM_HAZIR=false;
 var OYUN_DISI=['home','welcome','giris','yolum','subject','summary','raceover','siralama','board','friends','rekor','profiles','lezzet','guide','content','mode','mcqmode','boardmode','racemenu','history','rkpre','pedit'];
 var YOL_BITIS=['bitti','basarisiz','tbitti','sbitti'];
 function oyunDisiMi(){
  try{
   if(st.screen==='yolplay')return typeof Y!=='undefined'&&Y&&YOL_BITIS.indexOf(Y.phase)>=0;
   return OYUN_DISI.indexOf(st.screen)>=0;
  }catch(e){return false;}
 }
 function kapiAc(){
  if(document.getElementById('yeniSurumKilit'))return;
  try{if(typeof Y!=='undefined'&&Y&&Y.mode==='oyun'&&typeof yolKaydet==='function')yolKaydet();}catch(e){}
  var k=document.createElement('div');k.id='yeniSurumKilit';k.className='yeni-surum-kilit';k.setAttribute('role','alertdialog');k.setAttribute('aria-modal','true');k.setAttribute('aria-labelledby','ysBaslik');
  k.innerHTML='<div class="ys-kutu"><div class="ys-hediye" aria-hidden="true">🎁</div><h2 id="ysBaslik">Yeni güncelleme geldi!</h2><p>Oyuna yeni şeyler eklendi. Açmak için düğmeye bas. İlerlemen ve puanların kaybolmaz.</p><button type="button" class="btn pri" id="yeniSurumKilitBtn">🎉 Yenilikleri aç</button></div>';try{if(typeof sesEfekt==='function')sesEfekt('rekor');if(typeof sesSoyle==='function'&&typeof SES!=='undefined'&&SES.acik)setTimeout(function(){sesSoyle('Yeni güncelleme geldi! Oyuna yeni şeyler eklendi.');},1200);}catch(e){}
  document.body.appendChild(k);
  var b=document.getElementById('yeniSurumKilitBtn');b.onclick=yenile;b.focus();
 }
 window.surumKapiDene=function(){if(window.YENI_SURUM_HAZIR&&oyunDisiMi())kapiAc();};
 try{
  var R0=render;
  render=function(){var r=R0.apply(this,arguments);if(window.YENI_SURUM_HAZIR)setTimeout(window.surumKapiDene,0);return r;};
 }catch(e){}
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!eskiVardi){eskiVardi=true;return;}bildirim();});
 /* Yeni sürüm açık sayfaya da çabuk ulaşsın: sayfa öne gelince ve her 2 dakikada bir denetlenir. */
 function denetle(){if(document.visibilityState==='visible'&&navigator.onLine)navigator.serviceWorker.getRegistration().then(r=>r&&r.update()).catch(()=>{});}
 document.addEventListener('visibilitychange',denetle);
 setInterval(denetle,120000);
})();
