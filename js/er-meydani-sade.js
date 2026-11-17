/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* 14.11 akşam (onaylı yapı): Er Meydanı kur ve oyun ekranı sade.
   Kur: üstteki sıralama kutusu kalktı (Ustalar Ligi'nde 🏅 var); kurallar üç kısa çip. Oyun: tek satır durum çubuğu
   (puan · yanlış · soru · 🏅 sıra), süre çubuğun içinde, canlı sıralama alt pencerede, "Sıradaki soru" ekranın altında sabit. */
'use strict';
{const O=yrCreateHTML;yrCreateHTML=function(){
 let h=O.apply(this,arguments);if(YR.cfg.mode!=='arena')return h;
 h=h.replace(/<h1>Er Meydanı<\/h1>[\s\S]*?<h2>Konu<\/h2>/,'<h2>Konu</h2>');
 h=h.replace(/<p>150 soruya kadar[\s\S]*?en az 12 saniye olur\.<\/p>/,'<ul class="em-kural"><li><b>150</b><small>soruya kadar</small></li><li><b>12</b><small>yanlışta biter</small></li><li><b>20→12</b><small>saniye</small></li></ul><p class="em-not">3–10 kişi · herkes kendi hızında · Ümit Ligi maçı: Tecrübe Puanı kazandırır, lig puanı vermez. Her 6 doğruda süre 1 saniye kısalır.</p>');
 return h;
};}
window.emSiraAc=function(){
 const k=document.createElement('div');k.id='snPanel';k.className='foot-menu';k.setAttribute('role','dialog');k.setAttribute('aria-modal','true');k.setAttribute('aria-label','Canlı sıralama');
 k.innerHTML='<div class="foot-menu-ic sn-panel"><h2>🏅 Canlı sıralama</h2><div class="sn-panel-govde">'+arScoreHTML()+'</div><button type="button" class="btn pri" id="snKapat">Oyuna dön</button></div>';
 document.body.appendChild(k);const kapat=()=>k.remove();k.addEventListener('click',e=>{if(e.target===k)kapat();});k.querySelector('#snKapat').onclick=kapat;
};
{const O=arPlayHTML;arPlayHTML=function(){
 let h=O.apply(this,arguments);
 const rows=arRanks().filter(p=>!p.left),me=rows.find(p=>p.uid===yrMe());
 h=h.replace(/<span>Yanlış: (\d+) \/ (\d+)<\/span>/,'<span class="em-yanlis" aria-label="Yanlış $1 / $2">✖ $1/$2</span>');
 h=h.replace(/<span>Soru (\d+) \/ (\d+)<\/span><\/div>/,'<span class="em-soru">Soru $1</span><button type="button" class="em-sira" onclick="emSiraAc()" aria-label="Canlı sıralama">🏅 '+(me?me.rank+'/'+rows.length:'—')+'</button></div>');
 h=h.replace(/<details class="ar-score">[\s\S]*?<\/details>/,'<div id="arRank" hidden></div>');
 h=h.replace('<div class="yr-bar" aria-hidden="true"><div class="yr-fill" id="yrFill"></div></div><p class="yr-sec" id="yrSec">','<div class="em-sure"><div class="yr-bar" aria-hidden="true"><div class="yr-fill" id="yrFill"></div></div><p class="yr-sec" id="yrSec">');
 h=h.replace(/(<p class="yr-sec" id="yrSec">[^<]*<\/p>)/,'$1</div>');
 /* Sıra HUD'da; alttaki satırda yalnız hedef kalır. Geri bildirim sorunun üstünde, görünür yerde. */
 h=h.replace(/<p class="ar-sira" role="status">Sıran: <b>[^<]*<\/b>(?: · Podyuma 1 adım kaldı!)?/,'<p class="ar-sira" role="status">');
 const fb=h.match(/<div class="ar-feedback" role="status">[\s\S]*?<\/div>/);
 if(fb){h=h.replace(fb[0],'');h=h.replace('<div class="em-sure">',fb[0]+'<div class="em-sure">');}
 return h;
};}
