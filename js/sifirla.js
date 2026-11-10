/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Tek seferlik sıfırlama (10.11.2026): bütün öğrenciler adil başlasın.
   Her cihazda bir kez çalışır. Silinenler: rütbe, ödül/rozet, geçmiş, rekorlar, bölüm ilerlemesi, haftalık durum.
   Kalanlar: profiller, oyun adları, arkadaşlar, ses/tema ayarları.
   Eski veri bu cihazda gizli yedeğe (yedek_2026_11) alınır. Bulut sıralamadaki kayıtlar, kuralı değiştirmeden,
   mevcut "listeden çık → kayıtları sil → listeye dön" yoluyla temizlenir. */
(function(){
 const SURUM='2026-11-10',SIL=['rutbe','records','odul','rk_best','rk_win','rk_pek','rk_oyun','rk_setting','arena_devam','arena_odul','arena_pek','haftalik','yol_ma','rk_queue'];
 function yerel(){
  if(ls('sifirlama',null)===SURUM)return;
  const yedek={},var_=[];
  SIL.forEach(k=>{const v=ls(k,null);if(v===null||v===undefined)return;yedek[k]=v;if(Object.keys(v).length)var_.push(k);});
  if(Object.keys(yedek).length)lsSet('yedek_2026_11',yedek);
  SIL.forEach(k=>{lsSet(k,(k==='rk_queue'||k==='records')?[]:{});});
  lsSet('sifirlama',SURUM);
  const ids=Object.values(ls('rk_ids',{}));
  if(ids.length)lsSet('sifirla_bekleyen',ids);
  if(var_.length)lsSet('sifirla_haber',true);
 }
 function haber(){
  if(!ls('sifirla_haber',false))return;
  if(typeof st==='undefined'||st.modalOpen||!['home','profiles','welcome','giris'].includes(st.screen))return;
  lsSet('sifirla_haber',false);
  const ov=document.getElementById('ov');if(!ov)return;
  if(typeof pauseT==='function')pauseT();
  st.modalOpen=true;ov.className='on';
  ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="sfT"><h2 id="sfT">Yeni başlangıç</h2><p>Site çok yenilendi. Herkes adil başlasın diye puanlar, rütbeler ve sıralamalar sıfırlandı.</p><p>Profilin ve arkadaşların duruyor.</p><button class="btn" id="sfTamam" type="button">Tamam</button></div>';
  const b=document.getElementById('sfTamam');if(b){b.onclick=function(){if(typeof closeModal==='function')closeModal();else{ov.className='';ov.innerHTML='';st.modalOpen=false;}};b.focus();}
 }
 /* Bulut: her profil için çık → temizle → dön. Hata olursa bekleyen listede kalır, sonraki açılışta yeniden denenir. */
 let calisiyor=false;
 async function bulut(){
  if(calisiyor||typeof rkBackend!=='function'||!navigator.onLine)return;
  let liste=ls('sifirla_bekleyen',[]);if(!liste.length)return;
  const be=rkBackend();if(!be)return;calisiyor=true;
  try{
   for(const pid of liste.slice()){
    try{
     lsSet('rk_queue',rkQueue().filter(x=>x.pid!==pid));
     const sp=await be.ensureProfile(pid);rkProfSet(pid,{status:sp.status,gen:sp.gen,synced:true});
     if(sp.status==='in'){const n=await be.setStatus(pid,'out');rkProfSet(pid,{status:n.status,gen:n.gen});}
     if(!(await rkCleanup(pid)))continue;
     const sp2=await be.ensureProfile(pid);
     if(sp2.status==='out'){const n=await be.setStatus(pid,'in');rkProfSet(pid,{status:n.status,gen:n.gen,synced:true});}
     else rkProfSet(pid,{status:sp2.status,gen:sp2.gen,synced:true});
     lsSet('sifirla_bekleyen',ls('sifirla_bekleyen',[]).filter(x=>x!==pid));
    }catch(e){
     if(/permission|NO_PROFILE/i.test(String(e&&(e.code||e.message||'')))){lsSet('sifirla_bekleyen',ls('sifirla_bekleyen',[]).filter(x=>x!==pid));}
    }
   }
  }finally{calisiyor=false;}
 }
 yerel();
 window.sifirlaBulut=bulut;
 window.addEventListener('online',bulut);
 setTimeout(bulut,2500);
 const prev=render;render=function(){const r=prev.apply(this,arguments);setTimeout(haber,350);return r;};
 setTimeout(()=>{try{haber();}catch(e){}},900);
})();
