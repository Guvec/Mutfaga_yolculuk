/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Arkadaşlar (Matematik Canavarı sürüm 46 akışı). Oyuncu kodu (7 karakter) profile bağlıdır.
   Koleksiyonlar: yrKart/{kod} (ad kartı), yrKim/{uid} (bu cihazdaki aktif profil), yrDurum/{kod} (çevrim içi sinyali),
   yrFr/{a_b} (istek ve arkadaşlık), yrDav/{gönderen_alıcı_oda} (davet), yrEngel (engel; arayüzü sonra). Kurallar: ci/firebase/firestore.rules.
   Ad gerçek ad değildir (hazır karakter), bu yüzden kart ve çevrim içi bilgisi giriş yapanlara açıktır; liste yoktur. */
'use strict';
const FR={ready:false,busy:null,pid:null,prof:null,list:[],inc:[],out:[],nick:{},seen:{},unsub:[],beat:null,invs:[],invSeen:{},call:null,bn:0};
const FR_CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function frIds(){return ls('ark_id',{});}
function frRand(n){const b=crypto.getRandomValues(new Uint8Array(n));return Array.from(b,x=>FR_CH[x%FR_CH.length]).join('');}
function frKey(a,b){return a<b?a+'_'+b:b+'_'+a;}
function frOn(){return typeof yrConfigured==='function'&&yrConfigured()&&navigator.onLine;}
function frOnline(id){const t=FR.seen[id];return !!t&&Date.now()-t<150000;}
function frAgo(id){
 const t=FR.seen[id];if(!t)return 'henüz görülmedi';
 const m=Math.round((Date.now()-t)/60000);if(m<2)return 'az önce';if(m<60)return m+' dk önce';
 const h=Math.round(m/60);if(h<24)return h+' saat önce';return Math.round(h/24)+' gün önce';
}
/* Profil için kimliği hazırla (yoksa oluştur) ve bu cihazın aktif profili olarak işaretle. */
function frEnsure(){
 const p=st.prof;
 if(!p||st.guest||!frOn())return Promise.resolve(null);
 if(FR.ready&&FR.prof===p)return Promise.resolve(FR.pid);
 if(FR.busy)return FR.busy;
 FR.busy=(async()=>{
  const t=await adFb(),fb=t.sdk,all=frIds();let me=all[p]&&all[p].id||null;
  for(let tries=0;tries<5;tries++){
   const id=me||frRand(7);
   try{
    const b=fb.writeBatch(t.db);
    b.set(fb.doc(t.db,'yrKart',id),{owner:t.uid,nick:p});
    b.set(fb.doc(t.db,'yrKim',t.uid),{pid:id});
    await b.commit();
    all[p]={id};lsSet('ark_id',all);
    await fb.setDoc(fb.doc(t.db,'yrDurum',id),{seen:fb.serverTimestamp()}).catch(()=>{});
    if(st.prof!==p)return null;
    frStart(p,id);return id;
   }catch(e){
    if(e&&e.code==='permission-denied'){me=null;delete all[p];continue;}
    throw e;
   }
  }
  return null;
 })().catch(()=>null).finally(()=>{FR.busy=null;});
 return FR.busy;
}
function frStop(){
 FR.unsub.forEach(u=>{try{u();}catch(e){}});FR.unsub=[];
 if(FR.beat){clearInterval(FR.beat);FR.beat=null;}
 FR.pid=null;FR.prof=null;FR.list=[];FR.inc=[];FR.out=[];FR.ready=false;FR.invs=[];
}
async function frStart(p,id){
 frStop();FR.pid=id;FR.prof=p;FR.ready=true;
 try{
  const t=await adFb(),fb=t.sdk;if(FR.pid!==id)return;
  let A={},B={};
  const merge=()=>{
   const l=[],inc=[],out=[],all=Object.assign({},A,B);
   for(const k in all){const x=all[k],o=x.a===id?x.b:x.a;if(x.st==='ok')l.push(o);else if(x.by===id)out.push(o);else inc.push(o);}
   FR.list=l;FR.inc=inc;FR.out=out;frNicks(l.concat(inc,out));
  };
  FR.unsub.push(fb.onSnapshot(fb.query(fb.collection(t.db,'yrFr'),fb.where('a','==',id)),qs=>{A={};qs.forEach(d=>{A[d.id]=d.data();});merge();},()=>{}));
  FR.unsub.push(fb.onSnapshot(fb.query(fb.collection(t.db,'yrFr'),fb.where('b','==',id)),qs=>{B={};qs.forEach(d=>{B[d.id]=d.data();});merge();},()=>{}));
  FR.unsub.push(fb.onSnapshot(fb.query(fb.collection(t.db,'yrDav'),fb.where('to','==',id)),qs=>{FR.invs=qs.docs.map(d=>({id:d.id,...d.data()}));frInvCheck();},()=>{}));
  FR.beat=setInterval(frBeat,60000);
 }catch(e){}
 frUi();
}
function frBeat(){
 if(!FR.pid||document.hidden||!frOn())return;
 adFb().then(t=>t.sdk.setDoc(t.sdk.doc(t.db,'yrDurum',FR.pid),{seen:t.sdk.serverTimestamp()})).catch(()=>{});
 FR.bn++;
 if(st.screen==='friends'||(st.screen==='home'&&FR.bn%2===0))frNicks(FR.list.concat(FR.inc,FR.out));
}
/* Arkadaşların adı ve son görülmesi. Kart adı sık değişmez ama durum sık değişir. */
async function frNicks(ids){
 if(!ids.length)return frUi();
 try{
  const t=await adFb(),fb=t.sdk;
  await Promise.all(ids.map(async o=>{
   try{const k=await fb.getDoc(fb.doc(t.db,'yrKart',o));FR.nick[o]=k.exists()?k.data().nick:'(silinmiş profil)';}catch(e){}
   try{const s=await fb.getDoc(fb.doc(t.db,'yrDurum',o));if(s.exists()){const v=s.data().seen;FR.seen[o]=v&&v.toMillis?v.toMillis():+v;}}catch(e){}
  }));
 }catch(e){}
 frUi();
}
/* Oyun sonu: rakibi arkadaş ekle */
function frBtn(p,big){
 if(!p||!p.pid||!FR.ready||!st.prof||st.guest||p.pid===FR.pid||FR.list.indexOf(p.pid)>=0)return '';
 if(FR.out.indexOf(p.pid)>=0)return big?'<p class="sub center">⏳ '+esc(p.nick)+' kişisine arkadaşlık isteği gönderildi</p>':' <small>⏳</small>';
 if(FR.inc.indexOf(p.pid)>=0)return big?'<button class="btn ghost" onclick="frAccept(\''+p.pid+'\')">✓ '+esc(p.nick)+' arkadaşlık isteğini kabul et</button>':' <button class="mini" aria-label="İsteği kabul et" onclick="frAccept(\''+p.pid+'\')">✓</button>';
 return big?'<button class="btn ghost" onclick="frAddId(\''+p.pid+'\')">➕ '+esc(p.nick)+' arkadaş ekle</button>':' <button class="mini" aria-label="Arkadaş ekle" onclick="frAddId(\''+p.pid+'\')">➕</button>';
}
function frUi(){
 if(st.screen==='dover'||st.screen==='raceover'){render();return;}
 if(st.screen==='friends'){const e=document.getElementById('fr-body');if(e)e.innerHTML=frBody();}
 if(st.screen==='home'){const b=document.getElementById('fr-badge');if(b)b.textContent=FR.inc.length?' · '+FR.inc.length+' yeni istek':'';const lv=document.getElementById('fr-live');if(lv){const h=frLive();lv.innerHTML=h;lv.style.display=h?'':'none';}}
}
function frOpen(){FR.call=null;go('friends');if(st.prof)frEnsure().then(frUi);}
function frBody(){
 if(!st.prof||st.guest)return '<p class="sub center">Arkadaş eklemek için bir <b>profil</b> ile giriş yap. Misafirler arkadaş ekleyemez.</p>';
 if(!navigator.onLine)return '<p class="sub center">Arkadaşlar için internet gerekir.</p>';
 if(!frOn())return '<p class="sub center">Arkadaş bağlantısı henüz ayarlanmadı.</p>';
 if(!FR.ready)return '<p class="sub center">⏳ Hazırlanıyor…</p>';
 let h='<div class="card ark-box"><small>Senin oyuncu kodun</small><div class="ark-code">'+esc(FR.pid)+'</div><small>Bu kodu arkadaşına ver. O seni eklesin, sen kabul et.</small><div class="ark-btns"><button class="btn" onclick="frCopy()">📋 Kopyala</button><button class="btn ghost" onclick="frShare()">📤 Paylaş</button></div></div>';
 h+='<label for="fr-code">Arkadaşının kodu</label><input id="fr-code" class="inp" maxlength="9" autocapitalize="characters" autocomplete="off" placeholder="Arkadaşının kodu (ör. ABCDEFG)"><button class="btn pri" onclick="frAdd()">➕ Arkadaş Ekle</button>';
 if(FR.inc.length){h+='<h2>📩 Gelen istekler</h2>';FR.inc.forEach(o=>{h+='<div class="ark-row"><span>'+esc(FR.nick[o]||'…')+'</span><span><button class="mini" onclick="frAccept(\''+o+'\')">✓ Kabul</button> <button class="mini" aria-label="İsteği reddet" onclick="frDel(\''+o+'\',0)">✕</button></span></div>';});}
 h+='<h2>👫 Arkadaşların ('+FR.list.length+')</h2>';
 if(!FR.list.length)h+='<p class="sub center">Henüz arkadaşın yok. Arkadaşının kodunu yazıp ekle.</p>';
 FR.list.slice().sort((a,b)=>(frOnline(b)?1:0)-(frOnline(a)?1:0)||String(FR.nick[a]).localeCompare(String(FR.nick[b]),'tr')).forEach(o=>{
  const on=frOnline(o);
  h+='<div class="ark-row"><span>'+(on?'🟢':'⚪')+' <b>'+esc(FR.nick[o]||'…')+'</b><br><small>'+(on?'çevrim içi':'en son '+frAgo(o))+'</small></span><span><button class="mini" onclick="frCall(\''+o+'\')">⚔️ Çağır</button> <button class="mini" aria-label="Arkadaşlıktan çıkar" onclick="frDel(\''+o+'\',1)">🗑</button></span></div>';
 });
 if(FR.out.length){h+='<h2>⏳ Gönderdiğin istekler</h2>';FR.out.forEach(o=>{h+='<div class="ark-row"><span>'+esc(FR.nick[o]||'…')+'<br><small>kabul bekleniyor</small></span><span><button class="mini" onclick="frDel(\''+o+'\',0)">İptal</button></span></div>';});}
 return h;
}
function frScreenHTML(){return topBar('Arkadaşlarım')+'<div class="wrap" id="fr-body">'+frBody()+'</div>';}
function frCopy(){
 const c=FR.pid,done=()=>adToast('Kodun kopyalandı: '+c),old=()=>{
  const a=document.createElement('textarea');a.value=c;a.setAttribute('readonly','');a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();
  let ok=false;try{ok=document.execCommand('copy');}catch(e){}document.body.removeChild(a);adToast(ok?'Kodun kopyalandı: '+c:'Kopyalanamadı, kodu elle yaz: '+c);
 };
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(c).then(done,old);else old();
}
function frShare(){
 const t=FR.pid; /* yalnız kod: kolayca kopyalanıp yapıştırılsın */
 const cp=()=>{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>adToast('Kod kopyalandı: '+t),()=>adToast('Kodun: '+t));else adToast('Kodun: '+t);};
 /* Paylaşma penceresi kapatılırsa (AbortError) bir şey yapılmaz; başka bir hatada kod kopyalanır. */
 if(navigator.share)navigator.share({text:t}).catch(e=>{if(!e||e.name!=='AbortError')cp();});else cp();
}
function frAdd(){
 const e=document.getElementById('fr-code'),c=String(e?e.value:'').toUpperCase().replace(/[^A-Z0-9]/g,'');
 if(c.length!==7){adToast('Oyuncu kodu 7 harf/rakam olmalı');return;}
 frAddId(c,e);
}
async function frAddId(c,e){
 if(!FR.ready||!st.prof){adToast('Arkadaş eklemek için profil ile gir');return;}
 if(c===FR.pid){adToast('Bu senin kendi kodun');return;}
 if(FR.list.indexOf(c)>=0){adToast('Zaten arkadaşsınız');return;}
 if(FR.out.indexOf(c)>=0){adToast('İsteğin zaten gönderildi');return;}
 if(FR.inc.indexOf(c)>=0){frAccept(c);return;}
 try{
  const t=await adFb(),fb=t.sdk,s=await fb.getDoc(fb.doc(t.db,'yrKart',c));
  if(!s.exists()){adToast('Bu koda ait oyuncu bulunamadı');return;}
  const nk=s.data().nick,a=FR.pid<c?FR.pid:c,b=FR.pid<c?c:FR.pid;
  await fb.setDoc(fb.doc(t.db,'yrFr',frKey(FR.pid,c)),{a,b,by:FR.pid,st:'p',ts:fb.serverTimestamp()});
  FR.nick[c]=nk;if(FR.out.indexOf(c)<0)FR.out.push(c);adToast(nk+' kişisine istek gönderildi');if(e&&e.value!==undefined)e.value='';frUi();
 }catch(x){adToast('İstek gönderilemedi, tekrar dene');}
}
async function frAccept(o){
 try{const t=await adFb(),fb=t.sdk;await fb.updateDoc(fb.doc(t.db,'yrFr',frKey(FR.pid,o)),{st:'ok',ts:fb.serverTimestamp()});adToast('Artık arkadaşsınız 🎉');}
 catch(e){adToast('Kabul edilemedi, tekrar dene');}
}
function frDel(o,ask){
 const go2=async()=>{try{const t=await adFb();await t.sdk.deleteDoc(t.sdk.doc(t.db,'yrFr',frKey(FR.pid,o)));}catch(e){adToast('Silinemedi, tekrar dene');}};
 if(ask)modal('<b>'+esc(FR.nick[o]||'')+'</b> arkadaş listenden çıkarılsın mı?',()=>{closeModal();go2();});else go2();
}
/* Davet gönder: kapışma odası kur, sonra arkadaşa davet yaz. */
function frCall(o){FR.call={to:o,nick:FR.nick[o]||''};if(typeof yrCreateOpen==='function')yrCreateOpen('duel');}
/* Oda içinden arkadaş çağır: listeden dokunulan arkadaşa davet gider. */
const FR_SENT={};
function frLobbyHTML(){
 if(!st.prof||st.guest||!frOn()||!YR.room||YR.room.status!=='lobby')return '';
 const cap=YarisModel.LIMITS[YR.room.mode].max;if(YR.players.length>=cap)return '';
 let h='<div class="card ark-live"><div class="ark-lvh">👫 Arkadaşını çağır</div>';
 if(!FR.ready)return h+'<small>⏳ Arkadaşların yükleniyor…</small></div>';
 const l=FR.list.slice().sort((a,b)=>(frOnline(b)?1:0)-(frOnline(a)?1:0)).slice(0,6);
 if(!l.length)return h+'<div class="ark-row"><small>Henüz arkadaşın yok.</small><button class="mini" onclick="frOpen()">👫 Arkadaş ekle</button></div></div>';
 l.forEach(o=>{const k=YR.code+'_'+o;h+='<div class="ark-row"><span>'+(frOnline(o)?'🟢':'⚪')+' <b>'+esc(FR.nick[o]||'…')+'</b></span>'+(YR.players.some(p=>p.pid===o)?'<small>✓ Katıldı</small>':FR_SENT[k]?'<small>✓ Çağrıldı</small>':'<button class="mini" onclick="frInviteTo(\''+o+'\')">⚔️ Çağır</button>')+'</div>';});
 return h+'</div>';
}
async function frInviteTo(o){
 if(!YR.code)return;FR.call={to:o,nick:FR.nick[o]||''};
 if(await frInvSend())FR_SENT[YR.code+'_'+o]=1;if(st.screen==='racelobby')render();
}
async function frInvSend(){
 const c=FR.call;if(!c||!FR.pid||!YR.room||!YR.code)return;FR.call=null;
 try{
  const t=await adFb(),fb=t.sdk,r=YR.room,sub=(typeof YR_SUBJECTS!=='undefined'&&(YR_SUBJECTS.find(x=>x.id===r.subject)||{}).name)||r.subject;
  await fb.setDoc(fb.doc(t.db,'yrDav',FR.pid+'_'+c.to+'_'+YR.code),{from:FR.pid,to:c.to,nick:YR.nick,code:YR.code,rid:r.created,subject:String(sub).slice(0,30),mode:r.mode,ts:fb.serverTimestamp()});
  adToast((c.nick||'Arkadaşın')+' davet edildi');return true;
 }catch(e){adToast('Davet gönderilemedi');return false;}
}
/* Gelen davet: oyun sırasında rahatsız etme; menüye dönünce göster. */
const FR_SAFE=['home','racemenu','profiles','friends','siralama','rekor'];
function frInvCheck(){
 if(!st.prof||st.guest||st.modalOpen||YR.active||FR_SAFE.indexOf(st.screen)<0)return;
 const now=Date.now();
 const v=FR.invs.map(x=>({...x,ms:x.ts&&x.ts.toMillis?x.ts.toMillis():0})).filter(x=>x.ms&&now-x.ms<600000&&!FR.invSeen[x.id]).sort((a,b)=>b.ms-a.ms)[0];
 if(!v)return;
 FR.invSeen[v.id]=1;
 st.modalOpen=true;pauseT();const ov=document.getElementById('ov');ov.className='on';
 ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="frInvT"><p id="frInvT">⚔️ <b>'+esc(v.nick)+'</b> seni '+(v.mode==='duel'?'kapışmaya':v.mode==='arena'?'Er Meydanı’na':'oyun odasına')+' çağırıyor!<br><small>'+esc(v.subject)+'</small></p><div class="row"><button class="btn ghost" id="frInvN">Şimdi değil</button><button class="btn pri" id="frInvY">Kabul et</button></div></div>';
 const del=()=>adFb().then(t=>t.sdk.deleteDoc(t.sdk.doc(t.db,'yrDav',v.id))).catch(()=>{});
 document.getElementById('frInvY').onclick=()=>{closeModal();del();frJoinCode(v.code);};
 document.getElementById('frInvN').onclick=()=>{closeModal();del();};
 document.getElementById('frInvY').focus();
}
function frJoinCode(code){YR.codeDraft=code;st.screen='racemenu';render();yrJoin(code);}
/* Ev ekranı: çevrim içi arkadaşlar */
function frLive(){
 if(!st.prof||st.guest||!navigator.onLine||!frOn())return '';
 let h='<div class="ark-lvh">🟢 Şu an oyunda</div>';
 if(!FR.ready)return h+'<small>⏳ Arkadaşların yükleniyor…</small>';
 const on=FR.list.filter(frOnline);
 if(!on.length)return h+'<div class="ark-row"><small>Şu an çevrim içi arkadaşın yok.</small><button class="mini" onclick="frOpen()">👫 Arkadaşlarım</button></div>';
 on.slice(0,5).forEach(o=>{h+='<div class="ark-row"><span>🟢 <b>'+esc(FR.nick[o]||'…')+'</b></span><button class="mini" onclick="frCall(\''+o+'\')">⚔️ Çağır</button></div>';});
 if(on.length>5)h+='<small>+'+(on.length-5)+' kişi daha · <a href="#" onclick="frOpen();return false">tümü</a></small>';
 return h;
}
/* Profil silinince ya da yeniden adlandırılınca */
function arkRenamed(o,nw){
 const all=frIds();if(all[o]){all[nw]=all[o];delete all[o];lsSet('ark_id',all);}
 if(FR.prof===o){FR.prof=nw;if(FR.pid&&frOn())adFb().then(t=>t.sdk.setDoc(t.sdk.doc(t.db,'yrKart',FR.pid),{owner:t.uid,nick:nw})).catch(()=>{});}
}
async function arkWipe(p){
 const all=frIds(),me=all[p];if(!me)return;
 delete all[p];lsSet('ark_id',all);
 const q=ls('ark_wipe',[]);if(q.indexOf(me.id)<0){q.push(me.id);lsSet('ark_wipe',q);}
 if(FR.pid===me.id)frStop();
 await arkWipeRun();
}
let ARK_WIPING=false;
async function arkWipeRun(){
 if(ARK_WIPING||!frOn()||!ls('ark_wipe',[]).length)return;ARK_WIPING=true;
 try{
  const t=await adFb(),fb=t.sdk;
  for(const id of ls('ark_wipe',[]).slice()){
   try{
    await fb.setDoc(fb.doc(t.db,'yrKim',t.uid),{pid:id});
    for(const f of ['a','b']){const qs=await fb.getDocs(fb.query(fb.collection(t.db,'yrFr'),fb.where(f,'==',id)));for(const d of qs.docs)await fb.deleteDoc(d.ref);}
    const dv=await fb.getDocs(fb.query(fb.collection(t.db,'yrDav'),fb.where('from','==',id)));for(const d of dv.docs)await fb.deleteDoc(d.ref);
    await fb.deleteDoc(fb.doc(t.db,'yrDurum',id));await fb.deleteDoc(fb.doc(t.db,'yrKart',id));
    lsSet('ark_wipe',ls('ark_wipe',[]).filter(x=>x!==id));
   }catch(e){}
  }
  await fb.deleteDoc(fb.doc(t.db,'yrKim',t.uid)).catch(()=>{});
 }catch(e){}
 ARK_WIPING=false;FR.ready=false;if(st.prof&&!st.guest)frEnsure();
}
/* Ekran bağlantıları */
const FR_RENDER=render,FR_BACK=back,FR_PICK=pickProfile,FR_GUEST=guest;
render=function(){
 if(st.screen==='friends'){document.getElementById('app').innerHTML=frScreenHTML();return;}
 FR_RENDER();
 if(st.screen==='home'||st.screen==='racemenu'){
  if(st.screen==='home'){
   FR.call=null;
   const app=document.getElementById('app'),act=app&&app.querySelector('.design-race-actions');
   if(act&&st.prof&&!st.guest&&frOn()&&!act.querySelector('[data-ark]')){
    act.innerHTML='<button type="button" class="btn pri" data-ark="1" onclick="frOpen()">👫 Arkadaşlarım<span id="fr-badge">'+(FR.inc.length?' · '+FR.inc.length+' yeni istek':'')+'</span></button><button type="button" class="btn design-outline" onclick="tasarimOda(\'create\')">Oyun kur</button>';
    const sec=app.querySelector('.design-race');if(sec&&!document.getElementById('fr-live')){const h=frLive();sec.insertAdjacentHTML('beforebegin','<div class="card ark-live" id="fr-live"'+(h?'':' style="display:none"')+'>'+h+'</div>');}
    frEnsure().then(()=>{});
   }
   /* Profilsiz ya da misafir: arkadaş bölümü neden yok, nasıl açılır? */
   if(app&&(!st.prof||st.guest)&&frOn()&&!document.getElementById('fr-info')){
    const sec2=app.querySelector('.design-race');
    if(sec2)sec2.insertAdjacentHTML('beforebegin','<div class="card ark-live" id="fr-info"><div class="ark-lvh">👫 Arkadaşlarla oynamak ister misin?</div><p class="sub">Arkadaş eklemek ve kimin çevrim içi olduğunu görmek için bir oyun adın olmalı. Misafir olarak arkadaş eklenemez.</p><button type="button" class="btn pri" onclick="adAuto()">Oyun adı al</button></div>');
   }
  }
  setTimeout(frInvCheck,300);
 }
};
back=function(){if(st.screen==='friends'){go('home');return;}FR_BACK();};
pickProfile=function(n){FR_PICK(n);setTimeout(frEnsure,50);};
guest=function(){frStop();FR_GUEST();};
window.addEventListener('online',()=>{frEnsure();arkWipeRun();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){frBeat();frInvCheck();}});
