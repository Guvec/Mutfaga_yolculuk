/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */

/* ===================== AYARLAR VE DURUM ===================== */
var VERSION = "Sürüm 2 · Mesleki Oyunlar";
var IMG = {"tatli_catali": "assets/kuver/tatli_catali.jpg", "pecete": "assets/kuver/pecete.jpg", "yemek_bicagi": "assets/kuver/yemek_bicagi.jpg", "ornek_kuver": "assets/kuver/tabldot-kuver-referans.png", "su_bardagi": "assets/kuver/tabldot-kuver-referans.png", "tereyagi_bicagi": "assets/kuver/tereyagi_bicagi.jpg", "corba_kasigi": "assets/kuver/corba_kasigi.jpg", "kuver_tabagi": "assets/kuver/kuver_tabagi.jpg", "tatli_kasigi": "assets/kuver/tatli_kasigi.jpg", "ekmek_tabagi": "assets/kuver/ekmek_tabagi.jpg", "yemek_catali": "assets/kuver/yemek_catali.jpg"};
var PRE = "kv_";            // localStorage öneki (Matematik Canavarı "mc_" kullanır)
var PTS = 10;               // ilk denemede doğru puanı
          // gömülü fotoğraflar (data URI)

/* Parçalar. x,y: masadaki merkez (% genişlik, % yükseklik).
   w: görsel genişliği (% masa genişliği) ya da h: görsel yüksekliği (% masa yüksekliği).
   mx,my: dokunma noktasının yeri. */
var ITEMS = {
  kuver_tabagi:   {ad:"Kuver tabağı", AD:"KUVER TABAĞI", x:53.3, y:61.4, w:43.2,
                   yer:"Ortada",
                   kural:"Kuver tabağı ortaya, bu çalışmada masa kenarından iki parmak (yaklaşık 2 cm) içeri konur.",
                   ayirt:"Kuver tabağı büyük, düz bir tabaktır. Kuverin ortasında durur."},
  yemek_catali:   {ad:"Yemek çatalı", AD:"YEMEK ÇATALI", x:28, y:64.6, h:51.5, mx:28, my:64,
                   yer:"Tabağın solu",
                   kural:"Yemek çatalı tabağın soluna konur.",
                   ayirt:"Yemek çatalı uzundur, ana yemekte kullanılır. Tatlı çatalı ondan kısadır."},
  yemek_bicagi:   {ad:"Yemek bıçağı", AD:"YEMEK BIÇAĞI", x:79.3, y:63, h:55.8, mx:79.3, my:55,
                   yer:"Tabağın sağı",
                   kural:"Yemek bıçağı tabağın sağına konur, keskin ağzı tabağa bakar.",
                   ayirt:"Yemek bıçağı uzundur, ana yemekte kullanılır. Tereyağı bıçağı ondan kısadır."},
  corba_kasigi:   {ad:"Çorba kaşığı", AD:"ÇORBA KAŞIĞI", x:88, y:66.8, h:48, mx:90, my:77,
                   yer:"Bıçağın sağı",
                   kural:"Çorba kaşığı bıçağın sağına konur. Çorba ilk içildiği için kaşık en dışta durur.",
                   ayirt:"Çorba kaşığı büyüktür. Tatlı kaşığı ondan küçüktür."},
  pecete:         {ad:"Peçete", AD:"PEÇETE", x:13.3, y:66.6, h:45, mx:13.3, my:66,
                   yer:"Çatalın solu",
                   kural:"Peçete çatalın soluna konur. Misafir oturunca peçeteyi kolayca alır.",
                   ayirt:"Peçete ağzı ve elleri silmek için kullanılır. Çatalın soluna konur."},
  ekmek_tabagi:   {ad:"Ekmek tabağı", AD:"EKMEK TABAĞI", x:15.5, y:20.6, w:21.8, mx:10.5, my:19,
                   yer:"Sol üst",
                   kural:"Ekmek tabağı kuverin sol üst tarafına, çatalın üst tarafına konur. Kolay hatırlamak için: ekmek solda, su sağda.",
                   ayirt:"Ekmek tabağı küçük bir tabaktır. Kuverin sol üst tarafına konur."},
  tereyagi_bicagi:{ad:"Tereyağı bıçağı", AD:"TEREYAĞI BIÇAĞI", x:21, y:22.6, h:32.7, mx:23, my:22,
                   yer:"Ekmek tabağının sağ kenarı",
                   kural:"Tereyağı bıçağı ekmek tabağının sağ kenarına, dik olarak konur. Ekmeğe tereyağı sürmek için kullanılır.",
                   ayirt:"Tereyağı bıçağı kısa ve küt ağızlıdır. Ekmeğe tereyağı sürmek için kullanılır."},
  tatli_catali:   {ad:"Tatlı çatalı", AD:"TATLI ÇATALI", x:52, y:23.5, w:25.7, mx:60, my:23.5,
                   yer:"Tabağın üst tarafı",
                   kural:"Tatlı çatalı tabağın üst tarafına konur, sapı sola bakar. Tatlı en son yendiği için tabağın üst tarafında bekler.",
                   ayirt:"Tatlı çatalı yemek çatalından kısadır. Tatlı için kullanılır."},
  tatli_kasigi:   {ad:"Tatlı kaşığı", AD:"TATLI KAŞIĞI", x:52, y:13, w:25.7, mx:44, my:13,
                   yer:"Tatlı çatalının üst tarafı",
                   kural:"Tatlı kaşığı tatlı çatalının üst tarafına konur, sapı sağa bakar. Kaşık sağ elle alınır.",
                   ayirt:"Tatlı kaşığı çorba kaşığından küçüktür. Tatlı için kullanılır."},
  su_bardagi:     {ad:"Su bardağı", AD:"SU BARDAĞI", x:89, y:19, w:18, mx:85.5, my:18,
                   yer:"Bıçak ucunun üst tarafı",
                   kural:"Su bardağı yemek bıçağının ucunun üst tarafına konur. Kolay hatırlamak için: ekmek solda, su sağda.",
                   ayirt:"Su bardağı su içmek için kullanılır. Bıçağın ucunun üst tarafına konur."}
};

