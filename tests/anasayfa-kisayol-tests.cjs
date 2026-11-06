const assert=require('node:assert/strict'),open=require('./helpers/dom-app.cjs');
(async()=>{const nick='🐼 Cesur Panda',x=await open('',{seed:{kv_profiles:[nick],kv_sonProfil:nick,kv_ad_map:{[nick]:{e:0,n:0,c:true}}}}),w=x.w;let n=0;const ok=s=>{n++;console.log('PASS '+s);};
 try{w.go('home');assert(!w.document.querySelector('[onclick="haftaOpen()"]'));assert(!w.document.querySelector('.hafta-kart'));assert(!w.rkHomeHTML().includes('haftaOpen'));ok('Haftalık yarışmanın iki ana sayfa girişi kaldırıldı');
 w.go('racemenu');assert(w.document.querySelector('[onclick="anaSayfa()"]'));w.anaSayfa();assert.equal(w.st.screen,'home');ok('Oyun menüsünden tek düğmeyle ana sayfa');
 w.eval("YR.active=true;YR.code=null;YR.room={mode:'race',status:'lobby'}");w.go('racelobby');w.anaSayfa();assert.equal(w.st.screen,'home');assert.equal(w.eval('YR.active'),false);ok('Lobiden ana sayfa odayı kapatır');
 w.eval("YR.active=true;YR.code=null;YR.room={mode:'race',status:'playing'};YR.g={done:false,k:0};");w.st.screen='raceplay';w.anaSayfa();assert.notEqual(w.st.screen,'home');assert(w.document.getElementById('mYes'));w.document.getElementById('mYes').click();assert.equal(w.st.screen,'home');assert.equal(w.eval('YR.active'),false);ok('Aktif oyunda çıkış onayı sonrası doğrudan ana sayfa');
 w.eval("CV={over:true}");w.st.screen='cvover';w.anaSayfa();assert.equal(w.st.screen,'home');assert.equal(w.eval('CV'),null);ok('Meydan Okuma tamamlanınca ana sayfa durumunu temizler');
 w.st.screen='quiz';w.st.kDone=false;w.st.sess={id:'test',p:nick,qs:[{}]};w.anaSayfa();assert(w.document.getElementById('mYes'));w.document.getElementById('mYes').click();assert.equal(w.st.screen,'home');assert.equal(w.st.sess,null);assert.equal(w.st.run,false);ok('Bireysel yarım çalışma onayla bırakılır, süre durur');
 console.log(n+' kontrol geçti.');
 }finally{await new Promise(setImmediate);x.dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
