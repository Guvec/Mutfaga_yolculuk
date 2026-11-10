/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Haftanın Kaptanı: Haftalık Mutfak Yarışması'nın bu haftaki birincisi (en çok doğru; eşitse en kısa süre).
   Bu hafta henüz sonuç yoksa rozet görünmez (geçen hafta gösterilmez). Yalnız karakter profili adı görünür.
   Veri, sıralamayla aynı Firebase tablosundan okunur; bağlantı yoksa rozet hiç görünmez. */
(function(){
 'use strict';
 const KEY='kaptan_onbellek2',SURE=10*60*1000;
 const K={veri:null,bekliyor:false,deneme:0};
 function sirala(rows){
  return rows.filter(r=>r&&Number.isInteger(r.correct)&&r.correct>0&&typeof r.name==='string').sort((a,b)=>b.correct-a.correct||((Number.isInteger(a.dur)?a.dur:1e9)-(Number.isInteger(b.dur)?b.dur:1e9))||a.name.localeCompare(b.name,'tr'));
 }
 function okuOnbellek(){try{const c=ls(KEY,null);if(c&&c.ts&&Date.now()-c.ts<SURE&&c.hafta===rkWeekNo())return c;}catch(e){}return null;}
 async function getir(w){const be=rkBackend();if(!be)throw Error('NO_CONFIG');return sirala(await be.list(rkTable('haftalik','hafta',w)));}
 async function yukle(){
  if(K.bekliyor)return;const c=okuOnbellek();if(c){K.veri=c.kayit?c:null;return;}
  if(!rkOnline()||K.deneme>=2)return;
  K.bekliyor=true;K.deneme++;
  try{
   const w=rkWeekNo(),rows=await getir(w);
   const r=rows[0],kayit=r?{ad:rkName(r.name),dogru:r.correct,sure:Number.isInteger(r.dur)?r.dur:null,gecen:false}:null;
   const c2={ts:Date.now(),hafta:w,kayit};lsSet(KEY,c2);K.veri=kayit?c2:null;K.deneme=0;
   if(['home','siralama'].includes(st.screen)&&!st.modalOpen)render();
  }catch(e){}finally{K.bekliyor=false;}
 }
 function benMi(k){return !!k&&!st.guest&&!!st.prof&&rkName(st.prof)===k.ad;}
 function sureYazi(s){if(!Number.isInteger(s))return '';return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
 window.kaptanRozetHTML=function(){
  const c=K.veri;if(!c||!c.kayit)return '';const k=c.kayit,ben=benMi(k);
  return '<button type="button" class="ae-kaptan" onclick="kaptanAc()" aria-label="Haftanın Kaptanı: '+esc(k.ad)+'"><span aria-hidden="true">👑</span><b>'+(ben?'Kaptan':esc(k.ad))+'</b></button>';
 };
 window.kaptanKartHTML=function(){
  const c=K.veri;if(!c||!c.kayit)return '';const k=c.kayit,ben=benMi(k),t=sureYazi(k.sure);
  return '<div class="card kaptan-kart" role="status"><span class="kaptan-tac" aria-hidden="true">👑</span><div><small>Haftanın Kaptanı'+(k.gecen?' · geçen hafta':'')+'</small><strong>'+esc(k.ad)+'</strong><span>'+k.dogru+' doğru'+(t?' · '+t:'')+'</span></div></div>';
 };
 window.kaptanAc=function(){
  const c=K.veri;if(!c||!c.kayit)return;const k=c.kayit,t=sureYazi(k.sure);
  modalFocus=document.activeElement;sesSus();st.modalOpen=true;pauseT();const ov=document.getElementById('ov');ov.className='on';
  ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-label="Haftanın Kaptanı"><h2>👑 Haftanın Kaptanı</h2><p><b>'+esc(k.ad)+'</b></p><p>'+k.dogru+' doğru'+(t?' · '+t:'')+'</p><p class="sub">Haftalık Mutfak Yarışması: en çok doğru yapan kazanır. Doğru sayısı eşitse daha kısa sürede bitiren üstte olur.'+(k.gecen?' Bu hafta henüz sonuç yok, geçen haftanın kaptanı gösteriliyor.':'')+'</p><div class="row"><button class="btn" onclick="closeModal();rkOpenBoard(\'haftalik\');go(\'siralama\')">Sıralamayı aç</button><button class="btn pri" onclick="closeModal()">Kapat</button></div></div>';
  const b=ov.querySelector('.btn.pri');if(b)b.focus();
 };
 const onceki=render;render=function(){onceki();if(['home','siralama'].includes(st.screen)&&!K.veri&&!K.bekliyor)yukle();else if(['home','siralama'].includes(st.screen)&&!K.bekliyor&&!okuOnbellek())yukle();};
})();
