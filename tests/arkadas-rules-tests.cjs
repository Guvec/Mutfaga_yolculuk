/* Arkadaş ve davet kuralları. Gerçek Firestore emülatörü gerekir (CI: emulators:exec). */
const fs=require('fs'),path=require('path'),{initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,getDocs,collection,query,where,updateDoc,deleteDoc,writeBatch,serverTimestamp}=require('firebase/firestore');
(async()=>{
 const rules=fs.readFileSync(path.resolve(__dirname,'../../firebase/firestore.rules'),'utf8');
 const env=await initializeTestEnvironment({projectId:'demo-mesleki-yaris',firestore:{host:'127.0.0.1',port:8080,rules}});
 let n=0;const ok=async(p,m)=>{await assertSucceeds(p);n++;},no=async(p,m)=>{await assertFails(p,m);n++;};
 try{
  await env.clearFirestore();
  const U={a:env.authenticatedContext('ua').firestore(),b:env.authenticatedContext('ub').firestore(),c:env.authenticatedContext('uc').firestore(),x:env.authenticatedContext('ux').firestore(),o:env.unauthenticatedContext().firestore()};
  const PA='AAAAAA2',PB='BBBBBB3',PC='CCCCCC4',PX='XXXXXX5';
  const D=(db,col,id)=>doc(db,col,id);
  const make=async(db,pid,nick)=>{const b=writeBatch(db);b.set(D(db,'yrKart',pid),{owner:db===U.a?'ua':db===U.b?'ub':db===U.c?'uc':'ux',nick});b.set(D(db,'yrKim',db===U.a?'ua':db===U.b?'ub':db===U.c?'uc':'ux'),{pid});return b.commit();};
  // kart ve kimlik
  await no(setDoc(D(U.a,'yrKart','abc'),{owner:'ua',nick:'Ali'}),'kısa/yanlış kod');
  await no(setDoc(D(U.a,'yrKart',PA),{owner:'ub',nick:'Ali'}),'başkası adına kart');
  await no(setDoc(D(U.a,'yrKart',PA),{owner:'ua',nick:''}),'boş ad');
  await no(setDoc(D(U.a,'yrKim','ua'),{pid:PA}),'kartsız kimlik');
  await ok(make(U.a,PA,'Ali'));await ok(make(U.b,PB,'Bora'));await ok(make(U.c,PC,'Cem'));
  await no(setDoc(D(U.x,'yrKim','ux'),{pid:PA}),'başkasının koduna sahiplenme');
  await no(setDoc(D(U.x,'yrKart',PA),{owner:'ux',nick:'Sahte'}),'var olan kartın üstüne yazma');
  await ok(getDoc(D(U.x,'yrKart',PA)));await no(getDocs(collection(U.x,'yrKart')),'kart listesi kapalı');await no(getDoc(D(U.o,'yrKart',PA)),'girişsiz okuyamaz');
  await no(updateDoc(D(U.b,'yrKart',PA),{nick:'Hack'}),'başkasının adı değişmez');await ok(updateDoc(D(U.a,'yrKart',PA),{nick:'Ali K'}));
  // çevrim içi bilgisi
  await ok(setDoc(D(U.a,'yrDurum',PA),{seen:serverTimestamp()}));
  await no(setDoc(D(U.b,'yrDurum',PA),{seen:serverTimestamp()}),'başkası yazamaz');
  await no(setDoc(D(U.a,'yrDurum',PA),{seen:new Date(0)}),'sunucu saati şart');
  await ok(getDoc(D(U.a,'yrDurum',PA)));await ok(getDoc(D(U.b,'yrDurum',PA)),'giriş yapan okuyabilir (gerçek ad yok)');await no(getDoc(D(U.o,'yrDurum',PA)),'girişsiz okuyamaz');await no(getDocs(collection(U.x,'yrDurum')),'liste kapalı');
  // arkadaşlık isteği
  const K=PA+'_'+PB,fr=(o={})=>({a:PA,b:PB,by:PA,st:'p',ts:serverTimestamp(),...o});
  await no(setDoc(D(U.b,'yrFr',K),fr()),'başkası adına istek');
  await no(setDoc(D(U.a,'yrFr',K),fr({st:'ok'})),'kendi kendine kabul');
  await no(setDoc(D(U.a,'yrFr',PA+'_'+PA),fr({b:PA})),'kendiyle');
  await no(setDoc(D(U.a,'yrFr',PB+'_'+PC),fr({a:PB,b:PC,by:PB})),'araya girme');
  await no(setDoc(D(U.x,'yrFr',PA+'_'+PX),fr({b:PX,by:PX})),'kimliksiz kullanıcı');
  await ok(setDoc(D(U.a,'yrFr',K),fr()));
  await no(updateDoc(D(U.a,'yrFr',K),{st:'ok',ts:serverTimestamp()}),'isteği gönderen kabul edemez');
  await no(updateDoc(D(U.c,'yrFr',K),{st:'ok',ts:serverTimestamp()}),'üçüncü kişi kabul edemez');
  await no(getDoc(D(U.c,'yrFr',K)),'üçüncü kişi okuyamaz');
  await ok(getDoc(D(U.b,'yrFr',K)));
  await ok(getDocs(query(collection(U.b,'yrFr'),where('b','==',PB))));
  await ok(getDocs(query(collection(U.a,'yrFr'),where('a','==',PA))));
  await no(getDocs(collection(U.c,'yrFr')),'genel liste kapalı');
  await no(getDocs(query(collection(U.c,'yrFr'),where('a','==',PA))),'başkasının listesi');
  await no(updateDoc(D(U.b,'yrFr',K),{st:'ok',by:PB,ts:serverTimestamp()}),'kabulde başka alan değişemez');
  await ok(updateDoc(D(U.b,'yrFr',K),{st:'ok',ts:serverTimestamp()}));
  // arkadaşlar durumu görür, yabancı görmez
  // engelleme
  await no(setDoc(D(U.b,'yrEngel',PB+'_'+PC),{by:PA,to:PC}),'başkası adına engel');
  await ok(setDoc(D(U.b,'yrEngel',PB+'_'+PC),{by:PB,to:PC}));
  await no(setDoc(D(U.c,'yrFr',PB+'_'+PC),{a:PB,b:PC,by:PC,st:'p',ts:serverTimestamp()}),'engelli kişi istek atamaz');
  await no(setDoc(D(U.b,'yrFr',PB+'_'+PC),{a:PB,b:PC,by:PB,st:'p',ts:serverTimestamp()}),'engelleyen de istek atamaz');
  await no(getDoc(D(U.c,'yrEngel',PB+'_'+PC)),'engellenen engeli göremez');await ok(getDoc(D(U.b,'yrEngel',PB+'_'+PC)));
  await ok(deleteDoc(D(U.b,'yrEngel',PB+'_'+PC)));
  await ok(setDoc(D(U.c,'yrFr',PB+'_'+PC),{a:PB,b:PC,by:PC,st:'p',ts:serverTimestamp()}));
  await ok(deleteDoc(D(U.c,'yrFr',PB+'_'+PC)));
  // oda ve davet
  const room=(o={})=>({host:'ua',hostNick:'Ali',mode:'race',subject:'baharat',kind:'gorsel',set:1,n:10,lim:20,seed:1,rev:'v1-8',created:Date.now(),status:'lobby',guest:null,qv:1,cnt:1,...o});
  await ok(setDoc(D(U.a,'oyunOdalari','ODA11'),room()));
  const rid=(await getDoc(D(U.a,'oyunOdalari','ODA11'))).data().created;
  const dv=(o={})=>({from:PA,to:PB,nick:'Ali',code:'ODA11',rid,subject:'Baharat',mode:'race',ts:serverTimestamp(),...o});
  await ok(setDoc(D(U.a,'yrDav',PA+'_'+PB+'_ODA11'),dv()));
  await no(setDoc(D(U.a,'yrDav',PA+'_'+PC+'_ODA11'),dv({to:PC})),'arkadaş olmayana davet');
  await no(setDoc(D(U.b,'yrDav',PB+'_'+PA+'_ODA11'),dv({from:PB,to:PA,nick:'Bora'})),'odanın kurucusu olmayan davet edemez');
  await no(setDoc(D(U.a,'yrDav',PA+'_'+PB+'_YOK99'),dv({code:'YOK99'})),'olmayan odaya davet');
  await no(setDoc(D(U.a,'yrDav',PA+'_'+PB+'_ODA11x'),dv({code:'ODA11'})),'kimlik biçimi');
  await no(setDoc(D(U.a,'yrDav',PA+'_'+PB+'_ODA11'),dv({rid:rid+1})),'başka oda nesli');
  await no(setDoc(D(U.a,'yrDav',PA+'_'+PB+'_ODA11'),dv({mode:'duel'})),'oda türü uyuşmuyor');
  await ok(getDoc(D(U.b,'yrDav',PA+'_'+PB+'_ODA11')));await no(getDoc(D(U.c,'yrDav',PA+'_'+PB+'_ODA11')),'üçüncü kişi daveti göremez');
  await ok(getDocs(query(collection(U.b,'yrDav'),where('to','==',PB))));await no(getDocs(query(collection(U.c,'yrDav'),where('to','==',PB))));
  await no(updateDoc(D(U.a,'yrDav',PA+'_'+PB+'_ODA11'),{nick:'X'}),'davet değişmez');
  await no(deleteDoc(D(U.c,'yrDav',PA+'_'+PB+'_ODA11')),'üçüncü kişi silemez');
  await ok(deleteDoc(D(U.b,'yrDav',PA+'_'+PB+'_ODA11')));
  // arkadaşlıktan çıkma: iki taraf da silebilir; sonra davet gitmez
  await ok(deleteDoc(D(U.a,'yrFr',K)));
  await no(setDoc(D(U.a,'yrDav',PA+'_'+PB+'_ODA11'),dv()),'arkadaşlık bitince davet gitmez');
  // oyun adı rezervasyonu
  await ok(setDoc(D(U.a,'nm','12_0'),{u:'ua',t:1}));
  await no(setDoc(D(U.b,'nm','12_0'),{u:'ub',t:1}),'alınmış ad üstüne yazılamaz');
  await no(setDoc(D(U.b,'nm','12_5'),{u:'ua',t:1}),'başkası adına ad ayrılamaz');
  await no(setDoc(D(U.b,'nm','abc'),{u:'ub',t:1}),'anahtar biçimi');
  await ok(getDoc(D(U.b,'nm','12_0')));await no(getDocs(collection(U.b,'nm')),'liste kapalı');
  await no(deleteDoc(D(U.b,'nm','12_0')),'başkası silemez');await ok(deleteDoc(D(U.a,'nm','12_0')));
  await ok(setDoc(D(U.a,'yrKart',PA),{owner:'ua',nick:'🦊 Kurnaz Tilki #1234'}));
  // oyuncu belgesinde pid sahipliği
  const pl=(o={})=>({nick:'Ali',score:0,ok:0,bad:0,n:0,tt:0,done:false,ts:Date.now(),rid,...o});
  await ok(setDoc(D(U.a,'oyunOdalari/ODA11/players','ua'),pl({pid:PA})));
  await ok(setDoc(D(U.a,'oyunOdalari/ODA11/players','ua'),pl()));
  await no(setDoc(D(U.a,'oyunOdalari/ODA11/players','ua'),pl({pid:PB})),'başkasının kodunu yazamaz');
  await no(setDoc(D(U.x,'oyunOdalari/ODA11/players','ux'),pl({pid:PA})),'kimliksiz hesap kod yazamaz');
  // kimlik sahipliği kart silinince bozulur
  await ok(deleteDoc(D(U.c,'yrKart',PC)));
  await no(setDoc(D(U.c,'yrFr',PA+'_'+PC),{a:PA,b:PC,by:PC,st:'p',ts:serverTimestamp()}),'kartı silinen kimlik kullanılamaz');
  console.log('PASS real Firestore emulator (arkadaş sistemi): '+n+' kural denetimi — kart/kimlik sahipliği, kapalı listeler, istek-kabul, engel, davet, durum görünürlüğü, oyuncu pid');
 }finally{await env.cleanup();}
})().catch(e=>{console.error(e);process.exitCode=1;});
