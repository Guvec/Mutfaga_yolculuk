/* Açılış ekranı: "Herkes yemek yapabilir". Ana sayfadan önce gelir; aşçı panda/tavşan dokunulan besine yürür, yer/içer ve tepki verir.
   Kodla çizilmiş SVG karakterler; tüm stiller css/giris.css içinde .gs altındadır. */
'use strict';
var GIRIS={foods:[
{id:'cake',name:'Kek',icon:'🍰',type:'food',effect:'happy',text:'Kek tatlı.'},
{id:'lemon',name:'Limon',icon:'🍋',type:'food',effect:'sour',text:'Limon ekşi.'},
{id:'pepper',name:'Acı biber',icon:'🌶️',type:'food',effect:'spicy',text:'Biber acı.'},
{id:'honey',name:'Bal',icon:'🍯',type:'food',effect:'happy',text:'Bal tatlı.'},
{id:'egg',name:'Yumurta',icon:'🥚',type:'food',effect:'happy',text:'Yumurta yedim. Yumurta protein içerir.'},
{id:'yogurt',name:'Yoğurt',icon:'🥣',type:'food',effect:'happy',text:'Yoğurdu kaşıkla yedim.'},
{id:'cheese',name:'Peynir',icon:'🧀',type:'food',effect:'happy',text:'Peynirden bir lokma aldım.'},
{id:'apple',name:'Elma',icon:'🍎',type:'food',effect:'happy',text:'Elmayı ısırdım. Çıtır çıtır!'},
{id:'carrot',name:'Havuç',icon:'🥕',type:'food',effect:'happy',text:'Havuçtan bir lokma aldım.'},
{id:'milk',name:'Süt',icon:'🥛',type:'drink',effect:'milky',text:'Süt içtim.'},
{id:'ayran',name:'Ayran',icon:'🥛',type:'drink',effect:'milky',text:'Ayran içtim.'},
{id:'water',name:'Su',icon:'💧',type:'drink',effect:'relaxed',text:'Su içtim. Susuzluğum geçti.'},
{id:'tea',name:'Çay',icon:'🍵',type:'drink',effect:'relaxed',text:'Çay soğudu. Küçük bir yudum içtim.'},
{id:'cola',name:'Kola',icon:'🥤',type:'drink',effect:'refuse',text:'Teşekkür ederim. Ben suyu seçiyorum.'}],
 character:'panda',motion:true,last:null,run:0,travel:null,page:0,mobile:null};
