/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
'use strict';

const YANLIS_EKRANLARI=['summary','board','quiz','spicereview','aover','dover','raceover','cvover','haftaover'];
let YANLIS_TUR=null;

function yanlisSecim(text,image,alt){
 return {text:text||alt||'',image:image||'',alt:alt||text||''};
}
function yanlisSoru(q,a,subject){
 if(!q?.choices||!a||a.ok||a.skip)return null;
 const choices=q.choices.map(c=>({...yanlisSecim(c.text,c.image,c.alt||c.imageAlt),id:c.id}));
 if(!choices.some(c=>c.id===q.correct))return null;
 return {id:q.id||q.prompt,subject:q.subject||subject,prompt:q.prompt,image:q.image,imageAlt:q.imageAlt,
  choices,correct:q.correct,explanation:q.explanation||'',given:choices[a.pick]||null,reason:a.reason||''};
}
function yanlisSorular(qs,answers,subject){
 return answers.map((a,i)=>yanlisSoru(qs[i],a,subject)).filter(Boolean);
}
function yanlisYer(k,id){
 const item=ITEMS[k];
 return {...yanlisSecim(PLACE_LABEL[k]||item.yer),id,position:{x:item.mx??item.x,y:item.my??item.y}};
}
function yanlisKuver(row){
 const key=row.prompt||Object.keys(ITEMS).find(k=>row.q===ITEMS[k].ad||row.q.startsWith(ITEMS[k].AD+' için'));
 if(!key||!ITEMS[key])return null;
 const item=ITEMS[key],name=st.op==='ad';
 const choices=LEVELS[st.lvl].items.map(k=>name?{...yanlisSecim(ITEMS[k].ad),id:k}:yanlisYer(k,k));
 const given=row.firstAnswer||row.selectedAnswer;
 return {id:st.op+'|'+st.lvl+'|'+key,subject:'kuver',prompt:name?'Kuver parçasının adı nedir?':item.ad+' nereye yerleştirilir?',
  image:IMG[key],imageAlt:item.ad,choices,correct:key,explanation:name?item.ayirt:item.kural,given:given?yanlisSecim(given):null,place:!name};
}
function yanlisTekli(){
 const s=st.sess;if(!s||s.practice==='pek'||st.practice==='pek')return null;
 if(st.screen!=='summary'&&!st.kDone)return null;
 if(st.op==='match'&&st.board){
  const b=st.board;
  const items=b.items.flatMap(it=>{
   const final=b.pair[it.id]!==it.answer?b.pair[it.id]:null;
   const wrong=st.practice==='check'?final:(b.attempts[it.id]||[]).find(a=>a.correct===false)?.answer||final;
   if(!wrong)return [];
   const choices=[...new Set([it.answer,wrong,...b.names])].slice(0,4).map(text=>({...yanlisSecim(text),id:text}));
   return [{id:it.id,subject:st.subject,prompt:'Bu görselin adı nedir?',image:it.image,imageAlt:it.imageAlt||'Soru görseli',
    choices,correct:it.answer,given:yanlisSecim(wrong),explanation:it.explanation||''}];
  });
  return {key:'tek|'+s.id,items};
 }
 const items=s.qs.flatMap((row,i)=>{
  if(row.r===null||row.r===1)return [];
  if(st.op==='kur'||st.op==='ad'){const q=yanlisKuver(row);return q?[q]:[];}
  const q=(st.contentItems||[]).find(x=>x.id===row.qid||x.prompt===row.q)||(st.contentItems||[])[i];
  if(!q)return [];
  const given=row.firstAnswer||row.selectedAnswer;
  const source=q.choices?q:{...q,choices:cardChoices(q),correct:q.id};
  const bad=yanlisSoru(source,{pick:source.choices.findIndex(c=>c.text===given)},st.subject);
  if(bad&&!bad.given&&given)bad.given=yanlisSecim(given);
  return bad?[bad]:[];
 });
 return {key:'tek|'+s.id,items};
}
function yanlisSonuc(){
 switch(st.screen){
  case 'aover':
   if(!AR?.over)return null;
   return {key:'arena|'+arCacheKey(),items:yanlisSorular(YR.qs,AR.myR.map((v,i)=>AR.reviewResponses?.[i]||{ok:v>0,reason:'Cevap kaydı yok'}),YR.room.subject)};
  case 'dover':
   return DU?.over?{key:'duel|'+YR.room.created+'|'+DU.m,items:yanlisSorular(YR.qs,DU.reviewResponses||[],YR.room.subject)}:null;
  case 'raceover':
   return YR.g?.done?{key:'oda|'+YR.room.created,items:yanlisSorular(YR.qs,YR.g.log,YR.room.subject)}:null;
  case 'cvover':
   return CV?.over?{key:'okuma|'+CV.id,items:yanlisSorular(CV.qs,CV.log,CV.cfg.subject)}:null;
  case 'haftaover':
   return HAFTA?.done?{key:'hafta|'+HAFTA.id,items:yanlisSorular(HAFTA.qs,HAFTA.answers,'haftalik')}:null;
  default:return yanlisTekli();
 }
}
function yanlisAnahtar(q){return [q.subject,q.id].join('|');}
function yanlisDepo(){return ls('yanlislarim',{});}
function yanlisKuyruk(pid){return yanlisDepo()[pid]?.items||{};}
function yanlisKaydet(data){
 const pid=dostPid();if(!pid||!data?.items.length)return;
 const all=yanlisDepo(),entry=all[pid]||{seen:[],items:{}};
 if(entry.seen.includes(data.key))return;
 const items={...entry.items};
 data.items.forEach(q=>{delete items[yanlisAnahtar(q)];items[yanlisAnahtar(q)]={...q,reviewDay:null};});
 lsSet('yanlislarim',{...all,[pid]:{seen:entry.seen.concat(data.key).slice(-120),items:Object.fromEntries(Object.entries(items).slice(-240))}});
}
function yanlisSonrakiDers(){
 const pid=dostPid();return pid?Object.values(yanlisKuyruk(pid)).filter(q=>st.screen!=='pekmenu'||q.subject===st.subject):[];
}
function yanlisAc(later=false){
 const data=later?null:yanlisSonuc(),items=later?yanlisSonrakiDers():data?.items;
 if(!items?.length)return;
 yanlisKaydet(data);
 YANLIS_TUR={items:items.map(q=>({...q,choices:q.place?q.choices:shuffle(q.choices)})),index:0,
  phase:later?yanlisDersAsamasi(items[0]):'show',pick:null,correct:0,from:st.screen,pid:dostPid(),later};
 go('yanlislarim');yanlisOdak();
}
function yanlisYolAc(){
 const items=Y.yanlis.map(i=>{
  const q=Y.qs[i];
  return yanlisSoru({id:q.item.id,prompt:yolSoruMetni(q),image:q.tip==='gorsel'?null:q.item.image,
   imageAlt:'Soru görseli',choices:q.sec,correct:q.dogru,explanation:q.item.explanation},
  {pick:q.sec.findIndex(c=>c.id===q.cevap)},YOL_AYAR.subject);
 }).filter(Boolean);
 if(!items.length)return false;
 YANLIS_TUR={items:items.map(q=>({...q,choices:shuffle(q.choices)})),index:0,phase:'try',pick:null,
  correct:0,from:st.screen,pid:dostPid(),later:false,yol:true};
 go('yanlislarim');yanlisOdak();return true;
}
function yanlisOdak(){document.getElementById('yanlisBaslik')?.focus({preventScroll:true});}
function yanlisDersAsamasi(q){return q.reviewDay&&q.reviewDay<Rutbe.day()?'try':'show';}
function yanlisDevam(){
 const t=YANLIS_TUR;if(!t||t.phase==='try')return;
 if(t.phase==='show'){
  if(t.later)t.phase='try';
  else if(++t.index===t.items.length){t.index=0;t.phase='try';}
 }else{
  t.index++;t.pick=null;t.phase=t.index===t.items.length?'end':t.later?yanlisDersAsamasi(t.items[t.index]):'try';
 }
 sesSus();render();window.scrollTo(0,0);yanlisOdak();
}
function yanlisYanit(index){
 const t=YANLIS_TUR,q=t?.items[t.index];
 if(!q||t.phase!=='try'||!q.choices[index]||t.pid!==dostPid())return;
 t.pick=index;t.phase='feedback';
 if(q.choices[index].id===q.correct){
  t.correct++;
  if(t.pid&&!t.yol){
   const all=yanlisDepo(),entry=all[t.pid],key=yanlisAnahtar(q),prior=entry?.items[key],today=Rutbe.day();
   if(prior){
    if(t.later&&prior.reviewDay&&prior.reviewDay<today)delete entry.items[key];
    else entry.items[key]={...prior,reviewDay:prior.reviewDay||today};
    lsSet('yanlislarim',all);
   }
  }
 }else if(t.pid&&!t.yol){
  const all=yanlisDepo(),prior=all[t.pid]?.items[yanlisAnahtar(q)];
  if(prior){prior.reviewDay=null;lsSet('yanlislarim',all);}
 }
 render();document.getElementById('yanlisGeriBildirim')?.focus({preventScroll:true});
}
function yanlisKapat(){
 const t=YANLIS_TUR,from=t?.from||'home';YANLIS_TUR=null;sesSus();
 if(t?.yol){st.screen=from;yolFazBitir();return;}
 go(from);
 document.getElementById('yanlisAcBtn')?.focus({preventScroll:true});
}
function yanlisGorsel(choice){
 return choice?.image?'<img src="'+esc(choice.image)+'" alt="'+esc(choice.alt||'')+'">':'';
}
function yanlisMasa(q,answer,show,feedback){
 return '<div class="yanlis-masa" aria-label="Kuver yerleşimi"><span class="yanlis-tabak" aria-hidden="true"></span>'+
  (show||feedback?itemImg(answer.id):'')+q.choices.map((c,i)=>
  '<button type="button" style="--sol:'+c.position.x+'%;--ust:'+c.position.y+'%" aria-label="'+esc(c.text)+'"'+(show||feedback?' disabled':' onclick="yanlisYanit('+i+')"')+
  ' class="'+((show||feedback)&&c.id===answer.id?'dogru':'')+'">'+((show||feedback)&&c.id===answer.id?'✓':'•')+'</button>').join('')+'</div>';
}
function yanlisHTML(){
 const t=YANLIS_TUR;if(!t||t.pid!==dostPid())return topBar('Yanlışlarımı çalış')+'<div class="wrap"><button class="btn pri" onclick="yanlisKapat()">Geri dön</button></div>';
 const top=topBar('Yanlışlarımı çalış')+'<div class="wrap yanlis-ekran">';
 if(t.phase==='end')return top+'<h1 id="yanlisBaslik" tabindex="-1">Tekrar tamamlandı</h1><p>'+t.correct+' / '+t.items.length+' doğru</p>'+
  (t.pid?'<p>Tekrar gerektiren sorular Pekiştiriyorum bölümünde durur.</p>':'')+
  '<button class="btn pri" onclick="yanlisKapat()">Geri dön</button></div>';
 const q=t.items[t.index],show=t.phase==='show',feedback=t.phase==='feedback',correct=q.choices.find(c=>c.id===q.correct);
 const right=feedback&&q.choices[t.pick].id===correct.id;
 const info='Doğru cevap: '+correct.text+'. '+q.explanation;
 const options=show?'':q.place?'':q.choices.map((c,i)=>'<button class="btn'+(feedback&&c.id===correct.id?' yanlis-dogru':feedback&&i===t.pick?' yanlis-hata':'')+'" type="button" '+(feedback?'disabled':'onclick="yanlisYanit('+i+')"')+'>'+yanlisGorsel(c)+esc(c.text)+'</button>').join('');
 return top+'<p class="note">'+(show?'Doğru cevabı öğren':'Yeniden dene')+' · '+(t.index+1)+' / '+t.items.length+'</p>'+
  '<h1 id="yanlisBaslik" tabindex="-1">'+esc(q.prompt)+'</h1>'+yanlisGorsel({image:q.image,alt:q.imageAlt})+
  (q.place?yanlisMasa(q,correct,show,feedback):'')+
  (show?'<div class="yanlis-karsilastir"><section class="card"><h2>Verilen cevap</h2>'+yanlisGorsel(q.given)+'<p>'+esc(q.given?.text||q.reason||'Cevap kaydı yok')+'</p></section>'+
   '<section class="card"><h2>Doğru cevap</h2>'+yanlisGorsel(correct)+'<p>'+esc(correct.text)+'</p></section></div>':
   '<div class="yanlis-secenekler">'+options+'</div>')+
  (show||feedback?'<div class="yanlis-alt"><p id="yanlisGeriBildirim" tabindex="-1" role="status">'+(feedback?'<strong>'+(right?'Doğru.':esc(info))+'</strong>':'')+(show?esc(q.explanation):'')+'</p>'+
   sesDugme(info,'Açıklamayı dinle')+'<button class="btn pri" onclick="yanlisDevam()">'+(show?(t.later||t.index+1===t.items.length?'Yeniden dene':'Sonraki kart'):'Devam et')+'</button></div>':'')+'</div>';
}
const YANLIS_RENDER=render,YANLIS_BACK=back;
render=function(){
 if(st.screen==='yanlislarim'){document.getElementById('app').innerHTML=yanlisHTML();return;}
 YANLIS_RENDER();
 dostPuanSonucGoster();
 const result=YANLIS_EKRANLARI.includes(st.screen),later=st.screen==='pekmenu';
 if(!result&&!later)return;
 const data=result?yanlisSonuc():null,items=later?yanlisSonrakiDers():data?.items;
 if(!items?.length)return;
 yanlisKaydet(data);
 const wrap=document.querySelector('#app .wrap')||document.querySelector('#app .quiz .side');
 if(!wrap)return;
 if(result)wrap.querySelector('.rk-tekrar')?.remove();
 wrap.insertAdjacentHTML('afterbegin','<section class="card yanlis-giris"><button type="button" class="btn pri" id="yanlisAcBtn" onclick="yanlisAc('+later+')">'+(later?'Tekrar edilecek sorular':'Yanlışlarımı çalış')+' ('+items.length+')</button></section>');
};
back=function(){if(st.screen==='yanlislarim'){yanlisKapat();return;}YANLIS_BACK();};
