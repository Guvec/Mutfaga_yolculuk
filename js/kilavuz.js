/* Uygulama kılavuzu: öğrencinin uygulamayı tek başına kullanabilmesi için kısa açıklamalar.
   Ana sayfadan ve Tüm konular ekranından açılır. Bir başlığa dokununca açılır. */
'use strict';
var KILAVUZ_DURUM={from:'home',open:null};
var KILAVUZ=[
 {id:'ne',t:'Bu uygulama ne işe yarar?',h:'<p>Yiyecek ve içecek hizmetleri konularını <b>görerek, dinleyerek ve uygulayarak</b> öğrenirsin.</p><p>Her konuda üç aşama vardır:</p><ul><li><b>Öğreniyorum:</b> Yanlış yaparsan ipucu alırsın ve yeniden denersin.</li><li><b>Uyguluyorum:</b> İpucu yoktur. Bildiğini kendi başına gösterirsin.</li><li><b>Pekiştiriyorum:</b> Yanlış yaptıklarını yeniden çalışırsın. Bu bölüm hazırlanıyor.</li></ul>'},
 {id:'profil',t:'Profil ve misafir',h:'<ul><li><b>Profil:</b> Adını yazıp profil açarsın. Sonuçların bu telefonda saklanır.</li><li><b>Misafir:</b> Profil açmadan çalışırsın. Sonuçların kaydedilmez.</li><li><b>Çalışma geçmişim:</b> Son 14 günün sonuçlarını gösterir.</li><li>Sonuçlar yalnız bu telefonda durur. Tarayıcı verileri silinirse kaybolur.</li></ul>'},
 {id:'konu',t:'Konu seçme',h:'<ul><li>Ana sayfada bir konu kartına dokun.</li><li>Bütün konuları görmek için <b>Tüm konular</b> düğmesine dokun.</li><li>Tüm konular ekranında <b>Konu ara</b> kutusuna konunun adını yazarak arayabilirsin.</li><li>“Hazırlanıyor” yazan konular henüz açılmadı.</li></ul>'},
 {id:'esles',t:'Eşleştirme nasıl yapılır?',h:'<ul><li>Ekranda <b>12 görsel ve 18 ad</b> vardır. 6 adın görseli yoktur.</li><li>Önce bir görsele dokun, sonra o görselin adına dokun. İstersen önce adı, sonra görseli seçebilirsin.</li><li>Görseli büyütmek için köşesindeki <b>⤢</b> düğmesine dokun.</li><li><b>Öğreniyorum:</b> Yanlış eşleştirirsen ipucu çıkar. İkinci kez yanlış yaparsan doğru ad gösterilir.</li><li><b>Uyguluyorum:</b> Bütün görselleri eşleştir, sonra <b>Yanıtları kontrol et</b> düğmesine dokun. Doğru ve yanlışlarını sonunda görürsün.</li></ul>'},
 {id:'soru',t:'Çoktan seçmeli sorular',h:'<ul><li>Her soruda dört seçenek vardır. Doğru olana dokun.</li><li><b>Öğreniyorum:</b> Yanlış yaparsan ipucu çıkar ve bir kez daha denersin.</li><li><b>Uyguluyorum:</b> Her soruya bir kez yanıt verirsin. Açıklamalar çalışma bitince açılır.</li></ul>'},
 {id:'kuver',t:'Kuver',h:'<ul><li><b>Kuveri Kur:</b> Kuver parçasını masadaki doğru yere koyarsın. Basit kuver ve tabldot kuver vardır.</li><li><b>Adını Bul:</b> Masada işaretlenen parçanın adını seçersin.</li><li>Ekranda doğru yer seçmek, atölyede kuver açmayı öğrenmenin yerini tutmaz. Atölyede gerçek takımlarla da çalışırsın.</li></ul>'},
 {id:'puan',t:'Puan, mola ve rapor',h:'<ul><li>İlk denemede doğru yanıt: <b>10 puan</b>.</li><li>Öğreniyorum bölümünde ikinci denemede doğru yanıt: <b>5 puan</b>.</li><li>Her çalışmada <b>1 mola hakkın</b> vardır. Mola sırasında süre durur.</li><li>Çalışma bitince <b>Raporu Gör</b> düğmesiyle sonuçlarını incelersin.</li></ul>'},
 {id:'oda',t:'Birlikte Oynayalım',h:'<p><b>Öğretmen:</b> Oda oluşturur, konuyu ve takımı seçer. Oda kodunu ya da davet bağlantısını öğrencilere verir. Herkes gelince yarışı başlatır.</p><p><b>Öğrenci:</b></p><ul><li><b>Odaya katıl</b> düğmesine dokun.</li><li>Öğrenci kodunu yaz (örnek: A07). Gerçek adını ve soyadını yazma.</li><li>8 karakterli oda kodunu yaz.</li><li>Öğretmen başlatınca çalışma açılır. Bu bölümde ipucu yoktur.</li><li>Bitirince kimlerin bitirdiğini görürsün. <b>Herkes bitirince</b> sıralama ve puanlar açılır.</li><li>Doğru sayısı eşit olanlar aynı sırayı paylaşır. Süre sırayı değiştirmez.</li><li>Bu bölüm için internet gerekir. Oda kodu 24 saat geçerlidir.</li></ul>'},
 {id:'ses',t:'Sesli okuma, müzik ve tema',h:'<ul><li><b>Sesli okuma:</b> Açıkken yazıların yanındaki <b>🔊</b> düğmesine dokununca yazı okunur. Ses telefonun kendi sesidir.</li><li><b>Ses ayarları:</b> Türkçe sesi ve okuma hızını buradan seçebilirsin.</li><li><b>Müzik:</b> Ekrana ilk dokunduğunda sakin piyano müziği başlar. Müzik ve sesli okuma aynı anda açık olmaz. Müzik açıkken eşleştirmede bir ada dokunursan ad yine okunur.</li><li>Müziği kapatırsan, uygulama bunu hatırlar.</li><li><b>Tema:</b> Düğmeye her dokunuşta Açık, Sepya ve Gece sırayla değişir. Sepya, ekranı sıcak krem renkle gösterir. Gece, ekranı koyu renge çevirir. Seçimin hatırlanır.</li></ul>'},
 {id:'geri',t:'Telefonun geri tuşu',h:'<ul><li>Telefonun geri tuşu, uygulamadaki <b>← Geri</b> düğmesi gibi çalışır.</li><li>Açık bir pencere varsa önce pencereyi kapatır.</li><li>Ana sayfada geri tuşuna basarsan uygulamadan çıkmak isteyip istemediğin sorulur.</li><li>Birlikte Oynayalım sırasında geri tuşu, odadan ayrılmak isteyip istemediğini sorar.</li></ul>'},
 {id:'sorun',t:'Sorun çözümü',h:'<ul><li><b>Eski görünüm geliyor:</b> Uygulamayı tamamen kapatıp yeniden aç.</li><li><b>Ses gelmiyor:</b> Sesli okumanın açık olduğuna bak. Telefonun ayarlarında Türkçe sesin yüklü olması gerekir; öğretmenine söyle.</li><li><b>Müzik çalmıyor:</b> Ekrana bir kez dokun. Sesli okuma açıksa müzik kapalıdır.</li><li><b>İçerik yüklenemedi:</b> İnternetini kontrol edip <b>Yeniden Dene</b> düğmesine dokun.</li><li><b>Odaya giremiyorum:</b> İnternetin açık mı, oda kodu doğru mu, yarış başlamadı mı kontrol et.</li><li><b>Ana ekrana eklemek:</b> Tarayıcının menüsünden “Ana ekrana ekle”yi seç.</li></ul>'}
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
  if(st.screen==='topics'){var g=document.querySelector('.design-topics-page');if(g)g.insertAdjacentHTML('beforeend','<footer class="design-footer">'+kilavuzDugme()+'</footer>');}
 };
 var oncekiBack=back;
 back=function(){if(st.screen==='guide'){go(KILAVUZ_DURUM.from||'home');return;}oncekiBack();};
 render();
})();