GIRIS.motion=!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function girisHTML(){return '<div class="gs"><header class="corner-controls"><button type="button" id="gMotion" aria-pressed="true">◉ Hareket açık</button><button type="button" id="gSound" aria-pressed="false">♫ Sesli okuma</button></header>'+
 '<main class="welcome"><h1 class="gs-slogan"><img src="assets/giris/herkes-yemek-yapabilir.png" alt="Herkes yemek yapabilir" width="1400" height="146"></h1><div class="choice" aria-label="Aşçını seç"><button type="button" id="panda" class="selected" aria-pressed="true">🐼 Panda</button><button type="button" id="rabbit" aria-pressed="false">🐰 Tavşan</button></div>'+
 `<section class="scene" aria-label="Besinlerle etkileşen aşçı maskot"><div class="glow"></div><div class="floor" aria-hidden="true"></div><div id="foods" class="food-grid"></div><div id="actor" class="actor"><div class="chef-visual"><svg id="chef" viewBox="0 0 400 510" role="img" aria-label="Turkuaz önlüklü aşçı panda"><defs><radialGradient id="fur"><stop stop-color="#fffefa"/><stop offset="1" stop-color="#e9e4da"/></radialGradient><linearGradient id="apron" x2="1" y2="1"><stop stop-color="#24b8b0"/><stop offset="1" stop-color="#06736e"/></linearGradient><linearGradient id="dark" x2="1" y2="1"><stop stop-color="#454d50"/><stop offset="1" stop-color="#1a2428"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#254d45" flood-opacity=".15"/></filter></defs><ellipse cx="200" cy="482" rx="111" ry="14" fill="#bfd7cb" opacity=".55"/><g id="body" filter="url(#shadow)"><g id="leftFoot"><ellipse cx="153" cy="453" rx="36" ry="26" class="limb"/></g><g id="rightFoot"><ellipse cx="247" cy="453" rx="36" ry="26" class="limb"/></g><path d="M119 302Q200 268 281 302L286 413Q200 448 114 413Z" fill="url(#fur)" stroke="#d8e0d7" stroke-width="2"/><g id="leftArm"><ellipse cx="114" cy="348" rx="27" ry="53" transform="rotate(22 114 348)" class="limb"/><path d="M105 301Q133 294 142 321L128 340 89 327Z" fill="#fff" stroke="#ccdcd7" stroke-width="2"/></g><g id="rightArm"><ellipse cx="286" cy="348" rx="27" ry="53" transform="rotate(-22 286 348)" class="limb"/><path d="M295 301Q267 294 258 321L272 340 311 327Z" fill="#fff" stroke="#ccdcd7" stroke-width="2"/></g><path d="M145 324L155 368H245L255 324 273 331 269 381 292 429Q200 459 108 429L131 381 127 331Z" fill="url(#apron)"/><path d="M135 373Q200 385 266 373" fill="none" stroke="#086e68" stroke-width="11"/><path d="M170 393H230V425H170Z" fill="none" stroke="#77d4ca" stroke-width="2"/><path d="M260 378Q307 350 301 384Q300 400 267 383Q306 408 285 420L262 386" fill="#07908a" stroke="#087b75" stroke-width="2"/><g fill="#9da8a3" stroke="#fff" stroke-width="2"><circle cx="175" cy="325" r="6"/><circle cx="225" cy="325" r="6"/><circle cx="175" cy="348" r="6"/><circle cx="225" cy="348" r="6"/></g>
<g id="head"><g class="panda-ears"><circle cx="102" cy="163" r="40" fill="url(#dark)"/><circle cx="298" cy="163" r="40" fill="url(#dark)"/></g><g class="rabbit-ears"><ellipse cx="124" cy="108" rx="29" ry="88" transform="rotate(-15 124 108)" fill="url(#fur)"/><ellipse cx="276" cy="108" rx="29" ry="88" transform="rotate(15 276 108)" fill="url(#fur)"/><ellipse cx="124" cy="108" rx="15" ry="65" transform="rotate(-15 124 108)" fill="#efa5a0"/><ellipse cx="276" cy="108" rx="15" ry="65" transform="rotate(15 276 108)" fill="#efa5a0"/></g><ellipse cx="200" cy="231" rx="119" ry="94" fill="url(#fur)"/><g class="patches" fill="url(#dark)"><ellipse cx="145" cy="227" rx="37" ry="42" transform="rotate(22 145 227)"/><ellipse cx="255" cy="227" rx="37" ry="42" transform="rotate(-22 255 227)"/></g><g class="open-eyes"><g fill="white"><ellipse cx="151" cy="225" rx="22" ry="28"/><ellipse cx="249" cy="225" rx="22" ry="28"/></g><g fill="#75462c"><ellipse cx="155" cy="230" rx="16" ry="21"/><ellipse cx="245" cy="230" rx="16" ry="21"/></g><g fill="#17272a"><ellipse cx="157" cy="232" rx="10" ry="16"/><ellipse cx="243" cy="232" rx="10" ry="16"/></g><g fill="white"><circle cx="151" cy="222" r="6"/><circle cx="237" cy="222" r="6"/></g></g><g class="squint" fill="none" stroke="#273436" stroke-width="7" stroke-linecap="round"><path d="M134 217L158 229 135 241M266 217L242 229 265 241"/></g><g class="relax-eyes" fill="none" stroke="#273436" stroke-width="6" stroke-linecap="round"><path d="M133 231Q150 212 168 231M232 231Q250 212 267 231"/></g><g fill="#ecb6a8" opacity=".55"><ellipse cx="119" cy="264" rx="20" ry="11"/><ellipse cx="281" cy="264" rx="20" ry="11"/></g><ellipse cx="200" cy="271" rx="46" ry="31" fill="#fffaf0"/><path id="nose" d="M184 254Q200 247 216 254Q219 260 200 269Q181 260 184 254" fill="#263336"/><path class="smile" d="M172 276Q200 292 228 276Q220 312 200 311Q180 310 172 276" fill="#51312c"/><path class="smile" d="M184 300Q200 287 216 300Q200 316 184 300" fill="#ec8e87"/><ellipse class="sour-mouth" cx="200" cy="289" rx="8" ry="12" fill="#8a5147"/><ellipse class="chew-mouth" cx="200" cy="287" rx="16" ry="9" fill="#51312c"/><path class="milk" d="M177 273Q188 266 200 274Q213 266 224 273L225 280Q211 285 200 279Q188 285 175 280Z" fill="white" stroke="#d8e1dc" stroke-width="1"/><g class="tears" fill="#68c4e8"><path d="M120 242Q105 266 121 269Q136 267 120 242"/><path d="M280 242Q265 266 281 269Q296 267 280 242"/></g><g id="hat" fill="white" stroke="#d6e1db" stroke-width="2"><path d="M139 153L133 119Q105 112 119 85Q129 69 148 74Q146 43 176 42Q193 23 215 43Q247 35 251 68Q278 64 284 90Q289 113 264 122L261 153Z"/><path d="M139 134Q200 119 261 134V157Q200 143 139 157Z" fill="#f7f9f4"/><path d="M155 79Q147 99 158 120M197 58V116M241 79Q249 99 240 120" fill="none" stroke="#e5ebe5" stroke-width="5" stroke-linecap="round"/></g></g></g></svg><div id="held" aria-hidden="true"></div><div class="napkin" aria-hidden="true">▱</div><div class="wave" aria-hidden="true">〰</div></div></div></section>
<div id="speech" class="speech" role="status" aria-live="polite">Bir besine dokun, aşçı dostunun tepkisini izle.</div><div class="small-actions"><button id="otherFoods">Diğer besinler ↻</button><span id="pageLabel" class="page-label"></span><button id="replay" disabled aria-label="Son tepkiyi tekrar izle">↻ Tekrar izle</button></div>
`+
 '<p class="tagline">Öğren, uygula, pekiştir.</p><button type="button" class="start" id="gStart">Çalışmaya başla</button><button type="button" class="guide-button" id="gHelp">📖 Uygulama kılavuzu</button></main></div>';}
