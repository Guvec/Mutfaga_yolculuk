/* Same twelve-card session and answer order, readable pages on small screens. */
'use strict';
var ARAC_VIEW={page:0,namePage:0};
function aracSmall(){return window.matchMedia('(max-width:759px), (max-height:500px)').matches;}
function aracPageSize(){return aracSmall()?1:6;}
function aracGoPage(delta){
 if(st.screen!=='board'||st.modalOpen||st.inBreak||PHONE.open)return;
 const pages=Math.ceil(st.board.items.length/aracPageSize());
 ARAC_VIEW.page=Math.max(0,Math.min(pages-1,ARAC_VIEW.page+delta));
 st.board.sel=null;st.board.selName=null;st.lastRes=null;render();
 const first=document.querySelector('.bimg:not([hidden]) .bimg-btn');if(first)first.focus({preventScroll:true});
}
function aracNamePage(delta){
 const pages=Math.ceil(st.board.names.length/6);
 ARAC_VIEW.namePage=Math.max(0,Math.min(pages-1,ARAC_VIEW.namePage+delta));render();
 const first=document.querySelector('#phoneNameSheet .bname:not([hidden]):not(:disabled)');if(first)first.focus({preventScroll:true});
}
const ARAC_START=startBoard;
startBoard=function(){ARAC_VIEW.page=0;ARAC_VIEW.namePage=0;return ARAC_START.apply(this,arguments);};
const ARAC_OPEN_NAMES=phoneOpenNames;
phoneOpenNames=function(){ARAC_VIEW.namePage=0;return ARAC_OPEN_NAMES();};
const ARAC_TAP_IMG=tapImg;
tapImg=function(id){ARAC_VIEW.namePage=0;return ARAC_TAP_IMG(id);};

function aracBoardDecorate(){
 const wrap=document.querySelector('.board-wrap');
 const active=st.screen==='board'&&st.subject==='mutfak-araclari'&&!!wrap;
 document.body.classList.toggle('arac-session',active);
 if(!active)return;
 wrap.classList.add('arac-board');
 const pictures=wrap.querySelector('.board-imgs'),side=wrap.querySelector('.board-side');
 const size=aracPageSize(),total=st.board.items.length,pages=Math.ceil(total/size);
 ARAC_VIEW.page=Math.min(ARAC_VIEW.page,pages-1);
 const start=ARAC_VIEW.page*size;
 const cards=[...pictures.children];
 cards.forEach((card,i)=>{card.hidden=i<start||i>=start+size;});
 const gallery=document.createElement('div');gallery.className='board-gallery';
 pictures.before(gallery);gallery.append(pictures);
 gallery.insertAdjacentHTML('beforeend','<nav class="board-pager" aria-label="Görsel sayfaları"><button class="btn" aria-label="Önceki görseller" onclick="aracGoPage(-1)"'+(ARAC_VIEW.page===0?' disabled':'')+'>← Önceki</button><span role="status">'+(size===1?'Görsel '+(start+1)+' / '+total:'Görseller '+(start+1)+'–'+Math.min(total,start+size)+' / '+total)+'</span><button class="btn" aria-label="Sonraki görseller" onclick="aracGoPage(1)"'+(ARAC_VIEW.page===pages-1?' disabled':'')+'>Sonraki →</button></nav>');
 // Source dimensions are information about these examples, never a universal
 // product rule. The target's name is absent until the answer is submitted.
 const marked=st.board.items.slice(start,start+size).some(x=>x.comparison);
 const help=wrap.querySelector('.board-help');
 if(marked&&help&&!st.board.sel&&!st.board.selName&&!st.kDone)help.textContent='Üçgenin gösterdiği aracın adını seç.';
 if(aracSmall()&&window.innerHeight<700){
  if(help&&!st.kDone)help.textContent=marked?'Üçgenli aracın adını bul.':'Görsele dokun, adını seç.';
  wrap.querySelectorAll('.foot .btn').forEach((button,i)=>{button.setAttribute('aria-label',button.textContent);button.textContent=i===0?'Mola':'Bitir';});
 }
 if(aracSmall()){
  // Enlargement stays outside the photo, so neither an edge nor the target
  // triangle/measurement is hidden underneath a floating button.
  const tools=cards[start].querySelector('.bimg-tools');
  const pager=gallery.querySelector('.board-pager');
  const zoom=tools.querySelector('.zoom-btn');
  pager.insertBefore(zoom,pager.lastElementChild);
  const label=tools.querySelector('.blbl').textContent.trim();
  if(label&&label!=='\u00a0'&&help)help.textContent=label;
  tools.hidden=true;
 }
 const intro=side.querySelector('.msg');
 if(st.lastRes&&st.lastRes.intro&&intro)intro.innerHTML='<b>'+(marked?'Üçgenin gösterdiği aracın adını seç.':'Görseli seç, adını bul.')+'</b><span>12 görsel · 18 ad</span>';
 pictures.querySelectorAll('.bimg-btn').forEach((button,i)=>{const item=st.board.items[i];if(item&&item.comparison)button.setAttribute('aria-label',(i+1)+'. görsel. Üç araç var; üçgen '+item.comparisonPosition+'. aracı gösteriyor.'+(st.board.pair[item.id]?' Eşlenen ad: '+st.board.pair[item.id]:''));});
 if(aracSmall()&&PHONE.open&&!st.kDone){
  const buttons=[...side.querySelectorAll('.bname')];
  // Learning may remove used names; preserve source indices and stable order
  // among the remaining choices rather than changing a submitted answer.
  const count=buttons.length,namePages=Math.max(1,Math.ceil(count/6));
  ARAC_VIEW.namePage=Math.min(ARAC_VIEW.namePage,namePages-1);
  buttons.forEach((button,i)=>{button.hidden=i<ARAC_VIEW.namePage*6||i>=(ARAC_VIEW.namePage+1)*6;});
  const names=side.querySelector('.board-names');
  names.insertAdjacentHTML('afterend','<nav class="name-pager" aria-label="Ad sayfaları"><button class="btn" onclick="aracNamePage(-1)"'+(!ARAC_VIEW.namePage?' disabled':'')+' aria-label="Önceki adlar">←</button><span>Adlar '+(ARAC_VIEW.namePage+1)+' / '+namePages+'</span><button class="btn" onclick="aracNamePage(1)"'+(ARAC_VIEW.namePage===namePages-1?' disabled':'')+' aria-label="Sonraki adlar">→</button></nav>');
 }
}
const ARAC_RENDER=render;
render=function(){ARAC_RENDER();aracBoardDecorate();};
window.addEventListener('resize',()=>{if(st.screen==='board'&&st.subject==='mutfak-araclari')render();});
render();
