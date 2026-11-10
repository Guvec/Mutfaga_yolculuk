/* Kayıtlı profille giriş, davet dönüşü ve tek değişiklik hakkı: gerçek uygulama betikleri + DOM. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),root=path.resolve(__dirname,'..');
const ac=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'js/ad-liste.js'),'utf8')+';this.names=AD_KAR;',ac);
const names=ac.names.slice(0,3).map(x=>x[0]+' '+x[1]);let checks=0;
function seed(list,last){const data={kv_profiles:JSON.stringify(list),kv_ad_map:JSON.stringify(Object.fromEntries(list.map(n=>[n,{e:names.indexOf(n),n:0,c:true}])))};if(last!==undefined)data.kv_sonProfil=JSON.stringify(last);return data;}
async function open(data={},query=''){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://example.test/'+query,runScripts:'dangerously',pretendToBeVisual:true}),w=dom.window;
 w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 w.setTimeout=()=>1;w.clearTimeout=()=>{};w.setInterval=()=>1;w.clearInterval=()=>{};w.requestAnimationFrame=()=>1;
 Object.defineProperty(w.navigator,'onLine',{value:false,configurable:true});
 w.fetch=async url=>{const p=path.join(root,String(url));return {ok:fs.existsSync(p),status:200,json:async()=>JSON.parse(fs.readFileSync(p,'utf8'))};};
 for(const [k,v] of Object.entries(data))w.localStorage.setItem(k,v);
 for(const el of w.document.querySelectorAll('script[src]'))vm.runInContext(fs.readFileSync(path.join(root,el.getAttribute('src')),'utf8'),dom.getInternalVMContext(),{filename:el.getAttribute('src')});
 await Promise.resolve();await Promise.resolve();return {dom,w};
}
async function dispose(dom){await new Promise(setImmediate);await new Promise(setImmediate);dom.window.close();}
const snapshot=w=>Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
const ok=s=>{checks++;console.log('PASS '+s);};
(async()=>{
 let legacy=seed(['Eski hazır ad'],'Eski hazır ad');legacy.kv_ad_map=JSON.stringify({'Eski hazır ad':{e:0,n:0,c:true}});legacy.kv_records=JSON.stringify([{p:'Eski hazır ad',id:1,qs:[]}]);
 let {dom,w}=await open(legacy);assert.equal(w.st.prof,names[0]);assert.equal(w.ls('sonProfil'),names[0]);assert.equal(w.records()[0].p,names[0]);ok('Hazır ad güncellemesi hatırlanan profili ve kayıtları birlikte taşır');await dispose(dom);
 ({dom,w}=await open());assert.equal(w.st.screen,'home');assert.equal(w.st.prof,null);ok('Profilsiz ilk giriş korunur');await dispose(dom);
 ({dom,w}=await open(seed([names[0]])));assert.equal(w.st.screen,'home');assert.equal(w.st.prof,names[0]);assert.equal(w.ls('sonProfil'),names[0]);
 assert.equal(w.document.querySelector('.ae-profile').textContent,w.adRest(names[0]));assert(!w.document.getElementById('app').textContent.includes('Yeni profil'));ok('Tek profil ilk yüklemede seçilir; ana sayfada yeni profil kartı yok');await dispose(dom);
 ({dom,w}=await open(seed(names.slice(0,2),names[1])));assert.equal(w.st.screen,'home');assert.equal(w.st.prof,names[1]);ok('Birden çok kayıtta son kullanılan profil seçilir');
 w.go('topics');assert(w.document.querySelector('.top .ses-ac'));assert.equal(w.document.querySelector('.top .profile-self').textContent,names[1]);w.go('home');ok('Konu ekranında sesli okuma ve profil düğmesi birlikte korunur');
 w.document.querySelector('.ae-profile').click();assert(w.document.getElementById('profileRename'));assert(!w.document.querySelector('.profile-detail').textContent.includes('Yeni profil'));w.document.getElementById('profileClose').click();
 w.adAsk(names[1]);assert.equal(w.st.modalOpen,false);ok('Değiştirme hakkı yalnız profil ayrıntısında; otomatik ad penceresi yok');
 w.lsSet('records',[{p:names[1],id:1,qs:[]}]);const pid=w.rkPid(names[1],true);let claims=0;
 w.adClaim=async e=>{claims++;return {e,n:0,c:true};};w.adRelease=async()=>{};
 w.adOpen(1,'home');w.st.pe.e=2;await w.adSave();
 assert.equal(w.st.prof,names[2]);assert.equal(w.ls('sonProfil'),names[2]);assert.equal(w.records()[0].p,names[2]);assert.equal(w.rkPid(names[2]),pid);assert.equal(w.adSabit(names[2]),true);
 w.profilAyrintiAc();assert.equal(w.document.getElementById('profileRename'),null);w.closeModal();
 w.st.pe={i:1,e:0,busy:false,av:{},ret:'home'};await w.adSave();assert.equal(claims,1);assert.equal(w.st.prof,names[2]);ok('Bir kez ad değişir; kayıtlar ve profil kimliği korunur; ikinci kaydet engellenir');
 let saved=snapshot(w);await dispose(dom);({dom,w}=await open(saved));assert.equal(w.st.screen,'home');assert.equal(w.st.prof,names[2]);ok('Yenilemede değişen profil aynı kalır');
 w.guest();assert.equal(w.st.guest,true);assert.equal(w.ls('sonProfil'),names[2]);assert.equal(w.profilDevamEt(),false);ok('Misafir seçimi açık oturumda korunur; kayıtlı profil silinmez');saved=snapshot(w);await dispose(dom);
 ({dom,w}=await open(saved));assert.equal(w.st.prof,names[2]);assert.equal(w.st.guest,false);ok('Misafirden sonraki yeni giriş kayıtlı profile döner');
 w.st.screen='raceplay';w.eval('YR.active=true');w.profilAyrintiAc();assert.equal(w.document.getElementById('profileRename'),null);assert.equal(w.document.getElementById('profileSwitch'),null);w.closeModal();ok('Oyun veya oda sürerken kimlik değiştirilmez');await dispose(dom);
 ({dom,w}=await open(seed([names[0]],names[1])));assert.equal(w.st.prof,null);assert.equal(w.st.screen,'home');assert.equal(w.ls('sonProfil',null),null);ok('Silinmiş son profil otomatik kullanılmaz');await dispose(dom);
 ({dom,w}=await open(seed([names[0]],names[0]),'?oda=ABC123'));assert.equal(w.st.screen,'raceinvite');assert.equal(w.yrNickGet(),names[0]);assert.equal(await w.yrNeedName(),true);assert.equal(w.eval('YR.invite.code'),'ABC123');assert(!w.document.getElementById('app').textContent.includes('Er Meydanı Kur'));ok('Davet bağlantısı aynı kayıtlı profili ve oda kodunu kullanır');await dispose(dom);
 ({dom,w}=await open(seed(names.slice(0,2)),'?oda=ABC123'));assert.equal(w.st.screen,'raceinvite');w.st.profileReturn='raceinvite';w.pickProfile(names[1]);assert.equal(w.st.screen,'raceinvite');assert.equal(w.eval('YR.invite.code'),'ABC123');assert.equal(w.ls('sonProfil'),names[1]);ok('Eski çoklu kayıtta ilk seçimden sonra davet ekranına dönülür');await dispose(dom);
 ({dom,w}=await open(seed([names[0]],names[0])));w.sesSoruGoster();assert(w.document.querySelector('[data-ses-soru="okuma"]'));w.sesSoruSec('okuma');assert.equal(w.localStorage.getItem('mesleki-ses-soru'),'1');w.sesSoruGoster();assert.equal(w.st.modalOpen,false);ok('Doğrudan girişte ilk ses seçimi bir kez korunur');
 w.go('profiles');w.askDelProfile(names[0]);w.document.getElementById('mYes').click();assert.equal(w.st.prof,null);assert.equal(w.ls('sonProfil',null),null);assert(!w.profiles().includes(names[0]));ok('Profili silmek hatırlanan ve açık kimliği temizler');await dispose(dom);
 console.log(checks+' kontrol geçti.');
})().catch(e=>{console.error(e);process.exitCode=1;});
