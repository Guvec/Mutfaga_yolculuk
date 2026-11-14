/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Mutfak Araçları: sorarken öğreten soru ekranı.
   - Fotoğraflı seçenekler 2×2 kartta. Aynı aileden araçlar (kaşık, çatal, bıçak, fincan, bardak, tabak)
     gerçek boy oranıyla hazırlanmış görsellerle gösterilir (assets/mutfak-araclari/boy).
   - Her soruda tek yanıt. Doğruda adlar görünür, soru 1,5 saniye sonra kendiliğinden geçer.
   - Yanlışta seçilen araç ile doğrusu yan yana çıkar, altında ayırt etme cümlesi olur.
     Çubuk 6 saniyede dolar ve soru geçer; öğrenci dokunarak beklemeden geçebilir. */
'use strict';
const AS={t:null};
function asKonu(){return st.op==='mcq'&&st.subject==='mutfak-araclari';}
function asTemizle(){if(AS.t){clearTimeout(AS.t);AS.t=null;}}
function asCh(id){return st.q?st.q.choices.find(c=>c.id===id):null;}
function asAd(c){return c?(c.ad||c.text||c.id+' seçeneği'):'';}
/* Karşılaştırmada kullanılacak görsel: fotoğraflı seçenekte kendi görseli, adlı seçenekte aynı ailenin gerçek boy görseli. */
function asResim(c){return c?(c.image||c.ornek||''):'';}
/* Kart biçimi: kaşık-çatal-bıçak uzun ve dar, fincan-bardak uzun, tabaklar kare kartta. */
function asBicim(q){const im=q.choices.map(c=>c.image||'');if(im.every(x=>/\/boy\/(kasik|catal|bicak)-/.test(x)))return ' uzun';if(im.every(x=>/\/boy\/(fincan|bardak)-/.test(x)))return ' uzun kap';return '';}
function asIleri(){asTemizle();if(st.screen==='quiz'&&asKonu()&&st.done&&!st.kDone)nextQ();}

const AS_ANSWER=answer;
answer=function(v){
 if(!asKonu())return AS_ANSWER(v);
 if(st.done||!st.q||st.inBreak||st.modalOpen)return;
 if(typeof sesSus==='function')sesSus();
 const q=st.q,c=asCh(v);if(!c)return;
 const right=v===q.correct,secs=tStop(),cc=asCh(q.correct);
 q.responses=[{answer:v,text:asAd(c),at:Math.round(elapsed()*10)/10,correct:right}];
 st.done=true;st.res=right?1:0;st.asPick=v;st.lastRes=null;
 const S=st.sess;
 if(right){S.ok++;S.s+=10;}else S.bad++;
 S.qs.push({q:q.prompt,qid:q.id,a:asAd(cc),r:st.res,s:secs,selectedAnswer:asAd(c),firstAnswer:asAd(c),attempts:q.responses,attemptCount:1,hintUsed:false,assessment:S.practice==='check',explanation:q.explanation||'',source:q.source});
 if(typeof sesCal==='function')sesCal(right?'yerlesti':'tekrarDene');
 saveProgress();render();
 asTemizle();AS.t=setTimeout(asIleri,right?1500:6000);
};
const AS_NEXT=nextQ;
nextQ=function(){asTemizle();AS_NEXT();};
const AS_GO=go;
go=function(s){asTemizle();AS_GO(s);};

const AS_QUIZ=contentQuizHTML;
contentQuizHTML=function(){
 if(!asKonu()||!st.q||st.kDone)return AS_QUIZ();
 const q=st.q,done=st.done,pick=st.asPick;
 const say=(st.contentIndex||1),top=(st.contentItems||[]).length||1;
 let h=topBar(subjectName()+' · '+(q.group||'Sorular'))+'<div class="wrap as">';
 h+='<div class="as-bar" aria-hidden="true"><i style="width:'+Math.round(100*(say-(done?0:1))/top)+'%"></i></div>';
 h+='<div class="as-durum"><span>Soru '+say+' / '+top+'</span><span>Doğru: '+st.sess.ok+'</span></div>';
 const okunan=q.prompt+(q.choices.some(c=>c.image)?' Seçenekler fotoğraflıdır: A, B, C ve D.':' '+q.choices.map(c=>c.id+', '+asAd(c)).join('. ')+'.');
 h+='<div class="as-kok"><p>'+mcqPromptHTML(q)+'</p>'+(typeof sesDugme==='function'?sesDugme(okunan,'Soruyu dinle'):'')+'</div>';
 if(q.image)h+='<figure class="as-sira"><img src="'+esc(q.image)+'" alt="'+esc(q.imageAlt||'Soru görseli')+'"></figure>';
 const resimli=q.choices.some(c=>c.image);
 h+='<div class="as-grid'+(resimli?asBicim(q):' metin')+'">';
 q.choices.forEach(c=>{
  let cls='as-k';
  if(done){if(c.id===q.correct)cls+=' ok';else if(c.id===pick)cls+=' yan';else cls+=' sonuk';}
  h+='<button type="button" class="'+cls+'" data-choice="'+esc(c.id)+'"'+(done?' disabled':'')+' aria-label="'+esc(c.id+(resimli?' seçeneği':', '+asAd(c)))+'"><em>'+esc(c.id)+'</em>';
  if(resimli)h+='<span class="as-ol"><img src="'+esc(c.image)+'" alt=""></span>'+(done?'<span class="as-ad">'+esc(asAd(c))+'</span>':'');
  else h+='<span class="as-metin">'+esc(c.text)+'</span>';
  h+='</button>';
 });
 h+='</div>';
 if(done){
  const cc=asCh(q.correct),pc=asCh(pick);
  if(st.res===1){
   h+='<div class="as-geri ok" role="status"><b>Doğru! '+esc(asAd(cc))+'</b><span>'+esc(q.explanation||'')+'</span></div>';
  }else{
   const a=asResim(pc),b=asResim(cc);
   h+='<div class="as-geri yan" role="status" onclick="asIleri()"><b>Doğru cevap: '+esc(asAd(cc))+'</b>';
   if(a&&b)h+='<div class="as-kars"><figure><img src="'+esc(a)+'" alt=""><figcaption>Seçtiğin<br><b>'+esc(asAd(pc))+'</b></figcaption></figure><figure class="dogru"><img src="'+esc(b)+'" alt=""><figcaption>Doğru cevap<br><b>'+esc(asAd(cc))+'</b></figcaption></figure></div>';
   h+='<span>'+esc(q.explanation||'')+'</span><div class="as-cubuk" aria-hidden="true"><i></i></div><small>Beklemeden geçmek için dokun.</small></div>';
  }
 }
 return h+footHtml()+'</div>';
};

/* Çalışma biçimi seçimi: bu konuda ikinci deneme yok, açıklama hemen görünür. */
const AS_RENDER=render;
render=function(){
 if(st.screen==='mcqmode'&&st.subject==='mutfak-araclari'){
  document.getElementById('app').innerHTML=topBar(subjectName())+'<div class="wrap"><h1>Nasıl çalışalım?</h1><div class="list">'+
   menuButton('Öğreniyorum','Her soruda bir yanıt ver. Yanlışta doğrusunu yan yana görürsün.',"mcqBegin('learn')")+
   menuButton('Uyguluyorum','Aynı sorular karışık sırayla. Sonucun Rekorlarım\'a ve sıralamaya yazılır.',"mcqBegin('check')")+'</div></div>';
  return;
 }
 AS_RENDER();
};
/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