/* Kategori yapısı (Matematik Canavarı'ndaki OPS'in karşılığı) */
var OPS = {
  kur:{name:"Kuveri Kur", desc:"Parçaları masada doğru yere yerleştir."},
  ad: {name:"Adını Bul",  desc:"Görseldeki parçanın adını seç."}
};
var LEVELS = {}; // Güncel kuver türleri platform.js içinde tanımlanır.
/* Adını Bul'da birbirine benzeyen parçalar çeldirici olarak öncelikli gelir */
var SIMILAR = {
  yemek_catali:["tatli_catali"], tatli_catali:["yemek_catali"],
  yemek_bicagi:["tereyagi_bicagi"], tereyagi_bicagi:["yemek_bicagi"],
  corba_kasigi:["tatli_kasigi"], tatli_kasigi:["corba_kasigi"],
  kuver_tabagi:["ekmek_tabagi"], ekmek_tabagi:["kuver_tabagi"],
  pecete:[], su_bardagi:[]
};

var st = {
  screen:"welcome", prof:null, guest:false, op:null, lvl:1,
  sess:null, q:null, tries:0, done:false, kDone:false,
  wrong:[], placed:{}, order:[], bag:[], last:null,
  streak:0, brk:0, savedMsg:"", modalOpen:false, inBreak:false,
  run:false, t0:0, acc:0, lastRes:null
};

/* ===================== DEPOLAMA ===================== */
function ls(k,def){ try{ var v=localStorage.getItem(PRE+k); return v?JSON.parse(v):def; }catch(e){ return def; } }
function lsSet(k,v){ try{ localStorage.setItem(PRE+k,JSON.stringify(v)); return true; }catch(e){ return false; } }
function profiles(){ return ls("profiles",[]); }
function records(){ return ls("records",[]); }
/* Son profil bu cihazda hatırlanır; misafir seçimi yalnız mevcut oturumu etkiler. */
function profilDevamEt(){
  if(st.guest)return false;
  var p=profiles();if(!Array.isArray(p))return false;
  if(st.prof&&p.indexOf(st.prof)>=0)return true;
  var son=ls('sonProfil',null);
  if(son!==null&&p.indexOf(son)<0){lsSet('sonProfil',null);return false;}
  if(son===null&&p.length===1)son=p[0];
  if(!son||p.indexOf(son)<0)return false;
  st.prof=son;st.guest=false;lsSet('sonProfil',son);return true;
}
function profilSilindi(n){
  if(ls('sonProfil',null)===n)lsSet('sonProfil',null);
  if(st.prof===n){st.prof=null;st.guest=false;}
}
if(profilDevamEt())st.screen='home';

/* ===================== YARDIMCILAR ===================== */
function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function pad(n){ return (n<10?"0":"")+n; }
function fmtDate(d){ d=new Date(d); return pad(d.getDate())+"."+pad(d.getMonth()+1)+"."+d.getFullYear(); }
function fmtTime(d){ d=new Date(d); return pad(d.getHours())+":"+pad(d.getMinutes()); }
function fmtS(s){ return (Math.round(s*10)/10).toFixed(1).replace(".",",")+" sn"; }
function fmtDur(s){ s=Math.round(s); var m=Math.floor(s/60); return m? m+" dk "+(s%60)+" sn" : s+" sn"; }
function catName(r){ return r.op==="kur" ? OPS.kur.name+" · Seviye "+r.d : OPS.ad.name; }

