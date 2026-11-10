/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* İşin Mutfağına Yolculuk — tema, üst çubuk düğmeleri ve konu fotoğrafları (ana sayfa ana-ekran.js içindedir).
   Yeni konu eklemek için: platform.js SUBJECTS listesine konuyu, aşağıdaki KONU_GORSEL listesine fotoğrafını ekleyin.
   Ana sayfada görünecek dört konu ONE_CIKAN listesinden seçilir. Fotoğrafı olmayan konu, adıyla birlikte sade kartta görünür. */
'use strict';
var KONU_GORSEL={
 'baharat':{ad:'Baharatlar',foto:'assets/tasarim/konu-baharatlar.jpg'},
 'mutfak-araclari':{ad:'Mutfak Araçları',foto:'assets/tasarim/konu-mutfak-araclari.jpg'},
 'kuver':{ad:'Kuver',foto:'assets/tasarim/konu-kuver.jpg'},
 'bulasik-makinesi-temizligi':{ad:'Bulaşık ve Atık Yönetimi',foto:'assets/tasarim/konu-bulasik.jpg'},
 'beslenme-ilkeleri':{ad:'Beslenme İlkeleri',foto:'assets/tasarim/konu-beslenme.jpg'}
};
var ONE_CIKAN=['baharat','mutfak-araclari','kuver','bulasik-makinesi-temizligi'];
var HAZIRLANIYOR=[];
(function(){
 const root=document.documentElement;
 let theme='light';
 const THEMES=['light','sepia','okyanus','orman','lavanta','seftali','yuksek','dark'],THEME_NAME={light:'Açık',sepia:'Sepya',okyanus:'Okyanus',orman:'Orman',lavanta:'Lavanta',seftali:'Şeftali',yuksek:'Yüksek kontrast',dark:'Gece'},THEME_COLOR={light:'#ffffff',sepia:'#f3ead4',okyanus:'#e6eff5',orman:'#e8f0e3',lavanta:'#eeeaf6',seftali:'#fbeee6',yuksek:'#ffffff',dark:'#14231f'};
 try{const t=localStorage.getItem('mesleki-tema');theme=THEMES.includes(t)?t:(localStorage.getItem('mesleki-gece')==='true'?'dark':'light');}catch(e){}
 function applyTheme(){root.dataset.theme=theme;root.style.colorScheme=theme==='dark'?'dark':'light';document.querySelectorAll('.theme-toggle').forEach(b=>{b.textContent='Tema: '+THEME_NAME[theme];b.removeAttribute('aria-pressed');b.setAttribute('aria-label','Tema: '+THEME_NAME[theme]+'. Değiştirmek için dokun.');});const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=THEME_COLOR[theme];}
 window.temaDegistir=function(){theme=THEMES[(THEMES.indexOf(theme)+1)%THEMES.length];try{localStorage.setItem('mesleki-tema',theme);localStorage.setItem('mesleki-gece',String(theme==='dark'));}catch(e){}applyTheme();};
 const themeButton=()=>'<button type="button" class="theme-toggle" aria-label="Tema: '+THEME_NAME[theme]+'. Değiştirmek için dokun." onclick="temaDegistir()">Tema: '+THEME_NAME[theme]+'</button>';
 const sesYazi=()=>'Sesli okuma: '+(SES.acik?'Açık':'Kapalı');
 const hoparlor=()=>'<svg class="design-spk" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>'+(SES.acik?'<path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>':'<path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>')+'</svg>';
 const muzik=()=>typeof muzikDugme==='function'?muzikDugme():'';
 const sesIkon=()=>SES.acik?'🔊':'🔇';
 const beforeTopBar=topBar;topBar=function(title,noBack){let html=beforeTopBar(title,noBack);return html.replace(/(class="ses-ac"[^>]*>)[^<]*/,'$1'+sesIkon());};
 /* Konu sayfasının üstüne konunun fotoğrafı eğimli küçük kapak olarak eklenir. */
 function konuKapak(){const g=KONU_GORSEL[st.subject];const h1=document.querySelector('#app .wrap > h1');if(!g||!g.foto||!h1||document.querySelector('.design-subject-cover'))return;h1.insertAdjacentHTML('beforebegin','<div class="design-subject-cover" aria-hidden="true"><img src="'+g.foto+'" alt=""></div>');h1.classList.add('design-page-title');}
 function decorate(){document.body.dataset.screen=st.screen;document.querySelectorAll('.top .ses-ac:not(.ses-paket-ayar)').forEach(b=>{b.textContent=sesIkon();});if(st.screen==='subject')konuKapak();applyTheme();}
  const beforeRender=render;render=function(){
  if(st.screen==='welcome'||st.screen==='home'){if(typeof SES!=='undefined')SES.sira=[];document.getElementById('app').innerHTML='';}
  else beforeRender();
  decorate();
 };
 window.addEventListener('storage',e=>{if(e.key==='mesleki-tema'&&THEMES.includes(e.newValue)){theme=e.newValue;applyTheme();}});
 applyTheme();render();
})();
