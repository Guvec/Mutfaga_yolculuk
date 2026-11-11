/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Mutfak Araçları, Baharat ve Bulaşık · Öğrenme yolu (Parça 2a): etap > bölüm, kilit, bölüm içi akış, açıklama, 6'lı eşleştirme, Yolculuğum.
   Bölüm = 6 öğe. Etap = 4 bölüm + etap sonu eşleştirmesi. Bütün sayılar YOL_AYAR içinde tek yerden ayarlanır.
   Akış: Öğren -> addan görsele (4 seçenek) -> görselden ada (4 seçenek) -> görselden ada (5 seçenek) -> 6'lı eşleştirme.
   Geçme ölçütü son aşamadadır (görselden ada, 5 seçenek). İlk iki aşama öğretir, geçmeyi belirlemez. */
'use strict';
const YOL_AYAR={
 subject:'mutfak-araclari',
 bolumOgesi:6,        /* bir bölümdeki öğe sayısı */
 etapBolum:4,         /* bir etaptaki bölüm sayısı */
 gecme:5,             /* son aşamada 6 sorudan en az kaç doğru */
 destekDeneme:2,      /* bu kadar başarısız denemeden sonra Öğren + 4 seçenekle yeniden başlar */
 tekrarOge:6,         /* Tekrar Çalışması'nda bir seferde en çok kaç öğe */
 tekrarGun:2          /* öğe, bu kadar FARKLI günde doğru bilinince Tekrar listesinden çıkar */
};
/* Konuya özel ayarlar. Mutfak Araçları: iki takım grubu sırayla kullanılır (benzer takımlar aynı bölümde karşılaşmasın).
   Baharat: her etapta her takımdan 3 öğe; her takım bir bölümde yer almaz (bir bölümde aynı takımdan en çok 1 öğe),
   zor sayılan öğeler (taze yapraklar: takım 3 ve zorAd listesindeki taze fesleğen) bölümlere dağıtılır (bir bölümde en çok 1), aynı ürünün farklı biçimleri ayrı bölümlere konur.
   Bulaşık: kart sırası anlam taşıdığı için öğeler sırayla bölünür (tur:'sira'); Bölüm 1 bulaşık araçları, Bölüm 2 çöp kovası ve atık türleridir. */
const YOL_KONU={
 'mutfak-araclari':{kisa:'ma',nesne:'araç',nesneBelirtme:'aracı',nesneler:'araçlara',cogul:'araçlar',cogulBelirtme:'araçları',yonelme:'araca',aynilar:'aynı araçları',giris:'Araçları sırayla öğren. Bölüm bölüm ilerle, kaldığın yerden devam et.',tur:'gruplu',gruplar:[[1,4,7,10,5,12],[2,6,8,11,3,9]]},
 'baharat':{kisa:'bh',nesne:'ürün',nesneBelirtme:'ürünü',nesneler:'ürünlere',cogul:'ürünler',cogulBelirtme:'ürünleri',yonelme:'ürüne',aynilar:'aynı ürünleri',giris:'Baharat ve aromatik ürünleri sırayla öğren. Bölüm bölüm ilerle, kaldığın yerden devam et.',tur:'dagit',zorTakim:3,zorAd:['TAZE YEŞİL FESLEĞEN']},
 'bulasik-makinesi-temizligi':{kisa:'bl',nesne:'bilgi',nesneBelirtme:'bilgiyi',nesneler:'bilgilere',cogul:'bilgiler',cogulBelirtme:'bilgileri',yonelme:'bilgiye',aynilar:'aynı bilgileri',giris:'Bulaşık araçlarını ve atık türlerini sırayla öğren. Bölüm bölüm ilerle, kaldığın yerden devam et.',tur:'sira'}
};
function yolKonuVar(id){return !!YOL_KONU[id];}
function yolK(){return YOL_KONU[YOL_AYAR.subject]||YOL_KONU['mutfak-araclari'];}
const YOL_ASAMA=[{id:'s1',ad:'Görseli bul'},{id:'s2',ad:'4 seçenek'},{id:'s3',ad:'5 seçenek'}];
let Y=null; /* açık bölüm durumu */

