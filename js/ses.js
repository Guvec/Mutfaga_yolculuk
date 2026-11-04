/* Tarayıcının Türkçe sesini kullanır. Okuma, öğrencinin dinleme isteğiyle başlar.
   Kayıtlı insan sesi değildir; ses kalitesi ve çevrimdışı kullanım cihaza bağlıdır. */
'use strict';
var SES={acik:ls('ses',true),sira:[],sonMesaj:null,uyari:false,voice:ls('sesVoice',''),rate:ls('sesRate',1),token:0,pending:null,timer:null,utterance:null,status:''};
var OKUNUS={'SMOOTHİE BLENDERİ':'smuti blenderi','WAFFLE MAKİNESİ':'vafıl makinesi','MUFFİN KALIBI':'mafin kalıbı','GASTRONORM (GN) KÜVET':'gastronorm küvet','ÇAY MAKİNESİ (ÇAYCI)':'çay makinesi','KESME TAHTASI (DOĞRAMA TAHTASI)':'kesme tahtası','LİMON RENDESİ (ZESTER)':'limon rendesi'};
function sesVar(){return typeof window!=='undefined'&&'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined';}
function sesAd(ad){ad=String(ad||'').trim();return OKUNUS[ad.toLocaleUpperCase('tr')]||ad.toLocaleLowerCase('tr');}
function sesMetin(t){t=String(t||'');Object.keys(OKUNUS).forEach(k=>{t=t.split(k).join(OKUNUS[k]);});return t.replace(/smoothie/gi,'smuti').replace(/waffle/gi,'vafıl').replace(/muffin/gi,'mafin').replace(/…+|\.{3,}/g,' boşluk ').replace(/(\d)\s*[–-]\s*(\d)/g,'$1 ile $2').replace(/−/g,'eksi ').replace(/°\s*C/g,' derece').replace(/(\d)\s*ml\b/gi,'$1 mililitre').replace(/(\d)\s*cm\b/gi,'$1 santimetre').replace(/(\d)\s*g\b/g,'$1 gram').replace(/\bGN\b/g,'ge ne').replace(/\s+/g,' ').trim();}
function sesBirlestir(a,b){a=String(a||'').trim();return b?a+(/[.?!:]$/.test(a)?' ':'. ')+b:a;}
function sesTumu(){try{return speechSynthesis.getVoices().length;}catch(e){return 0;}}
function sesTurkce(){try{return speechSynthesis.getVoices().filter(v=>/^tr(?:-|_|$)/i.test(v.lang));}catch(e){return [];}}
function sesDurum(metin){
 SES.status=metin;var p=document.getElementById('sesDurum');
 if(!p&&document.body){p=document.createElement('p');p.id='sesDurum';p.className='ses-uyari';p.setAttribute('role','status');p.setAttribute('aria-live','polite');document.body.appendChild(p);}
 if(p){p.textContent=metin;p.hidden=!metin;}
}
function sesSus(){
 SES.token++;SES.pending=null;SES.utterance=null;clearTimeout(SES.timer);SES.timer=null;
 try{if(sesVar())speechSynthesis.cancel();}catch(e){}
 sesDurum('');
}
function sesYedek(metin,neden){sesDurum(neden+' Yazılı okuma: '+metin);}
function sesBaslat(req){
 if(!req||req.token!==SES.token||(!SES.acik&&!req.zorla))return;
 const vs=sesTurkce();if(!vs.length&&!req.listesiz)return;
 SES.pending=null;clearTimeout(SES.timer);
 // Yerel ses varsayılanı ağ gecikmesini azaltır. Öğrencinin seçimi önceliklidir.
 const voice=vs.length?(vs.find(v=>v.voiceURI===SES.voice)||vs.find(v=>v.localService&&v.default)||vs.find(v=>v.localService)||vs.find(v=>v.default)||vs[0]):null;
 const u=new SpeechSynthesisUtterance(req.text);SES.utterance=u;u.lang='tr-TR';if(voice)u.voice=voice;/* Ses listesi boşsa cihazın kendi Türkçe varsayılanı denenir. */
 const rate=Number(SES.rate);u.rate=Number.isFinite(rate)?Math.max(0.8,Math.min(1.1,rate)):1;u.pitch=1;
 // Tek okuma nesnesi: noktalardan bölüp cümle başlarını kesmez, her cümlede yeni konuşma başlatmaz.
 u.onstart=()=>{if(req.token!==SES.token)return;clearTimeout(SES.timer);sesDurum('');};
 u.onend=()=>{if(req.token!==SES.token)return;clearTimeout(SES.timer);SES.utterance=null;};
 u.onerror=e=>{if(req.token!==SES.token)return;clearTimeout(SES.timer);SES.utterance=null;
   sesYedek(req.text,e&&e.error==='not-allowed'?'Ses başlatılamadı. Dinle düğmesine yeniden dokun.':'Ses okunamadı. Yazıyla devam edebilirsin.');};
 SES.timer=setTimeout(()=>{if(req.token!==SES.token)return;sesSus();sesYedek(req.text,'Ses başlamadı. Dinle düğmesine yeniden dokun.');},12000);
 try{speechSynthesis.speak(u);}catch(e){clearTimeout(SES.timer);SES.utterance=null;sesYedek(req.text,'Ses başlatılamadı.');}
}
function sesSoyle(metin){
 if(!SES.acik||!metin)return;
 sesSus();const req={text:sesMetin(metin),token:SES.token};if(!req.text)return;
 if(!sesVar()){sesYedek(req.text,'Bu tarayıcı sesli okumayı desteklemiyor.');return;}
 if(sesTurkce().length){sesBaslat(req);return;}
 // getVoices ilk çağrıda boş olabilir. Yalnız en son istek, sınırlı süre bekletilir.
 SES.pending=req;sesDurum('Türkçe sesler yükleniyor. Yazılı yönergeyle devam edebilirsin.');
 SES.timer=setTimeout(()=>{if(req.token!==SES.token||SES.pending!==req)return;
  /* Bazı tahtalar ve tarayıcılar ses listesini hiç vermez ama Türkçe okuyabilir: liste tamamen boşsa dil etiketiyle bir kez denenir. Listede yalnız başka diller varsa başka dile düşülmez. */
  if(sesTumu()===0){req.listesiz=true;sesBaslat(req);return;}
  SES.pending=null;sesYedek(req.text,'Türkçe ses yüklenemedi. Cihazın Türkçe ses ayarını kontrol edebilirsin.');},2500);
}
if(sesVar())speechSynthesis.addEventListener('voiceschanged',()=>{
 const sel=document.getElementById('voiceSelect');if(sel)voiceOptions(sel);sesBilgiYaz();
 if(SES.pending&&sesTurkce().length)sesBaslat(SES.pending);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)sesSus();});
