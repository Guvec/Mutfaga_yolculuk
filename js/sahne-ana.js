/* © 2026 Ali Arıkoğlu. Ana sayfa canlı sahnesi (three.js) ve Aşçı Dostu panda pozları.
   Kartlar HTML kalır; sahne yalnız arkada süs katmanıdır. Oyun kurallarına ve kayıtlara dokunmaz.
   Sakin mod, hareket azaltma, zayıf cihaz ya da WebGL yoksa durağan resim gösterilir. */
'use strict';
(function(){
 const KOK='assets/sahne/';
 const TUVAL={w:720,h:1280};
 const KATMAN=[ // y ve h: 720×1280 tuvalde (assets/sahne/katmanlar.json ile aynı)
  {ad:'sahne-1-gokyuzu',y:0,h:1280,d:60},
  {ad:'sahne-2-daglar-kale',y:493,h:336,d:40},
  {ad:'sahne-3-orman',y:607,h:673,d:22},
  {ad:'sahne-4-on-plan',y:1021,h:259,d:12}
 ];
 const MUM={x:648,y:1040}; // mum alevinin tuvaldeki yeri
 const FOV=40,TASMA=1.08;
 let kap=null,durgun=null,canli=null,yukleniyor=false,threeYok=false;

 function hareketli(){
  if(document.documentElement.dataset.sakin==='1')return false;
  try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return false;}catch(e){}
  return true;
 }
 function zayifCihaz(){
  const m=navigator.deviceMemory,c=navigator.hardwareConcurrency;
  return (m&&m<=2)||(c&&c<=2);
 }
 function temaUygun(){const t=document.documentElement.dataset.theme;return t==='lonca'||t==='loncakrem';}
 function yerlesim(W,H){const s=Math.max(W/TUVAL.w,H/TUVAL.h)*TASMA;return {s,ox:(W-TUVAL.w*s)/2,oy:(H-TUVAL.h*s)/2};}

 /* Durağan resim: katmanlar üst üste img; three yüklenene kadar da görünür. */
 function durgunKur(){
  if(durgun)return;
  durgun=document.createElement('div');durgun.className='lc-sahne-durgun';
  durgun.innerHTML=KATMAN.map(k=>'<img alt="" decoding="async" src="'+KOK+k.ad+'.webp">').join('');
  kap.appendChild(durgun);durgunYerlestir();
 }
 function durgunYerlestir(){
  if(!durgun)return;const W=innerWidth,H=innerHeight,{s,ox,oy}=yerlesim(W,H);
  [...durgun.children].forEach((img,i)=>{const k=KATMAN[i];Object.assign(img.style,{left:ox+'px',top:(oy+k.y*s)+'px',width:(TUVAL.w*s)+'px',height:(k.h*s)+'px'});});
 }

 function kapKur(){
  if(kap)return;
  kap=document.createElement('div');kap.id='lcSahne';kap.setAttribute('aria-hidden','true');
  document.body.prepend(kap);durgunKur();
  addEventListener('resize',()=>{durgunYerlestir();if(canli)canli.boyut();});
 }

 async function canliKur(){
  if(canli||yukleniyor||threeYok)return;
  yukleniyor=true;
  try{
   const T=await import(new URL('js/vendor/three.module.min.js',document.baseURI).href);
   canli=sahneYap(T);
   if(!canli)threeYok=true;
  }catch(e){threeYok=true;}
  yukleniyor=false;
  guncelle();
 }

 function sahneYap(T){
  let r;
  try{r=new T.WebGLRenderer({antialias:false,alpha:false,powerPreference:'low-power'});}catch(e){return null;}
  if(!r.getContext())return null;
  r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  r.outputColorSpace=T.SRGBColorSpace;
  r.domElement.className='lc-sahne-tuval';
  kap.appendChild(r.domElement);
  const sahne=new T.Scene(),kamera=new T.PerspectiveCamera(FOV,1,0.1,200);
  const yukle=new T.TextureLoader(),tan=Math.tan(FOV*Math.PI/360);
  let hazir=0;
  function doku(url){const t=yukle.load(url,()=>{hazir++;});t.colorSpace=T.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=T.LinearFilter;return t;}
  const katmanlar=KATMAN.map((k,i)=>{
   const m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:doku(KOK+k.ad+'.webp'),transparent:i>0,depthWrite:false}));
   m.renderOrder=i;sahne.add(m);return {k,m};
  });
  /* Mum ışığı: sıcak, yumuşak bir hale; alev titremesi gibi parlaklığı değişir. */
  const hc=document.createElement('canvas');hc.width=hc.height=128;
  const g=hc.getContext('2d'),rg=g.createRadialGradient(64,64,0,64,64,64);
  rg.addColorStop(0,'rgba(255,214,140,0.95)');rg.addColorStop(.25,'rgba(255,170,80,0.45)');rg.addColorStop(1,'rgba(255,140,40,0)');
  g.fillStyle=rg;g.fillRect(0,0,128,128);
  const haleDoku=new T.CanvasTexture(hc);haleDoku.colorSpace=T.SRGBColorSpace;
  const hale=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:haleDoku,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));
  hale.renderOrder=10;sahne.add(hale);
  /* Sonbahar yaprakları: farklı derinlikte düşer, döner, rüzgârla salınır. */
  const yDoku=[1,2,3,4].map(i=>doku(KOK+'yaprak-'+i+'.webp'));
  const yapraklar=[];
  for(let i=0;i<9;i++){
   const m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:yDoku[i%4],transparent:true,side:T.DoubleSide,depthWrite:false}));
   m.renderOrder=i%3===0?11:3;sahne.add(m);
   yapraklar.push({m,d:0,x:0,y:0,hiz:0,salin:0,faz:0,don:0,boy:0});
  }
  let W=1,H=1,kd=d=>2*d*tan/H;
  function yaprakBasla(p,ilk){
   p.d=14+Math.random()*16;const k=kd(p.d);
   p.boy=(22+Math.random()*20)*k;p.m.scale.set(p.boy,p.boy,1);
   p.x=(Math.random()-.5)*W*k;p.y=(ilk?(Math.random()-.5):.6)*H*k;
   p.hiz=(26+Math.random()*24)*k;p.salin=(18+Math.random()*24)*k;p.faz=Math.random()*6.3;p.don=(Math.random()-.5)*1.6;
   p.m.position.set(p.x,p.y,-p.d);
  }
  function boyut(){
   W=innerWidth;H=innerHeight;r.setSize(W,H,false);kamera.aspect=W/H;kamera.updateProjectionMatrix();
   const {s,ox,oy}=yerlesim(W,H);
   katmanlar.forEach(({k,m})=>{const q=kd(k.d),w=TUVAL.w*s,h=k.h*s,cx=ox+w/2,cy=oy+k.y*s+h/2;
    m.scale.set(w*q,h*q,1);m.position.set((cx-W/2)*q,(H/2-cy)*q,-k.d);});
   const q=kd(11.8),hx=ox+MUM.x*s,hy=oy+MUM.y*s,hb=150*s;
   hale.scale.set(hb*q,hb*q,1);hale.position.set((hx-W/2)*q,(H/2-hy)*q,-11.8);
   yapraklar.forEach(p=>yaprakBasla(p,true));
  }
  boyut();
  let son=0,t0=performance.now(),calis=false,id=0;
  function kare(n){
   if(!calis)return;id=requestAnimationFrame(kare);
   if(n-son<32)return; // yaklaşık 30 kare/sn: pil ve ısınma için
   const dt=Math.min((n-son)/1000,.1);son=n;const t=(n-t0)/1000;
   /* Kamera nefesi: yavaş, küçük kayma; yakın katmanlar daha çok kayar (derinlik). */
   kamera.position.set(Math.sin(t*.21)*.11,Math.sin(t*.15+1)*.06,Math.sin(t*.11)*.12);
   const f=.62+.18*Math.sin(t*9.1)+.12*Math.sin(t*23.7+1.3)+.08*Math.sin(t*3.3);
   hale.material.opacity=Math.max(.35,Math.min(1,f));
   yapraklar.forEach(p=>{
    p.y-=p.hiz*dt;p.faz+=dt*(.9+p.don*.3);
    p.m.position.set(p.x+Math.sin(p.faz)*p.salin,p.y,-p.d);
    p.m.rotation.set(Math.sin(p.faz*.7)*.9,Math.sin(p.faz*1.3)*1.2,p.faz*p.don);
    if(p.y<-.62*H*kd(p.d))yaprakBasla(p,false);
   });
   r.render(sahne,kamera);
   if(hazir>=KATMAN.length+4)kap.classList.add('lc-sahne-canli');
  }
  return {
   boyut,
   baslat(){if(calis)return;calis=true;son=0;id=requestAnimationFrame(kare);},
   durdur(){calis=false;cancelAnimationFrame(id);}
  };
 }

 function guncelle(){
  const ev=!!document.querySelector('#app .lc-home')&&temaUygun();
  document.body.classList.toggle('lc-sahne-acik',ev);
  if(!ev){if(canli)canli.durdur();return;}
  kapKur();
  const canliOlsun=hareketli()&&!zayifCihaz()&&!threeYok;
  kap.classList.toggle('lc-sahne-sakin',!canliOlsun);
  if(!canliOlsun){if(canli)canli.durdur();kap.classList.remove('lc-sahne-canli');return;}
  if(!canli){canliKur();return;}
  if(document.hidden)canli.durdur();else canli.baslat();
 }
 document.addEventListener('visibilitychange',guncelle);

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

 /* Her ekran çiziminden sonra sahneyi ve pozları güncelle. */
 const eskiRender=render;
 render=function(){const s=eskiRender.apply(this,arguments);guncelle();if(document.querySelector('#app .lc-home .lc-poz-yigin')&&(!pz.kart||!pz.kart.isConnected))pandaKur();return s;};
 new MutationObserver(guncelle).observe(document.documentElement,{attributes:true,attributeFilter:['data-sakin','data-theme']});
 guncelle();pandaKur();
})();
/* lonca.js ilk çizimi bu dosyadan önce yaptı; panda pozları için ana sayfa bir kez yeniden çizilir. */
if(document.querySelector('#app .lc-home')&&!document.querySelector('#app .lc-poz-yigin')&&typeof dostSecili==='function'&&dostSecili()==='panda')render();
