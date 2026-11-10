/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Mutfak Araçları · Öğrenme yolu (Parça 2a): etap > bölüm, kilit, bölüm içi akış, açıklama, 6'lı eşleştirme, Yolculuğum.
   Bölüm = 6 araç. Etap = 4 bölüm + etap sonu eşleştirmesi. Bütün sayılar YOL_AYAR içinde tek yerden ayarlanır.
   Akış: Öğren -> addan görsele (4 seçenek) -> görselden ada (4 seçenek) -> görselden ada (5 seçenek) -> 6'lı eşleştirme.
   Geçme ölçütü son aşamadadır (görselden ada, 5 seçenek). İlk iki aşama öğretir, geçmeyi belirlemez. */
'use strict';
const YOL_AYAR={
 subject:'mutfak-araclari',
 bolumOgesi:6,        /* bir bölümdeki araç sayısı */
 etapBolum:4,         /* bir etaptaki bölüm sayısı */
 gecme:5,             /* son aşamada 6 sorudan en az kaç doğru */
 destekDeneme:2,      /* bu kadar başarısız denemeden sonra Öğren + 4 seçenekle yeniden başlar */
 /* Birbirine benzeyen takımlar aynı bölümde karşılaşmasın diye iki takım grubu sırayla kullanılır. */
 gruplar:[[1,4,7,10,5,12],[2,6,8,11,3,9]]
};
const YOL_ASAMA=[{id:'s1',ad:'Görseli bul'},{id:'s2',ad:'4 seçenek'},{id:'s3',ad:'5 seçenek'}];
let Y=null; /* açık bölüm durumu */