function sesDugme(t,label){const i=SES.sira.push(t)-1;return '<button type="button" class="spk" aria-label="'+esc(label||'Sesli dinle')+'" onclick="event.stopPropagation();sesSoyle(SES.sira['+i+'])">🔊</button>';}
function sesAcKapa(){SES.acik=!SES.acik;lsSet('ses',SES.acik);sesSus();render();}
function voiceOptions(sel){const vs=sesTurkce();sel.innerHTML=vs.length?vs.map(v=>'<option value="'+esc(v.voiceURI)+'"'+(v.voiceURI===SES.voice?' selected':'')+'>'+esc(v.name)+'</option>').join(''):'<option value="">Türkçe ses bekleniyor</option>';if(!vs.some(v=>v.voiceURI===SES.voice)&&vs.length)sel.value=(vs.find(v=>v.localService&&v.default)||vs.find(v=>v.localService)||vs.find(v=>v.default)||vs[0]).voiceURI;}
function sesBilgiYaz(){const e=document.getElementById('sesBilgi');if(!e)return;
 if(!sesVar()){e.textContent='Bu tarayıcı sesli okumayı desteklemiyor. Chrome ya da Edge ile açmayı dene.';return;}
 const t=sesTurkce().length,h=sesTumu();
 e.textContent=t?('Cihazda '+t+' Türkçe ses bulundu.'):h?('Cihazda '+h+' ses var ama Türkçe ses yok. Cihazın ses ayarından Türkçe ses paketi yüklenmeli.'):'Cihaz ses listesini vermedi. "Sesi dene" ile cihazın kendi sesi denenir.';
}
function voiceSettings(){sesSus();st.modalOpen=true;pauseT();const ov=document.getElementById('ov');ov.className='on';ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-label="Ses ayarları"><h2>Ses ayarları</h2><p>Okumak için 🔊 düğmesine dokun. Sesler cihazına göre değişir; kayıtlı insan sesi değildir. Bir sesi dinleyip seçebilirsin.</p><p id="sesBilgi" class="sub" role="status"></p><label for="voiceSelect">Türkçe ses</label><select id="voiceSelect" onchange="SES.voice=this.value;lsSet(\'sesVoice\',SES.voice)"></select><label for="voiceRate">Konuşma hızı</label><select id="voiceRate" onchange="SES.rate=Number(this.value);lsSet(\'sesRate\',SES.rate)"><option value="0.85">Biraz yavaş</option><option value="1">Normal</option><option value="1.1">Biraz hızlı</option></select><div class="row"><button class="btn" onclick="sesSoyle(\'Sesli okuma denemesi. Hazır olduğunda çalışmaya devam edebilirsin.\')">Sesi dene</button><button class="btn" onclick="sesSus()">Durdur</button><button class="btn pri" onclick="closeModal()">Kapat</button></div></div>';voiceOptions(document.getElementById('voiceSelect'));sesBilgiYaz();document.getElementById('voiceRate').value=String(SES.rate);document.getElementById('voiceSelect').focus();}
/* ---- Ekranlara bağlama (bu dosya en son yüklenir) ---- */
var SES_TOP=topBar;
topBar=function(t,nb){return SES_TOP(t,nb).replace('<div class="who">','<button type="button" class="ses-ac" aria-pressed="'+SES.acik+'" aria-label="Sesli okuma '+(SES.acik?'açık. Kapatmak için dokun':'kapalı. Açmak için dokun')+'" onclick="sesAcKapa()">'+(SES.acik?'🔊':'🔇')+'</button><div class="who">');};
/* Geri bildirim kutudaki 🔊 düğmesiyle okunur; yeniden çizim konuşma başlatmaz. */
var SES_MSG=msgHtml;
msgHtml=function(){
  var h=SES_MSG();if(!st.lastRes||!h)return h;
  var t=sesBirlestir(st.lastRes.head,st.lastRes.text);
  // Ekran çizimi konuşma başlatmaz. Okuma yalnız dinleme düğmesinden başlar.
  return h.replace(/^(<div class="msg[^"]*">)/,'$1'+sesDugme(t,'Geri bildirimi dinle'));
};
/* Soru ve seçenekler dinleme düğmesine hazırlanır; kendiliğinden okunmaz. */
function sesSoru(anahtar,metin){SES.sonSoru=anahtar;}
var SES_QUIZ=quizHtml;
quizHtml=function(){
  var h=SES_QUIZ();
  if(st.op==='ad'&&st.q&&st.q.opts&&!st.kDone){
    var t='Öne çıkan parçanın adı nedir? Seçenekler: '+st.q.opts.map(function(o){return sesAd(ITEMS[o].ad);}).join(', ')+'.';
    h=h.replace('<div class="qtext">','<div class="qtext">'+sesDugme(t,'Soruyu dinle'));
    if(!st.done&&!st.tries)sesSoru('ad'+st.sess.id+'-'+st.sess.qs.length,t);
  }else if(st.op==='kur'&&st.q&&!st.kDone){
    var k='Sıradaki parça: '+sesAd(ITEMS[st.q.key].ad)+'. Masada bu parçanın yerine dokun.';
    h=h.replace('<div class="nm">','<div class="nm">'+sesDugme(k,'Parçanın adını dinle'));
    if(!st.done&&!st.tries)sesSoru('kur'+st.sess.id+'-'+st.q.key,k);
  }
  return h;
};
var SES_CQ=contentQuizHTML;
contentQuizHTML=function(){
  var h=SES_CQ(),q=st.q;
  if(!q||st.kDone||!q.choices)return h;
  var resimli=q.choices.some(function(c){return c.image;});
  var t=sesBirlestir(q.prompt,(resimli?'Seçenekler fotoğraflıdır: A, B, C ve D.':q.choices.map(function(c){return (q.group?c.id+', ':'')+sesAd(c.text);}).join('. ')+'.'));
  h=h.replace('<section class="card"><h2>','<section class="card"><h2>'+sesDugme(t,'Soruyu ve seçenekleri dinle'));
  if(!st.done&&!st.tries)sesSoru('q'+st.sess.id+'-'+q.id,t);
  return h;
};
var SES_GO=go;
go=function(s){sesSus();SES_GO(s);};
