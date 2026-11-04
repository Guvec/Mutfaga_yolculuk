/* Efekt sesleri (kazanma, "Bu tur senin") ve oyun girişindeki ses seçimi.
   - Efektler varsayılan olarak açıktır; tercih cihazda saklanır (mesleki-efekt: "acik" / "kapali").
   - Efekt çalarken müzik kısa süre durur, efekt bitince devam eder.
   - Sesli okuma ile müzik aynı anda açık olmaz; oyuna girişte öğrenci ikisinden birini seçer. */
'use strict';
var EFEKT=(function(){
 /* Lisansı doğrulanmış ses dosyaları hazır olunca buraya eklenir, örn. {win:'assets/ses/win.mp3'}. Liste boşken hiçbir efekt çalmaz ve düğme görünmez. */
 var DOSYA={},DUZEY={win:0.85,tur:0.8},ANAHTAR='mesleki-efekt';
 var tercih='acik';try{tercih=localStorage.getItem(ANAHTAR)==='kapali'?'kapali':'acik';}catch(e){}
 function acikMi(){return tercih==='acik';}
 function ayarla(v){tercih=v?'acik':'kapali';try{localStorage.setItem(ANAHTAR,tercih);}catch(e){}}
 function cal(ad){
  if(!acikMi()||!DOSYA[ad])return false;
  try{
   var a=new Audio(DOSYA[ad]),bitti=false;a.volume=DUZEY[ad];
   var son=function(){if(bitti)return;bitti=true;MUZIK.efektBitti();};
   MUZIK.efektIcinDuraklat();
   a.addEventListener('ended',son);a.addEventListener('error',son);
   var p=a.play();if(p&&p.catch)p.catch(son);
   setTimeout(son,4500);
   return true;
  }catch(e){try{MUZIK.efektBitti();}catch(x){}return false;}
 }
 function var_(){return Object.keys(DOSYA).length>0;}
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
 document.getElementById('sesSecSessiz').onclick=function(){MUZIK.kapat();SES.acik=false;lsSet('ses',false);sesSus();kapat();};
 document.getElementById(SES.acik?'sesSecOku':MUZIK.acikMi()?'sesSecMuzik':'sesSecOku').focus();
}