/* ---------- Plan ---------- */
function yolHash(s){let h=2166136261>>>0;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function yolRng(s){return YarisModel.seeded(yolHash(s));}
function yolKar(a,s){return YarisModel.shuffle(a,yolRng(s));}
function yolVeri(){const d=typeof CONTENT!=='undefined'?CONTENT[YOL_AYAR.subject]:null;return d&&Array.isArray(d.matches)?d:null;}
let YOL_PLAN=null,YOL_PLAN_REV='';
function yolPlan(){
 const d=yolVeri();if(!d)return null;
 const rev=d.revision||String(d.matches.length);if(YOL_PLAN&&YOL_PLAN_REV===rev)return YOL_PLAN;
 const bySet={};d.matches.forEach(m=>{(bySet[m.set]=bySet[m.set]||[]).push(m);});
 const per=YOL_AYAR.bolumOgesi*YOL_AYAR.etapBolum/YOL_AYAR.gruplar.length/YOL_AYAR.gruplar[0].length; /* her takımdan etap başına araç */
 const etapSayisi=Math.floor(Math.min(...Object.values(bySet).map(a=>a.length))/per);
 const nodes=[];
 for(let e=0;e<etapSayisi;e++){
  const etapOgeleri=[];
  for(let b=0;b<YOL_AYAR.etapBolum;b++){
   const grup=YOL_AYAR.gruplar[b%YOL_AYAR.gruplar.length],kat=Math.floor(b/YOL_AYAR.gruplar.length);
   const items=grup.map(s=>(bySet[s]||[])[e*per+kat]).filter(Boolean);
   etapOgeleri.push(...items);
   nodes.push({id:'e'+(e+1)+'b'+(b+1),etap:e+1,tur:'bolum',no:b+1,items});
  }
  nodes.push({id:'e'+(e+1)+'s',etap:e+1,tur:'son',no:0,items:etapOgeleri});
 }
 YOL_PLAN=nodes;YOL_PLAN_REV=rev;return nodes;
}
function yolAd(n){return n.tur==='son'?'Etap '+n.etap+' · Etap sonu':'Etap '+n.etap+' · Bölüm '+n.no;}

/* ---------- Kayıt (profil başına, bu cihazda) ---------- */
function yolKey(){return st.guest?'misafir':(st.prof||'misafir');}
function yolS(){const a=ls('yol_ma',{})||{},s=a[yolKey()]||{};return {done:s.done||{},fails:s.fails||{},cur:s.cur||null};}
function yolYaz(s){const a=ls('yol_ma',{})||{};a[yolKey()]=s;lsSet('yol_ma',a);}
function yolAcik(plan,s,i){return i===0||!!s.done[plan[i-1].id];}
function yolSiradaki(plan,s){const i=plan.findIndex(n=>!s.done[n.id]);return i<0?null:plan[i];}
function yolOgrenilen(plan,s){return plan.filter(n=>n.tur==='bolum'&&s.done[n.id]).reduce((t,n)=>t+n.items.length,0);}
function yolToplam(plan){return plan.filter(n=>n.tur==='bolum').reduce((t,n)=>t+n.items.length,0);}

/* ---------- Sorular ---------- */
function yolSoru(item,tip,node,tohum,destek){
 const ad=item.answer;
 if(tip==='s1'&&!item.comparison){
  const havuz=node.items.filter(x=>!x.comparison&&x.id!==item.id);
  if(havuz.length>=3){
   const dig=yolKar(havuz,tohum+item.id+'g').slice(0,3);
   const sec=yolKar([item,...dig],tohum+item.id+'G').map(x=>({id:x.id,image:x.image,alt:x.imageAlt||x.answer}));
   return {tip:'gorsel',item,ad,sec,dogru:item.id};
  }
 }
 const n=(tip==='s3'&&!destek)?5:4;
 let dis=[...new Set((item.disla||[]).filter(x=>x&&x!==ad))];
 dis=yolKar(dis,tohum+item.id+'d').slice(0,n-1);
 if(dis.length<n-1){const diger=[...new Set(node.items.map(x=>x.answer).filter(x=>x&&x!==ad&&!dis.includes(x)))];dis.push(...yolKar(diger,tohum+item.id+'f').slice(0,n-1-dis.length));}
 const sec=yolKar([ad,...dis],tohum+item.id+'D').map(t=>({id:t,text:t}));
 return {tip:'ad',item,ad,sec,dogru:ad};
}
function yolSorular(node,asama,tohum,destek){
 const sira=yolKar(node.items,tohum+asama);
 return sira.map(it=>yolSoru(it,asama,node,tohum+asama,destek));
}

/* ---------- Giriş ve durum ---------- */
function yolAc(){go('yolum');}
function yolBaslat(id,gozat){
 const plan=yolPlan();if(!plan)return;const i=plan.findIndex(n=>n.id===id),s=yolS();if(i<0)return;
 if(!gozat&&!yolAcik(plan,s,i))return;
 const node=plan[i];sesSus();
 const fails=s.fails[id]||0,destek=fails>=YOL_AYAR.destekDeneme;
 if(gozat){Y={node,mode:'gozat',phase:'ogren',k:0,pick:null,tohum:'g',destek:false,sk:{}};go('yolplay');return;}
 const cur=s.cur&&s.cur.id===id?s.cur:null;
 if(cur&&['ogren','s1','s2','s3','esles'].includes(cur.phase)){
  Y={node,mode:'oyun',phase:cur.phase,k:cur.k||0,pick:null,tohum:cur.tohum,destek:!!cur.destek,sk:cur.sk||{}};
 }else{
  const tohum=id+'#'+(fails+1)+'#'+Date.now().toString(36);
  Y={node,mode:'oyun',phase:node.tur==='son'?'esles':'ogren',k:0,pick:null,tohum,destek,sk:{}};
 }
 yolFazHazirla();yolKaydet();go('yolplay');
}
function yolKaydet(){if(!Y||Y.mode!=='oyun')return;const s=yolS();s.cur={id:Y.node.id,phase:Y.phase,k:Y.k,tohum:Y.tohum,destek:Y.destek,sk:Y.sk};yolYaz(s);}
function yolFazHazirla(){
 Y.pick=null;
 if(['s1','s2','s3'].includes(Y.phase)){Y.qs=yolSorular(Y.node,Y.phase,Y.tohum,Y.destek);}
 if(Y.phase==='esles'){yolEslesHazirla();}
}
function yolEslesHazirla(){
 const g=new Set(),havuz=[];
 for(const it of yolKar(Y.node.items,Y.tohum+'m')){if(!g.has(it.answer)){g.add(it.answer);havuz.push(it);}}
 const sec=havuz.slice(0,YOL_AYAR.bolumOgesi);
 Y.m={ogeler:sec,gorseller:yolKar(sec,Y.tohum+'mg'),adlar:yolKar(sec,Y.tohum+'ma'),sel:null,eslesen:[],hata:0,mesaj:'',mesajTur:''};
}

/* ---------- Ses ---------- */
function yolSoyle(t){if(!t)return;if(SES.acik){sesSoyle(t);return;}SES.acik=true;try{sesSoyle(t);}finally{SES.acik=false;}if(SES.pending)SES.pending.zorla=true;}
window.yolSoyleIdx=function(i){yolSoyle(Y&&Y.oku&&Y.oku[i]);};
function yolSesBtn(t,etiket){Y.oku=Y.oku||[];const i=Y.oku.push(t)-1;return '<button type="button" class="spk yol-ses" aria-label="'+esc(etiket||'Sesli dinle')+'" onclick="yolSoyleIdx('+i+')">🔊 <span>Dinle</span></button>';}

/* ---------- Akış ---------- */
window.yolSonraki=function(){
 if(!Y)return;
 if(Y.phase==='ogren'){
  if(Y.k<Y.node.items.length-1){Y.k++;render();return;}
  if(Y.mode==='gozat'){go('yolum');return;}
  Y.phase='s1';Y.k=0;yolFazHazirla();yolKaydet();render();return;
 }
 if(['s1','s2','s3'].includes(Y.phase)){
  if(Y.pick===null)return;
  if(Y.k<Y.qs.length-1){Y.k++;Y.pick=null;yolKaydet();render();return;}
  const dogru=Y.qs.filter(q=>q.cevap===q.dogru).length;Y.sk[Y.phase]=dogru;
  if(Y.phase==='s1'){Y.phase='s2';Y.k=0;yolFazHazirla();yolKaydet();render();return;}
  if(Y.phase==='s2'){Y.phase='s3';Y.k=0;yolFazHazirla();yolKaydet();render();return;}
  /* son aşama: geçme kararı */
  if(dogru>=YOL_AYAR.gecme){Y.phase='esles';Y.k=0;yolFazHazirla();yolKaydet();render();return;}
  const s=yolS();s.fails[Y.node.id]=(s.fails[Y.node.id]||0)+1;s.cur=null;yolYaz(s);
  Y.phase='basarisiz';Y.fark=dogru;render();return;
 }
};
window.yolCevap=function(i){
 if(!Y||!['s1','s2','s3'].includes(Y.phase)||Y.pick!==null)return;
 const q=Y.qs[Y.k];if(!q.sec[i])return;q.cevap=q.sec[i].id;Y.pick=i;render();

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
  if(m.eslesen.length===m.ogeler.length){yolTamamla();return;}
 }else{m.hata++;m.mesaj='Eşleşmedi. Başka bir ad dene.';m.mesajTur='bad';m.sel=null;}
 render();
};
function yolTamamla(){
 const s=yolS();s.done[Y.node.id]=1;s.cur=null;yolYaz(s);Y.phase='bitti';render();
}
window.yolKapat=function(){yolKaydet();go('yolum');};