(function(){
 var G=GIRIS;
 function $(s){return document.querySelector(s);}
 function actor(){return $('#actor');}
 function size(){return G.mobile&&G.mobile.matches?4:6;}
 function wait(ms,t){return new Promise(function(r){setTimeout(function(){r(t===G.run);},ms);});}
 function say(t){var s=$('#speech');if(s)s.textContent=t;if(typeof sesSoyle==='function'&&SES.acik)sesSoyle(t);}
 function art(id){
  var c='viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"',d={
  milk:'<path d="M15 12H49L45 57H19Z" fill="#effaff" stroke="#7babae" stroke-width="2"/><path d="M18 25H46L43 54H21Z" fill="#fff"/><ellipse cx="32" cy="25" rx="14" ry="4" fill="#fff" stroke="#d2e2df"/>',
  ayran:'<path d="M15 20H48L44 56H20Z" fill="#bdccd1" stroke="#647b86" stroke-width="2"/><path d="M47 25Q62 24 56 42L46 47" fill="none" stroke="#647b86" stroke-width="5"/><ellipse cx="32" cy="20" rx="17" ry="6" fill="#fff" stroke="#647b86" stroke-width="2"/><circle cx="24" cy="20" r="2" fill="#dce7e0"/><circle cx="36" cy="18" r="2" fill="#dce7e0"/>',
  water:'<path d="M15 10H49L44 57H20Z" fill="#e9f9ff" stroke="#679ba9" stroke-width="2"/><path d="M18 29Q26 25 33 29T47 29L43 54H21Z" fill="#76cde8"/><path d="M25 15L28 48" stroke="white" stroke-width="3"/>',
  tea:'<ellipse cx="32" cy="57" rx="24" ry="4" fill="#c9d8db"/><path d="M19 8Q28 26 22 40Q16 54 32 55Q48 54 42 40Q36 26 45 8Z" fill="#f4faf9" stroke="#90a8a9" stroke-width="2"/><path d="M24 25Q28 32 25 41Q20 51 32 52Q44 51 39 41Q36 32 40 25Z" fill="#a74716"/>',
  yogurt:'<path d="M8 29H55Q53 54 32 56Q11 53 8 29Z" fill="#82b9cf" stroke="#3d819a" stroke-width="2"/><ellipse cx="31" cy="29" rx="24" ry="8" fill="#fffdf5" stroke="#3d819a" stroke-width="2"/><path d="M38 27L53 6" stroke="#839b9e" stroke-width="5" stroke-linecap="round"/><ellipse cx="38" cy="27" rx="7" ry="4" fill="#dce8e7"/>'};
  if(d[id])return '<svg '+c+' aria-hidden="true">'+d[id]+'</svg>';
  return G.foods.filter(function(f){return f.id===id;})[0].icon;
 }
 function classes(x){var a=actor();if(a)a.className='actor '+(G.character==='rabbit'?'rabbit ':'')+(x||'');}
 function stop(center){
  G.run++;var a=actor();
  if(G.travel){var tr=a?getComputedStyle(a).transform:'none';try{G.travel.cancel();}catch(e){}G.travel=null;if(a)a.style.transform=tr==='none'?'translate(0px,0px)':tr;}
  classes();if(a&&center)a.style.transform='translate(0px,0px)';
  var h=$('#held');if(h)h.innerHTML='';
  document.querySelectorAll('.gs .food').forEach(function(b){b.classList.remove('consumed');});
  if(typeof sesSus==='function')sesSus();
  return G.run;
 }
 function draw(){
  var f=$('#foods');if(!f)return;var n=size(),pages=Math.ceil(G.foods.length/n);G.page=Math.min(G.page,pages-1);
  var list=G.foods.slice(G.page*n,G.page*n+n);f.dataset.count=list.length;
  f.innerHTML=list.map(function(x){return '<button type="button" class="food" data-food="'+x.id+'" aria-label="'+x.name+'" aria-pressed="'+(!!G.last&&G.last.id===x.id)+'"><span class="icon" aria-hidden="true">'+art(x.id)+'</span><span class="name">'+x.name+'</span></button>';}).join('');
  $('#pageLabel').textContent=(G.page+1)+' / '+pages;
 }
 async function moveTo(x,y,t){
  if(t!==G.run)return false;var a=actor();if(!a)return false;classes('walking');
  var from=getComputedStyle(a).transform,cx=from==='none'?0:new DOMMatrixReadOnly(from).m41;
  a.style.setProperty('--face',x-cx<0?'-1':'1');var to='translate('+x+'px,'+y+'px)';
  G.travel=a.animate([{transform:from==='none'?'translate(0,0)':from},{transform:to}],{duration:1000,easing:'ease-in-out',fill:'forwards'});
  try{await G.travel.finished;}catch(e){return false;}
  if(t!==G.run)return false;a.style.transform=to;G.travel.cancel();G.travel=null;classes();return true;
 }
 function targetFor(card){
  var a=actor(),scene=$('.gs .scene').getBoundingClientRect(),r=card.getBoundingClientRect(),w=a.offsetWidth,h=a.offsetHeight;
  var cx=r.left+r.width/2-scene.left,homeX=a.offsetLeft+w/2,homeY=a.offsetTop+h*.945,side=cx<scene.width/2?1:-1;
  var footX=Math.max(w/2+5,Math.min(scene.width-w/2-5,cx+side*57)),footY=Math.max(h*.945+4,Math.min(scene.height-12,r.bottom-scene.top-12));
  return {x:footX-homeX,y:footY-homeY};
 }
 async function react(f){
  var t=stop();G.last=f;var rp=$('#replay');if(rp)rp.disabled=false;
  document.querySelectorAll('.gs .food').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.food===f.id));});
  var card=document.querySelector('.gs [data-food="'+f.id+'"]');
  if(!card){G.page=Math.floor(G.foods.indexOf(f)/size());draw();card=document.querySelector('.gs [data-food="'+f.id+'"]');}
  say(f.name);var a=actor(),dest=targetFor(card),m=G.motion;
  if(m){if(!await moveTo(dest.x,dest.y,t))return;}else a.style.transform='translate('+dest.x+'px,'+dest.y+'px)';
  if(t!==G.run)return;
  if(f.id==='cola'){
   classes('refuse');say('Teşekkür ederim. Ben suyu seçiyorum.');if(!await wait(1200,t))return;
   $('#held').innerHTML=art('water');classes('drinking');if(!await wait(1100,t))return;
   classes('relaxed');$('#held').innerHTML=art('water');actor().classList.add('show-held');
  }else{
   if(f.id==='tea'){say('Çayın soğumasını bekliyorum.');if(!await wait(m?900:400,t))return;}
   $('#held').innerHTML=art(f.id);classes(f.type==='drink'?'drinking':'eating');card.classList.add('consumed');
   if(!await wait(m?1000:400,t))return;
   classes(f.effect);say(f.text);
   if(f.effect==='milky'){if(!await wait(m?700:500,t))return;actor().classList.add('wipe');if(!await wait(m?900:500,t))return;classes('happy');}
  }
  if(!await wait(m?1300:2200,t))return;
  $('#held').innerHTML='';card.classList.remove('consumed');
  if(m){if(!await moveTo(0,0,t))return;}else actor().style.transform='translate(0px,0px)';
  if(t===G.run)classes();
 }
 function motionUi(){var g=$('.gs');if(!g)return;g.classList.toggle('reduced',!G.motion);var b=$('#gMotion');b.textContent=G.motion?'◉ Hareket açık':'◉ Hareket kapalı';b.setAttribute('aria-pressed',String(G.motion));}
 function soundUi(){var b=$('#gSound');if(!b)return;b.textContent=SES.acik?'♫ Sesli okuma açık':'♫ Sesli okuma kapalı';b.setAttribute('aria-pressed',String(SES.acik));}
 GIRIS.kur=function(){
  if(!G.mobile&&window.matchMedia){G.mobile=matchMedia('(max-width: 600px)');G.mobile.addEventListener('change',function(){if(st.screen!=='giris')return;stop(true);G.page=0;draw();});}
  G.run++;G.travel=null;G.last=null;G.page=0;draw();motionUi();soundUi();
  $('#foods').onclick=function(e){var b=e.target.closest('[data-food]');if(b)react(G.foods.filter(function(f){return f.id===b.dataset.food;})[0]);};
  ['panda','rabbit'].forEach(function(id){$('#'+id).onclick=function(){stop(true);G.character=id;classes();$('#chef').setAttribute('aria-label','Turkuaz önlüklü aşçı '+(id==='panda'?'panda':'tavşan'));['panda','rabbit'].forEach(function(c){$('#'+c).setAttribute('aria-pressed',String(c===id));$('#'+c).classList.toggle('selected',c===id);});say('Bir besin seç.');};});
  if(G.character==='rabbit')$('#rabbit').click();
  $('#gMotion').onclick=function(){G.motion=!G.motion;stop(true);motionUi();say('Bir besin seç.');};
  $('#gSound').onclick=function(){SES.acik=!SES.acik;lsSet('ses',SES.acik);if(typeof sesSus==='function')sesSus();soundUi();if(SES.acik)say('Bir besine dokun.');};
  $('#replay').onclick=function(){if(G.last)react(G.last);};
  $('#otherFoods').onclick=function(){stop(true);G.page=(G.page+1)%Math.ceil(G.foods.length/size());draw();say('Diğer besinler. Bir besin seç.');};
  $('#gStart').onclick=function(){GIRIS.dur();
   /* İlk girişte profil yoksa ad kendiliğinden verilir ("Beğendin mi?" penceresi çıkar, bir kez değiştirilebilir); kayıtlı profil varsa "Kim çalışıyor?" açılır. Misafir seçeneği profil ekranında kalır. */
   if(!st.prof&&!st.guest){if(profiles().length)go('profiles');else if(typeof adAuto==='function')adAuto();else go('home');return;}
   go('home');};
  $('#gHelp').onclick=function(){GIRIS.dur();kilavuzAc();};
 };
 GIRIS.dur=function(){G.run++;if(G.travel){try{G.travel.cancel();}catch(e){}G.travel=null;}if(typeof sesSus==='function')sesSus();};
})();
(function(){
 var G_RENDER=render,G_BACK=back;
 render=function(){
  if(st.screen==='giris'){if(typeof SES!=='undefined')SES.sira=[];GIRIS.dur();document.getElementById('app').innerHTML=girisHTML();GIRIS.kur();document.body.dataset.screen='giris';return;}
  GIRIS.dur();G_RENDER();
  if(st.screen==='quiz'||st.screen==='board'||(typeof YR_SCREENS!=='undefined'&&YR_SCREENS.includes(st.screen))){var tp=document.querySelector('#app .top');if(tp&&!document.querySelector('.gs-strip'))tp.insertAdjacentHTML('afterend','<div class="gs-strip" aria-hidden="true">Herkes yemek yapabilir</div>');}
 };
 back=function(){if(st.screen==='giris')return;G_BACK();};
 if(st.screen==='welcome'){st.screen='giris';render();}
})();
