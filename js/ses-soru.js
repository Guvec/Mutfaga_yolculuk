/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* İlk girişte bir kez: sesli okuma, müzik ya da sessiz. Seçim dokunuşu tarayıcının istediği "ilk dokunuş" olduğu için müzik hemen başlar.
   Seçim sonradan Ses ayarları'ndan değiştirilir. Daha önceki tercih seçili gelir; bir dokunuşla onaylanır. */
'use strict';
var SES_SORU_ANAHTAR='mesleki-ses-soru';
function sesSoruGoster(){
 try{if(localStorage.getItem(SES_SORU_ANAHTAR)==='1')return;}catch(e){}
 if(st.screen!=='giris'||st.modalOpen)return;
 /* Otomatik tarayıcı testlerinde (webdriver) gösterilmez; test için 'test-ses-soru' anahtarı konur. */
 try{if(navigator.webdriver&&!localStorage.getItem('test-ses-soru'))return;}catch(e){}
 var simdi=MUZIK.acikMi()?'muzik':SES.acik?'okuma':'sessiz';
 function d(k,ikon,ad,not){return '<button class="btn'+(simdi===k?' pri':'')+'" data-ses-soru="'+k+'" aria-pressed="'+(simdi===k)+'">'+ikon+' '+ad+'<br><small>'+not+'</small></button>';}
 modalFocus=document.activeElement;st.modalOpen=true;pauseT();
 var ov=document.getElementById('ov');ov.className='on';
 ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="sesSoruBaslik"><h2 id="sesSoruBaslik">Nasıl çalışmak istersin?</h2><p>Birini seç. Sonra Ses ayarları\'ndan değiştirebilirsin.</p><div class="ses-soru-liste">'+d('okuma','🔊','Sesli okuma','Soruları sesli okur.')+d('muzik','🎵','Müzik','Arkada sakin müzik çalar.')+d('sessiz','🔇','Sessiz','Ses çalmaz.')+'</div></div>';
 ov.querySelectorAll('[data-ses-soru]').forEach(function(b){b.onclick=function(){sesSoruSec(b.getAttribute('data-ses-soru'));};});
 var ilk=ov.querySelector('.pri')||ov.querySelector('button');if(ilk)ilk.focus();
}
function sesSoruSec(k){
 try{localStorage.setItem(SES_SORU_ANAHTAR,'1');}catch(e){}
 if(k==='muzik'){MUZIK.ac();}
 else{if(MUZIK.acikMi())MUZIK.kapat();var ac=k==='okuma';if(SES.acik!==ac){SES.acik=ac;lsSet('ses',ac);if(!ac)sesSus();}}
 closeModal();if(typeof MUZIK.etiketleriYenile==='function')MUZIK.etiketleriYenile();
}
setTimeout(sesSoruGoster,400);
