/* Arena4: gerçek SDK, on kişilik kadro, süre sınırı ve ortak final. */
const assert=require('node:assert/strict'),fs=require('node:fs');
const {initializeTestEnvironment}=require('@firebase/rules-unit-testing'),sdk=require('firebase/firestore'),model=require('../js/arena-model.js');
require('../js/yaris-baglanti.js');
(async()=>{let checks=0;const pass=s=>{checks++;console.log('PASS '+s);};const modern={rev:'arena4-test'};
 assert.deepEqual([0,5,6,11,12,72,78].map(n=>model.limit(n,modern)),[20000,20000,19000,19000,18000,8000,7000]);assert.equal(model.maxPlayers(modern),10);assert.equal(model.errorLimit(modern),7);pass('20 saniye, altı doğruda bir saniye, yedi saniye alt sınırı');
 assert.equal(model.stats([20000,20000],7,modern).ok,2);assert.equal(model.stats([20000],7,{rev:'arena3-test'}).ok,0);pass('Yeni süreyle sıralama hesaplanır; eski oda sözleşmesi korunur');
 const env=await initializeTestEnvironment({projectId:'demo-mesleki-yaris',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync('ci/firebase/firestore.rules','utf8')}});try{
 await env.clearFirestore();const clients=Array.from({length:11},(_,i)=>{const c=new globalThis.YarisFirebase({});c.uid='p'+i;c.db=env.authenticatedContext(c.uid).firestore();c.sdk=sdk;c.connect=async()=>c;return c;});
 const made=await clients[0].create({mode:'arena',av:2,roster:[],subject:'mutfak-araclari',scope:'butun',kind:'gorsel',set:0,n:75,lim:20,seed:42,rev:'arena4-test',hostNick:'Host'},'TEN99');
 const row=i=>({nick:'Chef '+i,score:0,ok:0,bad:0,n:0,tt:0,done:false,left:false,ts:Date.now(),rid:made.room.created,m:0,r:[],pr:[],loaded:true,ready:true});
 await clients[0].setPlayer(made.code,row(0));for(let i=1;i<10;i++)await clients[i].join(made.code,'Chef '+i,row(i),made.room.created);assert.equal((await clients[0].peek(made.code)).cnt,10);pass('On gerçek SDK istemcisi odaya katılır');
 await assert.rejects(()=>clients[10].join(made.code,'Chef 10',row(10),made.room.created),/dolu/);assert.equal((await clients[0].peek(made.code)).cnt,10);pass('On birinci kişi reddedilir ve sayaç değişmez');
 await clients[9].setPlayer(made.code,{...row(9),loaded:false});await assert.rejects(()=>clients[0].start(made.code));pass('Onuncu kişi yüklenmeden başlatılamaz');
 await clients[9].setPlayer(made.code,row(9));await clients[0].start(made.code);const room=await clients[0].peek(made.code);assert.equal(room.roster.length,10);assert.equal(room.status,'playing');pass('On yüklü oyuncu Firestore okuma sınırını aşmadan başlar');
 const step=(p,v)=>({...p,r:p.r.concat(v),n:p.n+1,ok:p.ok+(v>0?1:0),score:p.ok+(v>0?1:0),bad:p.bad+(v<0?1:0),tt:p.tt+Math.abs(v),done:p.bad+(v<0?1:0)===7||p.n+1===75,ts:Date.now()});
 let p=row(0);await assert.rejects(()=>clients[0].setPlayer(made.code,step(p,20001)));pass('İlk soruda 20 saniyenin üstü reddedilir');
 for(let j=0;j<6;j++){p=step(p,20000);await clients[0].setPlayer(made.code,p);}await assert.rejects(()=>clients[0].setPlayer(made.code,step(p,19001)));p=step(p,19000);await clients[0].setPlayer(made.code,p);pass('Altı doğrudan sonraki soru 19 saniyeyle doğrulanır');
 const ended=[];for(let i=0;i<10;i++){let x=i===0?p:row(i);for(let j=0;j<7;j++){x=step(x,-100);await clients[i].setPlayer(made.code,x);}ended.push({...await clients[i].getPlayer(made.code),uid:clients[i].uid,pending:false,fromCache:false});}
 assert(model.complete(room.roster,ended));assert(ended.every(x=>x.bad===7&&x.done));const finals=await Promise.all(clients.slice(0,10).map(async c=>{const snap=await sdk.getDocs(sdk.collection(c.db,'oyunOdalari',made.code,'players'));return JSON.stringify(model.ranks(snap.docs.map(d=>({...d.data(),uid:d.id})),7,room).map(p=>[p.uid,p.ok,p.tt,p.rank]));}));assert(finals.every(x=>x===finals[0]));pass('On istemci yedi yanlışla bitirir ve aynı kesin sıralamayı okur');
 console.log(checks+' kontrol geçti.');
 }finally{await env.cleanup();}
})().catch(e=>{console.error(e);process.exitCode=1;});
