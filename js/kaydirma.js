/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Eşleştirmede her seçimden sonra ekran yeniden çizilir ve sayfa en üste kayıyordu (özellikle iPhone Safari).
   Aynı ekranda kalındığı sürece: yeniden çizim sırasında sayfa yüksekliği korunur ve kaydırma konumu geri verilir.
   Yeni bir ekrana geçilirken (go) sayfa yine en üste gider. */
(function(){
 'use strict';
 let onceki=null,zaman=null;
 function korunur(){return st.screen==='board'||(st.screen==='yolplay'&&typeof Y!=='undefined'&&Y&&Y.phase==='esles');}
 const sar=render;
 render=function(){
  const app=document.getElementById('app'),y=window.scrollY||document.documentElement.scrollTop||0,ayni=!!app&&onceki===st.screen&&korunur()&&y>0;
  if(ayni){clearTimeout(zaman);app.style.minHeight=app.offsetHeight+'px';}
  sar();
  onceki=st.screen;
  if(ayni){
   const geri=()=>{if((window.scrollY||0)<y-4)window.scrollTo(0,y);};
   geri();requestAnimationFrame(geri);setTimeout(geri,80);setTimeout(geri,250);
   zaman=setTimeout(()=>{app.style.minHeight='';},400);
  }else if(app&&app.style.minHeight){app.style.minHeight='';}
 };
})();
