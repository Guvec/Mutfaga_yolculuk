/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Lezzetleri Keşfet (Aşçı Dostum). Ürünler, tamamlanan bölüm sayısıyla açılır (Mutfak Araçları + Baharat toplamı).
   Puan toplamaya bağlı değildir; bitirilen bölüm geri alınmaz, açılan lezzet sende kalır.
   Fotoğraflar assets/lezzet/<id>.webp dosyasından gelir; dosya yoksa emoji gösterilir. */
'use strict';
const LEZZET_AYAR={baslangic:4,tezgah:3};
const LEZZET=[
 {id:'elma',ad:'Elma',tur:'Meyve',e:'🍎'},{id:'sut',ad:'Süt',tur:'Süt ürünü',e:'🥛'},{id:'yogurt',ad:'Yoğurt',tur:'Süt ürünü',e:'🥣'},{id:'cilek',ad:'Çilek',tur:'Meyve',e:'🍓'},
 {id:'armut',ad:'Armut',tur:'Meyve',e:'🍐'},{id:'karpuz',ad:'Karpuz',tur:'Meyve',e:'🍉'},{id:'domates',ad:'Domates',tur:'Sebze',e:'🍅'},{id:'havuc',ad:'Havuç',tur:'Sebze',e:'🥕'},
 {id:'ekmek',ad:'Ekmek',tur:'Tahıl ürünü',e:'🍞'},{id:'yumurta',ad:'Yumurta',tur:'Yumurta',e:'🥚'},{id:'peynir',ad:'Peynir',tur:'Süt ürünü',e:'🧀'},{id:'portakal',ad:'Portakal',tur:'Meyve',e:'🍊'},
 {id:'salatalik',ad:'Salatalık',tur:'Sebze',e:'🥒'},{id:'patates',ad:'Patates',tur:'Sebze',e:'🥔'},{id:'pirinc',ad:'Pirinç',tur:'Tahıl ürünü',e:'🍚'},{id:'makarna',ad:'Makarna',tur:'Tahıl ürünü',e:'🍝'},
 {id:'mercimek',ad:'Mercimek',tur:'Baklagil',e:'🫘'},{id:'muz',ad:'Muz',tur:'Meyve',e:'🍌'},{id:'uzum',ad:'Üzüm',tur:'Meyve',e:'🍇'},{id:'biber',ad:'Biber',tur:'Sebze',e:'🫑'},
 {id:'sogan',ad:'Soğan',tur:'Sebze',e:'🧅'},{id:'bal',ad:'Bal',tur:'Doğal tatlandırıcı',e:'🍯'},{id:'zeytin',ad:'Zeytin',tur:'Zeytin ürünü',e:'🫒'},{id:'limon',ad:'Limon',tur:'Meyve',e:'🍋'}
];
const LZ={sekme:'acik'};
function lzKey(){return st.guest?'misafir':(st.prof||'misafir');}
/* Tamamlanan bölüm sayısı (etap sonları sayılmaz). Kayıt yalnız bu cihazdaki profilden okunur. */
function lzBolumSayisi(){
 let n=0;
 for(const k of ['ma','bh']){const a=ls('yol_'+k,{})||{},s=a[lzKey()]||{};n+=Object.keys(s.done||{}).filter(x=>/^e\d+b\d+$/.test(x)).length;}
 return n;
}
function lzAcikSayi(n){return Math.min(LEZZET.length,LEZZET_AYAR.baslangic+(n===undefined?lzBolumSayisi():n));}
/* Bir bölüm bitince yeni açılan lezzet (yoksa null). yolTamamla çağırır. */
function lezzetYeni(){const n=lzBolumSayisi(),i=LEZZET_AYAR.baslangic+n-1;return i>=LEZZET_AYAR.baslangic&&i<LEZZET.length?LEZZET[i]:null;}
function lzTezgah(){const a=ls('lezzet_tezgah',{})||{};return (a[lzKey()]||[]).filter(id=>LEZZET.some(x=>x.id===id));}
function lzTezgahYaz(l){const a=ls('lezzet_tezgah',{})||{};a[lzKey()]=l;lsSet('lezzet_tezgah',a);}
function lzFoto(x,cls){return '<span class="'+(cls||'lz-foto')+'" aria-hidden="true"><img src="assets/lezzet/'+x.id+'.webp" alt="" loading="lazy" onerror="this.parentNode.classList.add(\'yok\');this.remove()"><span class="lz-emoji">'+x.e+'</span></span>';}
window.lezzetSoyle=function(id){const x=LEZZET.find(y=>y.id===id);if(x&&typeof yolSoyle==='function')yolSoyle(x.ad+'. '+x.tur+'.');};
window.lezzetSekme=function(s){LZ.sekme=s;render();};
window.lezzetKoy=function(id){
 const l=lzTezgah();
 if(l.includes(id)){lzTezgahYaz(l.filter(x=>x!==id));render();return;}
 if(l.length>=LEZZET_AYAR.tezgah){LZ.mesaj='Tezgâh dolu. Önce birini tezgâhtan al.';render();return;}
 LZ.mesaj='';l.push(id);lzTezgahYaz(l);
 const x=LEZZET.find(y=>y.id===id);if(x&&typeof yolSoyle==='function'&&SES.acik)yolSoyle(x.ad+' tezgâhta.');
 render();
};
function lzDost(){
 const r=ls('ana_dost','panda')==='rabbit';
 return r?'<span class="lz-dost lz-dost-e" aria-hidden="true">🐰</span>':'<img class="lz-dost" src="assets/ana-ekran/panda-seffaf.png" alt="" width="313" height="238">';
}
function lezzetHTML(){
 const n=lzBolumSayisi(),acik=lzAcikSayi(n),tez=lzTezgah(),sek=LZ.sekme;
 const liste=sek==='acik'?LEZZET.slice(0,acik):LEZZET.slice(acik);
 let h=yolBar('Lezzetleri Keşfet','Bir lezzet seç, tezgâha koy.','back()',false)+'<div class="yol-sayfa lz-sayfa"><div class="lz-sekme" role="tablist"><button type="button" role="tab" aria-selected="'+(sek==='acik')+'" class="'+(sek==='acik'?'on':'')+'" onclick="lezzetSekme(\'acik\')">Açılanlar ('+acik+')</button><button type="button" role="tab" aria-selected="'+(sek!=='acik')+'" class="'+(sek!=='acik'?'on':'')+'" onclick="lezzetSekme(\'yeni\')">Yeni lezzetler ('+(LEZZET.length-acik)+')</button></div>';
 h+='<section class="yol-kart lz-tezgah" aria-label="Tezgâhım"><h2>Tezgâhım</h2><div class="lz-tez-satir">'+lzDost()+'<div class="lz-tez-raf">'+(tez.length?tez.map(id=>{const x=LEZZET.find(y=>y.id===id);return '<button type="button" class="lz-tez-oge" onclick="lezzetKoy(\''+id+'\')" aria-label="'+esc(x.ad)+', tezgâhtan al">'+lzFoto(x,'lz-foto kucuk')+'<b>'+esc(x.ad)+'</b><small>Tezgâhtan al</small></button>';}).join(''):'<p class="lz-bos">Henüz bir şey yok. Bir lezzeti tezgâha koy.</p>')+'</div></div><p class="lz-konus" role="status">'+esc(LZ.mesaj||(tez.length?'Tezgâhta: '+tez.map(id=>LEZZET.find(y=>y.id===id).ad).join(', ')+'.':'Bir lezzet seç, tezgâha koy.'))+'</p></section>';
 if(!liste.length)h+='<p class="yol-kart">'+(sek==='acik'?'Henüz açılan lezzet yok.':'Bütün lezzetleri açtın. Tebrikler!')+'</p>';
 h+='<div class="lz-izgara">'+liste.map((x,i)=>{
  const idx=LEZZET.indexOf(x);
  if(idx>=acik){const kalan=idx-acik+1;return '<div class="lz-kart kilit" aria-label="'+esc(x.ad)+', kilitli">'+lzFoto(x)+'<b>'+esc(x.ad)+'</b><span class="lz-kilit">🔒 '+kalan+' bölüm daha bitirince açılır</span></div>';}
  const var_=tez.includes(x.id);
  return '<div class="lz-kart"><button type="button" class="lz-dinle" onclick="lezzetSoyle(\''+x.id+'\')" aria-label="'+esc(x.ad)+', '+esc(x.tur)+'. Dinle">'+lzFoto(x)+'<b>'+esc(x.ad)+'</b><small>'+esc(x.tur)+'</small></button><button type="button" class="yol-btn'+(var_?' ikinci':'')+' lz-koy" onclick="lezzetKoy(\''+x.id+'\')">'+(var_?'✓ Tezgâhta':'Tezgâha koy')+'</button></div>';
 }).join('')+'</div><p class="yol-not lz-not">Açtığın lezzetler sende kalır. Mutfak Araçları ve Baharat bölümlerini bitirdikçe yeni lezzetler açılır.</p></div>';
 return h;
}
(function(){
 const R=render,B=back;
 render=function(){
  if(st.screen==='lezzet'){if(typeof GIRIS!=='undefined'&&GIRIS.dur)GIRIS.dur();document.getElementById('app').innerHTML=lezzetHTML();document.body.dataset.screen='lezzet';return;}
  R();
 };
 back=function(){if(st.screen==='lezzet'){go('giris');return;}B();};
})();
