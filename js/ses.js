/* Cihazın sunduğu Türkçe sesler arasında seçim; kayıtlı profesyonel ses değildir. */
'use strict';
var SES={acik:ls('ses',true),sira:[],sonMesaj:null,uyari:false,voice:ls('sesVoice',''),rate:ls('sesRate',1),token:0};
var OKUNUS={'SMOOTHİE BLENDERİ':'smuti blenderi','WAFFLE MAKİNESİ':'vafıl makinesi','MUFFİN KALIBI':'mafin kalıbı','GASTRONORM (GN) KÜVET':'gastronorm küvet','ÇAY MAKİNESİ (ÇAYCI)':'çay makinesi','KESME TAHTASI (DOĞRAMA TAHTASI)':'kesme tahtası','LİMON RENDESİ (ZESTER)':'limon rendesi'};
function sesVar(){return typeof window!=='undefined'&&'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined';}
function sesAd(ad){ad=String(ad||'').trim();return OKUNUS[ad.toLocaleUpperCase('tr')]||ad.toLocaleLowerCase('tr');}
function sesMetin(t){t=String(t||'');Object.keys(OKUNUS).forEach(k=>{t=t.split(k).join(OKUNUS[k]);});return t.replace(/smoothie/gi,'smuti').replace(/waffle/gi,'vafıl').replace(/muffin/gi,'mafin').replace(/…+|\.{3,}/g,' boşluk ').replace(/(\d)\s*[–-]\s*(\d)/g,'$1 ile $2').replace(/−/g,'eksi ').replace(/°\s*C/g,' derece').replace(/(\d)\s*ml\b/gi,'$1 mililitre').replace(/(\d)\s*cm\b/gi,'$1 santimetre').replace(/(\d)\s*g\b/g,'$1 gram').replace(/\bGN\b/g,'ge ne').replace(/\s+/g,' ').trim();}
function sesBirlestir(a,b){a=String(a||'').trim();return b?a+(/[.?!:]$/.test(a)?' ':'. ')+b:a;}
function sesTurkce(){try{return speechSynthesis.getVoices().filter(v=>/^tr(?:-|_|$)/i.test(v.lang));}catch(e){return [];}}
function sesSus(){SES.token++;try{if(sesVar())speechSynthesis.cancel();}catch(e){}}
function sesUyari(){if(SES.uyari)return;SES.uyari=true;const a=document.getElementById('app');if(a)a.insertAdjacentHTML('afterbegin','<p class="ses-uyari" role="status">Türkçe ses bulunamadı. Ses ayarlarını kontrol edebilirsin. Yazılı yönergelerle devam edebilirsin.</p>');}
function sesSoyle(metin){if(!SES.acik||!metin||!sesVar())return;sesSus();const token=SES.token;let voices=sesTurkce();if(!voices.length){sesUyari();return;}const selected=voices.find(v=>v.voiceURI===SES.voice)||voices.find(v=>!v.localService)||voices.find(v=>v.default)||voices[0];
 const sentences=sesMetin(metin).match(/[^.!?]+[.!?]*/g)||[];
 function speak(i){if(token!==SES.token||!SES.acik||i>=sentences.length)return;const u=new SpeechSynthesisUtterance(sentences[i].trim());u.lang='tr-TR';u.voice=selected;u.rate=Number(SES.rate)||1;u.pitch=1;u.onend=()=>speak(i+1);u.onerror=()=>{};speechSynthesis.speak(u);}speak(0);
}
if(sesVar())speechSynthesis.addEventListener('voiceschanged',()=>{SES.uyari=false;const sel=document.getElementById('voiceSelect');if(sel)voiceOptions(sel);});
function sesDugme(t,label){const i=SES.sira.push(t)-1;return '<button type="button" class="spk" aria-label="'+esc(label||'Sesli dinle')+'" onclick="event.stopPropagation();sesSoyle(SES.sira['+i+'])">🔊</button>';}
function sesAcKapa(){SES.acik=!SES.acik;lsSet('ses',SES.acik);sesSus();render();}
function voiceOptions(sel){const vs=sesTurkce();sel.innerHTML=vs.length?vs.map(v=>'<option value="'+esc(v.voiceURI)+'"'+(v.voiceURI===SES.voice?' selected':'')+'>'+esc(v.name)+'</option>').join(''):'<option value="">Türkçe ses bulunamadı</option>';if(!vs.some(v=>v.voiceURI===SES.voice)&&vs.length)sel.value=(vs.find(v=>!v.localService)||vs.find(v=>v.default)||vs[0]).voiceURI;}
function voiceSettings(){sesSus();st.modalOpen=true;pauseT();const ov=document.getElementById('ov');ov.className='on';ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-label="Ses ayarları"><h2>Ses ayarları</h2><p>Sesler cihazına göre değişir. Bir sesi dinleyip seçebilirsin.</p><label for="voiceSelect">Türkçe ses</label><select id="voiceSelect" onchange="SES.voice=this.value;lsSet(\'sesVoice\',SES.voice)"></select><label for="voiceRate">Konuşma hızı</label><select id="voiceRate" onchange="SES.rate=Number(this.value);lsSet(\'sesRate\',SES.rate)"><option value="0.85">Biraz yavaş</option><option value="1">Normal</option><option value="1.1">Biraz hızlı</option></select><div class="row"><button class="btn" onclick="sesSoyle(\'Kevgir yiyeceği alır; sıvı deliklerinden süzülür.\')">Sesi dene</button><button class="btn" onclick="sesSus()">Durdur</button><button class="btn pri" onclick="closeModal()">Kapat</button></div></div>';voiceOptions(document.getElementById('voiceSelect'));document.getElementById('voiceRate').value=String(SES.rate);document.getElementById('voiceSelect').focus();}
/* ---- Ekranlara bağlama (bu dosya en son yüklenir) ---- */
var SES_TOP=topBar;
topBar=function(t,nb){return SES_TOP(t,nb).replace('<div class="who">','<button type="button" class="ses-ac" aria-pressed="'+SES.acik+'" aria-label="Sesli okuma '+(SES.acik?'açık. Kapatmak için dokun':'kapalı. Açmak için dokun')+'" onclick="sesAcKapa()">'+(SES.acik?'🔊':'🔇')+'</button><div class="who">');};
/* Geri bildirim (Doğru, Tekrar dene, açıklama) bir kez kendiliğinden okunur; kutudaki 🔊 ile yeniden dinlenir. */
var SES_MSG=msgHtml;
msgHtml=function(){
  var h=SES_MSG();if(!st.lastRes||!h)return h;
  var t=sesBirlestir(st.lastRes.head,st.lastRes.text);
  if(st.lastRes!==SES.sonMesaj){SES.sonMesaj=st.lastRes;sesSoyle(t);}
  return h.replace(/^(<div class="msg[^"]*">)/,'$1'+sesDugme(t,'Geri bildirimi dinle'));
};
/* Yeni soru ekrana gelince soru ve seçenekler bir kez okunur. */
function sesSoru(anahtar,metin){if(anahtar!==SES.sonSoru){SES.sonSoru=anahtar;sesSoyle(metin);}}
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
