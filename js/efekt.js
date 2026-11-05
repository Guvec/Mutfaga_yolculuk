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
  bera:[[523.25,0,.2],[523.25,.28,.3]],
  dogru:[[784,0,.09],[1046.5,.09,.16]],
  yanlis:[[311.13,0,.16],[261.63,.16,.3]],
  vurus:[[196,0,.05],[392,.05,.07],[880,.11,.2]],
  can:[[220,0,.14],[164.81,.14,.14],[130.81,.28,.3]],
  seri:[[659.25,0,.09],[783.99,.09,.09],[987.77,.18,.09],[1318.5,.27,.35]],
  rekor:[[523.25,0,.12],[659.25,.12,.12],[783.99,.24,.12],[1046.5,.36,.14],[783.99,.5,.1],[1046.5,.6,.1],[1318.5,.7,.6]]
 },DUZEY={win:0.3,tur:0.26,kayip:0.2,bera:0.2,dogru:0.24,yanlis:0.18,vurus:0.28,can:0.2,seri:0.27,rekor:0.3},ANAHTAR='mesleki-efekt';
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

/* Profil seçimi başına bir kez; tercihler cihazda kalır. */
function sesSecimiSor(){
 if(st.modalOpen)return;
 try{if(sessionStorage.getItem('mesleki-ses-secim')==='1')return;sessionStorage.setItem('mesleki-ses-secim','1');}catch(e){}
 if(st.modalOpen)return;
 modalFocus=document.activeElement;st.modalOpen=true;pauseT();sesSus();
 var ov=document.getElementById('ov');ov.className='on';
 ov.innerHTML='<div class="modal ses-secim" role="dialog" aria-modal="true" aria-labelledby="sesSecimBaslik"><h2 id="sesSecimBaslik">Oyunda ne duymak istersin?</h2><p>Sesli okuma: Ad ve soruları bir ses okur. Kartlara dokununca adı duyarsın.</p><p>Müzik: Sakin müzik çalar. Müzik açıkken yalnız ad kartlarına dokununca ad okunur.</p><p>Sessiz: Ses olmaz.</p><p>Bunu oyunun üstündeki ses düğmesinden istediğin zaman değiştirebilirsin.</p><p>Sınıfta tahtadan oynuyorsan Sessiz veya Müzik daha rahat olabilir.</p><p id="sesSecUyari" role="status"></p><div class="ses-btns"><div class="row"><button class="btn pri" id="sesSecOku">Sesli okuma</button><button class="btn pri" id="sesSecMuzik">Müzik</button><button class="btn" id="sesSecSessiz">Sessiz</button></div><div class="row"><button class="btn" id="sesSecDene">Sesi dene</button><button class="btn" onclick="closeModal()">Kapat</button></div></div></div>';
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
