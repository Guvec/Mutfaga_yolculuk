/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Oyun girişlerini tek noktadan kapsar; ana sayfada soru açılmaz. */
(function(){
 const games=['board','quiz','game','racemenu','racelobby','racecreate','racecount','raceplay','dintro','dplay','aintro','aplay','cvplay','haftaplay'];
 const prev=render;render=function(){prev();document.body.classList.toggle('oyun-ekrani',games.includes(st.screen));if(games.includes(st.screen)){
 const bar=document.querySelector('#app .top');
 if(bar&&!bar.querySelector('.ses-paket-ayar')){let b=bar.querySelector('.ses-ac');if(!b){b=document.createElement('button');b.className='ses-ac';bar.appendChild(b);}b.classList.add('ses-paket-ayar');b.textContent='Ses: '+(SES.acik?'Okuma':MUZIK.acikMi()?'Müzik':'Sessiz');b.setAttribute('aria-label',b.textContent+'. Ses ayarlarını aç');b.onclick=voiceSettings;}
 if(!st.modalOpen)sesSecimiSor();
 }};
 // Profil seçimi başına soru yeniden açılır. Testler de gerçek seçim düğmesini kullanır.
 const pick=pickProfile;pickProfile=function(n){try{sessionStorage.removeItem('mesleki-ses-secim');}catch(e){}return pick(n);};
})();
