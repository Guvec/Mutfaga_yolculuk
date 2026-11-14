/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* 14.11 akşam (onaylı yapı): Ustalar Ligi ana ekranı.
   Hızlı Şef (birincil) → 2×2 mod karosu (dokununca: Hızlı eşleş / Arkadaşlarınla oda kur) → Tek başına: Antrenman Şefi
   → Açık odalar (🔒 şifreli; dokununca şifre sorulur) + "Kodun var mı?" → Ustalık Ligi kilit şeridi.
   Aynı oyuna iki ayrı kapı kalmadı: her mod tek karoda. 360×640'ta kaydırmasız. */
'use strict';
const LM_MODLAR=[
 {id:'duel',ikon:'⚔️',ad:'1’e 1',kisa:'2 kişi · 20 soru'},
 {id:'takim',ikon:'👥',ad:'2’ye 2',kisa:'4 kişi · 120 sn'},
 {id:'blitz',ikon:'⏱',ad:'Blitz',kisa:'2–8 kişi · 120 sn'},
 {id:'arena',ikon:'🏟',ad:'Er Meydanı',kisa:'3–10 kişi · 12 yanlış'}
];
function lmAcikSay(id){return (LB.liste||[]).filter(r=>hsUygun(id,r)).length;}
yrMenuHTML=function(){
 const cfg=yrConfigured(),code=YR.codeDraft||new URLSearchParams(location.search).get('oda')||'';
 let h=yrTop('Ustalar Ligi')+'<div class="wrap lb-ekran lm-ekran"><div class="lm-bas"><img class="lm-logo" src="assets/lig/ustalar-ligi.webp" alt=""><div class="lm-bas-yazi"><h1>Ustalar Ligi</h1><small>🌱 Ümit Ligi · herkese açık</small></div><button type="button" class="lm-sira" onclick="rkOpenBoard(\'oy-kapisma\')" aria-label="Sıralama">🏅</button></div>';
 if(LB.sifre){
  return h+'<section class="card lb-sifre"><h2>🔒 Bu oda şifreli</h2><p>Şifreyi odayı kuran arkadaşından öğren.</p><input id="lbSifre" class="inp" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="4 rakamlı şifre" placeholder="• • • •" onkeydown="if(event.key===\'Enter\')lbSifreGonder()"><div class="row"><button class="btn" onclick="lbSifreIptal()">Vazgeç</button><button class="btn pri" onclick="lbSifreGonder()"'+(YR.busy?' disabled':'')+'>Odaya gir</button></div>'+yrErr()+'</section></div>';
 }
 h+='<button type="button" class="lm-hizli" onclick="lbHizli()"'+(cfg&&!YR.busy?'':' disabled')+'><span class="lm-hizli-ikon" aria-hidden="true">👨‍🍳</span><span class="lm-hizli-yazi"><b>Hızlı Şef</b><small>Tek dokunuşla açık bir maça katıl</small></span><span class="lm-ok" aria-hidden="true">›</span></button>';
 h+='<div class="lm-karolar">'+LM_MODLAR.map(m=>{const n=cfg?lmAcikSay(m.id):0;return '<button type="button" class="lm-karo lm-'+m.id+'" onclick="lmMod(\''+m.id+'\')"'+(cfg?'':' disabled')+'><span class="lm-karo-ikon" aria-hidden="true">'+m.ikon+'</span><b>'+m.ad+'</b><small>'+m.kisa+'</small>'+(n?'<em>'+n+' açık</em>':'')+'</button>';}).join('')+'</div>';
 h+='<button type="button" class="lm-tek" onclick="antAc()"><span aria-hidden="true">🤖</span><span><b>Antrenman Şefi</b><small>Tek başına · bilgisayara karşı</small></span><span class="lm-ok" aria-hidden="true">›</span></button>';
 const boy=lbSayfaBoy(),ss=Math.max(1,Math.ceil(LB.liste.length/boy));LB.sayfa=Math.max(0,Math.min(ss-1,LB.sayfa));
 h+='<section class="lb-liste lm-liste" aria-label="Açık odalar"><div class="lm-liste-bas"><h2>Açık odalar'+(LB.liste.length?' ('+LB.liste.length+')':'')+'</h2><button type="button" class="lm-kod-ac" onclick="lbKodAc()" aria-expanded="'+!!(LB.kod||code)+'">Kodun var mı?</button></div>';
 if(LB.kod||code)h+='<div class="lb-kod"><input id="yrCode" class="inp" maxlength="10" autocapitalize="characters" autocomplete="off" aria-label="Oda kodu" placeholder="Oda kodu" value="'+esc(String(code).toUpperCase())+'" oninput="YR.codeDraft=this.value" onkeydown="if(event.key===\'Enter\')yrJoin()"><button class="btn pri" onclick="yrJoin()"'+(cfg&&!YR.busy?'':' disabled')+'>Gir</button></div>';
 if(YR.notice&&!YR.active)h+='<p class="lb-durum" role="status">'+esc(YR.notice)+'</p>';
 if(!cfg)h+='<p class="lb-bos">Oda bağlantısı ayarlanmadı.</p>';
 else if(!navigator.onLine)h+='<p class="lb-bos">Odaları görmek için internet gerekiyor.</p>';
 else if(LB.hata==='izin')h+='<p class="lb-bos">Oda listesi açılamadı. Bir karodan oda kurabilirsin.</p>';
 else if(LB.hata)h+='<p class="lb-bos">Odalara bağlanılamadı. <button class="btn sm" onclick="LB.hata=\'\';lbBaslat();render()">Yeniden dene</button></p>';
 else if(!LB.ilk)h+='<p class="lb-bos" role="status">Odalar yükleniyor…</p>';
 else if(!LB.liste.length)h+='<p class="lb-bos">Şu an açık oda yok. Hızlı Şef ile ilk odayı sen aç!</p>';
 else{
  h+='<div class="lb-izgara">'+LB.liste.slice(LB.sayfa*boy,LB.sayfa*boy+boy).map(lbOdaKutu).join('')+'</div>';
  if(ss>1)h+='<nav class="lb-sayfala" aria-label="Sayfalar"><button class="btn sm" onclick="lbSayfa(-1)"'+(LB.sayfa?'':' disabled')+'>‹</button><span>'+(LB.sayfa+1)+' / '+ss+'</span><button class="btn sm" onclick="lbSayfa(1)"'+(LB.sayfa<ss-1?'':' disabled')+'>›</button></nav>';
 }
 h+='</section>'+yrErr();
 const k=typeof svSeviye==='function'&&typeof svPid==='function'&&svPid()?svSeviye():1,acik=typeof SV!=='undefined'&&k>=SV.ac.kabul;
 h+='<details class="lm-ustalik'+(acik?' acik':'')+'"><summary><span aria-hidden="true">🏆</span><b>Ustalık Ligi</b><span class="lm-kilit">'+(acik?'yakında':'🔒 Seviye 10')+'</span><span class="lm-ok" aria-hidden="true">›</span></summary>'+
  '<p>Lig puanı ve sezon ödülü veren maçlar. Herkes kendi düzeyindekilerle yarışsın diye iki şart var:</p><ul><li>'+(acik?'✅':'⬜')+' Aşçı Seviyesi 10 <small>(şu an '+k+')</small></li><li>⬜ Mutfağa Kabul Sınavı (5 yerleştirme maçı)</li></ul><p class="lm-not">Ümit Ligi maçlarını her zaman oynayabilirsin.</p></details>';
 return h+'</div>';
};
/* Karo → kısa pencere: Hızlı eşleş ya da Arkadaşlarınla oda kur. */
window.lmMod=function(id){
 const m=LM_MODLAR.find(x=>x.id===id);if(!m||document.getElementById('lmPanel'))return;
 const n=lmAcikSay(id);
 const k=document.createElement('div');k.id='lmPanel';k.className='foot-menu';k.setAttribute('role','dialog');k.setAttribute('aria-modal','true');k.setAttribute('aria-label',m.ad);
 k.innerHTML='<div class="foot-menu-ic lm-panel lm-'+id+'"><h2><span aria-hidden="true">'+m.ikon+'</span> '+m.ad+'</h2><p class="lm-panel-alt">'+({duel:'İki kişi aynı soruyu görür; önce doğru basan puanı alır.',takim:'İki takım, 120 saniye. Takım puanı iki oyuncunun toplamıdır. Son 20 saniye çift puan.',blitz:'120 saniyede en çok puanı toplayan kazanır. Son 20 saniye çift puan.',arena:'Herkes kendi hızında; 12 yanlışta denemen biter. En çok puan kazanır.'}[id])+'</p>'+
  '<button type="button" class="lm-secim" data-s="hizli"><span aria-hidden="true">⚡</span><span><b>Hızlı eşleş</b><small>'+(n?n+' açık oda var, hemen katıl':'Açık oda yok; herkese açık oda kurulur')+'</small></span></button>'+
  '<button type="button" class="lm-secim" data-s="oda"><span aria-hidden="true">👫</span><span><b>Arkadaşlarınla oda kur</b><small>'+(id==='duel'||id==='arena'?'Konu, süre, şifre senin seçimin':'Kodu arkadaşlarına söyle; listede görünmez')+'</small></span></button>'+
  '<button type="button" class="btn" id="lmKapat">Vazgeç</button></div>';
 document.body.appendChild(k);const kapat=()=>k.remove();
 k.addEventListener('click',e=>{if(e.target===k)kapat();});k.querySelector('#lmKapat').onclick=kapat;
 k.querySelectorAll('.lm-secim').forEach(b=>{b.onclick=()=>{kapat();if(b.dataset.s==='hizli')hsfBasla(id);else lmOdaKur(id);};});
 k.querySelector('.lm-secim').focus();try{sesEfekt('ac');}catch(e){}
};
function lmOdaKur(id){
 if(id==='duel'||id==='arena'){yrCreateOpen(id);return;}
 if(YR.busy||!yrConfigured())return;
 yrCreateOpen('race');
 Object.assign(YR.cfg,{mode:'race',subject:'mutfak-araclari',scope:'butun',kind:'gorsel',set:0,n:20,lim:30,bz:id,pub:false,kilit:false,ad:''});
 yrCreate().finally(()=>{delete YR.cfg.bz;});
}
