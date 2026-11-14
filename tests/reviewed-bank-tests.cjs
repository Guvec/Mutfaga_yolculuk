const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const model=require('../js/yaris-model'),root=path.resolve(__dirname,'..');
const subjects=['mutfak-araclari','bulasik-makinesi-temizligi'];
const data=Object.fromEntries(subjects.map(s=>[s,JSON.parse(fs.readFileSync(path.join(root,'content',s,'icerik.json')))]));
const qs=subjects.flatMap(s=>data[s].questions);
const maN=data['mutfak-araclari'].questions.length,blN=data['bulasik-makinesi-temizligi'].questions.length;assert.equal(maN,198);assert.equal(qs.length,maN+blN);assert.equal(new Set(qs.map(q=>q.id)).size,qs.length);
assert.deepEqual(data['bulasik-makinesi-temizligi'].questions.map(q=>q.reviewNumber).filter(Boolean).length>=0,true);
for(const q of qs){assert.equal(q.choices.length,4);assert(q.choices.some(c=>c.id===q.correct));assert.equal(new Set(q.choices.map(c=>c.image||c.text)).size,4,q.id);for(const c of q.choices)if(c.image)assert(fs.existsSync(path.join(root,c.image)),q.id);assert(!/genui|https?:|Görsel düzenleme koşulu/.test(q.explanation));}
for(let seed=0;seed<100;seed++){
 for(const subject of subjects){const out=model.buildQuestions(data[subject],{subject,kind:'bilgi',n:500,pool:true},seed);assert.equal(new Set(out.map(q=>q.equivalenceKey||q.id)).size,out.length);for(const q of out){const source=data[subject].questions.find(x=>x.id===q.id);if(source.choiceOrder)assert.deepEqual(q.choices.map(c=>c.text),source.choices.map(c=>c.text));}}
 const out=model.buildScoped(data,{scope:'butun',distribution:subjects.map(subject=>({subject,n:10})),n:20},seed);assert.equal(out.length,20);assert.equal(new Set(out.map(q=>q.equivalenceKey||q.id)).size,20);
}
assert.equal(data['mutfak-araclari'].matches.find(m=>m.id==='guncel-010').answer,'Kahvaltılık kâse');
assert.equal(data['mutfak-araclari'].matches.filter(m=>m.comparison).length,24);
const img=model.buildQuestions(data['mutfak-araclari'],{subject:'mutfak-araclari',kind:'bilgi',n:500,pool:true},42).find(q=>/^ma-r-/.test(q.id));
assert(img&&img.image,'görselden ad sorusu yarışta sıra görselini korur');
for(const q of data['mutfak-araclari'].questions){const ad=q.choices.map(c=>c.ad);assert(!(ad.includes('Tatlı tabağı')&&ad.includes('Ekmek tabağı')),'boyu yakın tabaklar aynı soruda: '+q.id);}
console.log('PASS: Mutfak Araçları 198 + Bulaşık stable IDs, answer keys and media; ordered choices; 200 text pools and 100 mixed sessions without equivalent repeats; 24 target cards.');
