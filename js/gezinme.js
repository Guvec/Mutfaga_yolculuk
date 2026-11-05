/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Telefonun geri tuşu, uygulamadaki "← Geri" düğmesi gibi çalışır.
   Chrome, kullanıcı dokunmadan eklenen geçmiş kayıtlarını geri tuşunda atlar; bu yüzden kayıtlar
   yalnız dokunuş anında eklenir ve küçük bir tampon tutulur (Matematik Canavarı'ndaki yöntem). */
'use strict';
var GEZINME={d:0,cikis:false,atla:false,max:10};
function gezinmeDoldur(){if(GEZINME.cikis)return;try{while(GEZINME.d<GEZINME.max){history.pushState({mo:1},'');GEZINME.d++;}}catch(e){}}
function gezinmeCikisSor(){
 modal('Uygulamadan çıkmak istiyor musun?',function(){closeModal();gezinmeCik();});
}
function gezinmeCik(){
 GEZINME.cikis=true;
 try{window.close();}catch(e){}
 if(GEZINME.d>0){GEZINME.atla=true;try{history.go(-GEZINME.d);}catch(e){}GEZINME.d=0;}
 setTimeout(function(){GEZINME.cikis=false;sesDurum('Çıkmak için telefonun geri tuşuna bir kez daha bas.');setTimeout(function(){sesDurum('');},4000);},500);
}
(function(){
 if(!window.history||!history.pushState)return;
 document.addEventListener('click',gezinmeDoldur,true);
 window.addEventListener('popstate',function(){
  if(GEZINME.atla){GEZINME.atla=false;return;}
  if(GEZINME.d>0)GEZINME.d--;
  var ov=document.getElementById('ov');
  if(ov&&ov.classList.contains('on')){
   if(st.inBreak)return; // Molayı geri tuşu bitirmez; öğrenci "Devam et" düğmesini kullanır.
   var hayir=document.getElementById('mNo')||document.getElementById('muzikHayir');
   if(hayir)hayir.click();else closeModal();
   return;
  }
  if(typeof PHONE!=='undefined'&&PHONE.open&&typeof phoneCloseNames==='function'){phoneCloseNames();return;}
  if(st.screen==='home'||st.screen==='welcome'||st.screen==='giris'){gezinmeCikisSor();return;}
  // Oyun ekranında telefonun geri tuşu, üstteki "← Geri" düğmesiyle aynı yolu izler.
  var oyunda=(st.screen==='quiz'||st.screen==='board')&&!(typeof YR!=='undefined'&&YR.active);
  if(oyunda){oyunGeri();return;}
  back();
 });
})();
