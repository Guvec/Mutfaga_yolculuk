/* © 2026 Ali Arıkoğlu. Ana sayfa canlılığı: mevsim katmanı (kar yağışı, kar birikimi, sonbahar yaprakları)
   ve Aşçı Dostu panda pozları. Kartlar HTML kalır; efektler yazının arkasındadır, dokunmayı engellemez.
   Sakin mod ve "hareketi azalt" açıkken hiçbir şey düşmez; kar birikimi durağan görünür.
   Yeni tercih anahtarı: mesleki-mevsim (oto | kis | kapali). Mevcut kayıt anahtarlarına dokunulmaz. */
'use strict';
(function(){
 const ANAHTAR='mesleki-mevsim';
 const SIRA=['oto','kis','ilkbahar','yaz','sonbahar','kapali'];
 function tercih(){try{const v=localStorage.getItem(ANAHTAR);return SIRA.includes(v)?v:'oto';}catch(e){return 'oto';}}
 /* Otomatik: 15 Kasım – Şubat sonu kış; Mart – Mayıs ilkbahar; Haziran – Ağustos yaz; Eylül – 14 Kasım sonbahar. */
 function takvimMevsimi(t){const a=t.getMonth()+1,g=t.getDate();
  if(a===12||a===1||a===2||(a===11&&g>=15))return 'kis';
  if(a>=3&&a<=5)return 'ilkbahar';
  if(a>=6&&a<=8)return 'yaz';
  return 'sonbahar';}
 /* mevsim(): efektler için (Kapalı seçilince boş). kartMevsimi(): Yolculuğum resmi için (Kapalı'da takvime uyar). */
 function mevsim(){const p=tercih();if(p==='kapali')return '';if(p!=='oto')return p;return takvimMevsimi(new Date());}
 function kartMevsimi(){return mevsim()||takvimMevsimi(new Date());}
 window.sahneMevsim=mevsim;
 function hareketli(){
  if(document.documentElement.dataset.sakin==='1')return false;
  try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return false;}catch(e){}
  return true;
 }
 function temaUygun(){const t=document.documentElement.dataset.theme;return t!=='yuksek';}

 /* ---------- Yağış: kar taneleri ya da yapraklar (tek canvas, ~30 kare/sn) ---------- */
 const YAPRAK=[1,2,3,4].map(i=>{const im=new Image();im.decoding='async';im.src='assets/sahne/yaprak-'+i+'.webp';return im;});
 let kar=null;
 function karTanesi(){ // önceden çizilmiş yumuşak kar tanesi
  if(kar)return kar;kar=document.createElement('canvas');kar.width=kar.height=32;
  const g=kar.getContext('2d'),r=g.createRadialGradient(16,16,0,16,16,16);
  r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.45,'rgba(250,253,255,.85)');r.addColorStop(1,'rgba(235,245,255,0)');
  g.fillStyle=r;g.fillRect(0,0,32,32);return kar;
 }
 function yagisYap(tuval,adet){
  const c=tuval.getContext&&tuval.getContext('2d');
  if(!c)return {kur(){},boyut(){},baslat(){},durdur(){}}; // canvas yoksa sessizce çalışmaz
  let W=0,H=0,olcek=1,parca=[],tur='',calis=false,id=0,son=0;
  function boyut(){const r=tuval.getBoundingClientRect();W=r.width;H=r.height;olcek=Math.min(window.devicePixelRatio||1,2);
   tuval.width=Math.max(1,Math.round(W*olcek));tuval.height=Math.max(1,Math.round(H*olcek));c.setTransform(olcek,0,0,olcek,0,0);}
  function yeni(p,ilk){
   p.x=Math.random()*W;p.y=ilk?Math.random()*H:-30;p.faz=Math.random()*6.3;
   if(tur==='kis'){p.r=.9+Math.random()*1.7;p.hiz=14+p.r*8+Math.random()*8;p.salin=5+Math.random()*10;p.a=.45+Math.random()*.4;}
   else{p.r=14+Math.random()*12;p.hiz=24+Math.random()*22;p.salin=18+Math.random()*26;p.a=.85;p.don=(Math.random()-.5)*2.4;p.im=YAPRAK[(Math.random()*4)|0];}
   return p;
  }
  function kare(n){
   if(!calis)return;id=requestAnimationFrame(kare);
   if(n-son<32)return;const dt=Math.min((n-son)/1000,.1);son=n;
   c.clearRect(0,0,W,H);
   for(const p of parca){
    p.y+=p.hiz*dt;p.faz+=dt*(tur==='kis'?.9:1.2);
    const x=p.x+Math.sin(p.faz)*p.salin;
    if(tur==='kis'){c.globalAlpha=p.a;c.drawImage(karTanesi(),x-p.r*2,p.y-p.r*2,p.r*4,p.r*4);}
    else if(p.im.complete&&p.im.naturalWidth){c.save();c.globalAlpha=p.a;c.translate(x,p.y);c.rotate(p.faz*p.don);c.scale(Math.cos(p.faz*1.3),1);c.drawImage(p.im,-p.r/2,-p.r/2,p.r,p.r);c.restore();}
    if(p.y>H+30)yeni(p,false);
   }
   c.globalAlpha=1;
  }
  return {
   kur(t){if(t===tur&&parca.length)return;tur=t;boyut();parca=Array.from({length:t==='kis'?adet:Math.ceil(adet/4)},()=>yeni({},true));},
   boyut,
   baslat(){if(calis)return;calis=true;son=0;id=requestAnimationFrame(kare);},
   durdur(){calis=false;cancelAnimationFrame(id);c.clearRect(0,0,W,H);}
  };
 }
 let arka=null,arkaYagis=null,yolYagis=null,yolTuval=null;
 function arkaKur(){
  if(arka)return;arka=document.createElement('canvas');arka.id='lcYagis';arka.setAttribute('aria-hidden','true');
  document.body.prepend(arka);arkaYagis=yagisYap(arka,30);
  addEventListener('resize',()=>{arkaYagis.boyut();if(yolYagis)yolYagis.boyut();});
 }

 /* ---------- Yolculuğum kartı: mevsimin yolculuk sahnesi (karakterli sahneler GPT'den gelecek) ---------- */
 function yolKartKur(){
  const yol=document.querySelector('#app .lc-home .lc-journey');if(!yol)return;
  const m=kartMevsimi();
  yol.style.setProperty('--lc-scene',"url('"+new URL('assets/yolculuk/kart-'+m+'.webp',document.baseURI).href+"')");
  yol.dataset.mevsim=m;
 }
 /* ---------- Güncelleme ---------- */
 function guncelle(){
  const ev=!!document.querySelector('#app .lc-home')&&temaUygun();
  const m=ev?mevsim():'';
  document.body.classList.toggle('lc-sahne-acik',ev);
  document.body.classList.toggle('lc-kis',m==='kis');
  document.body.classList.toggle('lc-sonbahar',m==='sonbahar');
  if(ev)yolKartKur();
  /* Uzun oyuncu adı (ör. Şef Kaplumbağa) kelime ortasından bölünmesin: sığana kadar yazı küçülür. */
  const ad=document.querySelector('#app .lc-home .lc-profile strong');
  if(ad){ad.style.fontSize='';const kelime=Math.max(...ad.textContent.trim().split(/\s+/).map(k=>k.length));let fs=parseFloat(getComputedStyle(ad).fontSize),i=0;
   const r=document.createRange();const tasar=()=>{r.selectNodeContents(ad);return ad.scrollWidth>ad.clientWidth+1||(typeof r.getClientRects==='function'&&r.getClientRects().length>2);};
   while(kelime>8&&tasar()&&i++<10&&fs>13){fs-=1;ad.style.fontSize=fs+'px';}}
  /* Kış: zeminin dört köşesinde buz deseni */
  let buz=document.getElementById('lcBuz');
  if(!buz){buz=document.createElement('div');buz.id='lcBuz';buz.setAttribute('aria-hidden','true');buz.innerHTML='<i></i><i></i><i></i><i></i>';document.body.prepend(buz);}
  buz.hidden=!(ev&&m==='kis');
  /* Sıralama kartı: kupalı kürsü (mevsime göre CSS seçer). */
  const sira=document.querySelector('#app .lc-home .lc-grid .lc-card:nth-child(3) .lc-stage');
  if(sira&&!sira.querySelector('.lc-kursu')){const e=sira.querySelector('.lc-emblem');if(e)e.remove();sira.insertAdjacentHTML('afterbegin','<span class="lc-emblem lc-kursu" aria-hidden="true"></span>');}
  const dus=ev&&(m==='kis'||m==='sonbahar')&&hareketli()&&!document.hidden;
  if(!dus){if(arkaYagis)arkaYagis.durdur();if(yolYagis)yolYagis.durdur();if(arka)arka.hidden=true;return;}
  arkaKur();arka.hidden=false;arkaYagis.kur(m);arkaYagis.baslat();
  /* Yolculuğum kartının içinde de, yazının arkasında hafif yağış */
  const yol=document.querySelector('#app .lc-home .lc-journey');
  if(yol&&!yol.contains(yolTuval)){if(yolYagis)yolYagis.durdur();yolTuval=document.createElement('canvas');yolTuval.className='lc-yol-yagis';yolTuval.setAttribute('aria-hidden','true');yol.prepend(yolTuval);yolYagis=yagisYap(yolTuval,16);}
  if(yolYagis){yolYagis.kur(m);yolYagis.baslat();}
 }
 document.addEventListener('visibilitychange',guncelle);

 /* ---------- Ayarlar: Mevsim satırı (Sakin mod satırının altına) ---------- */
 const AD={oto:'Otomatik',kis:'Kış',ilkbahar:'İlkbahar',yaz:'Yaz',sonbahar:'Sonbahar',kapali:'Kapalı'};
 function mevsimYazi(){const p=tercih(),m=mevsim();return p==='oto'?'Otomatik ('+AD[m]+')':AD[p];}
 const eskiAyarlar=window.anaAyarlar;
 if(typeof eskiAyarlar==='function')window.anaAyarlar=function(){
  const s=eskiAyarlar.apply(this,arguments);
  const sakin=document.getElementById('aySakin');
  if(sakin&&!document.getElementById('ayMevsim')&&typeof aySatir==='function'){
   sakin.insertAdjacentHTML('afterend',aySatir('ayMevsim','❄️','Mevsim',mevsimYazi()));
   const b=document.getElementById('ayMevsim');
   b.setAttribute('aria-describedby','ayMevsimNot');
   b.insertAdjacentHTML('afterend','<p id="ayMevsimNot" class="ay-not">Yolculuğum resmi ve hava efektleri mevsime göre değişir: kışın kar, sonbaharda yaprak. Otomatik seçimde kış 15 Kasım\'da başlar. Kapalı seçilirse efektler durur.</p>');
   b.onclick=()=>{const n=SIRA[(SIRA.indexOf(tercih())+1)%SIRA.length];try{localStorage.setItem(ANAHTAR,n);}catch(e){}b.querySelector('.ay-deger').textContent=mevsimYazi();guncelle();};
  }
  return s;
 };

 /* ---------- Aşçı Dostu panda pozları ---------- */
 const POZ=['bekliyor','goz-kirpma','mutlu','sevincli','ekranin-sagina-bakiyor','ekranin-soluna-bakiyor','saklanip-bakiyor','dusunuyor','uyukluyor','selam'];
 window.sahnePandaYigin=function(){
  return '<span class="lc-poz-yigin">'+POZ.map(p=>'<img alt="" decoding="async" data-poz="'+p+'" src="assets/ascidostum/panda-poz/panda-'+p+'.webp"'+(p==='bekliyor'?' class="on"':'')+'>').join('')+'</span>';
 };
 let pz={kart:null,zaman:[],sonDokunus:0,uyku:false,gecici:false};
 function pozGoster(ad){if(!pz.kart||!pz.kart.isConnected)return;pz.kart.querySelectorAll('.lc-poz-yigin img').forEach(i=>i.classList.toggle('on',i.dataset.poz===ad));}
 function pozTemizle(){pz.zaman.forEach(clearTimeout);pz.zaman=[];}
 function sonra(ms,f){pz.zaman.push(setTimeout(f,ms));}
 function gecici(ad,ms){pz.gecici=true;pozGoster(ad);sonra(ms,()=>{pz.gecici=false;if(!pz.uyku)pozGoster('bekliyor');});}
 function dongu(){
  /* Göz kırpma 3–5 sn'de bir; arada bakınma ya da düşünme; uzun beklemede uyuklama. */
  sonra(3000+Math.random()*2000,()=>{
   if(!pz.kart||!pz.kart.isConnected){pozTemizle();return;}
   if(document.hidden||pz.uyku||pz.gecici){dongu();return;}
   if(performance.now()-pz.sonDokunus>45000){pz.uyku=true;pozGoster('uyukluyor');dongu();return;}
   const z=Math.random();
   if(z<.22)gecici(['ekranin-sagina-bakiyor','ekranin-soluna-bakiyor'][Math.random()<.5?0:1],1700);
   else if(z<.3)gecici('dusunuyor',1800);
   else if(z<.36)gecici('mutlu',1500);
   else gecici('goz-kirpma',170);
   dongu();
  });
 }
 function uyan(){pz.sonDokunus=performance.now();if(pz.uyku){pz.uyku=false;gecici('mutlu',1100);}}
 function pandaKur(){
  pozTemizle();pz.uyku=false;pz.gecici=false;
  pz.kart=document.querySelector('.lc-home .lc-dost');
  if(!pz.kart||!pz.kart.querySelector('.lc-poz-yigin'))return;
  pz.kart.classList.add('lc-dost-pozlu');
  if(!hareketli()){pozGoster('bekliyor');return;}
  pz.sonDokunus=performance.now();
  /* Sayfaya gelişte alttan bakar, sonra yerine oturur. */
  pozGoster('saklanip-bakiyor');pz.gecici=true;sonra(900,()=>{pz.gecici=false;pozGoster('bekliyor');});
  pz.kart.addEventListener('pointerdown',()=>{uyan();pozTemizle();gecici(Math.random()<.5?'selam':'sevincli',1200);dongu();});
  dongu();
 }
 ['pointerdown','keydown'].forEach(e=>document.addEventListener(e,uyan,{passive:true}));
 const eskiMutfak=window.anaDostMutfak;
 if(typeof eskiMutfak==='function')window.anaDostMutfak=function(){
  /* Pandanın selamı görünsün diye kısa bekleme; hareket kapalıysa hemen açılır. */
  if(pz.kart&&pz.kart.isConnected&&pz.kart.classList.contains('lc-dost-pozlu')&&hareketli()){setTimeout(()=>eskiMutfak.apply(this,arguments),450);return;}
  return eskiMutfak.apply(this,arguments);
 };

 /* Her ekran çiziminden sonra mevsim katmanını ve pozları güncelle. */
 const eskiRender=render;
 render=function(){const s=eskiRender.apply(this,arguments);guncelle();if(document.querySelector('#app .lc-home .lc-poz-yigin')&&(!pz.kart||!pz.kart.isConnected))pandaKur();return s;};
 new MutationObserver(guncelle).observe(document.documentElement,{attributes:true,attributeFilter:['data-sakin','data-theme']});
 guncelle();pandaKur();
})();
/* lonca.js ilk çizimi bu dosyadan önce yaptı; panda pozları için ana sayfa bir kez yeniden çizilir. */
if(document.querySelector('#app .lc-home')&&!document.querySelector('#app .lc-poz-yigin')&&typeof dostSecili==='function'&&dostSecili()==='panda')render();
