/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Er Meydanı 2: aynı havuz, bağımsız ilerleme ve ortak kayıtlardan sıralama. */
(function(root){'use strict';
 const MAX=75,ERRORS=4;
 function limit(ok,room){const modern=/^arena4-/.test(room&&room.rev||'');return Math.max(7000,(modern?20000:15000)-Math.floor(Math.max(0,ok)/(modern?6:5))*1000);}
 function maxPlayers(room){return /^arena4-/.test(room&&room.rev||'')?10:4;}
 function errorLimit(room){return /^arena[34]-/.test(room&&room.rev||'')?7:ERRORS;}
 function stats(r,errors=ERRORS,room){const a=Array.isArray(r)?r:[],out={ok:0,bad:0,n:0,tt:0};for(const v of a){if(!Number.isInteger(v)||v===0||Math.abs(v)>limit(out.ok,room)||out.bad>=errors||out.n>=MAX)break;out.n++;out.tt+=Math.abs(v);if(v>0)out.ok++;else out.bad++;}return out;}
 function ranks(players,errors=ERRORS,room){const a=players.map(p=>({...p,...stats(p.r,errors,room)})).sort((a,b)=>Number(!!a.left)-Number(!!b.left)||b.ok-a.ok||a.tt-b.tt||String(a.nick).localeCompare(String(b.nick),'tr')||String(a.uid).localeCompare(String(b.uid)));return a.map((p,i)=>({...p,rank:p.left?null:(i&&a[i-1].ok===p.ok&&a[i-1].tt===p.tt?a.findIndex(x=>!x.left&&x.ok===p.ok&&x.tt===p.tt)+1:i+1)}));}
 function complete(roster,players){return roster.length>=3&&roster.every(uid=>players.some(p=>p.uid===uid&&p.done&&p.pending===false&&p.fromCache===false));}
 function build(data,seed,ym){let qs=[];['mutfak-araclari','baharat'].forEach((subject,i)=>{const pool=ym.buildQuestions(data[subject],{subject,kind:'gorsel',set:0,n:500,pool:true},ym.seedFor(seed,i));const n=i?37:38;if(pool.length<n)throw Error('Er Meydanı için soru havuzu yetersiz.');qs.push(...pool.slice(0,n).map(q=>({...q,subject,id:subject+'|'+q.id})));});return ym.shuffle(qs,ym.seeded(seed));}
 /* Konu seçilen yeni odalar; arena2 odalarının 38+37 havuzu değişmez. */
 function selectedSubjects(spec,ym){return spec.scope==='konu'?[spec.subject]:ym.SUBJECT_ORDER.slice();}
 function buildSelected(data,seed,ym,spec){
  const subjects=selectedSubjects(spec,ym);
  if(!subjects.length||subjects.some(x=>!ym.SUBJECT_ORDER.includes(x)))throw Error('Er Meydanı konusu geçersiz.');
  const pools=subjects.map((subject,i)=>{
   if(!data[subject])throw Error('Konu dosyası yüklenemedi: '+subject);
   const seen=new Set();return ym.subjectPool(data,subject,spec,ym.seedFor(seed,i)).filter(q=>{if(seen.has(q.id))return false;seen.add(q.id);return true;});
  });
  const qs=[];let pos=0;
  while(qs.length<MAX&&pools.some(p=>pos<p.length)){for(const pool of pools){if(pool[pos])qs.push(pool[pos]);if(qs.length===MAX)break;}pos++;}
  if(qs.length<3)throw Error('Er Meydanı için en az üç farklı soru gerekir.');
  return ym.shuffle(qs,ym.seeded(seed));
 }
 const api={MAX,ERRORS,errorLimit,maxPlayers,limit,stats,ranks,complete,build,buildSelected,selectedSubjects};root.ArenaModel=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
