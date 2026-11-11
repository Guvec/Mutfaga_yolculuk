/* Başka cihaza taşıma: kod üretimi, çözümü, yüklenmesi ve gizlilik sınırları. */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..')+'/';
const srv=http.createServer((q,r)=>{let u=q.url.split('?')[0];if(u==='/')u='/index.html';const f=path.join(root,u);if(!fs.existsSync(f)||!f.startsWith(root)){r.writeHead(404);return r.end();}const e=path.extname(f);const t={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'}[e]||'text/plain';r.writeHead(200,{'Content-Type':t});r.end(fs.readFileSync(f));});
const ok=m=>console.log('PASS '+m);
srv.listen(0,async()=>{
 const port=srv.address().port,b=await chromium.launch();
 const sayfa=async()=>{const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await require('./helpers/sound-choice.cjs')(p);await p.goto('http://127.0.0.1:'+port);
  await p.waitForFunction(()=>typeof CONTENT!=='undefined'&&CONTENT['bulasik-makinesi-temizligi']);return {p,errs};};

 // 1. cihaz: iki profil, biri çalışmış
 const A=await sayfa();
 await A.p.evaluate(()=>{
  lsSet('profiles',['🐼 Panda','🦊 Tilki']);
  pickProfile('🦊 Tilki');rkPid('🦊 Tilki',true);
  pickProfile('🐼 Panda');const pid=rkPid('🐼 Panda',true);
  const r=ls('rutbe',{});r[pid]={mp:120,rank:2,done:{}};lsSet('rutbe',r);
  const h=ls('haftalik',{});h[pid]={best:{1:40}};lsSet('haftalik',h);
  const y=ls('yol_bl',{});y['🐼 Panda']={done:{e1b1:true},fails:{},cur:null};lsSet('yol_bl',y);
  lsSet('records',[{id:1,p:'🐼 Panda',op:'mcq',subject:'bulasik-makinesi-temizligi',group:'1. Bölüm',total:4,qs:[1,2,3,4]},{id:2,p:'🦊 Tilki',op:'mcq',subject:'baharat',total:1,qs:[1]}]);
  lsSet('ana_son_konu_🐼 Panda','bulasik-makinesi-temizligi');
 });
 const kod=await A.p.evaluate(()=>akKodYap());
 assert(/^MOZ1:|^MOD1:/.test(kod),kod.slice(0,20));ok('Kod MOZ1/MOD1 başlığıyla üretiliyor');
 const paket=await A.p.evaluate(k=>akKodCoz(k),kod);
 assert.equal(paket.veri.ad,'🐼 Panda');
 assert.equal(JSON.stringify(paket).includes('Tilki'),false);ok('Pakette yalnız seçili profil var, öteki profil yok');
 assert.equal(paket.veri.kayit.length,1);assert.equal(paket.veri.kayit[0].p,'🐼 Panda');ok('Çalışma geçmişinde yalnız bu profilin kayıtları var');
 assert.equal(JSON.stringify(paket).includes('rk_queue'),false);ok('Bekleyen gönderim kuyruğu pakete girmiyor');

 // Bozuk kod reddedilir
 const bozuk=await A.p.evaluate(k=>akKodCoz(k.slice(0,-12)+'AAAA').then(()=>'',e=>e.message),kod);
 assert(/bozuk|değil|açamıyor/.test(bozuk),bozuk);ok('Bozuk kod reddediliyor');
 const yabanci=await A.p.evaluate(()=>akKodCoz('merhaba').then(()=>'',e=>e.message));
 assert(/aktarma kodu değil/.test(yabanci),yabanci);ok('Aktarma kodu olmayan metin reddediliyor');

 // 2. cihaz: boş kurulum, kod yükleniyor
 const B=await sayfa();
 const once=await B.p.evaluate(()=>({prof:(ls('profiles',[])||[]).length}));
 assert.equal(once.prof,0);
 const sonuc=await B.p.evaluate(async k=>{const pk=await akKodCoz(k);return akYukle(pk);},kod);
 assert.equal(sonuc,'🐼 Panda');
 const son=await B.p.evaluate(()=>{const pid=rkPid('🐼 Panda');return {prof:ls('profiles',[]),pid,mp:(ls('rutbe',{})[pid]||{}).mp,hafta:(ls('haftalik',{})[pid]||{}).best,yol:Object.keys((ls('yol_bl',{})['🐼 Panda']||{done:{}}).done),kayit:(ls('records',[])||[]).length};});
 assert.deepEqual(son.prof,['🐼 Panda']);
 assert.equal(son.pid,paket.veri.pid);ok('Kimlik (pid) öteki cihazda aynı kalıyor');
 assert.equal(son.mp,120);assert.deepEqual(son.hafta,{1:40});assert.deepEqual(son.yol,['e1b1']);assert.equal(son.kayit,1);ok('Rütbe, haftalık, Yolculuğum ilerlemesi ve geçmiş taşındı');

 // Aynı kod ikinci kez yüklenince kayıtlar kopyalanmaz
 await B.p.evaluate(async k=>{const pk=await akKodCoz(k);akYukle(pk);},kod);
 assert.equal(await B.p.evaluate(()=>(ls('records',[])||[]).length),1);ok('Aynı kod ikinci kez yüklenince geçmiş çoğalmıyor');

 // Başka profil varsa ona dokunulmaz
 await B.p.evaluate(()=>{const pr=ls('profiles',[]);pr.push('🐢 Kaplumbağa');lsSet('profiles',pr);const r=ls('rutbe',{});r[rkPid('🐢 Kaplumbağa',true)]={mp:7};lsSet('rutbe',r);});
 await B.p.evaluate(async k=>{const pk=await akKodCoz(k);akYukle(pk);},kod);
 assert.equal(await B.p.evaluate(()=>(ls('rutbe',{})[rkPid('🐢 Kaplumbağa')]||{}).mp),7);ok('Cihazdaki başka profilin kaydı korunuyor');

 // Arayüz: profil penceresinden açılıyor, misafirde yok
 await B.p.evaluate(()=>{pickProfile('🐼 Panda');go('home');profilAyrintiAc();});
 assert.equal(await B.p.locator('#akTasi').count(),1);
 await B.p.locator('#akTasi').click();
 assert.equal(await B.p.locator('#akAl').count(),1);
 await B.p.locator('#akAl').click();await B.p.waitForSelector('#akMetin');
 assert((await B.p.inputValue('#akMetin')).startsWith('MOZ1:')||(await B.p.inputValue('#akMetin')).startsWith('MOD1:'));ok('Profil penceresinden kod ekranı açılıyor');
 await B.p.evaluate(()=>closeModal());
 await B.p.evaluate(()=>{st.guest=true;st.prof=null;profilAyrintiAc();});
 assert.equal(await B.p.locator('#akTasi').count(),0);ok('Misafir oturumunda taşıma düğmesi yok');

 assert.deepEqual(A.errs,[]);assert.deepEqual(B.errs,[]);ok('Tarayıcıda yakalanmamış JavaScript hatası yok');
 await b.close();srv.close();console.log('Aktarma testleri tamam.');
});
