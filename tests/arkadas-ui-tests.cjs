/* Arkadaş akışı arayüz testi. Firestore yerine bellek içi sahte SDK; kurallar tests/arkadas-rules-tests.cjs ile emülatörde sınanır. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
const FAKE=`(()=>{const S={},LS=[];const now=()=>Date.now();
 const stamp=()=>({__ts:1});const res=v=>{if(v&&v.__ts)return {toMillis:()=>now()};return v;};
 const clone=d=>{const o={};for(const k in d)o[k]=res(d[k]);return o;};
 const key=r=>r.col+'/'+r.id;
 const sdk={
  doc:(db,col,id)=>({col,id,path:col+'/'+id,kind:'doc'}),collection:(db,col)=>({col,kind:'col'}),
  where:(f,op,v)=>({f,op,v}),query:(c,...w)=>({col:c.col,w,kind:'q'}),serverTimestamp:stamp,
  async getDoc(r){const d=S[key(r)];return {exists:()=>!!d,data:()=>d?{...d}:undefined};},
  async setDoc(r,d){S[key(r)]=clone(d);notify(r.col);},
  async updateDoc(r,d){if(!S[key(r)])throw Error('not-found');Object.assign(S[key(r)],clone(d));notify(r.col);},
  async deleteDoc(r){delete S[key(r)];notify(r.col);},
  writeBatch(){const ops=[];return {set(r,d){ops.push(()=>sdk.setDoc(r,d));},async commit(){for(const o of ops)await o();}};},
  async getDocs(q){return snap(q);},
  onSnapshot(q,cb){const l={q,cb};LS.push(l);cb(snap(q));return ()=>{const i=LS.indexOf(l);if(i>=0)LS.splice(i,1);};}
 };
 function snap(q){const docs=Object.keys(S).filter(k=>k.startsWith(q.col+'/')).map(k=>({id:k.slice(q.col.length+1),data:()=>({...S[k]}),ref:{col:q.col,id:k.slice(q.col.length+1)}})).filter(d=>q.w.every(w=>d.data()[w.f]===w.v));
  return {docs,forEach:f=>docs.forEach(f)};}
 function notify(col){LS.filter(l=>l.q.col===col).forEach(l=>l.cb(snap(l.q)));}
 window.__fs={S,sdk,notify,uid:'u-me'};
})();`;
(async()=>{
 const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const server=http.createServer((req,res)=>{let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(rel==='/')rel='/index.html';const file=path.resolve(root,'.'+rel);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-gpu']});const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});await ctx.addInitScript(FAKE);
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));let n=0;const ok=m=>{n++;console.log('PASS '+m);};
 try{
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>typeof frEnsure==='function'&&typeof CONTENT!=='undefined');
  await page.evaluate(()=>{window.frOn=()=>true;window.adFb=async()=>({sdk:__fs.sdk,db:'db',uid:__fs.uid});lsSet('profiles',['🐼 Cesur Panda']);lsSet('ad_map',{'🐼 Cesur Panda':{e:0,n:0,c:true}});sessionStorage.setItem('mesleki-ses-secim','1');});
  // Misafir
  await page.evaluate(()=>{guest();go('friends');});
  assert((await page.textContent('#fr-body')).includes('Misafirler arkadaş ekleyemez'));ok('Misafir arkadaş ekleyemez');
  // Profil seç → kimlik oluşur
  await page.evaluate(()=>pickProfile('🐼 Cesur Panda'));await page.waitForFunction(()=>FR.ready);
  const me=await page.evaluate(()=>({pid:FR.pid,card:__fs.S['yrKart/'+FR.pid],kim:__fs.S['yrKim/u-me'],dur:!!__fs.S['yrDurum/'+FR.pid]}));
  assert(/^[A-HJ-NP-Z2-9]{7}$/.test(me.pid));assert.equal(me.card.nick,'🐼 Cesur Panda');assert.equal(me.card.owner,'u-me');assert.equal(me.kim.pid,me.pid);assert(me.dur);ok('Kimlik: 7 karakterli kod, ad kartı, aktif profil ve çevrim içi sinyali yazıldı');
  // Ana ekranda Arkadaşlarım düğmesi ve canlı kutu
  await page.evaluate(()=>go('home'));await page.waitForSelector('[data-ark]');assert(await page.locator('#fr-live').count()===1);ok('Ana ekranda Arkadaşlarım düğmesi ve "Şu an oyunda" kutusu');
  // Arkadaşlarım ekranı
  await page.locator('[data-ark]').click();await page.waitForFunction(()=>st.screen==='friends');
  const body=await page.textContent('#fr-body');assert(body.includes('Senin oyuncu kodun')&&body.includes(me.pid)&&body.includes('Kopyala')&&body.includes('Paylaş')&&body.includes('Arkadaş Ekle'));ok('Arkadaşlarım: kod, Kopyala, Paylaş, Arkadaş Ekle');
  // Karşı taraf: kart + çevrim içi
  await page.evaluate(()=>{__fs.S['yrKart/BBBBBB3']={owner:'u-b',nick:'🦊 Kurnaz Tilki'};__fs.S['yrDurum/BBBBBB3']={seen:{toMillis:()=>Date.now()}};});
  await page.fill('#fr-code','bbbbbb3');await page.getByRole('button',{name:/Arkadaş Ekle/}).click();
  await page.waitForFunction(()=>FR.out.length===1);
  const fr1=await page.evaluate(()=>Object.entries(__fs.S).filter(([k])=>k.startsWith('yrFr/')).map(([k,v])=>[k.slice(5),v.a,v.b,v.by,v.st]));
  const mine=await page.evaluate(()=>FR.pid);const a=mine<'BBBBBB3'?mine:'BBBBBB3',b=mine<'BBBBBB3'?'BBBBBB3':mine;
  assert.deepEqual(fr1,[[a+'_'+b,a,b,mine,'p']]);assert((await page.textContent('#fr-body')).includes('kabul bekleniyor'));ok('Kodla istek gönderildi (a<b, by=ben, durum p); "kabul bekleniyor" görünür');
  // Yanlış kod / kendi kodu
  await page.fill('#fr-code','ZZZZZZ2');await page.getByRole('button',{name:/Arkadaş Ekle/}).click();await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>FR.out.length),1);
  await page.fill('#fr-code',mine);await page.getByRole('button',{name:/Arkadaş Ekle/}).click();await page.waitForTimeout(100);assert((await page.textContent('#toast')).includes('kendi kodun'));ok('Olmayan kod ve kendi kod reddedilir');
  // Karşı taraf kabul eder → arkadaş, çevrim içi
  await page.evaluate(([k])=>{__fs.S['yrFr/'+k].st='ok';__fs.notify('yrFr');},[a+'_'+b]);
  await page.waitForFunction(()=>FR.list.length===1);await page.waitForFunction(()=>document.getElementById('fr-body').textContent.includes('🦊 Kurnaz Tilki')&&document.getElementById('fr-body').textContent.includes('çevrim içi'));ok('Kabul edilince arkadaş listesinde, çevrim içi nokta ve ad görünür');
  // Gelen istek
  await page.evaluate(()=>{__fs.S['yrKart/CCCCCC4']={owner:'u-c',nick:'🦁 Kral Aslan'};const m=FR.pid,a=m<'CCCCCC4'?m:'CCCCCC4',b=m<'CCCCCC4'?'CCCCCC4':m;__fs.S['yrFr/'+a+'_'+b]={a,b,by:'CCCCCC4',st:'p'};__fs.notify('yrFr');});
  await page.waitForFunction(()=>FR.inc.length===1&&document.getElementById('fr-body').textContent.includes('Gelen istekler'));
  await page.getByRole('button',{name:/✓ Kabul/}).click();await page.waitForFunction(()=>FR.list.length===2);ok('Gelen istek kabul edilir');
  // Arkadaşlıktan çıkar (onaylı)
  await page.locator('button[aria-label="Arkadaşlıktan çıkar"]').first().click();await page.getByRole('button',{name:'Evet'}).click();await page.waitForFunction(()=>FR.list.length===1);ok('Arkadaşlıktan çıkarma onay ister ve siler');
  // Davet gönder
  await page.evaluate(()=>{const f=FR.list[0];YR.code='ODA11';YR.nick='🐼 Cesur Panda';YR.room={created:12345,mode:'duel',subject:'baharat'};FR.nick[f]=FR.nick[f]||'x';FR.call={to:f,nick:FR.nick[f]};return frInvSend();});
  const dv=await page.evaluate(()=>Object.entries(__fs.S).filter(([k])=>k.startsWith('yrDav/')).map(([k,v])=>[k.slice(6),v.from,v.to,v.code,v.rid,v.mode,!!v.ts.toMillis]));
  assert.equal(dv.length,1);assert.equal(dv[0][0],dv[0][1]+'_'+dv[0][2]+'_ODA11');assert.equal(dv[0][4],12345);assert(dv[0][6]);ok('Davet: gönderen_alıcı_oda kimliği, oda nesli ve sunucu zamanı yazıldı');
  // Gelen davet: oyun sırasında gösterilmez, menüde gösterilir
  await page.evaluate(()=>{window.__joined=null;window.yrJoin=c=>{window.__joined=c;};YR.active=true;go('home');const m=FR.pid;__fs.S['yrDav/BBBBBB3_'+m+'_KOD22']={from:'BBBBBB3',to:m,nick:'🦊 Kurnaz Tilki',code:'KOD22',rid:1,subject:'Baharat',mode:'duel',ts:{toMillis:()=>Date.now()}};FR.invs=[{id:'BBBBBB3_'+m+'_KOD22',...__fs.S['yrDav/BBBBBB3_'+m+'_KOD22']}];frInvCheck();});
  assert.equal(await page.locator('#frInvY').count(),0);ok('Oyun sırasında davet gösterilmez');
  await page.evaluate(()=>{YR.active=false;frInvCheck();});assert.equal(await page.locator('#frInvY').count(),1);
  assert((await page.textContent('.modal')).includes('Kurnaz Tilki')&&(await page.textContent('.modal')).includes('kapışmaya çağırıyor'));ok('Menüde davet penceresi: "… seni kapışmaya çağırıyor"');
  await page.click('#frInvY');await page.waitForFunction(()=>window.__joined==='KOD22');
  assert.equal(await page.evaluate(()=>Object.keys(__fs.S).filter(k=>k.startsWith('yrDav/BBBBBB3_')).length),0);ok('Kabul edince odaya kodsuz girilir ve davet silinir');
  // Eski davet gösterilmez
  await page.evaluate(()=>{const m=FR.pid;FR.invs=[{id:'x',from:'B',nick:'Eski',code:'OLD11',subject:'x',mode:'duel',ts:{toMillis:()=>Date.now()-700000}}];frInvCheck();});assert.equal(await page.locator('#frInvY').count(),0);ok('10 dakikadan eski davet gösterilmez');
  // Oyun sonu düğmesi
  const btns=await page.evaluate(()=>{const f=FR.list[0];return [frBtn({pid:'DDDDDD5',nick:'🐯 Güçlü Kaplan'},true),frBtn({pid:FR.pid,nick:'x'},true),frBtn({pid:f,nick:'x'},true),frBtn({nick:'x'},true)];});
  assert(btns[0].includes('➕ 🐯 Güçlü Kaplan arkadaş ekle'));assert.equal(btns[1],'');assert.equal(btns[2],'');assert.equal(btns[3],'');ok('Oyun sonu: "➕ … arkadaş ekle"; kendine, arkadaşa ya da kodsuz oyuncuya düğme yok');
  // Oyuncu belgesine pid yazılır
  const pb=await page.evaluate(()=>yrPlayerBase('x',1));assert.equal(pb.pid,await page.evaluate(()=>FR.pid));ok('Oyuncu belgesine kendi kodun yazılır');
  // Profil değişince kimlik değişir
  await page.evaluate(()=>{lsSet('profiles',['🐼 Cesur Panda','🦁 Kral Aslan']);pickProfile('🦁 Kral Aslan');});await page.waitForFunction(()=>FR.prof==='🦁 Kral Aslan'&&FR.ready);
  const k2=await page.evaluate(()=>[FR.pid,__fs.S['yrKim/u-me'].pid]);assert.equal(k2[0],k2[1]);assert.notEqual(k2[0],me.pid);ok('Başka profile geçince kendi kodu ve aktif profil değişir');
  assert(errors.length===0,'JS hatası: '+errors.join('|'));ok('Tarayıcıda yakalanmamış JavaScript hatası yok');
 }catch(e){console.error('FAIL',e);process.exitCode=1;}finally{await browser.close();server.close();}
})();
