/* 14.11: Canlıdaki "İzin yok" hatasını yeniden üretme: istemcinin gönderdiği arena5 odası ve oyuncu kaydı gerçek kurallarla. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {initializeTestEnvironment}=require('@firebase/rules-unit-testing'),sdk=require('firebase/firestore');
require('../js/yaris-baglanti.js');const Constructor=globalThis.YarisFirebase;
(async()=>{const env=await initializeTestEnvironment({projectId:'demo-mesleki-yaris',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync([path.join(__dirname,'../ci/firebase/firestore.rules'),path.join(__dirname,'../../firebase/firestore.rules')].find(f=>fs.existsSync(f)),'utf8')}});
 const sonuc=[];const dene=async(ad,fn)=>{try{await fn();sonuc.push('OK  '+ad);}catch(e){sonuc.push('HATA '+ad+' :: '+String(e&&e.message||e).slice(0,400));}};
 try{await env.clearFirestore();const mk=uid=>{const c=new Constructor({});c.uid=uid;c.db=env.authenticatedContext(uid).firestore();c.sdk=sdk;c.connect=async()=>c;return c;};
  const host=mk('hostuid'),ali=mk('aliuid');
  const base={mode:'arena',subject:'mutfak-araclari',scope:'butun',kind:'gorsel',set:0,n:150,lim:20,seed:12345,rev:'arena5-abc123',hostNick:'🍰 Çilekli Pasta',pub:true,ad:'🍰 Çilekli Pasta ile oyna',kilit:false,av:2,roster:[]};
  let made;
  await dene('arena5 oda kurma (istemcinin alanları)',async()=>{made=await host.create(base,'');});
  const row=(nick,rid)=>({left:false,ready:false,loaded:true,nick,score:0,ok:0,bad:0,n:0,tt:0,done:false,ts:Date.now(),rid,m:0,r:[],pr:[]});
  if(made){
   await dene('kurucunun oyuncu kaydı',async()=>{await host.setPlayer(made.code,row('🍰 Çilekli Pasta',made.room.created));});
   await dene('ikinci oyuncunun girişi',async()=>{await ali.join(made.code,'🐱 Aşçı Kedi',row('🐱 Aşçı Kedi',made.room.created),made.room.created);});
   await dene('ikinci oyuncu setPlayer',async()=>{await ali.setPlayer(made.code,row('🐱 Aşçı Kedi',made.room.created));});
   await dene('üçüncü ad Huzurlu Civciv',async()=>{const c=mk('civuid');await c.setPlayer(made.code,row('🐥 Huzurlu Civciv',made.room.created));});
  }
   // Tam akış: 3 oyuncu hazır, başlat, ilk cevaplar
   const r2=(nick)=>({...row(nick,made.room.created),ready:true});
   await dene('hazır güncellemeleri',async()=>{await host.setPlayer(made.code,r2('🍰 Çilekli Pasta'));await ali.setPlayer(made.code,r2('🐱 Aşçı Kedi'));await mk('civuid').setPlayer(made.code,r2('🐥 Huzurlu Civciv'));});
   await dene('oyunu başlat',async()=>{await host.start(made.code);});
   await dene('ilk doğru cevap (4,2 sn)',async()=>{const d=r2('🐱 Aşçı Kedi');Object.assign(d,{n:1,r:[4200],ok:1,score:1,tt:4200,ts:Date.now()});await ali.setPlayer(made.code,d);});
   await dene('ikinci cevap yanlış (6 sn)',async()=>{const d=r2('🐱 Aşçı Kedi');Object.assign(d,{n:2,r:[4200,-6000],ok:1,bad:1,score:1,tt:10200,ts:Date.now()});await ali.setPlayer(made.code,d);});
   // Arkadaş sistemi açıkken istemci pid ekler
   await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore();await sdk.setDoc(sdk.doc(db,'yrKart','ABCDEFG'),{owner:'pidli',nick:'🐥 Huzurlu Civciv'});await sdk.setDoc(sdk.doc(db,'yrKim','pidli'),{pid:'ABCDEFG'});});
   await dene('pid ile giriş (eşleşen kimlik)',async()=>{const c=mk('pidli');await c.setPlayer(made.code,{...row('🐥 Huzurlu Civciv',made.room.created),pid:'ABCDEFG'});});
   await dene('pid ile hazır güncellemesi',async()=>{const c=mk('pidli');await c.setPlayer(made.code,{...row('🐥 Huzurlu Civciv',made.room.created),pid:'ABCDEFG',ready:true});});
   await dene('pid ile giriş (kart sahibi farklı)',async()=>{await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore();await sdk.setDoc(sdk.doc(db,'yrKim','pidli2'),{pid:'ABCDEFG'});});const c=mk('pidli2');await c.setPlayer(made.code,{...row('🐱 Aşçı Kedi',made.room.created),pid:'ABCDEFG'});});
   await dene('pid ile giriş (yrKim yok)',async()=>{const c=mk('pidsiz');await c.setPlayer(made.code,{...row('🦋 Renkli Kelebek',made.room.created),pid:'HJKLMNP'});});
  // Ayrıca bütün konular + beslenme seçimi
  await dene('arena5 tüm konular, beslenme dahil',async()=>{await host.create({...base,subject:'beslenme-ilkeleri'},'');});
 }finally{console.log(sonuc.join('\n'));await env.cleanup();}
})().catch(e=>{console.error(e);process.exit(1);});
