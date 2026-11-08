/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Birlikte Oynayalım: Firestore bağlantı katmanı. Firebase web SDK yalnız odaya bağlanma isteğinde yüklenir.
   Koleksiyon: oyunOdalari/{KOD} ve oyunOdalari/{KOD}/players/{uid}. Kurallar: ci/firebase/firestore.rules. */
(function(root){
 'use strict';
 const COLL='oyunOdalari',DAY=86400000,MAX_RACE=8,CODE_CHARS='ABCDEFGHJKLMNPRSTUVYZ23456789';
 class YarisFirebase {
  constructor(config){this.config=config;this.sdk=null;this.db=null;this.auth=null;this.uid=null;this.loading=null;}
  async connect(){
   if(this.loading)return this.loading;
   this.loading=(async()=>{
    if(!this.config||!this.config.projectId||!this.config.apiKey)throw Error('Oda bağlantısı henüz ayarlanmadı. Bireysel oyunları kullanabilirsin.');
    if(!navigator.onLine)throw Error('Odaya bağlanmak için internet bağlantısı gerekiyor.');
    const base='https://www.gstatic.com/firebasejs/10.12.2/';
    const [app,auth,db]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
    this.sdk={...app,...auth,...db};const fb=this.sdk;
    const inst=fb.initializeApp(this.config,'mesleki-yaris');this.auth=fb.getAuth(inst);this.db=fb.getFirestore(inst);
    if(this.config.projectId.startsWith('demo-')&&['localhost','127.0.0.1'].includes(location.hostname)){fb.connectAuthEmulator(this.auth,'http://127.0.0.1:9099',{disableWarnings:true});fb.connectFirestoreEmulator(this.db,'127.0.0.1',8080);}
    await fb.setPersistence(this.auth,fb.browserLocalPersistence);await this.auth.authStateReady();
    if(!this.auth.currentUser)await fb.signInAnonymously(this.auth);this.uid=this.auth.currentUser.uid;return this;
   })();try{return await this.loading;}catch(e){this.loading=null;throw e;}
  }
  room(code){return this.sdk.doc(this.db,COLL,code);}
  player(code,uid=this.uid){return this.sdk.doc(this.db,COLL,code,'players',uid);}
  randomCode(){const bytes=crypto.getRandomValues(new Uint8Array(5));return Array.from(bytes,x=>CODE_CHARS[x%CODE_CHARS.length]).join('');}
  /* Oda kurar. Kod istenen kod ya da rastgele 5 karakter. Doküman bir kez oluşturulur; 24 saatten eski aynı kod silinip yeniden kullanılır. */
  async create(spec,wanted){
   await this.connect();const fb=this.sdk;
   for(let attempt=0;attempt<6;attempt++){
    const code=wanted||this.randomCode(),ref=this.room(code),snap=await fb.getDoc(ref);
    if(snap.exists()){
     const old=snap.data();
     if(old&&old.created&&Date.now()-old.created>DAY){await fb.deleteDoc(ref);}
     else if(wanted)throw Error('Bu kod kullanılıyor. Başka bir kod seç.');
     else continue;
    }
    const data={...spec,host:this.uid,status:'lobby',guest:null,created:Date.now(),qv:1};
    if(spec.mode==='race'||spec.mode==='arena')data.cnt=1;
    try{await fb.setDoc(ref,data);return {code,room:data};}catch(e){if(wanted)throw e;}
   }
   throw Error('Oda kurulamadı. Yeniden dene.');
  }
  async peek(code){await this.connect();const r=await this.sdk.getDoc(this.room(code));return r.exists()?r.data():null;}
  /* Odaya girer. Kapışmada ikinci kişi "guest" yerini tek işlemde alır; üçüncü kişi giremez. */
  async join(code,nick,pdata,expectCreated){
   await this.connect();const fb=this.sdk,uid=this.uid;let room;
   /* Kapasite sayacı ile oyuncu kaydı TEK işlemde yazılır: biri başarısız olursa ikisi de yazılmaz. */
   await fb.runTransaction(this.db,async tx=>{
    const r=await tx.get(this.room(code));if(!r.exists())throw Error('Oda bulunamadı. Kodu kontrol et.');room=r.data();
    if(room.created&&Date.now()-room.created>DAY)throw Error('Bu odanın süresi dolmuş.');
    if(expectCreated&&room.created!==expectCreated)throw Error('Bu oda yeniden kurulmuş. Kodu yeniden gir.');
    const mine={...pdata,rid:room.created};
    const existing=await tx.get(this.player(code));
    if(room.status==='playing'&&room.mode==='arena'&&room.av===2&&room.roster.includes(uid)&&existing.exists())return;
    if(room.status!=='lobby')throw Error('Oyun başlamış. Yeni katılımcı alınmıyor.');
    if(room.host===uid){tx.set(this.player(code),mine);return;}
    if(room.status!=='lobby')throw Error(room.mode==='duel'?'Kapışma başlamış, katılamazsın.':'Yarış başlamış, katılamazsın.');
    if(room.mode==='duel'){
     if(room.guest&&room.guest!==uid)throw Error('Bu kapışma dolu.');
     if(!room.guest)tx.update(this.room(code),{guest:uid});
    }else{
     const me=await tx.get(this.player(code));
     if(!me.exists()){
      const c=room.cnt||1,cap=room.mode==='arena'?(/^arena4-/.test(room.rev||'')?10:4):MAX_RACE;if(c>=cap)throw Error('Bu oda dolu (en çok '+cap+' kişi).');
      tx.update(this.room(code),{cnt:c+1});
     }
    }
    tx.set(this.player(code),mine);
   });
   return room;
  }
  async setPlayer(code,pdata){await this.sdk.setDoc(this.player(code),pdata);}
  async getPlayer(code){const p=await this.sdk.getDoc(this.player(code));return p.exists()?p.data():null;}
  async arenaExpire(code,uid){await this.sdk.updateDoc(this.player(code,uid),{done:true,left:true});}
  async start(code){
   const fb=this.sdk,snap=await fb.getDoc(this.room(code));if(!snap.exists())throw Error('Oda bulunamadı.');
   if(snap.data().mode!=='arena'){await fb.updateDoc(this.room(code),{status:'playing'});return;}
   const ps=await fb.getDocs(fb.collection(this.db,COLL,code,'players')),uids=ps.docs.map(p=>p.id).sort();
   await fb.runTransaction(this.db,async tx=>{
    const s=await tx.get(this.room(code)),r=s.data();if(!s.exists()||r.host!==this.uid||r.status!=='lobby')throw Error('Oda başlatılamadı.');
    if(uids.length<3||uids.length>(/^arena4-/.test(r.rev||'')?10:4)||uids.length!==r.cnt)throw Error('Oyuncu listesi değişti. Yeniden başlat.');
    const rows=await Promise.all(uids.map(uid=>tx.get(this.player(code,uid))));if(rows.some(p=>!p.exists()||!p.data().loaded))throw Error('Soruların yüklenmesi bekleniyor.');
    tx.update(this.room(code),{status:'playing',roster:uids});
   });
  }
  watch(code,onRoom,onPlayers,onError){const fb=this.sdk;return [fb.onSnapshot(this.room(code),s=>onRoom(s.exists()?s.data():null),onError),fb.onSnapshot(fb.collection(this.db,COLL,code,'players'),{includeMetadataChanges:true},s=>onPlayers(s.docs.map(d=>({uid:d.id,...d.data(),pending:d.metadata.hasPendingWrites,fromCache:s.metadata.fromCache||d.metadata.fromCache}))),onError)];}
  /* Salonda çıkan oyuncu kaydını siler; kurucu çıkarsa oda da silinir. Oyun başladıktan sonra kayıt kalır (sonuç görünsün). */
  async leave(code,lobby,host){
   const fb=this.sdk;
   if(!lobby)return;
   if(host){await fb.deleteDoc(this.player(code)).catch(()=>{});await fb.deleteDoc(this.room(code)).catch(()=>{});return;}
   /* Salondan çıkan, kapasitede yer açar. */
   try{await fb.runTransaction(this.db,async tx=>{
    const r=await tx.get(this.room(code)),p=await tx.get(this.player(code));
    if(p.exists()){tx.delete(this.player(code));if(r.exists()&&(r.data().mode==='race'||r.data().mode==='arena')&&r.data().status==='lobby'&&(r.data().cnt||1)>1)tx.update(this.room(code),{cnt:(r.data().cnt||1)-1});}
   });}catch(e){await fb.deleteDoc(this.player(code)).catch(()=>{});}
  }
  async remove(code){const fb=this.sdk,p=await fb.getDocs(fb.collection(this.db,COLL,code,'players'));for(let i=0;i<p.docs.length;i+=400){const b=fb.writeBatch(this.db);p.docs.slice(i,i+400).forEach(d=>b.delete(d.ref));await b.commit();}await fb.deleteDoc(this.room(code));}
 }
 root.YarisFirebase=YarisFirebase;
})(typeof window!=='undefined'?window:globalThis);
