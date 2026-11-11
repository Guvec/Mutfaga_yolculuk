/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Yeni arena7 sözleşmesi, üst sıralama ve puansız tekrar. */
const assert=require('node:assert/strict'),open=require('./helpers/dom-app.cjs'),model=require('../js/arena-model.js');
let n=0;const ok=s=>{n++;console.log('PASS '+s);};
(async()=>{const {w,dom}=await open();try{
 const name=w.eval('AD_KAR[0][0]+" "+AD_KAR[0][1]');w.lsSet('profiles',[name]);w.lsSet('ad_map',{[name]:{e:0,n:0,c:true}});w.st.prof=name;w.st.guest=false;
 w.yrCreateOpen('arena');assert.equal(w.eval('YR.cfg.arenaTopic'),'butun');assert.match(w.document.getElementById('app').textContent,/Yedi yanlış/);assert(w.document.querySelector('[onclick="rkOpenBoard(\'oy-arena2\')"]'));assert(!w.document.getElementById('app').textContent.includes('Sıralama yükleniyor'));ok('Er Meydanı girişinde yalnız Sıralama düğmesi vardır; varsayılan tüm konulardır');
 const room={mode:'arena',av:2,rev:'arena3-test',scope:'konu',subject:'baharat',host:'host',created:1,n:75,status:'playing',roster:['u1','u2','u3']};
 const qs=w.ArenaModel.buildSelected(w.yrAllData(),42,w.YarisModel,room),yr=w.eval('YR');Object.assign(yr,{room,qs,active:true,code:'SEVEN',nick:name,players:[]});w.__svc={uid:'u1',setPlayer:async()=>{}};w.eval('yrTransport=window.__svc');
 w.rkCountLeaders=()=>{};w.arStart();for(let i=0;i<6;i++){w.arRound(i);w.arMine(-100,'bad');assert.equal(w.eval('AR.over'),false);}w.arRound(6);w.arMine(-100,'bad');assert.equal(w.eval('AR.over'),true);assert.equal(w.eval('AR.myR.length'),7);assert.equal(w.arStats(w.eval('AR.myR')).bad,7);assert.equal(model.errorLimit(room),7);assert.equal(model.errorLimit({rev:'arena2-old'}),4);ok('Yeni oda altı yanlışta sürer, yedinci yanlışta biter; eski oda dört yanlış sözleşmesini korur');
 w.rutbeMatch=()=>{};w.rkWinAdd=()=>{};w.oduKazan=()=>{};
 yr.players=['u1','u2','u3'].map((uid,i)=>({uid,nick:uid,r:Array(7).fill(-100-i),done:true,left:false,pending:false,fromCache:false}));w.arSync();assert.equal(w.eval('AR.finalized'),true);assert(w.document.querySelector('.ar-final-ranks'));assert(w.document.querySelector('.ar-winner'));assert.match(w.document.getElementById('yanlisAcBtn').textContent,/Yanlışlarımı çalış \(7\)/);ok('Kesin sonuçta maç sıralaması, birincinin tacı ve kişisel tekrar düğmesi görünür');
 const pid=w.rkPid(name);assert.equal(Object.keys(w.yanlisKuyruk(pid)).length,7);w.arSync();assert.equal(Object.keys(w.yanlisKuyruk(pid)).length,7);ok('Yalnız yanıtlanan yedi yanlış saklanır; tekrar snapshot çoğaltmaz');
 w.yanlisAc();assert.equal(w.st.screen,'yanlislarim');assert.match(w.document.getElementById('app').textContent,/Doğru cevap/);assert.equal(w.document.querySelectorAll('.yanlis-secenekler button').length,0);
 w.arSync();assert.equal(w.st.screen,'yanlislarim');
 for(let i=0;i<7;i++)w.yanlisDevam();
 const q=w.eval('YANLIS_TUR.items[0]');w.yanlisYanit(q.choices.findIndex(x=>x.id===q.correct));assert.equal(w.st.sess,null);ok('Tekrar doğruyu öğretir ve sıralama sonucu üretmez');
 w.yanlisKapat();w.st.subject='baharat';w.go('pekmenu');assert(w.document.getElementById('yanlisAcBtn'));ok('Yanlış sorular konu içindeki Pekiştiriyorum menüsünden daha sonra da açılır');
 w.go('home');assert(!w.document.querySelector('.ar-home-leaders'));assert(w.document.querySelector('[onclick="rkOpenBoard()"]'));ok('Ana sayfada lider alanı kaldırılmıştır; Sıralama düğmesi korunur');
 console.log(n+' kontrol geçti.');
 }finally{for(let i=0;i<5;i++)await new Promise(setImmediate);dom.window.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
