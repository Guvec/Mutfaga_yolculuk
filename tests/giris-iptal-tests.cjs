/* Son seçim ve ekrandan ayrılma, gerçek DOM ve denetimli saat. */
const assert=require('node:assert/strict');
const open=require('./helpers/dom-app.cjs');
(async()=>{
 const {dom,w}=await open();
 try{
  w.SES.acik=false;
  const timers=new Map();let id=0;
  w.setTimeout=fn=>{timers.set(++id,fn);return id;};w.clearTimeout=n=>timers.delete(n);
  w.go('giris');
  timers.clear();
  const click=x=>w.document.querySelector('[data-food="'+x+'"]').click();
  const stage=w.document.getElementById('actor');
  click('cake');assert.equal(timers.size,1);
  click('lemon');assert.equal(timers.size,1,'Önceki tepkinin zamanlayıcısı iptal edilmeli');
  assert.equal(w.document.getElementById('speech').textContent,'Limon ekşi.');
  assert.match(stage.querySelector('img').src,/panda-limon/);
  Object.defineProperty(w.document,'hidden',{configurable:true,value:true});
  w.document.dispatchEvent(new w.Event('visibilitychange'));
  assert.match(stage.querySelector('img').src,/panda\.webp$/);
  assert.equal(timers.size,0,'Gizli sekmede bekleyen tepki kalmamalı');
  click('cake');assert.equal(timers.size,0);
  Object.defineProperty(w.document,'hidden',{configurable:true,value:false});
  click('lemon');assert.equal(timers.size,1);
  const pending=[...timers.keys()][0];
  w.document.getElementById('gStart').click();
  assert.equal(w.st.screen,'home');assert.equal(timers.has(pending),false,'Ayrılırken tepki zamanlayıcısı kalmamalı');
  console.log('PASS Son seçim, gizli sekme ve ayrılma temizliği');
 }finally{dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
