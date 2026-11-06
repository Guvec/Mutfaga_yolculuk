/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Arena2: güncel gerçek kural dosyası üzerinde oda/kadro, tek cevap, final ve kopma sınırları. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,updateDoc,deleteDoc,getDoc,writeBatch}=require('firebase/firestore');
(async()=>{
 const env=await initializeTestEnvironment({projectId:'demo-mesleki-yaris',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync(path.join(__dirname,'../ci/firebase/firestore.rules'),'utf8')}});
 let passed=0;const failures=[];
 const check=async(name,p,allowed=true)=>{try{await (allowed?assertSucceeds(p):assertFails(p));passed++;console.log('PASS '+name);}catch(e){failures.push(name+': '+String(e.message).slice(0,220));console.log('FAIL '+name);}};
 const users=['host','alice','bob','cara','outsider'],db=Object.fromEntries(users.map(u=>[u,env.authenticatedContext(u).firestore()]));
 const room=(code,d=db.host)=>doc(d,'oyunOdalari',code),player=(code,u,d=db[u])=>doc(d,'oyunOdalari',code,'players',u);
 const base=(o={})=>({host:'host',hostNick:'Host',mode:'arena',subject:'mutfak-araclari',kind:'gorsel',set:0,n:75,lim:15,seed:123,rev:'arena2-test',created:Date.now(),status:'lobby',guest:null,qv:1,cnt:1,scope:'butun',av:2,roster:[],...o});
 const row=(rid,o={})=>({nick:'Chef',score:0,ok:0,bad:0,n:0,tt:0,done:false,left:false,ts:Date.now(),rid,m:0,r:[],pr:[],ready:true,loaded:true,...o});
 const step=(p,value)=>({...p,r:p.r.concat(value),n:p.n+1,ok:p.ok+(value>0?1:0),score:p.ok+(value>0?1:0),bad:p.bad+(value<0?1:0),tt:p.tt+Math.abs(value),done:p.bad+(value<0?1:0)===4||p.n+1===75,ts:Date.now()});
 async function fixture(code,count=3){const b=base();await setDoc(room(code),b);await setDoc(player(code,'host'),row(b.created));for(const [i,u] of ['alice','bob','cara'].slice(0,count-1).entries()){const batch=writeBatch(db[u]);batch.set(player(code,u),row(b.created));batch.update(room(code,db[u]),{cnt:i+2});await batch.commit();}return b;}
 try{
  await env.clearFirestore();
  await check('Arena2 75 kabul',setDoc(room('MAKE75'),base()));
  await check('Arena3 bütün konular 75 kabul',setDoc(room('ALL75'),base({rev:'arena3-test'})));
  for(const [i,subject]of ['baharat','mutfak-araclari','bulasik-makinesi-temizligi','kuver'].entries())await check('Arena3 tek konu '+subject+' kabul',setDoc(room('SUB'+i),base({subject,scope:'konu',n:17,rev:'arena3-test'})));
  await check('Arena3 76 reddi',setDoc(room('NEW76'),base({rev:'arena3-test',n:76})),false);
  await check('Arena3 iki soru reddi',setDoc(room('NEW2'),base({rev:'arena3-test',n:2})),false);
  await check('Arena3 tek takım kapsamı reddi',setDoc(room('NEWSCOPE'),base({rev:'arena3-test',scope:'tek'})),false);
  await check('Arena3 bilinmeyen konu reddi',setDoc(room('NEWSUB'),base({rev:'arena3-test',subject:'bilinmeyen',scope:'konu'})),false);
  await check('Arena3 bütün konularda farklı kanonik konu reddi',setDoc(room('NEWCAN'),base({rev:'arena3-test',subject:'kuver'})),false);

  await check('Arena2 76 reddi',setDoc(room('MAKE76'),base({n:76})),false);
  await check('Arena2 eksik av reddi',setDoc(room('NOAV'),Object.fromEntries(Object.entries(base()).filter(([k])=>k!=='av'))),false);
  await check('Arena2 dolu başlangıç roster reddi',setDoc(room('BADRST'),base({roster:['host','alice','bob']})),false);
  await check('Arena2 yanlış içerik protokolü reddi',setDoc(room('BADREV'),base({rev:'ready2-old'})),false);
  await check('Arena2 yanlış konu reddi',setDoc(room('BADSUB'),base({subject:'baharat'})),false);
  await check('Arena2 yanlış süre reddi',setDoc(room('BADLIM'),base({lim:20})),false);
  for(const mode of ['race','duel']){const r=base({mode,n:20,scope:'konu',rev:'ready2-test'});delete r.av;delete r.roster;if(mode==='duel')delete r.cnt;await check(mode+' 20 kabul',setDoc(room(mode.toUpperCase()+'20'),r));await check(mode+' 21 reddi',setDoc(room(mode.toUpperCase()+'21'),{...r,n:21}),false);}
  const f=await fixture('THREE');
  await check('İki kişilik kadro reddi',updateDoc(room('THREE'),{status:'playing',roster:['host','alice']}),false);
  await check('Tekrarlı kadro reddi',updateDoc(room('THREE'),{status:'playing',roster:['host','alice','alice']}),false);
  await updateDoc(player('THREE','bob'),{loaded:false,ts:Date.now()});
  await check('Yüklenmemiş kişiyle başlama reddi',updateDoc(room('THREE'),{status:'playing',roster:['host','alice','bob']}),false);
  await updateDoc(player('THREE','bob'),{loaded:true,ts:Date.now()});
  await check('Üç yüklenmiş kişiyle başlama',updateDoc(room('THREE'),{status:'playing',roster:['host','alice','bob']}));
  await check('Başladıktan sonra kadro değişmez',updateDoc(room('THREE'),{roster:['host','alice','cara']}),false);
  await check('Aktif oyuncu kendini silemez',deleteDoc(player('THREE','alice')),false);
  await check('Kurucu aktif oyuncuyu silemez',deleteDoc(player('THREE','bob',db.host)),false);
  await check('Yeni oyuncu aktif odaya katılamaz',setDoc(player('THREE','cara'),row(f.created)),false);
  let a=row(f.created);let next=step(a,100);
  await check('Tek cevap sona eklenir',setDoc(player('THREE','alice'),next));a=next;
  await check('Yanıt değiştirme reddi',setDoc(player('THREE','alice'),{...a,r:[101],tt:101,ts:Date.now()}),false);
  await check('İki yanıt birden ekleme reddi',setDoc(player('THREE','alice'),step(step(a,100),100)),false);
  await check('n geri alma reddi',setDoc(player('THREE','alice'),row(f.created)),false);
  await check('Doğru sayısı uyumsuzluğu reddi',setDoc(player('THREE','alice'),{...step(a,100),ok:1,score:1}),false);
  await check('Yanlış sayısı uyumsuzluğu reddi',setDoc(player('THREE','alice'),{...step(a,-100),bad:0,ok:a.ok+1,score:a.ok+1}),false);
  await check('tt uyumsuzluğu reddi',setDoc(player('THREE','alice'),{...step(a,100),tt:100}),false);
  await check('Sıfır yanıt süresi reddi',setDoc(player('THREE','alice'),step(a,0)),false);
  await check('Azami soru süresini aşma reddi',setDoc(player('THREE','alice'),step(a,15001)),false);
  let b=row(f.created);for(let i=0;i<3;i++){b=step(b,-100);await setDoc(player('THREE','bob'),b);}
  await check('Dördüncü yanlışta done zorunlu',setDoc(player('THREE','bob'),{...step(b,-100),done:false}),false);
  b=step(b,-100);await check('Dördüncü yanlışta bitiş',setDoc(player('THREE','bob'),b));
  await check('Bitmiş oyuncu devam edemez',setDoc(player('THREE','bob'),step(b,100)),false);
  await check('done geri alınamaz',updateDoc(player('THREE','bob'),{done:false,ts:Date.now()}),false);
  await check('Bitmiş oyuncu heartbeat kabul',updateDoc(player('THREE','bob'),{ts:Date.now()}));
  await check('Bitmiş cevap değişmez',updateDoc(player('THREE','bob'),{r:[-1,-100,-100,-100],tt:301}),false);
  while(a.ok<5){a=step(a,100);await setDoc(player('THREE','alice'),a);}
  await check('Beş doğrudan sonra eski 15sn reddi',setDoc(player('THREE','alice'),step(a,15000)),false);
  a=step(a,14000);await check('Beş doğrudan sonra 14sn kabul',setDoc(player('THREE','alice'),a));
  for(let i=a.n;i<74;i++){a=step(a,100);await setDoc(player('THREE','alice'),a);}
  await check('75. yanıt bitişsiz reddi',setDoc(player('THREE','alice'),{...step(a,100),done:false}),false);
  a=step(a,100);await check('75 yanıt dizisi ve bitiş kabul',setDoc(player('THREE','alice'),a));
  assert.equal((await getDoc(player('THREE','alice'))).data().r.length,75);
  const four=await fixture('FOUR',4);await check('Dört yüklenmiş kişiyle başlama',updateDoc(room('FOUR'),{status:'playing',roster:['host','alice','bob','cara']}));
  await check('Güncel eş oyuncuyu bitiremez',updateDoc(player('FOUR','alice',db.bob),{done:true,left:true}),false);
  await env.withSecurityRulesDisabled(async ctx=>updateDoc(player('FOUR','alice',ctx.firestore()),{ts:Date.now()-61000}));
  await check('Üye olmayan eski oyuncuyu bitiremez',updateDoc(player('FOUR','alice',db.outsider),{done:true,left:true}),false);
  await check('Üye 60sn eski oyuncuyu ayrıldı işaretler',updateDoc(player('FOUR','alice',db.bob),{done:true,left:true}));
  await check('Eski oyuncu işaretlenirken puan değişmez',updateDoc(player('FOUR','cara',db.bob),{done:true,left:true,ok:1,score:1,n:1,r:[1],tt:1}),false);
  await check('Ayrıldı kaydı geri açılmaz',updateDoc(player('FOUR','alice'),{done:false,left:false,ts:Date.now()}),false);
  await check('Kendi isteğiyle ayrılma',updateDoc(player('FOUR','cara'),{done:true,left:true,ts:Date.now()}));
  // Oyun henüz başlamadan yanıt yazmak puan/başlangıç sözleşmesini bozmamalı.
  const lobby=await fixture('LOBBY');await check('Salonda cevap yazılamaz',setDoc(player('LOBBY','alice'),step(row(lobby.created),100)),false);
  const pid='eeeeeeeeeeeeeeeeeeee';await setDoc(doc(db.host,'rekorProfiller',pid),{owner:'host',status:'in',gen:0});
  await check('Yeni arena galibiyeti eski tur tablosundan ayrıdır',setDoc(doc(db.host,'rekor','2026-2027~oy-arena2~genel','rows',pid),{name:'Chef',correct:1,term:'2026-2027',version:1,gen:0,rank:1}));
  console.log('Arena2 kural: '+passed+' geçti, '+failures.length+' başarısız.');if(failures.length){failures.forEach(x=>console.error(x));process.exitCode=1;}
 }finally{await env.cleanup();}
})().catch(e=>{console.error(e);process.exitCode=1;});
