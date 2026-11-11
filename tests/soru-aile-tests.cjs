/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Mutfak Araçları görsel soruları: çeldiriciler aynı aileden (yoksa aynı üst aileden) gelir.
   Hata: "kaşık" sorusunda bıçak ya da kâse görünmesi. 10 farklı tohumla kabul testi. */
const assert=require('assert'),fs=require('fs'),path=require('path'),m=require('../js/yaris-model.js');
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'..','content','mutfak-araclari','icerik.json'),'utf8'));
const byAnswer=new Map(d.matches.map(x=>[x.answer,x]));
let ok=0;const bad=[];
for(const set of [0,1,2,3,4,5,6,7,8,9,10,11,12]){
 for(let seed=1;seed<=10;seed++){
  const qs=m.buildQuestions(d,{subject:'mutfak-araclari',kind:'gorsel',set,n:500,pool:true},seed*7919+set);
  for(const q of qs){
   const card=d.matches.find(x=>x.id===q.id),texts=q.choices.map(c=>c.text);
   const disla=new Set(card.disla||[]),ayniAile=d.matches.filter(x=>x.aile===card.aile&&x.id!==card.id&&!disla.has(x.answer)).length;
   for(const t of texts){
    if(t===card.answer)continue;
    const o=byAnswer.get(t);if(!o){bad.push(q.id+': seçenek kartı bulunamadı: '+t);continue;}
    if(disla.has(t))bad.push(q.id+' ('+card.answer+'): '+t+' dışlanan çeldirici');
    if(ayniAile>=3){if(o.aile!==card.aile)bad.push(q.id+' ('+card.answer+'): '+t+' farklı aile ('+o.aile+')');}
    else if(o.ust!==card.ust)bad.push(q.id+' ('+card.answer+'): '+t+' farklı üst aile ('+o.ust+')');
   }
   ok++;
  }
 }
}
if(bad.length){console.log('İlk 12 hata:\n'+bad.slice(0,12).join('\n'));}
assert.strictEqual(bad.length,0,bad.length+' çeldirici aynı türden değil ('+ok+' soru tarandı)');
console.log('PASS Mutfak Araçları çeldiricileri aynı türden ('+ok+' soru, 13 set × 10 tohum)');
