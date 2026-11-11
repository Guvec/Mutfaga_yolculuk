/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Birlikte Oynayalım: saf (arayüzsüz) model. Soru üretimi, kapışma kuralı ve sıralama burada.
   Aynı tohum (seed) her telefonda aynı soruları ve aynı seçenek sırasını üretir.
   Hiçbir şey ağa ya da ekrana dokunmaz; Node'da da çalışır (tests/yaris-model-tests.cjs). */
(function(root){
 'use strict';
 const labels={baharat:'Baharatlar','mutfak-araclari':'Mutfak Araçları','bulasik-makinesi-temizligi':'Bulaşık Yıkama ve Atık Yönetimi',kuver:'Kuver','beslenme-ilkeleri':'Beslenme İlkeleri'};
 const LIMITS={race:{min:2,max:8},duel:{min:2,max:2},arena:{min:3,max:4}};
 const SEC_CHOICES=[15,20,30],N_DEFAULT=10,MATCH_CHOICES=[{n:10,name:'Kısa maç',note:'10 soru'},{n:15,name:'Orta maç',note:'15 soru'},{n:20,name:'Uzun maç',note:'20 soru'}];
 function seeded(seed){let a=seed>>>0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
 function shuffle(a,rng){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 /* Oda kodu: büyük harf ve rakam, Türkçe harfler sadeleşir. */
 function slug(s){return String(s||'').replace(/[çÇ]/g,'C').replace(/[ğĞ]/g,'G').replace(/[ıİiI]/g,'I').replace(/[öÖ]/g,'O').replace(/[şŞ]/g,'S').replace(/[üÜ]/g,'U').toUpperCase().replace(/[^A-Z0-9]/g,'');}
 function validCode(c){return /^[A-Z0-9]{3,10}$/.test(c);}
 /* Sıralamada yalnız ilk ad görünür. */
 function firstName(s){return String(s||'').trim().split(/\s+/)[0].slice(0,16);}
 function cleanNick(s){return String(s||'').replace(/\s+/g,' ').trim().slice(0,40);}
 function validNick(s){if(typeof s!=='string')return false;const t=s.replace(/\s+/g,' ').trim();return t.length>=1&&t.length<=40&&!/[<>\u0000-\u001f]/.test(t);}
 function uniq(a){return Array.from(new Set(a));}
 function uniqueQuestions(items){const seen=new Set();return items.filter(q=>{const key=q.equivalenceKey||q.id;if(seen.has(key))return false;seen.add(key);return true;});}
 function finalize(base,choicesText,correctText,rng,extra){
  const order=shuffle(choicesText,rng),ids=['A','B','C','D'];
  return {...base,...extra,choices:order.map((t,i)=>({id:ids[i],text:t})),correct:ids[order.indexOf(correctText)]};
 }
 /* Görselden ad: doğru ad + aynı takımın / çeldirici listesinin üç adı. */
 const IMG_PROMPT={baharat:'Bu görseldeki baharat veya aromatik bitki nedir?','mutfak-araclari':'Bu görseldeki mutfak aracı nedir?','bulasik-makinesi-temizligi':'Bu görseldeki nesne nedir?'};
 function imageQuestions(d,set,n,rng,subject){
  let items=d.matches.filter(x=>set===0||x.set===set);
  items=shuffle(items,rng).slice(0,n);
  return items.map(it=>{
   const same=d.matches.filter(x=>x.set===it.set&&(!it.grup||x.grup===it.grup)).map(x=>x.answer);
   // Gruplu maddelerde yalnız aynı grubun adları kullanılır; ortak havuz iki grubu karıştırabilir.
   const extra=it.grup?[]:((d.distractors&&d.distractors[String(it.set)])||[]);
   const okName=x=>x!==it.answer&&!(it.disla||[]).includes(x);
   let pool;
   if(it.aile){
    // Aile bilgisi olan kartta çeldirici aynı türden gelir: önce aynı aile, yetmezse aynı üst aile.
    const fam=d.matches.filter(x=>x.aile===it.aile).map(x=>x.answer).filter(okName);
    pool=uniq(fam);
    if(pool.length<3)pool=uniq(pool.concat(d.matches.filter(x=>x.ust&&x.ust===it.ust).map(x=>x.answer).filter(okName)));
   }
   if(!pool||pool.length<3)pool=uniq(same.concat(extra)).filter(okName);
   if(pool.length<3)throw new Error(it.id+': en az üç farklı çeldirici gerekir.');
   pool=shuffle(pool,rng).slice(0,3);
   return finalize({id:it.id,prompt:it.comparison?'Üçgenin gösterdiği aracın adı nedir?':it.kok||IMG_PROMPT[subject]||'Bu görselde ne var?',image:it.image,imageAlt:it.imageAlt||'Adı sorulan nesnenin fotoğrafı.',equivalenceKey:it.equivalenceKey,comparisonPosition:it.comparisonPosition},[it.answer].concat(pool),it.answer,rng,{explanation:it.explanation||'',hint:it.hint||''});
  });
 }
 /* Metin sorusu: seçenek bir fotoğraf olabilir (metni boş, image dolu). Doğru seçenek özgün harfinden bulunur. */
 function textQuestions(d,n,rng){
  return uniqueQuestions(shuffle(d.questions,rng)).slice(0,n).map(q=>{
   const order=q.choiceOrder?q.choices.slice():shuffle(q.choices,rng),ids=['A','B','C','D'];
   const choices=order.map((c,i)=>{const o={id:ids[i],text:c.text||''};if(c.image){o.image=c.image;o.alt=c.alt||('Seçenek '+ids[i]+' fotoğrafı');}return o;});
   return {id:q.id,prompt:q.prompt,image:q.image,imageAlt:q.imageAlt,explanation:q.explanation||'',hint:q.hint||'',choices,correct:ids[order.findIndex(c=>c.id===q.correct)],equivalenceKey:q.equivalenceKey,choiceOrder:q.choiceOrder,emphasis:q.emphasis};
  });
 }
 /* Kuver: parçanın adı (görselden) ve parçanın yeri (adından). */
 function kuverQuestions(k,level,n,rng){
  const keys=k.LEVELS[level].items,all=[];
  keys.forEach(key=>{
   all.push({key,type:'yer'});
   if(k.IMG[key]&&key!=='su_bardagi')all.push({key,type:'ad'});
  });
  return shuffle(all,rng).slice(0,n).map(x=>{
   const it=k.ITEMS[x.key],others=shuffle(keys.filter(y=>y!==x.key),rng).slice(0,3);
   if(x.type==='yer')return finalize({id:'kuver-yer-'+x.key,prompt:it.AD+' kuverde nereye konur?'},[k.PLACE_LABEL[x.key]].concat(others.map(y=>k.PLACE_LABEL[y])),k.PLACE_LABEL[x.key],rng,{explanation:it.kural||'',hint:it.ayirt||''});
   return finalize({id:'kuver-ad-'+x.key,prompt:'Bu kuver parçasının adı nedir?',image:k.IMG[x.key],imageAlt:'Adı sorulan kuver parçasının fotoğrafı.'},[it.AD].concat(others.map(y=>k.ITEMS[y].AD)),it.AD,rng,{explanation:it.ayirt||it.kural||'',hint:''});
  });
 }
 /* spec: {subject, kind:'gorsel'|'bilgi'|'kuver', set, n} */
 function buildQuestions(data,spec,seed){
  const rng=seeded(seed),n=Math.max(1,Math.min(spec.n||N_DEFAULT,spec.pool?500:20));
  if(spec.kind==='kuver')return kuverQuestions(data,spec.set,n,rng);
  if(spec.kind==='bilgi')return textQuestions(data,n,rng);
  return imageQuestions(data,spec.set,n,rng,spec.subject);
 }
 /* Rövanş: önceki maçlarda sorulan sorular (exclude: soru kimlikleri) sona kalır; yeni sorular önce gelir.
    Aynı tohum ve aynı exclude her telefonda aynı sırayı üretir. Konu bitince eski sorulara dönülür. */
 function buildFresh(data,spec,seed,exclude){
  if(!exclude||!exclude.length)return buildQuestions(data,spec,seed);
  const n=Math.max(1,Math.min(spec.n||N_DEFAULT,20)),all=buildQuestions(data,{...spec,n:500,pool:true},seed),ex=new Set(exclude.map(id=>String(id).includes('|')?String(id).split('|').slice(1).join('|'):id));
  return all.filter(q=>!ex.has(q.id)).concat(all.filter(q=>ex.has(q.id))).slice(0,n);
 }
 /* Ortak kapsam yöntemi: kalan paylar sabit konu sırasıyla dağıtılır. */
 const SUBJECT_ORDER=['mutfak-araclari','baharat','bulasik-makinesi-temizligi','kuver'];
 function shares(n,subjects){return subjects.map((subject,i)=>({subject,n:Math.floor(n/subjects.length)+(i<n%subjects.length?1:0)}));}
 function subjectPool(data,subject,spec,seed){
  const d=data[subject],rng=seeded(seed),sp={subject,kind:subject==='kuver'?'kuver':'gorsel',set:subject==='kuver'?3:0,n:500,pool:true};
  let qs=buildQuestions(d,sp,seed);
  if((d.questions||[]).length)qs=qs.concat(textQuestions(d,500,rng));
  return uniqueQuestions(qs).map(q=>({...q,subject,id:subject+'|'+q.id}));
 }
 function buildScoped(data,spec,seed,exclude){
  if(!spec.scope||spec.scope==='tek')return buildFresh(data[spec.subject],spec,seed,exclude).map(q=>({...q,subject:spec.subject,id:q.id.includes('|')?q.id:spec.subject+'|'+q.id}));
  const parts=spec.distribution||shares(Math.min(spec.n||10,20),spec.scope==='butun'?SUBJECT_ORDER:[spec.subject]),used=new Set(exclude||[]),out=[],skills=new Set();
  parts.forEach(({subject,n},i)=>{const pool=subjectPool(data,subject,spec,seedFor(seed,i)).filter(q=>!skills.has(q.equivalenceKey||q.id));const fresh=pool.filter(q=>!used.has(q.id)).concat(pool.filter(q=>used.has(q.id)));if(fresh.length<n)throw Error((labels[subject]||subject)+': '+n+' soru için havuz yetersiz ('+fresh.length+').');const take=fresh.slice(0,n);take.forEach(q=>skills.add(q.equivalenceKey||q.id));out.push(...take);});
  return shuffle(out,seeded(seed));
 }
 function seedFor(seed,match){return (seed+(match|0)*7919)>>>0;}
 function taskLabel(room,titles){
  if(!room)return '';
  if(room.scope==='butun')return 'Bütün konular';
  if(room.scope==='konu')return (labels[room.subject]||room.subject)+' · Konu içinde karışık';
  const base=labels[room.subject]||room.subject;
  if(room.kind==='kuver')return base+' · '+(room.set===3?'Tabldot Kuver':'Basit Kuver');
  if(room.kind==='bilgi')return base+' · Bilgi soruları';
  if(!room.set)return base+' · Karışık görseller';
  const t=titles&&titles[String(room.set)];
  return base+' · '+room.set+'. takım'+(t?' · '+t:'');
 }
 /* ---- Oyun Odası sıralaması: doğru sayısı; eşit doğru aynı sırayı paylaşır; süre sırayı değiştirmez. ---- */
 function ranks(players){
  const list=players.filter(p=>p&&typeof p.nick==='string').map(p=>({...p,ok:p.ok|0})).sort((a,b)=>b.ok-a.ok||String(a.nick).localeCompare(String(b.nick),'tr'));
  return list.map((p,i)=>({...p,rank:i&&list[i-1].ok===p.ok?list.findIndex(y=>y.ok===p.ok)+1:i+1}));
 }
 /* ---- 1'e 1 Kapışma ----
    Her oyuncu, tur başına bir sayı yazar: >0 doğru (ms), <0 yanlış/geç/süre, boş (undefined) henüz yanıtlamadı.
    Önce doğru basan puanı alır; iki doğru cevap TIE_MS'den yakınsa berabere (puan yok). */
 /* İki telefon süreyi kendi saatiyle ölçer; ağ gecikmesi birkaç yüz ms fark yaratabilir.
    Bu yüzden iki doğru cevap TIE_MS içinde ise tur berabere sayılır: kimse puan almaz. */
 const TIE_MS=200;
 function duWho(a,b,iAmHost){
  if(a>0&&b>0&&Math.abs(a-b)<TIE_MS)return 0;
  if(a>0&&(!(b>0)||a<b))return 1;
  if(b>0&&(!(a>0)||b<a))return 2;
  return 0;
 }
 function duTie(a,b){return a>0&&b>0&&Math.abs(a-b)<TIE_MS;}
 /* Er Meydanı (3–4 kişi): tur başına her oyuncunun süresi (>0 doğru ms, <0 yanlış/süre, boş: yok).
    En hızlı doğru cevap puan alır; ilk iki doğru TIE_MS'den yakınsa kimse almaz. Dönen: kazananın dizini ya da -1. */
 function arWho(times){
  let best=-1,bt=Infinity,second=Infinity;
  times.forEach((t,i)=>{if(t>0){if(t<bt){second=bt;bt=t;best=i;}else if(t<second)second=t;}});
  if(best<0)return -1;
  return second-bt<TIE_MS?-1:best;
 }
 function duScore(mine,theirs,iAmHost){
  const n=Math.min(mine.length,(theirs||[]).length),s=[0,0];
  for(let i=0;i<n;i++){if(mine[i]===undefined||mine[i]===null||theirs[i]===undefined||theirs[i]===null)continue;const w=duWho(mine[i],theirs[i],iAmHost);if(w===1)s[0]++;else if(w===2)s[1]++;}
  return s;
 }
 /* Kalan turlarda geri gelinemeyecek kadar öndeyse maç biter. */
 function duDecided(sc,played,total){const left=total-played;return Math.abs(sc[0]-sc[1])>left||played>=total;}
 function duResult(sc){return sc[0]>sc[1]?'win':sc[0]<sc[1]?'lose':'draw';}
 const api={SUBJECT_ORDER,shares,buildScoped,subjectPool,labels,LIMITS,SEC_CHOICES,N_DEFAULT,MATCH_CHOICES,seeded,shuffle,slug,validCode,firstName,cleanNick,validNick,buildQuestions,buildFresh,seedFor,TIE_MS,duTie,taskLabel,ranks,duWho,arWho,duScore,duDecided,duResult};
 root.YarisModel=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
