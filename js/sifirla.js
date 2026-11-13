/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Tam sıfırlama (10.11.2026): bütün öğrenciler sıfır profille başlasın.
   Her cihazda bir kez çalışır. Silinenler: profiller, rütbe, ödül/rozet, geçmiş, rekorlar, bölüm ilerlemesi, haftalık durum.
   Kalanlar: ses, tema ve müzik ayarları.
   Eski veri bu cihazda gizli yedeğe (yedek_2026_11) alınır.
   Bulut temizliği, kuralı değiştirmeden, uygulamanın kendi profil silme yoluyla yapılır:
   rkForgetProfile -> sıralama satırları silinir; adSync -> oyun adı rezervasyonu bırakılır ve arkadaş kayıtları (arkWipe) temizlenir.
   İnternet yoksa işler sonraki açılışta ya da internet gelince sürer. */
(function(){
 const SURUM='2026-11-10-tam';
 const SIL=['rutbe','rutbe_dal','records','odul','rk_best','rk_win','rk_pek','rk_oyun','rk_setting','arena_devam','arena_odul','arena_pek','haftalik','yol_ma','yol_bh','rk_queue','kaptan_onbellek','kaptan_onbellek2'];
 const YEDEK_EK=['profiles','rk_ids','ark_id','ad_map','sonProfil'];
 function yerel(){
  if(ls('sifirlama',null)===SURUM)return;
  const yedek=ls('yedek_2026_11',{}),isimler=(ls('profiles',[])||[]).slice();
  let veriVar=isimler.length>0;
  SIL.concat(YEDEK_EK).forEach(k=>{const v=ls(k,null);if(v===null||v===undefined)return;if(yedek[k]===undefined)yedek[k]=v;});
  SIL.forEach(k=>{const v=ls(k,null);if(v&&typeof v==='object'&&Object.keys(v).length&&!/^kaptan/.test(k))veriVar=true;});
  if(Object.keys(yedek).length)lsSet('yedek_2026_11',yedek);
  /* Önce bulut işleri için profil başına mevcut silme yolu (sıralama kaydı + kimlik), sonra yerel temizlik. */
  isimler.forEach(n=>{try{if(typeof rkForgetProfile==='function')rkForgetProfile(n);}catch(e){}});
  lsSet('profiles',[]);lsSet('sonProfil',null);
  SIL.forEach(k=>{lsSet(k,(k==='rk_queue'||k==='records')?[]:{});});
  lsSet('sifirlama',SURUM);
  lsSet('sifirla_bekleyen',[]);
  try{if(typeof st!=='undefined'){st.prof=null;st.guest=false;}}catch(e){}
  if(veriVar)lsSet('sifirla_haber',true);
  if(typeof adSync==='function')setTimeout(adSync,600);
 }
 function haber(){
  if(!ls('sifirla_haber',false))return;
  if(typeof st==='undefined'||st.modalOpen||!['home','profiles','welcome','giris'].includes(st.screen))return;
  const ov=document.getElementById('ov');if(!ov)return;
  lsSet('sifirla_haber',false);
  if(typeof pauseT==='function')pauseT();
  st.modalOpen=true;ov.className='on';
  ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="sfT"><h2 id="sfT">Yeni başlangıç</h2><p>Site çok yenilendi. Herkes adil başlasın diye profiller, puanlar, rütbeler ve sıralamalar sıfırlandı.</p><p>Yeni bir karakterle baştan başlıyorsun.</p><button class="btn" id="sfTamam" type="button">Tamam</button></div>';
  const b=document.getElementById('sfTamam');if(b){b.onclick=function(){if(typeof closeModal==='function')closeModal();else{ov.className='';ov.innerHTML='';st.modalOpen=false;}if(typeof render==='function')render();};b.focus();}
 }
 yerel();
 try{render();}catch(e){}
 const prev=render;render=function(){const r=prev.apply(this,arguments);setTimeout(haber,350);return r;};
 setTimeout(()=>{try{haber();}catch(e){}},900);
})();
