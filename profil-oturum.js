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
 '<button type="button" class="btn pri" id="profileClose">Kapat</button></div>';
 const rename=document.getElementById('profileRename');
 if(rename)rename.onclick=function(){if(!profilDegistirilebilir())return;closeModal();adOpen(profiles().indexOf(st.prof),st.screen);};
 const change=document.getElementById('profileSwitch');
 if(change)change.onclick=function(){if(!profilDegistirilebilir())return;closeModal();go('profiles');};
 document.getElementById('profileClose').onclick=closeModal;
 document.getElementById('profileClose').focus();
}
