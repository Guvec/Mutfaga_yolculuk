/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Çerçeve (aksan) rengi seçici: Ayarlar (⚙) penceresinde "Çerçeve rengi". Tercih cihazda saklanır (mesleki-aksan). Tema ayrı bir ayardır. */
'use strict';
var AKSAN_LISTE=[['turkuaz','Turkuaz','#0B7F78'],['okyanus','Okyanus','#1F5FA8'],['orman','Orman','#2B7A45'],['bordo','Bordo','#8E2A3B'],['kehribar','Kehribar','#B45F06'],['mor','Mor','#6B3FA0']];
function aksanSecili(){try{var a=localStorage.getItem('mesleki-aksan');return AKSAN_LISTE.some(function(x){return x[0]===a;})?a:'turkuaz';}catch(e){return 'turkuaz';}}
function aksanUygula(a){
  var h=document.documentElement;
  if(a==='turkuaz')h.removeAttribute('data-aksan');else h.setAttribute('data-aksan',a);
  try{localStorage.setItem('mesleki-aksan',a);}catch(e){}
  var m=document.querySelector('meta[name=theme-color]');
  document.querySelectorAll('.aksan-sw button').forEach(function(b){var on=b.dataset.a===a;b.setAttribute('aria-pressed',String(on));b.textContent=on?'✓':'';});
  var ad=document.getElementById('aksanAd');if(ad)ad.textContent=(AKSAN_LISTE.filter(function(x){return x[0]===a;})[0]||[])[1]||'';
}
function aksanHTML(){
  var s=aksanSecili();
  return '<div class="aksan-sec"><p id="aksanBaslik">Çerçeve rengi</p><div class="aksan-sw" role="group" aria-labelledby="aksanBaslik">'+
    AKSAN_LISTE.map(function(x){return '<button type="button" data-a="'+x[0]+'" style="background:'+x[2]+'" aria-label="'+x[1]+'" aria-pressed="'+(x[0]===s)+'">'+(x[0]===s?'✓':'')+'</button>';}).join('')+
    '</div><span class="aksan-ad" id="aksanAd">'+AKSAN_LISTE.filter(function(x){return x[0]===s;})[0][1]+'</span></div>';
}
/* Ses ayarları penceresi tüm ayarların kapısıdır; renk seçici onun içine, ilk düğme satırından önce konur. */
(function(){
  if(typeof voiceSettings!=='function')return;
  var V0=voiceSettings;
  voiceSettings=function(){
    V0.apply(this,arguments);
    var box=document.querySelector('#ov .modal');if(!box||box.querySelector('.aksan-sec'))return;
    var d=document.createElement('div');d.innerHTML=aksanHTML();
    var ilk=box.querySelector('.row');box.insertBefore(d.firstChild,ilk);
    box.querySelectorAll('.aksan-sw button').forEach(function(b){b.onclick=function(){aksanUygula(b.dataset.a);};});
  };
})();
