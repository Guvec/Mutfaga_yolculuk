/* Birlikte Oynayalım: saf (arayüzsüz) model. Soru üretimi, kapışma kuralı ve sıralama burada.
   Aynı tohum (seed) her telefonda aynı soruları ve aynı seçenek sırasını üretir.
   Hiçbir şey ağa ya da ekrana dokunmaz; Node'da da çalışır (tests/yaris-model-tests.cjs). */
(function(root){
 'use strict';
 const labels={baharat:'Baharatlar','mutfak-araclari':'Mutfak Araçları','bulasik-makinesi-temizligi':'Bulaşık Yıkama ve Atık Yönetimi',kuver:'Kuver'};
 const LIMITS={race:{min:2,max:8},duel:{min:2,max:2}};
 const SEC_CHOICES=[15,20,30],N_DEFAULT=10;
 function seeded(seed){let a=seed>>>0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
 function shuffle(a,rng){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 /* Oda kodu: büyük harf ve rakam, Türkçe harfler sadeleşir. */
 function slug(s){return String(s||'').replace(/[çÇ]/g,'C').replace(/[ğĞ]/g,'G').replace(/[ıİiI]/g,'I').replace(/[öÖ]/g,'O').replace(/[şŞ]/g,'S').replace(/[üÜ]/g,'U').toUpperCase().replace(/[^A-Z0-9]/g,'');}
 function validCode(c){return /^[A-Z0-9]{3,10}$/.test(c);}
 /* Sıralamada yalnız ilk ad görünür. */
 function firstName(s){return String(s||'').trim().split(/\s+/)[0].slice(0,16);}
 function validNick(s){return typeof s==='string'&&/^[\p{L}\p{N}_-]{1,16}$/u.test(s.trim());}
 function uniq(a){return Array.from(new Set(a));}
 function finalize(base,choicesText,correctText,rng,extra){
  const order=shuffle(choicesText,rng),ids=['A','B','C','D'];
  return {...base,...extra,choices:order.map((t,i)=>({id:ids[i],text:t})),correct:ids[order.indexOf(correctText)]};
 }
 /* Görselden ad: doğru ad + aynı takımın / çeldirici listesinin üç adı. */
 function imageQuestions(d,set,n,rng){
  let items=d.matches.filter(x=>set===0||x.set===set);
  items=shuffle(items,rng).slice(0,n);
  return items.map(it=>{
   const same=d.matches.filter(x=>x.set===it.set).map(x=>x.answer),extra=(d.distractors&&d.distractors[String(it.set)])||[];
   const pool=shuffle(uniq(same.concat(extra)).filter(x=>x!==it.answer),rng).slice(0,3);
   return finalize({id:it.id,prompt:'Bu nedir?',image:it.image,imageAlt:it.imageAlt||'Adı sorulan nesnenin fotoğrafı.'},[it.answer].concat(pool),it.answer,rng,{explanation:it.explanation||'',hint:it.hint||''});
  });
 }
 function textQuestions(d,n,rng){
  return shuffle(d.questions,rng).slice(0,n).map(q=>{
   const correct=q.choices.find(c=>c.id===q.correct).text;
   return finalize({id:q.id,prompt:q.prompt},q.choices.map(c=>c.text),correct,rng,{explanation:q.explanation||'',hint:q.hint||''});
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
  const rng=seeded(seed),n=Math.max(1,Math.min(spec.n||N_DEFAULT,20));
  if(spec.kind==='kuver')return kuverQuestions(data,spec.set,n,rng);
  if(spec.kind==='bilgi')return textQuestions(data,n,rng);
  return imageQuestions(data,spec.set,n,rng);
 }
 function seedFor(seed,match){return (seed+(match|0)*7919)>>>0;}
 function taskLabel(room,titles){
  if(!room)return '';
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
    Önce doğru basan puanı alır; aynı milisaniyede kurucu kazanır. */
 function duWho(a,b,iAmHost){
  if(a>0&&(!(b>0)||a<b))return 1;
  if(b>0&&(!(a>0)||b<a))return 2;
  if(a>0&&b>0&&a===b)return iAmHost?1:2;
  return 0;
 }
 function duScore(mine,theirs,iAmHost){
  const n=Math.min(mine.length,(theirs||[]).length),s=[0,0];
  for(let i=0;i<n;i++){if(mine[i]===undefined||mine[i]===null||theirs[i]===undefined||theirs[i]===null)continue;const w=duWho(mine[i],theirs[i],iAmHost);if(w===1)s[0]++;else if(w===2)s[1]++;}
  return s;
 }
 /* Kalan turlarda geri gelinemeyecek kadar öndeyse maç biter. */
 function duDecided(sc,played,total){const left=total-played;return Math.abs(sc[0]-sc[1])>left||played>=total;}
 function duResult(sc){return sc[0]>sc[1]?'win':sc[0]<sc[1]?'lose':'draw';}
 const api={labels,LIMITS,SEC_CHOICES,N_DEFAULT,seeded,shuffle,slug,validCode,firstName,validNick,buildQuestions,seedFor,taskLabel,ranks,duWho,duScore,duDecided,duResult};
 root.YarisModel=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
