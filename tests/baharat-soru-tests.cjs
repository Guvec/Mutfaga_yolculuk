/* Baharat çoktan seçmeli soru seti: biçim, dil ve çeldirici ölçütleri. */
const assert=require('node:assert/strict');
const d=require('../content/baharat/icerik.json');
const qs=d.questions||[];
const ok=m=>console.log('PASS '+m);
const etiketler=new Set((d.groups||[]).map(g=>g.label));

assert.equal(qs.length,104,'104 soru olmalı');
const bolum={};qs.forEach(q=>bolum[q.group]=(bolum[q.group]||0)+1);
Object.entries(bolum).forEach(([g,n])=>assert(etiketler.has(g),'Tanımsız grup: '+g));
assert.equal(Object.keys(bolum).length,10);ok('104 soru, 10 grup; her grup içerikte tanımlı');

const yasak=/\b(en doğru|temel nedeni|hangi bilgiye göre|sen ne|senin|hepsi|hiçbiri)\b/i;
const koklar=new Set(),idler=new Set();
qs.forEach(q=>{
 assert(!idler.has(q.id),'Aynı kimlik: '+q.id);idler.add(q.id);
 if(!q.image){assert(!koklar.has(q.prompt),'Aynı soru kökü: '+q.prompt);koklar.add(q.prompt);}
 assert(/\?$/.test(q.prompt),'Soru kökü soru işaretiyle bitmeli: '+q.id);
 assert(q.prompt.length<=(q.kalip==='tarif'?140:95),'Soru kökü kısa olmalı: '+q.id+' ('+q.prompt.length+')');
 assert(!yasak.test(q.prompt),'Yasak kalıp (kök): '+q.id);
 assert.equal(q.choices.length,4,'Dört seçenek: '+q.id);
 assert.deepEqual(q.choices.map(c=>c.id),['A','B','C','D'],q.id);
 const metin=q.choices.map(c=>c.text||c.ad);
 assert.equal(new Set(metin).size,4,'Seçenekler birbirinden farklı: '+q.id);
 metin.forEach(t=>{assert(t.length>0&&t.length<=60,'Seçenek uzunluğu: '+q.id);assert(!yasak.test(t),'Yasak kalıp (seçenek): '+q.id);});
 assert(['A','B','C','D'].includes(q.correct),q.id);
 const dogru=(c=>c.text||c.ad)(q.choices.find(c=>c.id===q.correct));
 const digerleri=metin.filter(t=>t!==dogru);
 const ort=digerleri.reduce((a,t)=>a+t.length,0)/3;
 assert(dogru.length<=ort*1.8+6,'Doğru seçenek belirgin uzun: '+q.id+' ('+dogru.length+' / ort '+Math.round(ort)+')');
 assert(q.explanation&&q.explanation.length>20,'Açıklama: '+q.id);
 assert(q.hint&&q.hint.length>10,'İpucu: '+q.id);
 const sade=s=>String(s).toLocaleLowerCase('tr').replace(/[^a-zçğıöşü ]/g,'');
 assert(!sade(q.hint).includes(sade(dogru)),'İpucu cevabı veriyor: '+q.id);
 /* Kökteki ayırt edici sözcük yalnız doğru seçenekte geçmemeli (sözcük ipucu). */
 const kokSoz=new Set(sade(q.prompt).split(/\s+/).filter(w=>w.length>4));
 const dogruSoz=sade(dogru).split(/\s+/).filter(w=>w.length>4&&kokSoz.has(w));
 const digerSoz=digerleri.some(t=>sade(t).split(/\s+/).some(w=>w.length>4&&kokSoz.has(w)));
 assert(!(dogruSoz.length&&!digerSoz),'Kökteki sözcük yalnız doğru seçenekte: '+q.id+' ('+dogruSoz.join(',')+')');
});
ok('Her soru: tek doğru, dört farklı seçenek, kısa kök, yasak kalıp yok');
ok('Doğru seçenek uzunluk ipucu vermiyor, kökteki sözcük cevabı ele vermiyor');
ok('Her soruda açıklama ve cevabı vermeyen ipucu var');

const harf={};qs.forEach(q=>harf[q.correct]=(harf[q.correct]||0)+1);
console.log('Doğru cevap harf dağılımı (uygulamada seçenekler karıştırılır):',JSON.stringify(harf));
console.log('Baharat soru testleri tamam.');
