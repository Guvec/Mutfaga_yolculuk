/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Koşul onayı kapısı: sunucu bağlantı sınıflarından hemen sonra yüklenir.
   Koşullar onaylanmadan Uygulama sunucuya bağlanmaz (sıralama, arkadaşlar, oyun odaları). Ekran: js/yasal.js. */
'use strict';
var YS_SURUM=2;
function ysKabul(){try{const v=JSON.parse(localStorage.getItem('kv_yasal_kabul')||'null');return v&&v.s>=YS_SURUM?v:null;}catch(e){return null;}}
/* Otomatik testlerde (navigator.webdriver) kapı kendiliğinden açılmaz; ?yasaltest ile açılır. */
function ysKapiGerekli(){
 if(ysKabul())return false;
 try{if(navigator.webdriver&&!/[?&]yasaltest/.test(location.search))return false;}catch(e){}
 return true;
}
['RekorFirebase','YarisFirebase'].forEach(n=>{
 const C=window[n];if(!C||!C.prototype.connect||C.prototype.connect.ysSarili)return;
 const asil=C.prototype.connect;
 C.prototype.connect=function(){if(ysKapiGerekli())return Promise.reject(new Error('Kullanım koşulları henüz onaylanmadı.'));return asil.apply(this,arguments);};
 C.prototype.connect.ysSarili=true;
});
