/* Ortak yazma kuyruğu, kapışma eşitliği ve yarışma finali. Gerçek betikler, taklit taşıma. */
const assert=require('node:assert/strict'),open=require('./helpers/dom-app.cjs');
const flush=async()=>{for(let i=0;i<3;i++)await new Promise(setImmediate);};
(async()=>{const apps=await Promise.all([open(),open()]),ws=apps.map(a=>a.w),rows={},room={mode:'duel',subject:'baharat',scope:'konu',kind:'gorsel',set:0,n:10,lim:15,seed:42,host:'u1',created:Date.now(),status:'playing'},roster=['u1','u2'];let n=0;
 const ok=s=>{n++;console.log('PASS '+s);};
 const publish=()=>{const p=Object.entries(rows).map(([uid,p])=>({uid,...JSON.parse(JSON.stringify(p)),pending:false,fromCache:false}));for(const w of ws)w.yrPlayersChanged(JSON.parse(JSON.stringify(p)));};
 for(let i=0;i<2;i++){const w=ws[i],uid=roster[i],yr=w.eval('YR');w.st.prof='Oyuncu '+i;w.st.guest=false;rows[uid]={nick:w.st.prof,r:[],pr:[],m:0,n:0,ok:0,bad:0,score:0,done:false,tt:0,rid:room.created,ts:Date.now()};
  w.__svc={uid,async setPlayer(code,pd){rows[uid]=JSON.parse(JSON.stringify(pd));publish();}};w.eval('yrTransport=window.__svc');w.yrService=()=>w.__svc;Object.assign(yr,{active:true,code:'DUEL1',room:JSON.parse(JSON.stringify(room)),nick:w.st.prof,host:i===0,players:[]});Object.defineProperty(w.performance,'now',{value:()=>10000,configurable:true});w.rutbeMatch=()=>{};w.rkWinAdd=()=>{};w.oduKazan=()=>{};
 }
 assert(ws[0].yrRoomRev(room).startsWith('rooms2-'));assert.notEqual(ws[0].yrRoomRev(room),ws[0].yrRev('baharat'));
 publish();for(const w of ws){w.duStart(0);w.duRound(0);}await flush();
 const answer=(w,ms)=>{const d=w.eval('DU'),q=w.eval('YR').qs[d.k];d.t0=10000-ms;w.duAns(q.choices.findIndex(c=>c.id===q.correct));};
 answer(ws[0],1000);await flush();assert.equal(ws[0].eval('DU.ph'),'wait');ws[0].eval('DU.force={0:1}');assert.equal(ws[0].duTheirs()[0],undefined);ok('Kapışmada eksik rakip cevabı iki saniye varsayımıyla yanlış sayılmaz');
 answer(ws[1],1050);await flush();assert(ws[1].eval('DU.myR[0]')>0);assert.equal(ws[0].eval('DU.w'),0);assert.equal(ws[1].eval('DU.w'),0);ok('Gecikmeli gelen 200 ms içindeki iki doğru iki tarafta da beraberliktir');
 for(const w of ws)w.duRound(1);answer(ws[0],1000);answer(ws[1],3000);await flush();assert.equal(ws[0].eval('DU.sc[0]'),1);assert.equal(ws[1].eval('DU.sc[1]'),1);ok('Farklı süredeki ortak cevaplar iki tarafta aynı kazananı verir');
 const a=ws[0],yr=a.eval('YR');yr.players=[{uid:'u1',done:true,pending:false,fromCache:false},{uid:'u2',done:false,pending:false,fromCache:false}];yr.seen.u2=Date.now()-120000;assert.equal(a.yrAllDone(),false);yr.players[1].done=true;yr.players[0].pending=true;assert.equal(a.yrAllDone(),false);yr.players[0].pending=false;assert.equal(a.yrAllDone(),true);ok('Oyun Odası yerel kopma tahminini veya bekleyen yazıyı kesin final saymaz');
 let gate,rejectOld;const sent=[];a.__svc={async setPlayer(code,pd){sent.push([code,pd]);if(code==='OLD')await new Promise((res,rej)=>{gate=res;rejectOld=rej;});}};yr.code='OLD';yr.room={...room,created:1};yr.writer=null;const pd={...rows.u1,r:[100],pr:[]};a.yrSend(pd);pd.r.push(200);assert.equal(sent[0][1].r.length,1);ok('Kuyruk cevap dizisinin değişebilir referansını tutmaz');
 yr.code='NEW';yr.room={...room,created:2};yr.writer=null;a.yrSend({...pd,r:[],n:0});await flush();rejectOld(Error('eski oda ağı'));await flush();assert.equal(yr.warn||'','');assert.equal(yr.pend,null);assert.equal(sent[1][0],'NEW');ok('Eski odanın geç gelen hatası yeni odanın uyarı ve kuyruğunu bozmaz');
 let tones=0;a.AudioContext=function(){this.currentTime=0;this.state='running';this.destination={};this.createOscillator=()=>({frequency:{},connect(){},start(){tones++;},stop(){}});this.createGain=()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});};
 a.lsSet('sakin',false);a.EFEKT.ayarla(true);const speech=a.SES.acik,music=a.MUZIK.acikMi();assert.equal(a.EFEKT.cal('kilic'),true);assert(tones>0);const before=tones;a.EFEKT.ayarla(false);assert.equal(a.EFEKT.cal('kilic'),false);assert.equal(tones,before);ok('Kılıç efekti özgün sentezle tetiklenir; efekt kapalı tercihi çalışır');
 a.EFEKT.ayarla(true);a.lsSet('sakin',true);assert.equal(a.EFEKT.cal('kilic'),false);assert.equal(tones,before);assert.equal(a.SES.acik,speech);assert.equal(a.MUZIK.acikMi(),music);ok('Sakin mod efekti durdurur; müzik ve sesli okuma tercihi korunur');
 for(const a of apps){await flush();a.dom.window.close();}console.log(n+' kontrol geçti.');
})().catch(e=>{console.error(e);process.exitCode=1;});
