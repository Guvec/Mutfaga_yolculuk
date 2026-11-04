/* Gerçek Firestore emülatörü gerekir (CI: npm run test:rooms). firebase@10.12.2 + @firebase/rules-unit-testing@3. */
const fs=require('fs'),path=require('path'),{initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,getDocs,collection,updateDoc,deleteDoc}=require('firebase/firestore');
(async()=>{
 const rules=fs.readFileSync(path.resolve(__dirname,'../../firebase/firestore.rules'),'utf8');
 const env=await initializeTestEnvironment({projectId:'demo-mesleki-yaris',firestore:{host:'127.0.0.1',port:8080,rules}});
 try{
  await env.clearFirestore();
  const H=env.authenticatedContext('host').firestore(),A=env.authenticatedContext('ayse').firestore(),B=env.authenticatedContext('can').firestore(),C=env.authenticatedContext('ece').firestore(),O=env.unauthenticatedContext().firestore();
  const R=(db,c)=>doc(db,'oyunOdalari',c),P=(db,c,u)=>doc(db,'oyunOdalari',c,'players',u);
  const room=(o={})=>({host:'host',hostNick:'Ali',mode:'race',subject:'baharat',kind:'gorsel',set:1,n:10,lim:20,seed:123456,rev:'v1-8',created:Date.now(),status:'lobby',guest:null,qv:1,...o});
  const pl=(o={})=>({nick:'Ali',score:0,ok:0,bad:0,n:0,tt:0,done:false,ts:Date.now(),rid:0,...o});
  // oda kurma
  await assertFails(setDoc(R(O,'ABC12'),room()));
  await assertFails(setDoc(R(A,'ABC12'),room()),'host kendi uid olmalı');
  await assertFails(setDoc(R(H,'ab'),room()),'kod çok kısa');
  await assertFails(setDoc(R(H,'abc12'),room()),'küçük harf kod');
  await assertFails(setDoc(R(H,'ABC12'),room({subject:'baska'})));
  await assertFails(setDoc(R(H,'ABC12'),room({lim:99})));
  await assertFails(setDoc(R(H,'ABC12'),room({n:2})));
  await assertFails(setDoc(R(H,'ABC12'),room({status:'playing'})));
  await assertFails(setDoc(R(H,'ABC12'),room({extra:1})));
  await assertFails(setDoc(R(H,'ABC12'),room({created:Date.now()-90000000})));
  await assertSucceeds(setDoc(R(H,'ABC12'),room()));
  const created=(await getDoc(R(H,'ABC12'))).data().created;
  // okuma: tek oda okunur, liste okunamaz, girişsiz okunamaz
  await assertSucceeds(getDoc(R(A,'ABC12')));await assertFails(getDoc(R(O,'ABC12')));await assertFails(getDocs(collection(A,'oyunOdalari')));
  // oyuncular: kurucu ve öğrenci katılır
  await assertSucceeds(setDoc(P(H,'ABC12','host'),pl({rid:created})));
  await assertFails(setDoc(P(A,'ABC12','ayse'),pl({rid:created+1})),'yanlış rid');
  await assertFails(setDoc(P(A,'ABC12','ayse'),pl({rid:created,nick:'Ayşe Yılmaz Kaya Uzun Soyad'})),'ad çok uzun');
  await assertFails(setDoc(P(A,'ABC12','ayse'),pl({rid:created,ok:99})));
  await assertFails(setDoc(P(A,'ABC12','can'),pl({rid:created})),'başkası adına yazamaz');
  await assertSucceeds(setDoc(P(A,'ABC12','ayse'),pl({rid:created,nick:'Ayşe'})));
  await assertSucceeds(setDoc(P(B,'ABC12','can'),pl({rid:created,nick:'Can'})));
  // oda üyeleri listeyi okur, dışarıdaki okuyamaz
  await assertSucceeds(getDocs(collection(A,'oyunOdalari','ABC12','players')));await assertFails(getDocs(collection(C,'oyunOdalari','ABC12','players')));await assertFails(getDoc(P(C,'ABC12','ayse')));
  // başlatma: yalnız kurucu, yalnız status alanı
  await assertFails(updateDoc(R(A,'ABC12'),{status:'playing'}));await assertFails(updateDoc(R(H,'ABC12'),{status:'playing',n:5}));await assertFails(updateDoc(R(H,'ABC12'),{seed:1}));
  await assertSucceeds(updateDoc(R(H,'ABC12'),{status:'playing'}));
  // başladıktan sonra yeni oyuncu giremez; mevcutlar puan yazar
  await assertFails(setDoc(P(C,'ABC12','ece'),pl({rid:created,nick:'Ece'})));
  await assertSucceeds(setDoc(P(A,'ABC12','ayse'),pl({rid:created,nick:'Ayşe',ok:3,n:4,bad:1,done:false})));
  await assertFails(updateDoc(R(H,'ABC12'),{status:'lobby'}),'geri dönüş yok');
  // kapışma: ikinci kişi guest yerini bir kez alır
  await assertSucceeds(setDoc(R(H,'DUEL1'),room({mode:'duel',n:6})));
  const c2=(await getDoc(R(H,'DUEL1'))).data().created;
  await assertFails(setDoc(P(A,'DUEL1','ayse'),pl({rid:c2})),'guest olmadan oyuncu olunamaz');
  await assertFails(updateDoc(R(A,'DUEL1'),{guest:'can'}),'başkası adına yer ayıramaz');
  await assertFails(updateDoc(R(A,'DUEL1'),{guest:'ayse',status:'playing'}));
  await assertSucceeds(updateDoc(R(A,'DUEL1'),{guest:'ayse'}));
  await assertFails(updateDoc(R(B,'DUEL1'),{guest:'can'}),'yer dolu');
  await assertFails(setDoc(P(B,'DUEL1','can'),pl({rid:c2})),'üçüncü oyuncu giremez');
  await assertSucceeds(setDoc(P(A,'DUEL1','ayse'),pl({rid:c2,nick:'Ayşe'})));
  await assertSucceeds(setDoc(P(H,'DUEL1','host'),pl({rid:c2})));
  await assertSucceeds(updateDoc(P(A,'DUEL1','ayse'),{r:[512,-1,430],m:0,ts:Date.now()}));
  await assertFails(updateDoc(P(B,'DUEL1','ayse'),{ok:1}),'başkasının kaydı değişmez');
  // silme
  await assertFails(deleteDoc(R(A,'ABC12')));await assertSucceeds(deleteDoc(P(A,'ABC12','ayse')));await assertSucceeds(deleteDoc(R(H,'ABC12')));
  // 24 saatten eski oda herkesçe silinebilir
  await env.withSecurityRulesDisabled(async ctx=>setDoc(doc(ctx.firestore(),'oyunOdalari','OLD99'),room({created:Date.now()-90000000})));
  await assertSucceeds(deleteDoc(R(C,'OLD99')));
  console.log('PASS real Firestore emulator (oyunOdalari): room creation shape/code/expiry; private listing; membership; host-only start; no late join; duel single guest claim, 3rd player refused; own-record writes; deletion rules.');
 }finally{await env.cleanup();}
})().catch(e=>{console.error(e);process.exitCode=1;});
