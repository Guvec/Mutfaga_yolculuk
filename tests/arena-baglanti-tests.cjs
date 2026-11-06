/* Gerçek Firestore SDK + bağlantı sınıfı: kadro, yeniden giriş, metadata ve üç ortak final. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {initializeTestEnvironment}=require('@firebase/rules-unit-testing'),sdk=require('firebase/firestore'),model=require('../js/arena-model.js');
require('../js/yaris-baglanti.js');const Constructor=globalThis.YarisFirebase;
const wait=async fn=>{const until=Date.now()+8000;while(!fn()){if(Date.now()>until)throw Error('Snapshot bekleme süresi doldu');await new Promise(r=>setTimeout(r,20));}};
(async()=>{const env=await initializeTestEnvironment({projectId:'demo-mesleki-yaris',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync(path.join(__dirname,'../ci/firebase/firestore.rules'),'utf8')}});const stop=[];let checks=0;const ok=s=>{checks++;console.log('PASS '+s);};
 try{await env.clearFirestore();const uids=['host','alice','bob'],clients=uids.map(uid=>{const c=new Constructor({});c.uid=uid;c.db=env.authenticatedContext(uid).firestore();c.sdk=sdk;c.connect=async()=>c;return c;});
 const spec={mode:'arena',av:2,roster:[],subject:'mutfak-araclari',scope:'butun',kind:'gorsel',set:0,n:75,lim:15,seed:42,rev:'arena2-sdk',hostNick:'Host'},made=await clients[0].create(spec,'SDK99'),code=made.code;
 const row=(nick)=>({nick,score:0,ok:0,bad:0,n:0,tt:0,done:false,left:false,ts:Date.now(),rid:made.room.created,m:0,r:[],pr:[],loaded:true,ready:true});
 await clients[0].setPlayer(code,row('Host'));await clients[1].join(code,'Alice',row('Alice'),made.room.created);await clients[2].join(code,'Bob',row('Bob'),made.room.created);await clients[0].start(code);
 const room=await clients[0].peek(code);assert.equal(room.status,'playing');assert.deepEqual(Array.from(room.roster),['alice','bob','host']);ok('Gerçek işlem üç yüklü oyuncuyu sabit kadroyla başlatır');
 const last=[[],[],[]],seen=[];clients.forEach((c,i)=>{stop.push(...c.watch(code,()=>{},ps=>{last[i]=ps;if(i===0)seen.push(...ps.filter(p=>p.uid==='host').map(p=>p.pending));},e=>{throw e;}));});await wait(()=>last.every(ps=>ps.length===3&&ps.every(p=>p.pending===false&&p.fromCache===false)));
 let own={...row('Host'),r:[100],n:1,ok:1,score:1,tt:100};await clients[0].setPlayer(code,own);await wait(()=>last.every(ps=>ps.find(p=>p.uid==='host')?.n===1&&ps.every(p=>p.pending===false)));assert(seen.includes(true));ok('Gerçek onSnapshot yerel bekleyen yazı ile sunucu onayını ayırır');
 await clients[0].join(code,'Host',row('Host'),made.room.created);assert.equal((await clients[0].getPlayer(code)).n,1);await clients[1].join(code,'Alice',row('Alice'),made.room.created);assert.equal((await clients[1].peek(code)).cnt,3);ok('Kurucu ve öğrenci aktif odaya dönünce kayıt/sayaç sıfırlanmaz');
 const outsider=new Constructor({});outsider.uid='outsider';outsider.db=env.authenticatedContext('outsider').firestore();outsider.sdk=sdk;outsider.connect=async()=>outsider;await assert.rejects(()=>outsider.join(code,'Late',row('Late'),made.room.created),/başlamış/);ok('Oyun başladıktan sonra yeni kişi katılamaz');
 for(let i=0;i<clients.length;i++){let p=i===0?own:row(i===1?'Alice':'Bob');for(let j=0;j<4;j++){p={...p,r:p.r.concat(-100),n:p.n+1,bad:p.bad+1,tt:p.tt+100,done:j===3,ts:Date.now()};await clients[i].setPlayer(code,p);}}
 await wait(()=>last.every(ps=>model.complete(room.roster,ps)));const finals=last.map(ps=>JSON.stringify(model.ranks(ps).map(p=>[p.uid,p.ok,p.tt,p.rank])));assert(finals.every(f=>f===finals[0]));ok('Üç gerçek SDK istemcisi aynı sunucu onaylı kesin sıralamayı üretir');
 await clients[0].join(code,'Host',row('Host'),made.room.created);const ended=await clients[0].getPlayer(code);assert.equal(ended.n,5);assert.equal(ended.done,true);ok('Bitmiş odaya dönüş finali korur');

 const all=await clients[0].create({...spec,rev:'arena3-sdk'},'SDKALL');assert.equal(all.room.n,75);ok('Tüm konular sözleşmesi gerçek SDK ile yeni oda oluşturur');

 const sevenRow=nick=>({...row(nick),rid:all.room.created});await clients[0].setPlayer(all.code,sevenRow('Host'));await clients[1].join(all.code,'Alice',sevenRow('Alice'),all.room.created);await clients[2].join(all.code,'Bob',sevenRow('Bob'),all.room.created);await clients[0].start(all.code);
 let seven=sevenRow('Host');for(let j=0;j<6;j++){seven={...seven,r:seven.r.concat(-100),n:seven.n+1,bad:seven.bad+1,tt:seven.tt+100,done:false,ts:Date.now()};await clients[0].setPlayer(all.code,seven);}assert.equal((await clients[0].getPlayer(all.code)).done,false);ok('Yeni kural altı yanlışı bitirmeden kabul eder');
 seven={...seven,r:seven.r.concat(-100),n:7,bad:7,tt:700,done:true,ts:Date.now()};await clients[0].setPlayer(all.code,seven);assert.equal((await clients[0].getPlayer(all.code)).done,true);ok('Yeni kural yedinci yanlışta bitişi kabul eder');
 await assert.rejects(clients[0].setPlayer(all.code,{...seven,r:seven.r.concat(-100),n:8,bad:8,tt:800,ts:Date.now()}));ok('Yedinci yanlıştan sonra sekizinci yanıt sunucuda reddedilir');
 const small=await clients[0].create({...spec,rev:'arena3-sdk',scope:'konu',subject:'kuver',n:17},'SDKSHORT');
 const shortRow=nick=>({...row(nick),rid:small.room.created});await clients[0].setPlayer(small.code,shortRow('Host'));await clients[1].join(small.code,'Alice',shortRow('Alice'),small.room.created);await clients[2].join(small.code,'Bob',shortRow('Bob'),small.room.created);await clients[0].start(small.code);
 const sr=await clients[0].peek(small.code),finished=[];
 for(let i=0;i<clients.length;i++){let p=shortRow(['Host','Alice','Bob'][i]);for(let j=0;j<17;j++){p={...p,r:p.r.concat(100),n:p.n+1,ok:p.ok+1,score:p.score+1,tt:p.tt+100,done:j===16,ts:Date.now()};await clients[i].setPlayer(small.code,p);}finished.push({...await clients[i].getPlayer(small.code),uid:uids[i],pending:false,fromCache:false});}
 assert(model.complete(sr.roster,finished));assert(finished.every(p=>p.n===17&&p.done));assert(model.ranks(finished).every(p=>p.rank===1));ok('Küçük konu havuzu 17. yanıtta üç kişide aynı bitiş ve ortak sıra üretir');
 console.log(checks+' bağlantı kontrolü geçti.');
 }finally{stop.forEach(f=>f());await env.cleanup();}
})().catch(e=>{console.error(e);process.exitCode=1;});
