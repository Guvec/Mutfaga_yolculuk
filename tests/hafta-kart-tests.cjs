/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:390,height:780}});let fail=0;const ok=(n,c)=>{console.log((c?'OK  ':'FAIL ')+n);if(!c)fail++;};
await p.goto('file://'+path.resolve(__dirname,'..','index.html'));await p.waitForTimeout(1200);
const r=await p.evaluate(()=>{
 const d=HAFTA_AYAR.distribution,sum=d.reduce((a,x)=>a+x.n,0),bl=d.find(x=>x.subject==='bulasik-makinesi-temizligi').n;
 const now=[{pid:'a',name:'Ali',correct:20,dur:100},{pid:'b',name:'Ece',correct:18,dur:90},{pid:'c',name:'Can',correct:10,dur:80}];
 const prev=[{pid:'a',correct:19},{pid:'b',correct:10},{pid:'d',correct:5}];
 const g=haftaMostImproved(now,prev),top=haftaSorted(now)[0].name,none=haftaMostImproved(now,[]);
 return {sum,bl,ver:HAFTA_AYAR.contentVersion,gain:g&&g.row.name,gv:g&&g.gain,top,none,sync:typeof rutbeSyncRows};});
ok('toplam 25',r.sum===25);ok('Bulaşık 3',r.bl===3);ok('sürüm hafta-2',r.ver==='hafta-2');
ok('en çok gelişen Ece +8',r.gain==='Ece'&&r.gv===8);ok('şampiyon Ali',r.top==='Ali');ok('önceki hafta yoksa gelişen yok',r.none===null);ok('rütbe senkron fonksiyonu',r.sync==='function');
await p.evaluate(()=>{go('home')});await p.waitForTimeout(800);
ok('ana sayfa kartı',await p.evaluate(()=>!!document.querySelector('.hafta-kart')));
await p.evaluate(()=>{st.screen='giris';render();});
ok('giriş ekranında paylaş/güncelle',await p.evaluate(()=>document.querySelectorAll('.ad-giris button').length===2||!!document.querySelector('.ad-paylas')));
await b.close();global.__f=fail;})();
/* Ses seçim ekranı ve sürüm (ayrı tarayıcı oturumu). */
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:390,height:780}});let fail=0;const ok=(n,c)=>{console.log((c?'OK  ':'FAIL ')+n);if(!c)fail++;};
await p.addInitScript(()=>{try{localStorage.setItem('test-ses-soru','1');}catch(e){}});
await p.goto('file://'+path.resolve(__dirname,'..','index.html'));await p.waitForTimeout(1500);
ok('ilk girişte ses seçim ekranı',await p.locator('#ov [data-ses-soru]').count()===3);
ok('Güncelle düğmesinde sürüm',(await p.locator('.ad-paylas').last().textContent()).includes('v'+await p.evaluate(()=>APP_SURUM)));
await p.locator('[data-ses-soru="muzik"]').click();
const r=await p.evaluate(()=>({muzik:MUZIK.acikMi(),ses:SES.acik,k:localStorage.getItem('mesleki-ses-soru')}));
ok('Müzik seçilince müzik açık, sesli okuma kapalı, tercih saklı',r.muzik&&!r.ses&&r.k==='1');
await p.evaluate(()=>sesSoruGoster());await p.waitForTimeout(300);
ok('ikinci girişte ekran çıkmaz',await p.locator('#ov [data-ses-soru]').count()===0);
await b.close();await new Promise(r=>setTimeout(r,500));process.exit(fail||global.__f?1:0);})();
