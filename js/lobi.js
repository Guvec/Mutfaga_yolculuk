/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Birlikte Oyna lobisi (12.11): açık odalar listesi, oda kodu ile giriş, şifreli oda.
   Liste Firestore'dan canlı gelir (yalnız "listede görünsün" seçilen ve başlamamış odalar).
   Kurallar yayımlanmadıysa liste yerine kısa not çıkar; "Oda kur" ve "Kodla gir" çalışmaya devam eder.
   Şifre 4 rakamdır, odanın gizli/sifre belgesinde durur; öğrenci okuyamaz, giriş kontrolünü kurallar yapar. */
'use strict';
const LB={liste:[],hata:'',unsub:null,bekliyor:false,sayfa:0,kod:false,sifre:null};
const LB_ADLAR=['Hızlılar','Şefler','Mutfak Ekibi','Sınıf yarışı','Tatlıcılar','Servis Ekibi'];
function lbCap(r){return r.mode==='duel'?2:r.mode==='arena'?(typeof ArenaModel!=='undefined'?ArenaModel.maxPlayers(r):10):((YarisModel.LIMITS[r.mode]||{}).max||8);}
function lbSay(r){return r.mode==='duel'?(r.guest?2:1):(r.cnt||1);}
function lbTur(r){return r.mode==='duel'?'⚔️ 1’e 1 Kapışma':r.mode==='arena'?'🏟 Er Meydanı':'🏁 Yarış';}
function lbBaslat(){
 if(LB.unsub||LB.bekliyor||!yrConfigured()||!navigator.onLine)return;
 LB.bekliyor=true;
 yrService().watchList(rooms=>{
  const simdi=Date.now();
  LB.liste=rooms.filter(r=>r.created&&simdi-r.created<3*3600000&&lbSay(r)<lbCap(r)).sort((a,b)=>b.created-a.created);
  LB.hata='';LB.ilk=true;if(st.screen==='racemenu'&&!LB.sifre)render();
 },e=>{LB.hata=/permission|insufficient/i.test(String(e&&e.message))?'izin':'baglanti';LB.unsub=null;if(st.screen==='racemenu')render();})
  .then(u=>{LB.unsub=u;if(st.screen!=='racemenu')lbDurdur();})
  .catch(()=>{LB.hata='baglanti';if(st.screen==='racemenu')render();})
  .finally(()=>{LB.bekliyor=false;});
}
function lbDurdur(){if(LB.unsub){try{LB.unsub();}catch(e){}LB.unsub=null;}}
/* Sayfadaki oda sayısı ekrana göre ölçülür: liste alanına sığan kadar kart (en az 1). */
function lbSayfaBoy(){return LB.boy||(innerWidth>=700?4:3);}
function lbOlc(){
 const alan=document.querySelector('.lb-liste'),kart=document.querySelector('.lb-oda');if(!alan||!kart)return;
 const sut=getComputedStyle(document.querySelector('.lb-izgara')).gridTemplateColumns.split(' ').length||1;
 const bos=alan.clientHeight-(alan.querySelector('h2')?.offsetHeight||0)-6,k=kart.offsetHeight+6,hepsi=Math.floor((bos+6)/k)*sut;
 const boy=LB.liste.length<=hepsi?Math.max(1,hepsi):Math.max(1,Math.floor((bos-54+6)/k))*sut;
 if(boy!==LB.boy){LB.boy=boy;render();}
}
window.lbSayfa=function(d){LB.sayfa+=d;render();};
window.lbKodAc=function(){LB.kod=!LB.kod;render();if(LB.kod)setTimeout(()=>document.getElementById('yrCode')?.focus(),0);};
window.lbGir=function(code){const r=LB.liste.find(x=>x.code===code);if(r&&r.kilit){lbSifreSor(code);return;}yrJoin(code);};
function lbSifreSor(code,invite){LB.sifre={code,invite};render();setTimeout(()=>document.getElementById('lbSifre')?.focus(),0);}
window.lbSifreGonder=function(){const el=document.getElementById('lbSifre'),v=String(el?el.value:'').replace(/\D/g,'');if(!/^[0-9]{4}$/.test(v)){YR.error='Şifre 4 rakam olmalı.';render();return;}const s=LB.sifre;LB.sifre=null;yrJoin(s.code,s.invite,v);};
window.lbSifreIptal=function(){LB.sifre=null;YR.error='';render();};
function lbOdaKutu(r){
 const ad=r.ad||((r.hostNick||'Oda')+' ile oyna');
 return '<button type="button" class="lb-oda" onclick="lbGir(\''+esc(r.code)+'\')" aria-label="'+esc(ad+'. '+lbTur(r).replace(/^\S+ /,'')+'. '+yrLabel(r)+'. '+lbSay(r)+' / '+lbCap(r)+' kişi'+(r.kilit?'. Şifreli':''))+'">'+
  '<b>'+(r.kilit?'🔒 ':'')+esc(ad)+'<em>'+lbSay(r)+' / '+lbCap(r)+'</em></b><span>'+esc(lbTur(r))+' · '+esc(yrLabel(r))+'</span><small>👤 '+esc(r.hostNick||'')+'</small></button>';
}
yrMenuHTML=function(){
 const cfg=yrConfigured(),code=YR.codeDraft||new URLSearchParams(location.search).get('oda')||'';
 let h=yrTop('Birlikte Oyna')+'<div class="wrap lb-ekran"><div class="lb-bas"><div><h1>Birlikte Oyna</h1><p class="sub">'+(yrHasName()?'Oyundaki adın: <b>'+esc(yrNickGet())+'</b>':'Odaya girerken sana bir oyun adı verilir.')+'</p></div><button class="btn sm lb-sira" onclick="rkOpenBoard(\'oy-kapisma\')" aria-label="Kapışma ve Er Meydanı sıralaması">🏅 Sıralama</button></div>';
 if(LB.sifre){
  return h+'<section class="card lb-sifre"><h2>Bu oda şifreli</h2><p>Oda kodu: <b>'+esc(LB.sifre.code)+'</b>. Şifreyi odayı kuran arkadaşından öğren.</p><input id="lbSifre" class="inp" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="4 rakamlı şifre" placeholder="• • • •" onkeydown="if(event.key===\'Enter\')lbSifreGonder()"><div class="row"><button class="btn" onclick="lbSifreIptal()">Vazgeç</button><button class="btn pri" onclick="lbSifreGonder()"'+(YR.busy?' disabled':'')+'>Odaya gir</button></div>'+yrErr()+'</section></div>';
 }
 h+='<div class="lb-eylem">'+
  '<button class="btn pri" onclick="yrCreateOpen(\'duel\')"'+(cfg?'':' disabled')+'>⚔️ Kapışma kur</button>'+
  '<button class="btn pri" onclick="yrCreateOpen(\'arena\')"'+(cfg?'':' disabled')+'>🏟 Er Meydanı kur</button>'+
  '<button class="btn" onclick="lbKodAc()" aria-expanded="'+LB.kod+'"'+(cfg?'':' disabled')+'>🔑 Kodla gir</button>'+
  '<button class="btn" onclick="yrCreateOpen(\'canavar\')">🎯 Meydan Okuma</button></div>';
 if(LB.kod||code)h+='<div class="lb-kod"><input id="yrCode" class="inp" maxlength="10" autocapitalize="characters" autocomplete="off" aria-label="Oda kodu" placeholder="Oda kodu" value="'+esc(String(code).toUpperCase())+'" oninput="YR.codeDraft=this.value" onkeydown="if(event.key===\'Enter\')yrJoin()"><button class="btn pri" onclick="yrJoin()"'+(cfg&&!YR.busy?'':' disabled')+'>Gir</button></div>';
 const boy=lbSayfaBoy(),ss=Math.max(1,Math.ceil(LB.liste.length/boy));LB.sayfa=Math.max(0,Math.min(ss-1,LB.sayfa));
 h+='<section class="lb-liste" aria-label="Açık odalar"><h2>Açık odalar'+(LB.liste.length?' ('+LB.liste.length+')':'')+'</h2>';
 if(!cfg)h+='<p class="lb-bos">Oda bağlantısı ayarlanmadı.</p>';
 else if(!navigator.onLine)h+='<p class="lb-bos">Odaları görmek için internet gerekiyor.</p>';
 else if(LB.hata==='izin')h+='<p class="lb-bos">Oda listesi henüz açılmadı. Oda kurabilir ya da kodla girebilirsin.</p>';
 else if(LB.hata)h+='<p class="lb-bos">Odalara bağlanılamadı. <button class="btn sm" onclick="LB.hata=\'\';lbBaslat();render()">Yeniden dene</button></p>';
 else if(!LB.ilk)h+='<p class="lb-bos" role="status">Odalar yükleniyor…</p>';
 else if(!LB.liste.length)h+='<p class="lb-bos">Şu an açık oda yok. İlk odayı sen kur!</p>';
 else{
  h+='<div class="lb-izgara">'+LB.liste.slice(LB.sayfa*boy,LB.sayfa*boy+boy).map(lbOdaKutu).join('')+'</div>';
  if(ss>1)h+='<nav class="lb-sayfala" aria-label="Sayfalar"><button class="btn sm" onclick="lbSayfa(-1)"'+(LB.sayfa?'':' disabled')+'>‹ Önceki</button><span>'+(LB.sayfa+1)+' / '+ss+'</span><button class="btn sm" onclick="lbSayfa(1)"'+(LB.sayfa<ss-1?'':' disabled')+'>Sonraki ›</button></nav>';
 }
 h+='</section>'+yrErr()+'</div>';
 return h;
};
/* Oda kurma ekranına "Oda" bölümü: ad, listede görünme, şifre. Meydan Okuma (tek kişilik) için gösterilmez. */
window.lbAdim=function(n){YR.cfg.adim=n;render();window.scrollTo(0,0);};
window.lbCfg=function(k,v){YR.cfg[k]=v;if(k==='kilit'&&v&&!/^[0-9]{4}$/.test(String(YR.cfg.sifre||'')))YR.cfg.sifre=String(1000+crypto.getRandomValues(new Uint16Array(1))[0]%9000);render();};
function lbOdaAyarHTML(){
 const c=YR.cfg,nick=yrNickGet()||'Oda',adlar=[nick+' ile oyna',...LB_ADLAR],ad=c.ad&&adlar.includes(c.ad)?c.ad:adlar[0];c.ad=ad;
 const ch=(on,txt,js)=>'<button type="button" class="yr-chip'+(on?' on':'')+'" onclick="'+js+'">'+esc(txt)+'</button>';
 const ai=adlar.indexOf(ad),ok=(d)=>"lbCfg('ad',"+JSON.stringify(adlar[(ai+d+adlar.length)%adlar.length]).replace(/"/g,'&quot;')+")";
 return '<section class="lb-ayar"><h2>Oda adı</h2><div class="lb-ad-sec"><button type="button" class="btn sm" onclick="'+ok(-1)+'" aria-label="Önceki ad">‹</button><b aria-live="polite">'+esc(ad)+'</b><button type="button" class="btn sm" onclick="'+ok(1)+'" aria-label="Sonraki ad">›</button></div>'+
  '<h2>Kimler görsün?</h2><div class="yr-chips">'+ch(c.pub!==false,'Listede görünsün',"lbCfg('pub',true)")+ch(c.pub===false,'Yalnız kodla girilsin',"lbCfg('pub',false)")+'</div>'+
  '<h2>Şifre'+(c.kilit?' <small>(arkadaşlarına söyle)</small>':'')+'</h2><div class="yr-chips lb-sifre-sat">'+ch(!c.kilit,'Şifresiz',"lbCfg('kilit',false)")+ch(!!c.kilit,'🔒 Şifreli',"lbCfg('kilit',true)")+
  (c.kilit?'<input class="inp lb-sifre-inp" inputmode="numeric" pattern="[0-9]*" maxlength="4" aria-label="4 rakamlı şifre" value="'+esc(c.sifre||'')+'" oninput="YR.cfg.sifre=this.value.replace(/\\D/g,\'\').slice(0,4)">':'')+'</div></section>';
}
{
 const LB_RENDER=render;
 render=function(){
  LB_RENDER();
  if(st.screen==='racemenu'){lbBaslat();requestAnimationFrame(lbOlc);}else{lbDurdur();if(st.screen!=='racemenu')LB.sifre=null;}
  const app=document.getElementById('app');if(!app)return;
  /* Oda kurma iki adımda, kaydırmasız: 1) oyun ayarları → "Devam" 2) oda adı, görünürlük, şifre → "Odayı kur". */
  if(st.screen==='racecreate'&&YR.cfg.mode!=='canavar'&&!app.querySelector('.lb-ayar')){
   const wrap=app.querySelector('.wrap'),b=[...app.querySelectorAll('button')].find(x=>/yrCreate\(\)/.test(x.getAttribute('onclick')||''));
   if(wrap&&b){
    b.classList.add('lb-kur-btn');
    [...wrap.children].forEach(el=>{if(el.tagName==='H2'&&/Maç uzunluğu|süre/i.test(el.textContent)){el.classList.add('lb-s2');const n=el.nextElementSibling;if(n&&n.tagName!=='H2')n.classList.add('lb-s2');}});
    if(YR.cfg.adim===2){
     wrap.classList.add('lb-adim2');
     b.insertAdjacentHTML('beforebegin','<p class="lb-adim-bas"><b>2 / 2 · Oda</b><button type="button" class="btn sm" onclick="lbAdim(1)">‹ Oyun ayarları</button></p>'+lbOdaAyarHTML());
    }else{
     wrap.classList.add('lb-adim1');
     b.insertAdjacentHTML('beforebegin','<div class="lb-ayar lb-gizli"></div><button type="button" class="btn pri lb-devam" onclick="lbAdim(2)">Devam › <small>2 / 2 · Süre, oda adı ve şifre</small></button>');
    }
   }
  }
  if(st.screen==='racelobby'&&YR.room&&YR.room.kilit&&!YR.sifre&&!YR.sifreAliniyor&&YR.code){YR.sifreAliniyor=true;yrService().secretGet(YR.code).then(s=>{YR.sifreAliniyor=false;if(s){YR.sifre=s;if(st.screen==='racelobby')render();}});}
 };
 const LB_BACK=back;
 back=function(){if(st.screen==='racelobby'&&LB.arkadas){LB.arkadas=false;render();return;}if(st.screen==='racecreate'&&YR.cfg.adim===2){lbAdim(1);return;}if(st.screen==='racemenu'&&LB.sifre){lbSifreIptal();return;}if(st.screen==='racemenu'&&LB.kod){LB.kod=false;render();return;}LB_BACK();};
 window.addEventListener('online',()=>{if(st.screen==='racemenu')render();});
}

