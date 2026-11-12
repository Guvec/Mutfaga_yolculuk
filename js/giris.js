/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
'use strict';
const DOST_CHARACTERS={
 panda:{ad:'Panda',art:'panda'},
 rabbit:{ad:'Tavşan',art:'tavsan'},
 koala:{ad:'Koala',art:'koala'},
 civciv:{ad:'Civciv',art:'dal-civciv-sicak',quest:true},
 penguen:{ad:'Penguen',art:'dal-penguen-sicak',quest:true},
 papagan:{ad:'Papağan',art:'dal-papagan-sicak',quest:true},
 kedi:{ad:'Kedi',art:'dal-kedi-sicak',quest:true},
 keci:{ad:'Keçi',art:'dal-keci-sicak',quest:true},
 geyik:{ad:'Geyik',art:'dal-geyik-sicak',quest:true}
};
const DOST_SAVED=ls('ana_dost','panda');
function dostPid(){return st.prof&&!st.guest&&typeof rkPid==='function'?rkPid(st.prof,true):null;}
function dostAcik(id,pid=dostPid()){
 return Object.hasOwn(DOST_CHARACTERS,id)&&dostGorevAcik(id,pid);
}
function dostSecili(){
 const pid=dostPid(),all=ls('dost_secim',{});
 if(pid&&!Object.hasOwn(all,pid)&&!ls('dost_migrated',false)){
  lsSet('dost_secim',{...all,[pid]:dostAcik(DOST_SAVED)?DOST_SAVED:'panda'});
  lsSet('dost_migrated_pid',pid);
  lsSet('dost_migrated',true);
 }
 const id=pid?ls('dost_secim',{})[pid]:GIRIS.guestCharacter;
 return dostAcik(id)?id:'panda';
}
function dostSec(id){
 if(!dostAcik(id))return false;
 const pid=dostPid();
 if(pid)return lsSet('dost_secim',{...ls('dost_secim',{}),[pid]:id});
 GIRIS.guestCharacter=id;
 return true;
}
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
 character:'panda',guestCharacter:dostAcik(DOST_SAVED,null)?DOST_SAVED:'panda',motion:ls('dost_hareket',true),last:null,page:0,editor:false};
