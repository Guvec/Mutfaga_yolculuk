/* İşin Mutfağına Yolculuk — ana sayfa, tüm konular, gece modu ve üst çubuk düğmeleri.
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
var HAZIRLANIYOR=['beslenme-ilkeleri'];
(function(){
 const root=document.documentElement;
 let theme='light',pending=null;
 const THEMES=['light','sepia','dark'],THEME_NAME={light:'Açık',sepia:'Sepya',dark:'Gece'},THEME_COLOR={light:'#ffffff',sepia:'#f3ead4',dark:'#14231f'};
 try{const t=localStorage.getItem('mesleki-tema');theme=THEMES.includes(t)?t:(localStorage.getItem('mesleki-gece')==='true'?'dark':'light');}catch(e){}
 function applyTheme(){root.dataset.theme=theme;root.style.colorScheme=theme==='dark'?'dark':'light';document.querySelectorAll('.theme-toggle').forEach(b=>{b.textContent='Tema: '+THEME_NAME[theme];b.removeAttribute('aria-pressed');b.setAttribute('aria-label','Tema: '+THEME_NAME[theme]+'. Değiştirmek için dokun.');});const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=THEME_COLOR[theme];}
 window.temaDegistir=function(){theme=THEMES[(THEMES.indexOf(theme)+1)%THEMES.length];try{localStorage.setItem('mesleki-tema',theme);localStorage.setItem('mesleki-gece',String(theme==='dark'));}catch(e){}applyTheme();};
 const themeButton=()=>'<button type="button" class="theme-toggle" aria-label="Tema: '+THEME_NAME[theme]+'. Değiştirmek için dokun." onclick="temaDegistir()">Tema: '+THEME_NAME[theme]+'</button>';
 const sesYazi=()=>'Sesli okuma: '+(SES.acik?'Açık':'Kapalı');
 const hoparlor=()=>'<svg class="design-spk" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>'+(SES.acik?'<path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>':'<path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>')+'</svg>';
 const muzik=()=>typeof muzikDugme==='function'?muzikDugme():'';
 const beforeTopBar=topBar;topBar=function(title,noBack){let html=beforeTopBar(title,noBack);html=html.replace(/(class="ses-ac"[^>]*>)[^<]*/,'$1'+sesYazi());const end=html.lastIndexOf('</div>');return html.slice(0,end)+muzik()+themeButton()+html.slice(end);};
 const kapi='<svg class="design-logo" viewBox="0 0 40 48" width="34" height="42" aria-hidden="true" focusable="false"><rect x="5" y="3" width="30" height="42" rx="2" fill="none" stroke="currentColor" stroke-width="3"/><path d="M5 3l20 5v37L5 45z" fill="currentColor"/><circle cx="20" cy="27" r="2" fill="#fff"/></svg>';
 function header(){return '<header class="design-header"><button type="button" class="design-brand" onclick="go(\'home\')" aria-label="İşin Mutfağına Yolculuk, ana sayfa">'+kapi+'</button><nav class="design-tools" aria-label="Ayarlar"><button type="button" class="design-home" onclick="go(\'home\')"'+(st.screen==='home'||st.screen==='welcome'?' aria-current="page"':'')+'>Ana sayfa</button>'+themeButton()+'<button type="button" class="design-speech ses-ac" aria-pressed="'+SES.acik+'" onclick="sesAcKapa()">'+hoparlor()+sesYazi()+'</button>'+muzik()+'</nav></header>';}
 window.tasarimBasla=function(target){if(st.prof||st.guest){target==='all'?go('topics'):openSubject(target);}else{pending=target;go('profiles');}};
 function konuAdi(s){return (KONU_GORSEL[s.id]&&KONU_GORSEL[s.id].ad)||s.name;}
 function topicCard(s,hemen){
  const hazir=!HAZIRLANIYOR.includes(s.id),g=KONU_GORSEL[s.id]||{};
  const resim=g.foto?'<img src="'+g.foto+'" alt=""'+(hemen?'':' loading="lazy"')+' decoding="async">':'<span class="design-topic-empty">'+esc(konuAdi(s))+'</span>';
  return '<button type="button" class="design-topic" data-ara="'+esc((konuAdi(s)+' '+s.name).toLocaleLowerCase('tr'))+'" '+(hazir?'onclick="tasarimBasla(\''+s.id+'\')"':'disabled')+'><span class="design-topic-art" aria-hidden="true">'+resim+'</span><span class="design-topic-name">'+esc(konuAdi(s))+'</span>'+(hazir?'':'<span class="design-topic-note">Hazırlanıyor</span>')+'</button>';
 }
 const ikon={
  kitap:'<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M24 12c-5-4-12-5-19-4v29c7-1 14 0 19 4 5-4 12-5 19-4V8c-7-1-14 0-19 4zM24 12v29" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>',
  sapka:'<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M14 30c-6 0-9-4-9-9s4-9 9-8c1-5 5-8 10-8s9 3 10 8c5-1 9 3 9 8s-3 9-9 9v11H14z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M14 35h20" stroke="currentColor" stroke-width="3"/></svg>',
  pano:'<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="9" y="8" width="30" height="36" rx="3" fill="none" stroke="currentColor" stroke-width="3"/><path d="M18 5h12v7H18z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M16 27l6 6 11-12" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
 };
 function serit(){return '<div class="design-steps" aria-label="Çalışma aşamaları"><span>'+ikon.kitap+'Öğreniyorum</span><span>'+ikon.sapka+'Uyguluyorum</span><span>'+ikon.pano+'Pekiştiriyorum</span></div>';}
 function telefon(src,ad){return '<span class="design-phone"><img src="'+src+'" alt=""><span>'+ad+'</span></span>';}
 function raceSection(){return '<section class="design-race" aria-labelledby="designRaceTitle"><div class="design-race-art" aria-hidden="true">'+telefon('assets/mutfak-araclari/guncel-062.jpg','Karıştırma kabı')+telefon('assets/mutfak-araclari/guncel-063.jpg','Çırpma teli')+'</div><div class="design-race-copy"><h2 id="designRaceTitle">Birlikte Oynayalım</h2><p>Arkadaşlarınla aynı oyuna katıl.</p><div class="design-race-actions"><button type="button" class="btn pri" onclick="tasarimOda(\'join\')">Odaya katıl</button><button type="button" class="btn design-outline" onclick="tasarimOda(\'create\')">Oda oluştur</button></div></div></section>';}
 function landing(){
  const featured=ONE_CIKAN.map(id=>SUBJECTS.find(s=>s.id===id)).filter(Boolean);
  return header()+'<div class="design-wrap"><section class="design-hero"><div class="design-hero-copy"><h1>İşin Mutfağına<br>Yolculuk</h1><p>Öğren, uygula, pekiştir.</p><span class="design-rule" aria-hidden="true"></span><button type="button" class="btn pri" onclick="tasarimBasla(\'all\')">Çalışmaya başla</button></div><div class="design-hero-photo"><img src="assets/tasarim/atolye.jpg" alt="Paslanmaz tezgâhında pasta, tart ve poğaça bulunan aydınlık mesleki mutfak atölyesi" fetchpriority="high"></div></section>'+serit()+'<section aria-labelledby="designTopicTitle"><div class="design-section-heading"><h2 id="designTopicTitle">Hangi konuda çalışmak istersin?</h2><button type="button" class="design-all" onclick="tasarimBasla(\'all\')">Tüm konular</button></div><div class="design-grid">'+featured.map(s=>topicCard(s,true)).join('')+'</div></section>'+raceSection()+((st.prof||st.guest)?'<footer class="design-footer">'+(st.prof&&!st.guest?'<button type="button" class="design-all" onclick="go(\'history\')">Çalışma geçmişim</button>':'')+'<button type="button" class="design-all" onclick="go(\'profiles\')">Profil değiştir</button></footer>':'')+'</div>';
 }
 function topics(){return topBar('Tüm konular')+'<div class="design-wrap design-topics-page"><h1 class="design-page-title">Hangi konuda çalışmak istersin?</h1><label class="design-search-label" for="designSearch">Konu ara</label><input type="search" id="designSearch" oninput="tasarimAra(this.value)" placeholder="Konu adını yaz" autocomplete="off"><div class="design-grid">'+SUBJECTS.map(s=>topicCard(s,false)).join('')+'</div><p id="designNoTopics" hidden role="status">Bu adla bir konu bulunamadı.</p></div>';}
 window.tasarimOda=function(kind){yrOpen();const section=document.getElementById(kind==='create'?'yrSubject':'yrNick');if(section){section.closest('section').scrollIntoView({block:'start',behavior:'auto'});section.focus({preventScroll:true});}};
 window.tasarimAra=function(value){const q=value.toLocaleLowerCase('tr').trim();let n=0;document.querySelectorAll('.design-topics-page .design-topic').forEach(b=>{const show=(b.dataset.ara||'').includes(q);b.hidden=!show;if(show)n++;});document.getElementById('designNoTopics').hidden=n!==0;};
 /* Konu sayfasının üstüne konunun fotoğrafı eğimli küçük kapak olarak eklenir. */
 function konuKapak(){const g=KONU_GORSEL[st.subject];const h1=document.querySelector('#app .wrap > h1');if(!g||!g.foto||!h1||document.querySelector('.design-subject-cover'))return;h1.insertAdjacentHTML('beforebegin','<div class="design-subject-cover" aria-hidden="true"><img src="'+g.foto+'" alt=""></div>');h1.classList.add('design-page-title');}
 function decorate(){document.body.dataset.screen=st.screen;const top=document.querySelector('.top');if(top&&!top.querySelector('.theme-toggle'))top.insertAdjacentHTML('beforeend',muzik()+themeButton());document.querySelectorAll('.top .ses-ac').forEach(b=>{b.textContent=sesYazi();});if(st.screen==='subject')konuKapak();applyTheme();}
 const beforeBack=back;back=function(){if(st.screen==='profiles')pending=null;if(st.screen==='topics'){go('home');return;}beforeBack();};
 const beforeRender=render;render=function(){
  if(st.screen==='home'&&pending){const target=pending;pending=null;if(target==='all')st.screen='topics';else{st.subject=target;st.screen='subject';}}
  if(st.screen==='welcome'||st.screen==='home'){if(typeof SES!=='undefined')SES.sira=[];document.getElementById('app').innerHTML=landing();}
  else if(st.screen==='topics'){if(typeof SES!=='undefined')SES.sira=[];document.getElementById('app').innerHTML=topics();}
  else beforeRender();
  decorate();
 };
 window.addEventListener('storage',e=>{if(e.key==='mesleki-tema'&&THEMES.includes(e.newValue)){theme=e.newValue;applyTheme();}});
 applyTheme();render();
})();