{const LB_KUR=yrCreateOpen;yrCreateOpen=function(mode){YR.cfg.adim=1;return LB_KUR(mode);};}

/* Oda içi (salon) tek ekran: oda bilgisi, oyuncular ızgarada, arkadaş çağırma iç içe açılır, düğmeler altta. */
window.lbArkadas=function(a){LB.arkadas=a;render();};
yrLobbyHTML=function(){
 const r=YR.room,duel=r.mode==='duel',arena=r.mode==='arena',cap=arena?ArenaModel.maxPlayers(r):YarisModel.LIMITS[r.mode].max;
 let h=yrTop(duel?'1’e 1 Kapışma':arena?'Er Meydanı':'Oyun Odası')+'<div class="wrap lb-salon">'+
  '<div class="lb-salon-bas"><h1 id="yrHeading" tabindex="-1">'+esc(r.ad||(duel?'Rakip bekleniyor':'Oyuncular geliyor'))+'</h1><p class="sub">'+esc(yrLabel(r))+' · '+r.n+' soru · '+r.lim+' sn</p></div>'+
  '<p class="lb-oda-bilgi"><span>Oda kodu: <b>'+esc(YR.code)+'</b></span>'+(r.kilit?'<span>🔒 Şifre: <b>'+esc(YR.sifre||'••••')+'</b></span>':'')+'<span>'+(r.pub===false?'Yalnız kodla':'Listede görünüyor')+'</span></p>';
 const arkOk=typeof frLobbyHTML==='function'&&frLobbyHTML();
 if(LB.arkadas&&arkOk){
  h+='<section class="lb-salon-orta">'+frLobbyHTML()+'<button class="btn sm" onclick="lbArkadas(false)">‹ Oyunculara dön</button></section>';
 }else{
  h+='<section class="lb-salon-orta"><div class="lb-salon-h"><h2>Oyuncular ('+YR.players.length+'/'+cap+')</h2>'+(arkOk?'<button class="btn sm" onclick="lbArkadas(true)">👫 Arkadaş çağır</button>':'')+'</div><ul class="yr-list lb-oyuncular" id="yrList">'+yrPlayersListHTML().replace(/<span class="yr-sc">Hazır<\/span>/g,'<span class="yr-sc lb-hazir" title="Hazır" aria-label="Hazır">✓</span>').replace(/<span class="yr-sc">Bekliyor<\/span>/g,'<span class="yr-sc lb-bekliyor" title="Bekliyor" aria-label="Bekliyor">⏳</span>')+'</ul></section>';
 }
 const durum=duel?(YR.players.length<2?'Rakip bekleniyor. Kodu ya da bağlantıyı paylaş.':'İki oyuncu da hazır olunca kapışma başlar.'):
  YR.host?(yrStartNeden()||(YR.players.some(p=>!p.ready)?YR.players.filter(p=>!p.ready).length+' kişi hazır değil.':'Herkes hazır. Başlatabilirsin.')):'⏳ Odayı kuran kişi başlatınca oyun açılır.';
 h+='<p class="lb-durum" id="yrStartNeden" role="status">'+esc(durum)+'</p>'+yrErr()+
  '<div class="lb-salon-alt"><button class="btn" onclick="yrLeave()">Çık</button>'+
  '<button class="btn pri" onclick="yrSetReady()"'+(YR.ready?' disabled':'')+'>'+(YR.ready?'✓ Hazır':'Hazırım')+'</button>'+
  (!duel&&YR.host?'<button class="btn pri" onclick="yrStart()"'+(yrStartNeden()?' disabled':'')+'>▶ Başlat</button>':'')+'</div>'+
  '<div class="lb-salon-pay"><button class="btn sm" onclick="yrShare()">🔗 Paylaş</button><button class="btn sm" onclick="yrCopy()">📋 Kopyala</button>'+(YR.notice?'<small role="status">'+esc(YR.notice)+'</small>':'')+'</div></div>';
 return h;
};
