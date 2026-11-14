/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Mola hatırlatması (14.11.2026): uygulama ekranda açıkken 30 dakika kesintisiz kullanılınca,
   oyun ya da soru ortasında değil, bir menü/sonuç ekranına gelince "Şefim" diye hatırlatır.
   10 dakikadan uzun ara verilmişse sayaç sıfırlanır. Kayıt yalnız bu cihazda. */
'use strict';
(function(){
 const ESIK=30*60, ARA=10*60*1000, ERTELE=10*60, ADIM=15;
 const OYUNDA=['board','quiz','game','racecount','raceplay','dintro','dplay','aintro','aplay','cvplay','haftaplay','yolplay','content','baharatrafi','arenapek','pekcalis','spicelearn','servantkuver','classification','pedit','tarifkart'];
 function al(){try{return JSON.parse(localStorage.getItem('kv_mola')||'{}');}catch(e){return {};}}
 function yaz(v){try{localStorage.setItem('kv_mola',JSON.stringify(v));}catch(e){}}
 function uygun(){
  if(typeof st==='undefined'||!st.screen||st.modalOpen||document.getElementById('molaKutu'))return false;
  if(typeof YR!=='undefined'&&YR.active)return false;
  if(st.inBreak)return false;
  return !OYUNDA.includes(st.screen);
 }
 function goster(){
  const k=document.createElement('div');k.id='molaKutu';k.className='mola-kutu';k.setAttribute('role','dialog');k.setAttribute('aria-modal','true');k.setAttribute('aria-labelledby','molaBas');
  k.innerHTML='<div class="mola-ic"><div class="mola-simge" aria-hidden="true">🍵</div><h2 id="molaBas">Şefim, mola zamanı!</h2><p>30 dakikadır çalışıyorsun. Gözlerini ekrandan ayır, biraz su iç, kalkıp birkaç adım at.</p><p class="mola-not">İyi bir şef de ara verir; dinlenince daha iyi odaklanırsın.</p><button type="button" class="btn pri" id="molaTamam">Mola veriyorum</button><button type="button" class="btn" id="molaSonra">10 dakika sonra hatırlat</button></div>';
  document.body.appendChild(k);
  const kapat=()=>{k.remove();};
  document.getElementById('molaTamam').onclick=()=>{yaz({s:0,t:Date.now(),mola:Date.now()});kapat();};
  document.getElementById('molaSonra').onclick=()=>{const v=al();v.s=ESIK-ERTELE;v.t=Date.now();yaz(v);kapat();};
  document.getElementById('molaTamam').focus();
  if(typeof sesSoyle==='function')try{sesSoyle('Şefim, mola zamanı! 30 dakikadır çalışıyorsun. Gözlerini ekrandan ayır, biraz su iç.');}catch(e){}
 }
 function tik(){
  if(document.visibilityState!=='visible')return;
  const v=al(),now=Date.now();
  if(!v.t||now-v.t>ARA)v.s=0;
  v.s=(v.s||0)+ADIM;v.t=now;yaz(v);
  if(v.s>=ESIK&&uygun())goster();
 }
 setInterval(tik,ADIM*1000);
 window.molaTest=goster;
})();
