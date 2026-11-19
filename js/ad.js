/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Oyun adı: öğrenci ad yazmaz, hazır karakterlerden seçer (Matematik Canavarı sürüm 46 mantığı).
   Profil adı = "🦊 Kurnaz Tilki". Her karakter yalnız bir kişiye aittir (numara eklenmez); rezervasyon Firestore nm/{karakter_no}_0. Eski numaralı kayıtlar (#482) geçerli kalır.
   Yerel kayıt: ad_map {profil: {e: karakter sırası, n: numara, c: bulutta ayrıldı mı}}. İnternet yoksa numara sonra verilir. */
'use strict';
const AD_RENK=['#7048e8','#ec4899','#10b981','#f59e0b','#3b82f6','#ef4444','#14b8a6','#f97316'];
const AD_STATE={busy:false};
const AD_KOTA=10;
function adMake(e,n){return AD_KAR[e][0]+' '+AD_KAR[e][1]+(n?' #'+n:'');}
function adMap(){return ls('ad_map',{});}
function adSifirlamaAdlari(){
 const adlar=ls('app_reset_adlar',[]);
 return Array.isArray(adlar)?adlar:[];
}
function adSifirlamaAdiniKullan(ad){
 const adlar=adSifirlamaAdlari();
 if(adlar.includes(ad))lsSet('app_reset_adlar',adlar.filter(a=>a!==ad));
}
function adInfo(p){const m=adMap()[p];return m&&AD_KAR[m.e]?m:null;}
function adEmo(p){const m=adInfo(p);return m?AD_KAR[m.e][0]:'🙂';}
function adRest(p){const m=adInfo(p);return m?AD_KAR[m.e][1]+(m.n?' #'+m.n:''):p;}
function adCol(e){return AD_RENK[e%AD_RENK.length];}
function adKey(e,n){return e+'_'+n;}
function adRnd(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function adToast(m){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t);}t.textContent=m;t.style.opacity=1;clearTimeout(adToast.t);adToast.t=setTimeout(()=>{t.style.opacity=0;},2600);}
async function adFb(){const t=yrService();await t.connect();return t;}
async function adAyrilmisAdlar(t){
 const fb=t.sdk,d=await fb.getDoc(fb.doc(t.db,'nmSahip',t.uid));
 const ks=d.exists()?d.data().ks:null;
 return Array.isArray(ks)?ks:[];
}

/* Kota doluysa yalnız bu hesaba önceden ayrılmış, başka bir yerel profilin kullanmadığı adlar seçilebilir. */
function adKotaSecenekleri(ks,self){
 const yerel=new Set(profiles().filter(p=>p!==self)),sonuc=new Map();
 for(const k of ks){
  if(typeof k!=='string'||!/^\d{1,4}_\d{1,4}$/.test(k))continue;
  const [e,n]=k.split('_').map(Number);
  if(!AD_KAR[e]||adKapali(e)||yerel.has(adMake(e,n)))continue;
  if(!sonuc.has(e)||n===0)sonuc.set(e,n);
 }
 return sonuc;
}

