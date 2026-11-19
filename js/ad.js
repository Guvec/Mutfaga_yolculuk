/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Oyun adı: öğrenci ad yazmaz, hazır karakterlerden seçer (Matematik Canavarı sürüm 46 mantığı).
   Profil adı = "🦊 Kurnaz Tilki". Her karakter yalnız bir kişiye aittir (numara eklenmez); rezervasyon Firestore nmV2/{karakter_no}_0. Eski numaralı kayıtlar (#482) geçerli kalır.
   Yerel kayıt: ad_map {profil: {e: karakter sırası, n: numara, c: bulutta ayrıldı mı}}. İnternet yoksa numara sonra verilir. */
'use strict';
const AD_STATE={busy:false};
const AD_KOTA=10,AD_HAVUZ=2;
const AD_REZERVASYON='nmV2',AD_SAHIP='nmSahipV2';
function adHavuzda(p){return ls('ad_havuz_v2',{})[p]===AD_HAVUZ;}
function adHavuzKaydet(p,onceki){
 const m=ls('ad_havuz_v2',{});
 if(onceki&&onceki!==p)delete m[onceki];
 if(p)m[p]=AD_HAVUZ;
 return lsSet('ad_havuz_v2',m);
}
function adYenilemeGerekli(p){return profiles().includes(p)&&!adHavuzda(p);}
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
function adKey(e,n){return e+'_'+n;}
function adRnd(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function adToast(m){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t);}t.textContent=m;t.style.opacity=1;clearTimeout(adToast.t);adToast.t=setTimeout(()=>{t.style.opacity=0;},2600);}
async function adFb(){const t=yrService();await t.connect();return t;}
async function adAyrilmisAdlar(t){
 const fb=t.sdk,d=await fb.getDoc(fb.doc(t.db,AD_SAHIP,t.uid));
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
 const n=want||0,k=adKey(e,n);
 if(profiles().some(p=>p!==self&&p===adMake(e,n)))return null;
 const yerel={e,n,c:false};
 if(!navigator.onLine)return yerel;
 try{
  const t=await yrWithTimeout(adFb(),10000),fb=t.sdk;
  const sahip=fb.doc(t.db,AD_SAHIP,t.uid),ad=fb.doc(t.db,AD_REZERVASYON,k);
  return await fb.runTransaction(t.db,async tx=>{
   const kayit=await tx.get(ad);
   if(kayit.exists()&&kayit.data().u!==t.uid)return null;
   const kota=await tx.get(sahip),ks=kota.data()?.ks||[];
   if(!ks.includes(k)){
    if(ks.length>=AD_KOTA)return null;
    tx.set(sahip,{ks:ks.concat(k)});
   }
   if(!kayit.exists())tx.set(ad,{u:t.uid,t:Date.now()});
   return {...yerel,c:true};
  });
 }catch(e){return yerel;}
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
 if(!m?.c||!navigator.onLine)return;
 try{
  const t=await adFb(),fb=t.sdk,k=adKey(m.e,m.n);
  const sahip=fb.doc(t.db,AD_SAHIP,t.uid),ad=fb.doc(t.db,AD_REZERVASYON,k);
  await fb.runTransaction(t.db,async tx=>{
   const kayit=await tx.get(ad);
   if(kayit.exists()&&kayit.data().u!==t.uid)return;
   const kota=await tx.get(sahip),ks=kota.data()?.ks||[];
   if(kayit.exists())tx.delete(ad);
   if(ks.includes(k))tx.set(sahip,{ks:ks.filter(x=>x!==k),c:k});
  });
 }catch(e){}
}
/* Profili yeniden adlandır: telefondaki kayıtlar yeni ada taşınır. Gerçek adlı eski profilde bulut rekor satırları silinir (gerçek ad bulutta kalmasın). */
function adRename(o,nw,info,kimligiKoru=false){
 const l=profiles(),i=l.indexOf(o);if(i<0)return false;
 const m=adMap();
 if(o===nw){m[o]=info;return lsSet('ad_map',m)&&adHavuzKaydet(nw);}
 if(l.includes(nw))return false;
 l[i]=nw;if(!lsSet('profiles',l))return false;
 if(ls('sonProfil',null)===o)lsSet('sonProfil',nw);
 const rc=records();let ch=false;rc.forEach(r=>{if(r&&r.p===o){r.p=nw;ch=true;}});if(ch)lsSet('records',rc);
 const wasChar=!!adInfo(o);
 if(typeof rkIds==='function'){
  if(wasChar||kimligiKoru){const ids=rkIds(),pid=ids[o];if(pid){
   ids[nw]=pid;delete ids[o];lsSet('rk_ids',ids);
   const q=ls('rk_queue',[]);for(const item of q)if(item?.pid===pid)item.name=nw;
   if(q.length)lsSet('rk_queue',q);
  }}
  else if(typeof rkForgetProfile==='function')rkForgetProfile(o);
 }
 delete m[o];m[nw]=info;lsSet('ad_map',m);adSifirlamaAdiniKullan(nw);
 /* Adla anahtarlanan bütün yerel kayıtlar (yolculuk, rütbe, ödül, rekor, pastacılık vb.) yeni ada taşınır; yoksa ad değişince ilerleme boş görünür. */
 try{for(let x=0;x<localStorage.length;x++){const k=localStorage.key(x);if(!k||k.indexOf(PRE)!==0)continue;const kk=k.slice(PRE.length);if(['ad_map','rk_ids','profiles','records'].includes(kk))continue;
   if(kk==='ana_son_konu_'+o){const v=ls(kk,null);if(v!==null&&ls('ana_son_konu_'+nw,null)===null)lsSet('ana_son_konu_'+nw,v);continue;}
   let v;try{v=JSON.parse(localStorage.getItem(k));}catch(e){continue;}
   if(v&&typeof v==='object'&&!Array.isArray(v)&&Object.prototype.hasOwnProperty.call(v,o)){if(!Object.prototype.hasOwnProperty.call(v,nw))v[nw]=v[o];delete v[o];lsSet(kk,v);}}
 }catch(e){}
 if(st.prof===o)st.prof=nw;
 if(typeof arkRenamed==='function')arkRenamed(o,nw);
 return adHavuzKaydet(nw,o);
}
/* Eski havuzdaki profiller ad seçimine kadar olduğu gibi kalır. */
function adMigrate(){
 const map=adMap();
 profiles().slice().forEach(p=>{
  let m=map[p];if(!adHavuzda(p))return;
  if(!m||!AD_KAR[m.e]||adKapali(m.e)){if(m&&m.c)adRelease(m);const e=adRndKitchen();let n=adRnd(1000,9999);while(profiles().includes(adMake(e,n)))n=adRnd(1000,9999);m={e,n,c:false};adRename(p,adMake(e,n),m);return;}
  const nw=adMake(m.e,m.n);
  if(nw!==p&&!profiles().includes(nw))adRename(p,nw,m);
 });
}
/* Açılışta: gerçek adlı eski profillere karakter ver; silinmiş profillerin rezervasyonunu bırak. İnternet gerekir. */
async function adSync(){
 if(AD_STATE.busy||!navigator.onLine)return;AD_STATE.busy=true;let changed=false;
 try{
  const map=adMap(),profs=profiles(),korunan=new Set(adSifirlamaAdlari());
  for(const k of Object.keys(map)){if(profs.indexOf(k)<0&&!korunan.has(k)){const m=map[k];delete map[k];lsSet('ad_map',map);changed=true;if(adHavuzda(k))await adRelease(m);adHavuzKaydet(null,k);if(typeof arkWipe==='function')await arkWipe(k);}}
  const todo=profiles().filter(p=>{const m=adMap()[p];return adHavuzda(p)&&!m?.c;});
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
  const x=adMap();x[nw]=r;lsSet('ad_map',x);adHavuzKaydet(nw);adSifirlamaAdiniKullan(nw);
  const q=ls('ad_yeni',[]).filter(v=>v!==nw);q.push(nw);lsSet('ad_yeni',q);
  pickProfile(nw);adAsk(nw);
 }finally{AD_STATE.auto=false;}
}
/* Oyun adı bir kez değiştirilebilir: değiştirilince bilgide d=1 olur ve ad sabit kalır (telefondaki kayıt; sunucu denetimi ayrı adım). */
function adSabit(p){return !adYenilemeGerekli(p)&&!!adInfo(p)?.d;}
function adBase(e){const k=AD_KAR[e];return k&&k[3]!==undefined?k[3]:e;}
const AD_CIVCIV_FIGUR=AD_KAR.findIndex(k=>k[1]==='Huzurlu Civciv');
const AD_CIVCIV_ADLAR=new Set(adFigur(AD_CIVCIV_FIGUR).map(e=>AD_KAR[e][1].toLocaleLowerCase('tr')));
function adCivcivAd(nick){return String(nick||'').trim().replace(/^🐥\s*/u,'');}
function adPortreHTML(adVeyaFigur,sinif){
 const civciv=typeof adVeyaFigur==='number'?adBase(adVeyaFigur)===AD_CIVCIV_FIGUR:
  AD_CIVCIV_ADLAR.has(adCivcivAd(adVeyaFigur).replace(/\s*#\d+$/,'').trim().replace(/\s+/g,' ').toLocaleLowerCase('tr'));
 return civciv?'<img class="'+sinif+'" src="assets/ascidostum/civciv.webp" alt="" width="64" height="64">':'';
}
const AD_ON_FIGURLER=[3,AD_CIVCIV_FIGUR,212,10];
const AD_FIGUR_PORTRE={3:'kaplan',164:'civciv',212:'kaplumbaga',10:'baykus'};
function adFigurGrubu(e){return adBase(e)===212?0:AD_KAR[e][2];}
function adSecimPortresi(e){
 const dosya=AD_FIGUR_PORTRE[e];
 return dosya?'<img class="ad-secim-resmi" src="assets/profil/'+dosya+'.webp" width="100" height="100" alt="">':
  '<span class="ad-secim-emoji" aria-hidden="true">'+AD_KAR[e][0]+'</span>';
}
function adEditor(i,ret){
 const p=i>=0?profiles()[i]:null,m=p?adInfo(p):null;
 const b=m&&adListe(adBase(m.e)).length?adBase(m.e):AD_ON_FIGURLER[0],cat=adFigurGrubu(b);
 st.pe={i,p,e:null,b,cat,ret:ret||'profiles',yenileme:!!p&&adYenilemeGerekli(p),adim:'figur',seciliFigur:b,
  figurSayfa:Math.max(0,Math.floor(adFigurler(cat).indexOf(b)/AD_FIGUR_SAYFA)),
  adSayfa:0,busy:false,av:{},kontrol:0};
}
function adOpen(i,ret){
 if(i>=0&&adSabit(profiles()[i])){adToast('Oyun adın sabit: değiştirme hakkını kullandın.');return;}
 adEditor(i,ret);go('pedit');document.getElementById('pe-baslik')?.focus();
}
function adYenilemeEkraniGerekli(){
 return navigator.onLine&&!st.guest&&!st.modalOpen&&['home','racemenu','raceinvite'].includes(st.screen)&&
  adYenilemeGerekli(st.prof)&&!(typeof ysKapiGerekli==='function'&&ysKapiGerekli())&&
  !(typeof YS!=='undefined'&&YS.acik);
}
function adFigurler(cat){
 const figurler=[];
 for(let j=0;j<AD_BASE;j++)if(adListe(j).length&&(cat===undefined||adFigurGrubu(j)===cat))figurler.push(j);
 if(cat===0)return AD_ON_FIGURLER.filter(j=>figurler.includes(j)).concat(figurler.filter(j=>!AD_ON_FIGURLER.includes(j)));
 return figurler;
}
const AD_FIGUR_SAYFA=4,AD_AD_SAYFA=3;
function adFigurBaslik(e){
 if(AD_FIGUR_PORTRE[e])return AD_KAR[e][1].slice(AD_KAR[e][1].indexOf(' ')+1);
 const [,ad,kategori]=AD_KAR[e];
 const kisa=kategori===adKitchen()?ad:ad.slice(ad.indexOf(' ')+1);
 return adFigurler(kategori).some(j=>j!==e&&AD_KAR[j][1].slice(AD_KAR[j][1].indexOf(' ')+1)===kisa)?ad:kisa;
}
function adSayfaDugmeleri(tur,adet){
 const sayfa=st.pe[tur+'Sayfa'],toplam=Math.ceil(adet/(tur==='figur'?AD_FIGUR_SAYFA:AD_AD_SAYFA));
 if(toplam<=1)return '';
 return '<nav class="ad-sayfalama" aria-label="Sayfa seçimi">'+
  '<button type="button" data-yon="-1" onclick="adSayfala(-1)"'+(sayfa===0?' disabled':'')+'>Önceki</button>'+
  '<span aria-live="polite">'+(sayfa+1)+' / '+toplam+'</span>'+
  '<button type="button" data-yon="1" onclick="adSayfala(1)"'+(sayfa+1>=toplam?' disabled':'')+'>Sonraki</button></nav>';
}
function adSayfala(yon){
 const P=st.pe;if(!P||P.busy)return;
 const tur=P.adim;
 const adet=tur==='figur'?adFigurler(P.cat).length:adListe(P.b).length;
 const yeni=P[tur+'Sayfa']+yon;
 if(yeni<0||yeni*(tur==='figur'?AD_FIGUR_SAYFA:AD_AD_SAYFA)>=adet)return;
 P[tur+'Sayfa']=yeni;
 if(tur==='figur')P.seciliFigur=null;
 adYenile();
 const dugme=document.querySelector('#pe-sayfa [data-yon="'+yon+'"]:not(:disabled)');
 (dugme||document.querySelector('#pe-em button,#pe-ad button:not(:disabled)')||document.getElementById('pe-baslik'))?.focus();
}
function adGrid(){
 const P=st.pe,bas=P.figurSayfa*AD_FIGUR_SAYFA;
 return adFigurler(P.cat).slice(bas,bas+AD_FIGUR_SAYFA).map(j=>{
  const secili=P.seciliFigur===j;
  return '<button type="button" data-e="'+j+'" aria-pressed="'+secili+'"'+(secili?' class="on"':'')+
   ' onclick="adFigurSec('+j+')"><span class="ad-resim-yuvasi">'+adSecimPortresi(j)+
   (secili?'<span class="ad-onay-isareti" aria-hidden="true">✓</span>':'')+'</span>'+esc(adFigurBaslik(j))+'</button>';
 }).join('');
}
function adKategoriSecimi(){
 const P=st.pe;
 const grup=(i,ad,simge)=>'<button type="button" class="'+(P.cat===i?'on':'')+'" aria-pressed="'+(P.cat===i)+
  '" onclick="adCat('+i+')"><span aria-hidden="true">'+simge+'</span> '+ad+'</button>';
 return '<div class="ad-gruplar" aria-label="Figür grupları">'+grup(0,'Hayvanlar','🐾')+grup(3,'Doğa','🍃')+'</div>'+
  '<select id="pe-kat" aria-label="Diğer figür grupları" onchange="adCat(Number(this.value))">'+
  '<option value="" disabled'+([0,3].includes(P.cat)?' selected':'')+'>Diğer gruplar</option>'+
  adTabOrder().filter(j=>j!==0&&j!==3).map(j=>'<option value="'+j+'"'+(j===P.cat?' selected':'')+'>'+
   esc(AD_KAT[j].slice(AD_KAT[j].indexOf(' ')+1))+'</option>').join('')+'</select>';
}
function adCat(c){
 const P=st.pe;if(!P||P.busy||P.cat===c||!AD_KAT[c])return;
 const focus=document.activeElement?.id==='pe-kat'?'#pe-kat':'.ad-gruplar .on';
 P.cat=c;P.figurSayfa=0;P.seciliFigur=null;go('pedit');document.querySelector(focus)?.focus();
}
function adFigurSec(e){
 const P=st.pe;if(!P||P.busy||P.adim!=='figur'||!adFigurler(P.cat).includes(e))return;
 P.seciliFigur=e;adYenile();
}
function adFigur(b){return [b].concat(AD_VAR[b]||[]);}
function adSecimNo(e){return st.pe.ayrilan?.get(e)??0;}
function adSecimAdi(e){const n=adSecimNo(e);return AD_KAR[e][1]+(n?' #'+n:'');}
function adAdayAdlar(b){
 const P=st.pe,own=!P.yenileme&&P.p?adInfo(P.p):null,local=new Set(profiles().filter(p=>p!==P.p));
 return adFigur(b).filter(j=>!adKapali(j)&&own?.e!==j&&!local.has(adMake(j,adSecimNo(j)))&&
  (!P.ayrilan||P.ayrilan.has(j)));
}
function adBosAdlar(b){
 return adAdayAdlar(b).filter(j=>st.pe.av[j]!==false);
}
function adListe(b){
 const adlar=adFigur(b).filter(j=>!adKapali(j));
 if(b!==3)return adlar;
 const ilk=['Güçlü Kaplan','Cesur Kaplan','Çevik Kaplan'].map(ad=>adlar.find(j=>AD_KAR[j][1]===ad)).filter(j=>j!==undefined);
 return ilk.concat(adlar.filter(j=>!ilk.includes(j)));
}
function adAdlar(){
 const P=st.pe,free=adBosAdlar(P.b),bas=P.adSayfa*AD_AD_SAYFA;
 const kendi=!P.yenileme&&P.p?adInfo(P.p):null;
 return adListe(P.b).slice(bas,bas+AD_AD_SAYFA).map(j=>{
  const kendiAdi=j===kendi?.e,uygun=kendiAdi||free.includes(j);
  const secilebilir=uygun&&!P.dogrulaniyor&&!P.busy,on=j===P.e&&uygun;
  const ad=kendiAdi?AD_KAR[j][1]+(kendi.n?' #'+kendi.n:''):adSecimAdi(j);
  const durum=kendiAdi?'Şu anki adın':uygun?'':P.ayrilan&&!P.ayrilan.has(j)?'Ad ayırma sınırı dolu':'Bu ad alınmış';
  return '<button type="button" class="'+(on?'on':'')+'" aria-pressed="'+on+'" data-e="'+j+'" onclick="adPick('+j+')"'+
   (secilebilir?'':' disabled')+'><span class="ad-ad-metin">'+esc(ad)+(durum?'<small>'+durum+'</small>':'')+
   '</span><span class="ad-ad-isaret" aria-hidden="true">'+(on?'✓':'')+'</span></button>';
 }).join('');
}
function adYenile(){
 const P=st.pe;if(!P)return;
 const figur=P.adim==='figur';
 if(!figur&&P.e!==null&&!adBosAdlar(P.b).includes(P.e)&&
    (P.yenileme||!P.p||adInfo(P.p)?.e!==P.e))P.e=null;
 const g=document.getElementById(figur?'pe-em':'pe-ad');
 if(g){
  const old=document.activeElement?.getAttribute('data-e'),had=g.contains(document.activeElement);
  g.innerHTML=figur?adGrid():adAdlar();
  if(had&&old)(g.querySelector('[data-e="'+old+'"]:not(:disabled)')||document.getElementById('pe-baslik'))?.focus();
 }
 const sayfa=document.getElementById('pe-sayfa');
 if(sayfa){
  const dugmeler=adSayfaDugmeleri(P.adim,figur?adFigurler(P.cat).length:adListe(P.b).length);
  if(sayfa.innerHTML!==dugmeler)sayfa.innerHTML=dugmeler;
 }
 if(figur){const ileri=document.getElementById('pe-ileri');if(ileri)ileri.disabled=P.seciliFigur===null;return;}
 const b=document.getElementById('pe-go');if(b)b.disabled=P.busy||P.dogrulaniyor||P.e===null||(P.yenileme&&!navigator.onLine);
 const pv=document.getElementById('pe-pv');if(pv)pv.textContent=adStTxt();
}
function adSet(v){
 const P=st.pe;if(!P||P.busy||!adFigurler().includes(v))return;
 P.cat=adFigurGrubu(v);P.b=v;P.seciliFigur=v;P.e=null;P.adSayfa=0;P.adim='ad';P.dogrulaniyor=navigator.onLine;
 P.figurSayfa=Math.floor(adFigurler(P.cat).indexOf(v)/AD_FIGUR_SAYFA);
 go('pedit');document.getElementById('pe-baslik')?.focus();adCheck();
}
function adPick(e){
 const P=st.pe;if(!P||P.busy||P.dogrulaniyor||P.adim!=='ad')return;
 const kendi=!P.yenileme&&P.p?adInfo(P.p):null;
 if(!adBosAdlar(P.b).includes(e)&&kendi?.e!==e)return;
 P.e=e;adYenile();
}
function adStTxt(){
 const P=st.pe,free=adBosAdlar(P.b);
 if(!free.length)return P.ayrilan?'Bu cihazda 10 ad ayrılmış.':'Bu karakter için seçilebilecek başka ad yok.';
 if(!navigator.onLine)return P.yenileme?'Adını yenilemek için internete bağlan.':'İnternet yok. Seçtiğin ad sonra doğrulanır.';
 if(P.kontrolYok)return 'Adlar şu an doğrulanamadı.';
 if(P.dogrulaniyor)return 'Adlar kontrol ediliyor…';
 return '';
}
async function adFigurAdlariniDogrula(t,b){
 const sd=t.sdk;
 return Promise.all(adAdayAdlar(b).map(async j=>{
  const s=await sd.getDoc(sd.doc(t.db,AD_REZERVASYON,adKey(j,adSecimNo(j))));
  return [j,!s.exists()||s.data().u===t.uid];
 }));
}
function adCheck(){
 const P=st.pe;if(!P||P.adim!=='ad')return;
 const b=P.b,kontrol=++P.kontrol;
 const guncel=()=>st.screen==='pedit'&&st.pe===P&&P.adim==='ad'&&P.kontrol===kontrol;
 clearTimeout(P.tm);
 P.kontrolYok=false;P.dogrulaniyor=navigator.onLine;
 if(!navigator.onLine)P.ayrilan=null;
 adYenile();if(!navigator.onLine)return;
 P.tm=setTimeout(async()=>{
  try{
   const t=await yrWithTimeout(adFb(),10000),ks=await yrWithTimeout(adAyrilmisAdlar(t),10000);
   if(!guncel())return;
   P.ayrilan=ks.length>=AD_KOTA?adKotaSecenekleri(ks,P.p):null;
   const secili=await yrWithTimeout(adFigurAdlariniDogrula(t,b),10000);
   if(!guncel())return;
   for(const [j,bos] of secili)P.av[j]=bos;
  }catch(e){if(guncel())P.kontrolYok=true;}
  finally{if(guncel()){P.dogrulaniyor=false;adYenile();}}
 },250);
}
async function adSave(){
 const P=st.pe,b=document.getElementById('pe-go');if(!P||P.busy||P.dogrulaniyor||P.adim!=='ad'||P.e===null)return;
 const old=P.p,om=old?adInfo(old):null;
 if(old&&(!profiles().includes(old)||(P.yenileme&&!adYenilemeGerekli(old)))){go(P.ret);return;}
 if(old&&adSabit(old)){adToast('Oyun adını değiştirme hakkını kullandın.');return;}
 if(old&&!P.yenileme&&om&&om.e===P.e){go(P.ret);return;}
 if(!adBosAdlar(adBase(P.e)).includes(P.e)){adToast('Bu ad alınmış. Başka birini seç.');return;}
 P.busy=true;if(b){b.disabled=true;b.textContent='Ad ayrılıyor…';}adYenile();
 const r=await adClaim(P.e,adSecimNo(P.e),old);P.busy=false;
 if(st.pe!==P||st.screen!=='pedit')return;
 if(P.yenileme&&!adYenilemeGerekli(old)){go(P.ret);return;}
 if(!r){P.av[P.e]=false;P.e=null;if(b){b.disabled=false;b.textContent=P.yenileme?'Adı onayla':old?'Kaydet':'Profili oluştur';}adCheck();adToast('Bu ad ayrılamadı. Başka bir ad seçebilirsin.');return;}
 if(P.yenileme&&!r.c){
  if(b)b.textContent='Adı onayla';
  adToast('Adın doğrulanamadı. İnternete bağlanıp tekrar dene.');adYenile();return;
 }
 if(old&&(!P.yenileme||om?.d))r.d=1;
 const nw=adMake(r.e,r.n);
 if(old){
  if(!adRename(old,nw,r,P.yenileme)){
   if(b)b.textContent=P.yenileme?'Adı onayla':'Kaydet';
   adToast('Profil kaydedilemedi. Yeniden dene.');adYenile();return;
  }
  if(!P.yenileme)adRelease(om);
  adDone(old);adToast('Oyun adın: '+nw);
  if(P.yenileme&&P.ret==='raceinvite'){go('raceinvite');if(typeof yrInviteResume==='function')yrInviteResume();}
  else go(P.ret);
 }
 else{
  const l=profiles();l.push(nw);
  if(!lsSet('profiles',l)){if(b)b.textContent='Profili oluştur';adYenile();adToast('Kayıt yapılamadı: tarayıcı depolaması kapalı olabilir');return;}
  const x=adMap();x[nw]=r;lsSet('ad_map',x);adHavuzKaydet(nw);adSifirlamaAdiniKullan(nw);
  pickProfile(nw);adToast('Hoş geldin, '+nw);
 }
}
function adEditHTML(){
 const P=st.pe,ed=P.i>=0,figur=P.adim==='figur';
 const baslik=figur?'Figürünü seç':adFigurBaslik(P.b);
 let h='<div class="wrap ad-secim"><section class="ad-parsomen" aria-labelledby="pe-baslik">'+
  '<header class="ad-secim-ust"><button type="button" aria-label="Geri" onclick="back()">‹</button><span>'+
  (figur?'Profil seç':'Adını seç')+'</span></header>'+
  '<img class="ad-kis-mutfagi" src="assets/profil/kis-mutfagi.webp" width="626" height="156" alt="">';
 if(!figur)h+='<div class="ad-isim-portresi">'+adSecimPortresi(P.b)+'</div>';
 h+='<h2 id="pe-baslik" tabindex="-1">'+esc(baslik)+'</h2>';
 if(P.yenileme&&figur)h+='<p class="ad-yenileme-bilgi">Adını yeniden seç. Puanların ve ilerlemen korunur.</p>';
 if(figur)h+=adKategoriSecimi()+'<div class="ad-grid" id="pe-em">'+adGrid()+'</div>';
 else h+='<div class="ad-grid ad-adlar" id="pe-ad">'+adAdlar()+'</div>';
 h+='<div id="pe-sayfa">'+adSayfaDugmeleri(P.adim,figur?adFigurler(P.cat).length:adListe(P.b).length)+'</div>';
 if(figur)h+='<button type="button" class="ad-ana-dugme" id="pe-ileri" onclick="adSet(st.pe.seciliFigur)"'+
  (P.seciliFigur===null?' disabled':'')+'>Devam</button>';
 else h+='<p id="pe-pv" role="status">'+esc(adStTxt())+'</p><button type="button" class="ad-ana-dugme" id="pe-go" onclick="adSave()"'+
  (P.e===null||P.busy||P.dogrulaniyor||(P.yenileme&&!navigator.onLine)?' disabled':'')+'>'+
  (P.yenileme?'Adı onayla':ed?'Kaydet':'Profili oluştur')+'</button>';
 return h+'</section></div>';
}
/* Ekran bağlantıları */
const AD_RENDER=render,AD_BACK=back;
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
   if(adYenilemeGerekli(nick))del.insertAdjacentHTML('beforebegin','<button class="del ad-edit" aria-label="Oyun adını yenile" onclick="adOpen('+i+',\'profiles\')">✏️</button>');
   else if(adSabit(nick))del.insertAdjacentHTML('beforebegin','<span class="ad-lock" role="img" aria-label="Oyun adı sabit">🔒</span>');
   else del.insertAdjacentHTML('beforebegin','<button class="del ad-edit" aria-label="Oyun adını bir kez değiştir" onclick="adOpen('+i+',\'profiles\')">✏️</button>');});
  setTimeout(adSync,0);
 }
 if(st.screen==='home'){setTimeout(adSync,0);if(st.prof)adAsk(st.prof);}
};
back=function(){
 if(st.screen!=='pedit'){AD_BACK();return;}
 const P=st.pe;if(P?.busy)return;
 if(P?.adim==='ad'){
  clearTimeout(P.tm);P.kontrol++;P.adim='figur';go('pedit');
  document.querySelector('#pe-em [data-e="'+P.b+'"]')?.focus();return;
 }
 go(P?.yenileme?'profiles':P?.ret||'profiles');
};
createProfile=function(){adOpen(-1,'profiles');};
window.addEventListener('online',()=>{
 if(adYenilemeEkraniGerekli())render();
 if(st.screen==='pedit'&&st.pe&&!st.pe.busy)adCheck();
 adSync();
});
window.addEventListener('offline',()=>{if(st.screen==='pedit'&&st.pe&&!st.pe.busy)adCheck();});

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
