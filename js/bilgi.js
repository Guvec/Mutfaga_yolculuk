/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* "Biliyor muydun?" bilgi kutuları. Bölüm bitiş ve sonuç ekranlarında, sırayla bir kutu gösterilir.
   Metinler özgündür; hiçbir kitaptan alıntı değildir. Rivayet olan bilgiler açıkça rivayet diye verilir.
   Kutu yalnız o ekranda görünür; puanı, kilidi ve ilerlemeyi etkilemez. */
'use strict';
const BILGI_KUTU=[
 {id:'catal',konu:'mutfak-araclari',baslik:'Çatal sofraya geç geldi',
  metin:'Kaşık ve bıçak binlerce yıllıktır. Çatal ise sofralara çok sonra girdi: 11. yüzyılda Bizans’tan İtalya’ya geçti. Avrupa’nın kuzeyinde yaygınlaşması 18. yüzyılı buldu. Yani kuver kurarken koyduğun çatal, kaşığın yanında hâlâ yeni sayılır.'},
 {id:'duduklu',konu:'mutfak-araclari',baslik:'Düdüklü tencere suyu 100 derecenin üstüne çıkarır',
  metin:'Açık tencerede su 100 °C’de kaynar ve daha fazla ısınmaz. Düdüklü tencere buharı içeride tutup basıncı artırdığı için su yaklaşık 120 °C’ye kadar çıkabilir. Kuru fasulyenin ve etin bu tencerede daha çabuk pişmesinin nedeni budur.'},
 {id:'safran',konu:'baharat',baslik:'Bir gram safran için yüzlerce çiçek',
  metin:'Safran, çiğdem çiçeğinin içindeki üç kırmızı tepecikten elde edilir. Her çiçekte yalnız üç tane vardır ve hepsi elle toplanır. Bir gram safran için yaklaşık 150 çiçek gerekir. Dünyanın en pahalı baharatı olmasının nedeni budur.'},
 {id:'bulasik-su',konu:'bulasik-makinesi-temizligi',baslik:'Makine, musluktan daha az su harcar',
  metin:'Tam dolu çalışan bir bulaşık makinesi bir yıkamada yaklaşık 15 litre su kullanır. Aynı bulaşığı musluk açık bırakılarak elde yıkamak çok daha fazla su harcar. Makineyi yarı dolu çalıştırmak bu kazancı yok eder.'},
 {id:'cam',konu:'bulasik-makinesi-temizligi',baslik:'Cam yorulmaz',
  metin:'Cam eritilip yeniden cam yapılabilir; bu işlem tekrarlandığında camın kalitesi düşmez. Attığın bir kavanoz, yeni bir kavanoz olarak geri gelebilir. Bu yüzden cam atığı ayrı kutuya koymak gerçekten işe yarar.'},
 {id:'kahve-kesif',konu:'genel',baslik:'Kahveyi keçiler mi buldu?',
  metin:'Rivayete göre Habeşistan’da Kaldi adlı bir çoban, kırmızı meyveleri yiyen keçilerinin akşama kadar uyumadığını görür ve meyveyi tanır. Rivayetin doğruluğu bilinmiyor; bilinen şu: kahve içecek olarak önce Yemen’de yaygınlaştı, oradan Mekke, Kahire ve Şam’a ulaştı.'},
 {id:'kahve-avrupa',konu:'genel',baslik:'Kahve Avrupa’ya İstanbul’dan gitti',
  metin:'Tarihçi Peçevi, İstanbul’daki ilk kahvehaneleri 1554’te Halepli Hakem ile Şamlı Şems’in Tahtakale’de açtığını yazar. 1669’da Paris’e elçi giden Süleyman Ağa kahveyi Fransız sarayına tanıttı. 1683 Viyana Kuşatması’ndan sonra geride kalan kahve çuvallarının şehirdeki kahvehane kültürünü başlattığı anlatılır.'}
];
function bilgiAnahtar(){return st.guest?'misafir':(st.prof||'misafir');}
function bilgiSira(){const a=ls('bilgi_sira',{})||{};return a[bilgiAnahtar()]|0;}
function bilgiSiraYaz(n){const a=ls('bilgi_sira',{})||{};a[bilgiAnahtar()]=n;lsSet('bilgi_sira',a);}
/* Önce o konunun kutuları, sonra genel kutular. Her gösterimde sıradaki kutu gelir. */
function bilgiSec(konu){
 const havuz=BILGI_KUTU.filter(b=>b.konu===konu).concat(BILGI_KUTU.filter(b=>b.konu==='genel'));
 const liste=havuz.length?havuz:BILGI_KUTU;
 const i=bilgiSira()%liste.length;
 return {kutu:liste[i],sonraki:bilgiSira()+1};
}
function bilgiHTML(b){
 const oku=b.baslik+'. '+b.metin;
 return '<section class="card bilgi-kutu" aria-label="Biliyor muydun"><h2>Biliyor muydun?'+(typeof sesDugme==='function'?' '+sesDugme(oku,'Bilgiyi dinle'):'')+'</h2><h3>'+esc(b.baslik)+'</h3><p>'+esc(b.metin)+'</p></section>';
}
const BILGI={anahtar:null,kutu:null};
function bilgiYerlestir(){
 const app=document.getElementById('app');if(!app)return;
 let hedef=null,anahtar=null,konu=st.subject;
 if(st.screen==='yolplay'&&typeof Y!=='undefined'&&Y&&Y.phase==='bitti'){
  hedef=app.querySelector('.yol-sayfa');anahtar='yol|'+(Y.node&&Y.node.id)+'|'+(Y.tohum||'');
  if(typeof YOL_AYAR!=='undefined'&&YOL_AYAR.subject)konu=YOL_AYAR.subject; /* Yolculuğum'da konu YOL_AYAR'dan okunur */
 }else if(st.screen==='summary'){
  hedef=app.querySelector('.rep')||app.querySelector('.wrap');anahtar='ozet|'+(st.sess&&st.sess.id);
 }
 if(!hedef||app.querySelector('.bilgi-kutu'))return;
 /* Kutu, ekranın sonundaki düğmelerden önce durur ki öğrenci çıkmadan görsün. */
 const dugmeler=hedef.querySelector('.yol-alt');
 if(BILGI.anahtar!==anahtar||!BILGI.kutu){
  const s=bilgiSec(konu);BILGI.kutu=s.kutu;BILGI.anahtar=anahtar;bilgiSiraYaz(s.sonraki);
 }
 if(dugmeler)dugmeler.insertAdjacentHTML('beforebegin',bilgiHTML(BILGI.kutu));
 else hedef.insertAdjacentHTML('beforeend',bilgiHTML(BILGI.kutu));
}
const BILGI_RENDER=render;
render=function(){const r=BILGI_RENDER.apply(this,arguments);try{bilgiYerlestir();}catch(e){}return r;};
