/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Değerler tek yerden değişir. Yalnız pid bazlı yerel kayıt; sunucuya sadece rank yazılır. */
const RUTBE_AYAR={
 yolBolum:8,yolEtap:20,yolTamam:40,yolTekrar:1,maxMP:10,daily:3,firstBonus:5,recordBonus:3,matchMP:3,winMP:3,opponentDaily:2,weekly:3,
 ranks:[[0],[100,150,200],[300,400,500],[650,800,950],[1100,1300,1500],[1700,1900,2100]],
 dallar:{
  sicak:{baslik:'Sıcak Mutfak',adlar:['Stajyer','Çırak','Aşçı Yardımcısı','Aşçı','Kaptan','Şef Yardımcısı']},
  pasta:{baslik:'Pastacılık',adlar:['Stajyer','Çırak','Pastacı Yardımcısı','Pastacı','Pastacılık Kaptanı','Pastane Şef Yardımcısı']},
  servis:{baslik:'Servis',adlar:['Stajyer','Çırak','Garson','Kıdemli Garson','Kaptan','Şef Garson Yardımcısı']}
 }
};
(function(root){
'use strict';
const steps=RUTBE_AYAR.ranks.flatMap((thresholds,i)=>thresholds.map((mp,j)=>({rank:i+1,stars:i===0?0:j+1,mp})));
const starNames=['','birinci yıldız','ikinci yıldız','üçüncü yıldız'];
function day(ms){return new Date((ms===undefined?Date.now():ms)+10800000).toISOString().slice(0,10);}
function points(ok,total){return total>0?Math.max(0,Math.min(RUTBE_AYAR.maxMP,Math.round(RUTBE_AYAR.maxMP*ok/total))):0;}
function progress(mp){
 const index=steps.reduce((last,step,i)=>mp>=step.mp?i:last,0);
 return {index,current:steps[index],next:steps[index+1]};
}
function level(mp){return progress(mp).current.rank;}
function name(rank,dal){return (RUTBE_AYAR.dallar[dal]||RUTBE_AYAR.dallar.sicak).adlar[rank-1];}
function rankText(step,dal,spoken=false){
 const ad=name(step.rank,dal);
 return !step.stars?ad:ad+(spoken?', '+starNames[step.stars]:' '+'★'.repeat(step.stars));
}
function badges(s){const b=s.best||{},full=(prefix,n)=>Array.from({length:n},(_,i)=>b[prefix+(i+1)]>=10).every(Boolean);return {
 arac:b['yol-ma-tamam']>=1,baharat:b['yol-bh-tamam']>=1,kuver:b['kv-basit']>=4&&b['kv-tabldot']>=6,temizlik:b['bl-e1']>=10&&b['bl-s1']>=55,karisik:(s.mixed||0)>=5&&!!s.mixed70,rekor:Object.keys(s.beaten||{}).length>=5};}
function complete(old,event){
 const s=JSON.parse(JSON.stringify(old||{mp:0,rank:1})),e=event||{};let gain=0;
 if(e.guest||!e.pid||!e.id||!e.total||e.correct<0||e.correct>e.total||e.abandoned)return {state:s,gain:0,newBadges:[],rankUp:false};
 s.seen=s.seen||{};if(s.seen[e.id])return {state:s,gain:0,newBadges:[],rankUp:false};s.seen[e.id]=true;
 const d=day(e.at),key=e.table,sb=badges(s),savedBadges=s.badges||{},prevRank=level(s.mp);s.daily=s.daily||{};s.best=s.best||{};s.first=s.first||{};s.bonus=s.bonus||{};s.beaten=s.beaten||{};s.opponents=s.opponents||{};s.weeks=s.weeks||{};
 let eligible=true;
 if(e.match){eligible=Array.isArray(e.opponents)&&e.opponents.length>0&&e.opponents.every(p=>p&&p!==e.pid&&(s.opponents[d+'|'+p]||0)<RUTBE_AYAR.opponentDaily);if(eligible){e.opponents.forEach(p=>s.opponents[d+'|'+p]=(s.opponents[d+'|'+p]||0)+1);gain=RUTBE_AYAR.matchMP+(e.win?RUTBE_AYAR.winMP:0);}}
 else if(e.weekly){const w=String(e.week);eligible=(s.weeks[w]||0)<RUTBE_AYAR.weekly;if(eligible){s.weeks[w]=(s.weeks[w]||0)+1;gain=points(e.correct,e.total);}}
 else if(e.ilerleme){eligible=!s.first[key];if(eligible){s.first[key]=true;gain=Math.max(0,e.puan|0);}}
 else{const k=d+'|'+key;eligible=(s.daily[k]||0)<RUTBE_AYAR.daily;if(eligible){s.daily[k]=(s.daily[k]||0)+1;gain=points(e.correct,e.total);if(!s.first[key]){gain+=RUTBE_AYAR.firstBonus;s.first[key]=true;}if(s.best[key]!==undefined&&e.correct>s.best[key]&&!s.bonus[k]){gain+=RUTBE_AYAR.recordBonus;s.bonus[k]=true;}}}
 if(s.best[key]!==undefined&&e.correct>s.best[key])s.beaten[key]=true;
 s.best[key]=Math.max(s.best[key]||0,e.correct);
 if(e.scope==='butun'){s.mixed=(s.mixed||0)+1;if(e.correct/e.total>=.7)s.mixed70=true;}
 s.mp=(s.mp||0)+gain;s.rank=level(s.mp);
 const earned=badges(s);
 s.badges={...savedBadges};
 for(const k of Object.keys(earned))s.badges[k]=earned[k]||!!savedBadges[k];
 s.history=s.history||[];if(s.rank>prevRank)s.history.push({rank:s.rank,at:e.at||Date.now(),mp:s.mp});
 return {state:s,gain,newBadges:Object.keys(earned).filter(k=>earned[k]&&!sb[k]&&!savedBadges[k]),rankUp:s.rank>prevRank,limited:!eligible};
}
const api={config:RUTBE_AYAR,day,points,steps,progress,level,name,rankText,badges,complete};root.Rutbe=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
