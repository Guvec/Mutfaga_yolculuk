/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Bireysel rekor bağlantısı. Oda yarışından ayrı Firebase uygulama örneği ve kalıcı (local) oturum kullanır;
   oda yarışının sekmeye bağlı oturumuna dokunmaz. SDK yalnız rekor gönderilirken ya da sıralama açılırken yüklenir. */
(function(root){
 'use strict';
 class RekorFirebase {
  constructor(config){this.config=config;this.sdk=null;this.db=null;this.auth=null;this.uid=null;this.loading=null;}
  async connect(){
   if(this.loading)return this.loading;
   this.loading=(async()=>{
    if(!this.config||!this.config.projectId||!this.config.apiKey)throw Error('NO_CONFIG');
    if(!navigator.onLine)throw Error('OFFLINE');
    const base='https://www.gstatic.com/firebasejs/10.12.2/';
    const [app,auth,db]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
    this.sdk={...app,...auth,...db};const fb=this.sdk;
    const inst=fb.initializeApp(this.config,'mesleki-rekor');this.auth=fb.getAuth(inst);this.db=fb.getFirestore(inst);
    if(this.config.projectId.startsWith('demo-')&&['localhost','127.0.0.1'].includes(location.hostname)){fb.connectAuthEmulator(this.auth,'http://127.0.0.1:9099',{disableWarnings:true});fb.connectFirestoreEmulator(this.db,'127.0.0.1',8080);}
    await fb.setPersistence(this.auth,fb.browserLocalPersistence);await this.auth.authStateReady();
    if(!this.auth.currentUser)await fb.signInAnonymously(this.auth);this.uid=this.auth.currentUser.uid;return this;
   })();try{return await this.loading;}catch(e){this.loading=null;throw e;}
  }
  profRef(pid){return this.sdk.doc(this.db,'rekorProfiller',pid);}
  rowRef(table,pid){return this.sdk.doc(this.db,'rekor',table,'rows',pid);}
  /* Profil durum belgesi yoksa açar. Varsa sunucudaki durumu döndürür. */
  async ensureProfile(pid){
   await this.connect();const fb=this.sdk;
   return fb.runTransaction(this.db,async tx=>{const s=await tx.get(this.profRef(pid));if(s.exists())return s.data();const d={owner:this.uid,status:'in',gen:0};tx.set(this.profRef(pid),d);return d;});
  }
  async profile(pid){await this.connect();const s=await this.sdk.getDocFromServer(this.profRef(pid));return s.exists()?s.data():null;}
  /* Yalnız daha yüksek doğru sayısı yazılır. Sunucudaki nesil, sonucun oynandığı nesille aynı değilse yazılmaz. */
  async submit(table,pid,row){
   await this.connect();const fb=this.sdk;
   /* Görünen ad değiştiyse kuralların izin verdiği ayrı işlemle önce ad güncellenir; puan ayrı işlemde yazılır. */
   await fb.runTransaction(this.db,async tx=>{const [p,r]=await Promise.all([tx.get(this.profRef(pid)),tx.get(this.rowRef(table,pid))]);
    if(p.exists()&&p.data().status==='in'&&p.data().gen===row.gen&&r.exists()&&r.data().gen===row.gen&&r.data().name!==row.name)tx.update(this.rowRef(table,pid),{name:row.name});});
   return fb.runTransaction(this.db,async tx=>{
    const [p,r]=await Promise.all([tx.get(this.profRef(pid)),tx.get(this.rowRef(table,pid))]);
    if(!p.exists()||p.data().status!=='in'||p.data().gen!==row.gen)return {stale:true};
    if(r.exists()&&r.data().gen===row.gen){const old=r.data();
     /* Doğru sayısı eşitse yalnız daha kısa süre (haftalık) satırı günceller. */
     const shorter=Number.isInteger(row.dur)&&(!Number.isInteger(old.dur)||row.dur<old.dur);
     if(old.correct>row.correct||(old.correct===row.correct&&!shorter)){if(Number.isInteger(row.rank)&&old.rank!==row.rank)tx.update(this.rowRef(table,pid),{rank:row.rank});return {kept:true,best:old.correct};}
     if(old.correct===row.correct){const upd={dur:row.dur};if(Number.isInteger(row.rank)&&old.rank!==row.rank)upd.rank=row.rank;tx.update(this.rowRef(table,pid),upd);return {written:true,best:old.correct};}}
    tx.set(this.rowRef(table,pid),row);return {written:true,best:row.correct};
   });
  }
  async list(table){await this.connect();const fb=this.sdk;const q=await fb.getDocsFromServer(fb.collection(this.db,'rekor',table,'rows'));return q.docs.map(d=>({pid:d.id,...d.data()}));}
  async setStatus(pid,status){
   await this.connect();const fb=this.sdk;
   return fb.runTransaction(this.db,async tx=>{const s=await tx.get(this.profRef(pid));if(!s.exists())throw Error('NO_PROFILE');const d=s.data();if(d.status===status)return d;const n={owner:d.owner,status,gen:d.gen+1};tx.set(this.profRef(pid),n);return n;});
  }
  async removeRow(table,pid){await this.connect();await this.sdk.deleteDoc(this.rowRef(table,pid));}
 }
 root.RekorFirebase=RekorFirebase;
})(window);
