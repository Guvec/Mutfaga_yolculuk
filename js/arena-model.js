/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Er Meydanı 2: aynı havuz, bağımsız ilerleme ve ortak kayıtlardan sıralama. */
(function(root){'use strict';
 const MAX=100,MAX5=150,ERRORS=4;
 function maxQ(room){return /^arena5-/.test(room&&room.rev||'')?MAX5:MAX;}
 function limit(ok,room){const modern=/^arena[45]-/.test(room&&room.rev||'');return Math.max(7000,(modern?20000:15000)-Math.floor(Math.max(0,ok)/(modern?6:5))*1000);}
 function maxPlayers(room){return /^arena[45]-/.test(room&&room.rev||'')?10:4;}
 function errorLimit(room){const r=room&&room.rev||'';return /^arena5-/.test(r)?12:/^arena[34]-/.test(r)?7:ERRORS;}
 function modern5(room){return /^arena5-/.test(room&&room.rev||'');}
 /* Altın soru (v3.13): her 25 soruluk dilimde bir tane, odanın tohumundan; odadaki herkes için aynı sıra. */
 function goldIdx(room){if(!modern5(room))return [];const s=(Number(room.seed)>>>0)||1,out=[];for(let b=0;b<6;b++){let h=Math.imul(s^Math.imul(b+1,2654435761),2246822519)>>>0;h=(h^(h>>>13))>>>0;out.push(25*b+5+(h%20));}return out;}
 /* Puan: doğru 1; altın soru +2; 5 doğruluk seriden sonraki 3 doğru +1. Kalkan (kl) o sorudaki yanlışı saymaz; +10 sn (sn) o sorunun süresini uzatır. */
 function stats(r,errors=ERRORS,room,pl){
  const a=Array.isArray(r)?r:[],m5=modern5(room),kl=pl&&Number.isInteger(pl.kl)?pl.kl:-1,sn=pl&&Number.isInteger(pl.sn)?pl.sn:-1,G=new Set(goldIdx(room));
  const out={ok:0,bad:0,n:0,tt:0,score:0,gold:0,best:0,run:0};let boost=0;
  for(let i=0;i<a.length;i++){const v=a[i];const lim=limit(out.ok,room)+(m5&&i===sn?10000:0);
   if(!Number.isInteger(v)||v===0||Math.abs(v)>lim||out.bad>=errors||out.n>=maxQ(room))break;
   out.n++;out.tt+=Math.abs(v);
   if(v>0){out.ok++;out.score++;if(m5){if(G.has(i)){out.score+=2;out.gold++;}if(boost>0){out.score++;boost--;}out.run++;if(out.run>out.best)out.best=out.run;if(out.run%5===0)boost=3;}}
   else{if(!(m5&&i===kl))out.bad++;out.run=0;boost=0;}
  }
  if(!m5)out.score=out.ok;out.boost=boost;return out;
 }
 function ranks(players,errors=ERRORS,room){const a=players.map(p=>({...p,...stats(p.r,errors,room,p)})).sort((a,b)=>Number(!!a.left)-Number(!!b.left)||b.score-a.score||a.tt-b.tt||String(a.nick).localeCompare(String(b.nick),'tr')||String(a.uid).localeCompare(String(b.uid)));return a.map((p,i)=>({...p,rank:p.left?null:(i&&a[i-1].score===p.score&&a[i-1].tt===p.tt?a.findIndex(x=>!x.left&&x.score===p.score&&x.tt===p.tt)+1:i+1)}));}
 function complete(roster,players){return roster.length>=3&&roster.every(uid=>players.some(p=>p.uid===uid&&p.done&&p.pending===false&&p.fromCache===false));}
 function build(data,seed,ym){let qs=[];['mutfak-araclari','baharat'].forEach((subject,i)=>{const pool=ym.buildQuestions(data[subject],{subject,kind:'gorsel',set:0,n:500,pool:true},ym.seedFor(seed,i));const n=i?37:38;if(pool.length<n)throw Error('Er Meydanı için soru havuzu yetersiz.');qs.push(...pool.slice(0,n).map(q=>({...q,subject,id:subject+'|'+q.id})));});return ym.shuffle(qs,ym.seeded(seed));}
 /* Konu seçilen yeni odalar; arena2 odalarının 38+37 havuzu değişmez. */
 /* Er Meydanı konuları: Beslenme yalnız burada "Tüm konular"a katılır; diğer oyunların SUBJECT_ORDER'ı değişmez. */
 const EXTRA=['beslenme-ilkeleri'];
 const WEIGHT={'mutfak-araclari':45,'beslenme-ilkeleri':35,baharat:35,'bulasik-makinesi-temizligi':20,kuver:15};
 function allSubjects(ym){return ym.SUBJECT_ORDER.concat(EXTRA);}
 function selectedSubjects(spec,ym){return spec.scope==='konu'?[spec.subject]:allSubjects(ym);}
 /* Aynı baharatın farklı hâlleri (taze/kuru, yaprak/tohum) bir odada tek soru sayılır. */
 function famKey(q){
  const c=(q.choices||[]).find(x=>x.id===q.correct);if(!c)return q.id;
  let t=String(c.text).replace(/\([^)]*\)/g,'').trim().toLocaleUpperCase('tr');
  t=t.replace(/^TAZE\s+(?=\S)/,'').replace(/^(KİŞNİŞ)\s+(TOHUMU|YAPRAĞI)$/,'$1').replace(/\s+/g,' ');
  return t;
 }
 function quotas(subjects,pools,cap){
  const w=subjects.map(s=>WEIGHT[s]||10),tot=w.reduce((a,b)=>a+b,0),q=w.map(x=>Math.floor(cap*x/tot));
  let rest=cap-q.reduce((a,b)=>a+b,0);
  const ord=w.map((x,i)=>[cap*x/tot-q[i],i]).sort((a,b)=>b[0]-a[0]);for(let k=0;rest>0&&k<ord.length;k++,rest--)q[ord[k][1]]++;
  for(let i=0;i<q.length;i++)if(q[i]>pools[i].length){rest+=q[i]-pools[i].length;q[i]=pools[i].length;}
  while(rest>0){let moved=false;for(let i=0;i<q.length&&rest>0;i++)if(q[i]<pools[i].length){q[i]++;rest--;moved=true;}if(!moved)break;}
  return q;
 }
 function buildSelected(data,seed,ym,spec){
  const cap=Math.min(maxQ(spec),Number.isInteger(spec&&spec.n)&&spec.n>=3?spec.n:maxQ(spec));
  const subjects=selectedSubjects(spec,ym);
  if(!subjects.length||subjects.some(x=>!allSubjects(ym).includes(x)))throw Error('Er Meydanı konusu geçersiz.');
  const pools=subjects.map((subject,i)=>{
   if(!data[subject])throw Error('Konu dosyası yüklenemedi: '+subject);
   const seen=new Set(),fam=new Set();return ym.subjectPool(data,subject,spec,ym.seedFor(seed,i)).filter(q=>{if(seen.has(q.id))return false;seen.add(q.id);if(subject==='baharat'){const k=famKey(q);if(fam.has(k))return false;fam.add(k);}return true;});
  });
  /* Mutfak Araçları: görselden ad soruları ile sorarken öğreten fotoğraflı sorular karışık gelsin (havuzda önce görsel sorular dizilidir). */
  subjects.forEach((subject,i)=>{if(subject==='mutfak-araclari')pools[i]=ym.shuffle(pools[i],ym.seeded(ym.seedFor(seed,i+7)));});
  const q=quotas(subjects,pools,cap),qs=[];
  pools.forEach((pool,i)=>qs.push(...pool.slice(0,q[i])));
  if(qs.length<3)throw Error('Er Meydanı için en az üç farklı soru gerekir.');
  return ym.shuffle(qs,ym.seeded(seed));
 }
 const api={modern5,goldIdx,MAX,MAX5,maxQ,ERRORS,errorLimit,maxPlayers,limit,stats,ranks,complete,build,buildSelected,selectedSubjects,famKey,quotas};root.ArenaModel=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
