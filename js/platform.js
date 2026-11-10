/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Konu verileri oyun motorlarından ayrıdır. GitHub Pages üzerinde derleme gerekmez. */
'use strict';
const SUBJECTS = [
  {id:'baharat', name:'Baharatlar ve Diğer Mutfak Ürünleri', desc:'Baharat ve aromatik ürünleri tanı. Görsele bak, adını öğren.'},
  {id:'kuver', name:'Kuver', desc:'Basit kuver ve tabldot kuver çalışmaları.'},
  {id:'mutfak-araclari', name:'Mutfak Araçları', desc:'Mutfak araçlarını tanı. Görsele bak, adını öğren.'},
  {id:'beslenme-ilkeleri', name:'Beslenme İlkeleri', desc:'Hazırlanıyor.'},
  {id:'bulasik-makinesi-temizligi', name:'Bulaşık Yıkama ve Atık Yönetimi', desc:'Elde yıkama, makinede yıkama ve atıkları ayırma.'}
];
const CONTENT = Object.create(null);
const OLD_RENDER = render, OLD_NEWQ = newQ, OLD_START = startSession, OLD_RESOLVE = resolve;
const OLD_QUIZ = quizHtml, OLD_ITEM = itemImg;
VERSION='Sürüm · 04.11.2026 · Takım kapakları ve birlikte tekrar'; // Her yüklemede tarih güncellenir.
st.subject='kuver'; st.practice='learn';
LEVELS={
  1:{name:'Basit Kuver', items:['yemek_catali','yemek_bicagi','pecete','corba_kasigi','su_bardagi']},
  3:{name:'Tabldot Kuver', items:['yemek_catali','yemek_bicagi','pecete','corba_kasigi','su_bardagi','ekmek_tabagi','tereyagi_bicagi','tatli_catali','tatli_kasigi']}
};
ITEMS.kuver_tabagi.kural='Bu çalışmada kuver tabağı konuğun önüne, masa kenarından iki parmak (yaklaşık 2 cm) içeri konur.';
ITEMS.corba_kasigi.ayirt='Çorba içmek için kullanılır. Tatlı kaşığından büyüktür.';
ITEMS.pecete.kural='Bu kuverde peçeteyi çatalın soluna koyuyoruz.';
ITEMS.pecete.ayirt='Peçete ağız çevresini ve elleri silmek için kullanılır. Bu düzende çatalın solundadır.';
ITEMS.yemek_catali.kural='Yemek çatalı tabağın soluna konur. Ana yemek bıçağıyla birlikte kullanılır.';
ITEMS.yemek_bicagi.kural='Yemek bıçağı tabağın sağına konur. Keskin ağzı tabağa bakar.';
ITEMS.corba_kasigi.kural='Bu menüde çorba önce servis edilir. Çorba kaşığı bıçağın sağına, en dışa konur.';
ITEMS.tatli_catali.kural='Bu düzende tatlı çatalı tabağın üst tarafına konur. Sapı sola bakar.';
const PLACE_LABEL={yemek_catali:'Tabağın solu',yemek_bicagi:'Tabağın sağı',pecete:'En sol bölüm',corba_kasigi:'Sağ dış bölüm',su_bardagi:'Sağ üst bölüm',ekmek_tabagi:'Sol üst bölüm',tereyagi_bicagi:'Sol üstteki tabağın sağ kenarı',tatli_catali:'Tabağın üstündeki alt sıra',tatli_kasigi:'Tabağın üstündeki üst sıra'};
function subjectName(){ return SUBJECTS.find(s=>s.id===st.subject).name; }
/* Takım adı: "6. takım · Pişirme kapları ve bıçaklar" (başlık varsa). */
function setName(n){const d=(typeof getData==='function'&&getData())||{};return n+'. takım'+(d.setTitles&&d.setTitles[n]?' · '+d.setTitles[n]:'');}
function setCard(n,d,count){return '<button type="button" class="design-topic set-topic" onclick="startContent('+n+')"><span class="design-topic-art set-collage">'+[].concat(d.setCovers[n]).slice(0,4).map(u=>'<img src="'+esc(u)+'" alt="" loading="lazy">').join('')+'</span><span class="set-no">'+n+'. takım</span><span class="set-row"><span class="set-badge" aria-hidden="true">'+n+'</span><span class="design-topic-name">'+esc((d.setTitles&&d.setTitles[n])||'')+'</span></span><span class="design-topic-note">'+count+' kart</span></button>';}
function menuButton(title,desc,action){return '<button class="menu-btn" onclick="'+action+'"><b>'+esc(title)+'</b><span>'+esc(desc)+'</span></button>';}
function glassHTML(cls='',style=''){
  return '<span role="img" aria-label="Su bardağı" class="glass '+cls+'" style="'+style+'"></span>';
}
itemImg=function(k,extra){if(k!=='su_bardagi')return OLD_ITEM(k,extra);return glassHTML('it'+(extra||''),'left:86%;top:19%;width:18%;aspect-ratio:1');};
function thumb(k){return k==='su_bardagi'?glassHTML('glass-thumb'):'<img src="'+IMG[k]+'" alt="'+esc(ITEMS[k].ad)+'">';}
function exampleHTML(){
  if(st.lvl===3)return '<img class="done-photo" src="'+IMG.ornek_kuver+'" alt="Tabldot kuver örneği">';
  return '<div class="table" role="img" aria-label="Çorba ve ana yemek menüsü için basit kuver örneği">'+['kuver_tabagi'].concat(LEVELS[1].items).map(k=>itemImg(k)).join('')+'</div>';
}
catName=function(r){
  if(r.subject && r.subject!=='kuver')return (SUBJECTS.find(s=>s.id===r.subject)||{name:r.subject}).name+' · '+({mcq:'Çoktan Seçmeli Sorular',match:'Eşleştirme',word:'Kelime Kartları'}[r.op]||r.op)+(r.set?' · '+r.set+'. takım':'')+(r.op==='match'&&r.set?(r.practice==='check'?' · Uyguluyorum':' · Öğreniyorum'):'');
  const kind=r.variant?(r.variant==='tabldot'?'Tabldot Kuver':'Basit Kuver'):(r.d===3?'Eski tam kuver':r.d===2?'Eski seviye 2':'Eski temel kuver');
  return (r.op==='kur'?'Kuveri Kur · '+kind:'Adını Bul')+(r.practice==='check'?' · Uyguluyorum':r.practice==='learn'?' · Öğreniyorum':'');
};
back=function(){const m={profiles:'welcome',home:'profiles',subject:'home',level:'subject',mode:'level',summary:'subject',history:'home',content:'subject',classification:'subject'};go(m[st.screen]||'home');};
function openSubject(id){st.subject=id;go('subject');}
pickOp=function(op){st.op=op;go(op==='kur'?'level':'mode');};
pickLevel=function(l){st.lvl=l;go('mode');};
function choosePractice(v){st.practice=v;startSession();}
startSession=function(){
  if(st.op!=='kur'&&st.op!=='ad'){startContent();return;}
  st.kDone=false;st.done=false;st.q=null; // önceki oturumun 'tamamlandı' durumu yeni oturuma taşınmasın
  OLD_START(); st.sess.subject=st.subject;st.sess.practice=st.practice;
  if(st.op==='kur')st.sess.variant=st.lvl===3?'tabldot':'basit';
};
newQ=function(keepMsg){
  if(st.op==='ad' && st.sess && st.sess.qs.length>=10){st.q=null;st.kDone=true;st.run=false;st.t0=0;return;}
  OLD_NEWQ(keepMsg);
};
newKuverBtn=function(){startSession();};
statsHtml=function(){const total=st.op==='kur'?LEVELS[st.lvl].items.length:st.op==='ad'?10:(st.contentItems||[]).length;
  return '<div class="stats"><span class="chip">Tamamlanan <b>'+st.sess.qs.length+' / '+total+'</b></span><span class="chip">Puan <b>'+st.sess.s+'</b></span></div>';};
