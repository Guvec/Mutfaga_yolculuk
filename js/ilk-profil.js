/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* İlk açılış: kullanım koşulları onaylandıktan sonra, telefonda hiç profil yoksa doğrudan oyun adı seçme ekranı açılır.
   Ad seçilmeden ana ekrana geçilmez; ilk açılışta misafir olarak devam edilmez.
   Misafir girişi yalnız Profiller ekranında kalır (öğretmenin tanıtım yapması için). */
'use strict';
function ipGerekli(){
 try{
  if(st.guest||st.prof)return false;
  if(typeof profiles!=='function'||profiles().length>0)return false;
  if(typeof ysKapiGerekli==='function'&&ysKapiGerekli())return false;
  if(typeof YS!=='undefined'&&YS.acik)return false;
  return typeof adOpen==='function';
 }catch(e){return false;}
}
function ipAc(){if(ipGerekli()&&st.screen!=='pedit')adOpen(-1,'home');}
/* Ana ekrana ya da başka bir ekrana geçilmek istenirse ad seçimi yeniden açılır. Profiller ekranı serbesttir. */
const IP_GO=go;
go=function(s){if(s!=='pedit'&&s!=='profiles'&&ipGerekli()){ipAc();return;}IP_GO(s);};
if(typeof ysBasla==='function'){const IP_YS=ysBasla;ysBasla=function(){IP_YS.apply(this,arguments);setTimeout(ipAc,0);};}
/* Ana sayfayı çizen katman da dahil, kayıtlı profili kullanmadan önce ad havuzunu denetle. */
const IP_RENDER=render;
render=function(){
 const yenile=adYenilemeEkraniGerekli();
 if(yenile){
  adEditor(profiles().indexOf(st.prof),st.screen);
  st.screen='pedit';
 }
 const sonuc=IP_RENDER.apply(this,arguments);
 if(yenile){window.scrollTo(0,0);document.getElementById('pe-baslik')?.focus();}
 return sonuc;
};
setTimeout(()=>{if(adYenilemeEkraniGerekli())render();else ipAc();},0);
