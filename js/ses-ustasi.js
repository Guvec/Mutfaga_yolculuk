/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Ses ustası: arayüz, sürükle-bırak, ödül ve Er Meydanı sesleri.
   Bütün sesler tarayıcıda kodla üretilir (Web Audio). Ses dosyası yok, telif sorunu yok, çevrimdışı çalışır.
   Zincir: ses katmanları → ses yolu → ana ses + hafif oda yankısı → sıkıştırıcı → hoparlör.
   Kurallar: aynı anda tek arayüz sesi; sakin modda kısık ses, geçiş sesleri yok; efekt kapalıysa hiç ses yok. */
'use strict';
var SES_USTASI=(function(){
 var CESIT=1,C=null,ANA=null,YANKI=null,SON_YOL=null,SON_BITIS=0,seri=0,sonDogru=0;
 function baglam(){
  if(C)return C;
  var K=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);if(!K)return null;
  try{C=new K();}catch(e){return null;}
  var sik=C.createDynamicsCompressor();sik.threshold.value=-18;sik.knee.value=12;sik.ratio.value=4;sik.attack.value=0.003;sik.release.value=0.25;
  ANA=C.createGain();ANA.gain.value=0.9;ANA.connect(sik);sik.connect(C.destination);
  var oda=C.createConvolver();oda.buffer=odaYankisi(1.6,3.2);
  YANKI=C.createGain();YANKI.gain.value=1;YANKI.connect(oda);oda.connect(ANA);
  return C;
 }
 function odaYankisi(sn,sonum){
  var n=Math.floor(C.sampleRate*sn),b=C.createBuffer(2,n,C.sampleRate);
  for(var k=0;k<2;k++){var d=b.getChannelData(k);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,sonum)*0.5;}
  return b;
 }
 function bitis(t){if(t>SON_BITIS)SON_BITIS=t;}
 /* Ses yolu: ses düzeyi, yankı payı, sağ-sol konumu. */
 function yol(duzey,yanki,konum){
  var g=C.createGain();g.gain.value=duzey;var cikis=g;
  if(konum&&C.createStereoPanner){var p=C.createStereoPanner();p.pan.value=0;g.connect(p);cikis=p;g.panner=p;}
  cikis.connect(ANA);
  if(yanki){var y=C.createGain();y.gain.value=yanki;cikis.connect(y);y.connect(YANKI);}
  return g;
 }
 function zarf(g,t,a,tepe,d,kalan,tut,r){
  var k=Math.max(tepe*kalan,0.0001);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(tepe,t+a);
  g.gain.exponentialRampToValueAtTime(k,t+a+d);
  var s=t+a+d+(tut||0);g.gain.setValueAtTime(k,s);g.gain.exponentialRampToValueAtTime(0.0001,s+r);
  bitis(s+r);return s+r;
 }
 /* Ton: kayan frekans, iki hafif akort farklı osilatör, isteğe bağlı FM ve süzgeç. */
 function ton(cikis,t,o){
  var g=C.createGain(),hedef=g,son;
  if(o.suzgec){var f=C.createBiquadFilter();f.type='lowpass';f.Q.value=o.suzgecQ||0.7;
   f.frequency.setValueAtTime(o.suzgec,t);
   if(o.suzgecTepe){f.frequency.exponentialRampToValueAtTime(o.suzgecTepe,t+(o.a||0.01)+0.04);f.frequency.exponentialRampToValueAtTime(o.suzgec,t+(o.a||0.01)+(o.d||0.1)+(o.tut||0));}
   g.connect(f);f.connect(cikis);}else g.connect(cikis);
  son=zarf(g,t,o.a||0.005,o.tepe||0.1,o.d||0.1,o.kalan==null?0.001:o.kalan,o.tut||0,o.r||0.05);
  var akort=o.akort?[-o.akort,o.akort]:[0];
  akort.forEach(function(c){
   var s=C.createOscillator();s.type=o.tur||'sine';
   s.frequency.setValueAtTime(o.f*CESIT,t);if(o.f2)s.frequency.exponentialRampToValueAtTime(o.f2*CESIT,t+(o.kay||0.08));
   s.detune.value=c;
   if(o.fm){var m=C.createOscillator(),mg=C.createGain();m.frequency.value=o.f*CESIT*o.fm;
    mg.gain.setValueAtTime(o.f*(o.fmDerin||2),t);mg.gain.exponentialRampToValueAtTime(1,t+(o.fmSure||0.15));
    m.connect(mg);mg.connect(s.frequency);m.start(t);m.stop(son+0.05);}
   var sg=C.createGain();sg.gain.value=1/akort.length;s.connect(sg);sg.connect(hedef);s.start(t);s.stop(son+0.05);
  });
 }
 var GURULTU=null;
 function gurultuTampon(){if(GURULTU)return GURULTU;var n=C.sampleRate*2,b=C.createBuffer(1,n,C.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;GURULTU=b;return b;}
 /* Hışırtı: süzülmüş gürültü (rüzgâr, sürtünme, metal sıyrılma, zil). */
 function hisirti(cikis,t,o){
  var s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain();
  s.buffer=gurultuTampon();s.loop=true;f.type=o.tur||'bandpass';f.Q.value=o.q||1;
  f.frequency.setValueAtTime(o.f,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+(o.kay||o.tut||0.1));
  s.connect(f);f.connect(g);g.connect(cikis);
  var son=zarf(g,t,o.a||0.005,o.tepe||0.05,o.d||0.02,o.kalan==null?0.8:o.kalan,o.tut||0,o.r||0.05);
  s.start(t,Math.random());s.stop(son+0.05);
 }
 /* Çan: serbest çubuk (metalofon) kısmi tonları — temiz, parlak "ding". */
 function can(cikis,t,f,tepe,sure){
  [[1,1],[2.76,0.35],[5.4,0.14],[8.93,0.05]].forEach(function(k,i){
   if(f*k[0]>16000)return;
   ton(cikis,t,{f:f*k[0],tepe:tepe*k[1],a:0.002,d:sure/(1+i*1.6),kalan:0.001,r:0.02});
  });
 }
 /* Metal: uyumsuz kısmi tonlar — kılıç, gong, zil tınısı. */
 function metal(cikis,t,f,tepe,sure,oranlar){
  (oranlar||[1,1.48,2.13,2.67,3.38,4.1,5.2]).forEach(function(o,i){
   var fr=f*o*(1+(Math.random()-0.5)*0.004);if(fr>15000)return;
   ton(cikis,t,{f:fr,tepe:tepe/(1+i*0.55),a:0.001,d:sure*(1-i*0.09),kalan:0.001,r:0.03});
  });
 }
 /* Bakır nefesli: süzgeci açılan iki testere dişi (fanfar). */
 function borazan(cikis,t,f,sure,tepe){
  ton(cikis,t,{f:f,tur:'sawtooth',akort:7,tepe:tepe,a:0.035,d:0.08,kalan:0.7,tut:sure,r:0.18,suzgec:700,suzgecTepe:2600,suzgecQ:1.2});
 }
 function davul(cikis,t,tepe){
  ton(cikis,t,{f:120,f2:70,kay:0.25,tepe:tepe,a:0.003,d:0.35,kalan:0.001,r:0.05});
  hisirti(cikis,t,{tur:'lowpass',f:400,tepe:tepe*0.5,a:0.002,d:0.05,kalan:0.2,r:0.15});
 }
 var NOTA={do4:261.63,mi4:329.63,sol4:392,la4:440,do5:523.25,re5:587.33,mi5:659.25,sol5:783.99,la5:880,do6:1046.5,re6:1174.66,mi6:1318.5,sol6:1567.98,la6:1760,do7:2093};

 var SESLER={
  /* Her yerde */
  dokun:{d:0.2,y:0.04,f:function(o,t){ton(o,t,{f:1400,f2:700,kay:0.03,tepe:0.22,a:0.002,d:0.045,r:0.02});hisirti(o,t,{tur:'highpass',f:5000,tepe:0.05,a:0.001,d:0.006,kalan:0.001,r:0.005});}},
  ileri:{d:0.5,y:0.12,k:[-0.6,0.6],f:function(o,t){hisirti(o,t,{f:500,f2:3200,kay:0.26,q:0.9,tepe:0.13,a:0.12,d:0.05,kalan:0.6,tut:0.06,r:0.12});ton(o,t+0.05,{f:520,f2:780,kay:0.2,tepe:0.025,a:0.06,d:0.15,r:0.06});}},
  geri:{d:0.5,y:0.12,k:[0.6,-0.6],f:function(o,t){hisirti(o,t,{f:3200,f2:500,kay:0.26,q:0.9,tepe:0.12,a:0.1,d:0.05,kalan:0.6,tut:0.06,r:0.12});ton(o,t+0.05,{f:780,f2:520,kay:0.2,tepe:0.022,a:0.06,d:0.15,r:0.06});}},
  ac:{d:0.4,y:0.35,f:function(o,t){can(o,t,NOTA.mi6,0.09,0.5);can(o,t+0.07,NOTA.la6,0.07,0.6);}},
  kilitli:{d:0.4,y:0.08,f:function(o,t){[0,0.11].forEach(function(s){ton(o,t+s,{f:190,f2:120,kay:0.06,tur:'triangle',tepe:0.1,a:0.002,d:0.09,r:0.03,suzgec:700});});}},
  /* Sürükle-bırak */
  tut:{d:0.3,y:0.06,f:function(o,t){ton(o,t,{f:280,f2:950,kay:0.06,tepe:0.18,a:0.003,d:0.07,r:0.02});}},
  ustunde:{d:0.3,y:0.2,es:1,f:function(o,t){can(o,t,NOTA.mi6*2,0.035,0.12);}},
  birak:{d:0.4,y:0.08,f:function(o,t){hisirti(o,t,{f:2200,f2:500,kay:0.2,tepe:0.06,a:0.03,d:0.05,kalan:0.5,tut:0.1,r:0.08});ton(o,t,{f:520,f2:330,kay:0.14,tepe:0.06,a:0.01,d:0.13,r:0.03});}},
  yerlesti:{d:1.6,y:0.3,f:function(o,t,m){
   hisirti(o,t,{tur:'highpass',f:3000,tepe:0.06,a:0.001,d:0.015,kalan:0.001,r:0.01});
   ton(o,t,{f:NOTA.do5*m,tepe:0.05,a:0.005,d:0.5,r:0.1});
   can(o,t,NOTA.do6*m,0.15,0.9);can(o,t+0.09,NOTA.sol6*m,0.13,1.2);}},
  tekrarDene:{d:0.9,y:0.15,f:function(o,t){
   ton(o,t,{f:NOTA.sol4,fm:4,fmDerin:1.5,fmSure:0.08,tepe:0.11,a:0.003,d:0.32,r:0.05});
   ton(o,t+0.15,{f:NOTA.mi4,fm:4,fmDerin:1.5,fmSure:0.08,tepe:0.1,a:0.003,d:0.42,r:0.05});}},
  /* Ödül */
  seri:{d:1.2,y:0.3,f:function(o,t){[NOTA.do6,NOTA.re6,NOTA.mi6,NOTA.sol6,NOTA.la6,NOTA.do7].forEach(function(f,i){can(o,t+i*0.055,f,0.075,0.45);});}},
  yildiz:{d:1.8,y:0.45,f:function(o,t){
   [NOTA.sol6,NOTA.do7,NOTA.mi6*2,NOTA.sol6*2].forEach(function(f,i){can(o,t+i*0.07,f,0.075,0.8);});
   hisirti(o,t+0.05,{tur:'highpass',f:7000,tepe:0.025,a:0.15,d:0.2,kalan:0.4,tut:0.1,r:0.4});}},
  kutuBitti:{d:2.4,y:0.32,f:function(o,t){
   borazan(o,t,NOTA.sol4,0.06,0.08);borazan(o,t+0.13,NOTA.do5,0.06,0.08);borazan(o,t+0.26,NOTA.mi5,0.06,0.08);
   [NOTA.do5,NOTA.mi5,NOTA.sol5].forEach(function(f){borazan(o,t+0.4,f,0.7,0.06);});
   davul(o,t+0.4,0.18);can(o,t+0.42,NOTA.do7,0.06,1.2);can(o,t+0.5,NOTA.sol6,0.05,1.2);}},
  rekor:{d:2.2,y:0.35,f:function(o,t){
   [NOTA.do5,NOTA.mi5,NOTA.sol5,NOTA.do6].forEach(function(f,i){borazan(o,t+i*0.09,f,0.05,0.07);});
   [NOTA.do5,NOTA.mi5,NOTA.sol5,NOTA.do6].forEach(function(f){borazan(o,t+0.4,f,0.6,0.05);});
   [NOTA.do7,NOTA.mi6*2,NOTA.sol6*2].forEach(function(f,i){can(o,t+0.4+i*0.06,f,0.05,0.9);});}},
  rutbe:{d:3.4,y:0.38,f:function(o,t){
   for(var i=0;i<10;i++)davul(o,t+i*0.05,0.05+i*0.012);
   [NOTA.do4,NOTA.sol4,NOTA.do5,NOTA.mi5,NOTA.sol5].forEach(function(f){borazan(o,t+0.55,f,1.1,0.06);});
   davul(o,t+0.55,0.25);
   hisirti(o,t+0.55,{tur:'highpass',f:5000,tepe:0.07,a:0.005,d:0.3,kalan:0.3,tut:0.2,r:1.0});
   [NOTA.do6,NOTA.mi6,NOTA.sol6,NOTA.do7].forEach(function(f,i){can(o,t+0.6+i*0.08,f,0.06,1.4);});}},
  /* Er Meydanı */
  kilicCek:{d:2.2,y:0.35,f:function(o,t){
   hisirti(o,t,{f:1500,f2:7500,kay:0.42,q:7,tepe:0.11,a:0.06,d:0.05,kalan:0.8,tut:0.3,r:0.06});
   hisirti(o,t,{tur:'highpass',f:2500,f2:6000,kay:0.4,q:0.7,tepe:0.035,a:0.08,d:0.05,kalan:0.7,tut:0.26,r:0.05});
   hisirti(o,t+0.4,{f:6500,q:4,tepe:0.08,a:0.003,d:0.04,kalan:0.3,r:0.12});
   metal(o,t+0.41,1850,0.09,1.4);}},
  kilicCarp:{d:1.6,y:0.35,f:function(o,t){
   hisirti(o,t,{tur:'highpass',f:1500,tepe:0.32,a:0.001,d:0.02,kalan:0.2,r:0.15});
   metal(o,t,2350,0.13,0.9);metal(o,t+0.004,3170,0.08,0.7);}},
  gong:{d:3.5,y:0.45,f:function(o,t){
   metal(o,t,98,0.2,3.0,[1,1.52,2.09,2.73,3.18,3.8,4.6]);
   ton(o,t,{f:49,tepe:0.12,a:0.02,d:2.0,r:0.3});
   hisirti(o,t,{tur:'lowpass',f:600,tepe:0.08,a:0.002,d:0.05,kalan:0.1,r:0.2});}},
  saat:{d:0.2,y:0.05,es:1,f:function(o,t){ton(o,t,{f:2100,tepe:0.05,a:0.001,d:0.025,r:0.01});ton(o,t,{f:1050,tepe:0.03,a:0.001,d:0.03,r:0.01});}},
  sureBitti:{d:1.2,y:0.25,f:function(o,t){can(o,t,NOTA.mi5,0.1,0.6);can(o,t+0.18,NOTA.do5,0.1,0.8);}},
  sayac:{d:0.5,y:0.2,es:1,f:function(o,t){can(o,t,NOTA.la5,0.12,0.25);}},
  basla:{d:1.6,y:0.35,f:function(o,t){can(o,t,NOTA.la6,0.14,0.9);[NOTA.la4,554.37,NOTA.mi5].forEach(function(f){borazan(o,t,f,0.35,0.06);});davul(o,t,0.2);}},
  galibiyet:{d:3.2,y:0.38,f:function(o,t){
   [0,0.12,0.24].forEach(function(s){borazan(o,t+s,NOTA.sol4,0.04,0.085);});
   [NOTA.do5,NOTA.mi5,NOTA.sol5,NOTA.do6].forEach(function(f){borazan(o,t+0.4,f,0.9,0.055);});
   davul(o,t+0.4,0.26);hisirti(o,t+0.4,{tur:'highpass',f:5000,tepe:0.06,a:0.005,d:0.3,kalan:0.3,tut:0.2,r:0.9});
   [NOTA.sol6,NOTA.do7,NOTA.mi6*2].forEach(function(f,i){can(o,t+0.5+i*0.08,f,0.05,1.2);});}},
  beraberlik:{d:1.6,y:0.35,f:function(o,t){can(o,t,NOTA.do6,0.11,0.9);can(o,t+0.25,NOTA.do6,0.11,1.0);}},
  maglubiyet:{d:2.2,y:0.3,f:function(o,t){
   [NOTA.mi5,NOTA.re5,NOTA.do5].forEach(function(f,i){ton(o,t+i*0.2,{f:f,tur:'triangle',tepe:0.1,a:0.01,d:0.3,kalan:0.3,tut:0.05,r:0.2,suzgec:1800});});
   [NOTA.do5,NOTA.mi5,NOTA.sol5].forEach(function(f){ton(o,t+0.65,{f:f,tur:'triangle',tepe:0.05,a:0.04,d:0.3,kalan:0.5,tut:0.3,r:0.5,suzgec:1500});});}}
 };
 var ARAYUZ={dokun:1,ileri:1,geri:1,ac:1,kilitli:1,tut:1,ustunde:1,birak:1,saat:1,sayac:1},SAKIN_SUS={ileri:1,geri:1,ustunde:1};
 function efektAcik(){try{return typeof EFEKT==='undefined'||EFEKT.acikMi();}catch(e){return true;}}
 function sakinMi(){try{return document.documentElement.getAttribute('data-sakin')==='1';}catch(e){return false;}}
 function muzik(f){try{if(typeof MUZIK!=='undefined')MUZIK[f]();}catch(e){}}
 /* Ses düzeyi: kisik / orta / yuksek (cihazda saklanır). */
 var DUZEY_ANAHTAR='mesleki-efekt-duzey',DUZEY={kisik:0.4,orta:0.9,yuksek:1.3};
 function duzey(){try{var d=localStorage.getItem(DUZEY_ANAHTAR);return DUZEY[d]?d:'orta';}catch(e){return 'orta';}}
 function duzeyAyarla(d){try{localStorage.setItem(DUZEY_ANAHTAR,DUZEY[d]?d:'orta');}catch(e){}}
 /* Aynı ses hep aynı çalmasın: kısa seslerin perdesi her seferinde çok az değişir. */
 var CESITLI={dokun:1,tut:1,ustunde:1,kilitli:1,birak:1};
 /* Titreşim (Android): doğruda kısa, yanlışta çift, büyük başarıda uzun. iPhone desteklemez. */
 var TITRE={yerlesti:25,tekrarDene:[40,70,40],kutuBitti:[30,60,30,60,80],galibiyet:[30,60,30,60,80],rutbe:[40,60,40,60,120],kilicCarp:35};
 function titret(ad){try{if(TITRE[ad]&&navigator.vibrate)navigator.vibrate(TITRE[ad]);}catch(e){}}
 function cal(ad){
  var s=SESLER[ad];if(!s||!efektAcik())return false;
  titret(ad);
  var sakin=sakinMi();if(sakin&&SAKIN_SUS[ad])return false;
  if(!baglam())return false;
  try{
   if(C.state==='suspended'&&C.resume)C.resume();
   ANA.gain.value=DUZEY[duzey()];CESIT=CESITLI[ad]?1+(Math.random()-0.5)*0.07:1;
   var t=C.currentTime+0.015;
   if(SON_YOL&&!s.es){try{var g=SON_YOL.gain;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(0,t+0.04);}catch(e){}}
   var o=yol(sakin?0.55:1,(s.y||0)*(sakin?0.5:1),!!s.k);
   if(s.k&&o.panner){o.panner.pan.setValueAtTime(s.k[0],t);o.panner.pan.linearRampToValueAtTime(s.k[1],t+0.3);}
   var m=1;
   if(ad==='yerlesti'){var simdi=Date.now();if(simdi-sonDogru>45000)seri=0;seri=Math.min(seri+1,5);sonDogru=simdi;m=Math.pow(2,(seri-1)*2/12);}
   else if(ad==='tekrarDene'||ad==='maglubiyet')seri=0;
   SON_BITIS=t;s.f(o,t,m);
   if(!s.es)SON_YOL=o;
   var uzun=!ARAYUZ[ad];if(uzun)muzik('efektIcinDuraklat');
   var sure=Math.max(s.d,SON_BITIS-t+0.3);
   setTimeout(function(){if(SON_YOL===o)SON_YOL=null;try{o.disconnect();}catch(e){}if(uzun)muzik('efektBitti');},Math.round(sure*1000)+(s.y?900:100));
   return true;
  }catch(e){return false;}
 }
 /* iPhone/iPad: ses ancak bir dokunuşla açılabilir. */
 function kilidiAc(){var c=baglam();if(c&&c.state==='suspended'&&c.resume)c.resume();}
 try{['pointerdown','touchend','keydown'].forEach(function(o){document.addEventListener(o,kilidiAc,{passive:true,capture:true});});}catch(e){}
 return {cal:cal,adlar:Object.keys(SESLER),seriSifirla:function(){seri=0;},duzey:duzey,duzeyAyarla:duzeyAyarla};
})();
