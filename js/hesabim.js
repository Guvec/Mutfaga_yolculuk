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
/* 14.11 akşam (onaylı yapı): Hesabım tek ekran liste. Yazı boyutu, sesli okuma ve tema Ayarlar'a taşındı (tekrar kalktı);
   arkadaş gizliliği açılır bölümde. */
function hbSatir(ikon,ad,js,cls,deger){return '<button type="button" class="ay-satir'+(cls?' '+cls:'')+'" onclick="'+js+'"><span class="ay-ikon" aria-hidden="true">'+ikon+'</span><span class="ay-ad">'+ad+'</span>'+(deger?'<span class="ay-deger">'+deger+'</span>':'')+'<span class="ay-ok" aria-hidden="true">›</span></button>';}
function hesabimHTML(){
 const guest=st.guest||!st.prof,name=guest?'Misafir':st.prof;
 const index=guest?-1:profiles().indexOf(st.prof);
 let h=topBar('Hesabım')+'<div class="wrap hesabim hs-yeni">';
 h+='<section class="hs-kimlik"><span class="hs-simge" aria-hidden="true">'+(typeof ucSimge==='function'?ucSimge(name):'👤')+'</span><span><b>'+esc(name)+'</b><small>'+(guest?'Misafir oturumunda sonuçlar kaydedilmez.':esc(hsRutbe()))+'</small></span></section>';
 if(!guest){
  h+='<p class="ay-grup">Karakterim</p><div class="ay-liste">'+
   (index>=0&&!adSabit(st.prof)?hbSatir('✏️','Karakterini değiştir','hsKarakter()','','1 kez'):'')+
   hbSatir('🐼','Aşçı dostunu seç','hsDost()')+hbSatir('👥','Bu cihazdaki profiller','hsProfiller()')+hbSatir('📲','Başka cihaza aktar','akAc()','','Kod al')+'</div>';
 }
 h+='<p class="ay-grup">Ayarlar</p><div class="ay-liste">'+hbSatir('⚙️','Görünüm ve ses','anaAyarlar()')+'</div>';
 if(!guest&&typeof frGizlilikHTML==='function'){h+='<details class="hs-gizlilik"><summary><span class="ay-ikon" aria-hidden="true">🔒</span><span class="ay-ad">Arkadaşlar ve gizlilik</span><span class="ay-ok" aria-hidden="true">›</span></summary>'+frGizlilikHTML()+'</details>';if(typeof frEnsure==='function'&&!FR.ready)frEnsure().then(()=>{if(st.screen==='hesabim')render();});}
 h+='<p class="ay-grup">Diğer</p><div class="ay-liste">'+hbSatir('📅','Çalışma geçmişim',"go('history')")+hbSatir('📖','Kılavuz','kilavuzAc()')+hbSatir('📤','Uygulamayı paylaş','hsPaylas()')+hbSatir('📄','Gizlilik ve koşullar','yasalAc(false)')+'</div>';
 if(!guest)h+='<div class="ay-liste hs-sil-liste">'+hbSatir('🗑️','Verilerimi sil','hsSil()','hs-sil-satir')+'</div>';
 return h+'</div>';
}
function hsKur(fn){return function(){if(!profilDegistirilebilir())return;fn();};}
window.hsKarakter=hsKur(function(){const i=profiles().indexOf(st.prof);if(i<0){if(typeof adToast==='function')adToast('Önce profilini seç.');return;}adOpen(i,'hesabim');});
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
