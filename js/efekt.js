/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Efekt sesleri (kazanma, "Bu tur senin") ve oyun girişindeki ses seçimi.
   - Efektler varsayılan olarak açıktır; tercih cihazda saklanır (mesleki-efekt: "acik" / "kapali").
   - Efekt çalarken müzik kısa süre durur, efekt bitince devam eder.
   - Sesli okuma ile müzik aynı anda açık olmaz; oyuna girişte öğrenci ikisinden birini seçer. */
'use strict';
var EFEKT=(function(){
 /* Sesler kodla üretilir (lisans sorunu yok, dosya yok). Her nota: [frekans Hz, başlangıç sn, süre sn]. */
 var NOTA={
  kilic:[[2200,0,.025],[3300,.02,.04],[1760,.06,.08],[880,.12,.12]],
  tur:[[659.25,0,.12],[880,.12,.22]],
  win:[[523.25,0,.15],[659.25,.15,.15],[783.99,.3,.15],[1046.5,.45,.5]],
  kayip:[[392,0,.2],[329.63,.2,.35]],
  bera:[[523.25,0,.2],[523.25,.28,.3]],
  dogru:[[1568,0,.9,'sine',1],[3146,0,.6,'sine',.5],[4328,0,.35,'sine',.3],[8467,0,.15,'sine',.12]],
  kuverTamam:[[1568,0,.7,'sine',1],[3146,0,.45,'sine',.4],[1760,.5,.22,'sine',.7],[1760,.72,.22,'sine',.7],[1760,.94,.5,'sine',.7]],
  tirr:[[2200,0,.03],[1800,.05,.03],[2200,.1,.03],[1800,.15,.03],[2200,.2,.03],[1800,.25,.03],[2200,.3,.03],[1800,.35,.03],[2200,.4,.03],[1800,.45,.03]],
  bilen:[[4200,0,.05,'sawtooth',.5],[3000,.05,.06,'sawtooth',.5],[4400,.2,.05,'sawtooth',.5],[3100,.25,.08,'sawtooth',.5],[1800,.34,.3,'sine',.5]],
  can:[[1046.5,0,.9,'sine',1],[1568,0,.6,'sine',.5],[2093,0,.4,'sine',.3]],
  tok:[[185,0,.14,'sine',1]],
  tak:[[2600,0,.025],[1300,.005,.05],[650,.03,.08]],
  rutbe:[[392,0,.12],[523.25,.12,.12],[659.25,.24,.12],[783.99,.36,.14],[1046.5,.5,.3],[1760,.68,.6],[2637,.68,.4]],
  yanlis:[[311.13,0,.16],[261.63,.16,.3]],
  vurus:[[196,0,.05],[392,.05,.07],[880,.11,.2]],
  can:[[220,0,.14],[164.81,.14,.14],[130.81,.28,.3]],
  seri:[[659.25,0,.09],[783.99,.09,.09],[987.77,.18,.09],[1318.5,.27,.35]],
  tik:[[1320,0,.03]],
  rekor:[[523.25,0,.12],[659.25,.12,.12],[783.99,.24,.12],[1046.5,.36,.14],[783.99,.5,.1],[1046.5,.6,.1],[1318.5,.7,.6]]
 },DUZEY={kilic:0.16,win:0.3,tur:0.26,kayip:0.2,bera:0.2,dogru:0.2,kuverTamam:0.2,tirr:0.16,bilen:0.12,can:0.18,tok:0.22,tak:0.24,rutbe:0.28,yanlis:0.18,vurus:0.28,can:0.2,seri:0.27,tik:0.12,rekor:0.3},ANAHTAR='mesleki-efekt';
 var seri=0,sonDogru=0;
 var tercih='acik',AC=null;try{tercih=localStorage.getItem(ANAHTAR)==='kapali'?'kapali':'acik';}catch(e){}
 function acikMi(){return tercih==='acik';}
 function ayarla(v){tercih=v?'acik':'kapali';try{localStorage.setItem(ANAHTAR,tercih);}catch(e){}}
 function baglam(){
  if(AC)return AC;
  var C=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);if(!C)return null;
  try{AC=new C();}catch(e){AC=null;}return AC;
 }
 function muzik(f){try{if(typeof MUZIK!=='undefined')MUZIK[f]();}catch(e){}}
 /* Alkış: kısa süzülmüş gürültü patlamaları (dosya yok, lisans sorunu yok). */
 function alkis(){
  var c=baglam();if(!c)return false;
  try{
   if(c.state==='suspended'&&c.resume)c.resume();
   muzik('efektIcinDuraklat');
   var n=c.sampleRate*0.06,tampon=c.createBuffer(1,n,c.sampleRate),d=tampon.getChannelData(0);
   for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
   var t0=c.currentTime+0.03,vur=18;
   for(var k=0;k<vur;k++){
    var b=t0+k*0.075+Math.random()*0.04,src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
    src.buffer=tampon;f.type='bandpass';f.frequency.value=1500+Math.random()*2200;f.Q.value=0.8;
    g.gain.value=0.22*(1-k/vur*0.6);src.connect(f);f.connect(g);g.connect(c.destination);src.start(b);
   }
   setTimeout(function(){muzik('efektBitti');},Math.round((vur*0.075+0.3)*1000));
   return true;
  }catch(e){muzik('efektBitti');return false;}
 }
 /* 14.11: eski ses adları yeni ses ustasına yönlendirilir; böylece bütün oyunlar yeni sesleri kullanır. */
 var ESLE={kilic:'kilicCek',bilen:'kilicCek',tur:'kilicCarp',vurus:'kilicCarp',win:'galibiyet',kayip:'maglubiyet',bera:'beraberlik',dogru:'yerlesti',tak:'yerlesti',yanlis:'tekrarDene',tok:'tekrarDene',can:'tekrarDene',kuverTamam:'kutuBitti',rekor:'rekor',rutbe:'rutbe',seri:'seri',tirr:'sureBitti',tik:'saat',click:'dokun'};
 function cal(ad){
  if(typeof SES_USTASI!=='undefined'&&ESLE[ad])return acikMi()?SES_USTASI.cal(ESLE[ad]):false;
  if(ad==='alkis')return acikMi()?alkis():false;
  if(!acikMi()||!NOTA[ad])return false;
  var c=baglam();if(!c)return false;
  var sessiz=ad==='tik'||ad==='tok'||ad==='tak',bitti=false,son=function(){if(bitti)return;bitti=true;if(!sessiz)muzik('efektBitti');};
  try{
   if(c.state==='suspended'&&c.resume)c.resume();
   if(!sessiz)muzik('efektIcinDuraklat');
   var t0=c.currentTime+0.03,en=0,m=1;
   if(ad==='dogru'){var simdi=Date.now();if(simdi-sonDogru>45000)seri=0;seri=Math.min(seri+1,5);sonDogru=simdi;m=Math.pow(2,(seri-1)*2/12);}
   else if(ad==='yanlis'||ad==='tirr'||ad==='tok')seri=0;
   NOTA[ad].forEach(function(n){
    var o=c.createOscillator(),g=c.createGain(),b=t0+n[1],e=b+n[2];
    o.type=n[3]||'triangle';o.frequency.value=n[0]*m;
    g.gain.setValueAtTime(0.0001,b);g.gain.exponentialRampToValueAtTime(DUZEY[ad]*(n[4]||1),b+0.02);g.gain.exponentialRampToValueAtTime(0.0001,e);
    o.connect(g);g.connect(c.destination);o.start(b);o.stop(e+0.05);
    if(n[1]+n[2]>en)en=n[1]+n[2];
   });
   setTimeout(son,Math.round(en*1000)+250);
   return true;
  }catch(e){son();return false;}
 }
 function var_(){return !!baglam();}
 return {acikMi:acikMi,ayarla:ayarla,cal:cal,var:var_};
})();
/* Süre sayacı: son 5 saniyede her saniye hafif tik (müziği durdurmaz). */
var EFEKT_SN=-1;
function efektSaniye(left){try{var sn=Math.ceil(left/1000);if(sn!==EFEKT_SN){EFEKT_SN=sn;if(sn>=1&&sn<=5&&!(typeof SES!=='undefined'&&SES.acik)&&typeof EFEKT!=='undefined')EFEKT.cal('tik');}}catch(e){}}
/* Soru serisi bitince: doğru oranı en az %80 ise servis zili ve üç ting. */
function efektSeriBitti(){try{var s=st.sess;if(!s||s.efektSeri)return;s.efektSeri=true;var n=(s.ok||0)+(s.fix||0)+(s.bad||0);if(n>=5&&(s.ok||0)/n>=0.8&&!(typeof SES!=='undefined'&&SES.acik))EFEKT.cal('kuverTamam');}catch(e){}}
/* Efekt düğmesi sırayla değişir: Orta → Yüksek → Kısık → Kapalı → Orta. */
function efektYazi(){if(!EFEKT.acikMi())return 'Efekt sesleri: Kapalı';var d=typeof SES_USTASI!=='undefined'?SES_USTASI.duzey():'orta';return 'Efekt sesleri: '+({kisik:'Kısık',orta:'Orta',yuksek:'Yüksek'}[d]);}
function efektAcKapa(){
 var U=typeof SES_USTASI!=='undefined'?SES_USTASI:null;
 if(!EFEKT.acikMi()){EFEKT.ayarla(true);if(U)U.duzeyAyarla('orta');}
 else if(U){var d=U.duzey();if(d==='orta')U.duzeyAyarla('yuksek');else if(d==='yuksek')U.duzeyAyarla('kisik');else EFEKT.ayarla(false);}
 else EFEKT.ayarla(false);
 if(U&&EFEKT.acikMi())U.cal('yerlesti');
 document.querySelectorAll('.efekt-ac').forEach(function(b){b.textContent=efektYazi();b.setAttribute('aria-pressed',String(EFEKT.acikMi()));});
}
function efektDugme(){if(!EFEKT.var())return '';return '<button type="button" class="btn sm efekt-ac" data-ses="yok" aria-pressed="'+EFEKT.acikMi()+'" onclick="efektAcKapa()">'+efektYazi()+'</button>';}

