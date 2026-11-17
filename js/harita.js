/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Yolculuğum haritası (taslak, 18.11.2026).
   Dünya haritası (parşömen) → yola dokun → panda yürür, arkasında iz kalır → kamera bölgeye yakınlaşır →
   bölge resminde 8 taş durak. Görseller GPT ile üretildi (assets/harita). Yer adları HTML'de; resme gömülü yazı yok.
   Sakin mod ve "hareketi azalt": yürüyüş ve yakınlaşma olmaz, ekran doğrudan değişir. */
'use strict';
(function(){
 if(typeof render!=='function')return;
 const DUNYA={en:1055,boy:1491,
  yollar:{
   pasta:{ad:'Pastacılık',yol:[[48.5,82.5],[47.9,71.4],[47.7,59],[40.8,57.7],[28.4,53],[24.6,47],[22.7,41.6],[20.2,35.9]],etiket:[21,24]},
   sicak:{ad:'Sıcak Mutfak',yol:[[48.5,82.5],[47.9,71.4],[47.7,59],[47.8,45],[47.9,30]],etiket:[47.9,16.5]},
   servis:{ad:'Servis',yol:[[48.5,82.5],[47.9,71.4],[47.7,59],[56.9,55.7],[68.2,51],[73.9,48.3],[75.8,46.3]],etiket:[80,21.5]}
  },
  yan:[
   {id:'baharat',ad:'Baharat Korusu',xy:[18,47.3],et:[18,53]},
   {id:'olcu',ad:'Ölçü Değirmeni',xy:[52.1,41.6],et:[52.1,47]},
   {id:'arac',ad:'Araç Çarşısı',xy:[75.8,50],et:[76,55.5]}
  ],
  baslangic:{ad:'Temiz Mutfak',xy:[48.4,84.8],et:[48.4,93]}
 };
 /* Bölge resimleri 941×1672; taş durakların merkezi (yüzde), aşağıdan yukarı. */
 const BOLGE={
  servis:[[49.9,87],[25.5,73.9],[30.3,62.8],[65.9,53.5],[42.5,45.2],[65.4,37.6],[44.8,31.4],[43,25.1]],
  pasta:[[52.6,87.9],[34.5,76],[23.9,64.6],[45.2,54.7],[65,46.5],[39,39.4],[61.4,32.7],[48.6,27.1]],
  sicak:[[50.5,87.3],[30.6,73.4],[19.9,61.8],[39.3,52.8],[63.4,47.5],[76.2,40.9],[56.3,34.2],[43.1,28.5]]
 };
 const H={katman:'dunya',bolge:null,yuruyor:null,konum:'baslangic'};
 function hareketli(){return document.documentElement.dataset.sakin!=='1'&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);}
 function dost(){try{return typeof dostSecili==='function'?dostSecili():'panda';}catch(e){return 'panda';}}
 const YURUYEN=['panda','civciv'];
 function piyon(){return YURUYEN.includes(dost())?'<span class="hr-piyon" aria-hidden="true"><img src="assets/harita/'+dost()+'-adim-1.webp" alt=""><img src="assets/harita/'+dost()+'-adim-2.webp" alt=""></span>':'<span class="hr-piyon hr-piyon-dost" aria-hidden="true"><img src="assets/ascidostum/'+dost()+'.webp" alt="" onerror="this.src=\'assets/harita/panda-adim-1.webp\'"></span>';}
 function cizim(){
  const d=DUNYA,y=d.yollar;
  const yolDug=Object.keys(y).map(k=>{const s=y[k].yol[y[k].yol.length-1],e=y[k].etiket;
   return '<button type="button" class="hr-hedef" style="left:'+s[0]+'%;top:'+(s[1]-9)+'%" onclick="haritaYol(\''+k+'\')" aria-label="'+y[k].ad+' yolu"></button>'+
          '<button type="button" class="hr-etiket hr-ana" style="left:'+e[0]+'%;top:'+e[1]+'%" onclick="haritaYol(\''+k+'\')">'+y[k].ad+'</button>';}).join('');
  const yan=d.yan.map(s=>'<button type="button" class="hr-etiket hr-yan" style="left:'+s.et[0]+'%;top:'+s.et[1]+'%" onclick="haritaYan(\''+s.id+'\')">'+s.ad+'</button>').join('');
  const bas='<span class="hr-etiket hr-bas" style="left:'+d.baslangic.et[0]+'%;top:'+d.baslangic.et[1]+'%">'+d.baslangic.ad+'</span>';
  const bolgeler=Object.keys(BOLGE).map(k=>'<div class="hr-bolge" data-bolge="'+k+'" hidden><div class="hr-kutu hr-kutu-bolge"><img class="hr-zemin" src="assets/harita/bolge-'+k+'.webp" alt="" decoding="async">'+
   BOLGE[k].map((t,i)=>'<button type="button" class="hr-durak" style="left:'+t[0]+'%;top:'+t[1]+'%" onclick="haritaDurak(\''+k+'\','+i+')" aria-label="'+DUNYA.yollar[k].ad+', '+(i+1)+'. durak"><b>'+(i+1)+'</b></button>').join('')+
   '<div class="hr-izler"></div><p class="hr-bolge-ad lc-title">'+DUNYA.yollar[k].ad+'</p></div></div>').join('');
  return topBar('Yolculuğum')+'<div class="hr-sahne"><p class="hr-yonerge">Bir yol seç; Aşçı Dostun oraya yürüsün.</p>'+
   '<div class="hr-dunya"><div class="hr-kutu hr-kutu-dunya"><img class="hr-zemin" src="assets/harita/dunya.webp" alt="Yolculuk haritası: Temiz Mutfak köyünden Pastacılık, Sıcak Mutfak ve Servis diyarlarına giden üç yol" decoding="async">'+yolDug+yan+bas+'<div class="hr-izler"></div>'+piyon()+'</div></div>'+bolgeler+'</div>';
 }
 /* Kutuyu ekrana sığdır: resim oranı korunur, kaydırma olmaz. */
 function sigdir(){
  const s=document.querySelector('.hr-sahne');if(!s)return;const r=s.getBoundingClientRect(),yon=s.querySelector('.hr-yonerge');
  const Hh=r.height-(yon&&!yon.hidden?yon.offsetHeight+6:0)-8,W=r.width-12;
  s.querySelectorAll('.hr-kutu').forEach(k=>{const oran=k.classList.contains('hr-kutu-dunya')?DUNYA.en/DUNYA.boy:941/1672;
   const w=Math.min(W,Hh*oran);k.style.width=w+'px';k.style.height=(w/oran)+'px';});
 }
 function px(kutu,p){return [p[0]/100*kutu.clientWidth,p[1]/100*kutu.clientHeight];}
 function piyonKoy(kutu,p){const pi=kutu.querySelector('.hr-piyon');if(!pi)return;const [x,y]=px(kutu,p);pi.style.left=x+'px';pi.style.top=y+'px';}
 function iz(kutu,x,y,aci,sol){const z=kutu.querySelector('.hr-izler');if(!z)return;const e=document.createElement('img');e.src='assets/harita/iz.webp';e.alt='';e.className='hr-iz';
  const k=sol?-1:1,ox=Math.cos(aci)*k*4,oy=Math.sin(aci)*k*4;e.style.left=(x-oy)+'px';e.style.top=(y+ox)+'px';e.style.transform='translate(-50%,-50%) rotate('+(aci*180/Math.PI+90)+'deg)';z.appendChild(e);
  setTimeout(()=>e.classList.add('sol'),2600);setTimeout(()=>e.remove(),4200);}
 /* Yürüyüş: noktalar boyunca sabit hızla; adım resmi değişir, belli aralıkla iz bırakır. Dokununca biter. */
 function yuru(kutu,noktalar,sure,bitti){
  const pi=kutu.querySelector('.hr-piyon');const P=noktalar.map(p=>px(kutu,p));
  if(!hareketli()||!pi||P.length<2){piyonKoy(kutu,noktalar[noktalar.length-1]);bitti();return;}
  const parca=[];let top=0;for(let i=1;i<P.length;i++){const d=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);parca.push(d);top+=d;}
  let bas=null,sonIz=0,adim=0,bitmis=false;pi.classList.add('yuruyor');
  const atla=()=>{if(bitmis)return;bitmis=true;cancelAnimationFrame(H.yuruyor);document.removeEventListener('pointerdown',atla,true);pi.classList.remove('yuruyor');piyonKoy(kutu,noktalar[noktalar.length-1]);bitti();};
  setTimeout(()=>document.addEventListener('pointerdown',atla,true),150);
  function kare(t){if(bitmis)return;if(bas===null)bas=t;let m=Math.min(1,(t-bas)/sure)*top,i=0;while(i<parca.length-1&&m>parca[i]){m-=parca[i];i++;}
   const a=P[i],b=P[i+1],o=parca[i]?m/parca[i]:1,x=a[0]+(b[0]-a[0])*o,y=a[1]+(b[1]-a[1])*o,aci=Math.atan2(b[1]-a[1],b[0]-a[0]);
   pi.style.left=x+'px';pi.style.top=y+'px';pi.classList.toggle('sol-ayak',(((t-bas)/170)|0)%2===1);
   const gidilen=(t-bas)/sure*top;if(gidilen-sonIz>Math.max(9,kutu.clientWidth*.028)){sonIz=gidilen;iz(kutu,x,y,aci,(adim++)%2===0);}
   if(t-bas>=sure){atla();return;}H.yuruyor=requestAnimationFrame(kare);}
  H.yuruyor=requestAnimationFrame(kare);
 }
 function bolgeAc(k){
  const dunya=document.querySelector('.hr-dunya'),b=document.querySelector('.hr-bolge[data-bolge="'+k+'"]'),yon=document.querySelector('.hr-yonerge');if(!b)return;
  H.katman='bolge';H.bolge=k;const kutu=dunya.querySelector('.hr-kutu'),son=DUNYA.yollar[k].yol.slice(-1)[0];
  const ac=()=>{dunya.hidden=true;dunya.classList.remove('yakin');b.hidden=false;if(yon)yon.hidden=true;sigdir();
   const bk=b.querySelector('.hr-kutu');if(!bk.querySelector('.hr-piyon'))bk.insertAdjacentHTML('beforeend',piyon());piyonKoy(bk,BOLGE[k][0]);
   b.classList.remove('gel');void b.offsetWidth;b.classList.add('gel');b.querySelector('.hr-durak').focus({preventScroll:true});};
  if(!hareketli()){ac();return;}
  kutu.style.transformOrigin=son[0]+'% '+son[1]+'%';dunya.classList.add('yakin');setTimeout(ac,950);
 }
 window.haritaYol=function(k){
  if(H.katman!=='dunya'||H.mesgul)return;const kutu=document.querySelector('.hr-kutu-dunya');if(!kutu)return;
  H.mesgul=true;try{if(window.kisSesi&&kisSesi.adim)kisSesi.adim();}catch(e){}
  yuru(kutu,DUNYA.yollar[k].yol,2600,()=>{H.mesgul=false;bolgeAc(k);});
 };
 window.haritaDurak=function(k,i){
  if(H.mesgul)return;const kutu=document.querySelector('.hr-bolge[data-bolge="'+k+'"] .hr-kutu');H.mesgul=true;
  /* Taslak: panda ilk duraktan seçilen durağa yürür, sonra o dalın Teori ve Uygulama penceresi açılır.
     Hangi durağın hangi konuyu açacağı ayrıca kararlaştırılacak. */
  yuru(kutu,BOLGE[k].slice(0,i+1),Math.max(700,i*650),()=>{H.mesgul=false;if(typeof anaYol==='function')anaYol(k);});
 };
 window.haritaYan=function(id){
  if(id==='baharat'&&typeof openSubject==='function'){openSubject('baharat');return;}
  if(id==='arac'&&typeof openSubject==='function'){openSubject('mutfak-araclari');return;}
  if(typeof ayAc==='function'){const b=ayAc('<button type="button" class="lc-close" aria-label="Kapat" onclick="closeModal()">×</button><h2 class="lc-title">Ölçü Değirmeni</h2><p>Bu yan görev yakında açılacak.</p><button class="btn pri" type="button" onclick="closeModal()">Tamam</button>','Ölçü Değirmeni');if(b)b.classList.add('lc-parchment');}
 };
 function geriDunya(){
  const b=document.querySelector('.hr-bolge:not([hidden])'),dunya=document.querySelector('.hr-dunya'),yon=document.querySelector('.hr-yonerge');
  if(b)b.hidden=true;if(dunya){dunya.hidden=false;if(yon)yon.hidden=false;sigdir();const kutu=dunya.querySelector('.hr-kutu');piyonKoy(kutu,DUNYA.baslangic.xy);
   if(hareketli()){dunya.classList.add('yakin','anlik');void kutu.offsetWidth;dunya.classList.remove('anlik');requestAnimationFrame(()=>dunya.classList.remove('yakin'));}}
  H.katman='dunya';H.bolge=null;
 }
 const eskiRender=render;
 render=function(){
  if(st.screen!=='loncayollar')return eskiRender.apply(this,arguments);
  document.body.classList.remove('ae-is-home','oyun-ekrani','lc-sahne-acik');document.body.dataset.screen='harita';
  document.getElementById('app').innerHTML=cizim();H.katman='dunya';H.bolge=null;H.mesgul=false;
  try{if(window.sahneGuncelle)sahneGuncelle();}catch(e){}
  requestAnimationFrame(()=>{sigdir();const k=document.querySelector('.hr-kutu-dunya');if(k)piyonKoy(k,DUNYA.baslangic.xy);});
 };
 const eskiGeri=back;
 back=function(){if(st.screen==='loncayollar'&&!st.modalOpen&&H.katman==='bolge'){geriDunya();return;}return eskiGeri.apply(this,arguments);};
 addEventListener('resize',()=>{if(st.screen!=='loncayollar')return;sigdir();const k=document.querySelector(H.katman==='bolge'?'.hr-bolge:not([hidden]) .hr-kutu':'.hr-kutu-dunya');if(k)piyonKoy(k,H.katman==='bolge'?BOLGE[H.bolge][0]:DUNYA.baslangic.xy);});
 window.HARITA_TASLAK={DUNYA,BOLGE};
})();
