/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
'use strict';
let spiceFilter='';
function spiceLearningHTML(){
 const cards=getData().learningCards||[];
 const matches=cards.filter(x=>x.answer.toLocaleLowerCase('tr').includes(spiceFilter.toLocaleLowerCase('tr')));
 return topBar('Ürünleri açıklamalarıyla tanı').replace('back()',"go('subject')")+'<div class="wrap"><h1>Ürünleri açıklamalarıyla tanı</h1><p class="card">Bu bölüm puanlanmaz. Fotoğrafta ürünün farklı biçimleri veya elde edildiği bitki birlikte gösterilebilir. Açıklamayı okuyarak ürünü tanı.</p><p class="note">Sirke, pekmez, tuz ve tozlar yalnız görünüşleriyle kesin ayırt edilemez. Ürünün etiketini ve reçeteyi kontrol et. Bilinmeyen ürünü tatma.</p><label for="spiceSearch">Ürün ara</label><input id="spiceSearch" type="search" value="'+esc(spiceFilter)+'" oninput="filterSpices(this.value)" autocomplete="off"><p role="status">'+matches.length+' öğrenme kartı</p><div class="learning-grid">'+matches.map(x=>'<article class="card"><img loading="lazy" src="'+esc(x.image)+'" alt="'+esc(x.answer)+' için açıklamalı öğrenme görseli"><h2>'+esc(x.answer)+'</h2><p>'+esc(x.explanation)+'</p><p class="note">'+esc(x.assessmentNote)+'</p>'+sesDugme(x.answer+'. '+x.explanation+'. '+x.assessmentNote,'Açıklamayı dinle')+'</article>').join('')+'</div></div>';
}
function filterSpices(value){const input=document.getElementById('spiceSearch'),pos=input.selectionStart;spiceFilter=value;render();const next=document.getElementById('spiceSearch');next.focus({preventScroll:true});try{next.setSelectionRange(pos,pos);}catch(e){}}
const V10_RENDER=render;
render=function(){if(st.screen==='spicelearn'){if(typeof SES!=='undefined')SES.sira=[];document.getElementById('app').innerHTML=spiceLearningHTML();return;}V10_RENDER();};
render();
// Kuver bağımsız denemesinde de sonuç çalışma bitene kadar açıklanmaz.
const V10_ANSWER=answer,V10_STATS=statsHtml,V10_QUIZ=quizHtml,V10_TABLE=tableHtml;
answer=function(value){
 if(st.practice!=='check'||!['kur','ad'].includes(st.op))return V10_ANSWER(value);
 if(st.done||!st.q||st.inBreak||st.modalOpen)return;
 const q=st.q,right=st.op==='kur'?value===q.key:value===q.ans;
 if(st.op==='ad'&&(!Number.isInteger(value)||!q.opts[value]))return;
 if(st.op==='kur'&&!LEVELS[st.lvl].items.includes(value))return;
 const seconds=tStop();st.done=true;st.res=right?1:0;st.tries=0;st.wrong=[];
 if(right){st.sess.ok++;st.sess.s+=10;}else st.sess.bad++;
 if(st.op==='kur')st.placed[q.key]=true;
 st.sess.qs.push({q:st.op==='kur'?ITEMS[q.key].AD+' için yer seçimi':'Öne çıkan kuver parçasının adı',a:st.op==='kur'?PLACE_LABEL[q.key]:ITEMS[q.key].AD,r:st.res,s:seconds,selectedAnswer:st.op==='kur'?PLACE_LABEL[value]:ITEMS[q.opts[value]].AD,firstAnswer:st.op==='kur'?PLACE_LABEL[value]:ITEMS[q.opts[value]].AD,attemptCount:1,hintUsed:false,assessment:true,prompt:q.key});
 st.lastRes={cls:'',head:'Yanıtın kaydedildi.',text:'Sonraki parçaya geç. Sonuçlar çalışma bitince açılır.'};saveProgress();render();
};
statsHtml=function(){if(st.practice==='check'&&st.screen!=='summary'&&st.sess)return '<div class="stats"><span class="chip">Yanıtlanan '+st.sess.qs.length+'</span></div>';return V10_STATS();};
tableHtml=function(){if(st.practice==='check'&&st.op==='kur'&&st.done&&!st.kDone){const previous=st.done;st.done=false;const html=V10_TABLE();st.done=previous;return html;}return V10_TABLE();};
quizHtml=function(){let html=V10_QUIZ();if(st.practice==='check'&&['kur','ad'].includes(st.op))html=html.replace(/class="opt right"/g,'class="opt"');return html;};
render();
