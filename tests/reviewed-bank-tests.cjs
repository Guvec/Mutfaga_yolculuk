const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const model=require('../js/yaris-model'),root=path.resolve(__dirname,'..');
const subjects=['mutfak-araclari','bulasik-makinesi-temizligi'];
const data=Object.fromEntries(subjects.map(s=>[s,JSON.parse(fs.readFileSync(path.join(root,'content',s,'icerik.json')))]));
const qs=subjects.flatMap(s=>data[s].questions);
assert.equal(qs.length,174);assert.equal(new Set(qs.map(q=>q.id)).size,174);
assert.deepEqual(qs.map(q=>q.reviewNumber),Array.from({length:174},(_,i)=>i+1));
for(const q of qs){assert.equal(q.choices.length,4);assert(q.choices.some(c=>c.id===q.correct));assert.equal(new Set(q.choices.map(c=>c.image||c.text)).size,4,q.id);for(const c of q.choices)if(c.image)assert(fs.existsSync(path.join(root,c.image)),q.id);assert(!/genui|https?:|Görsel düzenleme koşulu/.test(q.explanation));}
for(const n of [32,38]){const texts=qs[n-1].choices.map(c=>c.text);assert.deepEqual(texts,texts.slice().sort((a,b)=>a.localeCompare(b,'tr')));}
for(const n of [58,59,60,61,62]){const a=qs[n-1].choices.map(c=>Number(c.text.replace('−','-').match(/[-+]?\d+/)[0]));assert.deepEqual(a,a.slice().sort((a,b)=>a-b));}
for(let seed=0;seed<100;seed++){
 for(const subject of subjects){const out=model.buildQuestions(data[subject],{subject,kind:'bilgi',n:500,pool:true},seed);assert.equal(new Set(out.map(q=>q.equivalenceKey||q.id)).size,out.length);for(const q of out){const source=data[subject].questions.find(x=>x.id===q.id);if(source.choiceOrder)assert.deepEqual(q.choices.map(c=>c.text),source.choices.map(c=>c.text));}}
 const out=model.buildScoped(data,{scope:'butun',distribution:subjects.map(subject=>({subject,n:10})),n:20},seed);assert.equal(out.length,20);assert.equal(new Set(out.map(q=>q.equivalenceKey||q.id)).size,20);
}
assert.equal(data['mutfak-araclari'].matches.find(m=>m.id==='guncel-010').answer,'Kahvaltılık kâse');
assert.equal(data['mutfak-araclari'].matches.filter(m=>m.comparison).length,24);
const img=model.buildQuestions(data['mutfak-araclari'],{subject:'mutfak-araclari',kind:'bilgi',n:500,pool:true},42).find(q=>q.id==='m-kd-11-1'||q.id==='m-bd-1-1');
if(img.id==='m-kd-11-1')assert(img.image,'image-dependent text item must retain its photo in races');
console.log('PASS: 174 stable IDs, answer keys and media; ordered choices; 200 text pools and 100 mixed sessions without equivalent repeats; 24 target cards.');
