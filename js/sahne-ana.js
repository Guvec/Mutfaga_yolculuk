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
 /* Kar taneleri: önceden çizilmiş birkaç biçim. Uzak kar küçük ve net; yakın kar iri, düzensiz "lapa" topakları. */
 /* Kar: GPT ile üretilmiş gerçekçi kar parçaları (assets/sahne/kar). Yakında iri lapa topaklar, ortada kristal taneler, uzakta kar tozu. */
 let karlar=null;
 function karSprite(){
  if(karlar)return karlar;const yukle=(t,n)=>Array.from({length:n},(_,i)=>{const im=new Image();im.decoding='async';im.src='assets/sahne/kar/'+t+'-'+(i+1)+'.webp';return im;});
  const toz=yukle('toz',8),kristal=yukle('kristal',8);karlar={lapa:yukle('lapa',16),net:toz.concat(toz,kristal)};return karlar;
 }
 let ruzgar=0,ruzgarHedef=0,ruzgarZaman=0;
 function yagisYap(tuval,adet,lapa){
  const c=tuval.getContext&&tuval.getContext('2d');
  if(!c)return {kur(){},boyut(){},baslat(){},durdur(){}}; // canvas yoksa sessizce çalışmaz
  let W=0,H=0,olcek=1,parca=[],tur='',calis=false,id=0,son=0;
  function boyut(){const r=tuval.getBoundingClientRect();W=r.width;H=r.height;olcek=Math.min(window.devicePixelRatio||1,2);
   tuval.width=Math.max(1,Math.round(W*olcek));tuval.height=Math.max(1,Math.round(H*olcek));c.setTransform(olcek,0,0,olcek,0,0);}
  function yeni(p,ilk){
   p.x=Math.random()*W;p.y=ilk?Math.random()*H:-30;p.faz=Math.random()*6.3;
   if(tur==='kis'){const S=karSprite();if(lapa){p.r=7+Math.random()*10;p.hiz=26+p.r*2.2+Math.random()*14;p.salin=10+Math.random()*22;p.sf=.5+Math.random()*.9;p.a=.75+Math.random()*.25;p.im=S.lapa[(Math.random()*S.lapa.length)|0];p.don=(Math.random()-.5)*1.2;p.aci=Math.random()*6.3;}else{p.r=1.6+Math.random()*2.6;p.hiz=14+p.r*9+Math.random()*10;p.salin=4+Math.random()*10;p.sf=.7+Math.random()*.8;p.a=.5+Math.random()*.45;p.im=S.net[(Math.random()*S.net.length)|0];p.don=0;p.aci=0;}}
   else{p.r=14+Math.random()*12;p.hiz=24+Math.random()*22;p.salin=18+Math.random()*26;p.a=.85;p.don=(Math.random()-.5)*2.4;p.im=YAPRAK[(Math.random()*4)|0];}
   return p;
  }
  function kare(n){
   if(!calis)return;id=requestAnimationFrame(kare);
   if(n-son<32)return;const dt=Math.min((n-son)/1000,.1);son=n;
   c.clearRect(0,0,W,H);
   if(n>ruzgarZaman){ruzgarHedef=(Math.random()<.35?(Math.random()<.5?-1:1)*(18+Math.random()*26):(Math.random()-.5)*10);ruzgarZaman=n+6000+Math.random()*8000;}
   ruzgar+=(ruzgarHedef-ruzgar)*Math.min(1,dt*.6);
   for(const p of parca){
    p.y+=p.hiz*dt;p.faz+=dt*(tur==='kis'?p.sf:1.2);
    if(tur==='kis')p.x+=ruzgar*(lapa?1:.6)*dt;
    const x=p.x+Math.sin(p.faz)*p.salin+Math.sin(p.faz*2.3)*p.salin*.25;
    if(tur==='kis'){if(p.x<-40)p.x+=W+80;else if(p.x>W+40)p.x-=W+80;c.globalAlpha=p.a;
     if(!p.im.complete||!p.im.naturalWidth){}else{const en=p.r*2,boy=en*p.im.naturalHeight/p.im.naturalWidth;
     if(lapa){c.save();c.translate(x,p.y);c.rotate(p.aci+p.faz*p.don);c.drawImage(p.im,-en/2,-boy/2,en,boy);c.restore();}
     else{c.save();c.translate(x,p.y);c.rotate(p.aci+p.faz*.4);c.drawImage(p.im,-en/2,-boy/2,en,boy);c.restore();}}}
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
 let arka=null,arkaYagis=null,on=null,onYagis=null,yolYagis=null,yolTuval=null;
 function arkaKur(){
  if(arka)return;arka=document.createElement('canvas');arka.id='lcYagis';arka.setAttribute('aria-hidden','true');
  document.body.prepend(arka);arkaYagis=yagisYap(arka,70);
  /* Ön katman: iri, lapa lapa kar kartların ve yazıların önünden de geçer; dokunmayı engellemez. */
  on=document.createElement('canvas');on.id='lcYagisOn';on.setAttribute('aria-hidden','true');document.body.appendChild(on);onYagis=yagisYap(on,34,true);
  addEventListener('resize',()=>{arkaYagis.boyut();onYagis.boyut();if(yolYagis)yolYagis.boyut();});
 }

 /* ---------- Yolculuğum kartı: mevsimin yolculuk sahnesi (karakterli sahneler GPT'den gelecek) ---------- */
 function yolKartKur(){
  const yol=document.querySelector('#app .lc-home .lc-journey');if(!yol)return;
  const m=kartMevsimi();
  /* Kışın pandasız sahne + Aşçı Dostu ayrı katman; "Yolculuğa başla"ya basınca karda yürür, iz bırakır. */
  const katman=m==='kis';
  yol.style.setProperty('--lc-scene',"url('"+new URL('assets/yolculuk/kart-'+(katman?'kis-bos':m)+'.webp',document.baseURI).href+"')");
  yol.dataset.mevsim=m;
  let k=yol.querySelector('.lc-yol-dost');
  if(katman&&!k){const d=(typeof dostSecili==='function'&&dostSecili())||'panda';
   const html=d==='panda'?'<img src="assets/harita/panda-adim-1.webp" alt=""><img src="assets/harita/panda-adim-2.webp" alt="">':'<img class="on-yuz" src="assets/ascidostum/dal-'+(d==='rabbit'?'rabbit':d)+'-sicak.webp" alt="">';
   yol.insertAdjacentHTML('afterbegin','<span class="lc-yol-izler" aria-hidden="true"></span><span class="lc-yol-dost" aria-hidden="true">'+html+'</span>');}
  if(!katman&&k){k.remove();const z=yol.querySelector('.lc-yol-izler');if(z)z.remove();}
 }
 /* Yolculuğa başla: dost karda birkaç adım yürür, ardında iz kalır, sonra harita açılır. Dokununca beklemez. */
 const eskiYolAc=window.loncaYolAc;
 if(typeof eskiYolAc==='function')window.loncaYolAc=function(){
  const yol=document.querySelector('#app .lc-home .lc-journey'),d=yol&&yol.querySelector('.lc-yol-dost');
  if(!d||!hareketli()||d.classList.contains('yuruyor'))return eskiYolAc.apply(this,arguments);
  const izler=yol.querySelector('.lc-yol-izler'),W=yol.clientWidth,H=yol.clientHeight,bas=performance.now(),sure=1400;let son=0,adim=0,bitti=false;
  d.classList.add('yuruyor');
  const git=()=>{if(bitti)return;bitti=true;document.removeEventListener('pointerdown',git,true);eskiYolAc();};
  setTimeout(()=>document.addEventListener('pointerdown',git,true),120);
  (function kare(t){if(bitti)return;const o=Math.min(1,(t-bas)/sure),e=o*(2-o);
   const x=22+e*24,y=99-e*26,olc=1-e*.5;d.style.left=x+'%';d.style.top=y+'%';d.style.transform='translate(-50%,-100%) scale('+olc+')';
   d.classList.toggle('sol-ayak',(((t-bas)/180)|0)%2===1);
   if(o-son>.09&&izler){son=o;const i=document.createElement('img');i.src='assets/harita/iz.webp';i.alt='';i.className='lc-yol-iz';
    i.style.left=(x+((adim++)%2?1.6:-1.6)*olc)+'%';i.style.top=(y-1)+'%';i.style.width=(5.5*olc)+'%';izler.appendChild(i);}
   if(o<1)requestAnimationFrame(kare);else setTimeout(git,250);})(bas);
 };
 /* ---------- Kış ortam sesi: rüzgâr, ara sıra esinti ve şömine çıtırtısı (kodla üretilir, dosya yok) ----------
    Ayrı tercih: mesleki-kis-sesi (varsayılan açık). Tarayıcı kuralı gereği ilk dokunuştan sonra başlar.
    Yalnız ana sayfada ve kışın çalar; sayfa gizlenince susar. Sakin modda kısıktır. */
 const kisSesi=(function(){
  const ANAHTAR_SES='mesleki-kis-sesi';let C=null,cikis=null,istek=false,izin=false,calisiyor=false,citir=0,esinti=0;
  function acik(){try{return localStorage.getItem(ANAHTAR_SES)!=='kapali';}catch(e){return true;}}
  function gurultu(sn){const n=Math.floor(C.sampleRate*sn),b=C.createBuffer(1,n,C.sampleRate),d=b.getChannelData(0);let son=0;
   for(let i=0;i<n;i++){const w=Math.random()*2-1;son=(son+.02*w)/1.02;d[i]=son*3.5;}return b;}
  function kur(){
   if(C)return true;const K=window.AudioContext||window.webkitAudioContext;if(!K)return false;
   try{C=new K();}catch(e){return false;}
   cikis=C.createGain();cikis.gain.value=0;cikis.connect(C.destination);
   /* Rüzgâr: yumuşak gürültü, yavaşça gezinen bant süzgeci ve dalgalanan ses düzeyi. */
   const kaynak=C.createBufferSource();kaynak.buffer=gurultu(6);kaynak.loop=true;
   const bant=C.createBiquadFilter();bant.type='bandpass';bant.frequency.value=420;bant.Q.value=.7;
   const lfo=C.createOscillator();lfo.frequency.value=.07;const lfoG=C.createGain();lfoG.gain.value=220;lfo.connect(lfoG);lfoG.connect(bant.frequency);
   const ruzgar=C.createGain();ruzgar.gain.value=.55;
   const lfo2=C.createOscillator();lfo2.frequency.value=.13;const lfo2G=C.createGain();lfo2G.gain.value=.25;lfo2.connect(lfo2G);lfo2G.connect(ruzgar.gain);
   kaynak.connect(bant);bant.connect(ruzgar);ruzgar.connect(cikis);kaynak.start();lfo.start();lfo2.start();
   esintiG=ruzgar;return true;
  }
  let esintiG=null;
  function cit(){ /* şömine çıtırtısı: çok kısa, süzülmüş gürültü vuruşu */
   if(!calisiyor)return;const t=C.currentTime,n=C.createBufferSource(),b=C.createBuffer(1,Math.floor(C.sampleRate*.03),C.sampleRate),d=b.getChannelData(0);
   for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
   n.buffer=b;const f=C.createBiquadFilter();f.type='highpass';f.frequency.value=900+Math.random()*1800;const g=C.createGain();g.gain.value=.08+Math.random()*.22;
   n.connect(f);f.connect(g);g.connect(cikis);n.start(t);
   citir=setTimeout(cit,Math.random()<.25?40+Math.random()*80:180+Math.random()*900);
  }
  function es(){ /* ara sıra güçlenen esinti */
   if(!calisiyor||!esintiG)return;const t=C.currentTime;esintiG.gain.cancelScheduledValues(t);esintiG.gain.setValueAtTime(esintiG.gain.value,t);
   esintiG.gain.linearRampToValueAtTime(1.15,t+2.2);esintiG.gain.linearRampToValueAtTime(.55,t+5.5);esinti=setTimeout(es,11000+Math.random()*9000);
  }
  function duzey(){return document.documentElement.dataset.sakin==='1'?.05:.11;}
  function baslat(){
   if(calisiyor||!kur())return;if(C.state==='suspended')C.resume().catch(()=>{});calisiyor=true;
   const t=C.currentTime;cikis.gain.cancelScheduledValues(t);cikis.gain.setValueAtTime(cikis.gain.value,t);cikis.gain.linearRampToValueAtTime(duzey(),t+2.5);
   clearTimeout(citir);clearTimeout(esinti);citir=setTimeout(cit,600);esinti=setTimeout(es,6000);
  }
  function durdur(){
   if(!calisiyor)return;calisiyor=false;clearTimeout(citir);clearTimeout(esinti);
   const t=C.currentTime;cikis.gain.cancelScheduledValues(t);cikis.gain.setValueAtTime(cikis.gain.value,t);cikis.gain.linearRampToValueAtTime(0,t+1.2);
  }
  function uygula(){if(istek&&izin&&acik()&&!document.hidden)baslat();else durdur();}
  function ilk(){izin=true;uygula();}
  ['pointerdown','keydown'].forEach(e=>document.addEventListener(e,ilk,{passive:true}));
  /* Kış dokunuşu: kartlara ve Yolculuğum'a basınca karda adım çıtırtısı ve ince bir çan. Efekt sesi kapalıysa çalmaz. */
  function dokunus(){
   try{if(typeof EFEKT!=='undefined'&&!EFEKT.acikMi())return;}catch(e){}
   if(!istek||!kur())return;if(C.state==='suspended')C.resume().catch(()=>{});
   const t=C.currentTime,o=C.createGain();o.gain.value=document.documentElement.dataset.sakin==='1'?.15:.32;o.connect(C.destination);
   const n=C.createBufferSource(),b=C.createBuffer(1,Math.floor(C.sampleRate*.12),C.sampleRate),d=b.getChannelData(0);
   for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2)*(Math.random()<.3?1:.35);
   n.buffer=b;const f=C.createBiquadFilter();f.type='bandpass';f.frequency.value=2600;f.Q.value=.9;const g=C.createGain();g.gain.value=.5;n.connect(f);f.connect(g);g.connect(o);n.start(t);
   [[1568,.0],[2349,.06]].forEach(([hz,gec])=>{const os=C.createOscillator(),og=C.createGain();os.type='sine';os.frequency.value=hz;og.gain.setValueAtTime(0,t+gec);og.gain.linearRampToValueAtTime(.18,t+gec+.01);og.gain.exponentialRampToValueAtTime(.001,t+gec+.9);os.connect(og);og.connect(o);os.start(t+gec);os.stop(t+gec+1);});
  }
  document.addEventListener('pointerdown',e=>{if(e.target&&e.target.closest&&e.target.closest('.lc-home :is(.lc-card,.lc-journey)'))dokunus();},{passive:true});
  return {guncelle(ev){istek=ev;uygula();},acik,ayarla(v){try{localStorage.setItem(ANAHTAR_SES,v?'acik':'kapali');}catch(e){}uygula();}};
 })();
 window.kisSesi=kisSesi;

 /* ---------- Arma, kupa ve rozetlerde yalnız şeklin üstünden geçen ışık ---------- */
 function parlamaKur(){
  document.querySelectorAll('#app .lc-home .lc-grid .lc-card .lc-stage').forEach((st,i)=>{
   if(i===0||st.querySelector('.lc-parla'))return;const e=st.querySelector('.lc-emblem');if(!e)return;
   let src='';if(e.tagName==='IMG')src=e.currentSrc||e.src;else{const bg=getComputedStyle(e).backgroundImage;const m=bg&&bg.match(/url\("?([^")]+)"?\)/);if(m)src=m[1];}
   if(!src&&e.tagName.toLowerCase()==='svg'){try{src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(e));}catch(x){}}
   if(!src)return;const p=document.createElement('span');p.className='lc-parla';p.setAttribute('aria-hidden','true');
   p.style.setProperty('--maske','url("'+src.replace(/"/g,'%22')+'")');e.after(p);
   const r=e.getBoundingClientRect(),sr=st.getBoundingClientRect();Object.assign(p.style,{left:(r.left-sr.left)+'px',top:(r.top-sr.top)+'px',width:r.width+'px',height:r.height+'px'});
  });
 }
 /* ---------- Güncelleme ---------- */
 function guncelle(){
  const ev=!!document.querySelector('#app .lc-home')&&temaUygun();
  const m=ev?mevsim():'';
  document.body.classList.toggle('lc-sahne-acik',ev);
  document.body.classList.toggle('lc-kis',m==='kis');
  document.body.classList.toggle('lc-sonbahar',m==='sonbahar');
  if(ev){yolKartKur();requestAnimationFrame(parlamaKur);}
  /* Uzun oyuncu adı (ör. Şef Kaplumbağa) kelime ortasından bölünmesin: sığana kadar yazı küçülür. */
  const ad=document.querySelector('#app .lc-home .lc-profile strong');
  if(ad){ad.style.fontSize='';const kelime=Math.max(...ad.textContent.trim().split(/\s+/).map(k=>k.length));let fs=parseFloat(getComputedStyle(ad).fontSize),i=0;
   const r=document.createRange();const tasar=()=>{r.selectNodeContents(ad);return ad.scrollWidth>ad.clientWidth+1||(typeof r.getClientRects==='function'&&r.getClientRects().length>2);};
   while(kelime>8&&tasar()&&i++<10&&fs>13){fs-=1;ad.style.fontSize=fs+'px';}}
  /* Kış: zeminin dört köşesinde buz deseni */
  let buz=document.getElementById('lcBuz');
  if(!buz){buz=document.createElement('div');buz.id='lcBuz';buz.setAttribute('aria-hidden','true');buz.innerHTML='<i></i><i></i><i></i><i></i>';document.body.prepend(buz);}
  buz.hidden=!(ev&&m==='kis');
  /* Kışın Ustalar Ligi kartında karlı lonca sancağı, Rozetlerim kartında yastık üstünde rozetler (GPT görselleri). */
  if(m==='kis')[[2,'lc-sancak'],[4,'lc-yastik']].forEach(([n,cls])=>{const st=document.querySelector('#app .lc-home .lc-grid .lc-card:nth-child('+n+') .lc-stage');
   if(st&&!st.querySelector('.'+cls)){const e=st.querySelector('.lc-emblem');if(e)e.remove();st.insertAdjacentHTML('afterbegin','<span class="lc-emblem '+cls+'" aria-hidden="true"></span>');}});
  /* Sıralama kartı: kupalı kürsü (mevsime göre CSS seçer). */
  const sira=document.querySelector('#app .lc-home .lc-grid .lc-card:nth-child(3) .lc-stage');
  if(sira&&!sira.querySelector('.lc-kursu')){const e=sira.querySelector('.lc-emblem');if(e)e.remove();sira.insertAdjacentHTML('afterbegin','<span class="lc-emblem lc-kursu" aria-hidden="true"></span>');}
  const dus=ev&&(m==='kis'||m==='sonbahar')&&hareketli()&&!document.hidden;
  kisSesi.guncelle(ev&&m==='kis');
  if(!dus){if(arkaYagis)arkaYagis.durdur();if(onYagis)onYagis.durdur();if(yolYagis)yolYagis.durdur();if(arka)arka.hidden=true;if(on)on.hidden=true;return;}
  arkaKur();arka.hidden=false;arkaYagis.kur(m);arkaYagis.baslat();
  on.hidden=m!=='kis';if(m==='kis'){onYagis.kur(m);onYagis.baslat();}else onYagis.durdur();
  /* Yolculuğum kartının içinde de, yazının arkasında hafif yağış */
  const yol=document.querySelector('#app .lc-home .lc-journey');
  if(yol&&!yol.contains(yolTuval)){if(yolYagis)yolYagis.durdur();yolTuval=document.createElement('canvas');yolTuval.className='lc-yol-yagis';yolTuval.setAttribute('aria-hidden','true');yol.prepend(yolTuval);yolYagis=yagisYap(yolTuval,16);}
  if(yolYagis){yolYagis.kur(m);yolYagis.baslat();}
 }
 document.addEventListener('visibilitychange',guncelle);
 window.sahneGuncelle=guncelle;

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
   document.getElementById('ayMevsimNot').insertAdjacentHTML('afterend',aySatir('ayKisSesi','🔔','Kış sesi',kisSesi.acik()?'Açık':'Kapalı')+'<p id="ayKisSesiNot" class="ay-not">Kışın ana sayfada hafif rüzgâr ve şömine sesi, kartlara dokununca karda adım ve ince bir çan sesi çalar. Müzikten ayrıdır.</p>');
   const ks=document.getElementById('ayKisSesi');ks.setAttribute('aria-describedby','ayKisSesiNot');
   ks.onclick=()=>{kisSesi.ayarla(!kisSesi.acik());ks.querySelector('.ay-deger').textContent=kisSesi.acik()?'Açık':'Kapalı';};
  }
  return s;
 };

 /* ---------- Aşçı Dostu panda pozları ---------- */
 const POZ=['bekliyor','goz-kirpma','mutlu','sevincli','ekranin-sagina-bakiyor','ekranin-soluna-bakiyor','saklanip-bakiyor','dusunuyor','uyukluyor','selam'];
 window.sahnePandaYigin=function(){
  return '<span class="lc-poz-yigin">'+POZ.map(p=>'<img alt="" decoding="async" data-poz="'+p+'" src="assets/ascidostum/panda-poz/panda-'+p+'.webp"'+(p==='bekliyor'?' class="on"':'')+'>').join('')+'</span>';
 };
 let pz={kart:null,zaman:[],sonDokunus:0,uyku:false,gecici:false};
 function pozGoster(ad){if(!pz.kart||!pz.kart.isConnected)return;pz.kart.querySelectorAll('.lc-poz-yigin img').forEach(i=>i.classList.toggle('on',i.dataset.poz===ad));
  /* Matematik Canavarı gibi: her poz değişimine gövde hareketi eşlik eder (çömelme, esneme, eğilme, sıçrama). */
  const y=pz.kart.querySelector('.lc-poz-yigin');if(y&&y.dataset.h!==ad){y.dataset.h='';void y.offsetWidth;y.dataset.h=ad;}}
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
  {const y=pz.kart.querySelector('.lc-poz-yigin');pozGoster('bekliyor');if(y){y.dataset.h='';void y.offsetWidth;y.dataset.h='giris';}}
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
 let oncekiEkran='';
 function girisHareketi(){
  const ekran=(typeof st==='object'&&st&&st.screen)||'';const ev=ekran==='home'&&!!document.querySelector('#app .lc-home');
  if(ev&&oncekiEkran!=='home'&&hareketli()){const h=document.querySelector('#app .lc-home');h.classList.remove('lc-giris');void h.offsetWidth;h.classList.add('lc-giris');setTimeout(()=>h.classList.remove('lc-giris'),1600);}
  oncekiEkran=ekran;
 }
 render=function(){const s=eskiRender.apply(this,arguments);guncelle();girisHareketi();if(document.querySelector('#app .lc-home .lc-poz-yigin')&&(!pz.kart||!pz.kart.isConnected))pandaKur();return s;};
 new MutationObserver(guncelle).observe(document.documentElement,{attributes:true,attributeFilter:['data-sakin','data-theme']});
 guncelle();pandaKur();girisHareketi();
})();
/* lonca.js ilk çizimi bu dosyadan önce yaptı; panda pozları için ana sayfa bir kez yeniden çizilir. */
if(document.querySelector('#app .lc-home')&&!document.querySelector('#app .lc-poz-yigin')&&typeof dostSecili==='function'&&dostSecili()==='panda')render();
