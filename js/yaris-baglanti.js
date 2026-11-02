/* Tek bağımlılık: Firebase web SDK. Yalnız odaya bağlanma isteğinde yüklenir. */
(function(root){
 'use strict';
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
    await fb.setPersistence(this.auth,fb.browserSessionPersistence);await this.auth.authStateReady();
    if(!this.auth.currentUser)await fb.signInAnonymously(this.auth);this.uid=this.auth.currentUser.uid;return this;
   })();try{return await this.loading;}catch(e){this.loading=null;throw e;}
  }
  room(code){return this.sdk.doc(this.db,'raceRooms',code);}
  player(code,uid=this.uid){return this.sdk.doc(this.db,'raceRooms',code,'players',uid);}
  result(code,uid=this.uid){return this.sdk.doc(this.db,'raceRooms',code,'results',uid);}
  async create(plan){
   await this.connect();const fb=this.sdk;let code;
   for(let attempt=0;attempt<5;attempt++){
    const chars='ABCDEFGHJKLMNPRSTUVYZ23456789',bytes=crypto.getRandomValues(new Uint8Array(8));code=Array.from(bytes,x=>chars[x%chars.length]).join('');
    try{await fb.runTransaction(this.db,async tx=>{const ref=this.room(code),doc=await tx.get(ref);if(doc.exists())throw Error('CODE_COLLISION');tx.set(ref,{...plan,host:this.uid,status:'lobby',seed:crypto.getRandomValues(new Uint32Array(1))[0],createdAt:fb.serverTimestamp(),closedAt:null});});return code;}catch(e){if(e.message!=='CODE_COLLISION')throw e;}
   }throw Error('Oda kodu oluşturulamadı. Yeniden dene.');
  }
  async join(code,nick){
   await this.connect();const fb=this.sdk;
   await fb.runTransaction(this.db,async tx=>{
    const [r,p]=await Promise.all([tx.get(this.room(code)),tx.get(this.player(code))]);if(!r.exists())throw Error('Oda bulunamadı. Kodu kontrol et.');const room=r.data();
    if(room.host===this.uid)return;
    if(room.createdAt&&Date.now()-room.createdAt.toMillis()>86400000)throw Error('Bu odanın süresi doldu. Yeni bir oda kodu iste.');
    if(p.exists()){if(p.data().status==='left')throw Error('Bu oturumdan ayrıldın. Yeni oturuma katılabilirsin.');return;}
    if(room.status!=='lobby')throw Error('Bu oda başlamış veya kapanmış. Yeni oda kodu iste.');
    tx.set(this.player(code),{nick,status:'waiting',completed:0});
   });return code;
  }
  async self(code){const d=await this.sdk.getDocFromServer(this.player(code));return d.exists()?{uid:this.uid,...d.data()}:null;}
  watch(code,onRoom,onPlayers,onError){const fb=this.sdk;return [fb.onSnapshot(this.room(code),s=>onRoom(s.exists()?s.data():null),onError),fb.onSnapshot(fb.collection(this.db,'raceRooms',code,'players'),s=>onPlayers(s.docs.map(d=>({uid:d.id,...d.data()}))),onError)];}
  watchResults(code,onData,onError){const fb=this.sdk;return fb.onSnapshot(fb.collection(this.db,'raceRooms',code,'results'),s=>onData(s.docs.map(d=>({uid:d.id,...d.data()}))),onError);}
  async start(code){await this.sdk.updateDoc(this.room(code),{status:'playing'});}
  async close(code){await this.sdk.updateDoc(this.room(code),{status:'closed',closedAt:this.sdk.serverTimestamp()});}
  async progress(code,completed){await this.sdk.updateDoc(this.player(code),{status:'working',completed});}
  async submit(code,result){
   const fb=this.sdk,existing=await fb.getDocFromServer(this.result(code));if(existing.exists())return;
   const batch=fb.writeBatch(this.db);batch.set(this.result(code),result);batch.update(this.player(code),{status:'submitted',completed:result.total});await batch.commit();
  }
  async leave(code){await this.sdk.updateDoc(this.player(code),{status:'left'});}
  async remove(code){const fb=this.sdk;const [p,r]=await Promise.all([fb.getDocs(fb.collection(this.db,'raceRooms',code,'players')),fb.getDocs(fb.collection(this.db,'raceRooms',code,'results'))]);for(const docs of [p.docs,r.docs])for(let i=0;i<docs.length;i+=400){const b=fb.writeBatch(this.db);docs.slice(i,i+400).forEach(d=>b.delete(d.ref));await b.commit();}await fb.deleteDoc(this.room(code));}
 }
 root.YarisFirebase=YarisFirebase;
})(window);
