/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* 14.11 akşam: Ayarlar penceresi yeniden. Yalnız ayar satırları kalır; başka yerde zaten olan düğmeler çıktı:
   Mutfak Kitabım (dal pencerelerinde Teori), Görünüm ve Hareketler (Aşçı Dostum), Lezzetleri Keşfet (Aşçı Dostum → lezzet tattır),
   Çalışma geçmişim ve Kılavuz (Hesabım), Sesi dene/Durdur (Okuyan ses sayfasında). Ses, müzik ve efekt: 🎧 Ses paneli. */
'use strict';
const AY_TEMA={light:'Aydınlık',sepia:'Sepya',okyanus:'Okyanus',orman:'Orman',lavanta:'Lavanta',seftali:'Şeftali',yuksek:'Yüksek kontrast',dark:'Gece'};
const AY_YZ=['normal','buyuk','cok'],AY_YZN={normal:'Normal',buyuk:'Büyük',cok:'Çok büyük'};
function ayAc(html,label){
 if(typeof sesSus==='function')sesSus();try{modalFocus=document.activeElement;}catch(e){}
 st.modalOpen=true;if(typeof pauseT==='function')pauseT();
 const ov=document.getElementById('ov');ov.className='on';
 ov.innerHTML='<div class="modal ay-modal" role="dialog" aria-modal="true" aria-label="'+label+'">'+html+'</div>';
 return ov.querySelector('.modal');
}
function aySatir(id,ikon,ad,deger,ok){return '<button type="button" class="ay-satir" id="'+id+'"><span class="ay-ikon" aria-hidden="true">'+ikon+'</span><span class="ay-ad">'+ad+'</span><span class="ay-deger">'+(deger||'')+'</span>'+(ok?'<span class="ay-ok" aria-hidden="true">›</span>':'')+'</button>';}
function ayTema(){return AY_TEMA[document.documentElement.dataset.theme]||'Aydınlık';}
function ayYz(){return AY_YZN[document.documentElement.getAttribute('data-yz')||'normal'];}
window.anaAyarlar=function(){
 const sakin=typeof sakinAcik==='function'&&sakinAcik();
 const box=ayAc('<h2 class="ay-bas">⚙️ Ayarlar</h2>'+
  '<p class="ay-grup">Görünüm</p><div class="ay-liste">'+
   aySatir('ayTema','🎨','Tema',ayTema())+aySatir('ayYz','🔠','Yazı boyutu',ayYz())+
   (typeof aksanHTML==='function'?'<div class="ay-satir ay-aksan"><span class="ay-ikon" aria-hidden="true">🖌️</span>'+aksanHTML()+'</div>':'')+
   aySatir('aySakin','🌙','Sakin mod',sakin?'Açık':'Kapalı')+'</div>'+
  '<p class="ay-grup">Ses</p><div class="ay-liste">'+
   aySatir('aySes','🎧','Ses ve müzik',typeof hsDurum==='function'?hsDurum():'',true)+
   aySatir('ayOkuyan','🗣️','Okuyan ses ve hız','',true)+'</div>'+
  '<p class="ay-grup">Diğer</p><div class="ay-liste">'+
   aySatir('ayCevrim','📶','Dersleri internetsiz kullanıma hazırla','')+
   '<p id="offlineStatus" class="ay-not" role="status">İlk hazırlıkta internet gerekir.</p>'+
   aySatir('ayHakkinda','ℹ️','Hakkında','',true)+aySatir('ayPaylas','📤','Uygulamayı paylaş','')+'</div>'+
  '<button type="button" class="btn pri ay-kapat" onclick="closeModal()">Kapat</button>','Ayarlar');
 const $=id=>box.querySelector('#'+id),deg=(id,v)=>{const e=$(id);if(e)e.querySelector('.ay-deger').textContent=v;};
 $('ayTema').onclick=()=>{temaDegistir();deg('ayTema',ayTema());};
 $('ayYz').onclick=()=>{const now=document.documentElement.getAttribute('data-yz')||'normal',nx=AY_YZ[(AY_YZ.indexOf(now)+1)%AY_YZ.length];document.documentElement.setAttribute('data-yz',nx);try{localStorage.setItem('mesleki-yazi',nx);}catch(e){}deg('ayYz',ayYz());};
 $('aySakin').onclick=()=>{if(typeof sakinDegistir==='function')sakinDegistir();deg('aySakin',sakinAcik()?'Açık':'Kapalı');};
 box.querySelectorAll('.aksan-sw button').forEach(b=>{b.onclick=()=>aksanUygula(b.dataset.a);});
 $('aySes').onclick=()=>{closeModal();hsAc();};
 $('ayOkuyan').onclick=()=>ayOkuyan();
 $('ayCevrim').onclick=()=>{if(typeof prepareOffline==='function')prepareOffline();};
 $('ayHakkinda').onclick=()=>{closeModal();hakkindaAc();};
 $('ayPaylas').onclick=()=>{if(typeof uygulamaPaylas==='function')uygulamaPaylas();};
 $('ayTema').focus();
};
/* Okuyan ses: ses türü, Türkçe ses, hız, dene. */
function ayOkuyan(){
 const dil=typeof DIL!=='undefined';
 const box=ayAc('<h2 class="ay-bas">🗣️ Okuyan ses</h2>'+
  (dil?'<label for="sesMotor">Ses türü</label><select id="sesMotor"><option value="dilara">Dilara (hazır kayıt)</option><option value="cihaz">Cihaz sesi</option></select>':'')+
  '<label for="voiceSelect">Cihazın Türkçe sesi</label><select id="voiceSelect"></select>'+
  '<label for="voiceRate">Konuşma hızı</label><select id="voiceRate"><option value="0.85">Biraz yavaş</option><option value="1">Normal</option><option value="1.1">Biraz hızlı</option></select>'+
  '<p id="sesBilgi" class="ay-not" role="status"></p>'+
  '<div class="row"><button type="button" class="btn" id="ayDene">▶ Sesi dene</button><button type="button" class="btn" id="ayGeri">‹ Ayarlar</button></div>'+
  '<button type="button" class="btn pri ay-kapat" onclick="closeModal()">Kapat</button>','Okuyan ses');
 const m=box.querySelector('#sesMotor');if(m){m.value=DIL.mod;m.onchange=()=>{DIL.mod=m.value;lsSet('sesMotor',DIL.mod);sesSus();};}
 const v=box.querySelector('#voiceSelect');voiceOptions(v);v.onchange=()=>{SES.voice=v.value;lsSet('sesVoice',SES.voice);};
 const r=box.querySelector('#voiceRate');r.value=String(SES.rate);r.onchange=()=>{SES.rate=Number(r.value);lsSet('sesRate',SES.rate);};
 if(typeof sesBilgiYaz==='function')sesBilgiYaz();
 box.querySelector('#ayDene').onclick=()=>sesSoyle('Sesli okuma denemesi. Hazır olduğunda çalışmaya devam edebilirsin.');
 box.querySelector('#ayGeri').onclick=()=>anaAyarlar();
}