/* Profil seçimi başına bir kez; tercihler cihazda kalır. */
function sesSecimiSor(){
 if(st.modalOpen)return;
 try{if(localStorage.getItem('mesleki-ses-soru')==='1')return;}catch(e){}
 try{if(sessionStorage.getItem('mesleki-ses-secim')==='1')return;sessionStorage.setItem('mesleki-ses-secim','1');}catch(e){}
 if(st.modalOpen)return;
 modalFocus=document.activeElement;st.modalOpen=true;pauseT();sesSus();
 var ov=document.getElementById('ov');ov.className='on';
 ov.innerHTML='<div class="modal ses-secim" role="dialog" aria-modal="true" aria-labelledby="sesSecimBaslik"><h2 id="sesSecimBaslik">Oyunda ne duymak istersin?</h2><p>Sesli okuma: Ad ve soruları bir ses okur. Kartlara dokununca adı duyarsın.</p><p>Müzik: Sakin müzik çalar. Sesli okuma açıksa okuma sırasında müzik duraklar.</p><p>Sessiz: Ses olmaz.</p><p>Bunu oyunun üstündeki ses düğmesinden istediğin zaman değiştirebilirsin.</p><p>Sınıfta tahtadan oynuyorsan Sessiz veya Müzik daha rahat olabilir.</p><p id="sesSecUyari" role="status"></p><div class="ses-btns"><div class="row"><button class="btn pri" id="sesSecOku">Sesli okuma</button><button class="btn pri" id="sesSecMuzik">Müzik</button><button class="btn" id="sesSecSessiz">Sessiz</button></div><div class="row"><button class="btn" id="sesSecDene">Sesi dene</button><button class="btn" onclick="closeModal()">Kapat</button></div></div></div>';
 var kapat=function(){closeModal();document.querySelectorAll('.ses-paket-ayar').forEach(b=>{b.textContent='Ses: '+(SES.acik?'Sesli okuma':MUZIK.acikMi()?'Müzik':'Sessiz');});};
 document.getElementById('sesSecOku').onclick=function(){MUZIK.kapat();SES.acik=true;lsSet('ses',true);kapat();};
 document.getElementById('sesSecMuzik').onclick=function(){MUZIK.ac();kapat();};
 document.getElementById('sesSecSessiz').onclick=function(){MUZIK.kapat();SES.acik=false;lsSet('ses',false);EFEKT.ayarla(false);sesSus();kapat();};
 document.getElementById('sesSecDene').onclick=function(){var once=SES.acik;SES.acik=true;try{sesSoyle('Ses denemesi. Hazır olduğunda başlayabilirsin.');}finally{SES.acik=once;}if(SES.pending)SES.pending.zorla=true;MUZIK.okumaIcinDuraklat();};
 function turkceSesler(){if(typeof sesTurkce==='function')return sesTurkce();try{return speechSynthesis.getVoices().filter(v=>/^tr(?:-|_|$)/i.test(v.lang));}catch(e){return [];}}
 function uyari(){var el=document.getElementById('sesSecUyari');if(el)el.textContent=turkceSesler().length?'':'Bu cihazda Türkçe ses bulunamadı. Sesli okuma çalışmayabilir. Müzik veya Sessiz seçebilirsin.';}
 uyari();setTimeout(uyari,2500);
 document.getElementById('sesSecOku').focus();
}