/* ---------- Ekranlar ---------- */
function yolYukleniyor(baslik,geri){
 return topBar(baslik)+'<div class="wrap"><h1>'+esc(baslik)+'</h1>'+(CONTENT[YOL_AYAR.subject]===null?'<p role="alert">İçerik yüklenemedi. Bağlantını kontrol edip yeniden dene.</p><button class="btn" onclick="loadContent()">Yeniden dene</button>':'<p>İçerik yükleniyor…</p>')+'</div>';
}
function yolumHTML(){
 const plan=yolPlan();if(!plan)return yolYukleniyor('Yolculuğum');
 const s=yolS(),sira=yolSiradaki(plan,s),ogr=yolOgrenilen(plan,s),top=yolToplam(plan);
 let h=topBar('Yolculuğum')+'<div class="wrap yol-wrap"><h1>Yolculuğum</h1>';
 h+='<section class="card yol-devam" aria-label="Kaldığın yer">';
 if(sira){h+='<small>Kaldığın yer</small><strong>'+esc(yolAd(sira))+'</strong><span>'+ogr+' / '+top+' aracı öğrendin</span><button class="btn pri yol-buyuk" onclick="yolBaslat(\''+sira.id+'\')">'+(s.cur&&s.cur.id===sira.id?'Devam et':'Başla')+'</button>';}
 else h+='<small>Tebrikler</small><strong>Bütün bölümleri tamamladın</strong><span>'+ogr+' / '+top+' aracı öğrendin</span>';
 h+='</section>';
 const etaplar=[...new Set(plan.map(n=>n.etap))];
 for(const e of etaplar){
  const nodes=plan.filter(n=>n.etap===e),bitti=nodes.every(n=>s.done[n.id]);
  h+='<section class="card yol-etap" aria-label="Etap '+e+'"><h2>Etap '+e+(bitti?' <span class="yol-ok" aria-label="tamamlandı">✓</span>':'')+'</h2><div class="yol-dugmeler">';
  for(const n of nodes){
   const i=plan.indexOf(n),acik=yolAcik(plan,s,i),bitmis=!!s.done[n.id],simdi=sira&&sira.id===n.id;
   const ad=n.tur==='son'?'Etap sonu':'Bölüm '+n.no;
   if(!acik)h+='<button class="yol-dugme kilit" disabled aria-label="'+ad+', kilitli"><span aria-hidden="true">🔒</span><b>'+ad+'</b><small>Kilitli</small></button>';
   else if(bitmis)h+='<button class="yol-dugme bitti" onclick="yolBaslat(\''+n.id+'\','+(n.tur==='son'?'false':'true')+')" aria-label="'+ad+', tamamlandı. '+(n.tur==='son'?'Yeniden eşleştir':'Öğrendiklerime bak')+'"><span aria-hidden="true">✓</span><b>'+ad+'</b><small>'+(n.tur==='son'?'Tekrar':'Öğrendiklerim')+'</small></button>';
   else h+='<button class="yol-dugme'+(simdi?' simdi':'')+'" onclick="yolBaslat(\''+n.id+'\')" aria-label="'+ad+', şimdi"><span aria-hidden="true">▶</span><b>'+ad+'</b><small>Şimdi</small></button>';
  }
  h+='</div></section>';
 }
 return h+'</div>';
}
function yolAsamaSeridi(){
 const sira=['ogren','s1','s2','s3','esles'],ad=['Öğren',...YOL_ASAMA.map(a=>a.ad),'Eşleştir'],i=sira.indexOf(Y.phase);
 return '<ol class="yol-serit" aria-label="Aşamalar">'+ad.map((a,j)=>'<li class="'+(j<i?'bitti':j===i?'simdi':'')+'"'+(j===i?' aria-current="step"':'')+'>'+(j<i?'✓ ':'')+esc(a)+'</li>').join('')+'</ol>';
}
function yolOgrenHTML(){
 const it=Y.node.items[Y.k],son=Y.k===Y.node.items.length-1;
 return topBar(yolAd(Y.node)).replace('back()','yolKapat()')+'<div class="wrap yol-wrap">'+(Y.mode==='oyun'?yolAsamaSeridi():'<h1>Öğrendiklerim</h1>')+
  '<p class="yol-say">'+(Y.k+1)+' / '+Y.node.items.length+'</p>'+
  '<div class="yol-kart"><img class="yol-img" src="'+esc(it.image)+'" alt="'+esc(it.imageAlt||it.answer)+'"><h2 class="yol-ad">'+esc(it.answer)+'</h2><p class="yol-acik">'+esc(it.explanation||'')+'</p>'+yolSesBtn(it.answer+'. '+(it.explanation||''),'Adını ve açıklamasını dinle')+'</div>'+
  '<div class="yol-alt">'+(Y.k>0?'<button class="btn" onclick="Y.k--;render()">‹ Önceki</button>':'<span></span>')+'<button class="btn pri" onclick="yolSonraki()">'+(son?(Y.mode==='oyun'?'Sorulara geç ›':'Kapat'):'Sonraki ›')+'</button></div></div>';
}
function yolSoruHTML(){
 const q=Y.qs[Y.k],cevaplandi=Y.pick!==null,ok=cevaplandi&&q.cevap===q.dogru,L='ABCDE';
 let h=topBar(yolAd(Y.node)).replace('back()','yolKapat()')+'<div class="wrap yol-wrap">'+yolAsamaSeridi()+'<p class="yol-say">Soru '+(Y.k+1)+' / '+Y.qs.length+'</p>';
 if(q.tip==='gorsel'){
  h+='<h2 class="yol-soru">“'+esc(q.ad)+'” hangisidir?</h2><div class="yol-gorsel-sec">';
  q.sec.forEach((c,i)=>{let cls='yol-gsec';if(cevaplandi){if(c.id===q.dogru)cls+=' ok';else if(q.cevap===c.id)cls+=' bad';}
   h+='<button class="'+cls+'" onclick="yolCevap('+i+')"'+(cevaplandi?' disabled':'')+' aria-label="'+L[i]+'. '+esc(c.alt)+'"><img src="'+esc(c.image)+'" alt=""><span class="yol-let">'+L[i]+'</span>'+(cevaplandi&&c.id===q.dogru?'<em>✓ Doğru cevap</em>':cevaplandi&&q.cevap===c.id?'<em>✕ Senin cevabın</em>':'')+'</button>';});
  h+='</div>';
 }else{
  h+='<img class="yol-img" src="'+esc(q.item.image)+'" alt="'+esc(q.item.imageAlt||'Soru görseli')+'"><h2 class="yol-soru">'+esc(q.item.kok||q.item.prompt||'Bu aracın adı nedir?')+'</h2><div class="yol-secenek">';
  q.sec.forEach((c,i)=>{let cls='yol-sec';if(cevaplandi){if(c.id===q.dogru)cls+=' ok';else if(q.cevap===c.id)cls+=' bad';}
   h+='<button class="'+cls+'" onclick="yolCevap('+i+')"'+(cevaplandi?' disabled':'')+'><span class="yol-let">'+L[i]+'</span><span class="yol-sec-ad">'+esc(c.text)+'</span>'+(cevaplandi&&c.id===q.dogru?'<em>✓ Doğru cevap</em>':cevaplandi&&q.cevap===c.id?'<em>✕ Yanlış · senin cevabın</em>':'')+'</button>';});
  h+='</div>';
 }
 if(cevaplandi){
  const son=Y.k===Y.qs.length-1;
  h+='<div class="yol-geri '+(ok?'ok':'bad')+'" role="status"><b>'+(ok?'✓ Doğru':'✕ Yanlış')+'</b>'+(ok?'':'<span> Doğru cevap: '+esc(q.ad)+'</span>')+'<p>'+esc(q.item.explanation||'')+'</p>'+yolSesBtn((ok?'Doğru. ':'Yanlış. Doğru cevap: '+q.ad+'. ')+(q.item.explanation||''),'Açıklamayı dinle')+'</div>'+
   '<div class="yol-alt"><span></span><button class="btn pri" onclick="yolSonraki()">'+(son?(Y.phase==='s3'?'Sonucu gör ›':'Sonraki aşama ›'):'Sonraki soru ›')+'</button></div>';
 }
 return h+'</div>';
}
function yolEslesHTML(){
 const m=Y.m,eslesti=id=>m.eslesen.includes(id);
 let h=topBar(yolAd(Y.node)).replace('back()','yolKapat()')+'<div class="wrap yol-wrap">'+(Y.node.tur==='bolum'?yolAsamaSeridi():'<h1>Etap sonu eşleştirmesi</h1>')+
  '<h2 class="yol-soru">Her görseli adıyla eşleştir</h2><p class="yol-yon">Önce bir görsele, sonra adına dokun. '+m.eslesen.length+' / '+m.ogeler.length+' eşleşti.</p><div class="yol-es">';
 h+='<div class="yol-es-sut" aria-label="Görseller">'+m.gorseller.map(it=>'<button class="yol-es-g'+(eslesti(it.id)?' ok':'')+(m.sel===it.id?' sec':'')+'" onclick="yolEsGorsel(\''+it.id+'\')"'+(eslesti(it.id)?' disabled':'')+' aria-pressed="'+(m.sel===it.id)+'" aria-label="Görsel: '+esc(it.imageAlt||'araç')+(eslesti(it.id)?', eşleşti':'')+'"><img src="'+esc(it.image)+'" alt="">'+(eslesti(it.id)?'<em>✓</em>':'')+'</button>').join('')+'</div>';
 h+='<div class="yol-es-sut" aria-label="Adlar">'+m.adlar.map(it=>'<button class="yol-es-a'+(eslesti(it.id)?' ok':'')+'" onclick="yolEsAd(\''+it.id+'\')"'+(eslesti(it.id)?' disabled':'')+'>'+(eslesti(it.id)?'✓ ':'')+esc(it.answer)+'</button>').join('')+'</div></div>';
 h+='<p class="yol-mesaj '+m.mesajTur+'" role="status">'+(m.mesaj?(m.mesajTur==='ok'?'✓ ':m.mesajTur==='bad'?'✕ ':'')+esc(m.mesaj):'')+'</p></div>';
 return h;
}
function yolBasarisizHTML(){
 const s=yolS(),fails=s.fails[Y.node.id]||0,destek=fails>=YOL_AYAR.destekDeneme;
 return topBar(yolAd(Y.node)).replace('back()','yolKapat()')+'<div class="wrap yol-wrap"><h1>Bu sefer olmadı</h1><p class="card yol-sonuc" role="status"><b>'+Y.fark+' / '+Y.qs.length+' doğru</b><br>Bölümü geçmek için en az '+YOL_AYAR.gecme+' doğru gerekir. Bir sonraki denemede '+(destek?'önce araçlara yeniden bakacaksın ve soruların 4 seçeneği olacak.':'aynı araçları yeniden çalışacaksın.')+'</p><div class="yol-alt"><button class="btn" onclick="go(\'yolum\')">Yolculuğum</button><button class="btn pri" onclick="yolYenidenDene()">Yeniden dene</button></div></div>';
}
function yolBittiHTML(){
 const plan=yolPlan(),s=yolS(),sira=yolSiradaki(plan,s),son=Y.node.tur==='son';
 let h=topBar(yolAd(Y.node)).replace('back()','yolKapat()')+'<div class="wrap yol-wrap"><h1><span aria-hidden="true">✓</span> '+(son?'Etap tamamlandı':'Bölüm tamamlandı')+'</h1>';
 if(!son){h+='<p class="yol-yon">Bu bölümde öğrendiklerin. Dokununca adı okunur.</p><div class="yol-ogr">'+Y.node.items.map(it=>'<button class="yol-ogr-k" onclick="yolSoyleIdx('+(Y.oku.push(it.answer)-1)+')"><img src="'+esc(it.image)+'" alt="'+esc(it.imageAlt||it.answer)+'"><span>'+esc(it.answer)+'</span></button>').join('')+'</div>';}
 h+='<p class="card yol-sonuc" role="status">'+yolOgrenilen(plan,s)+' / '+yolToplam(plan)+' aracı öğrendin.'+(sira?' Sıradaki: <b>'+esc(yolAd(sira))+'</b> açıldı.':' Bütün bölümler tamamlandı.')+'</p><div class="yol-alt"><button class="btn" onclick="go(\'yolum\')">Yolculuğum</button>'+(sira?'<button class="btn pri" onclick="yolBaslat(\''+sira.id+'\')">Devam et ›</button>':'')+'</div></div>';
 return h;
}
function yolPlayHTML(){
 if(!Y||!yolPlan())return yolumHTML();Y.oku=[];
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
 if(app&&st.screen==='subject'&&st.subject===YOL_AYAR.subject){const l=app.querySelector('.list');if(l&&!l.querySelector('.yol-giris'))l.insertAdjacentHTML('afterbegin','<button class="menu-btn yol-giris" onclick="yolAc()"><b>Yolculuğum</b><span>Araçları sırayla öğren. Bölüm bölüm ilerle, kaldığın yerden devam et.</span></button>');}
};
back=function(){
 if(st.screen==='yolplay'){yolKaydet();go('yolum');return;}
 if(st.screen==='yolum'){go('subject');return;}
 YOL_BACK();
};
