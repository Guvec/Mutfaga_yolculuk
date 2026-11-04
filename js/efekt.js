/* Efekt sesleri (kazanma, "Bu tur senin") ve oyun girişindeki ses seçimi.
   - Efektler varsayılan olarak açıktır; tercih cihazda saklanır (mesleki-efekt: "acik" / "kapali").
   - Efekt çalarken müzik kısa süre durur, efekt bitince devam eder.
   - Sesli okuma ile müzik aynı anda açık olmaz; oyuna girişte öğrenci ikisinden birini seçer. */
'use strict';
var EFEKT=(function(){
 /* Sesler kodla üretilir (lisans sorunu yok, dosya yok). Her nota: [frekans Hz, başlangıç sn, süre sn]. */
 var NOTA={
  tur:[[659.25,0,.12],[880,.12,.22]],
  win:[[523.25,0,.15],[659.25,.15,.15],[783.99,.3,.15],[1046.5,.45,.5]],
  kayip:[[392,0,.2],[329.63,.2,.35]],
  bera:[[523.25,0,.2],[523.25,.28,.3]]
 },DUZEY={win:0.3,tur:0.26,kayip:0.2,bera:0.2},ANAHTAR='mesleki-efekt';
 var tercih='acik',AC=null;try{tercih=localStorage.getItem(ANAHTAR)==='kapali'?'kapali':'acik';}catch(e){}
 function acikMi(){return tercih==='acik';}
 function ayarla(v){tercih=v?'acik':'kapali';try{localStorage.setItem(ANAHTAR,tercih);}catch(e){}}
 function baglam(){
  if(AC)return AC;
  var C=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);if(!C)return null;
  try{AC=new C();}catch(e){AC=null;}return AC;
 }
 function muzik(f){try{if(typeof MUZIK!=='undefined')MUZIK[f]();}catch(e){}}
 function cal(ad){
  if(!acikMi()||!NOTA[ad])return false;
  var c=baglam();if(!c)return false;
  var bitti=false,son=function(){if(bitti)return;bitti=true;muzik('efektBitti');};
  try{
   if(c.state==='suspended'&&c.resume)c.resume();
   muzik('efektIcinDuraklat');
   var t0=c.currentTime+0.03,en=0;
   NOTA[ad].forEach(function(n){
    var o=c.createOscillator(),g=c.createGain(),b=t0+n[1],e=b+n[2];
    o.type='triangle';o.frequency.value=n[0];
    g.gain.setValueAtTime(0.0001,b);g.gain.exponentialRampToValueAtTime(DUZEY[ad],b+0.02);g.gain.exponentialRampToValueAtTime(0.0001,e);
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
function efektAcKapa(){EFEKT.ayarla(!EFEKT.acikMi());document.querySelectorAll('.efekt-ac').forEach(function(b){b.textContent='Efekt sesleri: '+(EFEKT.acikMi()?'Açık':'Kapalı');b.setAttribute('aria-pressed',String(EFEKT.acikMi()));});}
function efektDugme(){if(!EFEKT.var())return '';return '<button type="button" class="btn sm efekt-ac" aria-pressed="'+EFEKT.acikMi()+'" onclick="efektAcKapa()">Efekt sesleri: '+(EFEKT.acikMi()?'Açık':'Kapalı')+'</button>';}

/* Oyuna girişte: sesli okuma mı, müzik mi, sessiz mi? Her tarayıcı oturumunda bir kez sorulur. */
function sesSecimiSor(){
 try{if(sessionStorage.getItem('mesleki-ses-secim')==='1')return;sessionStorage.setItem('mesleki-ses-secim','1');}catch(e){}
 modalFocus=document.activeElement;st.modalOpen=true;pauseT();
 var ov=document.getElementById('ov');ov.className='on';
 ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="sesSecimBaslik"><h2 id="sesSecimBaslik">Oyunda ne duymak istersin?</h2>'
  +'<p><b>Sesli okuma:</b> Soruyu ve seçenekleri bir ses sana okur.</p><p><b>Müzik:</b> Sakin bir müzik çalar.</p><p class="sub">İkisi aynı anda açılmaz. Birini seç.</p>'
  +'<div class="row"><button class="btn pri" id="sesSecOku">Sesli okuma</button><button class="btn pri" id="sesSecMuzik">Müzik</button><button class="btn" id="sesSecSessiz">Sessiz</button></div>'
  +'<div class="row">'+efektDugme()+'</div></div>';
 var kapat=function(){closeModal();render();};
 document.getElementById('sesSecOku').onclick=function(){MUZIK.kapat();SES.acik=true;lsSet('ses',true);kapat();};
 document.getElementById('sesSecMuzik').onclick=function(){MUZIK.ac();kapat();};
 document.getElementById('sesSecSessiz').onclick=function(){MUZIK.kapat();SES.acik=false;lsSet('ses',false);EFEKT.ayarla(false);sesSus();kapat();};
 document.getElementById(SES.acik?'sesSecOku':MUZIK.acikMi()?'sesSecMuzik':'sesSecOku').focus();
}
