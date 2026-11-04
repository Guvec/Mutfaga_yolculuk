/* Ödüller: puan → tatlı / yemek koleksiyonu, Mutfak Yıldızı, Başarı Belgesi.
   Telefonda, profil adına göre saklanır. Açılan ödül geri alınmaz (toplam puan hiç azalmaz).
   Eşikler başlangıç taslağıdır; sınıfta denenip ayarlanabilir. */
var ODUL_ESIK=[25,75,150,250,400];
var ODUL_YILDIZ=[100,250,500];
var ODUL_GUNLUK=40;
var ODUL_KOL={
 tatli:{ad:'Tatlı koleksiyonu',list:[['🍦','Dondurma'],['🍪','Kurabiye'],['🧁','Kek'],['🍰','Pasta'],['🎂','Doğum günü pastası']]},
 yemek:{ad:'Yemek koleksiyonu',list:[['🍕','Pizza'],['🍝','Makarna'],['🥗','Salata'],['🍲','Çorba'],['🥘','Güveç']]}
};
function oduVar(){return !!(st.prof&&!st.guest);}
function oduBugun(){return new Date().toLocaleDateString('sv-SE');}
function oduGet(p){const d=ls('odul',{}),o=d[p]||{};return {p:o.p|0,k:o.k==='yemek'?'yemek':(o.k==='tatli'?'tatli':''),g:o.g||'',gp:o.gp|0,b:!!o.b};}
function oduSet(p,o){const d=ls('odul',{});d[p]=o;lsSet('odul',d);}
/* Puan sayısından açılan ödül sayısı (0-5) ve yıldız sayısı (0-3). */
function oduSeviye(p){let n=0;ODUL_ESIK.forEach(e=>{if(p>=e)n++;});return n;}
function oduYildiz(p){let n=0;ODUL_YILDIZ.forEach(e=>{if(p>=e)n++;});return n;}
function oduSonraki(p){const e=ODUL_ESIK.find(x=>p<x);return e===undefined?null:e-p;}
function oduKol(o){return ODUL_KOL[o.k||'tatli'];}
/* Bir oyun sonucu puan getirir. Günlük sınırı aşan puan sayılmaz (sömürü ve takılıp kalma önlemi). */
var ODUL_KURAL={kapisma:{win:3,draw:2,lose:1,left:0},canavar:{win:3,lose:1,left:0}};
function oduKazan(oyun,sonuc,ek){
 if(!oduVar())return 0;
 let n=0;
 if(oyun==='oda'){const t=ek&&ek.total|0,ok=ek&&ek.ok|0;if(!t)return 0;n=1+(ok>=Math.ceil(t/2)?1:0)+(ok===t?1:0);}
 else if(oyun==='arena'){const r=ek&&ek.rank|0;n=r===1?3:r===2?2:r>2?1:0;}
 else n=(ODUL_KURAL[oyun]||{})[sonuc]|0;
 if(n<=0)return 0;
 const o=oduGet(st.prof),bu=oduBugun();if(o.g!==bu){o.g=bu;o.gp=0;}
 n=Math.max(0,Math.min(n,ODUL_GUNLUK-o.gp));if(n<=0){oduSet(st.prof,o);return 0;}
 const s0=oduSeviye(o.p),y0=oduYildiz(o.p);
 o.p+=n;o.gp+=n;oduSet(st.prof,o);
 const s1=oduSeviye(o.p),y1=oduYildiz(o.p),yeni=[];
 if(s1>s0){const kol=oduKol(o);for(let i=s0;i<s1;i++)yeni.push(kol.list[i][0]+' '+kol.list[i][1]);}
 if(y1>y0)yeni.push('⭐ Mutfak Yıldızı ('+y1+'/3)');
 if(y1>=3&&!o.b)yeni.push('📜 Başarı Belgesi');
 oduDuyur(n,yeni);
 return n;
}
function oduDuyur(n,yeni){
 const m='+'+n+' puan'+(yeni.length?' · Yeni ödül: '+yeni.join(', '):'');
 if(typeof adToast==='function')adToast(m);
 if(yeni.length&&typeof sesSoyle==='function')sesSoyle('Yeni ödül kazandın! '+yeni.join('. '));
 if(yeni.length&&typeof EFEKT!=='undefined')EFEKT.cal('win');
}
function oduKolSec(k){if(!oduVar()||!ODUL_KOL[k])return;const o=oduGet(st.prof);o.k=k;oduSet(st.prof,o);render();}
function oduAc(){if(!oduVar()){if(typeof adToast==='function')adToast('Ödüller için oyun adı gerekir.');return;}go('odul');window.scrollTo(0,0);}
function oduHTML(){
 const o=oduGet(st.prof),lv=oduSeviye(o.p),ys=oduYildiz(o.p),sn=oduSonraki(o.p);
 let h=topBar('Ödüllerim')+'<div class="wrap odul"><h1 id="oduBaslik" tabindex="-1">Ödüllerim</h1>';
 if(!o.k){
  h+='<p class="sub">Puan topladıkça ödüller açılır. Hangi koleksiyonu biriktirmek istersin?</p><div class="odul-sec">';
  Object.keys(ODUL_KOL).forEach(k=>{h+='<button type="button" class="btn" onclick="oduKolSec(\''+k+'\')"><span class="odul-big">'+ODUL_KOL[k].list.map(x=>x[0]).join(' ')+'</span><br>'+ODUL_KOL[k].ad+'</button>';});
  return h+'</div><p class="note">Seçimini sonra değiştirebilirsin. Biriken puanın kaybolmaz.</p></div>';
 }
 const kol=oduKol(o);
 h+='<div class="card odul-ozet"><b>'+o.p+' puan</b><br><small>'+(sn===null?'Tüm ödülleri açtın. Tebrikler!':'Bir sonraki ödüle '+sn+' puan kaldı.')+'</small></div>';
 h+='<h2>'+kol.ad+'</h2><div class="odul-kol">';
 kol.list.forEach((x,i)=>{const acik=i<lv;h+='<div class="odul-oge'+(acik?' acik':'')+'" aria-label="'+esc(x[1])+(acik?' açıldı':' henüz kilitli')+'"><span>'+(acik?x[0]:'🔒')+'</span><small>'+(acik?esc(x[1]):ODUL_ESIK[i]+' puan')+'</small></div>';});
 h+='</div><div class="row"><button type="button" class="btn sm" onclick="oduKolSec(\''+(o.k==='tatli'?'yemek':'tatli')+'\')">Koleksiyonu değiştir</button></div>';
 h+='<h2>Mutfak Yıldızı</h2><p class="odul-yild" aria-label="'+ys+' / 3 yıldız">'+[0,1,2].map(i=>i<ys?'⭐':'☆').join(' ')+'</p><p class="sub">'+(ys>=3?'Üç yıldızı topladın.':'Sıradaki yıldız '+ODUL_YILDIZ[ys]+' puanda.')+'</p>';
 if(ys>=3)h+='<button type="button" class="btn pri" onclick="oduBelge()">📜 Başarı Belgemi göster</button>';
 return h+'</div>';
}
/* Başarı Belgesi: ekranda gösterilir, resim olarak telefona kaydedilebilir. */
function oduBelgeCiz(ad,tarih){
 const c=document.createElement('canvas');c.width=1000;c.height=700;const g=c.getContext('2d');
 g.fillStyle='#fff';g.fillRect(0,0,1000,700);g.strokeStyle='#0f6b64';g.lineWidth=14;g.strokeRect(30,30,940,640);g.lineWidth=3;g.strokeRect(52,52,896,596);
 g.fillStyle='#123';g.textAlign='center';g.font='bold 54px Arial';g.fillText('MUTFAK BAŞARI BELGESİ',500,170);
 g.font='28px Arial';g.fillText('Bu belge',500,240);g.font='bold 52px Arial';g.fillText(ad,500,320);
 g.font='28px Arial';g.fillText('oyunda 3 Mutfak Yıldızı topladığı için verilmiştir.',500,390);
 g.font='60px Arial';g.fillText('⭐ ⭐ ⭐',500,480);g.font='24px Arial';g.fillText(tarih,500,590);
 return c.toDataURL('image/png');
}
function oduBelge(){
 if(!oduVar())return;const o=oduGet(st.prof);if(oduYildiz(o.p)<3)return;
 const tarih=new Date().toLocaleDateString('tr-TR'),url=oduBelgeCiz(st.prof,tarih);
 o.b=true;oduSet(st.prof,o);
 modalFocus=document.activeElement;st.modalOpen=true;pauseT();const ov=document.getElementById('ov');ov.className='on';
 ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="oduBelgeT"><h2 id="oduBelgeT">Başarı Belgen</h2><img class="odul-belge" src="'+url+'" alt="Mutfak Başarı Belgesi: '+esc(st.prof)+'"><div class="row"><a class="btn pri" id="oduIndir" href="'+url+'" download="mutfak-basari-belgesi.png">Telefona kaydet</a><button class="btn" id="oduKapat">Kapat</button></div></div>';
 document.getElementById('oduKapat').onclick=function(){closeModal();};
 document.getElementById('oduKapat').focus();
}
/* Ekran bağlantıları */
const ODU_RENDER=render,ODU_BACK=back;
render=function(){
 if(st.screen==='odul'&&oduVar()){document.getElementById('app').innerHTML=oduHTML();const b=document.getElementById('oduBaslik');if(b)b.focus();return;}
 ODU_RENDER();
 if(st.screen==='home'&&oduVar()){
  const app=document.getElementById('app'),sec=app&&app.querySelector('.design-race');
  if(sec&&!document.getElementById('odul-kart')){const o=oduGet(st.prof),kol=oduKol(o),lv=oduSeviye(o.p);
   sec.insertAdjacentHTML('beforebegin','<div class="card ark-live odul-kart" id="odul-kart"><button type="button" class="btn" onclick="oduAc()">🏆 Ödüllerim · '+o.p+' puan'+(o.k&&lv?' · '+kol.list.slice(0,lv).map(x=>x[0]).join(''):'')+'</button></div>');}
 }
};
back=function(){if(st.screen==='odul'){go('home');return;}ODU_BACK();};
