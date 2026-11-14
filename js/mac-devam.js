/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* 14.11 akşam: mobil oyun alışkanlıkları.
   1) Kaldığın yerden dön: odadayken ya da maçtayken sayfa yenilenirse aynı odaya yeniden bağlanılır.
      Er Meydanı'nda cevaplar korunur (sunucu kaydı + telefondaki kopya). 1'e 1 başladıktan sonra dönülemez.
   2) Hızlı Şef: js/blitz.js.
   3) Er Meydanı sonunda tek düğmeyle aynı konuyla yeni oda (rövanş). Kapışmada rövanş zaten vardı. */
'use strict';
const MD={anahtar:'yr_devam',denendi:false,yuklendi:Date.now()};
function mdKaydet(){try{if(YR.active&&YR.code)sessionStorage.setItem(MD.anahtar,JSON.stringify({code:YR.code,s:YR.sifre||'',t:Date.now()}));}catch(e){}}
function mdSil(){try{sessionStorage.removeItem(MD.anahtar);}catch(e){}}
function mdOku(){try{const v=JSON.parse(sessionStorage.getItem(MD.anahtar)||'null');if(v&&v.code&&Date.now()-v.t<3*3600000)return v;}catch(e){}mdSil();return null;}
{
 const MD_ENTER=yrEnter;
 yrEnter=async function(){const ok=await MD_ENTER.apply(this,arguments);if(ok)mdKaydet();return ok;};
 const MD_LEAVE=yrLeaveNow;
 yrLeaveNow=function(){mdSil();return MD_LEAVE.apply(this,arguments);};
 const MD_ROOM=yrRoomChanged;
 yrRoomChanged=function(room){if(!room&&YR.active)mdSil();return MD_ROOM.apply(this,arguments);};
 const MD_R=render;
 render=function(){
  const r=MD_R.apply(this,arguments);
  try{
   if(/^(aover|dover|raceover)$/.test(st.screen||''))mdSil();
   else if(YR.active)mdKaydet();
   mdDene();
  }catch(e){}
  return r;
 };
}
function mdDene(){
 if(MD.denendi||YR.active||Date.now()-MD.yuklendi>30000||typeof yrHasName!=='function'||!yrHasName()||!navigator.onLine||!yrConfigured())return;
 if(st.modalOpen||!/^(home|racemenu)$/.test(st.screen||''))return;
 MD.denendi=true;const v=mdOku();if(!v)return;
 YR.error='';YR.notice='Maçına geri dönülüyor…';st.screen='racemenu';
 setTimeout(()=>{
  render();
  Promise.resolve(yrJoin(v.code,undefined,v.s)).then(ok=>{
   YR.notice='';
   if(!ok){mdSil();if(!YR.active){YR.error='Önceki maçına dönülemedi. Maç bitmiş ya da başlamış olabilir.';if(st.screen==='racemenu')render();}}
  });
 },0);
}
{const t=setInterval(()=>{if(MD.denendi||Date.now()-MD.yuklendi>30000){clearInterval(t);return;}try{mdDene();}catch(e){}},700);}
/* Hızlı Şef: js/blitz.js (lbHizli). */
/* Er Meydanı rövanşı: aynı konuyla yeni, herkese açık oda; arkadaşlar listeden ya da kodla girer. */
window.mdYeniArena=function(){
 const r=YR.room;if(!r)return;const konu=r.scope==='konu'?r.subject:'butun';
 yrLeaveNow();yrCreateOpen('arena');
 if(konu!=='butun')Object.assign(YR.cfg,{arenaTopic:konu,scope:'konu',subject:konu});
 Object.assign(YR.cfg,{pub:true,kilit:false,ad:''});yrCreate();
};
if(typeof arOverHTML==='function'){
 const MD_AROVER=arOverHTML;
 arOverHTML=function(){
  const h=MD_AROVER.apply(this,arguments);
  if(!AR||!AR.finalized)return h;
  const i=h.lastIndexOf('<button type="button" class="btn" onclick="yrLeave()">Çık</button>');
  if(i<0)return h;
  return h.slice(0,i)+'<button type="button" class="btn pri md-rovans" onclick="mdYeniArena()">🔁 Rövanş: aynı konuyla yeni Er Meydanı</button>'+h.slice(i);
 };
}
