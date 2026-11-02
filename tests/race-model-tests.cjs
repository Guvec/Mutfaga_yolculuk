const assert=require('assert'),m=require('../js/yaris-model.js');
const a=m.shuffle(Array.from({length:18},(_,i)=>i),m.seeded(123)),b=m.shuffle(Array.from({length:18},(_,i)=>i),m.seeded(123));assert.deepEqual(a,b);assert.notDeepEqual(a,m.shuffle(a,m.seeded(456)));
for(const subject of ['baharat','mutfak-araclari','kuver']){
 const plan={subject,total:subject==='kuver'?5:12,fingerprint:'test'};
 const rows=m.ranks([{nick:'A',subject,total:plan.total,fingerprint:'test',correct:4,time:100},{nick:'B',subject,total:plan.total,fingerprint:'test',correct:4,time:1},{nick:'C',subject,total:plan.total,fingerprint:'test',correct:2},{nick:'Other',subject:subject==='kuver'?'baharat':'kuver',total:plan.total,fingerprint:'test',correct:5},{nick:'Other set',subject,total:plan.total,fingerprint:'other',correct:5}],plan);
 assert.deepEqual(rows.map(x=>x.rank),[1,1,3]);assert.equal(rows.length,3);
}
assert(m.validNick('A07'));assert(m.validNick('Öğrenci 2'));assert(!m.validNick('<script>'));assert(!m.validNick('a'.repeat(17)));console.log('PASS: seeded ordering; category/task isolation; shared ranks 1,1,3; speed ignored; participant code validation.');
