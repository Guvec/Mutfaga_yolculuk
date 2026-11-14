/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* 14.11 akşam (onaylı): Antrenman Şefi — bilgisayardaki şefe karşı 1'e 1 antrenman. İnternet ve oda gerekmez.
   • Zorluk: Çırak, Kalfa, Usta (şefin doğru bilme oranı ve hızı artar). Ekranda rakibin bilgisayar olduğu açıkça yazar.
   • Kural 1'e 1 ile aynı: önce doğru basan puanı alır. Öğrenci yanlış basarsa ve şef doğru bilecekse puan şefin.
   • Her sorudan sonra doğru cevap, karşılaştırma ve "Neden?" açıklaması açık gelir; öğrenci kendi hızında "Sonraki"ye basar.
   • 10 soru, tüm konular. XP (rütbe puanı) verir; lig puanı, sıralama ve rekor YOK. Meydan Okuma bu pencereden açılır. */
'use strict';
const ANT_SEV={
 cirak:{ad:'Çırak Şef',ikon:'🧑‍🍳',dogru:.55,min:7,max:12,not:'Yavaş ve sık yanılır'},
 kalfa:{ad:'Kalfa Şef',ikon:'👨‍🍳',dogru:.72,min:5,max:9,not:'Orta hızda, iyi bilir'},
 usta:{ad:'Usta Şef',ikon:'🎖️',dogru:.88,min:3,max:6.5,not:'Hızlı ve çok iyi bilir'}
};
const ANT_N=10,ANT_SURE=20000;
let ANT=null;
window.antAc=function(){
 if(document.getElementById('antPanel'))return;
 const k=document.createElement('div');k.id='antPanel';k.className='foot-menu';k.setAttribute('role','dialog');k.setAttribute('aria-modal','true');k.setAttribute('aria-label','Antrenman Şefi');
 k.innerHTML='<div class="foot-menu-ic lm-panel"><h2>🤖 Antrenman Şefi</h2><p class="lm-panel-alt">Bilgisayardaki şefe karşı 10 soru. Önce doğru basan puanı alır. Her sorudan sonra doğru cevabı ve nedenini görürsün. XP kazandırır; lig puanı vermez.</p>'+
  Object.entries(ANT_SEV).map(([id,s])=>'<button type="button" class="lm-secim" data-s="'+id+'"><span aria-hidden="true">'+s.ikon+'</span><span><b>'+s.ad+'</b><small>'+s.not+'</small></span></button>').join('')+
  '<button type="button" class="lm-secim lm-ikincil" data-s="meydan"><span aria-hidden="true">🎯</span><span><b>Meydan Okuma</b><small>Rakipsiz, kendi rekoruna karşı</small></span></button>'+
  '<button type="button" class="btn" id="antKapat">Vazgeç</button></div>';
 document.body.appendChild(k);const kapat=()=>k.remove();
 k.addEventListener('click',e=>{if(e.target===k)kapat();});k.querySelector('#antKapat').onclick=kapat;
 k.querySelectorAll('.lm-secim').forEach(b=>{b.onclick=()=>{kapat();if(b.dataset.s==='meydan')yrCreateOpen('canavar');else antBasla(b.dataset.s);};});
 k.querySelector('.lm-secim').focus();try{sesEfekt('ac');}catch(e){}
};
async function antBasla(sev){
 try{await yrReady('butun');}catch(e){if(typeof adToast==='function')adToast('Sorular yüklenemedi. Sayfayı yenileyip yeniden dene.');return;}
 const seed=crypto.getRandomValues(new Uint32Array(1))[0];
 let qs=[];try{qs=YarisModel.buildScoped(yrAllData(),{mode:'duel',subject:'mutfak-araclari',scope:'butun',kind:'gorsel',set:0,n:ANT_N},seed);}catch(e){}
 if(!qs.length){if(typeof adToast==='function')adToast('Soru bulunamadı.');return;}
 ANT={sev,qs,k:0,ben:0,sef:0,log:[],ph:'q',tm:null};
 try{sesEfekt('basla');}catch(e){}
 antSoru(0);
}
function antSoru(k){
 const A=ANT;if(!A)return;A.k=k;A.ph='q';A.pick=null;A.kazanan='';A.sefYanildi=false;
 const s=ANT_SEV[A.sev];A.botT=(s.min+Math.random()*(s.max-s.min))*1000;A.botDogru=Math.random()<s.dogru;A.t0=performance.now();
 st.screen='antplay';render();window.scrollTo(0,0);
 if(A.tm)clearInterval(A.tm);A.tm=setInterval(antTick,100);
}
function antTick(){
 const A=ANT;if(!A||A.ph!=='q'||st.screen!=='antplay'){return;}
 const el=performance.now()-A.t0,f=document.getElementById('antDolu'),t=document.getElementById('antSn');
 if(f)f.style.width=Math.max(0,(1-el/ANT_SURE)*100)+'%';if(t)t.textContent=Math.max(0,Math.ceil((ANT_SURE-el)/1000))+' sn';
 if(!A.sefBasti&&el>=A.botT){
  A.sefBasti=true;
  if(A.botDogru){antBitir('sef',-1);return;}
  A.sefYanildi=true;const c=document.getElementById('antSef');if(c){c.textContent='😅 Şef yanlış bastı! Sıra sende.';c.classList.add('yanildi');}
 }
 if(el>=ANT_SURE)antBitir('yok',-1);
}
window.antCevap=function(i){
 const A=ANT;if(!A||A.ph!=='q')return;
 const q=A.qs[A.k],dogru=q.choices[i]&&q.choices[i].id===q.correct;
 if(dogru)antBitir('ben',i);
 else antBitir(!A.sefBasti&&A.botDogru?'sef':'yok',i);
};
function antBitir(kim,pick){
 const A=ANT;if(!A||A.ph!=='q')return;
 if(A.tm){clearInterval(A.tm);A.tm=null;}A.sefBasti=false;
 const q=A.qs[A.k],ms=Math.round(performance.now()-A.t0),benDogru=pick>=0&&q.choices[pick].id===q.correct;
 A.ph='fb';A.pick=pick;A.kazanan=kim;if(kim==='ben')A.ben++;else if(kim==='sef')A.sef++;
 A.log.push({ok:benDogru,ms,pick,reason:pick<0?'Süre doldu':''});
 try{if(typeof EFEKT!=='undefined')EFEKT.cal(kim==='ben'?'dogru':'yanlis');}catch(e){}
 render();
}
window.antSonraki=function(){
 const A=ANT;if(!A||A.ph!=='fb')return;
 if(A.k+1<A.qs.length){antSoru(A.k+1);return;}
 A.ph='bitti';
 const ok=A.log.filter(x=>x.ok).length;
 try{rutbeComplete({id:'ant-'+A.sev+'-'+Date.now(),table:'ant|'+A.sev,correct:ok,total:A.qs.length,scope:'butun'});}catch(e){}
 try{A.rapor=sonucUret('Antrenman Şefi',ANT_SEV[A.sev].ad,'ant|'+A.sev,A.log,'');}catch(e){}
 try{sesEfekt(A.ben>A.sef?'galibiyet':A.ben===A.sef?'beraberlik':'maglubiyet');}catch(e){}
 st.screen='antover';render();window.scrollTo(0,0);
};
window.antCik=function(){if(ANT&&ANT.tm)clearInterval(ANT.tm);ANT=null;st.screen='racemenu';render();window.scrollTo(0,0);};
function antSkor(){const A=ANT,s=ANT_SEV[A.sev];return '<div class="ant-skor"><span class="ben"><small>Sen</small><b>'+A.ben+'</b></span><span class="ant-orta"><small>Soru</small><b>'+Math.min(A.k+1,A.qs.length)+'/'+A.qs.length+'</b></span><span class="sef"><small>'+s.ikon+' '+s.ad+' <em>Bilgisayar</em></small><b>'+A.sef+'</b></span></div>';}
function antPlayHTML(){
 const A=ANT,q=A.qs[A.k],s=ANT_SEV[A.sev];
 let h=yrTop('Antrenman Şefi')+'<div class="wrap ant-ekran'+(A.ph==='fb'?' yr-feedback':'')+'">'+antSkor();
 if(A.ph==='q')h+='<div class="ant-bar"><div id="antDolu"></div></div><p class="ant-sef" id="antSef" role="status">'+s.ikon+' Şef düşünüyor… <span id="antSn">20 sn</span></p>';
 h+=yrQuestionHTML(q)+yrChoicesHTML(q,'antCevap',A.ph==='fb'?{pick:A.pick}:null);
 if(A.ph==='fb'){
  const cc=q.choices.find(c=>c.id===q.correct),dogruAd=cc.text||cc.ad||cc.id;
  const baslik=A.kazanan==='ben'?'✓ Doğru! Puan senin.':A.kazanan==='sef'?(A.pick>=0?'Yanlış. Şef doğru bildi, puan şefin.':'Şef önce doğru bastı.'):(A.pick<0?'Süre doldu.':'Yanlış. Şef de bilemedi.');
  h+='<div class="yr-fb '+(A.kazanan==='ben'?'ok':'bad')+'" role="status"><b>'+baslik+'</b>'+(A.kazanan==='ben'?'':'<br>Doğru cevap: <b>'+esc(dogruAd)+'</b>')+yrCompareHTML(q,A.pick)+yrExplanationHTML(q).replace('<details class="yr-explain">','<details class="yr-explain" open>')+'</div>'+
   '<button class="btn pri" onclick="antSonraki()" id="antNext">'+(A.k+1>=A.qs.length?'Sonucu gör':'Sonraki soru ›')+'</button>';
 }
 return h+'<button class="btn ghost" onclick="antCik()">Antrenmandan çık</button></div>';
}
function antOverHTML(){
 const A=ANT,s=ANT_SEV[A.sev],ok=A.log.filter(x=>x.ok).length,kaz=A.ben>A.sef?'ben':A.ben<A.sef?'sef':'';
 const kahraman='<section class="sn-kahraman'+(kaz==='ben'?'':' sn-notr')+'" role="status"><span class="sn-ikon" aria-hidden="true">'+(kaz==='ben'?'🏆':kaz==='sef'?'💪':'🤝')+'</span><b>'+(kaz==='ben'?s.ad+'’i yendin!':kaz==='sef'?'Bu sefer şef kazandı':'Berabere!')+'</b><div class="sn-skor"><span><small>Sen</small><strong>'+A.ben+'</strong></span><em>⚔️</em><span><small>'+s.ikon+' '+s.ad+'</small><strong>'+A.sef+'</strong></span></div><small>'+ok+' / '+A.qs.length+' doğru · Bilgisayara karşı antrenman, lig puanı yok</small></section>';
 const sonraki=A.sev==='cirak'?'kalfa':A.sev==='kalfa'?'usta':'';
 return yrTop('Antrenman sonucu')+'<div class="wrap sn-ekran">'+kahraman+'<div class="sn-eylem">'+
  (kaz==='ben'&&sonraki?'<button class="btn pri sn-rovans" onclick="antBasla(\''+sonraki+'\')">⬆ '+ANT_SEV[sonraki].ad+'’e karşı oyna</button>':'<button class="btn pri sn-rovans" onclick="antBasla(\''+A.sev+'\')">🔁 Yeniden oyna</button>')+
  '<div class="sn-ikili"><button class="btn" onclick="antAc()">Zorluk seç</button><button class="btn" onclick="snAntAyrinti()">Ayrıntılar</button><button class="btn" onclick="antCik()">Çık</button></div></div></div>';
}
window.snAntAyrinti=function(){
 const A=ANT;if(!A)return;const k=document.createElement('div');k.id='snPanel';k.className='foot-menu';k.setAttribute('role','dialog');k.setAttribute('aria-modal','true');
 k.innerHTML='<div class="foot-menu-ic sn-panel"><h2>📋 Antrenman ayrıntıları</h2><div class="sn-panel-govde">'+(A.rapor?sonucGoster(A.rapor):'<p>Ayrıntı yok.</p>')+'</div><button type="button" class="btn pri" id="snKapat">Kapat</button></div>';
 document.body.appendChild(k);const kapat=()=>k.remove();k.addEventListener('click',e=>{if(e.target===k)kapat();});k.querySelector('#snKapat').onclick=kapat;
};
{const O=render;render=function(){
 if(st.screen==='antplay'||st.screen==='antover'){
  if(!ANT){st.screen='racemenu';return O.apply(this,arguments);}
  const app=document.getElementById('app');app.innerHTML=st.screen==='antplay'?antPlayHTML():antOverHTML();
  document.body.dataset.screen=st.screen;document.documentElement.classList.add('lig');try{hsBagla();}catch(e){}
  const n=document.getElementById('antNext');if(n)n.focus({preventScroll:true});
  return;
 }
 return O.apply(this,arguments);
};}
{const O=back;back=function(){if(st.screen==='antplay'||st.screen==='antover'){antCik();return;}return O.apply(this,arguments);};}
