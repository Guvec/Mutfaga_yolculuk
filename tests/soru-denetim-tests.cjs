/* Görsel soru kökleri, maddeye özel dışlamalar ve bilgi cevaplarının karıştırılması. */
const assert=require('node:assert/strict');
const model=require('../js/yaris-model.js');
const subjects=['baharat','mutfak-araclari','bulasik-makinesi-temizligi'];
let generated=0;
for(const subject of subjects){
 const d=require('../content/'+subject+'/icerik.json');
 const originals=new Map(d.matches.map(it=>[it.id,it]));
 for(let seed=0;seed<200;seed++){
  const questions=model.buildQuestions(d,{subject,kind:'gorsel',set:0,n:500,pool:true},seed);
  assert.equal(questions.length,d.matches.length,'Her madde her denemede sınanır.');
  for(const q of questions){
   const it=originals.get(q.id),texts=q.choices.map(c=>c.text);
   if(it.kok)assert.equal(q.prompt,it.kok,q.id+' kök');
   assert.equal(texts.length,4,q.id+' seçenek sayısı');
   assert.equal(new Set(texts).size,4,q.id+' farklı seçenek');
   assert.equal(texts.filter(t=>t===it.answer).length,1,q.id+' doğru ad tek');
   assert.equal(q.choices.find(c=>c.id===q.correct).text,it.answer,q.id+' doğru harf');
   for(const name of it.disla||[])assert(!texts.includes(name),q.id+' dışlanan ad: '+name);
   if(it.grup){
    const allowed=d.matches.filter(x=>x.grup===it.grup).map(x=>x.answer);
    assert(texts.every(t=>allowed.includes(t)),q.id+' nesne/atık grupları karışmaz');
   }
   generated++;
  }
 }
 // Bilgi sorularının doğru seçenek kimliği, açıklaması ve fotoğrafı karışırken korunur.
 for(const source of d.questions){
  const correct=source.choices.find(c=>c.id===source.correct);
  assert(correct,source.id+' kaynak doğru seçenek');
  for(let seed=0;seed<200;seed++){
   const [q]=model.buildQuestions({questions:[source]},{subject,kind:'bilgi',n:1},seed);
   const picked=q.choices.find(c=>c.id===q.correct);
   assert.equal(q.choices.length,4,source.id);
   assert.equal(picked.text,correct.text||'',source.id+' metin');
   assert.equal(picked.image,correct.image,source.id+' görsel');
   assert.equal(q.explanation,source.explanation||'',source.id+' açıklama');
  }
 }
}
const mut=require('../content/mutfak-araclari/icerik.json');
const expected={
 'm-kd-43-6':['B','Reçetede belirtilen miktara göre','Reçetede belirtilen miktar'],
 'm-kd-69-5':['A','200 ml çizgisi bulunan ölçü kabı','200 ml çizgisi'],
 'm-kd-90-5':['A','Yiyecek ve cihaz talimatına göre','yiyecek ve cihaz için verilen talimatlara'],
 'm-bd-1-5':['D','Konuğun sağına','kulpu konuğun sağına'],
 'm-kd-95-3':['B','Haznenin en fazla doldurulacağı düzeyi','en yüksek dolum çizgisini aşmayacak']
};
for(const [id,[letter,text,evidence]] of Object.entries(expected)){
 const q=mut.questions.find(q=>q.id===id);
 assert.equal(q.correct,letter,id+' kaynak harf');
 assert.equal(q.choices.find(c=>c.id===letter).text,text,id+' doğru anlam');
 assert(q.explanation.includes(evidence),id+' açıklama/cevap uyumu');
}
assert.throws(()=>model.buildQuestions({matches:[{id:'dar-havuz',set:1,answer:'A',disla:['B']},{id:'b',set:1,answer:'B'},{id:'c',set:1,answer:'C'},{id:'d',set:1,answer:'D'}]},{kind:'gorsel',set:1,n:4},1),/dar-havuz: en az üç/);
console.log('PASS: '+generated+' görsel soru (her madde 200 kez), özel kökler/dışlamalar, dört tekil seçenek, nesne/atık ayrımı, tüm bilgi sorularının 200 kez doğru harf eşlemesi ve beş değişen sorunun açıklama uyumu.');
