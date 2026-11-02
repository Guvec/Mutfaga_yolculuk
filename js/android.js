/* Telefon kullanımına göre görsel düzen. Oyun verileri ve puanlama korunur. */
'use strict';
var PHONE={open:false,expanded:false,returnIndex:0,wide:null};
function phoneWidth(){return typeof window.matchMedia==='function'&&window.matchMedia('(max-width: 759px), (max-height: 500px)').matches;}
function phoneOpenNames(){if(st.screen!=='board'||st.kDone)return;PHONE.open=true;PHONE.expanded=false;render();}
function phoneCloseNames(){PHONE.open=false;render();phoneReturnFocus();}
function phoneReturnFocus(){const cards=document.querySelectorAll('.bimg-btn');if(cards[PHONE.returnIndex])cards[PHONE.returnIndex].focus({preventScroll:true});}
function phoneDetails(){PHONE.expanded=!PHONE.expanded;render();}
const PHONE_TAPIMG=tapImg,PHONE_TAPNAME=tapName,PHONE_START=startBoard;
startBoard=function(){PHONE.open=false;PHONE.expanded=false;return PHONE_START.apply(this,arguments);};
tapImg=function(id){if(!st.board||st.kDone||st.inBreak||st.modalOpen||st.board.checked)return;const i=st.board.items.findIndex(x=>x.id===id);if(i<0)return;PHONE_TAPIMG(id);if(!phoneWidth()||st.screen!=='board')return;PHONE.returnIndex=i;if(st.board.sel===id&&!st.kDone){PHONE.open=true;PHONE.expanded=false;render();}};
tapName=function(i){if(!st.board||st.kDone||st.inBreak||st.modalOpen||st.board.checked)return;PHONE_TAPNAME(i);if(!phoneWidth()||st.screen!=='board')return;PHONE.open=!!st.board.sel;PHONE.expanded=false;render();if(!PHONE.open)phoneReturnFocus();};
const PHONE_FINISH=finish;
finish=function(){PHONE.open=false;PHONE.expanded=false;return PHONE_FINISH();};
function miniFeedback(){const m=st.lastRes;if(!m||m.intro)return '';let t=String(m.text||'');const parts=t.match(/[^.!?]+[.!?]*/g)||[t];const short=parts.slice(0,2).join(' ').trim();return '<section class="phone-feedback '+esc(m.cls||'')+'" role="status"><strong>'+esc(m.head)+'</strong><p>'+esc(short)+'</p>'+sesDugme(sesBirlestir(m.head,m.text),'Geri bildirimi dinle')+(m.detail||t!==short?'<button class="btn sm" onclick="phoneDetails()" aria-expanded="'+PHONE.expanded+'">'+(PHONE.expanded?'Bilgiyi kapat':'Bilgiyi aç')+'</button>':'')+(PHONE.expanded?'<div class="phone-information"><p>'+esc(m.detail||m.text||'')+'</p>'+sesDugme(m.detail||m.text||'','Açıklamayı dinle')+'</div>':'')+'</section>';}
function phoneBoardDecorate(){
 const wrap=document.querySelector('.board-wrap'),board=document.querySelector('.board'),side=document.querySelector('.board-side'),pictures=document.querySelector('.board-imgs');if(!wrap||!board||!side||!pictures||!st.board)return;
 const b=st.board,open=phoneWidth()&&PHONE.open&&!st.kDone;wrap.classList.add('phone-board');wrap.classList.toggle('phone-picker-open',open);
 const done=Object.keys(st.practice==='check'?b.pair:b.res).length;const help=document.querySelector('.board-help');
 if(help)help.insertAdjacentHTML('beforebegin','<div class="lesson-progress" aria-label="Eşleştirme ilerlemesi"><div class="lesson-progress-fill" style="width:'+Math.round(done/b.items.length*100)+'%"></div></div>');
 if(help)help.insertAdjacentHTML('afterend','<div class="phone-board-controls"><div class="phone-steps"><span class="'+(!b.sel?'active':'')+'">Görseli seç</span><span class="'+(b.sel?'active':'')+'">Adını bul</span></div>'+(!st.kDone?'<button class="btn phone-name-toggle" onclick="phoneOpenNames()">'+(b.sel?'Seçilen görselin adını bul':'Adları göster')+'</button>':'')+'</div>'+miniFeedback());
 side.id='phoneNameSheet';side.classList.toggle('name-sheet-open',open);
 // The supplementary mobile thumbnail from the previous version is replaced by the sheet header.
 const old=side.querySelector('.mobile-selected');if(old)old.remove();
 if(phoneWidth()){
  if(!open){side.hidden=true;side.removeAttribute('role');side.removeAttribute('aria-modal');}
  else{
   side.hidden=false;side.setAttribute('role','dialog');side.setAttribute('aria-modal','true');side.setAttribute('aria-label','Adını seç');
   const selected=b.sel?boardItem(b.sel):null;
   const retry=selected&&st.practice==='learn'&&b.tries[selected.id]===1?'<p class="phone-retry" role="status"><strong>Henüz eşleşmedi.</strong> '+esc(selected.hint||'Biçimini ve kullanım yerini düşün.')+'</p>':'';
   side.insertAdjacentHTML('afterbegin','<div class="phone-sheet-header"><div class="phone-sheet-title"><h2>Adını seç</h2><button class="phone-sheet-close" onclick="phoneCloseNames()" aria-label="Adları kapat">×</button></div>'+(selected?'<div class="phone-sheet-selected"><img src="'+esc(selected.image)+'" alt="Seçilen görsel"><div><p>Bu görselin adını bul.</p>'+(selected.task?'<p class="card-task">'+esc(selected.task)+'</p>':'')+'</div></div>':'<p class="phone-sheet-instruction">Bir ad seç. Sonra ona uygun görsele dokun.</p>')+retry+'</div>');
   wrap.insertAdjacentHTML('beforeend','<button class="phone-dimmer" aria-label="Adları kapat" tabindex="-1" onclick="phoneCloseNames()"></button>');
   const head=side.querySelector('.phone-sheet-close');if(head)head.focus({preventScroll:true});
  }
 }else{side.hidden=false;side.removeAttribute('role');side.removeAttribute('aria-modal');}
 if(phoneWidth()&&st.practice==='check'&&!b.checked&&done===b.items.length){const controls=wrap.querySelector('.phone-board-controls');if(controls)controls.insertAdjacentHTML('afterend','<button class="btn pri phone-check" onclick="checkBoard()">Yanıtları kontrol et</button>');}
 pictures.inert=open;
 if(st.kDone){const controls=wrap.querySelector('.phone-board-controls');if(controls)controls.insertAdjacentHTML('afterend','<div class="phone-finish"><button class="btn pri" onclick="finish()">Sonucumu gör</button><button class="btn" onclick="startBoard(st.practice,'+b.size+')">Yeniden çalış</button></div>');}
}
const TOPIC_ART={
 'baharat':['assets/baharat/t01_01.jpg','assets/baharat/t01_02.jpg','assets/baharat/t01_03.jpg'],
 'kuver':['assets/kuver/tabldot-kuver-referans.png'],
 'mutfak-araclari':['assets/mutfak-araclari/guncel-077.jpg','assets/mutfak-araclari/guncel-078.jpg','assets/mutfak-araclari/guncel-063.jpg'],
 'bulasik-makinesi-temizligi':['assets/bulasik-guncel/arac-7.jpg','assets/bulasik-guncel/arac-8.jpg','assets/bulasik-guncel/arac-9.jpg']
};
function topicDecorate(){const list=document.querySelector('.wrap .list');if(!list)return;list.classList.add('topic-grid');const cards=list.querySelectorAll('button.menu-btn');cards.forEach(btn=>{const action=btn.getAttribute('onclick')||'',id=Object.keys(TOPIC_ART).find(x=>action.includes("'"+x+"'"));if(!id)return;const imgs=TOPIC_ART[id];btn.classList.add('topic-card','topic-'+id);btn.insertAdjacentHTML('afterbegin','<span class="topic-art" aria-hidden="true">'+imgs.map(src=>'<img src="'+src+'" alt="" loading="lazy" decoding="async">').join('')+'</span>');btn.insertAdjacentHTML('beforeend','<span class="topic-open" aria-hidden="true">›</span>');});const heading=document.querySelector('.wrap h1');if(heading)heading.insertAdjacentHTML('beforebegin','<div class="section-kicker">MUTFAKTA ÖĞRENİYORUM</div>');}
function welcomeDecorate(){const w=document.querySelector('.welcome');if(!w)return;w.classList.add('welcome-designed');const image=w.querySelector('img');if(image){image.setAttribute('decoding','async');image.insertAdjacentHTML('afterend','<div class="welcome-eyebrow">Görsellerle öğren · Kendi hızında ilerle</div>');}const sub=w.querySelector('.sub');if(sub)sub.textContent='Yiyecek İçecek Hizmetleri';}
function menuDecorate(){document.querySelectorAll('.set-list .menu-btn').forEach(btn=>btn.classList.add('set-card'));if(st.screen==='subject'||st.screen==='mode'||st.screen==='boardmode'||st.screen==='mcqmode'){const h=document.querySelector('.wrap h1');if(h)h.classList.add('section-heading');document.querySelectorAll('.wrap .list .menu-btn').forEach(btn=>btn.classList.add('activity-card'));}}
const PHONE_RENDER=render;
render=function(){PHONE_RENDER();if(typeof document.querySelector!=='function')return;
 if(st.screen==='welcome')welcomeDecorate();if(st.screen==='home')topicDecorate();menuDecorate();
 if(st.screen==='board')phoneBoardDecorate();else PHONE.open=false;
 const locked=st.screen==='board'&&phoneWidth()&&PHONE.open&&!st.kDone;document.body.classList.toggle('phone-sheet-lock',locked);
 document.querySelectorAll('img').forEach(img=>img.setAttribute('decoding','async'));
};
document.addEventListener('keydown',e=>{if(!phoneWidth()||!PHONE.open||st.screen!=='board'||st.modalOpen)return;if(e.key==='Escape'){e.preventDefault();phoneCloseNames();return;}if(e.key!=='Tab')return;const sheet=document.getElementById('phoneNameSheet');if(!sheet)return;const buttons=[...sheet.querySelectorAll('button:not(:disabled),summary,select')].filter(x=>!x.hidden);if(!buttons.length)return;const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
if(typeof window.matchMedia==='function'){const q=window.matchMedia('(max-width: 759px), (max-height: 500px)');if(q.addEventListener)q.addEventListener('change',()=>{PHONE.open=false;if(st.screen==='board')render();});}
render();
