/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* 14.11 akşam: Blitz (120 saniye) ve 2'ye 2 (takım Blitz), Hızlı Şef, Kapışma'da "Tüm konular".
   Firestore kuralı değişmez: ikisi de mevcut "race" oda türüdür. Türü rev ön eki taşır: "blitz-…" ya da "takim-…".
   • Tüm konulardan en çok 20 soru; 120 saniye dolunca ya da sorular bitince oyun biter.
   • Doğru = 1 puan; son 20 saniyede doğru = 2 puan. Eşit puanda toplam süresi kısa olan önde.
   • 2'ye 2: 4 kişi; takımlar odadaki oyunculardan kura ile (her telefonda aynı) ayrılır; takım puanı iki oyuncunun toplamı. */
'use strict';
const BZ={SURE:120000,CIFT:20000,tm:null,TAKIM:[{ad:'Ateş Takımı',ikon:'🔥',renk:'ates'},{ad:'Fesleğen Takımı',ikon:'🌿',renk:'feslegen'}]};
function bzTur(r){const m=/^(blitz|takim)-/.exec((r&&r.rev)||'');return m?m[1]:'';}
function bzOn(){return !!(YR.room&&YR.room.mode==='race'&&bzTur(YR.room));}
function bzTakimMi(){return bzOn()&&bzTur(YR.room)==='takim';}
function bzAd(t){return t==='takim'?'2’ye 2 Takım':'Blitz';}
/* Oda sürümü: tür ön eki eklenir; katılan telefon aynı hesabı odadaki rev'den yapar. */
{const O=yrRoomRev;yrRoomRev=function(c){const r=O(c),t=c.bz||bzTur(c);return t&&c.mode==='race'?(t+'-'+r.replace(/^rooms2-/,'')).slice(0,40):r;};}
/* Takımlar: oyuncu kimlikleri oda tohumuyla karıştırılır; her telefonda aynı sonuç. */
function bzHash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function bzTakimlar(){
 const list=YR.players.slice().sort((a,b)=>bzHash(a.uid+'|'+YR.room.seed)-bzHash(b.uid+'|'+YR.room.seed));
 const t=[[],[]];list.forEach((p,i)=>t[i%2].push(p));return t;
}
function bzTakimNo(uid){const t=bzTakimlar();return t[0].some(p=>p.uid===uid)?0:t[1].some(p=>p.uid===uid)?1:-1;}
/* ---------- kurma ---------- */
function bzKur(tur){
 if(YR.busy||!yrConfigured())return;
 yrCreateOpen('race');
 Object.assign(YR.cfg,{mode:'race',subject:'mutfak-araclari',scope:'butun',kind:'gorsel',set:0,n:20,lim:30,bz:tur,pub:true,kilit:false,ad:''});
 yrCreate().finally(()=>{delete YR.cfg.bz;});
}
{const O=yrCreateOpen;yrCreateOpen=function(mode){delete YR.cfg.bz;return O.apply(this,arguments);};}
/* ---------- lobi ---------- */
{const O=lbTur;lbTur=function(r){const t=r.mode==='race'&&bzTur(r);return t==='takim'?'👥 2’ye 2':t==='blitz'?'⏱ Blitz':O(r);};}
{const O=lbCap;lbCap=function(r){return r.mode==='race'&&bzTur(r)==='takim'?4:O(r);};}
{const O=yrStartNeden;yrStartNeden=function(){if(bzTakimMi()&&YR.room.status==='lobby'&&YR.players.length!==4)return '2’ye 2 için tam 4 oyuncu gerekir (şu an '+YR.players.length+').';return O.apply(this,arguments);};}
{const O=yrStart;yrStart=function(){if(bzTakimMi()&&YR.players.length!==4)return;return O.apply(this,arguments);};}
function bzTakimHTML(){
 const t=bzTakimlar(),me=yrMe();
 return '<div class="bz-takimlar">'+t.map((liste,i)=>'<div class="bz-takim bz-'+BZ.TAKIM[i].renk+'"><b>'+BZ.TAKIM[i].ikon+' '+BZ.TAKIM[i].ad+'</b>'+(liste.length?liste.map(p=>'<span>'+esc(p.nick)+(p.uid===me?' (Sen)':'')+'</span>').join(''):'<span class="bz-bos">Oyuncu bekleniyor</span>')+'</div>').join('')+'</div>';
}
{const O=yrLobbyHTML;yrLobbyHTML=function(){
 let h=O.apply(this,arguments);if(!bzOn())return h;
 const tk=bzTakimMi();
 h=h.replace(/(<div class="top[\s\S]*?)Oyun Odası/,'$1'+bzAd(bzTur(YR.room)));
 h=h.replace(/<p class="sub">[^<]*<\/p>/,'<p class="sub bz-kural">⏱ 120 saniye · tüm konular · son 20 saniye çift puan</p>');
 if(tk)h=h.replace('<section class="lb-salon-orta">','<section class="lb-salon-orta">'+bzTakimHTML());
 return h;
};}
/* ---------- oyun ---------- */
function bzKalan(){const g=YR.g;return g&&g.bz?Math.max(0,BZ.SURE-(performance.now()-g.bz.t0)):0;}
function bzCift(){return bzKalan()<=BZ.CIFT;}
function bzSaat(ms){const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
{const O=yrRaceBegin;yrRaceBegin=function(){
 O.apply(this,arguments);if(!bzOn()||!YR.g)return;
 YR.g.bz={t0:performance.now(),puan:0,ciftUyari:false};
 if(BZ.tm)clearInterval(BZ.tm);BZ.tm=setInterval(bzTick,200);render();
};}
function bzTick(){
 const g=YR.g;if(!g||!g.bz||g.done||!bzOn()){clearInterval(BZ.tm);BZ.tm=null;return;}
 const k=bzKalan(),e=document.getElementById('bzSaat');
 if(e){e.textContent=bzSaat(k);e.parentElement.classList.toggle('cift',k<=BZ.CIFT);}
 const f=document.getElementById('bzDolu');if(f)f.style.width=(k/BZ.SURE*100)+'%';
 if(k<=BZ.CIFT&&!g.bz.ciftUyari){g.bz.ciftUyari=true;try{sesEfekt('seri');}catch(x){}const b=document.getElementById('bzUst');if(b)b.classList.add('cift');}
 if(k<=0)bzBitir();
}
{const O=yrRaceAnswer;yrRaceAnswer=function(i){
 const g=YR.g;if(!bzOn()||!g||!g.bz)return O.apply(this,arguments);
 if(g.ph!=='q'||bzKalan()<=0)return;
 const cift=bzCift();O.apply(this,arguments);
 if(g.right){const p=cift?2:1;g.bz.puan+=p;g.bz.son=p;}else g.bz.son=0;
 yrRaceWrite(false);render();
 const k=g.k;setTimeout(()=>{if(YR.g===g&&g.ph==='fb'&&g.k===k&&!g.done)yrRaceNext();},g.right?700:1600);
};}
{const O=yrRaceWrite;yrRaceWrite=function(done){
 const g=YR.g;if(!bzOn()||!g||!g.bz)return O.apply(this,arguments);
 if(!yrTransport||!YR.room)return;
 yrSend({nick:YR.nick,score:Math.min(60,g.bz.puan),ok:g.ok,bad:g.bad,n:Math.min((g.log||[]).length,YR.room.n),tt:Math.round(g.tt),done:!!done,ts:Date.now(),rid:YR.room.created,m:0,r:[],pr:[]});
};}
function bzBitir(){
 const g=YR.g;if(!g||g.done)return;
 if(BZ.tm){clearInterval(BZ.tm);BZ.tm=null;}if(YR.tm){clearInterval(YR.tm);YR.tm=null;}
 g.done=true;g.ph='done';
 try{rutbeComplete({id:'oda-'+YR.room.created,table:['oda',YR.room.subject,YR.room.scope,YR.room.kind,YR.room.set,YR.room.n].join('|'),correct:g.ok,total:Math.max(1,(g.log||[]).length),scope:YR.room.scope});}catch(e){}
 yrRaceWrite(true);
 try{if(typeof oduKazan==='function')oduKazan('oda',null,{ok:g.ok,total:Math.max(1,(g.log||[]).length)});}catch(e){}
 try{g.rapor=sonucUret(bzAd(bzTur(YR.room)),'Tüm konular',['oda',YR.room.subject,YR.room.kind,YR.room.set,YR.room.n].join('|'),g.log,'');}catch(e){}
 try{sesEfekt('sureBitti');}catch(e){}
 st.screen='raceover';render();window.scrollTo(0,0);
}
{const O=yrRaceNext;yrRaceNext=function(){
 const g=YR.g;if(!bzOn()||!g||!g.bz)return O.apply(this,arguments);
 if(g.ph!=='fb')return;
 if(g.k+1>=YR.qs.length||bzKalan()<=0){bzBitir();return;}
 return O.apply(this,arguments);
};}
/* Sıralama: puan, sonra süre. Kendi satırında canlı puan. */
{const O=yrAllPlayers;yrAllPlayers=function(){const l=O.apply(this,arguments);if(!bzOn()||!YR.g||!YR.g.bz)return l;const me=yrMe();return l.map(p=>p.uid===me?{...p,score:YR.g.bz.puan,n:(YR.g.log||[]).length,tt:Math.round(YR.g.tt)}:p);};}
{const O=YarisModel.ranks;YarisModel.ranks=function(players){
 if(!bzOn())return O(players);
 const list=players.filter(p=>p&&typeof p.nick==='string').map(p=>({...p,score:p.score|0,tt:p.tt|0})).sort((a,b)=>b.score-a.score||a.tt-b.tt||String(a.nick).localeCompare(String(b.nick),'tr'));
 return list.map((p,i)=>({...p,rank:i&&list[i-1].score===p.score&&list[i-1].tt===p.tt?list.findIndex(y=>y.score===p.score&&y.tt===p.tt)+1:i+1}));
};}
{const O=yrRankHTML;yrRankHTML=function(compact){
 if(!bzOn())return O.apply(this,arguments);
 const r=YarisModel.ranks(yrAllPlayers()),me=yrMe(),rows=compact?r.filter((p,i)=>i<3||p.uid===me):r;
 return rows.map(p=>'<li class="yr-row'+(p.uid===me?' me':'')+'"><span class="yr-rk">'+p.rank+'.</span><span class="yr-nm">'+(bzTakimMi()?BZ.TAKIM[bzTakimNo(p.uid)]?.ikon+' ':'')+esc(p.nick)+(p.uid===me?' (Sen)':'')+'</span><span class="yr-sc">'+p.score+' puan'+(p.done?' 🏁':'')+'</span></li>').join('');
};}
function bzTakimPuan(){const t=bzTakimlar(),all=yrAllPlayers();return t.map(l=>l.reduce((s,p)=>s+((all.find(x=>x.uid===p.uid)||p).score|0),0));}
{const O=yrRaceHTML;yrRaceHTML=function(){
 let h=O.apply(this,arguments);const g=YR.g;if(!bzOn()||!g||!g.bz)return h;
 const k=bzKalan(),tp=bzTakimMi()?bzTakimPuan():null,mt=bzTakimMi()?bzTakimNo(yrMe()):-1;
 const ust='<div class="bz-ust'+(k<=BZ.CIFT?' cift':'')+'" id="bzUst"><div class="bz-saat"><span aria-hidden="true">⏱</span><b id="bzSaat">'+bzSaat(k)+'</b></div><div class="bz-puan"><b>'+g.bz.puan+'</b> puan</div>'+
  (tp?'<div class="bz-tp"><span class="bz-ates'+(mt===0?' ben':'')+'">🔥 '+tp[0]+'</span><span class="bz-feslegen'+(mt===1?' ben':'')+'">🌿 '+tp[1]+'</span></div>':'')+
  '<div class="bz-cift-yazi">🔥 Çift puan!</div><div class="bz-cubuk"><div id="bzDolu" style="width:'+(k/BZ.SURE*100)+'%"></div></div></div>';
 h=h.replace(/<p class="yr-prog"[^>]*>[\s\S]*?<\/p>/,ust);
 h=h.replace(/<div class="yr-bar"[\s\S]*?<p class="yr-sec" id="yrSec">[^<]*<\/p>/,'');
 if(g.ph==='fb'&&g.right&&g.bz.son===2)h=h.replace('<div class="yr-fb ok" role="status"><b>','<div class="yr-fb ok" role="status"><b>+2 · ');
 return h;
};}
{const O=yrTick;yrTick=function(){if(bzOn()&&YR.g&&YR.g.bz){const g=YR.g;if(g.ph==='q'&&performance.now()-g.t0>=YR.room.lim*1000)yrRaceAnswer(-1);return;}return O.apply(this,arguments);};}
{const O=yrOverHTML;yrOverHTML=function(){
 if(!bzOn())return O.apply(this,arguments);
 const all=yrAllDone(),r=YarisModel.ranks(yrAllPlayers()),me=yrMe(),med=['🥇','🥈','🥉'],g=YR.g,tk=bzTakimMi();
 let h=yrTop(bzAd(bzTur(YR.room)))+'<div class="wrap bz-son">'+yrWarnHTML()+'<h1 id="yrHeading" tabindex="-1">'+(all?'⏱ Süre bitti!':'Bitirdin!')+'</h1>';
 if(tk){
  const tp=bzTakimPuan(),mt=bzTakimNo(me),kaz=tp[0]===tp[1]?-1:tp[0]>tp[1]?0:1;
  h+='<section class="bz-takim-son">'+[0,1].map(i=>'<div class="bz-takim bz-'+BZ.TAKIM[i].renk+(all&&kaz===i?' kazandi':'')+'"><b>'+BZ.TAKIM[i].ikon+' '+BZ.TAKIM[i].ad+(mt===i?' (Sen)':'')+'</b><strong>'+tp[i]+'</strong><span>puan</span>'+(all&&kaz===i?'<em>🏆 Kazandı</em>':'')+'</div>').join('')+'</section>'+
   (all?'<p class="bz-sonuc" role="status">'+(kaz<0?'Berabere! İki takım da iyi oynadı.':kaz===mt?'Takımın kazandı! 🎉':'İyi mücadele! Rövanşta sizin olabilir.')+'</p>':'<p class="sub" role="status">Diğer oyuncular bitirince sonuç kesinleşir.</p>');
 }
 if(g&&g.bz)h+='<p class="card"><b>'+g.bz.puan+' puan</b> · '+g.ok+' doğru · '+g.bad+' yanlış</p>';
 h+='<ol class="yr-list yr-podium">'+r.map(p=>'<li class="yr-row'+(p.uid===me?' me':'')+'"><span class="yr-rk">'+(all&&p.rank<=3?med[p.rank-1]:p.rank+'.')+'</span><span class="yr-nm">'+(tk?(BZ.TAKIM[bzTakimNo(p.uid)]||{}).ikon+' ':'')+esc(p.nick)+(p.uid===me?' (Sen)':(typeof frBtn==='function'?frBtn(p,false):''))+'</span><span class="yr-sc">'+p.score+' puan'+(p.done?'':(yrLost(p)?' · 📶':' · ⏳'))+'</span></li>').join('')+'</ol>';
 if(g&&g.rapor)h+=sonucGoster(g.rapor);
 h+='<button class="btn pri" onclick="bzRovans()">🔁 Rövanş: yeni '+bzAd(bzTur(YR.room))+'</button><button class="btn" onclick="yrLeave()">Çık</button></div>';
 return h;
};}
window.bzRovans=function(){const t=bzTur(YR.room);yrLeaveNow();bzKur(t);};
{const O=yrReset;yrReset=function(){if(BZ.tm){clearInterval(BZ.tm);BZ.tm=null;}return O.apply(this,arguments);};}
/* ---------- Hızlı Şef ---------- */
const HS_MODLAR=[
 {id:'duel',ikon:'⚔️',ad:'1’e 1',not:'İki kişi, aynı soru; önce doğru basan alır'},
 {id:'takim',ikon:'👥',ad:'2’ye 2',not:'Dört kişi, iki takım · 120 saniye'},
 {id:'blitz',ikon:'⏱',ad:'Blitz',not:'2–8 kişi · 120 saniye · son 20 sn çift puan'},
 {id:'arena',ikon:'🏟',ad:'Er Meydanı',not:'3–10 kişi · 12 yanlışta biter'}
];
function hsUygun(id,r){
 if(r.kilit||lbSay(r)>=lbCap(r))return false;
 if(id==='duel')return r.mode==='duel';
 if(id==='arena')return r.mode==='arena';
 return r.mode==='race'&&bzTur(r)===id;
}
window.lbHizli=function(){
 if(YR.busy||!yrConfigured())return;
 if(document.getElementById('hsfPanel'))return;
 const k=document.createElement('div');k.id='hsfPanel';k.className='foot-menu';k.setAttribute('role','dialog');k.setAttribute('aria-modal','true');k.setAttribute('aria-label','Hızlı Şef');
 k.innerHTML='<div class="foot-menu-ic hsf-ic"><h2>👨‍🍳 Hızlı Şef</h2><p class="hsf-alt">Bir mod seç. Açık oda varsa hemen katılırsın; yoksa yeni oda kurulur.</p><div class="hsf-liste">'+
  HS_MODLAR.map(m=>{const n=(LB.liste||[]).filter(r=>hsUygun(m.id,r)).length;return '<button type="button" class="hsf-mod hsf-'+m.id+'" data-m="'+m.id+'"><span class="hsf-ikon" aria-hidden="true">'+m.ikon+'</span><span class="hsf-ad"><b>'+m.ad+'</b><small>'+m.not+'</small></span><span class="hsf-oda">'+(n?n+' açık oda':'Yeni oda')+'</span></button>';}).join('')+
  '</div><button type="button" class="btn" id="hsfKapat">Vazgeç</button></div>';
 document.body.appendChild(k);
 const kapat=()=>k.remove();
 k.addEventListener('click',e=>{if(e.target===k)kapat();});k.querySelector('#hsfKapat').onclick=kapat;
 k.querySelectorAll('.hsf-mod').forEach(b=>{b.onclick=()=>{kapat();hsfBasla(b.dataset.m);};});
 k.querySelector('.hsf-mod').focus();
 try{sesEfekt('ac');}catch(e){}
};
function hsfBasla(id){
 try{sesEfekt('basla');}catch(e){}
 const uygun=(LB.liste||[]).filter(r=>hsUygun(id,r)).sort((a,b)=>lbSay(b)-lbSay(a));
 if(uygun.length){yrJoin(uygun[0].code);return;}
 if(id==='takim'||id==='blitz'){bzKur(id);return;}
 if(id==='arena'){yrCreateOpen('arena');Object.assign(YR.cfg,{pub:true,kilit:false,ad:''});yrCreate();return;}
 yrCreateOpen('duel');Object.assign(YR.cfg,{subject:'mutfak-araclari',scope:'butun',kind:'gorsel',set:0,n:10,lim:20,pub:true,kilit:false,ad:''});yrCreate();
}
/* ---------- Kapışma ve Oyun Odası: Konu satırında "Tüm konular" ---------- */
{const O=yrCreateHTML;yrCreateHTML=function(){
 let h=O.apply(this,arguments);const c=YR.cfg;
 if(c.mode!=='duel'&&c.mode!=='race'&&c.mode!=='canavar')return h;
 const tum=c.scope==='butun';
 h=h.replace('<h2>Konu</h2><div class="yr-chips">','<h2>Konu</h2><div class="yr-chips"><button class="yr-chip'+(tum?' on':'')+'" aria-pressed="'+tum+'" onclick="yrCfg(\'scope\',\'butun\')">Tüm konular</button>');
 if(tum){
  h=h.replace(/(<h2>Konu<\/h2><div class="yr-chips">[\s\S]*?<\/div>)/,m=>m.replace(/class="yr-chip on" onclick="yrCfg\('subject'/g,'class="yr-chip" onclick="yrCfg(\'subject\''));
  h=h.replace(/<h2>Kapsam<\/h2><div class="yr-chips">[\s\S]*?<\/div>/,'');
  h=h.replace(/<h2>(Kuver türü|Sorular)<\/h2><div class="yr-chips">[\s\S]*?<\/div>/,'');
 }
 return h;
};}
{const O=yrCfg;yrCfg=function(k,v){
 if(k==='subject'&&YR.cfg.scope==='butun')YR.cfg.scope='tek';
 if(k==='scope'&&v==='butun')Object.assign(YR.cfg,{subject:YR.cfg.subject==='kuver'?'mutfak-araclari':YR.cfg.subject,kind:'gorsel',set:0});
 return O.apply(this,arguments);
};}
{const O=yrLabel;yrLabel=function(r){return r&&r.mode==='race'&&bzTur(r)?'Tüm konular · 120 saniye':O.apply(this,arguments);};}
