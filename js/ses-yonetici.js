/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Ses yöneticisi: sesleri bütün uygulamaya bağlar.
   - Her düğmeye dokunuşta "dokun"; ileri ekranda "ileri", geri dönüşte "geri".
   - Yarış, 1'e 1 Kapışma, Er Meydanı ve Canavar girişlerinde giriş sesi, 3-2-1 sayacı ve "başla".
   - Odaya yeni oyuncu gelince "ac".
   - Sesli okuma açıkken yalnız kısa sesler çalar (dokunma, doğru, tekrar dene, sayaç...); geçiş ve fanfar susar.
   - Ses istemeyen öğe: data-ses="yok". */
'use strict';
var SES_KISA={dokun:1,tut:1,ustunde:1,birak:1,yerlesti:1,tekrarDene:1,sayac:1,saat:1,kilitli:1,ac:1};
function sesCal(ad){
 try{
  if(typeof SES!=='undefined'&&SES.acik&&!SES_KISA[ad])return false;
  if(typeof SES_USTASI==='undefined')return false;
  return SES_USTASI.cal(ad);
 }catch(e){return false;}
}
(function(){
 if(typeof document==='undefined')return;
 /* Dokunma: düğme, bağlantı, seçim kutusu. */
 document.addEventListener('click',function(e){
  var el=e.target&&e.target.closest&&e.target.closest('button,a[href],[role="button"],summary,input[type="checkbox"],input[type="radio"],select');
  if(!el||el.disabled||el.getAttribute('aria-disabled')==='true'||el.closest('[data-ses="yok"]'))return;
  sesCal('dokun');
 },true);

 /* Sayaçlı ekranlar: giriş sesi, sonra 2 ve 1'de sayaç, oyun başlarken "başla". */
 var GIRIS={racecount:'gong',dintro:'kilicCek',aintro:null,cvplay:null},SAYAC={racecount:1,dintro:1,aintro:1};
 var OYUN={raceplay:1,dplay:1,aplay:1};
 var onceki=null,oncekiSayi=null,oyuncu=0,geriDonus=false,sessizGecis=false;
 function sonra(){
  var ekran=st.screen,sayi=typeof YR!=='undefined'?YR.count:null;
  if(ekran!==onceki){
   if(SAYAC[ekran]){if(GIRIS[ekran])sesCal(GIRIS[ekran]);}
   else if(OYUN[ekran]&&SAYAC[onceki])sesCal('basla');
   else if(!sessizGecis&&onceki!==null&&!OYUN[ekran]&&!OYUN[onceki])sesCal(geriDonus?'geri':'ileri');
  }else if(SAYAC[ekran]&&sayi!==oncekiSayi&&sayi>0)sesCal('sayac');
  if(ekran==='racelobby'&&typeof YR!=='undefined'&&YR.players){if(ekran===onceki&&YR.players.length>oyuncu)sesCal('ac');oyuncu=YR.players.length;}
  onceki=ekran;oncekiSayi=sayi;geriDonus=false;sessizGecis=false;
 }
 function sar(){
  if(typeof render!=='function')return;
  var asil=render;
  render=function(){var r=asil.apply(this,arguments);try{sonra();}catch(e){}return r;};
  if(typeof back==='function'){var geri=back;back=function(){geriDonus=true;return geri.apply(this,arguments);};}
  if(typeof anaSayfa==='function'){var ana=anaSayfa;anaSayfa=function(){geriDonus=true;return ana.apply(this,arguments);};}
  try{onceki=st.screen;}catch(e){}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sar);else sar();
})();
