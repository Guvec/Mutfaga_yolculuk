/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Sıralama: açılır menüler yerine konu düğmeleri; uzun açıklama tek satır. */
'use strict';
{const O=rkBoardHTML;rkBoardHTML=function(){
 let h=O.apply(this,arguments);
 const v=RK.view,b=rkBoard(v.board)||RK_BOARDS.find(x=>!x.gizli);if(!b)return h;
 const konular=Object.keys(RK_SUBJECT_NAMES).filter(s=>RK_BOARDS.some(x=>x.subject===s&&!x.gizli));
 h=h.replace(/<label>Konu <select[\s\S]*?<\/select><\/label>/,'<div class="sk-konular" role="group" aria-label="Konu">'+konular.map(s=>'<button type="button" class="sk-konu'+(s===b.subject?' on':'')+'" aria-pressed="'+(s===b.subject)+'" onclick="rkPickSubject(\''+s+'\')">'+esc(RK_SUBJECT_NAMES[s])+'</button>').join('')+'</div>');
 h=h.replace('<label>Çalışma <select','<label class="sk-calisma"><span>Çalışma</span><select');
 h=h.replace(/<h2 class="rk-title">[\s\S]*?<\/p>/,'<p class="sk-not">'+(v.period==='hafta'?'📅 '+rkWeekLabel(v.week||rkWeekNo())+' · ':'📚 Eğitim yılı · ')+(b.kind==='win'?'kazanılan sayı':'en iyi doğru sayısı')+'</p>');
 return h;
};}
