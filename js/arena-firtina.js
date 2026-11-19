/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Er Meydanı fırtınası: kapışma ilerledikçe ve süre azaldıkça şiddetlenen rüzgâr, yağmur ve gök gürültüsü.
   Bütün sesler tarayıcıda kodla üretilir (Web Audio); ses dosyası yok, telif sorunu yok, çevrimdışı çalışır.
   Yalnız Er Meydanı soru ekranında (aplay) çalar. Okuyan ses konuşurken kısılır.
   Sakin modda ve "hareketi azalt" ayarında yalnız hafif rüzgâr çalar: yağmur, gök gürültüsü ve ani sesler yok.
   Ayrı tercih: mesleki-arena-firtina (varsayılan açık). Tarayıcı kuralı gereği ilk dokunuştan sonra başlar. */
'use strict';
var ARENA_FIRTINA=(function(){
 var ANAHTAR='mesleki-arena-firtina',C=null,ana=null,ruzgar=null,ruzgarBant=null,yagmur=null,yagmurSuz=null,izin=false,calisiyor=false,seviye=0,hedef=0,
     sonGurultu=0,sonGurultuAraligi=0,dongu=null,sonKonusma=0;
 function acik(){try{return localStorage.getItem(ANAHTAR)!=='kapali';}catch(e){return true;}}
 function ayarla(a){try{localStorage.setItem(ANAHTAR,a?'acik':'kapali');}catch(e){}if(!a)dur();}
 function sakinMi(){try{return document.documentElement.getAttribute('data-sakin')==='1'||!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){return false;}}
 function efektAcik(){try{return typeof EFEKT==='undefined'||EFEKT.acikMi();}catch(e){return true;}}
 function konusuyor(){
  try{if(typeof SES!=='undefined'&&SES.klip&&!SES.klip.paused&&!SES.klip.ended)return true;}catch(e){}
  try{if(window.speechSynthesis&&speechSynthesis.speaking)return true;}catch(e){}
  return false;
 }
 function gurultu(sn,renk){
  var n=Math.floor(C.sampleRate*sn),b=C.createBuffer(1,n,C.sampleRate),d=b.getChannelData(0),son=0;
  for(var i=0;i<n;i++){var w=Math.random()*2-1;if(renk==='kahverengi'){son=(son+.02*w)/1.02;d[i]=son*3.5;}else d[i]=w;}
  /* Döngü ekinde tık sesi olmasın: son 0,15 sn başa doğru yumuşatılır. */
  var k=Math.floor(C.sampleRate*.15);for(var j=0;j<k;j++){var t=j/k;d[n-k+j]=d[n-k+j]*(1-t)+d[j]*t;}
  return b;
 }
 function kur(){
  if(C)return true;
  var K=window.AudioContext||window.webkitAudioContext;if(!K)return false;
  try{C=new K();}catch(e){return false;}
  var sik=C.createDynamicsCompressor();sik.threshold.value=-16;sik.knee.value=12;sik.ratio.value=4;sik.connect(C.destination);
  ana=C.createGain();ana.gain.value=0;ana.connect(sik);
  /* Rüzgâr: yumuşak (kahverengi) gürültü, gezinen bant süzgeci ve yavaş dalgalanan ses düzeyi. */
  var rk=C.createBufferSource();rk.buffer=gurultu(8,'kahverengi');rk.loop=true;
  ruzgarBant=C.createBiquadFilter();ruzgarBant.type='bandpass';ruzgarBant.frequency.value=380;ruzgarBant.Q.value=.7;
  ruzgar=C.createGain();ruzgar.gain.value=.2;
  var l1=C.createOscillator();l1.frequency.value=.11;var l1g=C.createGain();l1g.gain.value=.12;l1.connect(l1g);l1g.connect(ruzgar.gain);
  var l2=C.createOscillator();l2.frequency.value=.07;var l2g=C.createGain();l2g.gain.value=120;l2.connect(l2g);l2g.connect(ruzgarBant.frequency);
  rk.connect(ruzgarBant);ruzgarBant.connect(ruzgar);ruzgar.connect(ana);rk.start();l1.start();l2.start();
  /* Yağmur: beyaz gürültü, yüksek geçiren ve alçak geçiren süzgeç; şiddet arttıkça ses düzeyi yükselir. */
  var yk=C.createBufferSource();yk.buffer=gurultu(5,'beyaz');yk.loop=true;
  var hp=C.createBiquadFilter();hp.type='highpass';hp.frequency.value=1400;
  yagmurSuz=C.createBiquadFilter();yagmurSuz.type='lowpass';yagmurSuz.frequency.value=6500;
  yagmur=C.createGain();yagmur.gain.value=0;
  yk.connect(hp);hp.connect(yagmurSuz);yagmurSuz.connect(yagmur);yagmur.connect(ana);yk.start();
  return true;
 }
 /* Gök gürültüsü: önce hafif bir gümbürtü, sonra düşen bir kütle ve uzayan yankı. Yakın olanın önünde keskin bir çatırtı. */
 function gokGurultusu(yakin){
  if(!C)return;
  var t=C.currentTime+.02,sure=yakin?3.4:5.2;
  var k=C.createBufferSource();k.buffer=gurultu(sure+.5,'kahverengi');
  var lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(yakin?900:520,t);lp.frequency.exponentialRampToValueAtTime(90,t+sure);
  var g=C.createGain();g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(yakin?.9:.5,t+(yakin?.12:.7));
  g.gain.setValueAtTime(yakin?.9:.5,t+(yakin?.12:.7));
  g.gain.exponentialRampToValueAtTime(0.0001,t+sure);
  k.connect(lp);lp.connect(g);g.connect(ana);k.start(t);k.stop(t+sure+.5);
  /* Alt gümbürtü: çok alçak bir ton, yalnızca his verir. */
  var o=C.createOscillator();o.type='sine';o.frequency.setValueAtTime(yakin?58:46,t);o.frequency.exponentialRampToValueAtTime(30,t+sure);
  var og=C.createGain();og.gain.setValueAtTime(0.0001,t);og.gain.exponentialRampToValueAtTime(yakin?.35:.18,t+.3);og.gain.exponentialRampToValueAtTime(0.0001,t+sure);
  o.connect(og);og.connect(ana);o.start(t);o.stop(t+sure+.1);
  if(yakin){
   var c=C.createBufferSource();c.buffer=gurultu(.4,'beyaz');
   var hp=C.createBiquadFilter();hp.type='highpass';hp.frequency.value=2200;
   var cg=C.createGain();cg.gain.setValueAtTime(.0001,t-.015);cg.gain.exponentialRampToValueAtTime(.45,t-.005);cg.gain.exponentialRampToValueAtTime(.0001,t+.22);
   c.connect(hp);hp.connect(cg);cg.connect(ana);c.start(Math.max(0,t-.02));c.stop(t+.4);
  }
 }
 /* Şiddet 0–1: ilerleme (sorular) ve kalan süre birlikte belirler. Son sorularda ve süre azalınca fırtına yükselir. */
 function hesapla(){
  try{
   if(typeof AR==='undefined'||!AR||st.screen!=='aplay')return 0;
   var toplam=Math.max(1,AR.total||1),ilerleme=Math.min(1,(AR.k||0)/toplam);
   var sure=0;if(AR.lim&&AR.ph==='q'&&AR.t0){var gecen=performance.now()-AR.t0;sure=Math.min(1,Math.max(0,gecen/AR.lim));}
   var s=.12+ilerleme*.6+sure*.18;
   if(toplam>1&&AR.k>=toplam-2)s+=.15;
   return Math.max(0,Math.min(1,s));
  }catch(e){return 0;}
 }
 function uygula(){
  if(!C||!ana)return;
  var t=C.currentTime,sakin=sakinMi(),sus=konusuyor()||(Date.now()-sonKonusma<600);
  if(konusuyor())sonKonusma=Date.now();
  var s=sakin?Math.min(hedef,.22):hedef;
  seviye+=(s-seviye)*.35;
  /* Okuyan ses konuşurken fırtına kısılır; ilk anda ani sıçrama olmasın diye geçiş yumuşaktır. */
  var duzey=(sus?.28:1)*(sakin?.55:1);
  ana.gain.setTargetAtTime(duzey*.6,t,.4);
  ruzgar.gain.setTargetAtTime(.14+seviye*.5,t,.8);
  ruzgarBant.Q.setTargetAtTime(.6+seviye*.9,t,.8);
  yagmur.gain.setTargetAtTime(sakin?0:Math.pow(Math.max(0,seviye-.25)/.75,1.6)*.38,t,1.2);
  yagmurSuz.frequency.setTargetAtTime(4500+seviye*3500,t,1.2);
  /* Gök gürültüsü: şiddet arttıkça sıklaşır. Sakin modda ve konuşma sırasında çalmaz. */
  if(!sakin&&!sus&&seviye>.38){
   var simdi=Date.now(),aralik=Math.max(7000,22000-seviye*17000);
   if(!sonGurultu){sonGurultu=simdi;sonGurultuAraligi=aralik*(.6+Math.random()*.8);}
   else if(simdi-sonGurultu>sonGurultuAraligi){sonGurultu=simdi;sonGurultuAraligi=aralik*(.6+Math.random()*.8);gokGurultusu(seviye>.7&&Math.random()<.5);}
  }
 }
 function baslat(){
  if(calisiyor||!izin||!acik()||!efektAcik())return;
  if(!kur())return;
  try{if(C.state==='suspended')C.resume();}catch(e){}
  calisiyor=true;seviye=0;sonGurultu=0;
  dongu=setInterval(tik,400);tik();
 }
 function dur(){
  if(dongu){clearInterval(dongu);dongu=null;}
  if(!calisiyor||!C||!ana){calisiyor=false;return;}
  calisiyor=false;
  try{var t=C.currentTime;ana.gain.cancelScheduledValues(t);ana.gain.setTargetAtTime(0,t,.5);}catch(e){}
  setTimeout(function(){if(!calisiyor&&C&&C.state==='running'){try{C.suspend();}catch(e){}}},2500);
 }
 function tik(){
  var ekran=null;try{ekran=st.screen;}catch(e){}
  if(document.hidden||ekran!=='aplay'||!acik()||!efektAcik()){dur();return;}
  hedef=hesapla();uygula();
 }
 /* Ekran girince/çıkınca ve sekme gizlenince hızlı tepki; asıl iş tik() içinde. */
 function kontrol(){
  var ekran=null;try{ekran=st.screen;}catch(e){}
  if(ekran==='aplay'&&!document.hidden)baslat();else if(calisiyor)dur();
 }
 function bagla(){
  document.addEventListener('pointerdown',function(){izin=true;kontrol();},{capture:true,passive:true});
  document.addEventListener('keydown',function(){izin=true;},true);
  document.addEventListener('visibilitychange',function(){if(document.hidden)dur();else kontrol();});
  setInterval(kontrol,700);
  /* Ayarlar: "Er Meydanı sesi" satırı, Sakin satırının altına eklenir. */
  if(typeof window.anaAyarlar==='function'&&typeof aySatir==='function'){
   var eski=window.anaAyarlar;
   window.anaAyarlar=function(){
    var s=eski.apply(this,arguments);
    try{
     var yer=document.getElementById('ayKisSesi')||document.getElementById('aySakin');
     if(yer&&!document.getElementById('ayArenaSes')){
      var not=document.getElementById('ayKisSesiNot')||yer;
      not.insertAdjacentHTML('afterend',aySatir('ayArenaSes','⚔️','Er Meydanı sesi',acik()?'Açık':'Kapalı')+'<p id="ayArenaSesNot" class="ay-not">Er Meydanı\'nda kapışma ilerledikçe rüzgâr, yağmur ve gök gürültüsü güçlenir. Okuyan ses konuşurken kısılır. Sakin modda yalnız hafif rüzgâr çalar. Müzikten ayrıdır.</p>');
      var b=document.getElementById('ayArenaSes');b.setAttribute('aria-describedby','ayArenaSesNot');
      b.onclick=function(){ayarla(!acik());b.querySelector('.ay-deger').textContent=acik()?'Açık':'Kapalı';};
     }
    }catch(e){}
    return s;
   };
  }
 }
 if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bagla);else bagla();}
 return {acik:acik,ayarla:ayarla,hesapla:hesapla,gokGurultusu:gokGurultusu,_durum:function(){return {calisiyor:calisiyor,seviye:seviye,hedef:hedef};}};
})();