/* ===================== SÜRE ===================== */
function tStart(){ st.acc=0; st.t0=Date.now(); st.run=true; }
function pauseT(){ if(st.run && st.t0){ st.acc+=Date.now()-st.t0; st.t0=0; } }
function resumeT(){ if(st.run && !st.t0 && !st.modalOpen && !st.inBreak && !document.hidden) st.t0=Date.now(); }
function elapsed(){ return (st.acc+(st.t0?Date.now()-st.t0:0))/1000; }
function tStop(){ var s=elapsed(); st.run=false; st.t0=0; return Math.round(s*10)/10; }
document.addEventListener("visibilitychange",function(){ if(document.hidden) pauseT(); else resumeT(); });

/* ===================== OTURUM VE SORU ===================== */
function startSession(){
  st.sess = {id:Date.now(), p:st.guest?"Misafir":st.prof, t:new Date().toISOString(),
             op:st.op, d:st.op==="kur"?st.lvl:0, s:0, ok:0, fix:0, bad:0, br:0, k:0, qs:[]};
  st.streak=0; st.brk=0; st.savedMsg=st.guest?((typeof YR!=="undefined"&&YR.active)?"Yanıtların, çalışmayı bitirince yarış odasına gönderilir.":"Misafir oturumu: skor kaydedilmiyor."):"";
  st.bag=[]; st.last=null;
  if(st.op==="kur") newKuver(); else newQ();
  st.screen="quiz"; render();
}
function newKuver(){
  var o=shuffle(LEVELS[st.lvl].items);
  var a=o.indexOf("ekmek_tabagi"), b=o.indexOf("tereyagi_bicagi");
  if(a>-1 && b>-1 && b<a){ o[a]="tereyagi_bicagi"; o[b]="ekmek_tabagi"; } // önce tabak, sonra üstündeki bıçak
  st.order=o; st.placed={kuver_tabagi:true}; st.kDone=false;
  st.lastRes={cls:"", head:"Kuver tabağı masada hazır.", text:ITEMS.kuver_tabagi.kural};
  newQ(true);
}
function newQ(keepMsg){
  st.tries=0; st.done=false; st.wrong=[];
  if(!keepMsg) st.lastRes=null;
  if(st.op==="kur"){
    var key=null;
    for(var i=0;i<st.order.length;i++){ if(!st.placed[st.order[i]]){ key=st.order[i]; break; } }
    if(!key){ st.q=null; st.kDone=true; st.sess.k++; saveProgress(); return; }
    st.q={key:key};
  } else {
    if(!st.bag.length){ st.bag=shuffle(Object.keys(ITEMS)); if(st.bag[0]===st.last && st.bag.length>1) st.bag.push(st.bag.shift()); }
    var k=st.bag.shift(); st.last=k;
    var pool=SIMILAR[k].slice();
    var others=shuffle(Object.keys(ITEMS).filter(function(x){ return x!==k && pool.indexOf(x)<0; }));
    while(pool.length<3) pool.push(others.shift());
    var opts=shuffle([k].concat(pool));
    st.q={key:k, opts:opts, ans:opts.indexOf(k)};
  }
  tStart();
}

/* ===================== CEVAPLAMA ===================== */
function answer(v){
  if(st.done || st.tries>=2 || !st.q) return;
  var right = st.op==="kur" ? (v===st.q.key) : (v===st.q.ans);
  if(right){ resolve(st.tries===0?1:2); return; }
  st.tries++; st.wrong.push(v);
  if(st.tries===1){
    st.lastRes={cls:"bad", head:"Tekrar dene.", text: st.op==="kur" ? "Bu yer başka bir parçanın yeri." : "Görsele dikkatle bak."};
  } else {
    st.lastRes={cls:"bad", head:"Henüz doğru yanıt bulunmadı.", text: st.op==="kur" ? "Doğru yeri görmek için düğmeye dokun." : "Doğru cevabı görmek için düğmeye dokun."};
  }
  render();
}
function showSol(){ if(st.done) return; resolve(0); }
function resolve(r){
  var s=tStop(), it=ITEMS[st.q.key];
  st.done=true; st.res=r;
  var S=st.sess;
  if(r===1){ S.s+=PTS; S.ok++; st.streak++; }
  else if(r===2){ S.s+=5; S.fix++; st.streak=0; }
  else { S.bad++; st.streak=0; }
  S.qs.push({q:it.ad, a: st.op==="kur"?it.yer:it.ad, r:r, s:s});
  if(st.op==="kur") st.placed[st.q.key]=true;
  var info = st.op==="kur" ? it.kural : it.ayirt;
  if(r===1) st.lastRes={cls:"ok", head:"Doğru! +"+PTS+" puan", text:info};
  else if(r===2) st.lastRes={cls:"fix", head:"Düzelttin! +5 puan. İkinci denemede buldun.", text:info};
  else st.lastRes={cls:"fix", head: st.op==="kur" ? "Doğru yer burası." : "Doğru cevap: "+it.AD, text:info};
  saveProgress();
  render();
}
function nextQ(){ newQ(); render(); }
function newKuverBtn(){ newKuver(); render(); }
function saveProgress(){
  if(st.guest || !st.sess) return;
  var all=records(), S=st.sess, found=false;
  for(var i=0;i<all.length;i++){ if(all[i].id===S.id && all[i].p===S.p){ all[i]=S; found=true; break; } }
  if(!found) all.push(S);
  st.savedMsg = lsSet("records",all) ? "Skor kaydedildi." : "Kayıt yapılamadı (telefon hafızası dolu olabilir).";
}
function finish(){
  closeModal();
  st.run=false; st.t0=0;
  if(!st.guest && st.sess.qs.length) saveProgress();
  st.screen="summary"; render();
}

