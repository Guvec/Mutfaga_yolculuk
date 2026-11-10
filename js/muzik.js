/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Müzik ve sesli okuma bağımsız tercihlerdir; okumada müzik duraklar. */
'use strict';
var MUZIK=(function(){
 var PARCALAR=['assets/muzik/bach-prelud-do-major.mp3','assets/muzik/sakin-sabah.mp3','assets/muzik/aksam-isigi.mp3','assets/muzik/satie-sade-gece.mp3','assets/muzik/pachelbel-kanon-sade.mp3','assets/muzik/beethoven-ay-isigi-sade.mp3','assets/muzik/beethoven-elise-icin-sade.mp3','assets/muzik/beethoven-nese-ode-sade.mp3','assets/muzik/brahms-besik-sarkisi-sade.mp3','assets/muzik/greensleeves-sade.mp3'];
 var ANAHTAR='mesleki-muzik',SES_DUZEYI=0.35;
 var tercih='kapali';try{tercih=localStorage.getItem(ANAHTAR)==='acik'?'acik':'kapali';}catch(e){}
 var audio=null,sira=Math.floor(Math.random()*PARCALAR.length),bekleyenOkuma=null,konusmaTakip=null;
 function kaydet(){try{localStorage.setItem(ANAHTAR,tercih);}catch(e){}}
 function hazirla(){
  if(audio)return audio;
  audio=new Audio();audio.preload='none';audio.volume=SES_DUZEYI;
  audio.addEventListener('ended',function(){sira=(sira+1)%PARCALAR.length;audio.src=PARCALAR[sira];cal();});
  audio.addEventListener('error',function(){/* Parça yüklenemezse sıradakine geç, döngüye girme. */if(audio.dataset.hata==='1')return;audio.dataset.hata='1';sira=(sira+1)%PARCALAR.length;audio.src=PARCALAR[sira];cal();});
  audio.addEventListener('playing',function(){audio.dataset.hata='';});
  audio.src=PARCALAR[sira];return audio;
 }
 function cal(){if(tercih!=='acik'||document.hidden)return;var p=hazirla().play();if(p&&p.catch)p.catch(function(){});}
 function durdur(){if(audio)audio.pause();}
 function acikMi(){return tercih==='acik';}
 function etiketleriYenile(){document.querySelectorAll('.muzik-ac').forEach(function(b){b.textContent='Müzik: '+(acikMi()?'Açık':'Kapalı');b.setAttribute('aria-pressed',String(acikMi()));});}
 function ac(){tercih='acik';kaydet();cal();}
 function kapat(){tercih='kapali';kaydet();durdur();}
 /* Ad okunurken müzik kısa süre durur, konuşma bitince devam eder. onend her cihazda gelmediği için konuşma durumu yoklanır. */
 function okumaIcinDuraklat(){
  if(!acikMi()||!audio||audio.paused)return;
  durdur();clearInterval(konusmaTakip);var basla=Date.now(),goruldu=false;
  konusmaTakip=setInterval(function(){
   var konusuyor=false;try{konusuyor=speechSynthesis.speaking||speechSynthesis.pending;}catch(e){}if(!konusuyor&&typeof SES!=='undefined'&&(SES.klipBekle||(SES.klip&&!SES.klip.paused&&!SES.klip.ended)))konusuyor=true;
   if(konusuyor)goruldu=true;
   var sure=Date.now()-basla;
   if((goruldu&&!konusuyor&&sure>400)||(!goruldu&&sure>3000)||sure>15000){clearInterval(konusmaTakip);konusmaTakip=null;cal();}
  },250);
 }
 /* Efekt sesi çalarken müzik durur, efekt bitince kaldığı yerden devam eder. */
 var efektDurdurdu=false;
 function efektIcinDuraklat(){if(!acikMi()||!audio||audio.paused)return;efektDurdurdu=true;durdur();}
 function efektBitti(){if(!efektDurdurdu)return;efektDurdurdu=false;if(!konusmaTakip)cal();}
 function ilkDokunus(){document.removeEventListener('pointerdown',ilkDokunus,true);document.removeEventListener('keydown',ilkDokunus,true);cal();}
 document.addEventListener('pointerdown',ilkDokunus,true);document.addEventListener('keydown',ilkDokunus,true);
 document.addEventListener('visibilitychange',function(){if(document.hidden)durdur();else if(audio&&!konusmaTakip)cal();});
 return {acikMi:acikMi,ac:ac,kapat:kapat,cal:cal,okumaIcinDuraklat:okumaIcinDuraklat,efektIcinDuraklat:efektIcinDuraklat,efektBitti:efektBitti,etiketleriYenile:etiketleriYenile};
})();

function muzikDugme(){return '<button type="button" class="muzik-ac" aria-pressed="'+MUZIK.acikMi()+'" onclick="muzikAcKapa()">Müzik: '+(MUZIK.acikMi()?'Açık':'Kapalı')+'</button>';}
function muzikAcKapa(){
 if(MUZIK.acikMi()){MUZIK.kapat();render();return;}
 MUZIK.ac();render();
}
/* Müzik, okumayı kapatmadan açılır. */
function muzikUyari(){MUZIK.ac();render();}
/* Müzik açıkken (sesli okuma kapalı) eşleştirmede adın kendisi yine okunur; diğer okumalar kapalı kalır. */
function sesAdOku(metin){
 if(SES.acik){sesSoyle(metin);return;}
 if(!MUZIK.acikMi())return;
 SES.acik=true;try{sesSoyle(metin);}finally{SES.acik=false;}
 if(SES.pending)SES.pending.zorla=true;
 MUZIK.okumaIcinDuraklat();
}
/* 🔊 düğmesine sesli okuma kapalıyken dokunulursa sessiz kalmaz; nasıl açılacağı yazılır. */
function sesDugmeOku(i){if(SES.acik)sesSoyle(SES.sira[i]);}

sesDugme=function(t,label){var i=SES.sira.push(t)-1;return '<button type="button" class="spk" aria-label="'+esc(label||'Sesli dinle')+'" onclick="event.stopPropagation();sesDugmeOku('+i+')">🔊</button>';};
