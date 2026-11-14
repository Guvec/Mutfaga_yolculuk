/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Hesabım: profil adına dokununca açılan tek sayfa (Matematik Canavarı düzeni).
   Karakter, başka cihaza aktarma, yazı boyutu, ses, tema, kılavuz, paylaşma ve hesabı silme burada toplanır. */
'use strict';
const HS_YZ=[['normal','Normal'],['buyuk','Büyük'],['cok','Çok büyük']];
function hsTema(){return {light:'Aydınlık',sepia:'Sepya',okyanus:'Okyanus',orman:'Orman',lavanta:'Lavanta',seftali:'Şeftali',yuksek:'Yüksek kontrast',dark:'Gece'}[document.documentElement.dataset.theme]||'Aydınlık';}
function hsYz(){return document.documentElement.getAttribute('data-yz')||'normal';}
function hsRutbe(){
 try{if(st.guest||!st.prof||typeof rutbeState!=='function')return '';const s=rutbeState(rkPid(st.prof,true)),r=s.rank||1;return rutbeAd(r-1)+' · '+s.mp+' puan';}catch(e){return '';}
}
function hesabimHTML(){
 const guest=st.guest||!st.prof,name=guest?'Misafir':st.prof;
 const can=profilDegistirilebilir(),index=guest?-1:profiles().indexOf(st.prof);
 let h=topBar('Hesabım')+'<div class="wrap hesabim">';
 h+='<section class="card hs-kart"><h2>'+esc(name)+'</h2>'+(guest?'<p>Misafir oturumunda sonuçlar kaydedilmez.</p>':'<p>'+esc(hsRutbe())+'</p>')+'</section>';
 if(!guest){
  h+='<section class="card"><h2>Karakterim</h2>';
  if(index>=0&&!adSabit(st.prof))h+='<button type="button" class="btn" onclick="hsKarakter()">Karakterini değiştir (1 kez)</button>';
  h+='<button type="button" class="btn" onclick="hsDost()">Aşçı dostunu seç</button><button type="button" class="btn" onclick="hsProfiller()">Bu cihazdaki profiller</button></section>';
  h+='<section class="card"><h2>Başka cihaza aktar</h2><p>Karakterini, rütbeni ve puanlarını başka telefona ya da bilgisayara taşımak için kod al.</p><button type="button" class="btn pri" onclick="akAc()">Aktarma kodu</button></section>';
 }
 h+='<section class="card"><h2>Yazı boyutu</h2><div class="yr-chips" role="group" aria-label="Yazı boyutu">'+HS_YZ.map(x=>'<button type="button" class="yr-chip'+(hsYz()===x[0]?' on':'')+'" aria-pressed="'+(hsYz()===x[0])+'" onclick="hsYazi(\''+x[0]+'\')">'+x[1]+'</button>').join('')+'</div></section>';
 h+='<section class="card"><h2>Sesli okuma</h2><div class="yr-chips" role="group" aria-label="Sesli okuma">'+[[true,'Açık'],[false,'Kapalı']].map(x=>'<button type="button" class="yr-chip'+(!!SES.acik===x[0]?' on':'')+'" aria-pressed="'+(!!SES.acik===x[0])+'" onclick="hsSes('+x[0]+')">'+x[1]+'</button>').join('')+'</div><button type="button" class="btn ghost" onclick="voiceSettings()">Ses ayarları</button></section>';
 h+='<section class="card"><h2>Görünüm</h2><button type="button" class="btn" onclick="hsTemaDegis()">Tema: '+hsTema()+'</button></section>';
 if(!guest&&typeof frGizlilikHTML==='function'){h+=frGizlilikHTML();if(typeof frEnsure==='function'&&!FR.ready)frEnsure().then(()=>{if(st.screen==='hesabim')render();});}
 h+='<section class="card"><button type="button" class="btn" onclick="go(\'history\')">Çalışma geçmişim</button><button type="button" class="btn" onclick="kilavuzAc()">📖 Kılavuz</button><button type="button" class="btn" onclick="hsPaylas()">Uygulamayı paylaş</button><button type="button" class="btn" onclick="yasalAc(false)">Gizlilik ve koşullar</button></section>';
 if(!guest)h+='<section class="card hs-sil"><h2>Verilerimi sil</h2><p>Karakterin, rütben, puanların, çalışma geçmişin, arkadaşların ve sıralamadaki kayıtların silinir.</p><button type="button" class="btn danger" onclick="hsSil()">Verilerimi sil</button></section>';
 return h+'</div>';
}
function hsKur(fn){return function(){if(!profilDegistirilebilir())return;fn();};}
window.hsKarakter=hsKur(function(){adOpen(profiles().indexOf(st.prof),'hesabim');});
window.hsDost=hsKur(function(){GIRIS.ac('hesabim',null,true);});
window.hsProfiller=hsKur(function(){go('profiles');});
window.hsSil=hsKur(function(){
 const n=st.prof;
 /* 1. adım: neyin silineceği; 2. adım: mevcut silme akışı (rekor.js, profil-oturum.js) kendi onayını sorar. */
 modal('<b>Emin misin?</b><br>“'+esc(n)+'” için karakter, rütbe ve puanlar, çalışma geçmişi, arkadaşlar ve sıralamadaki kayıtlar silinir.<br><b>Bu işlem geri alınamaz.</b>',function(){closeModal();askDelProfile(n);});
});
window.hsYazi=function(v){document.documentElement.setAttribute('data-yz',v);try{localStorage.setItem('mesleki-yazi',v);}catch(e){}render();};
window.hsSes=function(on){SES.acik=!!on;lsSet('ses',SES.acik);if(!SES.acik)sesSus();render();};
window.hsTemaDegis=function(){temaDegistir();render();};
window.hsPaylas=function(){
 const url=location.origin+location.pathname.replace(/[^/]*$/,''),veri={title:'İşin Mutfağına Yolculuk',text:'İşin Mutfağına Yolculuk oyununu dene!',url};
 if(navigator.share){navigator.share(veri).catch(function(e){if(!e||e.name!=='AbortError')hsKopyala(url);});}else hsKopyala(url);
};
function hsKopyala(url){
 const ok=function(){if(typeof adToast==='function')adToast('Bağlantı kopyalandı.');};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(ok,function(){});else ok();
}
window.hesabimAc=function(){go('hesabim');};
const HS_RENDER=render,HS_BACK=back,HS_AYRINTI=profilAyrintiAc;
render=function(){const app=document.getElementById('app');if(app&&st.screen==='hesabim'){app.innerHTML=hesabimHTML();return;}return HS_RENDER.apply(this,arguments);};
back=function(){if(st.screen==='hesabim'){go('home');return;}return HS_BACK.apply(this,arguments);};
/* Profil adına dokununca Hesabım açılır; çalışma sürerken eski kısa pencere kalır. */
profilAyrintiAc=function(){if(st.modalOpen)return;if(profilDegistirilebilir()&&(st.guest||st.prof)){go('hesabim');return;}return HS_AYRINTI.apply(this,arguments);};
