/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Baharat Rafı: kutu oyunu (14.11.2026). Raf = kutu listesi; bir kutu = 4 baharat, tanışma, (Hatırla) + 8 soru, tencere, yıldız.
   Kurallar: her baharat tam 2 kez hedef, iki gelişi farklı türde; ilk 4 soru 3 seçenek, son 4 soru 4 seçenek;
   yanlışta ayırt etme cümlesi + 2. deneme, sonra doğru kart parlar. Cevap dokunarak ya da sürükleyerek.
   Sesler js/ses-yonetici.js (sesCal). Metinler öğretmen onaylı (14.11 00:31). */
'use strict';
const BaharatRafi=(function(){
 const ANAHTAR='baharat_rafi_v1';
 function ses(a){try{if(typeof sesCal==='function')sesCal(a);}catch(e){}}
 function profil(){return (st.prof&&!st.guest)?st.prof:null;}
 /* Kayıt kutu başına: {yildiz, puan, oynama, haftaNo, haftaPuan, yanlislar}. Misafirde bu oturumda bellekte tutulur. */
 const MISAFIR={};
 function kayit(n){n=n||K.no;const p=profil();if(!p)return MISAFIR['k'+n]||{};try{return (ls(ANAHTAR,{})[p]||{})['k'+n]||{};}catch(e){return {};}}
 function kaydet(v,n){n=n||K.no;const p=profil();if(!p){MISAFIR['k'+n]=v;return;}const a=ls(ANAHTAR,{});a[p]={...(a[p]||{}),['k'+n]:v};lsSet(ANAHTAR,a);}
 function acikMi(n){return n===1||!!(kayit(n-1).yildiz);}
 /* Sınıf sırası: kutu puanı rekor sistemine 'bh-k1' tablosu olarak yazılır (genel ve haftalık).
    Yalnız kendi rekorunu geçen puan gönderilir. Sıra, haftalık tablodan okunup kutu sonunda gösterilir. */
 function siralama(puan,once){
  try{
   if(!profil()||typeof rkPid!=='function'||typeof rkQueue!=='function')return;
   const pid=rkPid(st.prof,true),p=rkProf(pid);if(p.status!=='in')return;
   const hafta='w'+rkWeekNo(),q=rkQueue(),name=rkName(st.prof);
   const genelRekor=puan>(once.puan||0),haftaRekor=once.haftaNo!==hafta||puan>(once.haftaPuan||0);
   if(genelRekor)q.push({qid:rkRandomId(),pid,board:'bh-k'+K.no,period:'genel',name,correct:puan,gen:p.gen,at:Date.now(),sess:null});
   if(haftaRekor)q.push({qid:rkRandomId(),pid,board:'bh-k'+K.no,period:'hafta',name,correct:puan,gen:p.gen,at:Date.now(),sess:null});
   if(haftaRekor)kaydet({...kayit(),haftaNo:hafta,haftaPuan:Math.max(puan,once.haftaNo===hafta?(once.haftaPuan||0):0)});
   lsSet('rk_queue',q);
   Promise.resolve(rkFlush(0)).then(async()=>{
    const be=rkBackend();if(!be)return;
    const rows=await be.list(rkTable('bh-k'+K.no,'hafta'));const r=rkRank(rows,pid);
    const el=document.getElementById('br-sira');if(!el||!r)return;
    el.textContent=r.rank===1?'Bu hafta bu kutuda sınıfta 1. sıradasın! 👑':'Bu hafta bu kutuda sınıfta '+r.rank+'. sıradasın.';
    el.hidden=false;if(r.rank<=3)ses('seri');
   }).catch(()=>{});
  }catch(e){}
 }
 function odul(y){
  if(!profil()||typeof rutbeComplete!=='function')return;
  try{rutbeComplete({id:'bh-kutu-'+K.no,table:'bh-kutu-'+K.no,correct:8,total:8,ilerleme:true,puan:RUTBE_AYAR.yolBolum+(y===3?3:0),dal:'sicak'});}catch(e){}
 }
/* ---- İçerik (öğretmen onaylı: Kutu 1 14.11 00:31, Kutu 2–4 14.11 03:24) ---- */
const B={
 tarcin:{ad:'Tarçın',img:'assets/baharat/t01_12.jpg',tan:['Ağaç kabuğundan yapılır.','Tatlı ve sıcak bir kokusu vardır.','Sütlacın ve salebin üstüne serpilir.'],
  soru:'Sütlacın ve salebin üstüne serpilir. Tatlı, sıcak bir kokusu vardır.',cumle:'Tarçın sütlacın üstüne serpilir.',yakin:'78% 68%'},
 karanfil:{ad:'Karanfil',img:'assets/baharat/t02_12.jpg',tan:['Kurutulmuş küçük bir çiçektir.','Kokusu çok güçlüdür; ağızda keskin ve sıcak bir tat bırakır.','Ayva tatlısına, hoşafa ve şerbete konur.'],
  soru:'Ayva tatlısına ve hoşafa konur. Ağızda keskin bir tat bırakır.',cumle:'Karanfilin kokusu keskindir; ayva tatlısına konur.',yakin:'62% 78%'},
 yildiz:{ad:'Yıldız anason',img:'assets/baharat/t02_11.jpg',tan:['Kokusu anasona benzer, tatlımsıdır.','Kışın sıcak içeceklere konur.'],
  soru:'Kokusu anasona benzer. Kışın sıcak içeceklere konur.',cumle:'Yıldız anasonun kokusu anasona benzer.',yakin:'45% 38%'},
 susam:{ad:'Susam',img:'assets/baharat/t02_03.jpg',tan:['Tahin susamdan yapılır.','Simidin dışında bulunur.','Kavrulunca daha güzel kokar.'],
  soru:'Tahin bundan yapılır. Simidin dışında da bulunur.',cumle:'Tahin susamdan yapılır.',yakin:'45% 35%'},
 pulbiber:{ad:'Pul biber',img:'assets/baharat/t01_01.jpg',tan:['Kurutulmuş kırmızı biberin ufalanmış hâlidir.','Yemeğe acılık ve kırmızı renk verir.','Kebabın ve çorbaların üstüne serpilir.'],
  soru:'Kırmızı, pul pul bir baharattır. Yemeğe acılık verir.',cumle:'Pul biber kırmızıdır, yemeğe acılık verir.',yakin:'40% 35%'},
 kimyon:{ad:'Kimyon',img:'assets/baharat/t01_10.jpg',tan:['İnce uzun, kahverengi tohumlardır.','Kokusu keskin ve sıcaktır.','İçli köfteye ve kuru baklagil yemeklerine konur.'],
  soru:'İnce uzun, kahverengi tohumlardır. Kuru baklagil yemeklerine konur.',cumle:'Kimyon ince uzun, kahverengi tohumdur.',yakin:'76% 84%'},
 karabiber:{ad:'Karabiber',img:'assets/baharat/t01_04.jpg',tan:['Küçük, yuvarlak, siyah tanelerdir.','Ağızda yakıcı bir tat bırakır.','Değirmende öğütülerek yemeğe serpilir.'],
  soru:'Küçük, yuvarlak, siyah tanelerdir. Değirmende öğütülür.',cumle:'Karabiber küçük, yuvarlak, siyah tanedir.',yakin:'86% 80%'},
 defne:{ad:'Defne yaprağı',img:'assets/baharat/t10_01.jpg',tan:['Kurutulmuş, sert bir yapraktır.','Yemek pişerken bütün olarak konur.','Servisten önce yemekten çıkarılır.'],
  soru:'Yemek pişerken bütün olarak konur. Servisten önce çıkarılır.',cumle:'Defne yaprağı pişerken konur, servisten önce çıkarılır.',yakin:'55% 40%'},
 sumak:{ad:'Sumak',img:'assets/baharat/t01_02.jpg',tan:['Kırmızımsı mor renkli bir tozdur.','Ekşi bir tadı vardır.','Soğan salatasına ve kebabın yanına serpilir.'],
  soru:'Ekşi bir tadı vardır. Soğan salatasına serpilir.',cumle:'Sumak ekşidir; soğan salatasına serpilir.',yakin:'45% 30%'},
 zencefil:{ad:'Zencefil',img:'assets/baharat/t06_02.jpg',tan:['Toprak altında büyüyen sarımsı bir köktür.','Tadı acımsı ve yakıcıdır.','Taze ya da toz olarak kurabiyeye ve sıcak içeceklere konur.'],
  soru:'Toprak altında büyüyen bir köktür. Tadı acımsı ve yakıcıdır.',cumle:'Zencefil acımsı tadı olan bir köktür.',yakin:'14% 55%'},
 vanilya:{ad:'Vanilya',img:'assets/baharat/t05_04.jpg',tan:['Kurutulmuş, ince uzun, koyu renkli bir çubuktur.','Tatlılara hoş bir koku verir.','Muhallebiye, dondurmaya ve keke konur.'],
  soru:'Tatlılara hoş bir koku verir. Muhallebiye ve keke konur.',cumle:'Vanilya tatlılara hoş koku veren ince uzun bir çubuktur.',yakin:'40% 40%'},
 corekotu:{ad:'Çörek otu',img:'assets/baharat/t02_05.jpg',tan:['Küçük, siyah tanelerdir.','Hafif acımsı bir tadı vardır.','Poğaçanın ve pidenin üstüne serpilir.'],
  soru:'Küçük, siyah tanelerdir. Poğaçanın üstüne serpilir.',cumle:'Çörek otu küçük, siyah tanelerdir; poğaçaya serpilir.',yakin:'40% 40%'},
 maydanoz:{ad:'Maydanoz',img:'assets/baharat/t03_08.jpg',tan:['Kokusu hafif, yeşil yapraklı bir bitkidir.','Çoban salatasına, kısıra ve köfteye konur.','Yemeklerin üstünü süslemek için de kullanılır.'],
  soru:'Kokusu hafif yeşil yapraktır. Çoban salatasına ve kısıra konur.',cumle:'Maydanozun kokusu hafiftir; çoban salatasına konur.',yakin:'50% 45%'},
 nane:{ad:'Taze nane',img:'assets/baharat/t03_09.jpg',tan:['Ferahlatıcı, serin bir kokusu vardır.','Limonataya ve salataya konur.','Kurutulunca kuru nane olur.'],
  soru:'Ferahlatıcı, serin bir kokusu vardır. Limonataya konur.',cumle:'Nanenin kokusu serin ve ferahlatıcıdır.',yakin:'50% 40%'},
 dereotu:{ad:'Taze dereotu',img:'assets/baharat/t03_12.jpg',tan:['İnce, tüy gibi yaprakları vardır.','Zeytinyağlı bakla ve enginar yemeklerine konur.','Poğaçanın içine de katılır.'],
  soru:'İnce, tüy gibi yaprakları vardır. Zeytinyağlı bakla yemeğine konur.',cumle:'Dereotunun yaprakları tüy gibi incedir.',yakin:'50% 45%'},
 roka:{ad:'Roka',img:'assets/baharat/t03_05.jpg',tan:['Acımsı, keskin tadı olan bir salata yaprağıdır.','Yaprak kenarlarında derin girintiler vardır.','Salatada çiğ yenir.'],
  soru:'Acımsı, keskin tadı olan salata yaprağıdır.',cumle:'Roka acımsı, keskin tadı olan salata yaprağıdır.',yakin:'50% 40%'}
};
const KUTULAR=[
 {no:1,ids:['tarcin','karanfil','yildiz','susam'],yemek:[{ad:'Sütlaç',bah:'tarcin',ip:'Sütlacın üstüne tarçın serpilir.',sekil:'kase'},{ad:'Simit',bah:'susam',ip:'Simidin dışı susamla kaplanır.',sekil:'simit'}]},
 {no:2,ids:['pulbiber','kimyon','karabiber','defne'],yemek:[{ad:'Mercimek çorbası',bah:'pulbiber',ip:'Çorbanın üstüne pul biber serpilir.',sekil:'kase'},{ad:'Kuru fasulye',bah:'defne',ip:'Defne yaprağı pişerken konur.',sekil:'tencere'}]},
 {no:3,ids:['sumak','zencefil','vanilya','corekotu'],yemek:[{ad:'Soğan salatası',bah:'sumak',ip:'Soğan salatasına sumak serpilir.',sekil:'tabak'},{ad:'Muhallebi',bah:'vanilya',ip:'Muhallebiye vanilya konur.',sekil:'kase'}]},
 {no:4,ids:['maydanoz','nane','dereotu','roka'],yemek:[{ad:'Limonata',bah:'nane',ip:'Limonataya taze nane konur.',sekil:'bardak'},{ad:'Zeytinyağlı enginar',bah:'dereotu',ip:'Zeytinyağlı enginara dereotu konur.',sekil:'tabak'}]}
];
let K=KUTULAR[0],IDS=K.ids,YEMEK=K.yemek;
/* ---- Durum ---- */
let S;
const $=s=>document.querySelector(s);
const kar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function yeni(n){
 K=KUTULAR[(n||K.no)-1];IDS=K.ids;YEMEK=K.yemek;
 const p=kar(IDS);let r2;do{r2=kar(IDS);}while(r2[0]===p[3]);
 const sorular=[...p.map((id,i)=>({id,tur:i%2?'etiket':'siparis',n:3})),...r2.map((id,i)=>({id,tur:i%2?'yakin':'soru',n:4}))];
 const ozel=2+Math.floor(Math.random()*6);sorular[ozel].ozel=true;
 /* Hatırla: önceki kutuda yanlış yapılan en çok 2 baharat, kutunun başında birer kez sorulur. */
 const onceki=K.no>1?KUTULAR[K.no-2]:null,hat=onceki?(kayit(onceki.no).yanlislar||[]).filter(id=>B[id]).slice(0,2):[];
 const hatirla=hat.map(id=>({id,tur:'soru',n:4,hatirla:true,havuz:onceki.ids}));
 S={ekran:hatirla.length?'soru':'tanis',hat:hatirla.length,t:0,q:0,sorular:[...hatirla,...sorular],yanlis:0,yanlisIds:[],puan:0,seri:0,dolu:{},deneme:0,kilit:false};
}
/* Öğrenilmiş baharatlar (önceki kutular): 4 seçenekli sorularda bir çeldirici buradan gelir. */
function ogrenilmis(){return KUTULAR.filter(k=>k.no<K.no).flatMap(k=>k.ids);}
/* ---- Çizim ---- */
function cerceve(baslik,ic){$('#app').innerHTML=`<div class="br-shell"><header><button class="ust-btn" aria-label="Geri" onclick="BaharatRafi._geri()">‹</button><b>${baslik}</b><span style="width:44px"></span></header><main>${ic}</main></div>`;}
function rafHTML(){
 return `<div class="raf">${IDS.map(id=>`<div class="kav${S.dolu[id]===2&&S.altin?' altin':''}"><i style="background-image:url(${B[id].img});height:${(S.dolu[id]||0)*50}%"></i></div>`).join('')}<small>Soru ${Math.min(S.q+1,S.sorular.length)} / ${S.sorular.length}<br>Kavanoz ${IDS.filter(i=>S.dolu[i]).length} / 4</small></div><div class="cubuk"><i style="width:${S.q/S.sorular.length*100}%"></i></div>`;
}
function ciz(){({liste:listeCiz,tanis:tanisCiz,soru:soruCiz,tencere:tencereCiz,son:sonCiz})[S.ekran]();}
function tanisCiz(){
 const b=B[IDS[S.t]];
 cerceve('Baharat Rafı · Kutu '+K.no,`<div class="tanis"><div class="usta"><img src="assets/pastacilik-ilk/panda-isteme.webp" alt=""><div class="balon"><span>${S.t===0?'Rafa 4 yeni baharat geldi. Tanış!':'Sıradaki baharat'}</span></div></div>
 <div class="foto"><img src="${b.img}" alt="${b.ad}"></div><h2>${b.ad}</h2><ul>${b.tan.map(x=>`<li>${x}</li>`).join('')}</ul>
 <div class="noktalar">${IDS.map((_,i)=>`<i class="${i===S.t?'on':''}"></i>`).join('')}</div>
 <button class="btn" onclick="BaharatRafi._ileri()">${S.t<3?'Sonraki baharat':'Göreve başla'}</button></div>`);
}
function tanisIleri(){if(S.t<3){S.t++;ses('ileri');}else{S.tanisti=true;S.ekran='soru';ses('basla');}ciz();}
function kok(q){const b=B[q.id];if(q.hatirla)return '<span class="ozel" style="background:#6a9441">Hatırla</span><br>'+b.soru+' Aşağıdakilerden hangisi bu baharattır?';return {siparis:`Usta <b>${b.ad.toLocaleLowerCase('tr')}</b> istiyor. Tepsiye koy.`,etiket:'Bu kavanozun etiketi hangisi?',soru:b.soru+' Aşağıdakilerden hangisi bu baharattır?',yakin:'Yakından bak. Bu hangi baharat?'}[q.tur];}
function hedefHTML(q){const b=B[q.id];
 if(q.tur==='siparis')return `<div class="tepsi">Tepsi</div>`;
 if(q.tur==='etiket')return `<div class="kavanoz"><img src="${b.img}" alt=""><div class="etiket-yer">Etiket</div></div>`;
 if(q.tur==='soru')return `<div class="raf-yer">Raftaki boş yer</div>`;
 return `<div class="yakin" id="yakin" style="background-image:url(${b.img});background-size:420%;background-position:${b.yakin}"></div>`;
}
function soruCiz(){
 const q=S.sorular[S.q];
 if(!q.sec){const kume=q.havuz||IDS,es=kar(kume.filter(i=>i!==q.id)),eski=q.havuz?[]:kar(ogrenilmis());
  const digr=q.n===4&&eski.length?[...es.slice(0,2),eski[0]]:es.slice(0,q.n-1);q.sec=kar([q.id,...digr]);}
 const adli=q.tur==='etiket'||q.tur==='yakin';
 cerceve('Baharat Rafı · Kutu '+K.no,`${rafHTML()}
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
  if(!q.hatirla)S.dolu[id]=Math.min(2,(S.dolu[id]||0)+1);
  const h=$('#hedef');
  if(q.tur==='yakin'){const y=$('#yakin');y.style.backgroundSize='100%';y.style.backgroundPosition='center';}
  else if(q.tur==='etiket'){h.querySelector('.etiket-yer').textContent=B[id].ad;h.querySelector('.etiket-yer').style.borderStyle='solid';}
  else{const im=document.createElement('img');im.className='yerlesen';im.src=B[id].img;im.alt='';h.appendChild(im);}
  $('#panda').src='assets/pastacilik-ilk/panda-sevinme.webp';
  balon(`${S.seri>=3?'Seri '+S.seri+'! ':''}Doğru. ${B[id].cumle} +${p} puan`,'ok');
  setTimeout(sonraki,1700);
 }else{
  S.deneme++;if(!q.hatirla){S.yanlis++;if(!S.yanlisIds.includes(q.id))S.yanlisIds.push(q.id);}S.seri=0;ses('tekrarDene');
  $('#panda').src='assets/pastacilik-ilk/panda-dusunme.webp';
  if(S.deneme===1){balon(`Bu ${B[id].ad.toLocaleLowerCase('tr')}. ${B[id].cumle} Bir daha dene.`,'no');el.classList.add('soluk');}
  else{balon(`${B[q.id].cumle} Parlayan kartı yerine koy.`,'no');document.querySelectorAll('.k').forEach(k=>{if(k.dataset.id===q.id)k.classList.add('parla');else k.classList.add('soluk');});}
 }
}
function sonraki(){S.q++;if(S.hat&&S.q===S.hat&&S.t===0&&!S.tanisti){S.tanisti=true;S.ekran='tanis';ses('ileri');ciz();return;}if(S.q>=S.sorular.length){S.ekran='tencere';S.yerlesen={};ses('ileri');}ciz();}
/* Tencere finali */
const KASE='<svg viewBox="0 0 120 70" aria-hidden="true"><path d="M8 22h104c0 26-22 44-52 44S8 48 8 22z" fill="#fff" stroke="#b9c7b8" stroke-width="4"/><ellipse cx="60" cy="22" rx="52" ry="9" fill="#f4ead6" stroke="#b9c7b8" stroke-width="4"/></svg>';
const TABAK='<svg viewBox="0 0 120 70" aria-hidden="true"><ellipse cx="60" cy="40" rx="54" ry="22" fill="#fff" stroke="#b9c7b8" stroke-width="4"/><ellipse cx="60" cy="38" rx="34" ry="12" fill="#f4ead6"/></svg>';
const TENCERE='<svg viewBox="0 0 120 70" aria-hidden="true"><rect x="18" y="20" width="84" height="44" rx="8" fill="#e9eef0" stroke="#9aa9ad" stroke-width="4"/><rect x="6" y="26" width="14" height="8" rx="3" fill="#9aa9ad"/><rect x="100" y="26" width="14" height="8" rx="3" fill="#9aa9ad"/><rect x="14" y="12" width="92" height="10" rx="5" fill="#c7d1d4"/></svg>';
const BARDAK='<svg viewBox="0 0 120 70" aria-hidden="true"><path d="M42 6h36l-5 60H47z" fill="#fdf6c9" stroke="#b9c7b8" stroke-width="4"/></svg>';
const SIMIT='<svg viewBox="0 0 120 70" aria-hidden="true"><ellipse cx="60" cy="36" rx="46" ry="28" fill="#c98b4a"/><ellipse cx="60" cy="36" rx="20" ry="11" fill="#fffffb"/></svg>';
function tencereCiz(){
 cerceve('Ustanın tenceresi',`<div class="usta"><img id="panda" src="assets/pastacilik-ilk/panda-isteme.webp" alt=""><div class="balon" id="balon"><span>Yemekler baharatını bekliyor. Doğru baharatı yemeğe koy.</span><button class="oku" aria-label="Sesli oku" onclick="BaharatRafi._oku()">🔊</button></div></div>
 <div class="tencere">${YEMEK.map((y,i)=>`<div class="yemek${S.yerlesen[i]?' tamam':''}" data-i="${i}" onclick="BaharatRafi._yemek(${i})"><span class="buhar">∿ ∿ ∿</span>${({kase:KASE,simit:SIMIT,tabak:TABAK,tencere:TENCERE,bardak:BARDAK})[y.sekil]||KASE}${y.ad}</div>`).join('')}</div>
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
 const once=kayit();const rekor=S.puan>(once.puan||0);
 if(!S.odul){S.odul=true;odul(y);siralama(S.puan,once);kaydet({...kayit(),yildiz:Math.max(y,once.yildiz||0),puan:Math.max(S.puan,once.puan||0),oynama:(once.oynama||0)+1,yanlislar:S.yanlisIds.slice()});}
 const toplam=KUTULAR.filter(k=>kayit(k.no).yildiz).length*4,sonrakiK=KUTULAR[K.no];
 cerceve('Kutu '+K.no+' tamam',`${rafHTML()}<div class="son"><div class="yildizlar">${'★'.repeat(y)}<span class="bos">${'★'.repeat(3-y)}</span></div>
 <div class="kart"><b>${S.puan} puan</b>${rekor&&once.puan?' · Yeni rekorun!':''}<br>En iyin: ${Math.max(S.puan,once.puan||0)} puan · Baharat Rafı: ${toplam} / 96 kavanoz${y===3?'<br>Hatasız kutu! Kavanoz kapakları altın oldu.':''}</div>
 <div class="kart" id="br-sira" hidden style="font-weight:bold"></div>
 ${sonrakiK?`<div class="kart">Kutu ${sonrakiK.no} açıldı: 4 yeni baharat seni bekliyor<div class="bugu"><i>?</i><i>?</i><i>?</i><i>?</i></div></div>`:'<div class="kart">Yeni kutular yakında rafa gelecek.</div>'}
 ${y<3?'<div style="font-size:15px">3 yıldız için kutuyu hatasız bitir.</div>':''}
 ${sonrakiK?`<button class="btn" onclick="BaharatRafi._kutu(${sonrakiK.no})">Kutu ${sonrakiK.no}'e geç</button><button class="btn ikinci" onclick="BaharatRafi._tekrar()">Yeniden oyna</button>`:`<button class="btn" onclick="BaharatRafi._tekrar()">Yeniden oyna</button><button class="btn ikinci" onclick="BaharatRafi._liste()">Rafa dön</button>`}</div>`);
 setTimeout(()=>ses('yildiz'),1300);
}
/* Raf: kutu listesi. Kutu, öncekini bitirince açılır. */
function listeCiz(){
 const toplam=KUTULAR.filter(k=>kayit(k.no).yildiz).length*4;
 cerceve('Baharat Rafı',`<div class="raf-liste"><div class="kart raf-ozet"><b>${toplam} / 96 kavanoz</b><span>Her kutuda 4 baharat · 8 soru</span></div>
 ${KUTULAR.map(k=>{const r=kayit(k.no),acik=acikMi(k.no),y=r.yildiz||0;
  return `<button class="kutu-kart${acik?'':' kilitli'}" ${acik?`onclick="BaharatRafi._kutu(${k.no})"`:'aria-disabled="true"'}>
   <span class="kutu-no">Kutu ${k.no}</span>
   <span class="kutu-foto">${k.ids.map(id=>acik?`<img src="${B[id].img}" alt="">`:'<i>?</i>').join('')}</span>
   <span class="kutu-alt">${acik?`<span class="kutu-yildiz">${'★'.repeat(y)}<span class="bos">${'★'.repeat(3-y)}</span></span>${r.puan?`<small>En iyi ${r.puan} puan</small>`:'<small>Yeni</small>'}`:'<small>Kutu '+(k.no-1)+' bitince açılır</small>'}</span>
  </button>`;}).join('')}</div>`);
}

 const screens=['baharatrafi'];
 function renderScreen(){if(!S)S={ekran:'liste'};ciz();document.body.dataset.screen='baharatrafi';}
 function ac(){S={ekran:'liste'};go('baharatrafi');}
 function kutlamaKapat(){const t=document.getElementById('rutbeKutlama');if(t)t.remove();}
 function kutu(n){if(!acikMi(n)){ses('kilitli');return;}kutlamaKapat();yeni(n);ses('ileri');ciz();}
 function geri(){if(S&&S.ekran!=='liste'){S={ekran:'liste'};ses('geri');ciz();}else back();}
 return {screens,renderScreen,ac,_ileri:()=>tanisIleri(),_oku:()=>oku(),_yemek:i=>yemekDokun(i),_kutu:kutu,_geri:geri,_liste:()=>{S={ekran:'liste'};ciz();},_tekrar:()=>{kutlamaKapat();yeni(K.no);S.ekran='soru';ses('basla');ciz();},_durum:()=>S,_K:()=>K};
})();
