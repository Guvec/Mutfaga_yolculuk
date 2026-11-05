/* Oyun adı: öğrenci ad yazmaz, hazır karakterlerden seçer (Matematik Canavarı sürüm 46 mantığı).
   Profil adı = "🦊 Kurnaz Tilki". Her karakter yalnız bir kişiye aittir (numara eklenmez); rezervasyon Firestore nm/{karakter_no}_0. Eski numaralı kayıtlar (#482) geçerli kalır.
   Yerel kayıt: ad_map {profil: {e: karakter sırası, n: numara, c: bulutta ayrıldı mı}}. İnternet yoksa numara sonra verilir. */
'use strict';
const AD_RENK=['#7048e8','#ec4899','#10b981','#f59e0b','#3b82f6','#ef4444','#14b8a6','#f97316'];
const AD_STATE={busy:false};
function adMake(e,n){return AD_KAR[e][0]+' '+AD_KAR[e][1]+(n?' #'+n:'');}
function adMap(){return ls('ad_map',{});}
function adInfo(p){const m=adMap()[p];return m&&AD_KAR[m.e]?m:null;}
function adEmo(p){const m=adInfo(p);return m?AD_KAR[m.e][0]:'🙂';}
function adRest(p){const m=adInfo(p);return m?AD_KAR[m.e][1]+(m.n?' #'+m.n:''):p;}
function adCol(e){return AD_RENK[e%AD_RENK.length];}
function adKey(e,n){return e+'_'+n;}
function adRnd(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function adToast(m){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t);}t.textContent=m;t.style.opacity=1;clearTimeout(adToast.t);adToast.t=setTimeout(()=>{t.style.opacity=0;},2600);}
async function adFb(){const t=yrService();await t.connect();return t;}

