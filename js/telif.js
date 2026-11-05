/* Telif bildirimi, "Hakkında" penceresi ve Sakin mod. Telif metni yalnız burada tanımlanır. */
'use strict';
var TELIF={satir:'© 2026 Ali Arıkoğlu. Tüm hakları saklıdır.',ayrinti:'Uygulamanın yazılımı, düzeni ve özgün içeriği izinsiz kopyalanamaz, çoğaltılamaz, dağıtılamaz ve yeniden yayımlanamaz.',okunus:'Telif hakkı 2026 Ali Arıkoğlu. Tüm hakları saklıdır.',ad:'İşin Mutfağına Yolculuk'};
function telifHTML(){return '<p class="telif" aria-label="'+esc(TELIF.okunus)+'"><span>'+esc(TELIF.satir)+'</span><small>'+esc(TELIF.ayrinti)+'</small></p>';}

/* Sakin mod: süs hareketlerini ve efekt seslerini kapatır. Müzik ve sesli okuma ayrı çalışır.
   Kayıt yoksa cihazın "hareketi azalt" tercihi esas alınır; elle seçim her zaman önceliklidir. */
function sakinVarsayilan(){try{return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){return false;}}
function sakinAcik(){const v=ls('sakin',null);return v===null||v===undefined?sakinVarsayilan():!!v;}
function sakinUygula(){
 const on=sakinAcik();document.documentElement.setAttribute('data-sakin',on?'1':'0');
 if(typeof GIRIS!=='undefined'){if(GIRIS.motionAsil===undefined)GIRIS.motionAsil=GIRIS.motion;GIRIS.motion=GIRIS.motionAsil&&!on;}
}
function sakinDegistir(){lsSet('sakin',!sakinAcik());sakinUygula();const b=document.getElementById('sakinAc');if(b)sakinDugmeYaz(b);}
function sakinDugmeYaz(b){const on=sakinAcik();b.setAttribute('aria-pressed',String(on));b.textContent='Sakin mod: '+(on?'Açık':'Kapalı');}
if(typeof EFEKT!=='undefined'&&EFEKT.cal){const ESKI=EFEKT.cal;EFEKT.cal=function(ad){return sakinAcik()?false:ESKI(ad);};}
sakinUygula();

function hakkindaAc(){
 modalFocus=document.activeElement;sesSus();st.modalOpen=true;pauseT();const ov=document.getElementById('ov');ov.className='on';
 ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-label="Hakkında"><h2>Hakkında</h2><p><b>'+esc(TELIF.ad)+'</b></p><p class="sub">'+esc(VERSION)+'</p>'+telifHTML()+'<div class="row"><button class="btn pri" onclick="closeModal()">Kapat</button></div></div>';
 const k=ov.querySelector('.btn.pri');if(k)k.focus();
}
/* Karşılama ekranına telif satırı; oyun ve yarış ekranlarına konmaz. */
const TELIF_RENDER=render;
render=function(){
 TELIF_RENDER();const app=document.getElementById('app');if(!app)return;
 if(st.screen==='welcome'&&!app.querySelector('.telif'))app.insertAdjacentHTML('beforeend',telifHTML());
 /* Ana sayfa ve profil ekranı: paylaş ve güncelle (render zincirinin en sonunda eklenir, başka ekran kodu silmesin). */
 if((st.screen==='home'||st.screen==='profiles')&&!app.querySelector('.ad-paylas'))app.insertAdjacentHTML('beforeend','<div class="voice-tools ad-paylas"><button type="button" class="btn sm" onclick="uygulamaPaylas()">📤 Uygulamayı paylaş</button> <button type="button" class="btn sm" onclick="uygulamaGuncelle()">🔄 Güncelle</button></div>');
};
/* Ses ayarları penceresine Sakin mod anahtarı ve Hakkında düğmesi. */
const TELIF_AYAR=voiceSettings;
voiceSettings=function(){
 TELIF_AYAR();const rows=document.querySelectorAll('#ov .modal > .row'),satir=rows[rows.length-1];if(!satir)return;
 satir.insertAdjacentHTML('beforebegin','<div class="row"><button type="button" class="btn sm" id="sakinAc" onclick="sakinDegistir()"></button><button type="button" class="btn sm" onclick="hakkindaAc()">Hakkında</button></div><p class="sub">Sakin mod: Hareketleri ve efekt seslerini azaltır. Müzik ve sesli okuma ayrı çalışır.</p>');
 sakinDugmeYaz(document.getElementById('sakinAc'));
};
