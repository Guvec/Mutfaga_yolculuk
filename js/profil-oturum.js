/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Profil yönetimi yalnız öğrencinin sağ üstteki adına dokunmasıyla açılır. */
'use strict';
/* Profil seçme ekranı atlandığında da mevcut ad/kayıt uyarlaması çalışır. */
adMigrate();
function profilDugme(){
 const name=st.guest?'Misafir':st.prof;
 return name?'<button type="button" class="profile-self" onclick="profilAyrintiAc()" aria-label="'+esc(name)+'. Profil ayrıntılarını aç">'+esc(name)+'</button>':'';
}
function profilDegistirilebilir(){
 return !(typeof YR!=='undefined'&&YR.active)&&!['board','quiz','game','racecount','raceplay','dintro','dplay','aintro','aplay','cvplay','haftaplay'].includes(st.screen);
}
function profilAyrintiAc(){
 if(st.modalOpen||(!st.prof&&!st.guest))return;
 const name=st.guest?'Misafir':st.prof;
 const can=profilDegistirilebilir(),index=profiles().indexOf(st.prof);
 modalFocus=document.activeElement;st.modalOpen=true;pauseT();
 const ov=document.getElementById('ov');ov.className='on';
 ov.innerHTML='<div class="modal profile-detail" role="dialog" aria-modal="true" aria-labelledby="profileTitle"><h2 id="profileTitle">'+esc(name)+'</h2><p>'+(st.guest?'Misafir oturumunda sonuçlar kaydedilmez.':'Bu cihazda bu profille devam edersin.')+'</p>'+
 (!can?'<p>Profilini değiştirmek için önce çalışmayı veya odayı bitir.</p>':
 (!st.guest&&index>=0&&!adSabit(st.prof)?'<button type="button" class="btn" id="profileRename">Karakterini değiştir (1 kez)</button>':'')+
 '<button type="button" class="btn" id="profileSwitch">Bu cihazdaki profiller</button>')+
 (st.guest?'':'<details class="gizlilik"><summary>Gizlilik</summary><p>Bu cihazda profil adın, puanların, rütben ve çalışma geçmişin saklanır.</p><p>İnternet varsa sıralama ve arkadaşlar için oyun adın, puanların ve arkadaş kayıtların sunucuda da tutulur.</p><p>Gerçek adın, telefon numaran veya fotoğrafın istenmez.</p><p>Aşağıdaki düğme bu profili ve bütün kayıtlarını siler.</p></details>'+(can?'<button type="button" class="btn danger" id="profileWipe">Verilerimi sil</button>':''))+
 '<button type="button" class="btn pri" id="profileClose">Kapat</button></div>';
 const wipe=document.getElementById('profileWipe');
 if(wipe)wipe.onclick=function(){if(!profilDegistirilebilir())return;const n=st.prof;closeModal();askDelProfile(n);};
 const rename=document.getElementById('profileRename');
 if(rename)rename.onclick=function(){if(!profilDegistirilebilir())return;closeModal();adOpen(profiles().indexOf(st.prof),st.screen);};
 const change=document.getElementById('profileSwitch');
 if(change)change.onclick=function(){if(!profilDegistirilebilir())return;closeModal();go('profiles');};
 document.getElementById('profileClose').onclick=closeModal;
 document.getElementById('profileClose').focus();
}

/* Profil silinince, kimliğe bağlı yerel kayıtlar da kaldırılır (rütbe, ödül, ilerleme, haftalık, rekor ayarları). */
const PS_PID={};
const PS_ASK=askDelProfile;
askDelProfile=function(n){try{PS_PID[n]=rkPid(n);}catch(e){}return PS_ASK(n);};
const PS_SILINDI=profilSilindi;
profilSilindi=function(n){
 const pid=PS_PID[n];delete PS_PID[n];
 ['rutbe','odul','rk_best','rk_win','rk_pek','rk_oyun','rk_setting','arena_devam','arena_odul','arena_pek','haftalik','yol_ma','yol_bh','yol_tk_ma','yol_tk_bh','rk_clean'].forEach(k=>{
  try{const a=ls(k,null);if(a&&typeof a==='object'&&!Array.isArray(a)){let ch=false;[pid,n].forEach(x=>{if(x&&x in a){delete a[x];ch=true;}});if(ch)lsSet(k,a);}}catch(e){}
 });
 try{lsSet('ana_son_konu_'+n,null);}catch(e){}
 PS_SILINDI(n);
 if(typeof adSync==='function')setTimeout(adSync,600);
};
