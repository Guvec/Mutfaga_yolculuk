/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Aşama bitti (14.11.2026): Öğreniyorum ya da Uyguluyorum bitince kutlama sesi ve sesli tebrik,
   sıradaki aşamanın adı ve 8 saniye sonra kendiliğinden geçiş. Öğrenci isterse tekrar oynar ya da çıkar.
   Sıra: Öğreniyorum → Uyguluyorum → sonraki kuver türü / takım / bölüm. Kuver ve Adını Bul, eşleştirme takımları, soru bölümleri. */
'use strict';
const ASAMA_SN=8;let ASAMA_SAYAC=null;
const PRAK={learn:'Öğreniyorum',check:'Uyguluyorum'};
function asamaSonraki(){
 const p=st.practice;if(p!=='learn'&&p!=='check')return null;
 if(st.subject==='kuver'&&st.op==='kur'){
  const lv=Object.keys(LEVELS).map(Number).sort((a,b)=>a-b),i=lv.indexOf(Number(st.lvl));
  if(p==='learn')return {ad:LEVELS[st.lvl].name+' · Uyguluyorum',git:()=>{st.lvl=lv[i];choosePractice('check');}};
  if(i>=0&&i<lv.length-1)return {ad:LEVELS[lv[i+1]].name+' · Öğreniyorum',git:()=>{st.lvl=lv[i+1];choosePractice('learn');}};
  return {ad:'Adını Bul · Öğreniyorum',git:()=>{st.op='ad';choosePractice('learn');}};
 }
 if(st.subject==='kuver'&&st.op==='ad'){return p==='learn'?{ad:'Adını Bul · Uyguluyorum',git:()=>choosePractice('check')}:null;}
 if(st.op==='match'&&st.contentSet!=null&&typeof startBoard==='function'){
  const set=st.contentSet,ad=(typeof setName==='function'?setName(set):set+'. takım');
  if(p==='learn')return {ad:ad+' · Uyguluyorum',git:()=>{st.contentSet=set;startBoard('check');}};
  const sets=typeof contentSets==='function'?contentSets():[],j=sets.indexOf(set);
  if(j>=0&&j<sets.length-1){const n=sets[j+1];return {ad:(typeof setName==='function'?setName(n):n+'. takım')+' · Öğreniyorum',git:()=>{st.contentSet=n;startBoard('learn');}};}
  return null;
 }
 if(st.op==='mcq'&&st.mcqGroup&&typeof mcqBegin==='function'){
  const g=st.mcqGroup;
  if(p==='learn')return {ad:g+' · Uyguluyorum',git:()=>{st.mcqGroup=g;mcqBegin('check');}};
  const gs=(typeof mcqGroups==='function'?mcqGroups():[]).filter(x=>!x.whole),j=gs.findIndex(x=>x.label===g);
  if(j>=0&&j<gs.length-1){const n=gs[j+1].label;return {ad:n+' · Öğreniyorum',git:()=>{st.mcqGroup=n;mcqBegin('learn');}};}
  return null;
 }
 return null;
}
function asamaKapat(){clearInterval(ASAMA_SAYAC);ASAMA_SAYAC=null;const k=document.getElementById('asamaKutu');if(k)k.remove();}
function asamaGoster(){
 if(document.getElementById('asamaKutu'))return;
 const S=st.sess||{},n=(S.ok||0)+(S.fix||0)+(S.bad||0),sonraki=asamaSonraki(),ogr=st.practice==='learn';
 const k=document.createElement('div');k.id='asamaKutu';k.className='mola-kutu asama-kutu';k.setAttribute('role','dialog');k.setAttribute('aria-modal','true');k.setAttribute('aria-labelledby','asamaBas');
 k.innerHTML='<div class="mola-ic asama-ic"><div class="asama-yildiz" aria-hidden="true">🎉</div><h2 id="asamaBas">Tebrikler! '+esc(PRAK[st.practice]||'Aşama')+' bitti.</h2>'+
  (n?'<p class="asama-skor">'+(S.ok||0)+' / '+n+' ilk denemede doğru</p>':'')+
  (sonraki?'<p class="asama-sonra">Sıradaki aşama:<b>'+esc(sonraki.ad)+'</b></p><button type="button" class="btn pri" id="asIleriBtn">▶ Sonraki aşamaya geç <span id="asSayac">('+ASAMA_SN+')</span></button>':'<p class="asama-sonra"><b>Bu konunun bütün aşamalarını bitirdin!</b></p><button type="button" class="btn pri" id="asRapor">🏁 Raporu gör</button>')+
  '<button type="button" class="btn" id="asTekrar">↻ Bu aşamayı tekrar oyna</button><button type="button" class="btn ghost" id="asCik">Devam etmek istemiyorum</button></div>';
 document.body.appendChild(k);
 const ileri=()=>{asamaKapat();try{sonraki.git();}catch(e){}window.scrollTo(0,0);};
 if(sonraki){document.getElementById('asIleriBtn').onclick=ileri;let kalan=ASAMA_SN;ASAMA_SAYAC=setInterval(()=>{kalan--;const s=document.getElementById('asSayac');if(s)s.textContent='('+kalan+')';if(kalan<=0)ileri();},1000);}
 else document.getElementById('asRapor').onclick=()=>{asamaKapat();finish();};
 document.getElementById('asTekrar').onclick=()=>{asamaKapat();if(st.op==='match'&&typeof startBoard==='function')startBoard(st.practice);else if(st.op==='mcq'&&typeof mcqBegin==='function')mcqBegin(st.practice);else choosePractice(st.practice);};
 document.getElementById('asCik').onclick=()=>{asamaKapat();finish();};
 /* Kutlama: efekt (sesli okuma açık olsa da) + sesli tebrik. */
 try{if(typeof EFEKT!=='undefined')sesEfekt('galibiyet')||EFEKT.cal('kuverTamam');}catch(e){}
 const soz='Tebrikler! '+(PRAK[st.practice]||'Aşama')+' bitti.'+(sonraki?' Sıradaki aşama: '+sonraki.ad+'.':' Bu konunun bütün aşamalarını bitirdin.');
 setTimeout(()=>{if(typeof sesSoyle==='function'&&typeof SES!=='undefined'&&SES.acik)try{sesSoyle(soz);}catch(e){}},900);
 (sonraki?document.getElementById('asIleriBtn'):document.getElementById('asRapor')).focus();
}
if(typeof render==='function'){
 const AS_RENDER0=render;
 render=function(){
  AS_RENDER0.apply(this,arguments);
  try{
   if(!st.kDone||!st.sess||st.screen==='summary'||(st.practice!=='learn'&&st.practice!=='check'))return;
   if(typeof YR!=='undefined'&&YR.active)return;
   if(st.sess.asamaGosterildi)return;st.sess.asamaGosterildi=true;
   setTimeout(asamaGoster,st.op==='kur'?1600:900);
  }catch(e){}
 };
}
/* Yolculuğum (Mutfak Araçları, Baharat, Bulaşık): bölüm bitince "Devam et" 10 saniye sonra kendiliğinden basılır; öğrenci isterse durur. */
let YOL_OTO=null,YOL_OTO_KEY=null;
if(typeof render==='function'){
 const AS_RENDER1=render;
 render=function(){
  AS_RENDER1.apply(this,arguments);
  try{
   if(st.screen!=='yolplay'||typeof Y==='undefined'||!Y||Y.phase!=='bitti'){if(YOL_OTO){clearInterval(YOL_OTO);YOL_OTO=null;}return;}
   const key=(Y.node&&Y.node.id)+'|'+(Y.tohum||'');if(YOL_OTO_KEY===key)return;YOL_OTO_KEY=key;
   const btn=[...document.querySelectorAll('.yol-alt .yol-btn:not(.ikinci)')].find(b=>/Devam et/.test(b.textContent));if(!btn)return;
   /* Bölüm sonu sesi yol-ses.js'te çalar. */
   const alt=btn.parentNode;alt.insertAdjacentHTML('afterend','<button type="button" class="yol-btn ikinci yol-dur" id="yolDur">Devam etmek istemiyorum</button>');
   let kalan=10;btn.textContent='Sonraki bölüme geç ('+kalan+') ›';
   YOL_OTO=setInterval(()=>{kalan--;if(!document.body.contains(btn)){clearInterval(YOL_OTO);YOL_OTO=null;return;}btn.textContent='Sonraki bölüme geç ('+kalan+') ›';if(kalan<=0){clearInterval(YOL_OTO);YOL_OTO=null;btn.click();}},1000);
   document.getElementById('yolDur').onclick=()=>{clearInterval(YOL_OTO);YOL_OTO=null;go('yolum');};
  }catch(e){}
 };
}
/* Uyguluyorum'da doğru/yanlış gösterilmez ama öğrencinin seçtiği şık renkli görünür. */
if(typeof answer==='function'){const AS_ANS=answer;answer=function(id){st.secim=id;return AS_ANS.apply(this,arguments);};}
