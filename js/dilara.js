/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Dilara sesi: hazır klip varsa o çalınır, yoksa cihazın Türkçe sesi kesintisiz devam eder.
   Klipler audio/dilara/manifest.json içinde listelenir. Eksik metinler cihazda kaydedilir (eksik ses listesi). */
'use strict';
var DIL={mod:ls('sesMotor','dilara'),man:null,yuk:null,blob:{},eksik:[]};
try{DIL.eksik=JSON.parse(localStorage.getItem('dilaraEksik')||'[]');if(!Array.isArray(DIL.eksik))DIL.eksik=[];}catch(e){DIL.eksik=[];}
function dilManifest(){
 if(DIL.yuk)return DIL.yuk;
 DIL.yuk=fetch('audio/dilara/manifest.json').then(function(r){if(!r.ok)throw Error(r.status);return r.json();}).then(function(m){DIL.man=(m&&m.klip)||{};return DIL.man;}).catch(function(){DIL.man={};return DIL.man;});
 return DIL.yuk;
}
function dilEksikEkle(t){
 if(DIL.eksik.indexOf(t)>=0||DIL.eksik.length>=500)return;
 DIL.eksik.push(t);try{localStorage.setItem('dilaraEksik',JSON.stringify(DIL.eksik));}catch(e){}
 var b=document.getElementById('dilEksikSay');if(b)b.textContent=DIL.eksik.length;
}
function dilKlip(h){
 if(DIL.blob[h])return Promise.resolve(DIL.blob[h]);
 /* Range isteği yerine tam dosya alınır: hizmet işçisi önbelleğe yazar, çevrimdışı da çalışır. */
 return fetch('audio/dilara/'+h+'.mp3').then(function(r){if(!r.ok)throw Error(r.status);return r.blob();}).then(function(b){
  var k=Object.keys(DIL.blob);if(k.length>40)delete DIL.blob[k[0]];
  return DIL.blob[h]=URL.createObjectURL(b);});
}
function dilCal(h,req,metin,yedek){
 SES.klipBekle=true;
 dilKlip(h).then(function(url){
  SES.klipBekle=false;if(req.token!==SES.token)return;
  var a=new Audio(url);SES.klip=a;
  var rate=Number(SES.rate);a.playbackRate=Number.isFinite(rate)?Math.max(0.8,Math.min(1.1,rate)):1;
  a.onended=function(){if(SES.klip===a)SES.klip=null;};
  a.onerror=function(){if(SES.klip===a)SES.klip=null;if(req.token===SES.token)yedek();};
  var p=a.play();if(p&&p.catch)p.catch(function(e){if(SES.klip===a)SES.klip=null;if(req.token!==SES.token)return;
   if(e&&e.name==='NotAllowedError')sesYedek(req.text,'Ses başlatılamadı. Dinle düğmesine yeniden dokun.');else yedek();});
 }).catch(function(){SES.klipBekle=false;if(req.token===SES.token)yedek();});
}
var DIL_SUS=sesSus;
sesSus=function(){
 if(SES.klip){try{SES.klip.pause();}catch(e){}SES.klip=null;}
 SES.klipBekle=false;DIL_SUS();
};
var DIL_SOYLE=sesSoyle;
sesSoyle=function(metin){
 if(!SES.acik||!metin)return;
 if(DIL.mod!=='dilara'||typeof dilHash!=='function')return DIL_SOYLE(metin);
 var t=sesMetin(metin);if(!t)return;
 var man=DIL.man;
 if(!man){dilManifest();return DIL_SOYLE(metin);}/* liste henüz gelmediyse cihaz sesi, kesintisiz */
 var h=dilHash(t);
 if(!man[h]){dilEksikEkle(t);return DIL_SOYLE(metin);}
 sesSus();var req={text:t,token:SES.token};
 dilCal(h,req,metin,function(){if(req.token!==SES.token)return;DIL_SOYLE(metin);});
};
function dilEksikKopyala(){
 var s=JSON.stringify(DIL.eksik,null,1);
 try{navigator.clipboard.writeText(s).then(function(){sesDurum('Eksik ses listesi kopyalandı.');});}catch(e){sesDurum('Kopyalanamadı.');}
}
var DIL_AYAR=voiceSettings;
voiceSettings=function(){
 DIL_AYAR();
 var l=document.querySelector('label[for="voiceSelect"]');if(!l)return;
 l.insertAdjacentHTML('beforebegin','<label for="sesMotor">Ses türü</label><select id="sesMotor" onchange="DIL.mod=this.value;lsSet(\'sesMotor\',DIL.mod);sesSus()"><option value="dilara">Dilara (hazır kayıt)</option><option value="cihaz">Cihaz sesi</option></select>'
  +'<p class="sub">Dilara kaydı olmayan metinler cihaz sesiyle okunur. Eksik metin: <b id="dilEksikSay">'+DIL.eksik.length+'</b> <button type="button" class="btn sm" onclick="dilEksikKopyala()">Listeyi kopyala</button></p>');
 document.getElementById('sesMotor').value=DIL.mod;
};
dilManifest();