/* ===================== MOLA VE ONAY ===================== */
function modal(text, yesFn){
  st.modalOpen=true; pauseT();
  var ov=document.getElementById("ov");
  ov.innerHTML='<div class="modal"><p>'+text+'</p><div class="row"><button class="btn ghost" id="mNo">Hayır</button><button class="btn pri" id="mYes">Evet</button></div></div>';
  ov.className="on";
  document.getElementById("mNo").onclick=closeModal;
  document.getElementById("mYes").onclick=yesFn;
}
function closeModal(){ var ov=document.getElementById("ov"); ov.className=""; ov.innerHTML=""; st.modalOpen=false; resumeT(); }
function askFinish(){ modal("Çalışmayı bitirip skorunu görmek istiyor musun?", finish); }
function askBreak(){
  if(st.brk || st.done || st.kDone) return;
  modal("Molayı kullanmak istiyor musun? Bu oturumda yalnızca 1 mola hakkın var.", startBreak);
}
function startBreak(){
  st.modalOpen=false; st.inBreak=true; st.brk=1; st.sess.br=1; pauseT(); saveProgress();
  var ov=document.getElementById("ov");
  ov.innerHTML='<div class="break"><h2>Mola</h2><p>Süre durdu. Hazır olunca devam et.</p><button class="btn pri" id="bGo">Devam Et</button></div>';
  ov.className="on";
  document.getElementById("bGo").onclick=function(){ st.inBreak=false; ov.className=""; ov.innerHTML=""; resumeT(); render(); };
}

/* ===================== SEÇİM İŞLEMLERİ ===================== */
function pickProfile(n){ st.prof=n; st.guest=false; if(profiles().indexOf(n)>=0)lsSet('sonProfil',n);var target=st.profileReturn==='racemenu'?'racemenu':'home';st.profileReturn=null;go(target); }
function createProfile(){
  if(typeof adOpen==='function')adOpen(-1,'profiles');
}

function guest(){ st.prof=null; st.guest=true; st.profileReturn=null; go("home"); }
function askDelProfile(n){
  modal("“"+esc(n)+"” profili ve bütün kayıtları silinsin mi?", function(){
    lsSet("profiles",profiles().filter(function(x){return x!==n;}));
    lsSet("records",records().filter(function(r){return r.p!==n;}));
    profilSilindi(n);
    closeModal(); render();
  });
}
function pickOp(op){ st.op=op; if(op==="kur") go("level"); else startSession(); }
function pickLevel(l){ st.lvl=l; startSession(); }

