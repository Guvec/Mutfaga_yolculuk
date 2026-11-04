const assert=require('assert'),fs=require('fs'),path=require('path'),m=require('../js/yaris-model.js');
const root=path.resolve(__dirname,'..'),load=s=>JSON.parse(fs.readFileSync(path.join(root,'content',s,'icerik.json'),'utf8'));
// 1) aynı tohum aynı sıra
const a=m.shuffle(Array.from({length:18},(_,i)=>i),m.seeded(123)),b=m.shuffle(Array.from({length:18},(_,i)=>i),m.seeded(123));assert.deepEqual(a,b);assert.notDeepEqual(a,m.shuffle(a,m.seeded(456)));
// 2) soru üretimi: dört farklı seçenek, doğru cevap içinde, iki telefonda aynı
function check(qs,label){
 assert(qs.length>=3,label+': soru sayısı');
 for(const q of qs){
  assert.equal(q.choices.length,4,label+' dört seçenek');assert.deepEqual(q.choices.map(c=>c.id),['A','B','C','D']);
  assert.equal(new Set(q.choices.map(c=>c.text)).size,4,label+' seçenekler farklı: '+q.prompt+' '+JSON.stringify(q.choices.map(c=>c.text)));
  assert(q.choices.some(c=>c.id===q.correct),label+' doğru seçenek var');assert(q.prompt&&q.prompt.length>3);
 }
 assert.equal(new Set(qs.map(q=>q.id)).size,qs.length,label+' soru kimlikleri benzersiz');
}
const bah=load('baharat'),mut=load('mutfak-araclari'),bul=load('bulasik-makinesi-temizligi');
for(let s=1;s<=8;s++){const q1=m.buildQuestions(bah,{kind:'gorsel',set:s,n:10},777),q2=m.buildQuestions(bah,{kind:'gorsel',set:s,n:10},777);assert.deepEqual(q1,q2);check(q1,'baharat '+s);assert.equal(q1.length,10);assert(q1.every(q=>q.image));}
for(let s=1;s<=12;s++){const q=m.buildQuestions(mut,{kind:'gorsel',set:s,n:10},42);check(q,'mutfak '+s);}
check(m.buildQuestions(mut,{kind:'gorsel',set:0,n:10},5),'mutfak karışık');check(m.buildQuestions(mut,{kind:'bilgi',set:0,n:10},5),'mutfak bilgi');
check(m.buildQuestions(bul,{kind:'gorsel',set:0,n:10},5),'bulaşık görsel');check(m.buildQuestions(bul,{kind:'bilgi',set:0,n:10},5),'bulaşık bilgi');
assert.notDeepEqual(m.buildQuestions(bah,{kind:'gorsel',set:1,n:10},1).map(q=>q.id),m.buildQuestions(bah,{kind:'gorsel',set:1,n:10},m.seedFor(1,1)).map(q=>q.id),'rövanşta farklı sıra');
// kuver (core.js/platform.js verisini sınama için okur)
const vm=require('vm'),core=fs.readFileSync(path.join(root,'js/core.js'),'utf8'),plat=fs.readFileSync(path.join(root,'js/platform.js'),'utf8');
const ctx={};vm.createContext(ctx);
const itemsSrc=core.slice(core.indexOf('var IMG ='),core.indexOf('var LEVELS'));
vm.runInContext(itemsSrc+'\nvar LEVELS={};',ctx);
const lv=plat.slice(plat.indexOf('LEVELS={'),plat.indexOf('};',plat.indexOf('LEVELS={'))+2),fixes=plat.slice(plat.indexOf("ITEMS.kuver_tabagi.kural"),plat.indexOf('function subjectName'));
vm.runInContext(lv+'\n'+fixes,ctx);
const kuver={LEVELS:ctx.LEVELS,ITEMS:ctx.ITEMS,IMG:ctx.IMG,PLACE_LABEL:vm.runInContext('PLACE_LABEL',ctx)};
for(const level of[1,3]){const q=m.buildQuestions(kuver,{kind:'kuver',set:level,n:10},9);check(q,'kuver '+level);assert.deepEqual(q,m.buildQuestions(kuver,{kind:'kuver',set:level,n:10},9));}
// 3) kapışma kuralı: önce doğru basan alır
assert.equal(m.duWho(1200,2000,true),1);assert.equal(m.duWho(2000,1200,true),2);assert.equal(m.duWho(-500,900,true),2);assert.equal(m.duWho(900,-500,false),1);assert.equal(m.duWho(-1,-2,true),0);
assert.equal(m.duWho(1000,1000,true),0,'çok yakın basışta beraberlik');assert.equal(m.duWho(1000,1150,false),0);assert.equal(m.duWho(1000,1250,true),1,'200 ms farktan sonra hızlı olan alır');assert.equal(m.duWho(1250,1000,true),2);assert.equal(m.duWho(1000,-1150,true),1,'rakip yanlışsa beraberlik yok');
assert.deepEqual(m.duScore([1000,-800,900],[1500,700,-1],true),[2,1]);assert.deepEqual(m.duScore([1000,-800],[1500],true),[1,0],'rakibin henüz yazmadığı tur sayılmaz');
assert.equal(m.duDecided([6,0],6,10),true);assert.equal(m.duDecided([5,1],6,10),false);assert.equal(m.duDecided([5,5],10,10),true);assert.equal(m.duResult([3,3]),'draw');
// rövanş: önceki maçın soruları sona kalır, iki telefonda aynı sıra
{const sp={subject:'baharat',kind:'gorsel',set:1,n:5},q0=m.buildQuestions(bah,sp,m.seedFor(9,0)),ids0=q0.map(q=>q.id),q1=m.buildFresh(bah,sp,m.seedFor(9,1),ids0);
 assert.deepEqual(q1,m.buildFresh(bah,sp,m.seedFor(9,1),ids0));assert.equal(q1.length,5);
 const pool=bah.matches.filter(x=>x.set===1).length;assert(pool>=10?q1.every(q=>!ids0.includes(q.id)):q1.filter(q=>ids0.includes(q.id)).length<=Math.max(0,5-(pool-5)),'rövanşta yeni sorular önce gelir (havuz '+pool+')');}
