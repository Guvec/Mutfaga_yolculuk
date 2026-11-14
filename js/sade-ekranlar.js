/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* 14.11 akşam (onaylı yapı): Rütbe Yolu ve Sıralama tek ekran.
   Rütbe: şimdiki rütbe büyük; 5 rütbe yatay şeritte küçük rozet; Rozetlerim dokununca açılır.
   Sıralama: açılır menüler yerine konu düğmeleri; uzun açıklama tek satır. */
'use strict';
{const O=rutbeHTML;rutbeHTML=function(){
 let h=O.apply(this,arguments);
 h=h.replace(/<ol class="ry-yol">([\s\S]*?)<\/ol>/,(m,ic)=>'<ol class="ry-yol ry-serit">'+ic.replace(/ class="card ry-/g,' class="ry-')+'</ol>');
 const i=h.indexOf('<h2 class="ry-bas">Rozetlerim</h2>');
 if(i>=0){const son=h.lastIndexOf('</div>');const govde=h.slice(i+'<h2 class="ry-bas">Rozetlerim</h2>'.length,son);const top=(govde.match(/ry-roz-ok/g)||[]).length,hep=(govde.match(/class="card ry-roz/g)||[]).length;
  h=h.slice(0,i)+'<details class="ry-rozetler"><summary><span aria-hidden="true">🏅</span><b>Rozetlerim</b><span class="ay-deger">'+top+' / '+hep+'</span><span class="ay-ok" aria-hidden="true">›</span></summary>'+govde+'</details>'+h.slice(son);}
 return h;
};}
{const O=rkBoardHTML;rkBoardHTML=function(){
 let h=O.apply(this,arguments);
 const v=RK.view,b=rkBoard(v.board)||RK_BOARDS.find(x=>!x.gizli);if(!b)return h;
 const konular=Object.keys(RK_SUBJECT_NAMES).filter(s=>RK_BOARDS.some(x=>x.subject===s&&!x.gizli));
 h=h.replace(/<label>Konu <select[\s\S]*?<\/select><\/label>/,'<div class="sk-konular" role="group" aria-label="Konu">'+konular.map(s=>'<button type="button" class="sk-konu'+(s===b.subject?' on':'')+'" aria-pressed="'+(s===b.subject)+'" onclick="rkPickSubject(\''+s+'\')">'+esc(RK_SUBJECT_NAMES[s])+'</button>').join('')+'</div>');
 h=h.replace('<label>Çalışma <select','<label class="sk-calisma"><span>Çalışma</span><select');
 h=h.replace(/<h2 class="rk-title">[\s\S]*?<\/p>/,'<p class="sk-not">'+(v.period==='hafta'?'📅 '+rkWeekLabel(v.week||rkWeekNo())+' · ':'📚 Eğitim yılı · ')+(b.kind==='win'?'kazanılan sayı':'en iyi doğru sayısı')+'</p>');
 return h;
};}