/* ===================== EKRANLAR ===================== */
function go(s){ st.screen=s; render(); window.scrollTo(0,0); }
function back(){
  var m={profiles:"welcome", home:"profiles", level:"home", summary:"home", history:"home"};
  go(m[st.screen]||"home");
}
function topBar(title, noBack){
  return '<div class="top">'+(noBack?'':'<button class="back" onclick="back()">← Geri</button>')+
    '<div class="ttl">'+esc(title)+'</div><div class="who">'+(typeof profilDugme==='function'?profilDugme():esc(st.guest?"Misafir":(st.prof||"")))+'</div></div>';
}
function itemImg(k, extra){
  var it=ITEMS[k], size = it.w ? 'width:'+it.w+'%' : 'height:'+it.h+'%';
  return '<img class="it'+(extra||"")+'" src="'+IMG[k]+'" alt="'+esc(it.ad)+'" style="left:'+it.x+'%;top:'+it.y+'%;'+size+'">';
}
function tableHtml(){
  var h='<div class="table" id="tbl">';
  var keys=["kuver_tabagi"].concat(LEVELS[st.lvl].items);
  // önce tabaklar ve peçete, sonra üstte duran takımlar
  var z=["kuver_tabagi","ekmek_tabagi","pecete","su_bardagi","yemek_catali","yemek_bicagi","corba_kasigi","tatli_catali","tatli_kasigi","tereyagi_bicagi"];
  z.forEach(function(k){
    if(keys.indexOf(k)<0 || !st.placed[k]) return;
    h+=itemImg(k, (st.done && st.q && st.q.key===k) ? " pop" : "");
  });
  keys.forEach(function(k){
    if(k==="kuver_tabagi") return;
    var it=ITEMS[k], pos='style="left:'+it.mx+'%;top:'+it.my+'%"';
    if(st.done && st.q && st.q.key===k){
      h+='<div class="slot '+(st.res===0?"showring":"okring")+'" '+pos+'></div>';
    } else if(!st.placed[k]){
      var wr=st.wrong.indexOf(k)>-1;
      var dis = wr || st.done || st.kDone || st.tries>=2;
      h+='<button class="slot'+(wr?" wrong":"")+'" '+pos+(dis?" disabled":"")+' aria-label="Yer" onclick="answer(\''+k+'\')"></button>';
    }
  });
  return h+'</div>';
}
function statsHtml(){
  var S=st.sess;
  return '<div class="stats"><span class="chip">Puan <b>'+S.s+'</b></span><span class="chip">✓ <b>'+S.ok+'</b></span>'+
    '<span class="chip">↻ <b>'+S.fix+'</b></span><span class="chip">✗ <b>'+S.bad+'</b></span><span class="chip">Seri <b>'+st.streak+'</b></span></div>';
}
function msgHtml(){
  if(!st.lastRes) return "";
  return '<div class="msg '+st.lastRes.cls+'"><b>'+esc(st.lastRes.head)+'</b>'+esc(st.lastRes.text)+'</div>';
}
function footHtml(){
  return '<div class="foot"><button class="btn sm ghost" onclick="askBreak()"'+((st.brk||st.done||st.kDone)?" disabled":"")+'>Mola ver'+(st.brk?' (kullanıldı)':'')+'</button>'+
    '<button class="btn sm" onclick="askFinish()">Bitir ve Skoru Gör</button></div>'+
    '<div class="saved">'+esc(st.savedMsg)+'</div>';
}
function quizHtml(){
  var h=topBar(st.op==="kur"?OPS.kur.name+" · "+LEVELS[st.lvl].name.split(" · ")[0]:OPS.ad.name, true);
  if(st.op==="kur"){
    h+='<div class="quiz"><div class="tablebox">'+tableHtml()+'</div><div class="side">'+statsHtml();
    if(st.kDone){
      h+='<div class="msg ok"><b>Kuver tamamlandı.</b>Kurduğun kuveri örnek kuverle karşılaştır.</div>'+
         '<img class="done-photo" src="'+IMG.ornek_kuver+'" alt="Örnek kuver">'+
         '<button class="btn pri" onclick="newKuverBtn()">Yeni Kuver</button>';
    } else {
      var it=ITEMS[st.q.key];
      if(!st.done){
        h+='<div class="next"><div class="pic"><img src="'+IMG[st.q.key]+'" alt=""></div><div><div class="lbl">SIRADAKİ PARÇA</div>'+
           '<div class="nm">'+esc(it.AD)+'</div><div class="hint">Masada bu parçanın yerine dokun.</div></div></div>';
      }
      h+=msgHtml();
      if(st.done) h+='<button class="btn pri" onclick="nextQ()">Devam</button>';
      else if(st.tries>=2) h+='<button class="btn pri" onclick="showSol()">Doğru Yeri Gör</button>';
    }
    h+=footHtml()+'</div></div>';
  } else {
    var k=st.q.key;
    // Parça örnek kuverin içinde gösterilir: diğer parçalar soluk kalır, böylece boyut karşılaştırılabilir
    var tb='<div class="table">';
    ["kuver_tabagi","ekmek_tabagi","pecete","su_bardagi","yemek_catali","yemek_bicagi","corba_kasigi","tatli_catali","tatli_kasigi","tereyagi_bicagi"].forEach(function(z){
      tb+=itemImg(z, z===k?" focus":" faded");
    });
    tb+='</div>';
    h+='<div class="quiz"><div class="tablebox">'+tb+'</div><div class="side">'+statsHtml()+
       '<div class="qtext">Öne çıkan parçanın adı nedir?</div><div class="opts">';
    st.q.opts.forEach(function(o,i){
      var cls="opt";
      if(st.wrong.indexOf(i)>-1) cls+=" wrong";
      if(st.done && i===st.q.ans) cls+=" right";
      var dis = st.done || st.tries>=2 || st.wrong.indexOf(i)>-1;
      h+='<button class="'+cls+'"'+(dis?" disabled":"")+' onclick="answer('+i+')">'+esc(ITEMS[o].AD)+'</button>';
    });
    h+='</div>'+msgHtml();
    if(st.done) h+='<button class="btn pri" onclick="nextQ()">Devam</button>';
    else if(st.tries>=2) h+='<button class="btn pri" onclick="showSol()">Sonucu Gör</button>';
    h+=footHtml()+'</div></div>';
  }
  return h;
}
function render(){
  var a=document.getElementById("app"), h="";
  switch(st.screen){
  case "welcome":
    h='<div class="welcome"><img src="'+IMG.ornek_kuver+'" alt="Örnek kuver"><h1>Mesleki Oyunlar</h1>'+
      '<p class="sub">Kuver parçalarını tanı, masada doğru yere yerleştir.</p>'+
      '<div style="width:100%;max-width:360px"><button class="btn pri" onclick="go(\'profiles\')">Başla</button></div>'+
      '<div class="ver">'+VERSION+'</div></div>';
    break;
  case "profiles":
    var p=profiles();
    h=topBar("Profil seç")+'<div class="wrap"><h2>Kim çalışıyor?</h2><div class="list">';
    p.forEach(function(n,i){
      h+='<div class="prof"><button class="menu-btn" onclick="pickProfile(profiles()['+i+'])"><b>'+esc(n)+'</b></button>'+
         '<button class="del" aria-label="Profili sil" onclick="askDelProfile(profiles()['+i+'])">🗑</button></div>';
    });
    h+='</div><div class="card" style="margin-top:14px"><b>Yeni profil</b><p class="note" style="margin:4px 0 10px">Karakterini seç. Seçtiğin karakterin adı oyun adın olur.</p>'+
       '<div style="margin-top:10px"><button class="btn pri" onclick="createProfile()">➕ Yeni profil</button></div></div>'+
       '<div style="margin-top:14px"><button class="btn ghost" onclick="guest()">Misafir Olarak Devam Et</button>'+
       '<p class="note">Misafir oturumunda skor kaydedilmez.</p></div></div>';
    break;
  case "home":
    h=topBar("Ana menü")+'<div class="wrap"><h2>Ne çalışmak istiyorsun?</h2><div class="list">'+
      '<button class="menu-btn" onclick="pickOp(\'ad\')"><b>'+OPS.ad.name+'</b><span>'+OPS.ad.desc+'</span></button>'+
      '<button class="menu-btn" onclick="pickOp(\'kur\')"><b>'+OPS.kur.name+'</b><span>'+OPS.kur.desc+'</span></button>'+
      (st.guest?'':'<button class="menu-btn" onclick="go(\'history\')"><b>Skorlarım</b><span>Son 14 günün çalışmaları.</span></button>')+
      '</div></div>';
    break;
  case "quiz":
    h=quizHtml();
    break;
  case "summary":
    var c=drawReport(st.sess);
    st.repCanvas=c;
    h=topBar("Rapor")+'<div class="wrap rep">'+
      '<div class="row" style="margin-bottom:10px"><button class="btn pri" onclick="shareCanvas(st.repCanvas,\'kuver-rapor.png\')">Fotoğrafı Kaydet / Paylaş</button></div>'+
      '<img src="'+c.toDataURL("image/png")+'" alt="Rapor">'+
      '<div class="row" style="margin-top:10px"><button class="btn" onclick="startSession()">Yeni Oturum</button><button class="btn ghost" onclick="go(\'home\')">Menü</button></div></div>';
    break;
  case "history":
    var d=histData();
    h=topBar("Skorlarım")+'<div class="wrap">';
    if(!d.length){ h+='<p class="sub">Son 14 günde kayıtlı çalışma yok.</p>'; }
    else {
      h+='<button class="btn pri" onclick="shareCanvas(drawHistory(),\'kuver-skorlarim.png\')">Fotoğraf Olarak Paylaş</button>';
      d.forEach(function(g){
        h+='<div class="day">'+g.date+' · '+g.recs.length+' oturum · '+g.total+' puan</div>';
        g.recs.forEach(function(r){
          var n=r.qs.length, avg=n?r.qs.reduce(function(a,q){return a+q.s;},0)/n:0;
          h+='<div class="hrow"><div><b>'+fmtTime(r.t)+'</b> · '+esc(catName(r))+'<br>'+n+' soru · ✓'+r.ok+' ↻'+r.fix+' ✗'+r.bad+'</div>'+
             '<div class="r"><b>'+r.s+' puan</b><br>'+sessionTimeLabel(r)+'</div></div>';
        });
      });
    }
    h+='</div>';
    break;
  }
  a.innerHTML=h;
  if(st.screen==="profiles"){ var inp=document.getElementById("pname"); if(inp) inp.onkeydown=function(e){ if(e.key==="Enter") createProfile(); }; }
}

