/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Er Meydanı 2: aynı havuz, bağımsız ilerleme ve ortak kayıtlardan sıralama. */
(function(root){'use strict';
 const MAX=75,ERRORS=4;
 function limit(ok){return Math.max(7000,15000-Math.floor(Math.max(0,ok)/5)*1000);}
 function stats(r){const a=Array.isArray(r)?r:[],out={ok:0,bad:0,n:0,tt:0};for(const v of a){if(!Number.isInteger(v)||v===0||Math.abs(v)>limit(out.ok)||out.bad>=ERRORS||out.n>=MAX)break;out.n++;out.tt+=Math.abs(v);if(v>0)out.ok++;else out.bad++;}return out;}
 function ranks(players){const a=players.map(p=>({...p,...stats(p.r)})).sort((a,b)=>Number(!!a.left)-Number(!!b.left)||b.ok-a.ok||a.tt-b.tt||String(a.nick).localeCompare(String(b.nick),'tr')||String(a.uid).localeCompare(String(b.uid)));return a.map((p,i)=>({...p,rank:p.left?null:(i&&a[i-1].ok===p.ok&&a[i-1].tt===p.tt?a.findIndex(x=>!x.left&&x.ok===p.ok&&x.tt===p.tt)+1:i+1)}));}
 function complete(roster,players){return roster.length>=3&&roster.every(uid=>players.some(p=>p.uid===uid&&p.done&&p.pending===false&&p.fromCache===false));}
 function build(data,seed,ym){let qs=[];['mutfak-araclari','baharat'].forEach((subject,i)=>{const pool=ym.buildQuestions(data[subject],{subject,kind:'gorsel',set:0,n:500,pool:true},ym.seedFor(seed,i));const n=i?37:38;if(pool.length<n)throw Error('Er Meydanı için soru havuzu yetersiz.');qs.push(...pool.slice(0,n).map(q=>({...q,subject,id:subject+'|'+q.id})));});return ym.shuffle(qs,ym.seeded(seed));}
 const api={MAX,ERRORS,limit,stats,ranks,complete,build};root.ArenaModel=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
