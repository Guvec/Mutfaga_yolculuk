/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Uygulama kılavuzu: öğrencinin uygulamayı tek başına kullanabilmesi için kısa açıklamalar.
   Ana sayfadan ve Tüm konular ekranından açılır. Bir başlığa dokununca açılır. */
'use strict';
var KILAVUZ_DURUM={from:'home',open:null};
var KILAVUZ=[
 {id:'ne',t:'Bu uygulama ne işe yarar?',h:'<p>Yiyecek ve içecek hizmetleri konularını <b>görerek, dinleyerek ve uygulayarak</b> öğrenirsin. Atölyede öğrendiklerini burada tekrar edersin.</p>'},
 {id:'basla',t:'Nasıl çalışırım?',h:'<ul><li>Ana sayfada <b>Mutfak Kitabım</b>a dokun ve bir konu seç.</li><li>Konuda <b>Yolculuğum</b>a dokun. Bölümleri sırayla çalışırsın.</li><li>Bir bölümü bitirince sıradaki bölüm açılır.</li><li>Kaldığın yerden devam etmek için ana sayfadaki <b>Devam et</b> düğmesine dokun.</li><li>Profil seçersen sonuçların bu cihazda saklanır. Misafir olarak çalışırsan sonuçların kaydedilmez.</li></ul>'},
 {id:'oda',t:'Birlikte Oynayalım',h:'<ul><li><b>1’e 1 Kapışma:</b> İki kişi aynı soruya aynı anda bakar. Önce doğru basan puanı alır.</li><li><b>Er Meydanı:</b> 3–10 kişi kendi hızında ilerler. Yedi yanlışta oyun biter.</li><li><b>Meydan Okuma:</b> Tek başına çalışırsın. İnternet gerekmez.</li><li>Oda kurmak ve odaya girmek için internet gerekir. Arkadaşını <b>Arkadaşlarım</b> bölümünden çağırabilirsin.</li></ul>'},
 {id:'ses',t:'Ses, müzik ve tema',h:'<ul><li>Üstteki <b>🔊</b> düğmesi sesli okumayı açar ve kapatır.</li><li>Türkçe ses, okuma hızı, müzik ve tema için ana sayfadaki <b>⚙</b> düğmesine dokun.</li><li>Sesli okuma ve müzik aynı anda açık olmaz.</li></ul>'},
 {id:'sorun',t:'Sorun çözümü',h:'<ul><li><b>Eski görünüm geliyor:</b> Üstte “Güncelle” yazısı çıkarsa dokun. Çıkmazsa uygulamayı kapatıp yeniden aç.</li><li><b>Ses gelmiyor:</b> Sesli okumanın açık olduğuna bak. Telefonda Türkçe ses yüklü olmayabilir; öğretmenine söyle.</li><li><b>İçerik yüklenemedi:</b> İnternetini kontrol edip yeniden dene.</li><li><b>Ana ekrana eklemek:</b> Tarayıcı menüsünden “Ana ekrana ekle”yi seç.</li></ul>'}
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
