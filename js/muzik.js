/* Arka plan müziği. Müzik ile sesli okuma aynı anda açık olmaz:
   - Müzik açıkken sesli okuma kapalıdır. Eşleştirmede ada dokununca ad yine okunur; müzik o sırada kısa süre durur.
   - Sesli okuma açılınca müzik kapanır. Müzik yeniden açılmak istenirse uyarı çıkar.
   - Müzik açıksa, tarayıcılar sesi ancak ilk dokunuştan sonra başlattığı için müzik sayfadaki ilk dokunuşla başlar.
   Müzik varsayılan olarak kapalıdır; öğrenci isterse açar. Tercih cihazda saklanır (mesleki-muzik: "acik" / "kapali"). */
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
 function ac(){tercih='acik';kaydet();if(typeof SES!=='undefined'&&SES.acik){SES.acik=false;lsSet('ses',false);sesSus();}cal();}
 function kapat(){tercih='kapali';kaydet();durdur();}
 /* Ad okunurken müzik kısa süre durur, konuşma bitince devam eder. onend her cihazda gelmediği için konuşma durumu yoklanır. */
 function okumaIcinDuraklat(){
  if(!acikMi()||!audio||audio.paused)return;
  durdur();clearInterval(konusmaTakip);var basla=Date.now(),goruldu=false;
  konusmaTakip=setInterval(function(){
   var konusuyor=false;try{konusuyor=speechSynthesis.speaking||speechSynthesis.pending;}catch(e){}
   if(konusuyor)goruldu=true;
   var sure=Date.now()-basla;
   if((goruldu&&!konusuyor&&sure>400)||(!goruldu&&sure>3000)||sure>15000){clearInterval(konusmaTakip);konusmaTakip=null;cal();}
  },250);
 }
 /* Bir kereye mahsus sıfırlama: eski sürümlerden kalan "müzik açık" tercihi sesli okumayı kapatıyordu.
    Herkes müzik kapalı, sesli okuma açık başlar; müziği öğrenci isterse kendisi açar. */
 try{
  if(localStorage.getItem('mesleki-muzik-gecis')!=='1'){
   localStorage.setItem('mesleki-muzik-gecis','1');
   if(tercih==='acik'){tercih='kapali';kaydet();}
   if(typeof SES!=='undefined'&&!SES.acik){SES.acik=true;try{lsSet('ses',true);}catch(e){}}
  }
 }catch(e){}
 // Müzik varsayılan olarak kapalıdır; sesli okuma açık başlar. Müziği öğrenci açtıysa sesli okuma kapalı başlar (iki ses aynı anda çalmaz).
 if(tercih==='acik'&&typeof SES!=='undefined'&&SES.acik){SES.acik=false;try{lsSet('ses',false);}catch(e){}}
 /* Bir kereye mahsus geçiş: eski sürümde müzik kendiliğinden açık geldiği için sesli okuma kapanıp kaydedilmişti.
    Müzik tercihi hiç seçilmemişse bu kapalılık öğrencinin seçimi değildir; sesli okuma açılır. */
 try{
  if(localStorage.getItem('mesleki-ses-gecis')!=='1'){
   localStorage.setItem('mesleki-ses-gecis','1');
   if(localStorage.getItem(ANAHTAR)===null&&typeof SES!=='undefined'&&!SES.acik){SES.acik=true;lsSet('ses',true);}
  }
 }catch(e){}
 function ilkDokunus(){document.removeEventListener('pointerdown',ilkDokunus,true);document.removeEventListener('keydown',ilkDokunus,true);cal();}
 document.addEventListener('pointerdown',ilkDokunus,true);document.addEventListener('keydown',ilkDokunus,true);
 document.addEventListener('visibilitychange',function(){if(document.hidden)durdur();else if(audio&&!konusmaTakip)cal();});
 return {acikMi:acikMi,ac:ac,kapat:kapat,cal:cal,okumaIcinDuraklat:okumaIcinDuraklat,etiketleriYenile:etiketleriYenile};
})();

function muzikDugme(){return '<button type="button" class="muzik-ac" aria-pressed="'+MUZIK.acikMi()+'" onclick="muzikAcKapa()">Müzik: '+(MUZIK.acikMi()?'Açık':'Kapalı')+'</button>';}
function muzikAcKapa(){
 if(MUZIK.acikMi()){MUZIK.kapat();render();return;}
 if(typeof SES!=='undefined'&&SES.acik){muzikUyari();return;}
 MUZIK.ac();render();
}
function muzikUyari(){
 modalFocus=document.activeElement;st.modalOpen=true;pauseT();
 var ov=document.getElementById('ov');ov.className='on';
 ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="muzikUyariBaslik"><h2 id="muzikUyariBaslik">Müzik açılsın mı?</h2><p>Müzik açılırsa sesli okuma kapanır.</p><div class="row"><button class="btn pri" id="muzikEvet">Müziği aç</button><button class="btn" id="muzikHayir">Vazgeç</button></div></div>';
 document.getElementById('muzikEvet').onclick=function(){closeModal();MUZIK.ac();render();};
 document.getElementById('muzikHayir').onclick=closeModal;
 document.getElementById('muzikHayir').focus();
}
/* Sesli okuma açılınca müzik kapanır. */
var MUZIK_SES_ACKAPA=sesAcKapa;
sesAcKapa=function(){if(!SES.acik&&MUZIK.acikMi())MUZIK.kapat();MUZIK_SES_ACKAPA();};
/* Müzik açıkken (sesli okuma kapalı) eşleştirmede adın kendisi yine okunur; diğer okumalar kapalı kalır. */
function sesAdOku(metin){
 if(SES.acik){sesSoyle(metin);return;}
 if(!MUZIK.acikMi())return;
 SES.acik=true;try{sesSoyle(metin);}finally{SES.acik=false;}
 if(SES.pending)SES.pending.zorla=true;
 MUZIK.okumaIcinDuraklat();
}
/* 🔊 düğmesine sesli okuma kapalıyken dokunulursa sessiz kalmaz; nasıl açılacağı yazılır. */
function sesDugmeOku(i){
 if(SES.acik){sesSoyle(SES.sira[i]);return;}
 sesDurum('Sesli okuma kapalı. Dinlemek için üstteki "Sesli okuma" düğmesine dokun.');
 clearTimeout(sesDugmeOku.t);sesDugmeOku.t=setTimeout(function(){if(!SES.acik)sesDurum('');},5000);
}
sesDugme=function(t,label){var i=SES.sira.push(t)-1;return '<button type="button" class="spk" aria-label="'+esc(label||'Sesli dinle')+'" onclick="event.stopPropagation();sesDugmeOku('+i+')">🔊</button>';};
