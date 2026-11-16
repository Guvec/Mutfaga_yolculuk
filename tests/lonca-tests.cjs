const assert=require('node:assert/strict'),open=require('./helpers/dom-app.cjs');
(async()=>{
 const x=await open('',{seed:{kv_profiles:['🐥 Huzurlu Civciv'],kv_sonProfil:'🐥 Huzurlu Civciv',kv_ad_map:{'🐥 Huzurlu Civciv':{e:164,n:0,c:true}},kv_sifirlama:'2026-11-10-tam'}}),w=x.w;let n=0;
 const ok=t=>{n++;console.log('PASS '+t);};
 try{
  assert.equal(w.st.prof,'🐥 Huzurlu Civciv');assert.equal(w.st.screen,'home');assert.equal(w.document.querySelectorAll('.lc-card').length,4);ok('Kayıtlı profil, dört ayrı menü');
  const before=w.localStorage.getItem('kv_rutbe_dal');w.lsSet('ana_yol','pasta');w.render();assert.match(w.document.querySelector('.lc-rank').textContent,/Pastacılık/);assert.equal(w.localStorage.getItem('kv_rutbe_dal'),before);ok('Son dal gerçek rütbede, ilerleme değişmez');
  w.document.querySelector('.lc-journey').click();assert.equal(w.st.screen,'loncayollar');assert.equal(w.document.querySelectorAll('.lc-path').length,3);w.back();assert.equal(w.st.screen,'home');ok('Üç yol ve ana sayfaya dönüş');
  const opener=w.document.querySelector('.lc-info');opener.focus();opener.click();assert(w.st.modalOpen);assert.equal(w.document.querySelectorAll('#ov [role=dialog]').length,1);w.loncaBilgi('lig');assert.equal(w.document.querySelectorAll('#ov [role=dialog]').length,1);ok('Aynı anda tek bilgi parşömeni');
  const off=w.document.getElementById('lcHelpOff');off.checked=true;off.dispatchEvent(new w.Event('change'));assert.equal(w.ls('lonca_yardim',true),false);w.closeModal();w.loncaBilgi('sira');assert.match(w.document.querySelector('#ov').textContent,/sıralamanı/);w.closeModal();ok('Otomatik yardım kapanınca elle bilgi açılır');
  w.anaAyarlar();const f=w.document.getElementById('lcFont');f.value='sade';f.dispatchEvent(new w.Event('change'));assert.equal(w.document.documentElement.dataset.font,'sade');assert.equal(w.ls('lonca_yazi'),'sade');w.closeModal();w.render();assert.equal(w.document.documentElement.dataset.font,'sade');ok('Lexend seçimi hatırlanır');
  w.SES.acik=true;w.MUZIK.kapat();w.anaAyarlar();assert.equal(w.SES.acik,true);assert.equal(w.MUZIK.acikMi(),false);w.closeModal();ok('Sesli okuma ve müzik bağımsız');
  const t=w.document.documentElement.dataset.theme;w.temaDegistir();assert.notEqual(w.document.documentElement.dataset.theme,t);assert.equal(w.localStorage.getItem('mesleki-tema'),w.document.documentElement.dataset.theme);ok('Tema tercihi kalıcı');
  w.anaProfil();assert(w.document.getElementById('profileCode'));assert(w.document.querySelector('#ov .lc-parchment'));w.back();assert.equal(w.st.modalOpen,false);ok('Profil kodu ve geri ile parşömen kapanışı');
  w.anaYol('servis');assert.equal(w.st.screen,'yolpenceresi');w.back();assert.equal(w.st.screen,'home');ok('Mevcut dal işlevleri korunur');
  console.log(n+' lonca kontrolü geçti.');
 }finally{await new Promise(setImmediate);x.dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
