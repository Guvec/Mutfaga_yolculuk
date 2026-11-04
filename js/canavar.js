/* Canavara Karşı Savaş: tek başına, internetsiz.
   Doğru cevap canavara vuruş olur, yanlış cevap bir can götürür. Süre baskısı yoktur: herkes kendi hızında çalışır.
   Sorular Oyun Odası ile aynı kaynaktan gelir; her yeni savaşta daha önce sorulmayanlar önce gelir. */
'use strict';
let CV=null;
const CV_CAN=3;
function cvBuild(){
 const c=CV.cfg,seed=crypto.getRandomValues(new Uint32Array(1))[0];
 const qs=YarisModel.buildFresh(yrData(c.subject),{subject:c.subject,kind:c.kind,set:c.set,n:c.n},seed,CV.used);
 CV.used=CV.used.concat(qs.map(q=>q.id));return qs;
}
async function cvStart(c){
 YR.error='';
 try{await yrWithTimeout(yrReady(c.subject),9000);}catch(e){YR.error=yrErrText(e);render();return;}
 CV={cfg:{subject:c.subject,kind:c.kind,set:c.set,n:c.n||YarisModel.N_DEFAULT},used:[],qs:[],k:0,hp:0,hp0:0,lives:CV_CAN,ph:'q',pick:null,right:false,over:false,win:false};
 cvNew(true);
}
function cvNew(first){
 const qs=cvBuild();
 if(qs.length<3){CV=null;YR.error='Bu seçimde yeterli soru yok. Başka bir takım seç.';st.screen='racecreate';render();return;}
 Object.assign(CV,{qs,k:0,hp0:Math.ceil(qs.length*0.6),lives:CV_CAN,ph:'q',pick:null,right:false,over:false,win:false});CV.hp=CV.hp0;
 sesSus();st.screen='cvplay';render();window.scrollTo(0,0);
}
function cvAns(i){
 if(!CV||CV.ph!=='q')return;
 const q=CV.qs[CV.k],ok=q.choices[i].id===q.correct;
 CV.ph='fb';CV.pick=i;CV.right=ok;
 if(ok){CV.hp--;if(typeof EFEKT!=='undefined')EFEKT.cal('tur');}else{CV.lives--;if(typeof EFEKT!=='undefined')EFEKT.cal('kayip');}
 render();
}
function cvNext(){
 if(!CV||CV.ph!=='fb')return;
 if(CV.hp<=0||CV.lives<=0||CV.k+1>=CV.qs.length){cvEnd();return;}
 CV.k++;CV.ph='q';CV.pick=null;render();window.scrollTo(0,0);
}
function cvEnd(){
 CV.over=true;CV.win=CV.hp<=0;
 if(typeof EFEKT!=='undefined')EFEKT.cal(CV.win?'win':'kayip');
 if(typeof sesSoyle==='function')sesSoyle(CV.win?'Canavarı yendin! Tebrikler.':'Bu sefer canavar kazandı. Tekrar deneyebilirsin.');
 if(typeof oduKazan==='function')oduKazan('canavar',CV.win?'win':'lose');
 st.screen='cvover';render();window.scrollTo(0,0);
}
function cvStatusHTML(){
 const pct=Math.max(0,Math.round(CV.hp/CV.hp0*100));
 return '<div class="cv-top"><div class="cv-mon" aria-hidden="true">👾</div><div class="cv-bars"><div class="cv-hp" role="img" aria-label="Canavarın gücü: '+Math.max(0,CV.hp)+' / '+CV.hp0+'"><div style="width:'+pct+'%"></div></div><small>Canavarın gücü: '+Math.max(0,CV.hp)+' / '+CV.hp0+'</small><div class="cv-can" role="img" aria-label="Canın: '+Math.max(0,CV.lives)+' / '+CV_CAN+'">'+[0,1,2].map(i=>i<CV.lives?'❤️':'🖤').join(' ')+'</div></div></div>';
}
function cvPlayHTML(){
 const q=CV.qs[CV.k],fb=CV.ph==='fb',last=CV.hp<=0||CV.lives<=0||CV.k+1>=CV.qs.length;
 let h=yrTop('Canavara Karşı Savaş')+'<div class="wrap">'+cvStatusHTML()+'<p class="yr-prog" id="yrHeading" tabindex="-1">Soru '+(CV.k+1)+' / '+CV.qs.length+'</p>'+yrQuestionHTML(q)+yrChoicesHTML(q,'cvAns',fb?{pick:CV.pick}:null);
 if(fb)h+='<div class="yr-fb '+(CV.right?'ok':'bad')+'" role="status"><b>'+(CV.right?'✓ Doğru! Canavara vurdun.':'Yanlış. Bir canın gitti.')+'</b>'+(CV.right?'':'<br>Doğru cevap: <b>'+esc(q.choices.find(c=>c.id===q.correct).text||q.correct)+'</b>')+(q.explanation?'<p>'+esc(q.explanation)+'</p>':'')+'</div><button class="btn pri" onclick="cvNext()" id="cvNext">'+(last?'Sonucu gör':'Sonraki soru')+'</button>';
 return h+'<button class="btn ghost" onclick="cvLeave()">Savaştan çık</button></div>';
}
function cvOverHTML(){
 return yrTop('Savaş bitti')+'<div class="wrap" style="text-align:center"><h1 id="yrHeading" tabindex="-1">'+(CV.win?'🏆 Canavarı yendin!':'Bu sefer canavar kazandı')+'</h1>'+cvStatusHTML()+'<p class="sub">'+(CV.win?'Güzel savaştın.':'Hiç sorun değil. Tekrar savaşırken yeni sorular gelir.')+'</p><button class="btn pri" onclick="cvNew()">⚔️ Yeniden savaş</button><button class="btn ghost" onclick="cvExit()">Çık</button></div>';
}
function cvExit(){CV=null;st.screen='racemenu';render();window.scrollTo(0,0);}
function cvLeave(){
 if(!CV){cvExit();return;}
 if(CV.over||CV.ph==='q'&&CV.k===0&&CV.lives===CV_CAN&&CV.hp===CV.hp0){cvExit();return;}
 modal('Savaştan çıkarsan bu savaş biter. Çıkmak istiyor musun?',()=>{closeModal();cvExit();});
}
YR_SCREENS.push('cvplay','cvover');
const CV_SCR=yrScreenHTML;
yrScreenHTML=function(){
 switch(st.screen){
  case 'cvplay':return CV?cvPlayHTML():yrMenuHTML();
  case 'cvover':return CV?cvOverHTML():yrMenuHTML();
 }
 return CV_SCR();
};
const CV_BACK=back;
back=function(){if(st.screen==='cvplay'||st.screen==='cvover'){cvLeave();return;}CV_BACK();};