// 4) sıralama: doğru sayısı; eşitler aynı sırayı paylaşır; süre etkisiz
const r=m.ranks([{nick:'Ali',ok:7,tt:99999},{nick:'Ayşe',ok:7,tt:1},{nick:'Can',ok:3},{nick:'Deniz',ok:9}]);
assert.deepEqual(r.map(x=>[x.nick,x.rank]),[['Deniz',1],['Ali',2],['Ayşe',2],['Can',4]]);
// 5) ad ve kod
assert.equal(m.firstName('  Ali Arıkoğlu '),'Ali');assert(m.validNick('Ali'));assert(!m.validNick('<b>'));assert(m.validNick('🦊 Kurnaz Tilki #482'));assert(!m.validNick('a'.repeat(41)));assert.equal(m.cleanNick('  🦁   Kral  Aslan '),'🦁 Kral Aslan');
assert.equal(m.slug('zihin 11-b'),'ZIHIN11B');assert.equal(m.slug('çğıöşü'),'CGIOSU');assert(m.validCode('AB3'));assert(!m.validCode('AB'));
{const d=require('../content/mutfak-araclari/icerik.json');
 for(let seed=0;seed<30;seed++){const qs=m.buildQuestions(d,{subject:'mutfak-araclari',kind:'bilgi',set:0,n:20},seed);qs.forEach(q=>{assert.equal(q.choices.length,4);q.choices.forEach(c=>assert((c.text&&c.text.trim())||c.image,'boş seçenek '+q.id));assert(q.choices.some(c=>c.id===q.correct));});}
 const ph=d.questions.find(q=>q.id==='m-bd-1-1'),orig=ph.choices.find(c=>c.id===ph.correct).image;
 for(let seed=0;seed<20;seed++){const q=m.buildQuestions({questions:[ph]},{subject:'mutfak-araclari',kind:'bilgi',set:0,n:1},seed)[0];assert.equal(q.choices.find(c=>c.id===q.correct).image,orig,'foto seçenekte doğru cevap karışmamalı');}
 }
console.log('PASS: seeded questions (baharat 8, mutfak 12, bulaşık, kuver 1/3, bilgi) have 4 distinct choices; deterministic; rematch differs; duel first-correct rule, ties to host, early finish; shared ranks; first name only; room code slug.');