/* ===================== ÇİZİM (rapor ve skor görselleri) ===================== */
var C = {teal:"#0f6e72", navy:"#1b3540", muted:"#5b6f76", line:"#d3dfdf", soft:"#e6f1f1", ok:"#23804f", fix:"#b7791f", bad:"#c0392b"};
function drawIcon(x,X,Y,S){
  x.save(); x.translate(X,Y); x.scale(S/100,S/100);
  x.fillStyle="#fff";
  x.beginPath(); x.arc(50,50,30,0,Math.PI*2); x.fill();
  x.strokeStyle="#cfe3e3"; x.lineWidth=1.5; x.beginPath(); x.arc(50,50,21,0,Math.PI*2); x.stroke();
  // çatal
  [-3.3,-1.1,1.1,3.3].forEach(function(d){ x.fillRect(13+d-0.7,22,1.4,13); });
  x.fillRect(9,33.5,8,5); x.fillRect(11.4,36,3.2,42);
  // bıçak
  x.fillRect(85.4,50,3.2,28);
  x.beginPath(); x.moveTo(84,52); x.lineTo(84,30); x.quadraticCurveTo(84,22,90,22); x.lineTo(90,52); x.closePath(); x.fill();
  x.restore();
}
function wrapText(x,t,mw){
  var w=t.split(" "), lines=[], cur="";
  w.forEach(function(s){ var tr=cur?cur+" "+s:s; if(x.measureText(tr).width>mw && cur){ lines.push(cur); cur=s; } else cur=tr; });
  if(cur) lines.push(cur); return lines;
}
function drawReport(r){
  var W=1080, n=r.qs.length, rowH=46;
  var times=r.qs.map(function(q){return q.s;});
  var tot=times.reduce(function(a,b){return a+b;},0);
  var okT=r.qs.filter(function(q){return q.r===1;}).map(function(q){return q.s;});
  var boxes=[
    ["Doğru","(ilk denemede)", r.ok, C.ok],
    ["Düzeltti","(2. denemede)", r.fix, C.fix],
    ["Yanlış","", r.bad, C.bad],
    ["İlk denemede","doğru oranı", n?Math.round(r.ok*100/n)+"%":"—", C.navy],
    ["Toplam soru","", n, C.navy],
    ["Ortalama süre","(soru başına)", n?fmtS(tot/n):"—", C.navy],
    ["Toplam süre","", fmtDur(tot), C.navy],
    ["En hızlı · En yavaş","", n?fmtS(Math.min.apply(null,times))+" · "+fmtS(Math.max.apply(null,times)):"—", C.navy],
    ["Doğrularda ort. süre","(ilk denemede)", okT.length?fmtS(okT.reduce(function(a,b){return a+b;},0)/okT.length):"—", C.navy],
    ["Mola","", r.br?"Kullanıldı":"Kullanılmadı", C.navy]
  ];
  if(r.op==="kur") boxes.push(["Tamamlanan kuver","", r.k||0, C.navy]);
  var cols=4, bw=(W-80-3*14)/cols, bh=118, brows=Math.ceil(boxes.length/cols);
  var top=250, tTop=top+brows*(bh+14)+20;
  var H=tTop+56+Math.max(n,1)*rowH+80;
  var c=document.createElement("canvas"); c.width=W; c.height=H; var x=c.getContext("2d");
  x.fillStyle="#fff"; x.fillRect(0,0,W,H);
  x.fillStyle=C.teal; x.fillRect(0,0,W,220);
  drawIcon(x,30,40,150);
  x.fillStyle="#fff"; x.textAlign="left";
  x.font="bold 46px Arial"; x.fillText("Mesleki Oyunlar",200,88);
  x.font="28px Arial"; x.fillText("Öğrenci: "+r.p,200,134);
  x.fillText(catName(r)+"  ·  "+fmtDate(r.t)+" "+fmtTime(r.t),200,176);
  x.textAlign="right"; x.font="bold 88px Arial"; x.fillText(String(r.s),W-40,130);
  x.font="26px Arial"; x.fillText("puan",W-40,172);
  x.textAlign="left";
  boxes.forEach(function(b,i){
    var bx=40+(i%cols)*(bw+14), by=top+Math.floor(i/cols)*(bh+14);
    x.fillStyle="#f6f9f9"; x.strokeStyle=C.line; x.lineWidth=2;
    x.beginPath(); if(x.roundRect) x.roundRect(bx,by,bw,bh,14); else x.rect(bx,by,bw,bh); x.fill(); x.stroke();
    x.fillStyle=C.muted; x.font="20px Arial"; x.fillText(b[0],bx+14,by+30); if(b[1]) x.fillText(b[1],bx+14,by+54);
    x.fillStyle=b[3]; var fs=String(b[2]).length>12?26:34; x.font="bold "+fs+"px Arial"; x.fillText(String(b[2]),bx+14,by+bh-18);
  });
  var label2 = r.op==="kur" ? "Doğru yer" : "Doğru ad";
  x.fillStyle=C.soft; x.fillRect(40,tTop,W-80,48);
  x.fillStyle=C.navy; x.font="bold 22px Arial";
  x.fillText("No",54,tTop+32); x.fillText("Parça",120,tTop+32); x.fillText(label2,400,tTop+32); x.fillText("Sonuç",740,tTop+32);
  x.textAlign="right"; x.fillText("Süre",W-54,tTop+32); x.textAlign="left";
  var y=tTop+48;
  if(!n){ x.fillStyle=C.muted; x.font="22px Arial"; x.fillText("Bu oturumda cevaplanan soru yok.",54,y+32); }
  r.qs.forEach(function(q,i){
    if(i%2){ x.fillStyle="#f7fafa"; x.fillRect(40,y,W-80,rowH); }
    x.fillStyle=C.navy; x.font="22px Arial";
    x.fillText(String(i+1),54,y+30); x.fillText(q.q,120,y+30);
    var a=q.a; if(x.measureText(a).width>320){ x.font="18px Arial"; } x.fillText(a,400,y+30); x.font="22px Arial";
    var res = q.r===1?["✓ Doğru",C.ok]:q.r===2?["↻ 2. denemede",C.fix]:["✗ Yanlış",C.bad];
    x.fillStyle=res[1]; x.font="bold 22px Arial"; x.fillText(res[0],740,y+30);
    x.fillStyle=C.navy; x.font="22px Arial"; x.textAlign="right"; x.fillText(fmtS(q.s),W-54,y+30); x.textAlign="left";
    y+=rowH;
  });
  x.strokeStyle=C.line; x.lineWidth=1; x.beginPath(); x.moveTo(40,H-50); x.lineTo(W-40,H-50); x.stroke();
  x.fillStyle=C.muted; x.font="20px Arial"; x.fillText("Rapor oluşturma: "+fmtDate(new Date())+" "+fmtTime(new Date()),40,H-20);
  return c;
}
function histData(){
  var lim=Date.now()-14*864e5;
  var rs=records().filter(function(r){ return r.p===st.prof && new Date(r.t).getTime()>=lim && r.qs.length; })
                  .sort(function(a,b){ return b.id-a.id; });
  var g=[], map={};
  rs.forEach(function(r){ var d=fmtDate(r.t); if(!map[d]){ map[d]={date:d,recs:[],total:0}; g.push(map[d]); } map[d].recs.push(r); map[d].total+=r.s; });
  return g;
}
function drawHistory(){
  var d=histData(), W=1080, lines=0;
  d.forEach(function(g){ lines+=1+g.recs.length; });
  var H=200+lines*58+70;
  var c=document.createElement("canvas"); c.width=W; c.height=H; var x=c.getContext("2d");
  x.fillStyle="#fff"; x.fillRect(0,0,W,H);
  x.fillStyle=C.teal; x.fillRect(0,0,W,160);
  drawIcon(x,30,25,110);
  x.fillStyle="#fff"; x.font="bold 42px Arial"; x.fillText("Skorlarım · Mesleki Oyunlar",160,78);
  x.font="26px Arial"; x.fillText("Öğrenci: "+st.prof+"  ·  Son 14 gün",160,122);
  var y=200;
  d.forEach(function(g){
    x.fillStyle=C.soft; x.fillRect(40,y-36,W-80,50);
    x.fillStyle=C.navy; x.font="bold 24px Arial"; x.fillText(g.date+"  ·  "+g.recs.length+" oturum  ·  "+g.total+" puan",54,y-3);
    y+=58;
    g.recs.forEach(function(r){
      var n=r.qs.length, avg=n?r.qs.reduce(function(a,q){return a+q.s;},0)/n:0;
      x.fillStyle=C.navy; x.font="22px Arial";
      x.fillText(fmtTime(r.t)+"  "+catName(r),54,y-3);
      x.fillText(n+" soru  ✓"+r.ok+" ↻"+r.fix+" ✗"+r.bad,560,y-3);
      x.textAlign="right"; x.font="bold 22px Arial"; x.fillText(r.s+" puan · "+sessionTimeLabel(r),W-54,y-3); x.textAlign="left";
      y+=58;
    });
  });
  x.fillStyle=C.muted; x.font="20px Arial"; x.fillText("Oluşturma: "+fmtDate(new Date())+" "+fmtTime(new Date()),40,H-24);
  return c;
}
function shareCanvas(c,name){
  c.toBlob(function(b){
    var f=null; try{ f=new File([b],name,{type:"image/png"}); }catch(e){}
    if(f && navigator.canShare && navigator.canShare({files:[f]})){
      navigator.share({files:[f],title:"Mesleki Oyunlar"}).catch(function(){});
    } else {
      var a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=name;
      document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500);
    }
  },"image/png");
}