/* Karakteri ayır: yalnız numarasız (eski numaralı kayıt için istenen numara). Başkasındaysa null döner. İnternet yoksa sonra doğrulanır. */
async function adClaim(e,want,self){
 const w=want||0;
 if(profiles().filter(x=>x!==self).indexOf(adMake(e,w))>=0)return null;
 if(!navigator.onLine)return {e,n:w,c:false};
 try{
  const t=await adFb(),fb=t.sdk;
  try{await fb.setDoc(fb.doc(t.db,'nm',adKey(e,w)),{u:t.uid,t:Date.now()});return {e,n:w,c:true};}
  catch(er){if(er&&er.code==='permission-denied')return null;throw er;}
 }catch(x){return {e,n:w,c:false};}
}
function adKaristir(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=adRnd(0,i);const t=a[i];a[i]=a[j];a[j]=t;}return a;}
/* Boş bir karakter bul: önce mutfak karakterleri, sonra havuzun geri kalanı. Hepsi doluysa null. */
async function adClaimAny(self){
 const mut=[],dig=[];AD_KAR.forEach((x,j)=>{(x[2]===adKitchen()?mut:dig).push(j);});
 for(const e of adKaristir(mut).concat(adKaristir(dig).slice(0,60))){const r=await adClaim(e,0,self);if(r)return r;}
 return null;
}
async function adRelease(m){
 if(!m||!m.c||!navigator.onLine)return;
 try{const t=await adFb();await t.sdk.deleteDoc(t.sdk.doc(t.db,'nm',adKey(m.e,m.n)));}catch(e){}
}
/* Profili yeniden adlandır: telefondaki kayıtlar yeni ada taşınır. Gerçek adlı eski profilde bulut rekor satırları silinir (gerçek ad bulutta kalmasın). */
function adRename(o,nw,info){
 const l=profiles(),i=l.indexOf(o);if(i<0)return;
 l[i]=nw;lsSet('profiles',l);
 const rc=records();let ch=false;rc.forEach(r=>{if(r&&r.p===o){r.p=nw;ch=true;}});if(ch)lsSet('records',rc);
 const wasChar=!!adInfo(o);
 if(typeof rkIds==='function'){
  if(wasChar){const ids=rkIds();if(ids[o]){ids[nw]=ids[o];delete ids[o];lsSet('rk_ids',ids);}}
  else if(typeof rkForgetProfile==='function')rkForgetProfile(o);
 }
 {const od=ls('odul',{});if(od[o]){od[nw]=od[o];delete od[o];lsSet('odul',od);}}
 const m=adMap();delete m[o];m[nw]=info;lsSet('ad_map',m);
 if(st.prof===o)st.prof=nw;
 if(typeof arkRenamed==='function')arkRenamed(o,nw);
}
/* Karakter listesinde bir ad değiştiyse (örn. Coşkulu Trompet → Huzurlu Civciv) kayıtlı profil adı yeni ada taşınır. Yalnız telefondaki kayıtlar; internet gerekmez. */
function adMigrate(){
 const map=adMap();
 profiles().slice().forEach(p=>{
  let m=map[p];if(!m||!AD_KAR[m.e]){const e=adRndKitchen();let n=adRnd(1000,9999);while(profiles().includes(adMake(e,n)))n=adRnd(1000,9999);m={e,n,c:false};adRename(p,adMake(e,n),m);return;}
  const nw=adMake(m.e,m.n);
  if(nw!==p&&profiles().indexOf(nw)<0)adRename(p,nw,m);
 });
}
/* Açılışta: gerçek adlı eski profillere karakter ver; silinmiş profillerin rezervasyonunu bırak. İnternet gerekir. */
async function adSync(){
 if(AD_STATE.busy||!navigator.onLine)return;AD_STATE.busy=true;let changed=false;
 try{
  const map=adMap(),profs=profiles();
  for(const k of Object.keys(map)){if(profs.indexOf(k)<0){const m=map[k];delete map[k];lsSet('ad_map',map);changed=true;await adRelease(m);if(typeof arkWipe==='function')await arkWipe(k);}}
  const todo=profiles().filter(p=>{const m=adMap()[p];return !m||!m.c;});
  for(const p of todo){
   if(profiles().indexOf(p)<0)continue;
   const m=adMap()[p],e=m?m.e:adRndKitchen();
   let r=await adClaim(e,m?m.n:0,p);if(r===null)r=await adClaimAny(p);
   if(!r||!r.c)break;
   if(m&&m.d)r.d=1;
   const nw=adMake(r.e,r.n);
   if(nw===p){const x=adMap();x[p]=r;lsSet('ad_map',x);continue;}
   adRename(p,nw,r);changed=true;
   const q=ls('ad_yeni',[]).filter(x=>x!==p&&x!==nw);q.push(nw);lsSet('ad_yeni',q);
   if(st.prof===nw&&st.screen==='home'){render();adAsk(nw);}
  }
 }catch(e){}
 AD_STATE.busy=false;if(changed&&st.screen==='profiles')render();
}
function adAsk(p){
 if(ls('ad_yeni',[]).indexOf(p)<0)return;
 setTimeout(()=>{
  if(st.prof!==p||st.modalOpen||st.screen!=='home')return;
  st.modalOpen=true;pauseT();const ov=document.getElementById('ov');ov.className='on';
  ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="adAskT"><p style="font-size:60px;line-height:1.2;margin:0">'+adEmo(p)+'</p><p id="adAskT">Yeni oyun adın:<br><b style="font-size:22px">'+esc(adRest(p))+'</b><br>Beğendin mi?<br><small>Beğenmezsen bir kez değiştirebilirsin.</small></p><div class="row"><button class="btn ghost" id="adAskN">✏️ Değiştir</button><button class="btn pri" id="adAskY">👍 Tamam</button></div></div>';
  document.getElementById('adAskY').onclick=()=>{adDone(p);closeModal();};
  document.getElementById('adAskN').onclick=()=>{adDone(p);closeModal();adOpen(profiles().indexOf(p),'home');};
  document.getElementById('adAskY').focus();
 },450);
}
function adDone(p){lsSet('ad_yeni',ls('ad_yeni',[]).filter(x=>x!==p));}

