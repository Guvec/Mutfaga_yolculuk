/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Baharat Rafı: kutu oyunu (14.11.2026). Bir kutu = 4 baharat, tanışma, 8 soru, tencere, yıldız.
   Kurallar: her baharat tam 2 kez hedef, iki gelişi farklı türde; ilk 4 soru 3 seçenek, son 4 soru 4 seçenek;
   yanlışta ayırt etme cümlesi + 2. deneme, sonra doğru kart parlar. Cevap dokunarak ya da sürükleyerek.
   Sesler js/ses-yonetici.js (sesCal). Metinler öğretmen onaylı (14.11 00:31). */
'use strict';
const BaharatRafi=(function(){
 const ANAHTAR='baharat_rafi_v1';
 function ses(a){try{if(typeof sesCal==='function')sesCal(a);}catch(e){}}
 function profil(){return (st.prof&&!st.guest)?st.prof:null;}
 function kayit(){const p=profil();if(!p)return {};try{return (ls(ANAHTAR,{})[p]||{}).k1||{};}catch(e){return {};}}
 function kaydet(v){const p=profil();if(!p)return;const a=ls(ANAHTAR,{});a[p]={...(a[p]||{}),k1:v};lsSet(ANAHTAR,a);}
 /* Sınıf sırası: kutu puanı rekor sistemine 'bh-k1' tablosu olarak yazılır (genel ve haftalık).
    Yalnız kendi rekorunu geçen puan gönderilir. Sıra, haftalık tablodan okunup kutu sonunda gösterilir. */
 function siralama(puan,once){
  try{
   if(!profil()||typeof rkPid!=='function'||typeof rkQueue!=='function')return;
   const pid=rkPid(st.prof,true),p=rkProf(pid);if(p.status!=='in')return;
   const hafta='w'+rkWeekNo(),q=rkQueue(),name=rkName(st.prof);
   const genelRekor=puan>(once.puan||0),haftaRekor=once.haftaNo!==hafta||puan>(once.haftaPuan||0);
   if(genelRekor)q.push({qid:rkRandomId(),pid,board:'bh-k1',period:'genel',name,correct:puan,gen:p.gen,at:Date.now(),sess:null});
   if(haftaRekor)q.push({qid:rkRandomId(),pid,board:'bh-k1',period:'hafta',name,correct:puan,gen:p.gen,at:Date.now(),sess:null});
   if(haftaRekor)kaydet({...kayit(),haftaNo:hafta,haftaPuan:Math.max(puan,once.haftaNo===hafta?(once.haftaPuan||0):0)});
   lsSet('rk_queue',q);
   Promise.resolve(rkFlush(0)).then(async()=>{
    const be=rkBackend();if(!be)return;
    const rows=await be.list(rkTable('bh-k1','hafta'));const r=rkRank(rows,pid);
    const el=document.getElementById('br-sira');if(!el||!r)return;
    el.textContent=r.rank===1?'Bu hafta bu kutuda sınıfta 1. sıradasın! 👑':'Bu hafta bu kutuda sınıfta '+r.rank+'. sıradasın.';
    el.hidden=false;if(r.rank<=3)ses('seri');
   }).catch(()=>{});
  }catch(e){}
 }
 function odul(y){
  if(!profil()||typeof rutbeComplete!=='function')return;
  try{rutbeComplete({id:'bh-kutu-1',table:'bh-kutu-1',correct:8,total:8,ilerleme:true,puan:RUTBE_AYAR.yolBolum+(y===3?3:0),dal:'sicak'});}catch(e){}
 }
/* ---- Kutu 1 içeriği (onaylı 14.11) ---- */
const B={
 tarcin:{ad:'Tarçın',img:'assets/baharat/t01_12.jpg',tan:['Ağaç kabuğundan yapılır.','Tatlı ve sıcak bir kokusu vardır.','Sütlacın ve salebin üstüne serpilir.'],
  soru:'Sütlacın ve salebin üstüne serpilir. Tatlı, sıcak bir kokusu vardır.',cumle:'Tarçın sütlacın üstüne serpilir.',yakin:'78% 68%'},
 karanfil:{ad:'Karanfil',img:'assets/baharat/t02_12.jpg',tan:['Kurutulmuş küçük bir çiçektir.','Kokusu çok güçlüdür; ağızda keskin ve sıcak bir tat bırakır.','Ayva tatlısına, hoşafa ve şerbete konur.'],
  soru:'Ayva tatlısına ve hoşafa konur. Ağızda keskin bir tat bırakır.',cumle:'Karanfilin kokusu keskindir; ayva tatlısına konur.',yakin:'62% 78%'},
 yildiz:{ad:'Yıldız anason',img:'assets/baharat/t02_11.jpg',tan:['Kokusu anasona benzer, tatlımsıdır.','Kışın sıcak içeceklere konur.'],
  soru:'Kokusu anasona benzer. Kışın sıcak içeceklere konur.',cumle:'Yıldız anasonun kokusu anasona benzer.',yakin:'45% 38%'},
 susam:{ad:'Susam',img:'assets/baharat/t02_03.jpg',tan:['Tahin susamdan yapılır.','Simidin dışında bulunur.','Kavrulunca daha güzel kokar.'],
  soru:'Tahin bundan yapılır. Simidin dışında da bulunur.',cumle:'Tahin susamdan yapılır.',yakin:'45% 35%'}
};
const IDS=Object.keys(B);
const YEMEK=[{ad:'Sütlaç',bah:'tarcin',ip:'Sütlacın üstüne tarçın serpilir.'},{ad:'Simit',bah:'susam',ip:'Simidin dışı susamla kaplanır.'}];

/* ---- Durum ---- */
let S;
const $=s=>document.querySelector(s);
const kar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function yeni(){
 const p=kar(IDS);let r2;do{r2=kar(IDS);}while(r2[0]===p[3]);
 const sorular=[...p.map((id,i)=>({id,tur:i%2?'etiket':'siparis',n:3})),...r2.map((id,i)=>({id,tur:i%2?'yakin':'soru',n:4}))];
 const ozel=2+Math.floor(Math.random()*6);sorular[ozel].ozel=true;
 S={ekran:'tanis',t:0,q:0,sorular,yanlis:0,puan:0,seri:0,dolu:{},deneme:0,kilit:false};
}
/* ---- Çizim ---- */
function cerceve(baslik,ic){$('#app').innerHTML=`<div class="br-shell"><header><button class="ust-btn" aria-label="Geri" onclick="back()">‹</button><b>${baslik}</b><span style="width:44px"></span></header><main>${ic}</main></div>`;}
function rafHTML(){
 return `<div class="raf">${IDS.map(id=>`<div class="kav${S.dolu[id]===2&&S.altin?' altin':''}"><i style="background-image:url(${B[id].img});height:${(S.dolu[id]||0)*50}%"></i></div>`).join('')}<small>Soru ${Math.min(S.q+1,8)} / 8<br>Kavanoz ${IDS.filter(i=>S.dolu[i]).length} / 4</small></div><div class="cubuk"><i style="width:${S.q/8*100}%"></i></div>`;
}
function ciz(){({tanis:tanisCiz,soru:soruCiz,tencere:tencereCiz,son:sonCiz})[S.ekran]();}
function tanisCiz(){
 const b=B[IDS[S.t]];
 cerceve('Baharat Rafı · Kutu 1',`<div class="tanis"><div class="usta"><img src="assets/pastacilik-ilk/panda-isteme.webp" alt=""><div class="balon"><span>${S.t===0?'Bugün kilere 4 yeni baharat geldi. Tanış!':'Sıradaki baharat'}</span></div></div>
 <div class="foto"><img src="${b.img}" alt="${b.ad}"></div><h2>${b.ad}</h2><ul>${b.tan.map(x=>`<li>${x}</li>`).join('')}</ul>
 <div class="noktalar">${IDS.map((_,i)=>`<i class="${i===S.t?'on':''}"></i>`).join('')}</div>
 <button class="btn" onclick="BaharatRafi._ileri()">${S.t<3?'Sonraki baharat':'Göreve başla'}</button></div>`);
}
function tanisIleri(){if(S.t<3){S.t++;ses('ileri');}else{S.ekran='soru';ses('basla');}ciz();}
function kok(q){const b=B[q.id];return {siparis:`Usta <b>${b.ad.toLocaleLowerCase('tr')}</b> istiyor. Tepsiye koy.`,etiket:'Bu kavanozun etiketi hangisi?',soru:b.soru+' Aşağıdakilerden hangisi bu baharattır?',yakin:'Yakından bak. Bu hangi baharat?'}[q.tur];}
function hedefHTML(q){const b=B[q.id];
 if(q.tur==='siparis')return `<div class="tepsi">Tepsi</div>`;
 if(q.tur==='etiket')return `<div class="kavanoz"><img src="${b.img}" alt=""><div class="etiket-yer">Etiket</div></div>`;
 if(q.tur==='soru')return `<div class="raf-yer">Raftaki boş yer</div>`;
 return `<div class="yakin" id="yakin" style="background-image:url(${b.img});background-size:420%;background-position:${b.yakin}"></div>`;
}
function soruCiz(){
 const q=S.sorular[S.q];
 if(!q.sec){const digr=kar(IDS.filter(i=>i!==q.id)).slice(0,q.n-1);q.sec=kar([q.id,...digr]);}
 const adli=q.tur==='etiket'||q.tur==='yakin';
 cerceve('Baharat Rafı · Kutu 1',`${rafHTML()}
 <div class="usta"><img id="panda" src="assets/pastacilik-ilk/panda-isteme.webp" alt=""><div class="balon" id="balon"><span>${q.ozel?'<span class="ozel">★ Özel sipariş · 2 kat puan</span><br>':''}${kok(q)}</span><button class="oku" aria-label="Sesli oku" onclick="BaharatRafi._oku()">🔊</button></div></div>
 <div class="hedef${adli?' buyuk':''}" id="hedef">${hedefHTML(q)}</div>
 <div class="secenek${adli?' liste':q.n===3?' uc':''}">${q.sec.map((id,i)=>`<button class="k${adli?' ad':''}" data-id="${id}"><span class="h">${'ABCD'[i]}</span>${adli?B[id].ad:`<img src="${B[id].img}" alt="${'ABCD'[i]} seçeneği">`}</button>`).join('')}</div>`);
 S.deneme=0;S.kilit=false;
 document.querySelectorAll('.k').forEach(suruklenebilir);
}
function oku(){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance($('#balon span').innerText.replace('★',''));u.lang='tr-TR';speechSynthesis.speak(u);}catch(e){}}
function balon(html,cls){const b=$('#balon');b.className='balon '+(cls||'');b.querySelector('span').innerHTML=html;}
/* Sürükle ya da dokun */
function suruklenebilir(el){
 let bas=null,dx=0,dy=0,tasindi=false,ust=false;
 el.addEventListener('pointerdown',e=>{if(S.kilit)return;bas=[e.clientX,e.clientY];tasindi=false;el.setPointerCapture(e.pointerId);});
 el.addEventListener('pointermove',e=>{if(!bas)return;dx=e.clientX-bas[0];dy=e.clientY-bas[1];
  if(!tasindi&&Math.hypot(dx,dy)<10)return;
  if(!tasindi){tasindi=true;el.classList.add('surukle');ses('tut');}
  el.style.transform=`translate(${dx}px,${dy}px) scale(1.05)`;
  const h=hedefBul(e.clientX,e.clientY),u=!!h;
  if(u&&!ust)ses('ustunde');ust=u;document.querySelectorAll('.hedef,.yemek').forEach(x=>x.classList.toggle('ust',x===h));});
 el.addEventListener('pointerup',e=>{if(!bas)return;bas=null;el.classList.remove('surukle');document.querySelectorAll('.ust').forEach(x=>x.classList.remove('ust'));
  if(!tasindi){sec(el,null);return;}
  const h=hedefBul(e.clientX,e.clientY);geriKoy(el);
  if(h)sec(el,h);else ses('birak');});
 el.addEventListener('pointercancel',()=>{bas=null;geriKoy(el);});
}
function geriKoy(el){el.classList.add('donus');el.style.transform='';setTimeout(()=>el.classList.remove('donus','surukle'),260);}
function hedefBul(x,y){for(const h of document.querySelectorAll(S.ekran==='tencere'?'.yemek:not(.tamam)':'.hedef')){const r=h.getBoundingClientRect();if(x>r.left&&x<r.right&&y>r.top-10&&y<r.bottom+10)return h;}return null;}
function sec(el,hedef){if(S.ekran==='tencere')return yemekSec(el,hedef);cevap(el);}
function cevap(el){
 if(S.kilit)return;const q=S.sorular[S.q],id=el.dataset.id;
 if(id===q.id){
  S.kilit=true;el.classList.add('dogru');
  const ilk=S.deneme===0,p=(ilk?10:5)*(q.ozel?2:1);S.puan+=p;
  S.seri=ilk?S.seri+1:0;
  ses('yerlesti');if(S.seri===3||S.seri===6)setTimeout(()=>ses('seri'),450);
  S.dolu[id]=Math.min(2,(S.dolu[id]||0)+1);
  const h=$('#hedef');
  if(q.tur==='yakin'){const y=$('#yakin');y.style.backgroundSize='100%';y.style.backgroundPosition='center';}
  else if(q.tur==='etiket'){h.querySelector('.etiket-yer').textContent=B[id].ad;h.querySelector('.etiket-yer').style.borderStyle='solid';}
  else{const im=document.createElement('img');im.className='yerlesen';im.src=B[id].img;im.alt='';h.appendChild(im);}
  $('#panda').src='assets/pastacilik-ilk/panda-sevinme.webp';
  balon(`${S.seri>=3?'Seri '+S.seri+'! ':''}Doğru. ${B[id].cumle} +${p} puan`,'ok');
  setTimeout(sonraki,1700);
 }else{
  S.deneme++;S.yanlis++;S.seri=0;ses('tekrarDene');
  $('#panda').src='assets/pastacilik-ilk/panda-dusunme.webp';
  if(S.deneme===1){balon(`Bu ${B[id].ad.toLocaleLowerCase('tr')}. ${B[id].cumle} Bir daha dene.`,'no');el.classList.add('soluk');}
  else{balon(`${B[q.id].cumle} Parlayan kartı yerine koy.`,'no');document.querySelectorAll('.k').forEach(k=>{if(k.dataset.id===q.id)k.classList.add('parla');else k.classList.add('soluk');});}
 }
}
function sonraki(){S.q++;if(S.q>=8){S.ekran='tencere';S.yerlesen={};ses('ileri');}ciz();}
/* Tencere finali */
const KASE='<svg viewBox="0 0 120 70" aria-hidden="true"><path d="M8 22h104c0 26-22 44-52 44S8 48 8 22z" fill="#fff" stroke="#b9c7b8" stroke-width="4"/><ellipse cx="60" cy="22" rx="52" ry="9" fill="#f4ead6" stroke="#b9c7b8" stroke-width="4"/></svg>';
const SIMIT='<svg viewBox="0 0 120 70" aria-hidden="true"><ellipse cx="60" cy="36" rx="46" ry="28" fill="#c98b4a"/><ellipse cx="60" cy="36" rx="20" ry="11" fill="#fffffb"/></svg>';
function tencereCiz(){
 cerceve('Ustanın tenceresi',`<div class="usta"><img id="panda" src="assets/pastacilik-ilk/panda-isteme.webp" alt=""><div class="balon" id="balon"><span>Yemekler baharatını bekliyor. Doğru baharatı yemeğe koy.</span><button class="oku" aria-label="Sesli oku" onclick="BaharatRafi._oku()">🔊</button></div></div>
 <div class="tencere">${YEMEK.map((y,i)=>`<div class="yemek${S.yerlesen[i]?' tamam':''}" data-i="${i}" onclick="BaharatRafi._yemek(${i})"><span class="buhar">∿ ∿ ∿</span>${i?SIMIT:KASE}${y.ad}</div>`).join('')}</div>
 <div class="secenek">${kar(IDS).map((id,i)=>`<button class="k" data-id="${id}"><span class="h">${'ABCD'[i]}</span><img src="${B[id].img}" alt="${'ABCD'[i]} seçeneği"></button>`).join('')}</div>`);
 S.kilit=false;document.querySelectorAll('.k').forEach(suruklenebilir);S.secili=null;
}
function yemekSec(el,hedef){
 if(!hedef){document.querySelectorAll('.k').forEach(k=>k.classList.toggle('sec',k===el));S.secili=el;balon('Şimdi yemeğe dokun.');return;}
 yemekKoy(el,+hedef.dataset.i);
}
function yemekDokun(i){if(S.secili)yemekKoy(S.secili,i);}
function yemekKoy(el,i){
 const y=YEMEK[i];if(S.yerlesen[i])return;S.secili=null;el.classList.remove('sec');
 if(el.dataset.id===y.bah){S.yerlesen[i]=true;S.puan+=10;ses('yerlesti');el.classList.add('soluk');
  const d=document.querySelector(`.yemek[data-i="${i}"]`);d.classList.add('tamam');balon(`Afiyet olsun! ${y.ip}`,'ok');
  if(YEMEK.every((_,k)=>S.yerlesen[k]))setTimeout(()=>{S.ekran='son';ses('kutuBitti');ciz();},1600);}
 else{ses('tekrarDene');balon(`${B[el.dataset.id].ad} bu yemeğe uymaz. ${y.ip}`,'no');}
}
/* Kutu sonu */
function sonCiz(){
 const y=S.yanlis===0?3:S.yanlis<=2?2:1;S.altin=y===3;
 const once=kayit();const rekor=S.puan>(once.puan||0);if(!S.odul){S.odul=true;odul(y);siralama(S.puan,once);kaydet({...kayit(),yildiz:Math.max(y,once.yildiz||0),puan:Math.max(S.puan,once.puan||0),oynama:(once.oynama||0)+1});}
 cerceve('Kutu 1 tamam',`${rafHTML()}<div class="son"><div class="yildizlar">${'★'.repeat(y)}<span class="bos">${'★'.repeat(3-y)}</span></div>
 <div class="kart"><b>${S.puan} puan</b>${rekor&&once.puan?' · Yeni rekorun!':''}<br>En iyin: ${Math.max(S.puan,once.puan||0)} puan · Baharat Rafı: 4 / 96 kavanoz${y===3?'<br>Hatasız kutu! Kavanoz kapakları altın oldu.':''}</div>
 <div class="kart" id="br-sira" hidden style="font-weight:bold"></div>
 <div class="kart">Sıradaki kutuda 4 yeni baharat seni bekliyor<div class="bugu"><i>?</i><i>?</i><i>?</i><i>?</i></div></div>
 ${y<3?'<div style="font-size:15px">3 yıldız için kutuyu hatasız bitir.</div>':''}
 <button class="btn" onclick="BaharatRafi._tekrar()">Yeniden oyna</button>
 <button class="btn ikinci" onclick="back()">Rafa dön</button></div>`);
 setTimeout(()=>ses('yildiz'),1300);
}

 const screens=['baharatrafi'];
 function renderScreen(){if(!S)yeni();ciz();document.body.dataset.screen='baharatrafi';}
 function ac(){yeni();go('baharatrafi');}
 return {screens,renderScreen,ac,_ileri:()=>tanisIleri(),_oku:()=>oku(),_yemek:i=>yemekDokun(i),_tekrar:()=>{yeni();S.ekran='soru';ses('basla');ciz();},_durum:()=>S};
})();
