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
/* İlk ad seçiminde ekran başlığı ve açıklama */
const IP_EDIT=typeof adEditHTML==='function'?adEditHTML:null;
if(IP_EDIT)adEditHTML=function(){
 let h=IP_EDIT();
 if(st.pe&&st.pe.i<0&&profiles().length===0){
  h=h.replace('➕ Yeni Profil','👋 Hoş geldin!').replace('<div class="wrap">','<div class="wrap"><p class="card ip-hosgeldin"><b>Önce oyun adını seç.</b> Oyunda ve sıralamada bu adla görüneceksin. İstersen adını sonra bir kez değiştirebilirsin.</p>');
 }
 return h;
};
setTimeout(ipAc,0);
/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