/* Profil oluşturma / düzenleme ekranı: kategori sekmeleri + karakter kartları */
/* Mutfak kategorisi (listenin son kategorisi) sekmelerde ilk sırada görünür; karakter sırası ve kayıtlı adlar değişmez. */
function adKitchen(){return AD_KAT.length-1;}
function adTabOrder(){const k=adKitchen(),o=[k];for(let j=0;j<AD_KAT.length;j++)if(j!==k)o.push(j);return o;}
/* Yeni profilde rastgele bir mutfak karakteri seçili açılır. */
function adRndKitchen(){const k=adKitchen(),l=[];AD_KAR.forEach((x,j)=>{if(x[2]===k)l.push(j);});return l.length?l[adRnd(0,l.length-1)]:adRnd(0,AD_KAR.length-1);}
/* İlk giriş ve yeni profil: ad kendiliğinden (rastgele mutfak karakteri) verilir, "Beğendin mi?" penceresi çıkar. */
async function adAuto(){
 if(AD_STATE.auto)return;AD_STATE.auto=true;
 try{
  const r=(await adClaimAny(null))||{e:adRndKitchen(),n:0,c:false},nw=adMake(r.e,r.n),l=profiles();
  if(l.indexOf(nw)<0){l.push(nw);if(!lsSet('profiles',l)){adToast('Kayıt yapılamadı: tarayıcı depolaması kapalı olabilir');return;}}
  const x=adMap();x[nw]=r;lsSet('ad_map',x);
  const q=ls('ad_yeni',[]).filter(v=>v!==nw);q.push(nw);lsSet('ad_yeni',q);
  pickProfile(nw);adAsk(nw);
 }finally{AD_STATE.auto=false;}
}
/* Oyun adı bir kez değiştirilebilir: değiştirilince bilgide d=1 olur ve ad sabit kalır (telefondaki kayıt; sunucu denetimi ayrı adım). */
function adSabit(p){const m=adInfo(p);return !!(m&&m.d);}
function adBase(e){const k=AD_KAR[e];return k&&k[3]!==undefined?k[3]:e;}
function adOpen(i,ret){
 if(i>=0&&adSabit(profiles()[i])){adToast('Oyun adın sabit: değiştirme hakkını kullandın.');return;}
 const p=i>=0?profiles()[i]:null,m=p?adInfo(p):null,e=m?m.e:adRndKitchen();
 st.pe={i,e,b:adBase(e),cat:AD_KAR[e][2],ret:ret||'profiles',busy:false,av:{}};go('pedit');adCheck();
}
function adGrid(){const P=st.pe;let h='';AD_KAR.forEach((x,j)=>{if(j<AD_BASE&&x[2]===P.cat)h+='<button type="button" class="'+(j===P.b?'on':'')+'" aria-pressed="'+(j===P.b)+'" data-e="'+j+'" onclick="adSet('+j+')"><span>'+x[0]+'</span>'+esc(x[1])+'</button>';});return h;}
function adTabs(){const P=st.pe;return adTabOrder().map(j=>{const c=AD_KAT[j],k=c.indexOf(' ');return '<button type="button" class="'+(j===P.cat?'on':'')+'" aria-pressed="'+(j===P.cat)+'" onclick="adCat('+j+')"><span>'+c.slice(0,k)+'</span>'+esc(c.slice(k+1))+'</button>';}).join('');}
function adCat(c){const P=st.pe;if(!P||P.busy)return;P.cat=c;const t=document.getElementById('pe-tab');if(t)t.innerHTML=adTabs();const g=document.getElementById('pe-em');if(g)g.innerHTML=adGrid();}
/* Seçilen figürün adları (sıfatlar): alınmış olanlar kapalı gösterilir. */
function adFigur(b){return [b].concat(AD_VAR[b]||[]);}
function adAdlar(){
 const P=st.pe,own=P.i>=0?adInfo(profiles()[P.i]):null;
 return adFigur(P.b).map(j=>{const al=P.av[j]===false&&!(own&&own.e===j),on=j===P.e;
  return '<button type="button" class="'+(on?'on':'')+'" aria-pressed="'+on+'" data-e="'+j+'"'+(al?' disabled':'')+' onclick="adPick('+j+')">'+esc(AD_KAR[j][1])+(al?'<small>Alınmış</small>':'')+'</button>';}).join('');
}
function adYenile(){
 const P=st.pe;if(!P)return;
 const a=document.getElementById('pe-ad');if(a)a.innerHTML=adAdlar();
 const pv=document.getElementById('pe-pv');if(pv)pv.innerHTML=adPrev();
}
function adSet(v){
 const P=st.pe;if(!P||P.busy)return;P.b=v;P.e=v;
 const own=P.i>=0?adInfo(profiles()[P.i]):null;
 if(own&&adBase(own.e)===v)P.e=own.e;
 const g=document.getElementById('pe-em');if(g)[].forEach.call(g.children,b=>{const on=+b.getAttribute('data-e')===v;b.className=on?'on':'';b.setAttribute('aria-pressed',String(on));});
 adYenile();adCheck();
}
function adPick(e){const P=st.pe;if(!P||P.busy)return;P.e=e;adYenile();}
function adPrev(){const P=st.pe;return '<span class="ad-av" style="background:'+adCol(P.e)+'">'+AD_KAR[P.e][0]+'</span><span class="ad-pn">'+esc(AD_KAR[P.e][1])+'<small id="pe-st" role="status">'+adStTxt()+'</small></span>';}
function adStTxt(){
 const P=st.pe,p=P.i>=0?profiles()[P.i]:null,m=p?adInfo(p):null;
 if(m&&m.e===P.e)return 'Şu anki adın';
 const a=P.av[P.e];
 if(a===undefined)return navigator.onLine?'Bakılıyor…':'İnternet yok: ad sonra doğrulanır';
 return a?'✨ Bu ad boş, yalnız senin olur':'Bu ad alınmış, başka birini seç';
}
/* Figürün tüm adlarının boş olup olmadığına bakar (en çok 8 okuma). */
function adCheck(){
 const P=st.pe;if(!P)return;const b=P.b,self=P.i>=0?profiles()[P.i]:null;
 clearTimeout(P.tm);
 const loc=profiles().filter(x=>x!==self);
 adFigur(b).forEach(j=>{if(loc.indexOf(adMake(j,0))>=0)P.av[j]=false;});
 adYenile();if(!navigator.onLine)return;
 P.tm=setTimeout(async()=>{
  try{const t=await adFb(),sd=t.sdk;
   await Promise.all(adFigur(b).map(async j=>{
    if(P.av[j]===false&&loc.indexOf(adMake(j,0))>=0)return;
    const s=await sd.getDoc(sd.doc(t.db,'nm',adKey(j,0)));
    P.av[j]=!s.exists()||(s.data().u===t.uid&&loc.indexOf(adMake(j,0))<0);
   }));
   if(st.pe!==P||P.b!==b)return;adYenile();
  }catch(e){}
 },250);
}
async function adSave(){
 const P=st.pe,b=document.getElementById('pe-go');if(!P||P.busy)return;
 const old=P.i>=0?profiles()[P.i]:null,om=old?adInfo(old):null;
 if(old&&om&&om.e===P.e){go(P.ret);return;}
 if(P.av[P.e]===false){adToast('Bu ad alınmış. Başka birini seç.');return;}
 P.busy=true;if(b){b.disabled=true;b.textContent='⏳ Ad ayrılıyor…';}
 const r=await adClaim(P.e,0,old);P.busy=false;
 if(!r){P.av[P.e]=false;if(b){b.disabled=false;b.textContent=old?'💾 Kaydet':'✅ Profili Oluştur';}adYenile();adToast('Bu ad az önce başkası tarafından alındı. Başka birini seç.');return;}
 if(old)r.d=1;/* değiştirme hakkı kullanıldı: ad artık sabit */
 const nw=adMake(r.e,r.n);
 if(old){adRename(old,nw,r);adRelease(om);adDone(old);adToast('Yeni adın: '+nw);go(P.ret);}
 else{
  const l=profiles();l.push(nw);
  if(!lsSet('profiles',l)){adToast('Kayıt yapılamadı: tarayıcı depolaması kapalı olabilir');return;}
  const x=adMap();x[nw]=r;lsSet('ad_map',x);
  pickProfile(nw);adToast('Hoş geldin, '+nw);
 }
}
function adEditHTML(){
 const P=st.pe,ed=P.i>=0;
 let h=topBar(ed?'✏️ Profili Düzenle':'➕ Yeni Profil')+'<div class="wrap"><div class="card ad-prev" id="pe-pv">'+adPrev()+'</div>';
 h+='<h2>Karakterini seç</h2><div class="ad-tab" id="pe-tab">'+adTabs()+'</div><div class="ad-grid" id="pe-em">'+adGrid()+'</div>';
 h+='<h2>Adını seç</h2><div class="ad-grid ad-adlar" id="pe-ad">'+adAdlar()+'</div>';
 h+='<button class="btn pri" id="pe-go" onclick="adSave()">'+(ed?'💾 Kaydet':'✅ Profili Oluştur')+'</button>';
 h+='<p class="note">'+(ed?'<b>Adını bir kez değiştirebilirsin.</b> Değiştirince ad sabit kalır. ':'')+'Adını hazır listeden seçersin, yazmazsın. Her ad yalnız bir kişiye aittir; alınmış adlar seçilemez.</p></div>';
 return h;
}
/* Ekran bağlantıları */
const AD_RENDER=render,AD_BACK=back,AD_CREATE=createProfile;
render=function(){
 if(st.screen==='pedit'&&st.pe){document.getElementById('app').innerHTML=adEditHTML();return;}
 adMigrate();
 AD_RENDER();
 if(st.screen==='profiles'){
  const inp=document.getElementById('pname');
  if(inp){const card=inp.closest('.card');if(card)card.innerHTML='<b>Yeni profil</b><p class="note" style="margin:4px 0 10px">Adını yazmazsın; hazır karakterlerden birini seçersin.</p><button class="btn pri" onclick="adOpen(-1,\'profiles\')">➕ Yeni profil</button>';}
  document.querySelectorAll('.prof').forEach((row,i)=>{const del=row.querySelector('.del');if(!del||row.querySelector('.ad-edit,.ad-lock'))return;
   if(adSabit(profiles()[i]))del.insertAdjacentHTML('beforebegin','<span class="ad-lock" role="img" aria-label="Oyun adı sabit">🔒</span>');
   else del.insertAdjacentHTML('beforebegin','<button class="del ad-edit" aria-label="Oyun adını bir kez değiştir" onclick="adOpen('+i+',\'profiles\')">✏️</button>');});
  setTimeout(adSync,0);
 }
 if(st.screen==='home'){setTimeout(adSync,0);if(st.prof)adAsk(st.prof);}
 if(st.screen==='home'||st.screen==='profiles'){const app=document.getElementById('app');if(app&&!app.querySelector('.ad-paylas'))app.insertAdjacentHTML('beforeend','<div class="voice-tools ad-paylas"><button type="button" class="btn sm" onclick="uygulamaPaylas()">📤 Uygulamayı paylaş</button></div>');}
};
back=function(){if(st.screen==='pedit'){go(st.pe&&st.pe.ret==='home'?'home':'profiles');return;}AD_BACK();};
createProfile=function(){adOpen(-1,'profiles');};
window.addEventListener('online',()=>{adSync();});

/* Uygulamayı paylaş: telefonun paylaşma menüsü; yoksa bağlantı kopyalanır. */
async function uygulamaPaylas(){
 const url=location.origin+location.pathname,data={title:'İşin Mutfağına Yolculuk',text:'Mutfak bilgisini oyunla öğreniyoruz. Sen de dene:',url};
 try{if(navigator.share){await navigator.share(data);return;}}catch(e){if(e&&e.name==='AbortError')return;}
 try{await navigator.clipboard.writeText(url);adToast('Bağlantı kopyalandı.');}catch(e){adToast(url);}
}
