/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Uygulama kılavuzu: öğrencinin uygulamayı tek başına kullanabilmesi için kısa açıklamalar.
   Ana sayfadan ve Tüm konular ekranından açılır. Bir başlığa dokununca açılır. */
'use strict';
var KILAVUZ_DURUM={from:'home',open:null};
var KILAVUZ=[
 {id:'ne',t:'Bu uygulama ne işe yarar?',h:'<p>Yiyecek ve içecek hizmetleri konularını <b>görerek, dinleyerek ve uygulayarak</b> öğrenirsin. Atölyede öğrendiklerini burada tekrar edersin.</p>'},
 {id:'basla',t:'Nasıl çalışırım?',h:'<ul><li>Ana sayfada <b>Mutfak Kitabım</b>a dokun ve bir konu seç.</li><li>Konuda <b>Yolculuğum</b>a dokun. Bölümleri sırayla çalışırsın.</li><li>Bir bölümü bitirince sıradaki bölüm açılır.</li><li>Kaldığın yerden devam etmek için ana sayfadaki <b>Devam et</b> düğmesine dokun.</li><li>Profil seçersen sonuçların bu cihazda saklanır. Misafir olarak çalışırsan sonuçların kaydedilmez.</li><li>Karakterini <b>bir kez</b> değiştirebilirsin. Puanların ve rütben yeni karakterine taşınır.</li></ul>'},
 {id:'rutbe',t:'Rütbem nasıl yükselir?',h:'<ul><li>Rütben <b>Mutfak Puanı</b> ile yükselir. Rütbeler sırayla: <b>Çırak</b>, <b>Aşçı Yardımcısı</b> (100 puan), <b>Aşçı</b> (300), <b>Kaptan</b> (650), <b>Şef Yardımcısı</b> (1100).</li><li>Bir bölümü ilk kez bitirince <b>8</b>, etabı bitirince <b>20</b>, konunun tamamını bitirince <b>40</b> puan kazanırsın.</li><li>Aynı bölümü yeniden çözmek puan vermez. Tekrar Çalışması’ndan çıkan her madde 1 puan getirir.</li><li>Soru oyunlarında doğru sayına göre bir turda en fazla <b>10</b> puan alırsın.</li><li>Rütben hiç düşmez. Yanlış yapmak puanını azaltmaz.</li></ul>'},
 {id:'oda',t:'Birlikte Oynayalım',h:'<ul><li><b>1’e 1 Kapışma:</b> İki kişi aynı soruya aynı anda bakar. Önce doğru basan puanı alır.</li><li><b>Er Meydanı:</b> 3–10 kişi kendi hızında ilerler. Yedi yanlışta oyun biter.</li><li><b>Meydan Okuma:</b> Tek başına çalışırsın. İnternet gerekmez.</li><li>Oda kurmak ve odaya girmek için internet gerekir. Arkadaşını <b>Arkadaşlarım</b> bölümünden çağırabilirsin.</li></ul>'},
 {id:'ses',t:'Ses, müzik ve tema',h:'<ul><li>Üstteki <b>🔊</b> düğmesi sesli okumayı açar ve kapatır.</li><li>Türkçe ses, okuma hızı, müzik, tema ve <b>çerçeve rengi</b> için ana sayfadaki <b>⚙</b> düğmesine dokun.</li><li>Sesli okuma ve müzik aynı anda açık olmaz.</li></ul>'},
 {id:'sorun',t:'Sorun çözümü',h:'<ul><li><b>Eski görünüm geliyor / “Yeni sürüm hazır” yazısı çıktı:</b> <b>Güncelle</b> düğmesine dokun. Düğme çıkmazsa uygulamayı tamamen kapatıp yeniden aç.</li><li><b>Sesli okuma çalışmıyor:</b> Üstteki 🔊 düğmesinin açık olduğuna bak. Telefonda Türkçe ses yüklü olmalı (telefon ayarları → Metin okuma). Telefonun sesini aç.</li><li><b>İçerik yüklenemedi:</b> İnternetini kontrol edip biraz sonra yeniden dene.</li><li><b>Ana ekrana eklemek:</b> Tarayıcı menüsünden <b>Ana ekrana ekle</b>’ye dokun.</li></ul>'},
];
function kilavuzAc(bolum){if(st.screen!=='guide')KILAVUZ_DURUM.from=st.screen;KILAVUZ_DURUM.open=bolum||null;go('guide');}
function kilavuzHTML(){
 var h=topBar('Uygulama kılavuzu')+'<div class="wrap design-guide"><h1 class="design-page-title">Uygulama kılavuzu</h1><p class="sub">Bir başlığa dokun, açılsın.</p>';
 KILAVUZ.forEach(function(g){h+='<details class="card guide-item"'+(KILAVUZ_DURUM.open===g.id?' open':'')+'><summary>'+g.t+'</summary>'+g.h+'</details>';});
 return h+'</div>';
}
function kilavuzDugme(){return '<button type="button" class="design-all design-guide-btn" onclick="kilavuzAc()">Uygulama kılavuzu</button>';}
(function(){
 var oncekiRender=render;
 render=function(){
  if(st.screen==='guide'){if(typeof SES!=='undefined')SES.sira=[];document.getElementById('app').innerHTML=kilavuzHTML();return;}
  oncekiRender();
  if(st.screen==='welcome'||st.screen==='home'){var f=document.querySelector('.design-footer');if(f)f.insertAdjacentHTML('afterbegin',kilavuzDugme());else{var w=document.querySelector('.design-wrap');if(w)w.insertAdjacentHTML('beforeend','<footer class="design-footer">'+kilavuzDugme()+'</footer>');}}
 };
 var oncekiBack=back;
 back=function(){if(st.screen==='guide'){go(KILAVUZ_DURUM.from||'home');return;}oncekiBack();};
 render();
})();
