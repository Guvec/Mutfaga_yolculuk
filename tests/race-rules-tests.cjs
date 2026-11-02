/* Requires firebase@10.12.2, @firebase/rules-unit-testing@3 and running emulator. */
const fs=require('fs'),path=require('path'),{initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,getDocs,collection,updateDoc,writeBatch,serverTimestamp,Timestamp}=require('firebase/firestore');
(async()=>{const env=await initializeTestEnvironment({projectId:'demo-mesleki-yaris',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync(path.resolve(__dirname,'../../firebase/firestore.rules'),'utf8')}});try{
 await env.clearFirestore();const host=env.authenticatedContext('host').firestore(),a=env.authenticatedContext('student-a').firestore(),b=env.authenticatedContext('student-b').firestore(),out=env.authenticatedContext('outsider').firestore(),anon=env.unauthenticatedContext().firestore(),code='ABCDEFGH',rp=db=>doc(db,'raceRooms',code),pp=(db,id)=>doc(db,'raceRooms',code,'players',id),rr=(db,id)=>doc(db,'raceRooms',code,'results',id);
 const plan={subject:'baharat',set:1,level:0,total:12,fingerprint:'a'.repeat(64),version:13,host:'host',seed:123,status:'lobby',createdAt:serverTimestamp(),closedAt:null};
 await assertFails(setDoc(rp(a),plan));await assertSucceeds(setDoc(rp(host),plan));await assertFails(getDoc(rp(anon)));await assertFails(getDocs(collection(out,'raceRooms')));
 await assertSucceeds(setDoc(pp(a,'student-a'),{nick:'A07',status:'waiting',completed:0}));await assertSucceeds(setDoc(pp(b,'student-b'),{nick:'B08',status:'waiting',completed:0}));
 await assertFails(getDocs(collection(out,'raceRooms',code,'players')));await assertSucceeds(getDocs(collection(a,'raceRooms',code,'players')));await assertFails(updateDoc(rp(a),{status:'playing'}));await assertSucceeds(updateDoc(rp(host),{status:'playing'}));await assertFails(updateDoc(rp(host),{set:2}));
 await assertFails(setDoc(pp(out,'outsider'),{nick:'C09',status:'waiting',completed:0}));
 const result={nick:'A07',subject:'baharat',fingerprint:'a'.repeat(64),total:12,correct:10,score:100};
 await assertFails(setDoc(rr(a,'student-a'),result));
 let batch=writeBatch(a);batch.set(rr(a,'student-a'),{...result,score:120});batch.update(pp(a,'student-a'),{status:'submitted',completed:12});await assertFails(batch.commit());
 batch=writeBatch(a);batch.set(rr(a,'student-a'),result);batch.update(pp(a,'student-a'),{status:'submitted',completed:12});await assertSucceeds(batch.commit());
 await assertFails(updateDoc(rr(a,'student-a'),{correct:12,score:120}));await assertFails(getDoc(rr(b,'student-a')));await assertFails(getDocs(collection(b,'raceRooms',code,'results')));await assertFails(updateDoc(pp(a,'student-a'),{status:'working'}));
 await assertSucceeds(updateDoc(rp(host),{status:'closed',closedAt:serverTimestamp()}));await assertSucceeds(getDocs(collection(b,'raceRooms',code,'results')));await assertFails(getDocs(collection(out,'raceRooms',code,'results')));
 const old='BCDEFGHJ';await env.withSecurityRulesDisabled(async ctx=>setDoc(doc(ctx.firestore(),'raceRooms',old),{...plan,createdAt:Timestamp.fromMillis(Date.now()-90000000)}));await assertFails(setDoc(doc(out,'raceRooms',old,'players','outsider'),{nick:'C09',status:'waiting',completed:0}));
 await assertFails(setDoc(doc(host,'raceRooms','CDEFGHJK'),{...plan,subject:'unknown'}));
 console.log('PASS real Firestore emulator: owner-only room creation/start/close; task schema; private room listing; membership; no late/expired joining; atomic submission; numeric score consistency; immutable submissions; scores hidden from other students until closure; nonmember denial.');
 console.log('LIMIT: valid-looking scores still originate on the client; this is a classroom activity, not a tamper-proof examination service.');
 }finally{await env.cleanup();}})().catch(e=>{console.error(e);process.exitCode=1});
