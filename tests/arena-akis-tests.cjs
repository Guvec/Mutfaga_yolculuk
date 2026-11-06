/* Gerçek uygulama betikleriyle üç istemci, geciken yazı ve ortak final. Fiziksel cihaz testi değildir. */
const assert=require('node:assert/strict'),open=require('./helpers/dom-app.cjs');
const ym=require('../js/yaris-model.js'),model=require('../js/arena-model.js'),fs=require('fs'),path=require('path');
const data={};for(const k of ['mutfak-araclari','baharat'])data[k]=JSON.parse(fs.readFileSync(path.join(__dirname,'../content',k,'icerik.json')));
const qs=model.build(data,42,ym);assert.equal(qs.length,75);assert.equal(new Set(qs.map(q=>q.id)).size,75);assert.equal(qs.filter(q=>q.subject==='mutfak-araclari').length,38);assert.equal(qs.filter(q=>q.subject==='baharat').length,37);assert.deepEqual(qs,model.build(data,42,ym));
assert.equal(model.limit(0),15000);assert.equal(model.limit(5),14000);assert.equal(model.limit(74),7000);
let n=0;const ok=s=>{n++;console.log('PASS '+s);},flush=async()=>{for(let i=0;i<4;i++)await new Promise(setImmediate);};
(async()=>{
 ok('75 benzersiz, aynı tohumda aynı iki konulu görsel soru; 15→7 saniye sınırları');
 const apps=await Promise.all([open(),open(),open()]),rows={},ws=apps.map(a=>a.w),roster=['u1','u2','u3'],room={mode:'arena',av:2,roster,subject:'mutfak-araclari',scope:'butun',kind:'gorsel',set:0,n:75,lim:15,seed:42,rev:'arena2-test',host:'u1',status:'playing',cnt:3,created:Date.now()};
 let hold=false,release=null;const order=[],wins=[0,0,0];
 const publish=()=>{const list=Object.entries(rows).map(([uid,p])=>({uid,...JSON.parse(JSON.stringify(p)),pending:false,fromCache:false}));for(const w of ws)if(w.eval('YR.active'))w.yrPlayersChanged(JSON.parse(JSON.stringify(list)));};
 for(let i=0;i<ws.length;i++){const w=ws[i],uid=roster[i],name=w.eval('AD_KAR['+i+'][0]+" "+AD_KAR['+i+'][1]');w.lsSet('profiles',[name]);w.lsSet('ad_map',{[name]:{e:i,n:0,c:true}});w.st.prof=name;w.st.guest=false;
  rows[uid]={nick:name,r:[],score:0,ok:0,bad:0,n:0,tt:0,done:false,left:false,ts:Date.now(),rid:room.created};
  w.__svc={uid,async setPlayer(code,pd){order.push([uid,pd.n]);if(uid==='u1'&&pd.n===1&&hold){hold=false;await new Promise(r=>release=r);}rows[uid]=JSON.parse(JSON.stringify(pd));publish();},async arenaExpire(){}};
  w.eval('yrTransport=window.__svc');w.yrService=()=>w.__svc;const yr=w.eval('YR');Object.assign(yr,{active:true,code:'ABC12',room:JSON.parse(JSON.stringify(room)),nick:name,qs:JSON.parse(JSON.stringify(qs)),players:[],resumePlayer:null});
  w.rutbeMatch=()=>{};w.oduKazan=()=>{};w.rkWinAdd=(board)=>{assert.equal(board,'oy-arena2');wins[i]++;};Object.defineProperty(w.performance,'now',{value:()=>10000,configurable:true});
 }
 publish();for(const w of ws){w.arStart();w.arRound(0);}await flush();
 const ar=w=>w.eval('AR'),answer=(w,right,ms=200)=>{const a=ar(w);a.t0=10000-ms;const q=w.eval('YR').qs[a.k],i=q.choices.findIndex(c=>c.id===q.correct);w.arAns(right?i:(i+1)%4);if(!ar(w).over)w.arNext();};
 hold=true;answer(ws[0],true);answer(ws[0],true);assert.equal(ar(ws[0]).k,2);assert.equal(ar(ws[1]).k,0);await flush();assert(release);assert.equal(order.filter(x=>x[0]==='u1'&&x[1]===2).length,0);ok('Doğru bilen diğerlerini ve geciken ağ yazısını beklemeden ilerler; yazma sırası korunur');release();await flush();assert.equal(rows.u1.n,2);assert.equal(rows.u1.r.length,2);
 answer(ws[0],true);for(let i=0;i<4;i++)answer(ws[0],false);await flush();assert.equal(ar(ws[0]).over,true);assert.equal(ar(ws[0]).finalized,false);assert.deepEqual(wins,[0,0,0]);assert.equal(rows.u1.bad,4);ok('Dört yanlışta yalnız kendi denemesi biter; diğerleri bitmeden kesin sonuç/ödül yok');
 for(let i=0;i<2;i++)answer(ws[1],true,300);for(let i=0;i<4;i++)answer(ws[1],false,300);
 for(let i=0;i<3;i++)answer(ws[2],true,500);for(let i=0;i<4;i++)answer(ws[2],false,500);await flush();
 const finals=ws.map(w=>JSON.stringify(w.arRanks().map(p=>({uid:p.uid,ok:p.ok,tt:p.tt,rank:p.rank}))));assert(finals.every(x=>x===finals[0]));assert(ws.every(w=>ar(w).finalized));assert.deepEqual(wins,[1,0,0]);ok('Üç farklı hız ve soru sayısında aynı kesin sıralama; eşit doğruda süre; yalnız bir ödül');
 publish();publish();await flush();assert.deepEqual(wins,[1,0,0]);const a=ws[0];a.eval('YR').resumePlayer=JSON.parse(JSON.stringify(rows.u1));a.arStart();a.arSync();assert.deepEqual(wins,[1,0,0]);assert.equal(ar(a).finalized,true);ok('Tekrarlanan snapshot ve bitmiş odaya dönüş ödülü tekrar vermez');
 const committed=Object.entries(rows).map(([uid,p])=>({uid,...p,pending:false,fromCache:false}));assert(model.complete(roster,committed));assert(!model.complete(roster,committed.map((p,i)=>i? p:{...p,pending:true})));assert(!model.complete(roster,committed.map(p=>({...p,fromCache:true}))));ok('Yerel bekleyen yazı ve önbellek, sunucu onayı yerine geçmez');
 const b=ws[1],yrb=b.eval('YR');ar(b).over=false;ar(b).myR=[100,100,100];ar(b).ph='q';yrb.writer={code:'ABC12',rid:room.created,items:[{n:3}],running:false};yrb.pend={n:3};yrb.warn='ağ';const old=rows.u2;rows.u2={...old,r:[100],n:1,ok:1,bad:0,tt:100,done:true,left:true};publish();assert.equal(ar(b).myR.length,1);assert.equal(yrb.writer.retired,true);assert.equal(yrb.writer.items.length,0);assert.equal(yrb.pend,null);assert.equal(yrb.warn,'');ok('Sunucuda bağlantısı bitirilen oyuncu yerel fazla yanıt ve kuyruğu bırakır; ortak sayıya döner');
 const c=ws[2],yrc=c.eval('YR');const rev=c.yrRoomRev(room);c.eval("CONTENT['bulasik-makinesi-temizligi']=null");assert.equal(c.yrRoomRev(room),rev);await c.yrReadyRoom(room);ok('Arena, dışlanan konunun yüklenmesine/sürümüne bağlı değil');
 for(const a of apps){await flush();a.dom.window.close();}console.log(n+' kontrol geçti.');
})().catch(e=>{console.error(e);process.exitCode=1;});
