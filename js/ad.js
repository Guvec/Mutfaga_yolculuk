/* Oyun adı: öğrenci ad yazmaz, hazır karakterlerden seçer (Matematik Canavarı sürüm 46 mantığı).
   Profil adı = "🦊 Kurnaz Tilki" (doluysa " #482"). Karakteri ilk alan numarasız alır; rezervasyon Firestore nm/{karakter_no}.
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

/* Karakteri ayır: önce numarasız (ya da istenen numara), doluysa 3 basamaklı, o da doluysa 4 basamaklı. */
async function adClaim(e,want,self){
 const loc=profiles().filter(x=>x!==self),c=[want||0];
 for(let i=0;i<6;i++)c.push(adRnd(100,999));for(let i=0;i<6;i++)c.push(adRnd(1000,9999));
 const cand=c.filter((n,j)=>c.indexOf(n)===j&&loc.indexOf(adMake(e,n))<0);
 const off=()=>({e,n:want||cand.filter(n=>n>=1000)[0]||adRnd(1000,9999),c:false});
 if(!navigator.onLine)return off();
 try{
  const t=await adFb(),fb=t.sdk;
  for(const n of cand){
   try{await fb.setDoc(fb.doc(t.db,'nm',adKey(e,n)),{u:t.uid,t:Date.now()});return {e,n,c:true};}
   catch(er){if(!(er&&er.code==='permission-denied'))throw er;}
  }
  throw 0;
 }catch(x){return off();}
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
 const m=adMap();delete m[o];m[nw]=info;lsSet('ad_map',m);
 if(st.prof===o)st.prof=nw;
 if(typeof arkRenamed==='function')arkRenamed(o,nw);
}
/* Karakter listesinde bir ad değiştiyse (örn. Coşkulu Trompet → Huzurlu Civciv) kayıtlı profil adı yeni ada taşınır. Yalnız telefondaki kayıtlar; internet gerekmez. */
function adMigrate(){
 const map=adMap();
 profiles().slice().forEach(p=>{
  const m=map[p];if(!m||!AD_KAR[m.e])return;
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
   const m=adMap()[p],e=m?m.e:adRnd(0,AD_KAR.length-1),r=await adClaim(e,m?m.n:0,p);
   if(!r.c)break;
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
  ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="adAskT"><p style="font-size:60px;line-height:1.2;margin:0">'+adEmo(p)+'</p><p id="adAskT">Yeni oyun adın:<br><b style="font-size:22px">'+esc(adRest(p))+'</b><br>Beğendin mi?</p><div class="row"><button class="btn ghost" id="adAskN">✏️ Değiştir</button><button class="btn pri" id="adAskY">👍 Tamam</button></div></div>';
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
function adOpen(i,ret){
 const p=i>=0?profiles()[i]:null,m=p?adInfo(p):null,e=m?m.e:adRndKitchen();
 st.pe={i,e,cat:AD_KAR[e][2],ret:ret||'profiles',busy:false};go('pedit');adCheck();
}
function adGrid(){const P=st.pe;let h='';AD_KAR.forEach((x,j)=>{if(x[2]===P.cat)h+='<button type="button" class="'+(j===P.e?'on':'')+'" aria-pressed="'+(j===P.e)+'" data-e="'+j+'" onclick="adSet('+j+')"><span>'+x[0]+'</span>'+esc(x[1])+'</button>';});return h;}
function adTabs(){const P=st.pe;return adTabOrder().map(j=>{const c=AD_KAT[j],k=c.indexOf(' ');return '<button type="button" class="'+(j===P.cat?'on':'')+'" aria-pressed="'+(j===P.cat)+'" onclick="adCat('+j+')"><span>'+c.slice(0,k)+'</span>'+esc(c.slice(k+1))+'</button>';}).join('');}
function adCat(c){const P=st.pe;if(!P||P.busy)return;P.cat=c;const t=document.getElementById('pe-tab');if(t)t.innerHTML=adTabs();const g=document.getElementById('pe-em');if(g)g.innerHTML=adGrid();}
function adSet(v){
 const P=st.pe;if(!P||P.busy)return;P.e=v;
 const g=document.getElementById('pe-em');if(g)[].forEach.call(g.children,b=>{const on=+b.getAttribute('data-e')===v;b.className=on?'on':'';b.setAttribute('aria-pressed',String(on));});
 const pv=document.getElementById('pe-pv');if(pv)pv.innerHTML=adPrev();adCheck();
}
function adPrev(){const P=st.pe;return '<span class="ad-av" style="background:'+adCol(P.e)+'">'+AD_KAR[P.e][0]+'</span><span class="ad-pn">'+esc(AD_KAR[P.e][1])+'<small id="pe-st" role="status">'+adStTxt()+'</small></span>';}
function adStTxt(){
 const P=st.pe,p=P.i>=0?profiles()[P.i]:null,m=p?adInfo(p):null;
 if(m&&m.e===P.e)return 'Şu anki adın';
 if(P.free===undefined||P.fk!==P.e)return navigator.onLine?'Bakılıyor…':'İnternet yok: numara sonra verilir';
 return P.free?'✨ Bu karakter boş, numarasız senin olur':'Bu karakter alınmış, yanına numara eklenecek';
}
function adCheck(){
 const P=st.pe;if(!P)return;const k=P.e,mine=adMake(P.e,0);
 clearTimeout(P.tm);P.free=undefined;P.fk=k;
 const up=()=>{const e=document.getElementById('pe-st');if(e)e.textContent=adStTxt();};
 if(profiles().indexOf(mine)>=0&&profiles()[P.i]!==mine){P.free=false;up();return;}
 up();if(!navigator.onLine)return;
 P.tm=setTimeout(async()=>{
  try{const t=await adFb(),s=await t.sdk.getDoc(t.sdk.doc(t.db,'nm',adKey(P.e,0)));
   if(st.pe!==P||P.fk!==k)return;
   P.free=!s.exists()||(s.data().u===t.uid&&profiles().indexOf(mine)<0);up();
  }catch(e){}
 },350);
}
async function adSave(){
 const P=st.pe,b=document.getElementById('pe-go');if(!P||P.busy)return;
 const old=P.i>=0?profiles()[P.i]:null,om=old?adInfo(old):null;
 if(old&&om&&om.e===P.e){go(P.ret);return;}
 P.busy=true;if(b){b.disabled=true;b.textContent='⏳ Ad ayrılıyor…';}
 const r=await adClaim(P.e,0,old);P.busy=false;
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
 h+='<button class="btn pri" id="pe-go" onclick="adSave()">'+(ed?'💾 Kaydet':'✅ Profili Oluştur')+'</button>';
 h+='<p class="note">Adını hazır karakterlerden seçersin, yazmazsın. Bir karakteri ilk alan numarasız alır; daha önce başkası aldıysa yanına numara eklenir (örn. #482).</p></div>';
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
  document.querySelectorAll('.prof').forEach((row,i)=>{const del=row.querySelector('.del');if(del&&!row.querySelector('.ad-edit'))del.insertAdjacentHTML('beforebegin','<button class="del ad-edit" aria-label="Oyun adını değiştir" onclick="adOpen('+i+',\'profiles\')">✏️</button>');});
  setTimeout(adSync,0);
 }
 if(st.screen==='home'){setTimeout(adSync,0);if(st.prof)adAsk(st.prof);}
};
back=function(){if(st.screen==='pedit'){go(st.pe&&st.pe.ret==='home'?'home':'profiles');return;}AD_BACK();};
createProfile=function(){adOpen(-1,'profiles');};
window.addEventListener('online',()=>{adSync();});