const DOST_ASSETS='assets/ascidostum/';
const DOST_TABS={dost:'Dostlar',kiyafet:'Kıyafetler',aksesuar:'Aksesuarlar',hareket:'Hareketler'};
const DOST_MOVES={
 selam:{ad:'El salla',art:'panda-selam',rabbit:'tavsan-selam'},
 bas:{ad:'Başınla selam ver',art:'panda-bas',rabbit:'tavsan-bas'},
 krema:{ad:'Krema rozeti yap',art:'panda-krema',koala:'koala-pastacilik'}
};
const DOST_REACTION_ART={cake:'kek',lemon:'limon',pepper:'biber',water:'su'};
const DOST_FIRST=['cake','lemon','yogurt','milk','ayran','apple'];
const DOST_FOODS=[
 ...DOST_FIRST.map(id=>GIRIS.foods.find(f=>f.id===id)),
 ...GIRIS.foods.filter(f=>!DOST_FIRST.includes(f.id))
];
function dostFoto(id,cls=''){
 return '<img class="'+cls+'" src="'+DOST_ASSETS+id+'.webp" alt="" width="480" height="480">';
}
function dostProfil(){
 const name=st.guest?'Misafir':st.prof?(typeof adRest==='function'?adRest(st.prof):st.prof):'Profil seç';
 const avatar=typeof anaProfilGorsel==='function'?anaProfilGorsel():'';
 return '<button type="button" class="dost-profil" onclick="anaProfil()">'+avatar+'<span>'+esc(name)+'</span></button>';
}
function girisHTML(){
 const pid=dostPid();
 return `<div class="gs dost-studio">
  <div class="dost-wrap">
   <header class="dost-head">
    <button type="button" id="gStart" aria-label="Ana sayfa">‹</button>
    <h1>Aşçı Dostum</h1>${dostProfil()}
   </header>
   <section id="gKitchen" aria-label="Etkileşimli mutfak">
    <div class="dost-choice" aria-label="Şefini seç">
     ${Object.entries(DOST_CHARACTERS).filter(([id])=>dostAcik(id,pid)).map(([id,{ad,art}])=>
      '<button type="button" id="'+id+'" aria-pressed="'+(GIRIS.character===id)+'">'+dostFoto(art)+ad+'</button>').join('')}
    </div>
    <div class="dost-stage" id="actor">
     ${dostFoto('panda','dost-portrait')}<span id="held" aria-hidden="true"></span>
     <button type="button" id="gMuzik" aria-label="Müzik" aria-pressed="false" title="Müzik">♫</button>
    </div>
    <p id="speech" class="dost-speech" role="status" aria-live="polite">Bir karta dokun.</p>
    <div id="foods" class="dost-foods"></div>
    <div class="dost-actions">
     <button type="button" id="otherFoods">Diğer besinler</button><span id="pageLabel"></span>
     <button type="button" id="replay" disabled aria-label="Son tepkiyi tekrar izle">Tekrar izle</button>
    </div>
    <div class="dost-links">
     <button type="button" id="gLezzet">Lezzetleri Keşfet</button>
     <button type="button" id="gEditor">Görünüm ve Hareketler <span aria-hidden="true">›</span></button>
    </div>
    <div class="corner-controls dost-controls">
     <button type="button" id="gMotion"></button><button type="button" id="gSound"></button>
    </div>
   </section>
   <section id="gWardrobe" aria-label="Görünüm ve Hareketler" hidden>
    <div class="dost-tabs" aria-label="Görünüm seçenekleri">${Object.entries(DOST_TABS).map(([id,name])=>
     '<button type="button" data-dost-tab="'+id+'" aria-pressed="false">'+name+'</button>').join('')}</div>
    <div class="dost-preview" id="gPreview" aria-hidden="true">${dostFoto('panda')}</div>
    <p class="dost-preview-title" id="gPreviewTitle"></p>
    <div id="gQuest"></div>
    <div class="dost-actions dost-preview-actions">
     <button type="button" id="gWatch">▶︎ İzle</button><button type="button" id="gUse">Kullan</button>
    </div>
    <p class="dost-applied" id="gApplied" role="status"></p>
    <div id="gOptions" class="dost-options"></div>
   </section>
  </div>
 </div>`;
}
(function(){
 const G=GIRIS;
 let origin='home',entry=null;
 const $=id=>document.getElementById(id);
 /* Ana sayfadaki Aşçı Dostum kartı: doğrudan besleme ekranı (tepkiler) açılır. */
 G.mutfak=function(){origin='home';entry={food:null,editor:false,profileChoice:false};go('giris');};
 G.ac=function(from,food=null,profileChoice=false){
  origin=from;
  entry={food,editor:profileChoice||from==='home'&&!food,profileChoice};
  go('giris');
 };
 const prefKey=()=>{const pid=dostPid();return 'dost_gorunum_'+G.character+(pid?'_'+pid:'');};
 const preference=()=>ls(prefKey(),dostPid()===ls('dost_migrated_pid',null)?ls('dost_gorunum_'+G.character,{}):{})||{};
 const systemReduced=()=>document.documentElement.dataset.sakin==='1'
  ||!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
 const reduced=()=>!G.motion||systemReduced();
 const size=6;
 let timer=null, tab='hareket', option='', profileChoice=false;
 function say(text,voice=true){
  $('speech').textContent=text;
  if(voice&&SES.acik&&typeof sesSoyle==='function')sesSoyle(text);
 }
 function portrait(character,look){
  const name=DOST_CHARACTERS[character].art;
  if(DOST_CHARACTERS[character].quest)return 'dal-'+character+'-'+({pastacilik:'pasta',servis:'servis'}[look]||'sicak');
  if(character==='koala')return look==='pastacilik'||look==='servis'?'koala-'+look:name;
  return look==='krem'||look==='serit'?name+'-'+look:name;
 }
 function pose(move){
  const m=DOST_MOVES[move];
  if(DOST_CHARACTERS[G.character].quest)return move==='krema'?portrait(G.character,'pastacilik'):m?portrait(G.character):null;
  return G.character==='panda'?m?.art:m?.[G.character];
 }
 G.homeArt=function(){
  const look=preference();
  if(look.look&&look.look!=='normal')return portrait(G.character,look.look);
  return pose(look.move)||{panda:'ana-panda',rabbit:'tavsan-selam',koala:'koala'}[G.character]||portrait(G.character);
 };
 function stage(id,effect='',food=null){
  const actor=$('actor');
  if(!actor)return;
  const image=actor.querySelector('.dost-portrait');
  image.src=DOST_ASSETS+id+'.webp';
  actor.dataset.effect=reduced()?'':effect;
  actor.dataset.kind=food?.type||'';
  actor.querySelector('#held').innerHTML=food?foodArt(food):'';
  actor.dataset.character=G.character;
  image.alt=DOST_CHARACTERS[G.character].ad;
 }
 function base(){
  stage(portrait(G.character,preference().look));
 }
 function stop(){
  clearTimeout(timer);
  timer=null;
  const preview=$('gPreview');
  if(preview)preview.dataset.effect='';
  if(typeof sesSus==='function')sesSus();
  base();
 }
 function foodArt(f){
  return DOST_FIRST.includes(f.id)?dostFoto(f.id):'<span>'+f.icon+'</span>';
 }
 function draw(){
  const list=DOST_FOODS.slice(G.page*size,(G.page+1)*size);
  $('foods').innerHTML=list.map(f=>
   '<button type="button" class="food" data-food="'+f.id+'" aria-pressed="'+(G.last?.id===f.id)+'">'+
   '<span class="dost-food-art" aria-hidden="true">'+foodArt(f)+'</span><strong>'+f.name+'</strong></button>'
  ).join('');
  $('pageLabel').textContent=(G.page+1)+' / '+Math.ceil(DOST_FOODS.length/size);
 }
 function react(food){
  stop();
  if(document.hidden)return;
  G.last=food;
  const targetPage=Math.floor(DOST_FOODS.indexOf(food)/size);
  if(targetPage!==G.page){G.page=targetPage;draw();}
  document.querySelectorAll('.dost-studio .food').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.food===food.id)));
  $('replay').disabled=false;
  const declined=food.id==='cola';
  const prop=declined?G.foods.find(f=>f.id==='water'):food;
  const reaction=['panda','rabbit'].includes(G.character)?(declined?(G.character==='rabbit'?'kola':null):DOST_REACTION_ART[food.id]):null;
  const who=DOST_CHARACTERS[G.character].art;
  const art=reaction?who+'-'+reaction:portrait(G.character,preference().look);
  say(food.text);
  stage(art,food.effect,reaction?null:prop);
  if(!reduced())timer=setTimeout(base,2200);
 }
 function character(id,save=false){
  if(save&&!dostSec(id))return false;
  stop();
  G.character=id;
  G.last=null;
  $('replay').disabled=true;
  Object.keys(DOST_CHARACTERS).forEach(c=>$(c)?.setAttribute('aria-pressed',String(c===id)));
  draw();base();say('Bir karta dokun.',false);return true;
 }
 function prefsUi(){
  const motion=$('gMotion'), sound=$('gSound'), music=$('gMuzik');
  motion.disabled=systemReduced();
  motion.title=motion.disabled?'Hareket, sakin mod veya cihaz tercihi nedeniyle kapalı.':'';
  motion.setAttribute('aria-pressed',String(!reduced()));
  motion.textContent='Hareket: '+(!reduced()?'Açık':'Kapalı');
  sound.setAttribute('aria-pressed',String(SES.acik));
  sound.textContent='Sesli okuma: '+(SES.acik?'Açık':'Kapalı');
  music.setAttribute('aria-pressed',String(typeof MUZIK!=='undefined'&&MUZIK.acikMi()));
 }
 function options(){
  if(tab==='dost'){
   const pid=dostPid(),active=dostGorevProfil(pid).active;
   return Object.entries(DOST_CHARACTERS).map(([id,data])=>({id,...data,locked:!dostAcik(id,pid),active:id===active}))
    .filter(x=>!profileChoice||(!x.locked&&x.id!==G.character));
  }
  if(dostDalKiyafeti()&&tab==='kiyafet')return [
   {id:'normal',ad:'Sıcak Mutfak',art:portrait(G.character)},
   {id:'pastacilik',ad:'Pastacılık',art:portrait(G.character,'pastacilik')},
   {id:'servis',ad:'Servis',art:portrait(G.character,'servis')}
  ];
  if(tab==='hareket')return Object.entries(DOST_MOVES)
   .filter(([id])=>pose(id))
   .map(([id,m])=>({id,ad:m.ad,art:pose(id)}));
  return [{id:'normal',ad:tab==='kiyafet'?'Turkuaz önlük':'Beyaz kep',art:portrait(G.character)},
   {id:tab==='kiyafet'?'krem':'serit',ad:tab==='kiyafet'?'Krem önlük':'Turkuaz şeritli kep',
    art:portrait(G.character,tab==='kiyafet'?'krem':'serit')}];
 }
 function dostDalKiyafeti(){return G.character==='koala'||!!DOST_CHARACTERS[G.character].quest;}
 function applied(){
  const p=preference();
  if(tab==='dost')return (!profileChoice&&dostGorevProfil().active)||G.character;
  if(tab==='hareket')return p.move||(G.character==='koala'?'krema':'selam');
  if(dostDalKiyafeti()&&tab==='kiyafet')return p.look||'normal';
  return tab==='kiyafet'&&p.look==='krem'||tab==='aksesuar'&&p.look==='serit'?p.look:'normal';
 }
 function preview(){
  const list=options();
  const item=list.find(x=>x.id===option)||list[0];
  option=item.id;
  $('gPreview').dataset.effect='';
  $('gPreview').dataset.character=tab==='dost'?item.id:G.character;
  $('gPreview').querySelector('img').src=DOST_ASSETS+item.art+'.webp';
  $('gPreviewTitle').textContent=item.ad;
  $('gWatch').hidden=tab!=='hareket';
  const pid=dostPid(),canOpen=dostPuanBakiye(dostGorevProfil(pid))>=DOST_ACMA_PUANI;
  $('gUse').disabled=!!item.locked&&(!pid||(item.active&&!canOpen));
  $('gUse').textContent=item.active?'Dostu aç':item.locked?'Hedef olarak seç':'Kullan';
  $('gQuest').innerHTML=tab==='dost'&&!profileChoice?dostPuanHTML(item.id):'';
  $('gWardrobe').querySelectorAll('[data-dost-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dostTab===tab)));
  $('gOptions').dataset.tab=tab;
  $('gOptions').innerHTML=list.map(x=>'<button type="button" data-dost-item="'+x.id+'" aria-pressed="'+(x.id===item.id)+'" class="'+(x.locked?'dost-locked':'')+'">'+dostFoto(x.art)+'<span>'+x.ad+'</span>'+(x.locked?'<small>🔒 '+(x.active?'Seçili hedef':'Kilitli')+'</small>':'')+'</button>').join('');
 }
 function showEditor(show,initialTab='hareket'){
  stop();
  G.editor=show;
  $('gKitchen').hidden=show;
  $('gWardrobe').hidden=!show;
  document.querySelector('.dost-head h1').textContent=show?'Görünüm ve Hareketler':'Aşçı Dostum';
  $('gStart').setAttribute('aria-label',show&&origin!=='home'?'Aşçı Dostum ekranına dön':origin==='market'?'Markete dön':'Ana sayfa');
  if(show){$('gWardrobe').querySelectorAll('[data-dost-tab]').forEach(b=>{b.hidden=profileChoice?b.dataset.dostTab!=='dost':b.dataset.dostTab==='aksesuar'&&dostDalKiyafeti();});tab=initialTab;option=applied();$('gApplied').textContent='';preview();$('gStart').focus();}
  else{$('gEditor').focus();}
 }
 G.geri=function(){
  if(G.editor&&origin!=='home'&&!profileChoice){showEditor(false);return;}
  stop();G.editor=false;profileChoice=false;const to=origin;origin='home';go(to);
 };
 G.kur=function(){
  const opening=entry;entry=null;
  const keepEditor=!opening&&document.body.dataset.screen==='giris'&&G.editor;
  if(opening)profileChoice=opening.profileChoice;
  G.last=null;G.page=0;G.editor=false;
  character(dostSecili());prefsUi();
  Object.keys(DOST_CHARACTERS).forEach(id=>{if($(id))$(id).onclick=()=>character(id,true);});
  $('foods').onclick=e=>{
   const button=e.target.closest('[data-food]');
   if(button)react(G.foods.find(f=>f.id===button.dataset.food));
  };
  $('otherFoods').onclick=()=>{
   stop();G.page=(G.page+1)%Math.ceil(DOST_FOODS.length/size);
   draw();say('Bir karta dokun.',false);
  };
  $('replay').onclick=()=>{if(G.last)react(G.last);};
  $('gMuzik').onclick=()=>{if(MUZIK.acikMi())MUZIK.kapat();else MUZIK.ac();prefsUi();};
  $('gMotion').onclick=()=>{G.motion=!G.motion;lsSet('dost_hareket',G.motion);stop();prefsUi();};
  $('gSound').onclick=()=>{SES.acik=!SES.acik;lsSet('ses',SES.acik);stop();prefsUi();};
  $('gLezzet').onclick=()=>{stop();go('lezzet');};
  $('gStart').onclick=G.geri;
  $('gEditor').onclick=()=>showEditor(true);
  $('gWardrobe').onclick=e=>{
   const t=e.target.closest('[data-dost-tab]'),i=e.target.closest('[data-dost-item]');
   if(t){tab=t.dataset.dostTab;option=applied();$('gApplied').textContent='';preview();}
   if(i){option=i.dataset.dostItem;$('gApplied').textContent='';preview();$('gOptions').querySelector('[aria-pressed=true]').focus();}
  };
  $('gWatch').onclick=()=>{
   const image=$('gPreview');
   image.dataset.effect='';void image.offsetWidth;
   if(!reduced())image.dataset.effect=option;
   $('gApplied').textContent=reduced()?'Sabit hareket görünümü.':$('gPreviewTitle').textContent;
  };
  $('gUse').onclick=()=>{
   const selected=options().find(x=>x.id===option);
   if(!selected)return;
   if(selected.locked){
    if(selected.active){
     if(dostGorevAc(selected.id)){preview();$('gApplied').textContent=selected.ad+' açıldı.';}
     return;
    }
    if(dostGorevSec(selected.id)){preview();$('gApplied').textContent=selected.ad+' hedef olarak seçildi.';}
    return;
   }
   if(tab==='dost'){
    if(!character(option,true)){$('gApplied').textContent='Seçim kaydedilemedi.';return;}
    if(profileChoice){G.geri();return;}showEditor(true,'dost');
    $('gApplied').textContent=selected.ad+' seçildi.';return;
   }
   const p=preference();
   if(tab==='hareket')p.move=option;
   else if(option!=='normal'||applied()!=='normal')p.look=option;
   lsSet(prefKey(),p);
   if(tab==='hareket'){
    $('gApplied').textContent=selected.ad+' seçildi.';
   }else{
    base();$('gApplied').textContent=selected.ad+' seçildi.';
   }
  };
  if(opening?.editor||keepEditor)showEditor(true,keepEditor?tab:'dost');
  const food=opening?.food&&G.foods.find(f=>f.id===opening.food);
  if(food)react(food);
 };
 G.dur=stop;
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&st.screen==='giris')stop();});
})();
(function(){
 const previousRender=render,previousBack=back;
 render=function(){
  GIRIS.character=dostSecili();
  if(st.screen==='giris'){
   if(typeof SES!=='undefined')SES.sira=[];
   GIRIS.dur();document.getElementById('app').innerHTML=girisHTML();
   GIRIS.kur();document.body.dataset.screen='giris';return;
  }
  GIRIS.dur();previousRender();
  if(st.screen==='quiz'||st.screen==='board'||(typeof YR_SCREENS!=='undefined'&&YR_SCREENS.includes(st.screen))){
   const top=document.querySelector('#app .top');
   if(top&&!document.querySelector('.gs-strip'))top.insertAdjacentHTML('afterend','<div class="gs-strip" aria-hidden="true">İşin Mutfağına Yolculuk</div>');
  }
 };
 back=function(){if(st.screen==='giris'){GIRIS.geri();return;}previousBack();};
 if(st.screen==='welcome'){st.screen='giris';render();}
})();
