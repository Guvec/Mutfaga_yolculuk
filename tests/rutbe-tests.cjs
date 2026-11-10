const assert=require('assert'),r=require('../js/rutbe.js');let id=0;
const event=(x={})=>({pid:'p',id:String(++id),table:'a',correct:10,total:10,at:Date.parse('2026-11-04T12:00:00Z'),...x});
for(const total of [10,15,20,25])assert.equal(r.points(total,total),10);
assert.equal(r.points(7,15),5);assert.equal(r.points(0,20),0);
let s;for(let i=0;i<3;i++)s=r.complete(s,event()).state;assert.equal(s.mp,35);assert.equal(r.complete(s,event()).gain,0);
assert.equal(r.complete(s,event({at:Date.parse('2026-11-04T21:00:00Z')})).gain,10);
assert.equal(r.day(Date.parse('2026-11-04T20:59:59Z')),'2026-11-04');assert.equal(r.day(Date.parse('2026-11-04T21:00:00Z')),'2026-11-05');
let m;for(let i=0;i<2;i++)m=r.complete(m,event({match:true,opponents:['q'],win:true})).state;assert.equal(m.mp,12);assert.equal(r.complete(m,event({match:true,opponents:['q'],win:true})).gain,0);assert.equal(r.complete(m,event({match:true,opponents:[null],win:true})).gain,0);
assert.equal(r.complete(null,event({guest:true})).gain,0);assert.equal(r.complete(null,event({abandoned:true})).gain,0);
assert.deepEqual(r.config.ranks.map(x=>x.name),['Çırak','Aşçı Yardımcısı','Aşçı','Kaptan','Şef Yardımcısı']);assert.deepEqual(r.config.ranks.map(x=>x.mp),[0,100,300,650,1100]);
assert.equal(r.complete({mp:10,rank:5},event()).state.rank,5);
for(const [key,badge] of [['yol-ma-tamam','arac'],['yol-bh-tamam','baharat']]){assert(!r.badges({best:{}})[badge]);assert(r.badges({best:{[key]:1}})[badge]);}
/* Yolculuk ilerlemesi: bölüm ilk kez bitince puan verir, yeniden çözmek puan vermez */
{const ev=(id,puan)=>({pid:'p',id,table:id,correct:1,total:1,ilerleme:true,puan,at:Date.parse('2026-11-10T09:00:00Z')});let a=r.complete(null,ev('yol-ma-e1b1',r.config.yolBolum));assert(a.gain===r.config.yolBolum);let b=r.complete(a.state,{...ev('yol-ma-e1b1',r.config.yolBolum),id:'baska-oturum'});assert(b.gain===0);let c=r.complete(b.state,ev('yol-ma-e1s',r.config.yolEtap));assert(c.gain===r.config.yolEtap&&c.state.mp===r.config.yolBolum+r.config.yolEtap);}
assert(r.badges({best:{'kv-basit':4,'kv-tabldot':6}}).kuver);assert(!r.badges({best:{'kv-basit':3,'kv-tabldot':6}}).kuver);assert(!r.badges({best:{'kv-basit':4,'kv-tabldot':5}}).kuver);
assert(r.badges({best:{'bl-e1':10,'bl-s1':55}}).temizlik);assert(!r.badges({best:{'bl-e1':9,'bl-s1':55}}).temizlik);assert(!r.badges({best:{'bl-e1':10,'bl-s1':54}}).temizlik);
assert(r.badges({mixed:5,mixed70:true}).karisik);assert(!r.badges({mixed:4,mixed70:true}).karisik);assert(!r.badges({mixed:5}).karisik);
assert(r.badges({beaten:{a:1,b:1,c:1,d:1,e:1}}).rekor);assert(!r.badges({beaten:{a:1,b:1,c:1,d:1}}).rekor);
let w;for(let i=0;i<3;i++)w=r.complete(w,event({weekly:true,week:300,total:25,correct:25})).state;assert.equal(w.mp,30);assert.equal(r.complete(w,event({weekly:true,week:300,total:25,correct:25})).gain,0);
let b=r.complete(null,event({correct:5})).state;assert.equal(r.complete(b,event({correct:6})).gain,9);b=r.complete(b,event({correct:6})).state;assert.equal(r.complete(b,event({correct:7})).gain,7);
const e=event();const once=r.complete(null,e);assert.equal(r.complete(once.state,e).gain,0);
console.log('PASS rütbe: formül; dört toplam; günlük/haftalık/rakip sınırı; misafir; yarım oturum; eşikler; düşmeme; tüm rozetlerin sınırları; Türkiye gün sınırı; bonus ve yinelenen kayıt.');
