/* Çoktan seçmeli sorular: konu (grup) seçimi, kitaptaki sıra, A-B-C-D harfleri ve fotoğraflı seçenekler.
   Soru metni, seçenek sırası ve doğru harf kaynaktaki gibi kalır; sorular karıştırılmaz. */
'use strict';
const MCQ_PREV_START=startContent,MCQ_PREV_RENDER=render,MCQ_PREV_QUIZ=contentQuizHTML;
function mcqGroups(){const d=getData();if(st.op!=='mcq')return [];
  const qs=d.questions||[];if(!qs.some(q=>q.group))return [];
  const list=(d.groups&&d.groups.length?d.groups:[...new Set(qs.map(q=>q.group))].map(g=>({label:g})));
  return list.map(g=>({...g,count:qs.filter(q=>q.group===g.label).length})).filter(g=>g.count);}
function pickGroup(i){st.mcqGroup=mcqGroups()[i].label;go('mcqmode');}
function mcqBegin(mode){st.practice=mode;startContent();}
startContent=function(setNo){
  if(st.op!=='mcq'||!mcqGroups().length)return MCQ_PREV_START(setNo);
  if(!st.mcqGroup){go('content');return;}
  const items=getData().questions.filter(q=>q.group===st.mcqGroup);
  st.contentItems=items.slice();st.contentIndex=0;st.brk=0;st.kDone=false;st.done=false;st.inBreak=false;st.contentSet=null;
  st.sess={id:Date.now(),p:st.guest?'Misafir':st.prof,t:new Date().toISOString(),op:'mcq',subject:st.subject,practice:st.practice||'learn',total:items.length,group:st.mcqGroup,s:0,ok:0,fix:0,bad:0,br:0,qs:[]};
  st.savedMsg=st.guest?'Misafir oturumu: sonuçlar kaydedilmiyor.':'';contentNext();st.screen='quiz';render();window.scrollTo(0,0);
};
const MCQ_PREV_PICK=pickContent;
pickContent=function(op){st.mcqGroup=null;MCQ_PREV_PICK(op);};
const MCQ_PREV_CAT=catName;
catName=function(r){const s=MCQ_PREV_CAT(r);return r.op==='mcq'&&r.group?s+' · '+r.group:s;};
function mcqListHTML(){
  const gs=mcqGroups();let h=topBar(subjectName())+'<div class="wrap"><h1>Çoktan Seçmeli Sorular</h1><p class="sub">Bir konu seç.</p>';
  let ch=null;
  gs.forEach((g,i)=>{
    if(g.chapter&&g.chapter!==ch){if(ch!==null)h+='</div>';ch=g.chapter;h+='<h2 class="grp-h">'+ch+'. Bölüm</h2><div class="list set-list grp-list">';}
    h+=menuButton(g.label.replace(/^\d\. Bölüm · /,''),g.count+' soru',"pickGroup("+i+")");
  });
  return h+(ch!==null?'</div>':'')+'</div>';
}
contentQuizHTML=function(){
  if(st.op!=='mcq'||!st.q||!st.q.group)return MCQ_PREV_QUIZ();
  const q=st.q;
  let h=topBar(subjectName()+' · '+q.group,true)+'<div class="wrap">'+statsHtml();
  h+='<section class="card"><h2>'+esc(q.prompt)+'</h2>'+(q.image?'<img class="content-image match-image" src="'+esc(q.image)+'" alt="'+esc(q.imageAlt||'Soru fotoğrafı')+'">':'');
  const pic=q.choices.some(c=>c.image);
  h+='<div class="opts'+(pic?' opts-pic':' opts-mcq')+'">';
  q.choices.forEach(c=>{const dis=st.done||st.tries>=2||st.wrong.includes(c.id);
    h+='<button class="opt'+(st.practice!=='check'&&st.wrong.includes(c.id)?' wrong':'')+(st.practice!=='check'&&st.done&&c.id===q.correct?' right':'')+'" data-choice="'+esc(c.id)+'"'+(dis?' disabled':'')+'>'+
      (c.image?'<img src="'+esc(c.image)+'" alt="'+esc(c.imageAlt||c.id+' seçeneği')+'"><span class="olet">'+esc(c.id)+')</span>':'<span class="olet">'+esc(c.id)+')</span> '+esc(c.text))+'</button>';});
  h+='</div></section>'+msgHtml();
  if(st.done)h+='<button class="btn pri" onclick="nextQ()">Devam</button>';else if(st.tries>=2)h+='<button class="btn pri" onclick="showSol()">Yanıtı Gör</button>';
  return h+footHtml()+'</div>';
};
render=function(){
  if(st.screen==='mcqmode'){document.getElementById('app').innerHTML=topBar(subjectName())+'<div class="wrap"><h1>Nasıl çalışalım?</h1><div class="list">'+menuButton('Öğreniyorum','Yanlışta ipucu ve ikinci deneme var.',"mcqBegin('learn')")+menuButton('Uyguluyorum','Her soruda bir yanıt ver. Açıklamalar çalışma bitince açılır.',"mcqBegin('check')")+'</div></div>';return;}
  if(st.screen==='content'&&st.op==='mcq'&&CONTENT[st.subject]&&mcqGroups().length){document.getElementById('app').innerHTML=mcqListHTML();return;}
  MCQ_PREV_RENDER();
};
