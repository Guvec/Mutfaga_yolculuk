/* Yarış sonuçları yalnız aynı odanın aynı görevleri içinde karşılaştırılır. */
(function(root){
 'use strict';
 const labels={baharat:'Baharatlar','mutfak-araclari':'Mutfak Araçları',kuver:'Kuver'};
 function seeded(seed){let a=seed>>>0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
 function shuffle(a,rng){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function taskLabel(plan){return labels[plan.subject]+' · '+(plan.subject==='kuver'?(plan.level===3?'Tabldot Kuver':'Basit Kuver')+' · Yerini seç':plan.set+'. takım · Eşleştirme');}
 function ranks(results,plan){
  const list=results.filter(x=>x.subject===plan.subject&&x.fingerprint===plan.fingerprint&&x.total===plan.total&&Number.isInteger(x.correct)&&x.correct>=0&&x.correct<=plan.total).slice().sort((a,b)=>b.correct-a.correct||a.nick.localeCompare(b.nick,'tr'));
  return list.map((x,i)=>({...x,rank:i&&list[i-1].correct===x.correct?list.findIndex(y=>y.correct===x.correct)+1:i+1}));
 }
 function validNick(s){return typeof s==='string'&&/^[\p{L}\p{N} _-]{1,16}$/u.test(s.trim());}
 async function fingerprint(payload){const bytes=new TextEncoder().encode(JSON.stringify(payload));const sum=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(sum),x=>x.toString(16).padStart(2,'0')).join('');}
 const api={labels,seeded,shuffle,taskLabel,ranks,validNick,fingerprint};root.YarisModel=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
