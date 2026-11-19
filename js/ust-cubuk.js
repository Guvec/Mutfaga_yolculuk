/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* 14.11 akşam: Üst çubuk tek satır (iç ekranlar): ← · başlık · 🏠 · 🎧 · profil simgesi.
   Yazılı "Geri", "Ana sayfa" ve uzun profil adı üç satıra taşıyor, ekranı yana kaydırıyordu.
   Düğmelerin işlevi aynı kalır; adları ekran okuyucu için aria-label'da durur. */
'use strict';
function ucSimge(ad){const s=String(ad||'').trim();if(!s)return '👤';try{if(typeof Intl!=='undefined'&&Intl.Segmenter){const g=[...new Intl.Segmenter('tr',{granularity:'grapheme'}).segment(s)][0];if(g&&/\p{Extended_Pictographic}/u.test(g.segment))return g.segment;}}catch(e){}const m=s.match(/\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic})*/u);return m?m[0]:s[0].toLocaleUpperCase('tr');}
function ucDuzenle(){
 document.querySelectorAll('#app .top').forEach(t=>{
  if(t.dataset.uc)return;t.dataset.uc='1';t.classList.add('uc');
  const rutbeEkrani=t.nextElementSibling?.matches('.ry,.ry-rozetler');
  t.querySelectorAll('.back').forEach(b=>{
   if(b.classList.contains('home-shortcut')){
    if(rutbeEkrani)b.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6"/></svg>';
    else b.textContent='🏠';
    b.setAttribute('aria-label','Ana sayfa');b.title='Ana sayfa';b.classList.add('uc-ev');
   }
   else if(/Geri/.test(b.textContent)){b.textContent='←';b.setAttribute('aria-label','Geri');b.title='Geri';b.classList.add('uc-geri');}
  });
  const p=t.querySelector('.who .profile-self');
  if(p){const ad=p.textContent;p.textContent=ucSimge(ad);p.title=ad;p.classList.add('uc-profil');}
 });
}
{const O=render;render=function(){const r=O.apply(this,arguments);try{ucDuzenle();}catch(e){}return r;};}
