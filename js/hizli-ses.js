/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Hızlı ses paneli (14.11.2026): telefonun hızlı ayarları gibi; her ekranda sol alttaki 🎵 düğmesi.
   Müzik aç/kapat, sonraki parça, sesli okuma, efekt sesleri tek dokunuşla. */
'use strict';
const HS_ADLAR={'bach-prelud-do-major':'Bach · Prelüd','sakin-sabah':'Sakin Sabah','aksam-isigi':'Akşam Işığı','satie-sade-gece':'Satie · Gece','pachelbel-kanon-sade':'Pachelbel · Kanon','beethoven-ay-isigi-sade':'Beethoven · Ay Işığı','beethoven-elise-icin-sade':'Beethoven · Elise İçin','beethoven-nese-ode-sade':'Beethoven · Neşeye Övgü','brahms-besik-sarkisi-sade':'Brahms · Ninni','greensleeves-sade':'Greensleeves'};
function hsParcaAdi(){try{const f=(MUZIK.parca()||'').split('/').pop().replace('.mp3','');return HS_ADLAR[f]||f;}catch(e){return '';}}
function hsSatir(id,ikon,ad,acik,alt){return '<button type="button" class="hs-satir'+(acik?' acik':'')+'" id="'+id+'" role="switch" aria-checked="'+acik+'"><span class="hs-ikon" aria-hidden="true">'+ikon+'</span><span class="hs-ad">'+ad+(alt?'<small>'+alt+'</small>':'')+'</span><span class="hs-anahtar" aria-hidden="true"><i></i></span></button>';}
function hsCiz(k){
 const m=typeof MUZIK!=='undefined'&&MUZIK.acikMi(),o=typeof SES!=='undefined'&&SES.acik,e=typeof EFEKT!=='undefined'&&EFEKT.acikMi();
 k.querySelector('.hs-govde').innerHTML=hsSatir('hsMuzik','🎵','Müzik',m,m?hsParcaAdi():'Kapalı')+
  '<button type="button" class="hs-sonraki" id="hsSonraki"'+(typeof MUZIK==='undefined'?' disabled':'')+'>⏭ Sonraki parça</button>'+
  hsSatir('hsOkuma','🗣️','Sesli okuma',o,o?'Sorular sesli okunur':'Kapalı')+
  hsSatir('hsEfekt','🔔','Efekt sesleri',e,e?'Doğru, yanlış ve kutlama sesleri':'Kapalı');
 k.querySelectorAll('.hs-satir').forEach(x=>x.addEventListener('click',()=>{try{sesEfekt('dokun');}catch(e){}}));
 k.querySelector('#hsMuzik').onclick=()=>{if(MUZIK.acikMi())MUZIK.kapat();else MUZIK.ac();hsCiz(k);};
 k.querySelector('#hsSonraki').onclick=()=>{MUZIK.sonraki();hsCiz(k);};
 k.querySelector('#hsOkuma').onclick=()=>{SES.acik=!SES.acik;lsSet('ses',SES.acik);if(!SES.acik&&typeof sesSus==='function')sesSus();hsCiz(k);};
 k.querySelector('#hsEfekt').onclick=()=>{EFEKT.ayarla(!EFEKT.acikMi());hsCiz(k);};
}
function hsAc(){
 if(document.getElementById('hsPanel'))return;
 const k=document.createElement('div');k.id='hsPanel';k.className='foot-menu';k.setAttribute('role','dialog');k.setAttribute('aria-modal','true');k.setAttribute('aria-label','Ses ayarları');
 k.innerHTML='<div class="foot-menu-ic hs-ic"><h2>🎧 Ses</h2><div class="hs-govde"></div><button type="button" class="btn pri" id="hsKapat">Tamam</button></div>';
 document.body.appendChild(k);hsCiz(k);
 const kapat=()=>{k.remove();if(typeof render==='function')render();};
 k.addEventListener('click',e=>{if(e.target===k)kapat();});k.querySelector('#hsKapat').onclick=kapat;k.querySelector('#hsMuzik').focus();
}
/* 14.11 akşam: Yüzen 🎵 düğmesi başka düğmelerin üstüne biniyordu. Ses paneli artık üst çubuktaki "Ses" düğmesinden açılır. */
function hsDurum(){const m=typeof MUZIK!=='undefined'&&MUZIK.acikMi(),o=typeof SES!=='undefined'&&SES.acik;return o&&m?'Okuma + Müzik':o?'Okuma':m?'Müzik':'Kapalı';}
function hsBagla(){
 document.querySelectorAll('.top .ses-ac').forEach(b=>{b.textContent='🎧 '+(innerWidth<520?(hsDurum()==='Kapalı'?'Kapalı':'Ses'):'Ses: '+hsDurum());b.classList.add('hs-kisa');b.setAttribute('aria-label','Ses ayarları: '+hsDurum()+'. Müzik, sesli okuma ve efektleri aç ya da kapat');b.onclick=e=>{e.preventDefault();e.stopPropagation();hsAc();};});
}
if(typeof render==='function'){const HS_R0=render;render=function(){HS_R0.apply(this,arguments);hsBagla();};}
