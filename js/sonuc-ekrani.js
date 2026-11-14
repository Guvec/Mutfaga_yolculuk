/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* 14.11 akşam: Maç sonu ekranları tek sayfa (Er Meydanı, Blitz, 2'ye 2, 1'e 1).
   Düzen: kazanan kartı → senin sonucun → sıralama (gerekirse kendi içinde kayar) → rövanş daveti → alt eylem çubuğu.
   Ayrıntılar (rekor, ünvanlar, dönüm noktası, genel sıralama, rapor, arkadaş ekle) "Ayrıntılar" penceresinde.
   Rövanş: kazanan açıklandıktan sonra herkes isteyebilir. Kural değişmez: rövanş odasının kodu eski odadan türetilir
   (her telefonda aynı); isteyen odayı kurar, diğerleri bu kodu 3 saniyede bir yoklar ve "X rövanş istiyor · Katıl" görür. */
'use strict';
const RV={tm:null,oda:null,kod:null,bekle:false};
function rvKod(){if(!YR.code||!YR.room)return null;return ('RV'+(bzHash(YR.code+'|'+YR.room.created)%2176782336).toString(36)).toUpperCase().slice(0,10);}
function rvHazir(){
 if(!YR.active||!YR.room)return false;
 if(st.screen==='aover')return !!(AR&&AR.finalized);
 if(st.screen==='raceover')return yrAllDone();
 return false;
}
function rvYokla(){
 if(!/^(aover|raceover)$/.test(st.screen||'')||!YR.active){rvDur();return;}
 const kod=rvKod();if(!kod)return;RV.kod=kod;
 yrService().peek(kod).then(r=>{
  const once=RV.oda;RV.oda=r&&r.status==='lobby'&&YR.room&&r.created>YR.room.created?r:null;
  if(RV.oda&&!once){try{sesEfekt('ac');}catch(e){}if(typeof sesSoyle==='function')sesSoyle((RV.oda.hostNick||'Bir oyuncu')+' rövanş istiyor.');}
  const e=document.getElementById('rvAlan');if(e)e.innerHTML=rvAlanHTML();document.querySelector('.sn-ekran')?.classList.toggle('rv-var',!!RV.oda);
 }).catch(()=>{});
}
function rvBasla(){if(RV.tm)return;rvYokla();RV.tm=setInterval(rvYokla,3000);}
function rvDur(){if(RV.tm){clearInterval(RV.tm);RV.tm=null;}RV.oda=null;}
function rvAlanHTML(){
 if(!RV.oda)return '';
 return '<button type="button" class="sn-davet" onclick="rvIste()"><span aria-hidden="true">🔁</span><span><b>'+esc(RV.oda.hostNick||'Bir oyuncu')+' rövanş istiyor!</b><small>Dokun, aynı oyuna katıl.</small></span><em>Katıl ›</em></button>';
}
window.rvIste=async function(){
 if(RV.bekle||!YR.room)return;RV.bekle=true;
 const r=YR.room,kod=rvKod(),bilgi={mode:r.mode,subject:r.subject,scope:r.scope,bz:typeof bzTur==='function'?bzTur(r):''};
 try{sesEfekt('basla');}catch(e){}
 try{
  const var_=await yrService().peek(kod).catch(()=>null);
  rvDur();yrLeaveNow();
  if(var_&&var_.status==='lobby'){await yrJoin(kod);return;}
  if(bilgi.mode==='arena'){yrCreateOpen('arena');if(bilgi.scope==='konu')Object.assign(YR.cfg,{arenaTopic:bilgi.subject,scope:'konu',subject:bilgi.subject});}
  else{yrCreateOpen('race');Object.assign(YR.cfg,{mode:'race',subject:'mutfak-araclari',scope:'butun',kind:'gorsel',set:0,n:20,lim:30,bz:bilgi.bz||'blitz'});}
  Object.assign(YR.cfg,{pub:false,kilit:false,ad:'Rövanş',code:kod});
  await yrCreate();
  delete YR.cfg.bz;YR.cfg.code='';
  if(!YR.active&&/kullanılıyor/i.test(YR.error||'')){YR.error='';await yrJoin(kod);}
 }finally{RV.bekle=false;}
};
/* Ayrıntılar penceresi */
window.snAyrinti=function(){
 const h=st.screen==='aover'?snArAyrinti():st.screen==='dover'?snDuAyrinti():snBzAyrinti();
 const k=document.createElement('div');k.id='snPanel';k.className='foot-menu';k.setAttribute('role','dialog');k.setAttribute('aria-modal','true');k.setAttribute('aria-label','Maç ayrıntıları');
 k.innerHTML='<div class="foot-menu-ic sn-panel"><h2>📋 Maç ayrıntıları</h2><div class="sn-panel-govde">'+(h||'<p>Bu maç için ek ayrıntı yok.</p>')+'</div><button type="button" class="btn pri" id="snKapat">Kapat</button></div>';
 document.body.appendChild(k);const kapat=()=>k.remove();k.addEventListener('click',e=>{if(e.target===k)kapat();});k.querySelector('#snKapat').onclick=kapat;k.querySelector('#snKapat').focus();
};
function snSatir(p,i,me,deger,ek){return '<li class="sn-satir'+(p.uid===me?' ben':'')+'"><span class="sn-sira">'+(['🥇','🥈','🥉'][i]||(i+1)+'.')+'</span><span class="sn-ad">'+(ek||'')+esc(p.nick)+(p.uid===me?' <small>(Sen)</small>':'')+'</span><span class="sn-deger">'+deger+'</span></li>';}
function snIskelet(o){
 /* o: baslik, kahraman, ben, liste, eylemler, bekliyor */
 return yrTop(o.baslik)+'<div class="wrap sn-ekran">'+yrWarnHTML()+
  '<h1 id="yrHeading" tabindex="-1" class="sn-gizli">'+esc(o.h1||o.baslik)+'</h1>'+
  o.kahraman+(o.ben?'<p class="sn-ben">'+o.ben+'</p>':'')+
  '<section class="sn-liste" aria-label="Sıralama"><ol>'+o.liste+'</ol></section>'+
  '<div id="rvAlan" class="sn-rv" aria-live="polite">'+rvAlanHTML()+'</div>'+
  '<div class="sn-eylem">'+o.eylemler+'</div></div>';
}
/* ---------- Er Meydanı ---------- */
function snArAyrinti(){
 if(!AR)return '';const s=arStats(AR.myR),pending=!AR.finalized,first=pending?[]:arRanks().filter(p=>p.rank===1&&!p.left);
 return (first.length===1?arDonum(first[0]):'')+(arM5()?arRekorHTML(s):'')+(!pending&&arM5()?arUnvanHTML():'')+
  (!pending&&typeof rkInlineHTML==='function'?rkInlineHTML('oy-arena2','genel',undefined,10).replace('İlgili sıralama','Genel Er Meydanı sıralaması'):'')+
  (!pending?'<button type="button" class="btn" onclick="document.getElementById(\'snPanel\').remove();rkOpenBoard(\'oy-arena2\')">Er Meydanı listesinin tamamı</button>':'')+
  (!pending&&typeof frBtn==='function'?'<div class="sn-ark">'+arRanks().filter(p=>p.uid!==yrMe()).map(p=>frBtn(p,true)).join('')+'</div>':'')+
  (AR.rapor?sonucGoster(AR.rapor):'');
}
arOverHTML=function(){
 const s=arStats(AR.myR),pending=!AR.finalized,rows=arRanks(),me=yrMe(),m5=arM5();
 if(m5){arRekorYaz(s);if(!pending)arPuanYaz(s);}
 const first=pending?[]:rows.filter(p=>p.rank===1&&!p.left),ben=rows.find(p=>p.uid===me);
 const o=AR.oncekiRekor||arRekorAl(),yeniRekor=m5&&o&&o.score>0&&s.score>o.score;
 const kahraman=pending
  ?'<section class="sn-kahraman bekle" role="status"><span class="sn-ikon" aria-hidden="true">⏳</span><b>Denemen bitti</b><small>Diğer oyuncuların sonuçları bekleniyor…</small></section>'
  :first.length?'<section class="sn-kahraman" role="status"><span class="sn-ikon" aria-hidden="true">👑</span><small>'+(first.length>1?'Ortak birinciler':'Birinci')+'</small><b>'+esc(first.map(p=>p.nick).join(', '))+'</b><small>'+(m5?first[0].score+' puan · ':'')+first[0].ok+' doğru · '+arSure(first[0].tt)+'</small></section>':'';
 const liste=rows.map((p,i)=>snSatir(p,i,me,(m5?p.score+' puan':p.ok+' doğru')+(p.left?' · ayrıldı':!p.done&&pending?' · ⏳':''))).join('');
 const benY=(ben&&!pending?'<b>'+ben.rank+'.</b> oldun · ':'')+(m5?'<b>'+s.score+'</b> puan · ':'')+s.ok+' doğru · '+s.bad+' yanlış'+(yeniRekor?' · <span class="sn-rozet">🎉 Yeni rekor</span>':'')+(s.n>=AR.total&&m5?' · 🏆 Meydan Şampiyonu':'');
 const ey=(!pending?'<button type="button" class="btn pri sn-rovans" onclick="rvIste()">🔁 Rövanş iste</button>':'')+
  '<div class="sn-ikili">'+(!pending&&AR.reviewCount?'<button type="button" class="btn" onclick="arReviewOpen()">Pekiştir '+AR.reviewCount+'</button>':'')+
  '<button type="button" class="btn" onclick="snAyrinti()">Ayrıntılar</button><button type="button" class="btn" onclick="yrLeave()">Çık</button></div>';
 if(!pending)setTimeout(rvBasla,0);
 return snIskelet({baslik:'Er Meydanı sonucu',h1:pending?'Denemen bitti':AR.final===1?'Birinci sensin!':'Oyun tamamlandı',kahraman,ben:benY,liste,eylemler:ey});
};
/* ---------- Blitz ve 2'ye 2 ---------- */
function snBzAyrinti(){const g=YR.g;return (g&&g.rapor?sonucGoster(g.rapor):'')+(typeof frBtn==='function'?'<div class="sn-ark">'+yrAllPlayers().filter(p=>p.uid!==yrMe()).map(p=>frBtn(p,true)).join('')+'</div>':'');}
{const O=yrOverHTML;yrOverHTML=function(){
 if(typeof bzOn!=='function'||!bzOn())return O.apply(this,arguments);
 const all=yrAllDone(),r=YarisModel.ranks(yrAllPlayers()),me=yrMe(),g=YR.g,tk=bzTakimMi();
 let kahraman;
 if(!all)kahraman='<section class="sn-kahraman bekle" role="status"><span class="sn-ikon" aria-hidden="true">⏳</span><b>Süren bitti</b><small>Diğer oyuncular bitirince sonuç açıklanır.</small></section>';
 else if(tk){
  const tp=bzTakimPuan(),mt=bzTakimNo(me),kaz=tp[0]===tp[1]?-1:tp[0]>tp[1]?0:1;
  kahraman='<section class="sn-kahraman sn-takim" role="status">'+[0,1].map(i=>'<div class="bz-takim bz-'+BZ.TAKIM[i].renk+(kaz===i?' kazandi':'')+'"><b>'+BZ.TAKIM[i].ikon+' '+BZ.TAKIM[i].ad.replace(' Takımı','')+(mt===i?' (Sen)':'')+'</b><strong>'+tp[i]+'</strong>'+(kaz===i?'<em>🏆 Kazandı</em>':'')+'</div>').join('')+'<p class="sn-takim-sonuc">'+(kaz<0?'Berabere!':kaz===mt?'Takımın kazandı! 🎉':'İyi mücadele!')+'</p></section>';
 }else{const f=r.filter(p=>p.rank===1);kahraman='<section class="sn-kahraman" role="status"><span class="sn-ikon" aria-hidden="true">👑</span><small>'+(f.length>1?'Ortak birinciler':'Birinci')+'</small><b>'+esc(f.map(p=>p.nick).join(', '))+'</b><small>'+(f[0]?f[0].score+' puan':'')+'</small></section>';}
 const ben=r.find(p=>p.uid===me),benY=(all&&ben?'<b>'+ben.rank+'.</b> oldun · ':'')+(g&&g.bz?'<b>'+g.bz.puan+'</b> puan · '+g.ok+' doğru · '+g.bad+' yanlış':'');
 const liste=r.map((p,i)=>snSatir(p,i,me,p.score+' puan'+(p.done?'':(yrLost(p)?' · 📶':' · ⏳')),tk?((BZ.TAKIM[bzTakimNo(p.uid)]||{}).ikon||'')+' ':'')).join('');
 const ey=(all?'<button type="button" class="btn pri sn-rovans" onclick="rvIste()">🔁 Rövanş iste</button>':'')+'<div class="sn-ikili"><button type="button" class="btn" onclick="snAyrinti()">Ayrıntılar</button><button type="button" class="btn" onclick="yrLeave()">Çık</button></div>';
 if(all)setTimeout(rvBasla,0);
 return snIskelet({baslik:bzAd(bzTur(YR.room))+' sonucu',h1:all?'Süre bitti':'Bitirdin',kahraman,ben:benY,liste,eylemler:ey});
};}
/* ---------- 1'e 1 ---------- */
function snDuAyrinti(){const o=duOpp();return (DU&&DU.rapor?sonucGoster(DU.rapor):'')+(YR.room?rkSettingInline(YR.room):'')+(typeof frBtn==='function'&&o?'<div class="sn-ark">'+frBtn(o,true)+'</div>':'');}
duOverHTML=function(){
 const r=DU.result,o=duOpp(),me=DU.sc[0],op=DU.sc[1];
 const t=r==='left'?'Rakip ayrıldı':r==='win'?'Kazandın!':r==='lose'?'İyi mücadele!':'Berabere!';
 const alt=DU.forfeit?'Rakip oyundan çıktı, maçı sen kazandın.':r==='left'?'Bağlantısı koptu; bu maç sayılmadı.':r==='win'?'Tebrikler, '+esc(YR.nick)+'!':r==='lose'?'Rövanşta sen kazanabilirsin!':'İkiniz de iyi oynadınız.';
 const kahraman='<section class="sn-kahraman'+(r==='win'?'':' sn-notr')+'" role="status"><span class="sn-ikon" aria-hidden="true">'+(r==='win'?'🏆':r==='lose'?'💪':r==='left'?'📶':'🤝')+'</span><b>'+t+'</b><div class="sn-skor"><span><small>'+esc(YR.nick)+'</small><strong>'+me+'</strong></span><em>⚔️</em><span><small>'+esc(DU.onick||'Rakip')+'</small><strong>'+op+'</strong></span></div><small>'+alt+'</small></section>';
 let rov='';
 if(DU.left||!o||o.done)rov='<p class="sn-ben">Rakip ayrıldı; rövanş yapılamaz.</p>';
 else if(DU.want)rov='<button class="btn pri sn-rovans" disabled>⏳ '+esc(DU.onick)+' bekleniyor…</button>';
 else rov='<button class="btn pri sn-rovans'+(o&&(o.m|0)===DU.m+1?' sn-titre':'')+'" onclick="duRematch()">🔁 '+(o&&(o.m|0)===DU.m+1?esc(DU.onick)+' rövanş istiyor · Kabul et':'Rövanş iste')+'</button>';
 return yrTop('Kapışma bitti')+'<div class="wrap sn-ekran">'+yrWarnHTML()+'<h1 id="yrHeading" tabindex="-1" class="sn-gizli">'+t+'</h1>'+kahraman+
  '<div class="sn-eylem">'+rov+'<div class="sn-ikili"><button type="button" class="btn" onclick="snAyrinti()">Ayrıntılar</button><button type="button" class="btn" onclick="yrLeave()">Çık</button></div></div></div>';
};
{const O=yrReset;yrReset=function(){rvDur();return O.apply(this,arguments);};}
/* Diğer modüllerin sonuç ekranına eklediği kartlar (Yanlışlarımı çalış, dost puanı) tek sayfayı taşırıyordu:
   yanlışlar alt çubukta küçük düğme, dost puanı "senin sonucun" satırında kısa not olur. Rövanş daveti varken kendi düğmen gizlenir. */
{const O=render;render=function(){
 const r=O.apply(this,arguments);
 try{
  const ek=document.querySelector('#app .sn-ekran');if(!ek)return r;
  const y=ek.querySelector('.yanlis-giris');
  if(y){const b=y.querySelector('button');const ik=ek.querySelector('.sn-ikili');if(b&&ik&&!ik.querySelector('#yanlisAcBtn')){b.className='btn';b.textContent=b.textContent.replace('Yanlışlarımı çalış','Yanlışlar').replace(/[()]/g,'').replace(/\s+/g,' ').trim();ik.insertBefore(b,ik.firstChild);}y.remove();}
  const d=ek.querySelector('.dost-puan-sonuc');
  if(d){const s=d.querySelector('strong');const ben=ek.querySelector('.sn-ben');if(s&&ben&&!ben.querySelector('.sn-dost'))ben.insertAdjacentHTML('beforeend',' · <span class="sn-dost">🐾 '+esc(s.textContent)+'</span>');d.remove();}
  ek.classList.toggle('rv-var',!!RV.oda);
  const b=ek.querySelector('.sn-satir.ben');if(b&&!ek.dataset.kaydi){ek.dataset.kaydi='1';b.scrollIntoView({block:'nearest'});}
 }catch(e){}
 return r;
};}
