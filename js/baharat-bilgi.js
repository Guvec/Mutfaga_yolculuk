/* Bağımsız eşleştirme bitince açılan, puanlanmayan kısa ürün bilgileri. */
'use strict';
let spiceReviewIndex=0;
function spiceReviewReady(){return st.subject==='baharat'&&st.op==='match'&&st.practice==='check'&&st.board&&st.board.checked&&st.kDone;}
function openSpiceReview(){
 if(!spiceReviewReady())return;
 sesSus();spiceReviewIndex=0;st.screen='spicereview';render();window.scrollTo(0,0);spiceReviewFocus();
}
function spiceReviewFocus(){const title=document.getElementById('spiceProductTitle');if(title)title.focus({preventScroll:true});}
function spiceReviewMove(delta){
 if(!spiceReviewReady()||st.screen!=='spicereview')return;
 sesSus();spiceReviewIndex=Math.max(0,Math.min(st.board.items.length-1,spiceReviewIndex+delta));render();window.scrollTo(0,0);spiceReviewFocus();
}
function closeSpiceReview(report){
 if(!spiceReviewReady())return;
 sesSus();if(report){finish();}else{st.screen='board';render();window.scrollTo(0,0);}
}
function spiceReviewHTML(){
 const b=st.board,it=b.items[spiceReviewIndex],chosen=b.pair[it.id],last=spiceReviewIndex===b.items.length-1;
 return topBar('Ürünleri tanı').replace('back()','closeSpiceReview(false)')+'<div class="wrap"><h1 id="spiceReviewTitle" tabindex="-1">Kısa ürün bilgisi</h1><p>Yanıtların kontrol edildi. Şimdi ürünleri tanı. Bu bölüm puanını değiştirmez.</p><p class="chip">'+(spiceReviewIndex+1)+' / '+b.items.length+'</p><article class="card" aria-labelledby="spiceProductTitle"><img src="'+esc(it.image)+'" alt="'+esc(it.answer)+'" style="display:block;width:100%;max-width:320px;height:auto;margin:0 auto"><h2 id="spiceProductTitle" tabindex="-1">'+esc(it.answer)+'</h2><p class="spice-fact">'+esc(it.explanation)+'</p><p>Senin seçtiğin ad: '+esc(chosen)+'</p>'+sesDugme(it.answer+'. '+it.explanation,'Bilgiyi dinle').replace('class="spk"','class="btn"').replace('🔊','Bilgiyi dinle')+'<button class="btn" onclick="sesSus()">Sesi durdur</button>'+'</article><div class="row"><button class="btn" onclick="spiceReviewMove(-1)"'+(spiceReviewIndex===0?' disabled':'')+'>Önceki ürün</button>'+(last?'<button class="btn pri" onclick="closeSpiceReview(true)">Sonucumu gör</button>':'<button class="btn pri" onclick="spiceReviewMove(1)">Sonraki ürün</button>')+'</div><p><button class="btn" onclick="closeSpiceReview(false)">Eşleştirmelere dön</button></p></div>';
}
const SPICE_INFO_CHECK=checkBoard,SPICE_INFO_RENDER=render,SPICE_INFO_BOARD=boardHTML,SPICE_INFO_BACK=back;
checkBoard=function(){const eligible=st.subject==='baharat'&&st.practice==='check'&&st.board&&!st.board.checked;SPICE_INFO_CHECK();if(eligible&&spiceReviewReady())openSpiceReview();};
boardHTML=function(){let html=SPICE_INFO_BOARD();if(spiceReviewReady())html=html.replace('<div class="wrap board-wrap">','<div class="wrap board-wrap"><p class="card"><button class="btn pri" onclick="openSpiceReview()">Kısa ürün bilgilerini oku</button></p>');return html;};
back=function(){if(st.screen==='spicereview'){closeSpiceReview(false);return;}SPICE_INFO_BACK();};
render=function(){
 if(st.screen==='spicereview'){
  if(!spiceReviewReady()){st.screen='board';SPICE_INFO_RENDER();return;}
  if(typeof SES!=='undefined')SES.sira=[];
  document.getElementById('app').innerHTML=spiceReviewHTML();return;
 }
 SPICE_INFO_RENDER();
};