/* ---------- Plan ---------- */
function yolHash(s){let h=2166136261>>>0;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function yolRng(s){return YarisModel.seeded(yolHash(s));}
function yolKar(a,s){return YarisModel.shuffle(a,yolRng(s));}
function yolVeri(){const d=typeof CONTENT!=='undefined'?CONTENT[YOL_AYAR.subject]:null;return d&&Array.isArray(d.matches)?d:null;}
const YOL_PLANLAR={};
function yolKok(a){return String(a||'').replace(/\(.*?\)/g,' ').replace(/\bTAZE\b/g,' ').replace(/\s+/g,' ').trim();}
/* Baharat: bir etabın 24 öğesini 4 bölüme dağıtır. Kurallar: aynı takımdan ve aynı üründen en çok 1 öğe, zor öğe en çok 1.
   Tohumlu karıştırma ve geri izleme ile kural dışına çıkmaz; belirleyicidir (her cihazda aynı plan). */
function yolDagit(oge,e){
 const B=YOL_AYAR.etapBolum,N=YOL_AYAR.bolumOgesi;
 for(let deneme=0;deneme<400;deneme++){
  const sira=yolKar(oge,'dagit'+e+'#'+deneme),bol=Array.from({length:B},()=>[]);let adim=0;
  const uygun=(b,x)=>bol[b].length<N&&!bol[b].some(y=>y.set===x.set||yolKok(y.answer)===yolKok(x.answer))&&!(x.zor&&bol[b].some(y=>y.zor));
  const yerles=i=>{
   if(i===sira.length)return true;if(++adim>4000)return false;const x=sira[i];
   const adaylar=[...Array(B).keys()].filter(b=>uygun(b,x)).sort((p,q)=>bol[p].length-bol[q].length||p-q);
   for(const b of adaylar){bol[b].push(x);if(yerles(i+1))return true;bol[b].pop();}
   return false;
  };
  if(yerles(0))return bol.map(b=>yolKar(b,'ic'+e));
 }
 return null;
}
function yolPlan(){
 const d=yolVeri();if(!d)return null;
 const sb=YOL_AYAR.subject,K=yolK();
 const rev=(d.revision||String(d.matches.length))+'|'+sb;if(YOL_PLANLAR[sb]&&YOL_PLANLAR[sb].rev===rev)return YOL_PLANLAR[sb].nodes;
 const bySet={};d.matches.forEach(m=>{(bySet[m.set]=bySet[m.set]||[]).push(m);});
 const takimlar=Object.keys(bySet).map(Number).sort((a,b)=>a-b);
 const nodes=[];
 if(K.tur==='sira'){
  /* Kart sırası korunur: ilk 6 öğe Bölüm 1, sonraki 6 öğe Bölüm 2 olur. Son bölüm eksik kalırsa (6'dan az) o öğeler önceki bölüme eklenir. */
  const sirali=d.matches.filter(m=>!m.comparison),N=YOL_AYAR.bolumOgesi,bolumler=[];
  for(let i=0;i<sirali.length;i+=N)bolumler.push(sirali.slice(i,i+N));
  if(bolumler.length>1&&bolumler.at(-1).length<N){const kalan=bolumler.pop();bolumler[bolumler.length-1]=bolumler.at(-1).concat(kalan);}
  bolumler.forEach((items,i)=>{
   const e=Math.floor(i/YOL_AYAR.etapBolum)+1,no=i%YOL_AYAR.etapBolum+1;
   nodes.push({id:'e'+e+'b'+no,etap:e,tur:'bolum',no,items});
   const sonBolum=no===YOL_AYAR.etapBolum||i===bolumler.length-1;
   if(sonBolum)nodes.push({id:'e'+e+'s',etap:e,tur:'son',no:0,items:nodes.filter(n=>n.etap===e&&n.tur==='bolum').reduce((a,n)=>a.concat(n.items),[])});
  });
 }else if(K.tur==='gruplu'){
  const per=YOL_AYAR.bolumOgesi*YOL_AYAR.etapBolum/K.gruplar.length/K.gruplar[0].length; /* her takımdan etap başına öğe */
  const etapSayisi=Math.floor(Math.min(...Object.values(bySet).map(a=>a.length))/per);
  for(let e=0;e<etapSayisi;e++){
   const etapOgeleri=[];
   for(let b=0;b<YOL_AYAR.etapBolum;b++){
    const grup=K.gruplar[b%K.gruplar.length],kat=Math.floor(b/K.gruplar.length);
    const items=grup.map(s=>(bySet[s]||[])[e*per+kat]).filter(Boolean);
    etapOgeleri.push(...items);
    nodes.push({id:'e'+(e+1)+'b'+(b+1),etap:e+1,tur:'bolum',no:b+1,items});
   }
   nodes.push({id:'e'+(e+1)+'s',etap:e+1,tur:'son',no:0,items:etapOgeleri});
  }
 }else{
  const per=YOL_AYAR.bolumOgesi*YOL_AYAR.etapBolum/takimlar.length; /* her takımdan etap başına öğe */
  const etapSayisi=Number.isInteger(per)&&per>0?Math.floor(Math.min(...takimlar.map(t=>bySet[t].length))/per):0;
  for(let e=0;e<etapSayisi;e++){
   const oge=[];takimlar.forEach(t=>oge.push(...bySet[t].slice(e*per,e*per+per).map(x=>(x.set===K.zorTakim||(K.zorAd||[]).includes(x.answer))?Object.assign({},x,{zor:true}):x)));
   const bol=yolDagit(oge,e);if(!bol)return null;
   bol.forEach((items,b)=>nodes.push({id:'e'+(e+1)+'b'+(b+1),etap:e+1,tur:'bolum',no:b+1,items}));
   nodes.push({id:'e'+(e+1)+'s',etap:e+1,tur:'son',no:0,items:oge});
  }
 }
 YOL_PLANLAR[sb]={rev,nodes};return nodes;
}
function yolAd(n){return n.tur==='son'?'Etap '+n.etap+' · Etap sonu':'Etap '+n.etap+' · Bölüm '+n.no;}

/* ---------- Kayıt (profil başına, bu cihazda) ---------- */
function yolKey(){return st.guest?'misafir':(st.prof||'misafir');}
function yolS(){const a=ls('yol_'+yolK().kisa,{})||{},s=a[yolKey()]||{};return {done:s.done||{},fails:s.fails||{},cur:s.cur||null};}
function yolYaz(s){const k='yol_'+yolK().kisa,a=ls(k,{})||{};a[yolKey()]=s;lsSet(k,a);}
function yolAcik(plan,s,i){return i===0||!!s.done[plan[i-1].id];}
function yolSiradaki(plan,s){const i=plan.findIndex(n=>!s.done[n.id]);return i<0?null:plan[i];}
function yolOgrenilen(plan,s){return plan.filter(n=>n.tur==='bolum'&&s.done[n.id]).reduce((t,n)=>t+n.items.length,0);}
function yolToplam(plan){return plan.filter(n=>n.tur==='bolum').reduce((t,n)=>t+n.items.length,0);}

/* Ana sayfa "Devam et / Çalışmaya başla" düğmesi için: bir konunun sıradaki bölümü. */
function yolDevamBilgi(id){
 if(!YOL_KONU[id])return null;
 const onceki=YOL_AYAR.subject;YOL_AYAR.subject=id;
 try{
  const plan=yolPlan();if(!plan)return null;
  const s=yolS(),n=yolSiradaki(plan,s),basladi=Object.keys(s.done).length>0||!!s.cur;
  return {id,basladi,bitti:!n,alt:n?yolAd(n):'Tüm bölümler bitti'};
 }finally{YOL_AYAR.subject=onceki;}
}

/* ---------- Tekrar Çalışması (profil başına, bu cihazda) ----------
   Yanlış yapılan öğe listeye kendiliğinden girer; öğrenci seçmez. Öğe, FARKLI günlerde YOL_AYAR.tekrarGun kez doğru bilinince listeden çıkar.
   Yeniden yanlış yapılırsa doğru günleri sıfırlanır. Seçilen yanlış ad da (sık karıştırılan çiftler için) kaydedilir. Puan kaybı yoktur. */
function yolGun(){return new Date().toLocaleDateString('sv-SE');}
function yolTk(){const a=ls('yol_tk_'+yolK().kisa,{})||{},t=a[yolKey()]||{};return {oge:t.oge||{},ogr:t.ogr|0};}
function yolTkYaz(t){const k='yol_tk_'+yolK().kisa,a=ls(k,{})||{};a[yolKey()]=t;lsSet(k,a);}
function yolTkSayi(){return Object.keys(yolTk().oge).length;}
function yolItemAd(id){const d=yolVeri(),x=d&&d.matches.find(m=>m.id===id);return x?x.answer:'';}
function yolTkYanlis(item,secAd){
 if(!Y||!item||!['oyun','tekrar'].includes(Y.mode))return false;
 const t=yolTk(),o=t.oge[item.id]||{n:0,g:[],k:{}};o.n++;o.g=[];o.son=Date.now();o.k=o.k||{};if(secAd)o.k[secAd]=(o.k[secAd]||0)+1;t.oge[item.id]=o;yolTkYaz(t);return true;
}
function yolTkDogru(item){
 if(!Y||!item||!['oyun','tekrar'].includes(Y.mode))return false;
 const t=yolTk(),o=t.oge[item.id];if(!o)return false;
 const g=yolGun();if(!o.g.includes(g))o.g.push(g);
 let cikti=false;if(o.g.length>=YOL_AYAR.tekrarGun){delete t.oge[item.id];t.ogr++;cikti=true;if(typeof rutbeComplete==='function')rutbeComplete({id:'yol-tk-'+yolK().kisa+'-'+item.id,table:'yol-tk-'+yolK().kisa+'-'+item.id,correct:1,total:1,ilerleme:true,puan:RUTBE_AYAR.yolTekrar});}
 yolTkYaz(t);return cikti;
}

/* ---------- Sorular ---------- */
function yolSoru(item,tip,node,tohum,destek){
 const ad=item.answer;
 if(tip==='s1'&&!item.comparison){
  const havuz=node.items.filter(x=>!x.comparison&&x.id!==item.id&&!(item.disla||[]).includes(x.answer)&&!(x.disla||[]).includes(item.answer));
  if(havuz.length>=3){
   const celis=(x,y)=>(x.disla||[]).includes(y.answer)||(y.disla||[]).includes(x.answer),dig=[];for(const x of yolKar(havuz,tohum+item.id+'g')){if(dig.length>=3)break;if(!dig.some(y=>celis(x,y)))dig.push(x);}if(dig.length<3)dig.splice(0,dig.length,...yolKar(havuz,tohum+item.id+'g').slice(0,3));
   const sec=yolKar([item,...dig],tohum+item.id+'G').map(x=>({id:x.id,image:x.image,alt:x.imageAlt||x.answer}));
   return {tip:'gorsel',item,ad,sec,dogru:item.id};
  }
 }
 const n=(tip==='s3'&&!destek)?5:4;
 let dis=[...new Set((item.disla||[]).filter(x=>x&&x!==ad))];
 dis=yolKar(dis,tohum+item.id+'d').slice(0,n-1);
 if(dis.length<n-1){const diger=[...new Set(node.items.map(x=>x.answer).filter(x=>x&&x!==ad&&!dis.includes(x)&&yolKok(x)!==yolKok(ad)))];dis.push(...yolKar(diger,tohum+item.id+'f').slice(0,n-1-dis.length));}
 const sec=yolKar([ad,...dis],tohum+item.id+'D').map(t=>({id:t,text:t}));
 return {tip:'ad',item,ad,sec,dogru:ad};
}
function yolSorular(node,asama,tohum,destek){
 const sira=yolKar(node.items,tohum+asama);
 return sira.map(it=>yolSoru(it,asama,node,tohum+asama,destek));
}

/* ---------- Giriş ve durum ---------- */
function yolAc(id){if(id&&YOL_KONU[id])YOL_AYAR.subject=id;go('yolum');}
function yolBaslat(id,gozat){
 const plan=yolPlan();if(!plan)return;const i=plan.findIndex(n=>n.id===id),s=yolS();if(i<0)return;
 if(!gozat&&!yolAcik(plan,s,i))return;
 const node=plan[i];sesSus();
 const fails=s.fails[id]||0,destek=fails>=YOL_AYAR.destekDeneme;
 if(gozat){Y={node,mode:'gozat',phase:'ogren',k:0,pick:null,tohum:'g',destek:false,sk:{},sure:0};go('yolplay');return;}
 const cur=s.cur&&s.cur.id===id?s.cur:null;
 if(cur&&['ogren','s1','s2','s3','esles'].includes(cur.phase)){
  Y={node,mode:'oyun',phase:cur.phase,k:cur.k||0,pick:null,tohum:cur.tohum,destek:!!cur.destek,sk:cur.sk||{},sure:cur.sure|0};
 }else{
  const tohum=id+'#'+(fails+1)+'#'+Date.now().toString(36);
  Y={node,mode:'oyun',phase:node.tur==='son'?'esles':'ogren',k:0,pick:null,tohum,destek,sk:{},sure:0};
 }
 yolFazHazirla();yolKaydet();go('yolplay');
}
window.yolTekrarBaslat=function(){
 const d=yolVeri();if(!d)return;const t=yolTk();
 const liste=Object.entries(t.oge).map(([id,o])=>({o,it:d.matches.find(m=>m.id===id)})).filter(x=>x.it)
  .sort((a,b)=>(b.o.n-a.o.n)||((b.o.son||0)-(a.o.son||0))).slice(0,YOL_AYAR.tekrarOge);
 if(!liste.length)return;
 const secili=liste.map(x=>x.it),tohum='t#'+Date.now().toString(36),kokler=new Set(secili.map(x=>yolKok(x.answer)));
 const ek=yolKar(d.matches.filter(m=>!m.comparison&&!secili.includes(m)&&!kokler.has(yolKok(m.answer))),tohum+'x').slice(0,8);
 const node={id:'tekrar',tur:'tekrar',etap:0,no:0,items:secili.concat(ek)};
 Y={node,mode:'tekrar',phase:'s2',k:0,pick:null,tohum,destek:false,sk:{},sure:0};
 Y.qs=yolKar(secili,tohum+'s').map(it=>yolSoru(it,'s2',node,tohum,false));
 sesSus();go('yolplay');
};
window.yolSerbestAc=function(id){
 const plan=yolPlan(),node=plan&&plan.find(n=>n.id===id);if(!node||!yolS().done[id])return;sesSus();
 Y={node,mode:'serbest',phase:'ssec',k:0,pick:null,tohum:'sb#'+Date.now().toString(36),destek:false,sk:{},sure:0};go('yolplay');
};
window.yolSerbestBaslat=function(tur){
 if(!Y||Y.mode!=='serbest')return;Y.sure=0;Y.pick=null;Y.k=0;
 if(tur==='esles'){Y.phase='esles';yolEslesHazirla();}else{Y.phase='s3';Y.qs=yolSorular(Y.node,'s3',Y.tohum,false);}
 render();
};
function yolKaydet(){if(!Y||Y.mode!=='oyun')return;const s=yolS();s.cur={id:Y.node.id,phase:Y.phase,k:['s1','s2','s3'].includes(Y.phase)?0:Y.k,tohum:Y.tohum,destek:Y.destek,sk:Y.sk,sure:Y.sure|0};yolYaz(s);}
function yolFazHazirla(){
 Y.pick=null;Y.sub='soru';Y.donOnay=false;
 if(['s1','s2','s3'].includes(Y.phase)){Y.qs=yolSorular(Y.node,Y.phase,Y.tohum,Y.destek);}
 if(Y.phase==='esles'){yolEslesHazirla();}
}
function yolEslesHazirla(){
 /* Aynı ad ve aynı ürünün farklı biçimi bir arada çıkmaz; zor sayılan öğeden (taze yaprak) en çok 1 gelir. */
 const g=new Set(),havuz=[];let zor=0;
 for(const it of yolKar(Y.node.items,Y.tohum+'m')){const k=yolKok(it.answer);if(g.has(k))continue;if(it.zor&&zor>=1)continue;g.add(k);if(it.zor)zor++;havuz.push(it);}
 const sec=havuz.slice(0,YOL_AYAR.bolumOgesi);
 Y.m={ogeler:sec,gorseller:yolKar(sec,Y.tohum+'mg'),adlar:yolKar(sec,Y.tohum+'ma'),sel:null,eslesen:[],hata:0,mesaj:'',mesajTur:''};
}

/* ---------- Ses ---------- */
function yolSoyle(t){if(!t)return;if(SES.acik){sesSoyle(t);return;}SES.acik=true;try{sesSoyle(t);}finally{SES.acik=false;}if(SES.pending)SES.pending.zorla=true;}
window.yolSoyleIdx=function(i){yolSoyle(Y&&Y.oku&&Y.oku[i]);};
function yolSesBtn(t,etiket){Y.oku=Y.oku||[];const i=Y.oku.push(t)-1;return '<button type="button" class="spk yol-ses" aria-label="'+esc(etiket||'Sesli dinle')+'" onclick="yolSoyleIdx('+i+')">🔊 <span>'+esc(etiket||'Dinle')+'</span></button>';}

/* ---------- Akış ---------- */
window.yolSonraki=function(){
 if(!Y)return;
 if(Y.phase==='ogren'){
  if(Y.k<Y.node.items.length-1){Y.k++;render();return;}
  if(Y.mode==='gozat'){go('yolum');return;}
  Y.phase='s1';Y.k=0;yolFazHazirla();yolKaydet();render();return;
 }
 if(['s1','s2','s3'].includes(Y.phase)){
  if(Y.sub==='inceleme'){yolIncSonraki();return;}
  if(Y.sub==='onay')return;
  const q=Y.qs[Y.k];if(!q||q.sel==null)return;
  if(Y.donOnay||Y.k>=Y.qs.length-1){Y.sub='onay';Y.donOnay=false;render();return;}
  Y.k++;Y.pick=yolIdx(Y.qs[Y.k]);render();return;
 }
};
function yolIdx(q){return q.sel==null?null:q.sec.findIndex(c=>c.id===q.sel);}
window.yolOnceki=function(){
 if(!Y||!['s1','s2','s3'].includes(Y.phase)||Y.sub==='inceleme')return;
 if(Y.sub==='onay'){Y.sub='soru';Y.k=Y.qs.length-1;Y.pick=yolIdx(Y.qs[Y.k]);render();return;}
 if(Y.k>0){Y.k--;Y.pick=yolIdx(Y.qs[Y.k]);render();}
};
window.yolGit=function(k){if(!Y||Y.sub!=='onay'||!Y.qs[k])return;Y.sub='soru';Y.donOnay=true;Y.k=k;Y.pick=yolIdx(Y.qs[k]);render();};
/* Cevaplar onaylanınca doğruluk belirlenir; yanlışlar doğru cevabıyla tek tek gösterilir. */
window.yolOnayla=function(){
 if(!Y||Y.sub!=='onay')return;
 Y.qs.forEach(q=>{q.cevap=q.sel;const c=q.sec.find(x=>x.id===q.sel);
  if(q.cevap===q.dogru)q.tkCikti=yolTkDogru(q.item);
  else q.tkEklendi=yolTkYanlis(q.item,q.tip==='gorsel'?yolItemAd(q.cevap):(c&&c.text));});
 const dogru=Y.qs.filter(q=>q.cevap===q.dogru).length;Y.sk[Y.phase]=dogru;Y.fark=dogru;
 Y.yanlis=Y.qs.map((q,i)=>i).filter(i=>Y.qs[i].cevap!==Y.qs[i].dogru);
 if(!Y.yanlis.length){yolFazBitir();return;}
 Y.sub='inceleme';Y.ik=0;render();
};
window.yolIncSonraki=function(){if(!Y||Y.sub!=='inceleme')return;if(Y.ik<Y.yanlis.length-1){Y.ik++;render();return;}yolFazBitir();};
function yolFazBitir(){
 const dogru=Y.fark;Y.sub='soru';Y.donOnay=false;
 if(Y.mode==='tekrar'){Y.phase='tbitti';render();return;}
 if(Y.mode==='serbest'){Y.phase='sbitti';render();return;}
 if(Y.phase==='s1'){Y.phase='s2';Y.k=0;yolFazHazirla();yolKaydet();render();return;}
 if(Y.phase==='s2'){Y.phase='s3';Y.k=0;yolFazHazirla();yolKaydet();render();return;}
 /* son aşama: geçme kararı */
 if(dogru>=YOL_AYAR.gecme){Y.phase='esles';Y.k=0;yolFazHazirla();yolKaydet();render();return;}
 const s=yolS();s.fails[Y.node.id]=(s.fails[Y.node.id]||0)+1;s.cur=null;yolYaz(s);
 Y.phase='basarisiz';Y.fark=dogru;render();
}
window.yolCevap=function(i){
 if(!Y||!['s1','s2','s3'].includes(Y.phase)||(Y.sub&&Y.sub!=='soru'))return;
 const q=Y.qs[Y.k];if(!q||!q.sec[i])return;q.sel=q.sec[i].id;Y.pick=i;render();
};
window.yolYenidenDene=function(){
 if(!Y)return;const s=yolS(),fails=s.fails[Y.node.id]||0,destek=fails>=YOL_AYAR.destekDeneme;
 Y.destek=destek;Y.tohum=Y.node.id+'#'+(fails+1)+'#'+Date.now().toString(36);Y.sk={};Y.k=0;
 Y.phase=destek?'ogren':'s1';yolFazHazirla();yolKaydet();render();
};
window.yolEsGorsel=function(id){if(!Y||Y.phase!=='esles'||Y.m.eslesen.includes(id))return;Y.m.sel=Y.m.sel===id?null:id;Y.m.mesaj='';render();};
window.yolEsAd=function(id){
 if(!Y||Y.phase!=='esles'||Y.m.eslesen.includes(id))return;const m=Y.m;
 if(!m.sel){m.mesaj='Önce bir görsel seç.';m.mesajTur='';render();return;}
 if(m.sel===id){m.eslesen.push(id);m.mesaj='Doğru eşleşme.';m.mesajTur='ok';m.sel=null;
  if(m.eslesen.length===m.ogeler.length){if(Y.mode==='serbest'){Y.phase='sbitti';Y.fark=undefined;render();return;}yolTamamla();return;}
 }else{yolTkYanlis(m.ogeler.find(x=>x.id===m.sel),yolItemAd(id));m.hata++;m.mesaj='Eşleşmedi. Başka bir ad dene.';m.mesajTur='bad';m.sel=null;}
 render();
};
function yolTamamla(){
 const s=yolS(),once=!!s.done[Y.node.id];s.done[Y.node.id]=1;s.cur=null;yolYaz(s);Y.phase='bitti';
 Y.yeniLezzet=(!once&&Y.node.tur==='bolum'&&typeof lezzetYeni==='function')?lezzetYeni():null;
 /* Mutfak Puanı ilerlemeden gelir: bitirilen bölüm ve etap sonu (her biri yalnız ilk kez). Yeniden çözmek puan vermez. */
 if(typeof rutbeComplete==='function'){
  const k=yolK().kisa,plan=yolPlan(),tum=plan&&plan.every(n=>s.done[n.id]);
  rutbeComplete({id:'yol-'+k+'-'+Y.node.id,table:'yol-'+k+'-'+Y.node.id,correct:1,total:1,ilerleme:true,puan:Y.node.tur==='son'?RUTBE_AYAR.yolEtap:RUTBE_AYAR.yolBolum});
  if(tum)rutbeComplete({id:'yol-'+k+'-tamam',table:'yol-'+k+'-tamam',correct:1,total:1,ilerleme:true,puan:RUTBE_AYAR.yolTamam});
 }
 render();
}
window.yolAnaSayfa=function(){if(Y&&Y.mode==='oyun')yolKaydet();sesSus();go('home');};
window.yolKapat=function(){yolKaydet();go('yolum');};
/* Süre kum saatiyle gösterilir: ileri akar, hiç bitmez. Hareket kapalıyken kum akmaz (saat dönmez). */
setInterval(function(){
 if(!Y||st.screen!=='yolplay'||st.modalOpen||document.hidden||Y.mode==='gozat')return;
 if(!['ogren','s1','s2','s3','esles'].includes(Y.phase))return;
 Y.sure=(Y.sure|0)+1;
 const e=document.getElementById('yolSureT');if(e)e.textContent=yolSureYaz(Y.sure);
 if(Y.mode==='oyun'&&Y.sure%15===0)yolKaydet();
},1000);

/* ---------- Ekranlar ---------- */
const YOL_EK={1:"i",2:"yi",3:"ü",4:"ü"};
const YOL_DEN={1:"1'den",2:"2'den",3:"3'ten",4:"4'ten",5:"5'ten",6:"6'dan"};
function yolKonuAdi(){return (typeof KONU_GORSEL!=='undefined'&&KONU_GORSEL[YOL_AYAR.subject])?KONU_GORSEL[YOL_AYAR.subject].ad:YOL_AYAR.subject;}
function yolSureYaz(n){n=n|0;return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
const YOL_KUM='<svg class="kum-svg" viewBox="0 0 32 48" width="26" height="39" focusable="false" aria-hidden="true"><defs><clipPath id="kumU"><path d="M6 5H26V10C26 17 19 21 17.2 24C19 27 26 31 26 38V43H6V38C6 31 13 27 14.8 24C13 21 6 17 6 10Z"/></clipPath></defs><g class="kum-g"><path d="M6 5H26V10C26 17 19 21 17.2 24C19 27 26 31 26 38V43H6V38C6 31 13 27 14.8 24C13 21 6 17 6 10Z" fill="rgba(255,255,255,.55)"/><g clip-path="url(#kumU)"><path class="kum-ust" d="M5 5H27V24H5Z" fill="#E0A93B"/><path class="kum-alt" d="M5 43V39C10 36 13 31 16 30C19 31 22 36 27 39V43Z" fill="#E0A93B"/><line class="kum-akis" x1="16" y1="23" x2="16" y2="40" stroke="#E0A93B" stroke-width="1.3" stroke-dasharray="2 2"/></g><path d="M6 5H26V10C26 17 19 21 17.2 24C19 27 26 31 26 38V43H6V38C6 31 13 27 14.8 24C13 21 6 17 6 10Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><rect x="3" y="2" width="26" height="3.4" rx="1.7" fill="currentColor"/><rect x="3" y="42.6" width="26" height="3.4" rx="1.7" fill="currentColor"/></g></svg>';
function yolBar(baslik,alt,geri,sure){
 return '<header class="yol-bar"><button type="button" class="yol-geri-btn" onclick="'+geri+'" aria-label="Geri">‹</button><button type="button" class="yol-geri-btn yol-ev-btn" onclick="yolAnaSayfa()" aria-label="Ana sayfa"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h5v-6h3v6h5V10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="yol-bar-ttl"><b>'+esc(baslik)+'</b>'+(alt?'<span>'+esc(alt)+'</span>':'')+'</div>'+(sure?'<div class="yol-sure" role="timer" aria-label="Geçen süre"><span class="yol-kum" aria-hidden="true">'+YOL_KUM+'</span><b id="yolSureT">'+yolSureYaz(Y.sure)+'</b></div>':'<span class="yol-sure-bos"></span>')+'</header>';
}
function yolAyak(oyun){
 return '<footer class="yol-ayak"><p>'+(oyun?'İstediğin zaman çıkabilirsin. Geri geldiğinde kaldığın yerden devam edersin.':'İstediğin zaman çıkabilirsin.')+'</p><div class="yol-ayar"><button type="button" onclick="sesAcKapa()">Sesli okuma: '+(SES.acik?'Açık':'Kapalı')+'</button><button type="button" onclick="sakinDegistir();render()">Hareket: '+(sakinAcik()?'Kapalı':'Açık')+'</button></div></footer>';
}
function yolSeg(k,n,dolu){let h='<span class="yol-seg" role="img" aria-label="'+k+' / '+n+'">';for(let i=0;i<n;i++)h+='<i class="'+(i<k||(dolu&&i===k)?'dolu':i===k?'simdi':'')+'"></i>';return h+'</span>';}
/* Etaptaki bölüm sayısı plandan okunur: son etap eksik bölümle bitebilir (ör. Bulaşık'ta 2 bölüm). */
function yolEtapBolum(n){const plan=YOL_PLANLAR[YOL_AYAR.subject]&&YOL_PLANLAR[YOL_AYAR.subject].nodes;const k=plan?plan.filter(x=>x.etap===n.etap&&x.tur==='bolum').length:0;return k||YOL_AYAR.etapBolum;}
function yolEtiket(n){return n.tur==='son'?'Etap '+n.etap+' · Etap sonu':'Etap '+n.etap+' · Bölüm '+n.no+' / '+yolEtapBolum(n);}
const YOL_ASAMA_AD=['Öğren','Görsel seç','4 seçenek','5 seçenek','Eşleştir'];
function yolAsamaSeridi(){
 const sira=['ogren','s1','s2','s3','esles'],i=sira.indexOf(Y.phase);
 return '<div class="yol-asama" aria-label="Aşamalar">'+YOL_ASAMA_AD.map((a,j)=>'<span class="'+(j<i?'bitti':j===i?'simdi':'')+'"'+(j===i?' aria-current="step"':'')+'>'+(j<i?'✓ ':'')+esc(a)+'</span>').join('')+'</div>';
}
function yolUst(){
 if(Y.mode==='tekrar')return '<p class="yol-etiket">Tekrar Çalışması</p>';
 if(Y.mode==='serbest')return '<p class="yol-etiket">Serbest Çalışma · '+esc(yolEtiket(Y.node))+'</p>';
 return '<p class="yol-etiket">'+esc(yolEtiket(Y.node))+'</p>'+(Y.node.tur==='bolum'?yolAsamaSeridi():'');
}
function yolYukleniyor(baslik){
 return yolBar(baslik,'','go(\'subject\')',false)+'<div class="yol-sayfa">'+(CONTENT[YOL_AYAR.subject]===null?'<p role="alert">İçerik yüklenemedi. Bağlantını kontrol edip yeniden dene.</p><button class="yol-btn" onclick="loadContent()">Yeniden dene</button>':'<p>İçerik yükleniyor…</p>')+'</div>';
}
window.yolSoyleOge=function(id){const d=yolVeri(),x=d&&d.matches.find(m=>m.id===id);if(x)yolSoyle(x.answer);};
function yolDugum(n,plan,s,sira,acikTut){
 const i=plan.indexOf(n),acik=yolAcik(plan,s,i),bitmis=!!s.done[n.id],simdi=sira&&sira.id===n.id,son=n.tur==='son',ad=son?'Etap sonu':'Bölüm '+n.no,N=n.items.length;
 if(bitmis&&!son){
  return '<details class="yol-dugum bitti"'+(acikTut?' open':'')+'><summary><span class="yol-ik ok" aria-hidden="true">✓</span><span class="yol-dugum-ad"><b>'+ad+'</b><small>Tamamlandı · '+N+' '+yolK().nesne+'</small></span></summary><p class="yol-ogr-baslik">Öğrendiklerim</p><div class="yol-ogr">'+n.items.map(it=>'<button type="button" class="yol-ogr-k" onclick="yolSoyleOge(\''+it.id+'\')" aria-label="'+esc(it.answer)+', dinle"><img src="'+esc(it.image)+'" alt=""><span>'+esc(it.answer)+'</span></button>').join('')+'</div><p class="yol-not">Bir '+yolK().yonelme+' dokununca adı sesli okunur.</p></details>';
 }
 if(bitmis&&son)return '<div class="yol-dugum bitti"><span class="yol-ik ok" aria-hidden="true">✓</span><span class="yol-dugum-ad"><b>Etap sonu</b><small>Tamamlandı · karışık eşleştirme</small></span><button type="button" class="yol-kucuk" onclick="yolBaslat(\''+n.id+'\')">Tekrar</button></div>';
 if(!acik){
  const onceki=plan[i-1],ipucu=onceki&&sira&&sira.id===onceki.id?(son?'Önceki bölümleri bitirince açılır':'Bölüm '+(n.no-1)+(YOL_EK[n.no-1]?"'"+YOL_EK[n.no-1]:"'i")+' bitirince açılır'):'';
  return '<div class="yol-dugum kilit" aria-label="'+ad+', kilitli"><span class="yol-ik" aria-hidden="true">🔒</span><span class="yol-dugum-ad"><b>'+ad+'</b><small>Kilitli'+(ipucu?' · '+ipucu:'')+(son&&!ipucu?' · karışık eşleştirme':'')+'</small></span></div>';
 }
 const cur=s.cur&&s.cur.id===n.id?s.cur:null,alt=cur&&['s1','s2','s3'].includes(cur.phase)?'Şimdi · '+(cur.k+1)+' / '+N+' soru':cur?'Şimdi · devam ediyor':'Şimdi';
 return '<button type="button" class="yol-dugum simdi" onclick="yolBaslat(\''+n.id+'\')" aria-label="'+ad+', '+alt+'"><span class="yol-ik play" aria-hidden="true">▶</span><span class="yol-dugum-ad"><b>'+ad+'</b><small>'+alt+'</small></span></button>';
}
function yolumHTML(){
 const plan=yolPlan();if(!plan)return yolYukleniyor('Yolculuğum');
 const s=yolS(),sira=yolSiradaki(plan,s),ogr=yolOgrenilen(plan,s),top=yolToplam(plan),tk=yolTkSayi(),nes=yolK().nesne,N=YOL_AYAR.bolumOgesi;
 let h=yolBar('Yolculuğum',yolKonuAdi(),'back()',false)+'<div class="yol-sayfa">';
 h+='<section class="yol-kart yol-devam" aria-label="Kaldığın yer">';
 if(sira){
  const cur=s.cur&&s.cur.id===sira.id?s.cur:null;
  let not='Bu bölümde '+sira.items.length+' '+nes+' var.';
  if(cur&&['s1','s2','s3'].includes(cur.phase))not+=' Soru '+(YOL_DEN[cur.k+1]||(cur.k+1)+"'den")+' devam edersin.';
  else if(cur&&cur.phase==='ogren')not+=' Öğren aşamasından devam edersin.';
  else if(cur&&cur.phase==='esles')not+=' Eşleştirmeden devam edersin.';
  h+='<small class="yol-ust-ad">Kaldığın yer</small><strong>'+esc(yolAd(sira))+'</strong><p>'+not+'</p><button type="button" class="yol-btn" onclick="yolBaslat(\''+sira.id+'\')">'+(cur?'Devam et':'Başla')+' ›</button>';
 }else h+='<small class="yol-ust-ad">Tebrikler</small><strong>Bütün bölümleri tamamladın</strong>';
 h+='<p class="yol-say-yaz"><b>'+ogr+' / '+top+' '+yolK().nesneBelirtme+' öğrendin</b></p><div class="yol-ilerleme" role="progressbar" aria-valuemin="0" aria-valuemax="'+top+'" aria-valuenow="'+ogr+'" aria-label="Öğrenilen '+nes+' sayısı"><i style="width:'+(top?Math.round(100*ogr/top):0)+'%"></i></div></section>';
 h+='<section class="yol-kart" aria-label="Tekrar Çalışması"><h2>Tekrar Çalışması</h2>'+(tk?'<p>'+tk+' '+nes+' seni bekliyor. Yanlış yaptığın '+yolK().cogulBelirtme+' sistem senin için seçti.</p><button type="button" class="yol-btn ikinci" onclick="yolTekrarBaslat()">↻ Tekrarla</button>':'<p>Şimdilik tekrar edilecek '+nes+' yok. Yanlış yaptığın '+yolK().cogul+' burada birikir.</p>')+'</section>';
 const etaplar=[...new Set(plan.map(n=>n.etap))],simdiEtap=sira?sira.etap:null,sonBiten=plan.filter(n=>n.tur==='bolum'&&s.done[n.id]).pop(),gelecek=[];
 for(const e of etaplar){
  const nodes=plan.filter(n=>n.etap===e),tamam=nodes.filter(n=>s.done[n.id]).length,bitti=tamam===nodes.length,bol=nodes.filter(n=>n.tur==='bolum'),ogeSay=bol.reduce((t,n)=>t+n.items.length,0);
  if(sira&&e>simdiEtap){gelecek.push(e);continue;}
  const bas='<h2>Etap '+e+(bitti?' <span class="yol-ok" aria-label="tamamlandı">✓</span>':'')+'</h2><p class="yol-alt-yazi">'+bol.filter(n=>s.done[n.id]).length+' / '+bol.length+' bölüm tamam · '+ogeSay+' '+nes+'</p>';
  if(bitti)h+='<details class="yol-kart yol-etap"><summary>'+bas+'</summary><div class="yol-liste">'+nodes.map(n=>yolDugum(n,plan,s,sira,false)).join('')+'</div></details>';
  else h+='<section class="yol-kart yol-etap" aria-label="Etap '+e+'">'+bas+'<div class="yol-liste">'+nodes.map(n=>yolDugum(n,plan,s,sira,sonBiten&&n.id===sonBiten.id)).join('')+'</div></section>';
 }
 if(gelecek.length)h+='<div class="yol-kart yol-kilit-kart"><span class="yol-ik" aria-hidden="true">🔒</span><span class="yol-dugum-ad"><b>Etap '+gelecek[0]+(gelecek.length>1?' – Etap '+gelecek[gelecek.length-1]:'')+'</b><small>Kilitli · önceki etap bitince açılır</small></span></div>';
 h+='<div class="yol-kart yol-kilit-kart"><span class="yol-ik" aria-hidden="true">🔒</span><span class="yol-dugum-ad"><b>Büyük Tur · 75 soru</b><small>'+(sira?'Kilitli · tüm etaplar bitince açılır':'Çok yakında')+'</small></span></div>';
 const bitenler=plan.filter(n=>n.tur==='bolum'&&s.done[n.id]);
 h+='<section class="yol-kart" aria-label="Serbest Çalışma"><h2>Serbest Çalışma</h2><p>Bitirdiğin bölümleri istediğin biçimde çalış. Kilidi ve puanı etkilemez.</p>'+(bitenler.length?'<div class="yol-serbest">'+bitenler.map(n=>'<button type="button" class="yol-btn ikinci" onclick="yolSerbestAc(\''+n.id+'\')">Etap '+n.etap+' · Bölüm '+n.no+'</button>').join('')+'</div>':'<p class="yol-not">İlk bölümü bitirince burası açılır.</p>')+'</section></div>';
 return h;
}
function yolOgrenHTML(){
 const it=Y.node.items[Y.k],son=Y.k===Y.node.items.length-1;
 return yolBar(yolKonuAdi(),'','yolKapat()',Y.mode==='oyun')+'<div class="yol-sayfa">'+(Y.mode==='oyun'?yolUst():'<p class="yol-etiket">Öğrendiklerim</p>')+
  '<div class="yol-say"><span>'+(Y.k+1)+' / '+Y.node.items.length+'</span>'+yolSeg(Y.k,Y.node.items.length,true)+'</div>'+
  '<div class="yol-kart yol-ogren"><img class="yol-img" src="'+esc(it.image)+'" alt="'+esc(it.imageAlt||it.answer)+'"><h2 class="yol-ad">'+esc(it.answer)+'</h2><p class="yol-acik">'+esc(it.explanation||'')+'</p>'+yolSesBtn(it.answer+'. '+(it.explanation||''),'Adını ve açıklamasını dinle')+'</div>'+
  '<div class="yol-alt">'+(Y.k>0?'<button type="button" class="yol-btn ikinci" onclick="Y.k--;render()">‹ Önceki</button>':'<span></span>')+'<button type="button" class="yol-btn" onclick="yolSonraki()">'+(son?(Y.mode==='oyun'?'Sorulara geç ›':'Kapat'):'Sonraki ›')+'</button></div>'+yolAyak(Y.mode==='oyun')+'</div>';
}
function yolSesIk(t,etiket){Y.oku=Y.oku||[];const i=Y.oku.push(t)-1;return '<button type="button" class="spk yol-ses ik" aria-label="'+esc(etiket||'Sesli dinle')+'" onclick="yolSoyleIdx('+i+')">🔊</button>';}
function yolSoruMetni(q){return q.tip==='gorsel'?'“'+q.ad+'” hangisidir?':(q.item.kok||q.item.prompt||'Görselin adı nedir?');}
function yolSoruHTML(){
 if(Y.sub==='onay')return yolOnayHTML();
 if(Y.sub==='inceleme')return yolIncelemeHTML();
 const q=Y.qs[Y.k],sel=q.sel,L='ABCDE',soruYazi=yolSoruMetni(q),son=Y.k===Y.qs.length-1;
 let h=yolBar(yolKonuAdi(),'','yolKapat()',true)+'<div class="yol-sayfa yol-soru-sayfa">'+yolUst()+'<div class="yol-say"><span>Soru '+(Y.k+1)+' / '+Y.qs.length+'</span>'+yolSeg(Y.k,Y.qs.length,sel!=null)+'</div>';
 if(q.tip==='gorsel'){
  h+='<div class="yol-kart yol-soru-kart"><div class="yol-soru-satir"><h2 class="yol-soru">'+esc(soruYazi)+'</h2>'+yolSesIk(soruYazi,'Soruyu sesli oku')+'</div></div><div class="yol-gorsel-sec">';
  q.sec.forEach((c,i)=>{const on=c.id===sel;
   h+='<button type="button" class="yol-gsec'+(on?' sec':'')+'" aria-pressed="'+on+'" onclick="yolCevap('+i+')" aria-label="'+L[i]+'. '+esc(c.alt)+'"><img src="'+esc(c.image)+'" alt=""><span class="yol-let">'+L[i]+'</span>'+(on?'<em>Seçtin</em>':'')+'</button>';});
  h+='</div>';
 }else{
  h+='<div class="yol-kart yol-soru-kart"><img class="yol-img" src="'+esc(q.item.image)+'" alt="'+esc(q.item.imageAlt||'Soru görseli')+'"><div class="yol-soru-satir"><h2 class="yol-soru">'+esc(soruYazi)+'</h2>'+yolSesIk(soruYazi,'Soruyu sesli oku')+'</div></div><div class="yol-secenek">';
  q.sec.forEach((c,i)=>{const on=c.id===sel;
   h+='<button type="button" class="yol-sec'+(on?' sec':'')+'" aria-pressed="'+on+'" onclick="yolCevap('+i+')"><span class="yol-let">'+(on?'✓':L[i])+'</span><span class="yol-sec-ad"><b>'+esc(c.text)+'</b></span></button>';});
  h+='</div>';
 }
 h+='<div class="yol-nav">'+(Y.k>0?'<button type="button" class="yol-btn ikinci" onclick="yolOnceki()">‹ Önceki</button>':'<span></span>')+'<button type="button" class="yol-btn" onclick="yolSonraki()"'+(sel==null?' disabled':'')+'>'+(son||Y.donOnay?'Gözden geçir':'Sonraki')+' ›</button></div>';
 return h+'</div>';
}
function yolOnayHTML(){
 const L='ABCDE';
 let h=yolBar(yolKonuAdi(),'','yolKapat()',true)+'<div class="yol-sayfa">'+yolUst()+'<h1>Cevaplarından emin misin?</h1><p class="yol-not">Değiştirmek istediğin soruya dokun. “Evet” dediğinde doğru cevaplar gösterilir.</p><div class="yol-onay">';
 Y.qs.forEach((q,i)=>{const c=q.sec.find(x=>x.id===q.sel),gor=q.tip==='gorsel';
  h+='<button type="button" class="yol-onay-sat" onclick="yolGit('+i+')" aria-label="'+(i+1)+'. soru, cevabını değiştir"><span class="yol-onay-no">'+(i+1)+'</span><img src="'+esc(gor?(c&&c.image):q.item.image)+'" alt=""><span class="yol-onay-ad"><small>'+esc(gor?'“'+q.ad+'” için seçtiğin görsel':yolSoruMetni(q))+'</small><b>'+esc(gor?'Görsel '+L[q.sec.indexOf(c)]:(c?c.text:'—'))+'</b></span><span class="yol-onay-de" aria-hidden="true">Değiştir</span></button>';});
 h+='</div><div class="yol-nav"><button type="button" class="yol-btn ikinci" onclick="yolOnceki()">‹ Sorulara dön</button><button type="button" class="yol-btn" onclick="yolOnayla()">Evet, bitirdim ›</button></div></div>';
 return h;
}
function yolIncelemeHTML(){
 const q=Y.qs[Y.yanlis[Y.ik]],sec=q.sec.find(c=>c.id===q.cevap),dog=q.sec.find(c=>c.id===q.dogru),gor=q.tip==='gorsel',soruYazi=yolSoruMetni(q),nes=yolK().nesne,son=Y.ik===Y.yanlis.length-1;
 let h=yolBar(yolKonuAdi(),'','yolKapat()',true)+'<div class="yol-sayfa yol-inc">'+yolUst()+'<p class="yol-etiket">Yanlışlarını inceleyelim · '+(Y.ik+1)+' / '+Y.yanlis.length+'</p>';
 if(gor){
  h+='<div class="yol-kart yol-soru-kart"><div class="yol-soru-satir"><h2 class="yol-soru">'+esc(soruYazi)+'</h2></div></div><div class="yol-inc-cift"><figure class="yol-inc-k bad"><img src="'+esc(sec.image)+'" alt=""><figcaption><b>✕ Senin seçtiğin</b><span>'+esc(yolItemAd(q.cevap)||sec.alt)+'</span></figcaption></figure><figure class="yol-inc-k ok"><img src="'+esc(dog.image)+'" alt=""><figcaption><b>✓ Doğru cevap</b><span>'+esc(q.ad)+'</span></figcaption></figure></div>';
 }else{
  h+='<div class="yol-kart yol-soru-kart"><img class="yol-img" src="'+esc(q.item.image)+'" alt="'+esc(q.item.imageAlt||'Soru görseli')+'"><div class="yol-soru-satir"><h2 class="yol-soru">'+esc(soruYazi)+'</h2></div></div><div class="yol-secenek"><div class="yol-sec bad"><span class="yol-ik bad" aria-hidden="true">✕</span><span class="yol-sec-ad"><b>'+esc(sec.text)+'</b><em>Senin cevabın</em></span></div><div class="yol-sec ok"><span class="yol-ik ok" aria-hidden="true">✓</span><span class="yol-sec-ad"><b>'+esc(dog.text)+'</b><em>Doğru cevap</em></span></div></div>';
 }
 h+='<section class="yol-kart yol-acik-kart" role="status"><p>'+esc(q.item.explanation||'')+'</p>'+yolSesIk('Doğru cevap: '+q.ad+'. '+(q.item.explanation||''),'Açıklamayı dinle')+'</section>';
 if(q.tkEklendi)h+='<p class="yol-not">Bu '+nes+' Tekrar Çalışması’na kendiliğinden eklendi. Puan kaybı olmaz.</p>';
 h+='<div class="yol-nav"><span></span><button type="button" class="yol-btn" onclick="yolIncSonraki()">'+(son?(Y.mode==='oyun'&&Y.phase==='s3'?'Devam':'Devam'):'Sonraki yanlış')+' ›</button></div></div>';
 return h;
}
function yolEslesHTML(){
 const m=Y.m,eslesti=id=>m.eslesen.includes(id);
 let h=yolBar(yolKonuAdi(),'','yolKapat()',true)+'<div class="yol-sayfa">'+yolUst()+
  '<h2 class="yol-soru">Her görseli adıyla eşleştir</h2><p class="yol-yon">Önce bir görsele, sonra adına dokun. '+m.eslesen.length+' / '+m.ogeler.length+' eşleşti.</p><div class="yol-es">';
 h+='<div class="yol-es-sut" aria-label="Görseller">'+m.gorseller.map(it=>'<button type="button" class="yol-es-g'+(eslesti(it.id)?' ok':'')+(m.sel===it.id?' sec':'')+'" onclick="yolEsGorsel(\''+it.id+'\')"'+(eslesti(it.id)?' disabled':'')+' aria-pressed="'+(m.sel===it.id)+'" aria-label="Görsel: '+esc(it.imageAlt||yolK().nesne)+(eslesti(it.id)?', eşleşti':'')+'"><img src="'+esc(it.image)+'" alt="">'+(eslesti(it.id)?'<em>✓</em>':'')+'</button>').join('')+'</div>';
 h+='<div class="yol-es-sut" aria-label="Adlar">'+m.adlar.map(it=>'<button type="button" class="yol-es-a'+(eslesti(it.id)?' ok':'')+'" onclick="yolEsAd(\''+it.id+'\')"'+(eslesti(it.id)?' disabled':'')+'>'+(eslesti(it.id)?'✓ ':'')+esc(it.answer)+'</button>').join('')+'</div></div>';
 h+='<p class="yol-mesaj '+m.mesajTur+'" role="status">'+(m.mesaj?(m.mesajTur==='ok'?'✓ ':m.mesajTur==='bad'?'✕ ':'')+esc(m.mesaj):'')+'</p>'+yolAyak(Y.mode==='oyun')+'</div>';
 return h;
}
function yolBasarisizHTML(){
 const s=yolS(),fails=s.fails[Y.node.id]||0,destek=fails>=YOL_AYAR.destekDeneme;
 return yolBar(yolKonuAdi(),'','yolKapat()',false)+'<div class="yol-sayfa"><h1>Bu sefer olmadı</h1><p class="yol-kart yol-sonuc" role="status"><b>'+Y.fark+' / '+Y.qs.length+' doğru</b><br>Bölümü geçmek için en az '+YOL_AYAR.gecme+' doğru gerekir. Bir sonraki denemede '+(destek?'önce '+yolK().nesneler+' yeniden bakacaksın ve soruların 4 seçeneği olacak.':yolK().aynilar+' yeniden çalışacaksın.')+'</p><div class="yol-alt"><button type="button" class="yol-btn ikinci" onclick="go(\'yolum\')">Yolculuğum</button><button type="button" class="yol-btn" onclick="yolYenidenDene()">Yeniden dene</button></div></div>';
}
function yolBittiHTML(){
 const plan=yolPlan(),s=yolS(),sira=yolSiradaki(plan,s),son=Y.node.tur==='son',nes=yolK().nesne;
 let h=yolBar(yolKonuAdi(),'','yolKapat()',false)+'<div class="yol-sayfa"><h1><span aria-hidden="true">✓</span> '+(son?'Etap tamamlandı':'Bölüm tamamlandı')+'</h1>';
 if(!son){h+='<p class="yol-yon">Bu bölümde öğrendiklerin. Dokununca adı okunur.</p><div class="yol-ogr">'+Y.node.items.map(it=>'<button type="button" class="yol-ogr-k" onclick="yolSoyleOge(\''+it.id+'\')"><img src="'+esc(it.image)+'" alt="'+esc(it.imageAlt||it.answer)+'"><span>'+esc(it.answer)+'</span></button>').join('')+'</div>';}
 if(Y.yeniLezzet){const z=Y.yeniLezzet;h+='<section class="yol-kart lz-yeni" role="status"><h2>Yeni lezzet açıldı!</h2><div class="lz-yeni-s">'+lzFoto(z,'lz-foto kucuk')+'<b>'+esc(z.ad)+'</b></div><button type="button" class="yol-btn ikinci" onclick="go(\'lezzet\')">Lezzetleri Keşfet ›</button></section>';}
 h+='<p class="yol-kart yol-sonuc" role="status">'+yolOgrenilen(plan,s)+' / '+yolToplam(plan)+' '+yolK().nesneBelirtme+' öğrendin.'+(sira?' Sıradaki: <b>'+esc(yolAd(sira))+'</b> açıldı.':' Bütün bölümler tamamlandı.')+'</p><div class="yol-alt"><button type="button" class="yol-btn ikinci" onclick="go(\'yolum\')">Yolculuğum</button>'+(sira?'<button type="button" class="yol-btn" onclick="yolBaslat(\''+sira.id+'\')">Devam et ›</button>':'')+'</div></div>';
 return h;
}
function yolTekrarBittiHTML(){
 const cikan=Y.qs.filter(q=>q.tkCikti).length,kalan=yolTkSayi(),nes=yolK().nesne;
 return yolBar(yolKonuAdi(),'','go(\'yolum\')',false)+'<div class="yol-sayfa"><h1>Tekrar tamamlandı</h1><p class="yol-kart yol-sonuc" role="status"><b>'+Y.fark+' / '+Y.qs.length+' doğru</b><br>'+(cikan?cikan+' '+nes+' listeden çıktı. ':'')+(kalan?'Listede '+kalan+' '+nes+' kaldı. Başka bir gün yeniden çalışınca doğru bildiğin '+yolK().cogul+' listeden çıkar.':'Tekrar edilecek '+nes+' kalmadı. Aferin!')+'</p><div class="yol-alt"><button type="button" class="yol-btn ikinci" onclick="go(\'yolum\')">Yolculuğum</button>'+(kalan?'<button type="button" class="yol-btn" onclick="yolTekrarBaslat()">Yeniden tekrarla ›</button>':'')+'</div></div>';
}
function yolSerbestSecHTML(){
 const n=Y.node;
 return yolBar(yolKonuAdi(),'','go(\'yolum\')',false)+'<div class="yol-sayfa"><p class="yol-etiket">Serbest Çalışma · '+esc(yolEtiket(n))+'</p><h1>Nasıl çalışmak istersin?</h1><p class="yol-yon">Bu çalışma puanı ve kilidi etkilemez.</p><div class="yol-secim"><button type="button" class="yol-btn" onclick="yolSerbestBaslat(\'soru\')">5 seçenekli sorular</button><button type="button" class="yol-btn" onclick="yolSerbestBaslat(\'esles\')">6’lı eşleştirme</button></div></div>';
}
function yolSerbestBittiHTML(){
 return yolBar(yolKonuAdi(),'','go(\'yolum\')',false)+'<div class="yol-sayfa"><h1>Çalışma bitti</h1>'+(Y.fark!==undefined&&Y.qs?'<p class="yol-kart yol-sonuc" role="status"><b>'+Y.fark+' / '+Y.qs.length+' doğru</b></p>':'<p class="yol-kart yol-sonuc" role="status"><b>Bütün eşleşmeleri buldun.</b></p>')+'<div class="yol-alt"><button type="button" class="yol-btn ikinci" onclick="go(\'yolum\')">Yolculuğum</button><button type="button" class="yol-btn" onclick="yolSerbestAc(\''+Y.node.id+'\')">Yeniden çalış ›</button></div></div>';
}
function yolPlayHTML(){
 if(!Y||!yolPlan())return yolumHTML();Y.oku=[];
 if(Y.phase==='ssec')return yolSerbestSecHTML();
 if(Y.phase==='tbitti')return yolTekrarBittiHTML();
 if(Y.phase==='sbitti')return yolSerbestBittiHTML();
 if(Y.phase==='ogren')return yolOgrenHTML();
 if(['s1','s2','s3'].includes(Y.phase))return yolSoruHTML();
 if(Y.phase==='esles')return yolEslesHTML();
 if(Y.phase==='basarisiz')return yolBasarisizHTML();
 return yolBittiHTML();
}

/* ---------- Bağlantılar ---------- */
const YOL_RENDER=render,YOL_BACK=back;
render=function(){
 const app=document.getElementById('app');
 if(app&&st.screen==='yolum'){app.innerHTML=yolumHTML();return;}
 if(app&&st.screen==='yolplay'){app.innerHTML=yolPlayHTML();return;}
 YOL_RENDER();
 if(app&&st.screen==='subject'&&YOL_KONU[st.subject]){YOL_AYAR.subject=st.subject;const l=app.querySelector('.list');if(l&&!l.querySelector('.yol-giris'))l.insertAdjacentHTML('afterbegin','<button class="menu-btn yol-giris" onclick="yolAc(\''+st.subject+'\')"><b>Yolculuğum</b><span>'+esc(YOL_KONU[st.subject].giris)+'</span></button>');}
};
back=function(){
 if(st.screen==='yolplay'){yolKaydet();go('yolum');return;}
 if(st.screen==='yolum'){go('subject');return;}
 YOL_BACK();
};