/* Karakteri ayır: yalnız numarasız (eski numaralı kayıt için istenen numara). Başkasındaysa null döner. İnternet yoksa sonra doğrulanır. */
async function adClaim(e,want,self){
 const w=want||0;
 if(profiles().filter(x=>x!==self).indexOf(adMake(e,w))>=0)return null;
 if(!navigator.onLine)return {e,n:w,c:false};
 try{
  const t=await adFb(),fb=t.sdk;
  try{
   /* Cihaz başına ayrılan adlar nmSahip/{uid} listesinde (en çok 10). Ad ile liste aynı işlemde yazılır. */
   const k=adKey(e,w),sr=fb.doc(t.db,'nmSahip',t.uid);
   let ks=[];try{ks=await adAyrilmisAdlar(t);}catch(x){}
   const b=fb.writeBatch(t.db);
   if(!ks.includes(k)){if(ks.length>=AD_KOTA)return null;b.set(sr,{ks:ks.concat([k])});}
   b.set(fb.doc(t.db,'nm',k),{u:t.uid,t:Date.now()});await b.commit();return {e,n:w,c:true};}
  catch(er){if(er&&er.code==='permission-denied')return null;throw er;}
 }catch(x){return {e,n:w,c:false};}
}
function adKaristir(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=adRnd(0,i);const t=a[i];a[i]=a[j];a[j]=t;}return a;}
/* Boş bir karakter bul: önce mutfak karakterleri, sonra havuzun geri kalanı. Hepsi doluysa null. */
async function adClaimAny(self){
 if(navigator.onLine){
  try{
   const ks=await adAyrilmisAdlar(await adFb());
   if(ks.length>=AD_KOTA){
    for(const [e,n] of adKotaSecenekleri(ks,self)){const r=await adClaim(e,n,self);if(r)return r;}
    return null;
   }
  }catch(x){}
 }
 const mut=[],dig=[];AD_KAR.forEach((x,j)=>{if(adKapali(j))return;(x[2]===adKitchen()?mut:dig).push(j);});
 for(const e of adKaristir(mut).concat(adKaristir(dig).slice(0,60))){const r=await adClaim(e,0,self);if(r)return r;}
 return null;
}
async function adRelease(m){
 if(!m||!m.c||!navigator.onLine)return;
 try{const t=await adFb(),fb=t.sdk,k=adKey(m.e,m.n);await fb.deleteDoc(fb.doc(t.db,'nm',k));
  try{const sr=fb.doc(t.db,'nmSahip',t.uid),d=await fb.getDoc(sr);const ks=d.exists()&&Array.isArray(d.data().ks)?d.data().ks:[];if(ks.includes(k))await fb.setDoc(sr,{ks:ks.filter(x=>x!==k),c:k});}catch(x){}
 }catch(e){}
}
/* Profili yeniden adlandır: telefondaki kayıtlar yeni ada taşınır. Gerçek adlı eski profilde bulut rekor satırları silinir (gerçek ad bulutta kalmasın). */
function adRename(o,nw,info){
 const l=profiles(),i=l.indexOf(o);if(i<0)return;
 l[i]=nw;lsSet('profiles',l);
 if(ls('sonProfil',null)===o)lsSet('sonProfil',nw);
 const rc=records();let ch=false;rc.forEach(r=>{if(r&&r.p===o){r.p=nw;ch=true;}});if(ch)lsSet('records',rc);
 const wasChar=!!adInfo(o);
 if(typeof rkIds==='function'){
  if(wasChar){const ids=rkIds();if(ids[o]){ids[nw]=ids[o];delete ids[o];lsSet('rk_ids',ids);}}
  else if(typeof rkForgetProfile==='function')rkForgetProfile(o);
 }
 const m=adMap();delete m[o];m[nw]=info;lsSet('ad_map',m);adSifirlamaAdiniKullan(nw);
 /* Adla anahtarlanan bütün yerel kayıtlar (yolculuk, rütbe, ödül, rekor, pastacılık vb.) yeni ada taşınır; yoksa ad değişince ilerleme boş görünür. */
 try{for(let x=0;x<localStorage.length;x++){const k=localStorage.key(x);if(!k||k.indexOf(PRE)!==0)continue;const kk=k.slice(PRE.length);if(['ad_map','rk_ids','profiles','records'].includes(kk))continue;
   if(kk==='ana_son_konu_'+o){const v=ls(kk,null);if(v!==null&&ls('ana_son_konu_'+nw,null)===null)lsSet('ana_son_konu_'+nw,v);continue;}
   let v;try{v=JSON.parse(localStorage.getItem(k));}catch(e){continue;}
   if(v&&typeof v==='object'&&!Array.isArray(v)&&Object.prototype.hasOwnProperty.call(v,o)){if(!Object.prototype.hasOwnProperty.call(v,nw))v[nw]=v[o];delete v[o];lsSet(kk,v);}}
 }catch(e){}
 if(st.prof===o)st.prof=nw;
 if(typeof arkRenamed==='function')arkRenamed(o,nw);
}
/* Karakter listesinde bir ad değiştiyse (örn. Coşkulu Trompet → Huzurlu Civciv) kayıtlı profil adı yeni ada taşınır. Yalnız telefondaki kayıtlar; internet gerekmez. */
function adMigrate(){
 const map=adMap();
 profiles().slice().forEach(p=>{
  let m=map[p];if(!m||!AD_KAR[m.e]||adKapali(m.e)){if(m&&m.c)adRelease(m);const e=adRndKitchen();let n=adRnd(1000,9999);while(profiles().includes(adMake(e,n)))n=adRnd(1000,9999);m={e,n,c:false};adRename(p,adMake(e,n),m);return;}
  const nw=adMake(m.e,m.n);
  if(nw!==p&&profiles().indexOf(nw)<0)adRename(p,nw,m);
 });
}
/* Açılışta: gerçek adlı eski profillere karakter ver; silinmiş profillerin rezervasyonunu bırak. İnternet gerekir. */
async function adSync(){
 if(AD_STATE.busy||!navigator.onLine)return;AD_STATE.busy=true;let changed=false;
 try{
  const map=adMap(),profs=profiles(),korunan=new Set(adSifirlamaAdlari());
  for(const k of Object.keys(map)){if(profs.indexOf(k)<0&&!korunan.has(k)){const m=map[k];delete map[k];lsSet('ad_map',map);changed=true;await adRelease(m);if(typeof arkWipe==='function')await arkWipe(k);}}
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
 /* Değiştirme hakkı sağ üstteki profil ayrıntısında; girişte pencere açılmaz. */
 adDone(p);
}
function adDone(p){lsSet('ad_yeni',ls('ad_yeni',[]).filter(x=>x!==p));}

/* Profil oluşturma / düzenleme ekranı: kategori sekmeleri + karakter kartları */
/* Mutfak kategorisi (listenin son kategorisi) sekmelerde ilk sırada görünür; karakter sırası ve kayıtlı adlar değişmez. */
function adKitchen(){return AD_KAT.length-1;}
function adTabOrder(){const k=adKitchen(),o=[k];for(let j=0;j<AD_KAT.length;j++)if(j!==k)o.push(j);return o;}
/* Yeni profilde rastgele bir mutfak karakteri seçili açılır. */
function adRndKitchen(){const k=adKitchen(),l=[];AD_KAR.forEach((x,j)=>{if(x[2]===k&&!adKapali(j))l.push(j);});return l.length?l[adRnd(0,l.length-1)]:adRnd(0,AD_KAR.length-1);}
/* İlk profil oluşturulunca ad üstte görünür; bir kez değiştirme profil ayrıntısındadır. */
async function adAuto(){
 if(AD_STATE.auto)return;AD_STATE.auto=true;
 try{
  const r=(await adClaimAny(null))||{e:adRndKitchen(),n:0,c:false},nw=adMake(r.e,r.n),l=profiles();
  if(l.indexOf(nw)<0){l.push(nw);if(!lsSet('profiles',l)){adToast('Kayıt yapılamadı: tarayıcı depolaması kapalı olabilir');return;}}
  const x=adMap();x[nw]=r;lsSet('ad_map',x);adSifirlamaAdiniKullan(nw);
  const q=ls('ad_yeni',[]).filter(v=>v!==nw);q.push(nw);lsSet('ad_yeni',q);
  pickProfile(nw);adAsk(nw);
 }finally{AD_STATE.auto=false;}
}
/* Oyun adı bir kez değiştirilebilir: değiştirilince bilgide d=1 olur ve ad sabit kalır (telefondaki kayıt; sunucu denetimi ayrı adım). */
function adSabit(p){const m=adInfo(p);return !!(m&&m.d);}
function adBase(e){const k=AD_KAR[e];return k&&k[3]!==undefined?k[3]:e;}
const AD_CIVCIV_FIGUR=AD_KAR.findIndex(k=>k[1]==='Huzurlu Civciv');
const AD_CIVCIV_ADLAR=new Set(adFigur(AD_CIVCIV_FIGUR).map(e=>AD_KAR[e][1].toLocaleLowerCase('tr')));
function adCivcivAd(nick){return String(nick||'').trim().replace(/^🐥\s*/u,'');}
function adPortreHTML(adVeyaFigur,sinif){
 const civciv=typeof adVeyaFigur==='number'?adBase(adVeyaFigur)===AD_CIVCIV_FIGUR:
  AD_CIVCIV_ADLAR.has(adCivcivAd(adVeyaFigur).replace(/\s*#\d+$/,'').trim().replace(/\s+/g,' ').toLocaleLowerCase('tr'));
 return civciv?'<img class="'+sinif+'" src="assets/ascidostum/civciv.webp" alt="" width="64" height="64">':'';
}
function adOpen(i,ret){
 if(i>=0&&adSabit(profiles()[i])){adToast('Oyun adın sabit: değiştirme hakkını kullandın.');return;}
 const p=i>=0?profiles()[i]:null,m=p?adInfo(p):null,e=m?m.e:adRndKitchen();
 st.pe={i,e,b:adBase(e),cat:AD_KAR[e][2],ret:ret||'profiles',busy:false,av:{},kontrol:0};go('pedit');adCheck();
}
function adFigurler(cat){
 const figurler=[];
 for(let j=0;j<AD_BASE;j++)if(!adKapali(j)&&(cat===undefined||AD_KAR[j][2]===cat))figurler.push(j);
 return figurler;
}
function adGrid(){
 const P=st.pe;
 return adFigurler(P.cat).map(j=>{
  const x=AD_KAR[j],on=j===P.b,baslik=j===AD_CIVCIV_FIGUR?'Civciv':x[1];
  return '<button type="button" class="'+(on?'on':'')+'" aria-pressed="'+on+'" data-e="'+j+'" onclick="adSet('+j+')">'+(adPortreHTML(j,'ad-figur-portre')||'<span>'+x[0]+'</span>')+esc(baslik)+'</button>';
 }).join('')||'<p>Bu grupta seçilebilecek karakter kalmadı.</p>';
}
function adTabs(){const P=st.pe;return adTabOrder().map(j=>{const c=AD_KAT[j],k=c.indexOf(' ');return '<button type="button" class="'+(j===P.cat?'on':'')+'" aria-pressed="'+(j===P.cat)+'" data-cat="'+j+'" onclick="adCat('+j+')"><span>'+c.slice(0,k)+'</span>'+esc(c.slice(k+1))+'</button>';}).join('');}
function adCat(c){
 const P=st.pe;if(!P||P.busy||P.cat===c)return;
 const figurler=adFigurler(c),b=figurler.find(j=>adBosAdlar(j).length)??figurler[0];
 if(b===undefined)return;
 P.cat=c;
 adSet(b);
}
function adFigur(b){return [b].concat(AD_VAR[b]||[]);}
function adSecimNo(e){return st.pe.ayrilan?.get(e)??0;}
function adSecimAdi(e){const n=adSecimNo(e);return AD_KAR[e][1]+(n?' #'+n:'');}
function adAdayAdlar(b){
 const P=st.pe,own=P.i>=0?adInfo(profiles()[P.i]):null,local=new Set(profiles());
 return adFigur(b).filter(j=>!adKapali(j)&&own?.e!==j&&!local.has(adMake(j,adSecimNo(j)))&&
  (!P.ayrilan||P.ayrilan.has(j)));
}
function adBosAdlar(b){
 return adAdayAdlar(b).filter(j=>st.pe.av[j]!==false);
}
function adKendiCivcivAdi(P){
 const kendi=P.b===AD_CIVCIV_FIGUR&&P.i>=0?adInfo(profiles()[P.i]):null;
 return kendi&&adBase(kendi.e)===AD_CIVCIV_FIGUR?kendi:null;
}
function adAdlar(){
 const P=st.pe,free=adBosAdlar(P.b),kendi=adKendiCivcivAdi(P);
 const adlar=P.b===AD_CIVCIV_FIGUR?[...new Set([P.b,...(kendi?[kendi.e]:[]),...free])]:free;
 const kartlar=adlar.map(j=>{
  const kendiAdi=j===kendi?.e,secilebilir=kendiAdi||free.includes(j),on=j===P.e&&secilebilir;
  const ad=kendiAdi?AD_KAR[j][1]+(kendi.n?' #'+kendi.n:''):adSecimAdi(j);
  const durum=kendiAdi?'Şu anki adın':secilebilir?'':P.ayrilan&&!P.ayrilan.has(j)?'Ad ayırma sınırı dolu':'Dolu';
  return '<button type="button" class="'+(on?'on':'')+'" aria-pressed="'+on+'" data-e="'+j+'" onclick="adPick('+j+')"'+
   (secilebilir?'':' disabled')+'>'+esc(ad)+(durum?'<small>'+durum+'</small>':'')+'</button>';
 }).join('');
 if(free.length)return kartlar;
 const bilgi=P.ayrilan?'<p>Bu cihazda 10 ad ayrılmış. Bu karakter için kullanılabilir bir ad yok.</p>'
  :'<p>Bu karakterin adları dolu. Başka bir karakter seçebilirsin.</p>';
 const aranabilir=navigator.onLine&&adFigurler().some(j=>j!==P.b&&adBosAdlar(j).length);
 return kartlar+bilgi+(aranabilir?'<button type="button" onclick="adCheck(true)">Boş ad ara</button>':'');
}
function adYenile(){
 const P=st.pe;if(!P)return;
 const free=adBosAdlar(P.b),own=P.i>=0?adInfo(profiles()[P.i]):null;
 if(free.length&&!free.includes(P.e)&&own?.e!==P.e)P.e=free[0];
 const b=document.getElementById('pe-go');if(b&&!P.busy)b.disabled=!free.includes(P.e)&&own?.e!==P.e;
 const t=document.getElementById('pe-tab');if(t)for(const secme of t.querySelectorAll('[data-cat]')){
  const on=Number(secme.dataset.cat)===P.cat;secme.classList.toggle('on',on);secme.setAttribute('aria-pressed',String(on));
 }
 const g=document.getElementById('pe-em');if(g){const old=document.activeElement?.getAttribute('data-e'),had=g.contains(document.activeElement);g.innerHTML=adGrid();if(had&&old)g.querySelector('[data-e="'+old+'"]')?.focus();}
 const a=document.getElementById('pe-ad');if(a)a.innerHTML=adAdlar();
 const pv=document.getElementById('pe-pv');if(pv)pv.innerHTML=adPrev();
}
function adSet(v){
 const P=st.pe;if(!P||P.busy)return;P.b=v;P.e=v;
 const own=P.i>=0?adInfo(profiles()[P.i]):null;
 if(own&&adBase(own.e)===v)P.e=own.e;
 adCheck();
}
function adPick(e){
 const P=st.pe;if(!P||P.busy)return;
 if(!adBosAdlar(P.b).includes(e)&&adKendiCivcivAdi(P)?.e!==e)return;
 P.e=e;adYenile();
}
function adPrev(){const P=st.pe;return '<span class="ad-av" style="background:'+adCol(P.e)+'">'+(adPortreHTML(P.e,'ad-figur-portre')||AD_KAR[P.e][0])+'</span><span class="ad-pn">'+esc(adSecimAdi(P.e))+'<small id="pe-st" role="status">'+adStTxt()+'</small></span>';}
function adStTxt(){
 const P=st.pe,p=P.i>=0?profiles()[P.i]:null,m=p?adInfo(p):null;
 if(m&&m.e===P.e)return 'Şu anki adın';
 if(P.ayrilan&&!P.ayrilan.has(P.e))return 'Bu cihazda ad ayırma sınırı dolu';
 const a=P.av[P.e];
 if(!navigator.onLine)return 'İnternet yok: ad sonra doğrulanır';
 if(a===undefined)return P.kontrolYok?'Ad şu an doğrulanamadı':'Bakılıyor…';
 return a?'✨ Bu ad boş, yalnız senin olur':'Bu ad alınmış, başka birini seç';
}
async function adFigurAdlariniDogrula(t,b){
 const sd=t.sdk;
 return Promise.all(adAdayAdlar(b).map(async j=>{
  const s=await sd.getDoc(sd.doc(t.db,'nm',adKey(j,adSecimNo(j))));
  return [j,!s.exists()||s.data().u===t.uid];
 }));
}
function adCheck(alternatifAra=false){
 const P=st.pe;if(!P)return;
 const b=P.b,kontrol=++P.kontrol;
 const guncel=()=>st.screen==='pedit'&&st.pe===P&&P.kontrol===kontrol;
 clearTimeout(P.tm);
 P.kontrolYok=false;
 if(!navigator.onLine)P.ayrilan=null;
 adYenile();if(!navigator.onLine)return;
 P.tm=setTimeout(async()=>{
  try{
   const t=await adFb(),ks=await adAyrilmisAdlar(t);
   if(!guncel())return;
   P.ayrilan=ks.length>=AD_KOTA?adKotaSecenekleri(ks,P.i>=0?profiles()[P.i]:null):null;
   const secili=await adFigurAdlariniDogrula(t,b);
   if(!guncel())return;
   for(const [j,bos] of secili)P.av[j]=bos;
   const own=P.i>=0?adInfo(profiles()[P.i]):null;
   if(!adBosAdlar(b).length&&own?.e!==P.e&&!P.busy&&(b!==AD_CIVCIV_FIGUR||alternatifAra)){
    // Önce aynı grupta, sonra diğer kategorilerde en çok üç figürü dene.
    const diger=adFigurler().filter(j=>AD_KAR[j][2]!==P.cat);
    const alternatifler=adFigurler(P.cat).concat(diger)
     .filter(j=>j!==b&&adBosAdlar(j).length).slice(0,3);
    for(const figur of alternatifler){
     const uygunluk=await adFigurAdlariniDogrula(t,figur);
     if(!guncel())return;
     for(const [j,bos] of uygunluk)P.av[j]=bos;
     const [ad]=adBosAdlar(figur);
     if(ad!==undefined&&!P.busy){P.b=figur;P.e=ad;P.cat=AD_KAR[figur][2];break;}
    }
   }
   adYenile();
  }catch(e){if(guncel()){P.kontrolYok=true;adYenile();}}
 },250);
}
async function adSave(){
 const P=st.pe,b=document.getElementById('pe-go');if(!P||P.busy)return;
 const old=P.i>=0?profiles()[P.i]:null,om=old?adInfo(old):null;
 if(old&&adSabit(old)){adToast('Oyun adını değiştirme hakkını kullandın.');return;}
 if(old&&om&&om.e===P.e){go(P.ret);return;}
 if(!adBosAdlar(adBase(P.e)).includes(P.e)){adToast('Bu ad alınmış. Başka birini seç.');return;}
 P.busy=true;if(b){b.disabled=true;b.textContent='⏳ Ad ayrılıyor…';}
 const r=await adClaim(P.e,adSecimNo(P.e),old);P.busy=false;
 if(!r){P.av[P.e]=false;if(b){b.disabled=false;b.textContent=old?'💾 Kaydet':'✅ Profili Oluştur';}adCheck();adToast('Bu ad ayrılamadı. Başka bir ad seçebilirsin.');return;}
 if(old)r.d=1;/* değiştirme hakkı kullanıldı: ad artık sabit */
 const nw=adMake(r.e,r.n);
 if(old){adRename(old,nw,r);adRelease(om);adDone(old);adToast('Yeni adın: '+nw);go(P.ret);}
 else{
  const l=profiles();l.push(nw);
  if(!lsSet('profiles',l)){adToast('Kayıt yapılamadı: tarayıcı depolaması kapalı olabilir');return;}
  const x=adMap();x[nw]=r;lsSet('ad_map',x);adSifirlamaAdiniKullan(nw);
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
  document.querySelectorAll('.prof').forEach((row,i)=>{
   const nick=profiles()[i],portre=adPortreHTML(nick,'ad-kayitli-portre'),ad=row.querySelector('.menu-btn b');
   if(portre&&ad){ad.textContent=adCivcivAd(nick);ad.insertAdjacentHTML('afterbegin',portre);}
   const del=row.querySelector('.del');if(!del||row.querySelector('.ad-edit,.ad-lock'))return;
   if(adSabit(profiles()[i]))del.insertAdjacentHTML('beforebegin','<span class="ad-lock" role="img" aria-label="Oyun adı sabit">🔒</span>');
   else del.insertAdjacentHTML('beforebegin','<button class="del ad-edit" aria-label="Oyun adını bir kez değiştir" onclick="adOpen('+i+',\'profiles\')">✏️</button>');});
  setTimeout(adSync,0);
 }
 if(st.screen==='home'){setTimeout(adSync,0);if(st.prof)adAsk(st.prof);}
};
back=function(){if(st.screen==='pedit'){go(st.pe&&st.pe.ret||'profiles');return;}AD_BACK();};
createProfile=function(){adOpen(-1,'profiles');};
window.addEventListener('online',()=>{if(st.screen==='pedit'&&st.pe)adCheck();adSync();});

/* Uygulamayı paylaş: telefonun paylaşma menüsü; yoksa bağlantı kopyalanır. */
async function uygulamaPaylas(){
 const url=location.origin+location.pathname,data={title:'İşin Mutfağına Yolculuk',text:'Mutfak bilgisini oyunla öğreniyoruz. Sen de dene:',url};
 try{if(navigator.share){await navigator.share(data);return;}}catch(e){if(e&&e.name==='AbortError')return;}
 try{await navigator.clipboard.writeText(url);adToast('Bağlantı kopyalandı.');}catch(e){adToast(url);}
}

/* Güncelle: yeni sürümü denetler, eski önbelleği temizler ve sayfayı yeniler. Kayıtlı profil ve sonuçlar silinmez. İnternet yoksa yapılmaz (çevrimdışı kullanım bozulmasın). */
async function uygulamaGuncelle(){
 if(!navigator.onLine){adToast('İnternet yok. Güncellemek için internete bağlan.');return;}
 adToast('Güncelleniyor…');
 try{
  if('serviceWorker' in navigator){const r=await navigator.serviceWorker.getRegistration();if(r)await r.update();}
  /* Ders fotoğrafları ve sesler silinmeden önce sürümden bağımsız önbelleğe taşınır (çevrimdışı dersler kaybolmasın). */
  if(window.caches){const ks=await caches.keys(),v=await caches.open('mesleki-varlik-1'),med=/\.(jpe?g|png|webp|gif|svg|mp3|m4a|ogg)$/i;
   for(const k of ks){if(k.indexOf('mesleki-oyunlar')!==0)continue;try{const o=await caches.open(k);for(const q of await o.keys()){if(!med.test(new URL(q.url).pathname)||await v.match(q.url))continue;const r=await o.match(q);if(r&&r.ok)await v.put(q.url,r);}}catch(x){}}
   await Promise.all(ks.filter(k=>k.indexOf('mesleki-oyunlar')===0).map(k=>caches.delete(k)));}
 }catch(e){}
 setTimeout(()=>location.reload(),500);
}