footHtml=function(){return '<div class="foot"><button class="btn sm ghost" onclick="askBreak()"'+((st.brk||st.done||st.kDone)?' disabled':'')+'>Mola ver'+(st.brk?' (kullanıldı)':' (1 hak)')+'</button><button class="btn sm" onclick="askFinish()">Bitir ve Raporu Gör</button></div><p class="saved">'+esc(st.savedMsg)+'</p>';};
tableHtml=function(){
  let h='<div class="table" id="tbl" aria-label="Kuver yerleştirme alanı">';
  const keys=['kuver_tabagi'].concat(LEVELS[st.lvl].items);
  const showAll=st.practice==='learn'||st.kDone;
  keys.forEach(k=>{if(st.placed[k]&&(showAll||k==='kuver_tabagi'||(st.done&&st.q&&st.q.key===k)))h+=itemImg(k);});
  if(!st.kDone)keys.filter(k=>k!=='kuver_tabagi').forEach(k=>{
    const it=ITEMS[k],pos='style="left:'+it.mx+'%;top:'+it.my+'%"';
    if(st.done&&st.q&&st.q.key===k)h+='<span class="slot '+(st.res===0?'showring':'okring')+'" '+pos+'></span>';
    else if(st.practice==='check'||!st.placed[k]){
      const wr=st.wrong.includes(k),dis=wr||st.done||st.tries>=2;
      h+='<button class="slot'+(wr?' wrong':'')+'" '+pos+(dis?' disabled':'')+' aria-label="'+PLACE_LABEL[k]+'" onclick="answer(\''+k+'\')"></button>';
    }
  });return h+'</div>';
};
answer=function(v){
  if(st.done||st.tries>=2||!st.q||st.inBreak||st.modalOpen)return;
  if(st.op!=='kur'&&st.op!=='ad'){const c=st.q.choices.find(x=>x.id===v);st.q.responses=st.q.responses||[];st.q.responses.push({answer:v,text:c?(c.text||c.id+' seçeneği'):v,at:Math.round(elapsed()*10)/10,correct:v===st.q.correct});}
  const right=st.op==='kur'?v===st.q.key:st.op==='ad'?v===st.q.ans:v===st.q.correct;
  if(right){resolve(st.tries===0?1:2);return;}
  st.tries++;st.wrong.push(v);
  if(st.practice==='check'){
    st.tries=2;st.lastRes={cls:'bad',head:'Yanıtın kaydedildi.',text:'Açıklamayı görmek için düğmeye dokun.'};
  }else{
    const hint=st.op==='kur'?ITEMS[st.q.key].kural:st.op==='ad'?ITEMS[st.q.key].ayirt:(st.q.hint||(st.op==='mcq'?'Soruyu ve seçenekleri yeniden incele.':'Kartı ve seçenekleri yeniden incele.'));
    st.lastRes={cls:'fix',head:st.tries===1?'Birlikte tekrar deneyelim.':'Doğru yanıtı inceleyelim.',text:st.tries===1?hint:'Açıklamayı görmek için düğmeye dokun.'};
  }if(st.tries>=2)pauseT();render();
};
resolve=function(r){
  if(st.op==='kur'||st.op==='ad'){
    OLD_RESOLVE(r);
    const row=st.sess.qs.at(-1);row.prompt=st.q.key;row.hintUsed=st.tries>0&&st.practice==='learn';row.assessment=st.practice==='check';saveProgress();return;
  }
  const q=st.q,s=tStop();st.done=true;st.res=r;
  if(r===1){st.sess.ok++;st.sess.s+=10;}else if(r===2){st.sess.fix++;st.sess.s+=5;}else st.sess.bad++;
  st.sess.qs.push({selectedAnswer:(q.responses||[]).at(-1)?.text||null,firstAnswer:(q.responses||[])[0]?.text||null,attempts:q.responses||[],attemptCount:(q.responses||[]).length,assessment:st.practice==='check',q:q.set&&q.source&&q.source.card?q.set+'. takım, '+q.source.card+'. kart':q.prompt,a:q.correctText,r,s,hintUsed:st.practice!=='check'&&st.tries>0,source:q.source});
  st.lastRes={cls:r===1?'ok':'fix',head:r===1?'Doğru! +10 puan':r===2?'Düzelttin! +5 puan':'Doğru yanıt: '+q.correctText,text:q.explanation||''};if(hizliTebrik(st.sess,r===1,s*1000))st.lastRes.head='Çok hızlısın, minik şef! ⚡ +10 puan';saveProgress();render();
};
quizHtml=function(){
  if(st.op!=='kur'&&st.op!=='ad')return contentQuizHTML();
  if(st.op==='ad'&&st.kDone)return topBar('Adını Bul')+'<div class="wrap"><div class="msg ok"><b>Çalışma tamamlandı.</b>10 parçayı inceledin.</div>'+statsHtml()+'<button class="btn pri" onclick="finish()">Raporu Gör</button></div>';
  let h=OLD_QUIZ();
  h=h.replace('<img class="done-photo" src="'+IMG.ornek_kuver+'" alt="Örnek kuver">',exampleHTML());
  h=h.replace(' · '+LEVELS[st.lvl].name.split(' · ')[0],' · '+LEVELS[st.lvl].name);
  h=h.replace('<img src="'+IMG.su_bardagi+'" alt="">',glassHTML('glass-thumb'));
  h=h.replace('Kuver tamamlandı.','Çalışma tamamlandı.');
  if(st.op==='ad'){
    h=h.replace('<div class="table">','<div class="table" role="img" aria-label="Adı sorulan kuver parçası; diğer parçalar boyut karşılaştırması için soluk gösterilir.">');
    // Hedefi renk dışında çerçeve ve okla da işaretle; cevabı erişilebilir adda açıklama.
    const it=ITEMS[st.q.key];h=h.replace('</div></div><div class="side">','<span class="target-pointer" style="left:'+it.x+'%;top:'+it.y+'%" aria-hidden="true">↓</span></div></div><div class="side">');
  }
  return h;
};
const CORE_MODAL=modal,CORE_CLOSE=closeModal;
let modalFocus=null;
modal=function(text,yesFn){modalFocus=document.activeElement;CORE_MODAL(text,yesFn);const d=document.querySelector('#ov>div');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','Onay');document.getElementById('mNo').focus();};
closeModal=function(){CORE_CLOSE();if(modalFocus&&modalFocus.isConnected)modalFocus.focus();};
const CORE_BREAK=startBreak;
startBreak=function(){CORE_BREAK();document.querySelector('#ov>div').setAttribute('role','dialog');document.querySelector('#ov>div').setAttribute('aria-modal','true');document.getElementById('bGo').focus();};
document.addEventListener('keydown',e=>{if(!document.getElementById('ov').classList.contains('on'))return;const els=[...document.querySelectorAll('#ov button:not(:disabled), #ov select:not(:disabled), #ov input:not(:disabled), #ov summary, #ov [tabindex="0"]')];if(e.key==='Tab'&&els.length){if(e.shiftKey&&document.activeElement===els[0]){e.preventDefault();els.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===els.at(-1)){e.preventDefault();els[0].focus();}}if(e.key==='Escape'&&!st.inBreak)closeModal();});
function getData(){return CONTENT[st.subject]||{questions:[],matches:[],words:[]};}
function contentArr(){const d=getData();return st.op==='mcq'?d.questions:st.op==='match'?d.matches:d.words;}
function classificationHTML(){
 const d=getData(),groups=d.classification||[],items=d.matches||[];
 let h=topBar('Servis takımlarını tanı').replace('back()',"go('subject')")+'<div class="wrap"><h1>Servis takımlarını tanı</h1><p class="card">Önce grupları incele. Sonra eşleştirme oyununda çalış. Benzer tabak ve metal takımların boylarını birlikte karşılaştır. Görseli büyütmek için üzerine dokun.</p>';
 groups.forEach((g,i)=>{h+='<details class="card classification-group"'+(i===0?' open':'')+'><summary>'+esc(g.title)+'</summary><div class="classification-grid">';g.items.forEach(id=>{const it=items.find(x=>x.id===id);if(!it)return;h+='<article class="classification-item"><a href="'+esc(it.image)+'" target="_blank" rel="noopener" aria-label="'+esc(it.answer)+' görselini büyüt"><img src="'+esc(it.image)+'" alt="'+esc(it.answer)+'"></a><h2>'+esc(it.answer)+'</h2><p>'+esc(it.explanation)+'</p>'+sesDugme(it.answer+'. '+it.explanation)+'</article>';});h+='</div></details>';});
 return h+'<button class="btn pri" onclick="pickContent(\'match\')">Eşleştirme oyununa geç</button></div>';
}

/* Kartlarda "set" alanı varsa oturum takım takım yapılır (ör. Mutfak Araçları: 11 takım × 12 kart). */
function contentSets(){return [...new Set(contentArr().filter(x=>x.set).map(x=>x.set))].sort((a,b)=>a-b);}
function pickContent(op){st.op=op;st.practice='learn';st.contentSet=null;if(typeof boardSetsFill==='function')boardSetsFill();go('content');}
function startContent(setNo){
  if(setNo!==undefined)st.contentSet=setNo;
  const all=contentArr(),arr=st.contentSet&&all.some(x=>x.set)?all.filter(x=>x.set===st.contentSet):all;
  st.contentItems=shuffle(arr);st.q=null;st.contentIndex=0;st.brk=0;st.kDone=false;st.done=false;st.inBreak=false;
  st.sess={id:Date.now(),p:st.guest?'Misafir':st.prof,t:new Date().toISOString(),op:st.op,subject:st.subject,practice:'learn',set:st.contentSet||undefined,s:0,ok:0,fix:0,bad:0,br:0,qs:[]};
  st.savedMsg=st.guest?'Misafir oturumu: sonuçlar kaydedilmiyor.':'';contentNext();st.screen='quiz';render();
}
/* Kart seçenekleri: önce kitapta karşılaştırılan benzer araçlar (en çok 2), sonra aynı takımdan adlar.
   Aynı ad birden çok takımda bulunduğu için seçenekler ada göre tekilleştirilir. */
function cardChoices(q){
  const names=[...new Set(contentArr().map(x=>x.answer))],used=new Set([q.answer]),out=[];
  const add=t=>{if(out.length<3&&!used.has(t)){used.add(t);out.push(t);}};
  (q.similar||[]).filter(t=>names.includes(t)).slice(0,2).forEach(add);
  shuffle(st.contentItems.map(x=>x.answer)).forEach(add);
  shuffle(names).forEach(add);
  return shuffle([{id:q.id,text:q.answer}].concat(out.map((t,i)=>({id:'x'+i,text:t}))));
}
function contentNext(){
  st.tries=0;st.done=false;st.wrong=[];st.lastRes=null;
  const q=st.contentItems[st.contentIndex++];if(!q){st.kDone=true;st.q=null;return;}
  let choices,correct,correctText;
  if(st.op==='mcq'){choices=q.choices.map(c=>({...c}));correct=q.correct;const cc=choices.find(c=>c.id===correct);correctText=q.group?(cc.image?cc.id+' seçeneği':cc.id+') '+cc.text):cc.text;}
  else{choices=cardChoices(q);correct=q.id;correctText=q.answer;}
  st.q={...q,choices,correct,correctText,responses:[]};tStart();
}
const CORE_NEXT=nextQ;
nextQ=function(){if(st.op==='kur'||st.op==='ad')CORE_NEXT();else{contentNext();render();}};
function contentQuizHTML(){
  let h=topBar(subjectName()+' · '+({mcq:'Sorular',match:'Eşleştirme',word:'Kelime Kartları'}[st.op])+(st.contentSet?' · '+st.contentSet+'. takım':''),true)+'<div class="wrap">'+statsHtml();
  if(st.kDone)return h+'<h2>Çalışma tamamlandı.</h2><button class="btn pri" onclick="finish()">Raporu Gör</button></div>';
  const q=st.q;
  h+='<section class="card"><h2>'+esc(q.prompt)+'</h2>'+(q.image?'<img class="content-image match-image" src="'+esc(q.image)+'" alt="'+esc(q.imageAlt||'Eşleştirilecek araç')+'">':'')+'<div class="opts">';
  q.choices.forEach(c=>{const dis=st.done||st.tries>=2||st.wrong.includes(c.id);h+='<button class="opt'+(st.wrong.includes(c.id)?' wrong':'')+(st.done&&c.id===q.correct?' right':'')+'" data-choice="'+esc(c.id)+'"'+(dis?' disabled':'')+'>'+esc(c.text)+'</button>';});
  h+='</div></section>'+msgHtml();
  if(st.done)h+='<button class="btn pri" onclick="nextQ()">Devam</button>';else if(st.tries>=2)h+='<button class="btn pri" onclick="showSol()">Yanıtı Gör</button>';
  return h+footHtml()+'</div>';
}
render=function(){
  let h=null;
  if(st.screen==='welcome')h='<div class="welcome"><img src="assets/acilis-kolaj.jpg" alt="Tabldot kuver, çorba tenceresi, çırpma teli ve bulaşık makinesi"><h1>Mesleki Oyunlar</h1><p class="sub">Yiyecek ve İçecek Hizmetleri</p><button class="btn pri start" onclick="go(\'profiles\')">Başlayalım</button><p class="ver">'+VERSION+'</p></div>';
  else if(st.screen==='home')h=topBar('Konu klasörleri')+'<div class="wrap"><h1>Ne çalışalım?</h1><p class="sub">Bir konu seç.</p><div class="list">'+SUBJECTS.map(s=>s.id==='beslenme-ilkeleri'?'<div class="menu-btn preparing" aria-disabled="true"><b>'+esc(s.name)+'</b><span>Hazırlanıyor</span></div>':menuButton(s.name,s.desc,"openSubject('"+s.id+"')")).join('')+(st.guest?'':menuButton('Çalışma Geçmişim','Son 14 günün sonuçları.',"go('history')"))+'</div></div>';
  else if(st.screen==='classification')h=classificationHTML();
  else if(st.screen==='subject'){
    h=topBar(subjectName())+'<div class="wrap"><h1>'+subjectName()+'</h1><div class="list">';
    if(st.subject==='kuver')h+=menuButton('Kuveri Kur','Basit kuver veya tabldot kuver.',"pickOp('kur')")+menuButton('Adını Bul','Kuver parçalarını tanı.',"pickOp('ad')");
    // Kuver parçaları Adını Bul ve Mutfak Araçları eşleştirmesinde zaten çalışılır; Kuver'de ayrı eşleştirme yok.
    // Kelime Kartları, 12'li eşleştirmenin tekrarı olduğu için menüden kaldırıldı.
    if(st.subject==='baharat')h+=menuButton('Ürünleri açıklamalarıyla tanı','Sıvılar, tozlar ve diğer ürünler. Bu bölüm puanlanmaz.',"go('spicelearn')");
    if(st.subject==='mutfak-araclari')h+=menuButton('Servis takımlarını tanı','Tabakları, metal takımları ve servis kaplarını gruplarıyla öğren.',"go('classification')");
    if(st.subject!=='kuver'&&!(typeof yolKonuVar==='function'&&yolKonuVar(st.subject)))h+=menuButton('Eşleştirme','12 görseli doğru adla eşleştir.',"pickContent('match')");
    if(st.subject!=='baharat'&&st.subject!=='kuver')h+=menuButton('Çoktan Seçmeli Sorular','Bu konuya ait sorular.',"pickContent('mcq')");h+='</div></div>';
  }else if(st.screen==='level')h=topBar('Kuveri Kur')+'<div class="wrap"><h1>Kuver seç</h1><div class="list">'+menuButton('Basit Kuver','6 parça · Çorba ve ana yemek menüsü. Kuver tabağı hazır.',"pickLevel(1)")+menuButton('Tabldot Kuver','10 parça · Bu çalışmanın örnek düzenine göre.',"pickLevel(3)")+'</div></div>';
  else if(st.screen==='mode')h=topBar('Çalışma biçimi')+'<div class="wrap"><h1>Nasıl çalışalım?</h1><div class="list">'+menuButton('Öğreniyorum','İpucu ve ikinci deneme ile çalış.',"choosePractice('learn')")+menuButton('Uyguluyorum','Her soruyu bir kez yanıtla. Sonra açıklamayı incele.',"choosePractice('check')")+'</div><p class="note">Her oturumda 1 mola hakkın var.</p></div>';
  else if(st.screen==='content'){
    const d=getData(),a=st.op==='mcq'?d.questions:st.op==='match'?d.matches:d.words;
    h=topBar(subjectName())+'<div class="wrap"><h1>'+({mcq:'Çoktan Seçmeli Sorular',match:'Eşleştirme',word:'Kelime Kartları'}[st.op])+'</h1>';
    if(CONTENT[st.subject]===null)h+='<p role="alert">İçerik yüklenemedi. Bağlantını kontrol edip yeniden dene.</p><button class="btn" onclick="loadContent()">Yeniden Dene</button>';
    else if(!CONTENT[st.subject])h+='<p>İçerik yükleniyor…</p>';
    else if(!a.length)h+='<p class="card">Bu konuda henüz etkinlik yok. Konu menüsünden başka bir çalışma seçebilirsin.</p>';
    else if(contentSets().length)h+='<p class="sub">Bir takım seç. Her takımda '+a.filter(x=>x.set===contentSets()[0]).length+' kart var.</p><div class="list set-list">'+contentSets().map(n=>d.setCovers&&d.setCovers[n]?setCard(n,d,a.filter(x=>x.set===n).length):menuButton(setName(n),a.filter(x=>x.set===n).length+' kart',"startContent("+n+")")).join('')+'</div>';
    else h+='<p>'+a.length+' etkinlik hazır.</p><button class="btn pri" onclick="startContent()">Başla</button>';
    h+='</div>';
  }
  if(h!==null)document.getElementById('app').innerHTML=h;else OLD_RENDER();
  if(st.screen==='summary'){
    const c=st.sess;document.querySelector('.rep').insertAdjacentHTML('beforeend','<section class="card"><h2>Sonuç özeti</h2><p>İlk denemede doğru: '+c.ok+' · İkinci denemede: '+c.fix+' · Yanlış / yanıt gösterilen: '+c.bad+'</p><p class="note">'+(c.practice==='check'?'Bağımsız deneme':'İpucu içerebilen öğrenme çalışması')+'.'+(c.op==='kur'?' Ekranda yer seçimi, atölyede bağımsız kuver açma becerisinden ayrı değerlendirilir.':'')+'</p><div class="report-scroll"><table><thead><tr><th>Soru / Parça</th><th>Doğru yanıt</th><th>Sonuç</th></tr></thead><tbody>'+c.qs.map(q=>'<tr><td>'+esc(q.q)+'</td><td>'+esc(q.a)+'</td><td>'+(q.r===null?'Yanıtlanmadı':q.r===1?'İlk denemede':q.r===2?'İpucundan sonra':'Yanlış / yanıt gösterildi')+'</td></tr>').join('')+'</tbody></table></div></section>');
  }
  document.querySelectorAll('.msg').forEach(e=>{e.setAttribute('role','status');e.setAttribute('aria-live','polite');});
  const nameInput=document.getElementById('pname');if(nameInput)nameInput.setAttribute('aria-label','Adın');
  document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>answer(b.dataset.choice));
  if(st.screen==='quiz'&&st.op==='ad')document.querySelectorAll('.table .it').forEach(img=>{img.setAttribute('aria-hidden','true');if(img.tagName==='IMG')img.alt='';});
  if(st.screen==='quiz'&&st.done){const b=[...document.querySelectorAll('button')].find(b=>b.textContent==='Devam');if(b)b.focus({preventScroll:true});}
};
function validateContent(d){
  for(const field of ['questions','matches','words'])if(!Array.isArray(d[field]))throw new Error('Eksik dizi: '+field);
  const ids=new Set();for(const q of d.questions){if(ids.has(q.id)||!q.id||!q.prompt||!Array.isArray(q.choices)||q.choices.length<2||!q.choices.some(c=>c.id===q.correct)||new Set(q.choices.map(c=>c.id)).size!==q.choices.length)throw new Error('Geçersiz soru');ids.add(q.id);}
  for(const f of ['matches','words']){const s=new Set();for(const q of d[f]){if(!q.id||!q.answer||!q.prompt||s.has(q.id))throw new Error('Geçersiz kart');s.add(q.id);}if(d[f].length===1)throw new Error('Eşleştirme için en az 2 kart gerekir');}
  return {...d,questions:d.questions.filter(q=>!q.disabled)};
}
async function loadContent(){await Promise.all(SUBJECTS.map(async s=>{try{const r=await fetch('content/'+s.id+'/icerik.json');if(!r.ok)throw Error(r.status);CONTENT[s.id]=validateContent(await r.json());}catch(e){CONTENT[s.id]=null;}}));if(st.screen==='content'||st.screen==='spicelearn')render();}
render();loadContent();
// Aynı kapsamda bulunan eski kuver service worker'ının eski index.html sunmasını önler.
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
  // Her açılışta yeni sürüm denetlenir.
  navigator.serviceWorker.register('sw.js').then(r=>r.update().catch(()=>{})).catch(()=>{});
}
// Uzun PDF soru metinlerinin görsel raporda yan yana taşmasını önler.
drawReport=function(r){
  const W=1080,c=document.createElement('canvas');c.width=W;let x=c.getContext('2d');x.font='22px Arial';
  const cols=[{x:40,w:320},{x:380,w:320},{x:720,w:190},{x:930,w:110}];
  const rows=r.qs.map((q,i)=>{const lines=[wrapText(x,(i+1)+'. '+q.q,cols[0].w),wrapText(x,q.a,cols[1].w),wrapText(x,q.r===null?'Yanıtlanmadı':q.r===1?'İlk denemede':q.r===2?'İpucundan sonra':'Yanlış / yanıt gösterildi',cols[2].w),[fmtS(q.s)]];return{q,lines,height:Math.max(...lines.map(a=>a.length))*29+22};});
  x.font='28px Arial';const category=wrapText(x,catName(r),W-80),top=190+category.length*36;
  c.height=top+180+rows.reduce((a,b)=>a+b.height,0)+100;x=c.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,W,c.height);x.fillStyle=C.teal;x.fillRect(0,0,W,top);
  x.fillStyle='#fff';x.font='bold 43px Arial';x.fillText('Mesleki Oyunlar',40,65);x.font='27px Arial';x.fillText('Öğrenci: '+r.p,40,112);category.forEach((t,i)=>x.fillText(t,40,158+i*36));
  let y=top+43;x.fillStyle=C.navy;x.font='bold 26px Arial';x.fillText('Puan: '+r.s+'   İlk denemede: '+r.ok+'   İkinci denemede: '+r.fix,40,y);y+=38;x.font='23px Arial';x.fillText('Yanıt gösterilen: '+r.bad+'   Mola: '+(r.br?'Kullanıldı':'Kullanılmadı')+'   Soru: '+r.qs.length,40,y);y+=52;
  x.fillStyle=C.soft;x.fillRect(30,y-29,W-60,46);x.fillStyle=C.navy;x.font='bold 22px Arial';['Soru / Parça','Doğru yanıt','Sonuç','Süre'].forEach((t,i)=>x.fillText(t,cols[i].x,y));y+=30;
  rows.forEach((row,i)=>{if(i%2){x.fillStyle='#f3f7f7';x.fillRect(30,y-10,W-60,row.height);}x.font='22px Arial';row.lines.forEach((ls,j)=>{x.fillStyle=j===2?(row.q.r===1?C.ok:C.fix):C.navy;ls.forEach((t,k)=>x.fillText(t,cols[j].x,y+17+k*29));});y+=row.height;});
  x.fillStyle=C.muted;x.font='20px Arial';x.fillText('Tarih: '+fmtDate(r.t)+' '+fmtTime(r.t)+' · '+(r.practice==='check'?'Bağımsız deneme':'Öğrenme çalışması'),40,c.height-28);return c;
};
