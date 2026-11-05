/* Rekor/sıralama Firestore kuralları. firebase@10.12.2, @firebase/rules-unit-testing@3 ve çalışan emülatör gerekir.
   Oda kuralları ayrıca yaris-rules-tests.cjs ile aynı kural dosyasında yeniden sınanır. */
const fs=require('fs'),path=require('path'),{initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,getDocs,collection,updateDoc,deleteDoc,writeBatch}=require('firebase/firestore');
let n=0;const step=async(name,p)=>{await p;n++;console.log('PASS '+name);};
(async()=>{
 const env=await initializeTestEnvironment({projectId:'demo-mesleki-yaris',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync(path.resolve(__dirname,'../../firebase/firestore.rules'),'utf8')}});
 try{
  await env.clearFirestore();
  const a=env.authenticatedContext('ua').firestore(),b=env.authenticatedContext('ub').firestore(),anon=env.unauthenticatedContext().firestore();
  const TERM='2026-2027',W=Math.floor((Date.now()+10800000+259200000)/604800000);
  const pA='aaaaaaaaaaaaaaaaaaaa',pB='bbbbbbbbbbbbbbbbbbbb',pC='cccccccccccccccccccc';
  const prof=(db,p)=>doc(db,'rekorProfiller',p),row=(db,t,p)=>doc(db,'rekor',t,'rows',p);
  const G=TERM+'~bh-e1~genel',H=TERM+'~bh-e1~w'+W,G2=TERM+'~bh-e2~genel',G3=TERM+'~kv-basit~genel',MQ=TERM+'~ma-s01~genel';
  const r=(o={})=>({name:'Ali',correct:10,term:TERM,version:1,gen:0,...o});

  // Profil durum belgesi
  await step('Başka hesap adına profil açılamaz',assertFails(setDoc(prof(a,pA),{owner:'ub',status:'in',gen:0})));
  await step('Geçersiz profil kimliği reddedilir',assertFails(setDoc(prof(a,'KISA'),{owner:'ua',status:'in',gen:0})));
  await step('Profil gen 0 ve in ile açılmak zorunda',assertFails(setDoc(prof(a,pA),{owner:'ua',status:'in',gen:1})));
  await step('Profile fazladan alan eklenemez',assertFails(setDoc(prof(a,pA),{owner:'ua',status:'in',gen:0,x:1})));
  await step('Profil açılır',assertSucceeds(setDoc(prof(a,pA),{owner:'ua',status:'in',gen:0})));
  for(const rank of [0,6,"3",2.5])await step('Geçersiz rank '+JSON.stringify(rank),assertFails(setDoc(row(a,TERM+'~bh-e3~genel',pA),r({rank}))));
  for(const rank of [1,2,3,4,5]){await step('rank '+rank+' kabul',assertSucceeds(setDoc(row(a,TERM+'~bh-e3~genel',pA),r({rank}))));}
  await step('rank olmayan eski yazım kabul',assertSucceeds(setDoc(row(a,TERM+'~bh-e4~genel',pA),r())));
  await step('Haftalık metadata ve 25 puan kabul',assertSucceeds(setDoc(row(a,TERM+'~haftalik~w'+W,pA),r({correct:25,game:'haftalik',scope:'butun',total:25,contentVersion:'hafta-1-scope2-123',week:W}))));
  await step('Haftalık 26 puan reddi',assertFails(setDoc(row(a,TERM+'~haftalik~w'+W,pA),r({correct:26,game:'haftalik',scope:'butun',total:25,contentVersion:'hafta-1-scope2-123',week:W}))));
  await step('Ayar tablosuna yazım',assertSucceeds(setDoc(row(a,TERM+'~ayar-du-bh-a-g-0-15-20~genel',pA),r({correct:1,rank:2}))));
  await step('Ayar tablosunda fazladan alan reddi',assertFails(setDoc(row(a,TERM+'~ayar-du-bh-a-g-0-15-20~genel',pA),r({correct:2,rank:2,extra:true}))));


  await step('Başkası profili okuyamaz',assertFails(getDoc(prof(b,pA))));
  await step('Sahibi profili okur',assertSucceeds(getDoc(prof(a,pA))));
  await step('Olmayan profil sorgulanabilir (açma öncesi)',assertSucceeds(getDoc(prof(a,pC))));
  await step('Profiller listelenemez',assertFails(getDocs(collection(a,'rekorProfiller'))));
  await step('Başkası profil durumunu değiştiremez',assertFails(updateDoc(prof(b,pA),{status:'out',gen:1})));
  await step('Sahip değiştirilemez',assertFails(setDoc(prof(a,pA),{owner:'ub',status:'out',gen:1})));
  await step('Nesil 1 artmadan durum değişmez',assertFails(updateDoc(prof(a,pA),{status:'out',gen:2})));
  await step('Profil silinemez',assertFails(deleteDoc(prof(a,pA))));
  await step('Var olan profil yeniden "açılamaz" (sahiplenme yok)',assertFails(setDoc(prof(b,pA),{owner:'ub',status:'in',gen:0})));

  // Satır yazma
  await step('Profilsiz satır yazılamaz',assertFails(setDoc(row(a,G,pC),r())));
  await step('Nesil eşleşmeden yazılamaz',assertFails(setDoc(row(a,G,pA),r({gen:1}))));
  await step('Yanlış dönem reddedilir',assertFails(setDoc(row(a,G,pA),r({term:'2025-2026'}))));
  await step('Geçmiş dönem tablosuna yazılamaz',assertFails(setDoc(row(a,'2025-2026~bh-e1~genel',pA),r())));
  await step('Yanlış sürüm reddedilir',assertFails(setDoc(row(a,G,pA),r({version:2}))));
  await step('Açık satıra fazladan alan (süre) eklenemez',assertFails(setDoc(row(a,G,pA),{...r(),sure:12})));
  await step('Açık satıra hesap kimliği eklenemez',assertFails(setDoc(row(a,G,pA),{...r(),uid:'ua'})));
  await step('Tablo üst sınırı aşılamaz (13 / 12)',assertFails(setDoc(row(a,G,pA),r({correct:13}))));
  await step('Kuver Basit üst sınırı 5',assertFails(setDoc(row(a,G3,pA),r({correct:6}))));
  await step('Tanımsız tablo reddedilir',assertFails(setDoc(row(a,TERM+'~xx-e1~genel',pA),r())));
  await step('Doğru sayısı sayı olmak zorunda',assertFails(setDoc(row(a,G,pA),r({correct:'10'}))));
  await step('Negatif doğru sayısı reddedilir',assertFails(setDoc(row(a,G,pA),r({correct:-1}))));
  await step('Kesirli doğru sayısı reddedilir',assertFails(setDoc(row(a,G,pA),r({correct:10.5}))));
  await step('Boş ad reddedilir',assertFails(setDoc(row(a,G,pA),r({name:''}))));
  await step('Ad en fazla 40 karakter',assertFails(setDoc(row(a,G,pA),r({name:'A'.repeat(41)}))));
  await step('Geçen haftaya yazılamaz',assertFails(setDoc(row(a,TERM+'~bh-e1~w'+(W-1),pA),r())));
  await step('Gelecek haftaya yazılamaz',assertFails(setDoc(row(a,TERM+'~bh-e1~w'+(W+1),pA),r())));
  await step('Genel tabloya yazılır',assertSucceeds(setDoc(row(a,G,pA),r())));
  await step('Bu haftaya (sunucu saati) yazılır',assertSucceeds(setDoc(row(a,H,pA),r())));
  await step('Birleşik soru denemesine yazılır (10 üzerinden)',assertSucceeds(setDoc(row(a,MQ,pA),r({correct:10}))));
  await step('Başkası satırı yazamaz',assertFails(setDoc(row(b,G,pA),r({correct:12}))));
  await step('Başkası satırı silemez',assertFails(deleteDoc(row(b,G,pA))));
  await step('Doğru sayısı düşürülemez',assertFails(updateDoc(row(a,G,pA),{correct:9})));
  await step('Eşit sonuç yeniden yazılamaz',assertFails(updateDoc(row(a,G,pA),{correct:10})));
  await step('Doğru sayısı artar',assertSucceeds(updateDoc(row(a,G,pA),{correct:11})));
  await step('Skor güncellemesinde dönem değişemez',assertFails(updateDoc(row(a,G,pA),{correct:12,term:'2027-2028'})));
  await step('Skor ve ad aynı güncellemede değişemez',assertFails(updateDoc(row(a,G,pA),{correct:12,name:'Veli'})));
  await step('Yalnız ad değişir',assertSucceeds(updateDoc(row(a,G,pA),{name:'Ali K'})));
  await step('Giriş yapmamış okuyamaz',assertFails(getDocs(collection(anon,'rekor',G,'rows'))));
  await step('Giriş yapan listeyi okur',assertSucceeds(getDocs(collection(b,'rekor',G,'rows'))));
  await step('Güncel nesildeki satır "in" iken silinemez',assertFails(deleteDoc(row(a,G,pA))));

  // Aynı paket içinde profil durumu/nesil değişikliği + satır yazma
  await setDoc(row(a,G2,pA),r());
  let batch=writeBatch(a);batch.update(prof(a,pA),{status:'out',gen:1});batch.set(row(a,G3,pA),r({correct:5}));
  await step('Tek pakette profili kapatıp satır yazmak reddedilir',assertFails(batch.commit()));

  // Listeden çık
  await step('Listeden çık: in → out, nesil 1',assertSucceeds(updateDoc(prof(a,pA),{status:'out',gen:1})));
  await step('Çıkıştan sonra gecikmiş eski nesil yazma reddedilir',assertFails(updateDoc(row(a,G,pA),{correct:12})));
  await step('Çıkıştan sonra yeni nesille de yazılamaz (durum out)',assertFails(setDoc(row(a,G3,pA),r({gen:1,correct:5}))));
  await step('Çıkışta satırlar silinir',assertSucceeds(deleteDoc(row(a,G,pA))));
  await step('Çıkışta haftalık satır silinir',assertSucceeds(deleteDoc(row(a,H,pA))));
  batch=writeBatch(a);batch.update(prof(a,pA),{status:'in',gen:2});batch.set(row(a,G3,pA),r({gen:2,correct:5}));
  await step('Tek pakette listeye dönüp yeni nesille yazmak reddedilir',assertFails(batch.commit()));

  // Listeye dön
  await step('Listeye dön: out → in, nesil 2',assertSucceeds(updateDoc(prof(a,pA),{status:'in',gen:2})));
  await step('Eski nesille (0) yazma reddedilir',assertFails(setDoc(row(a,G,pA),r({gen:0}))));
  await step('Yeni nesille (2) yazılır',assertSucceeds(setDoc(row(a,G,pA),r({gen:2,correct:8}))));
  await step('Gecikmiş eski silme isteği yeni nesil satırını silemez',assertFails(deleteDoc(row(a,G,pA))));
  await step('Kalmış eski nesil satırı "in" iken silinebilir',assertSucceeds(deleteDoc(row(a,G2,pA))));
  await step('Kalmış eski nesil satırı yeni nesille değiştirilebilir',assertSucceeds(setDoc(row(a,MQ,pA),r({gen:2,correct:3}))));

  // Başka hesabın eski nesil satırı
  await assertSucceeds(setDoc(prof(b,pB),{owner:'ub',status:'in',gen:0}));await assertSucceeds(setDoc(row(b,G,pB),r({name:'Ayşe',correct:12})));
  await assertSucceeds(updateDoc(prof(b,pB),{status:'out',gen:1}));
  await step('Başka hesabın eski nesil satırı silinemez',assertFails(deleteDoc(row(a,G,pB))));
  await step('Sahibi çıkıştan sonra kendi satırını siler',assertSucceeds(deleteDoc(row(b,G,pB))));

  // Profil silme (son durum)
  await step('Profil silme: in → deleted',assertSucceeds(updateDoc(prof(a,pA),{status:'deleted',gen:3})));
  await step('deleted durumunda yazma reddedilir',assertFails(setDoc(row(a,G3,pA),r({gen:3,correct:5}))));
  await step('deleted durumunda kalan satırlar silinir',assertSucceeds(deleteDoc(row(a,G,pA))));
  await step('deleted son durumdur, geri dönülemez',assertFails(updateDoc(prof(a,pA),{status:'in',gen:4})));
  await step('deleted profil yeniden açılamaz',assertFails(setDoc(prof(a,pA),{owner:'ua',status:'in',gen:0})));
  await step('deleted profil başka hesapça sahiplenilemez',assertFails(setDoc(prof(b,pA),{owner:'ub',status:'in',gen:0})));
  console.log('PASS: '+n+' rekor kuralı denetimi');
 }finally{await env.cleanup();}
})().catch(e=>{console.error(e);process.exit(1);});
