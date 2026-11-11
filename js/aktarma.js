/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Başka cihaza taşıma (aktarma kodu). Sunucuya hiçbir şey yazılmaz, hiçbir şey okunmaz:
   kod yalnız bu cihazda üretilir, öğrencinin kendi taşıdığı dosya ya da metinle öteki cihaza girilir.
   Yalnız seçili profilin kayıtları paketlenir; aynı cihazdaki başka profiller pakete girmez.
   Paket: sürüm, oyun adı, kimlik (pid) ve bu profile ait yerel kayıtlar. Kuyrukta bekleyen gönderimler alınmaz. */
'use strict';
const AK_SURUM=1;
/* pid ya da profil adıyla anahtarlanan kayıtlar (profil silmedeki listeyle aynı mantık). */
const AK_HARITA=['rutbe','odul','rk_best','rk_win','rk_pek','rk_oyun','rk_setting','arena_odul','arena_pek','haftalik','yol_ma','yol_bh','yol_bl','yol_tk_ma','yol_tk_bh','yol_tk_bl','lezzet_tezgah','rk_prof'];
function akHash(s){let h=2166136261>>>0;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return (h>>>0).toString(36);}
function akB64(u8){let s='';const N=0x8000;for(let i=0;i<u8.length;i+=N)s+=String.fromCharCode.apply(null,u8.subarray(i,i+N));return btoa(s);}
function akB64Coz(b){const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u;}
function akSatirla(s){return (s.match(/.{1,76}/g)||[]).join('\n');}

/* ---------- Paket ---------- */
function akPaket(){
 if(st.guest||!st.prof)return null;
 const ad=st.prof,pid=(typeof rkPid==='function'?rkPid(ad):null);
 const harita={};
 AK_HARITA.forEach(k=>{
  const a=ls(k,null);if(!a||typeof a!=='object'||Array.isArray(a))return;
  const al={};[pid,ad].forEach(x=>{if(x&&x in a)al[x]=a[x];});
  if(Object.keys(al).length)harita[k]=al;
 });
 const am=ls('ad_map',{})||{};if(am[ad])harita.ad_map={[ad]:am[ad]};
 const kayit=(ls('records',[])||[]).filter(r=>r&&r.p===ad);
 const tekil={};const sk=ls('ana_son_konu_'+ad,null);if(sk)tekil['ana_son_konu_'+ad]=sk;
 const veri={ad,pid,harita,kayit,tekil};
 return {v:AK_SURUM,uygulama:'mesleki-oyunlar',t:new Date().toISOString(),ks:akHash(JSON.stringify(veri)),veri};
}
async function akKodYap(){
 const p=akPaket();if(!p)return null;
 const metin=JSON.stringify(p),bayt=new TextEncoder().encode(metin);
 if(typeof CompressionStream!=='undefined'){
  try{
   const akis=new Blob([bayt]).stream().pipeThrough(new CompressionStream('gzip'));
   const tampon=await new Response(akis).arrayBuffer();
   return 'MOZ1:'+akB64(new Uint8Array(tampon));
  }catch(e){}
 }
 return 'MOD1:'+akB64(bayt);
}
async function akKodCoz(kod){
 const temiz=String(kod||'').replace(/\s+/g,'');
 const m=temiz.match(/^(MOZ1|MOD1):(.+)$/);
 if(!m)throw Error('Bu bir aktarma kodu değil. Kodun tamamını yapıştır.');
 let bayt;try{bayt=akB64Coz(m[2]);}catch(e){throw Error('Kod eksik ya da bozuk görünüyor.');}
 if(m[1]==='MOZ1'){
  if(typeof DecompressionStream==='undefined')throw Error('Bu tarayıcı kodu açamıyor. Güncel bir tarayıcı dene.');
  try{
   const akis=new Blob([bayt]).stream().pipeThrough(new DecompressionStream('gzip'));
   bayt=new Uint8Array(await new Response(akis).arrayBuffer());
  }catch(e){throw Error('Kod eksik ya da bozuk görünüyor.');}
 }
 let p;try{p=JSON.parse(new TextDecoder().decode(bayt));}catch(e){throw Error('Kod eksik ya da bozuk görünüyor.');}
 if(!p||p.uygulama!=='mesleki-oyunlar'||!p.veri||!p.veri.ad)throw Error('Bu kod bu oyuna ait değil.');
 if(p.v>AK_SURUM)throw Error('Bu kod oyunun daha yeni bir sürümünden. Önce bu cihazdaki oyunu güncelle.');
 if(p.ks&&p.ks!==akHash(JSON.stringify(p.veri)))throw Error('Kod eksik ya da bozuk görünüyor.');
 return p;
}
/* Paketi bu cihaza yazar. Aynı addaki profilin kayıtlarının üzerine yazar; başka profillere dokunmaz. */
function akYukle(p){
 const v=p.veri,ad=v.ad,pid=v.pid;
 const profiller=(ls('profiles',[])||[]).slice();
 if(!profiller.includes(ad)){profiller.push(ad);lsSet('profiles',profiller);}
 if(pid){const ids=ls('rk_ids',{})||{};ids[ad]=pid;lsSet('rk_ids',ids);}
 Object.entries(v.harita||{}).forEach(([k,al])=>{
  if(k==='ad_map'){const a=ls('ad_map',{})||{};Object.assign(a,al);lsSet('ad_map',a);return;}
  if(!AK_HARITA.includes(k))return;
  const a=ls(k,{})||{};Object.assign(a,al);lsSet(k,a);
 });
 const eski=(ls('records',[])||[]).filter(r=>!r||r.p!==ad);
 lsSet('records',eski.concat(Array.isArray(v.kayit)?v.kayit:[]));
 Object.entries(v.tekil||{}).forEach(([k,val])=>{if(/^ana_son_konu_/.test(k))lsSet(k,val);});
 return ad;
}

/* ---------- Ekranlar ---------- */
function akKapat(){closeModal();if(typeof render==='function')render();}
function akKutu(ic){
 modalFocus=document.activeElement;st.modalOpen=true;if(typeof pauseT==='function')pauseT();
 const ov=document.getElementById('ov');ov.className='on';
 ov.innerHTML='<div class="modal ak-modal" role="dialog" aria-modal="true" aria-labelledby="akBaslik">'+ic+'</div>';
}
window.akAc=function(){
 if(st.guest||!st.prof){if(typeof adToast==='function')adToast('Taşıma için kayıtlı profilini seç.');return;}
 akKutu('<h2 id="akBaslik">Başka cihaza taşı</h2>'+
  '<p>Çalışmanı bu cihazdan alıp bilgisayarda ya da başka bir telefonda sürdürebilirsin.</p>'+
  '<div class="list"><button type="button" class="btn" id="akAl">Bu cihazdan kod al</button>'+
  '<button type="button" class="btn" id="akVer">Başka cihazdan gelen kodu yükle</button></div>'+
  '<p class="note">Kod yalnız senin cihazlarında kalır; hiçbir yere gönderilmez.</p>'+
  '<button type="button" class="btn pri" id="akKapat">Kapat</button>');
 document.getElementById('akAl').onclick=akAlEkrani;
 document.getElementById('akVer').onclick=akVerEkrani;
 document.getElementById('akKapat').onclick=akKapat;
 document.getElementById('akKapat').focus();
};
async function akAlEkrani(){
 akKutu('<h2 id="akBaslik">Bu cihazdan kod al</h2><p>Kod hazırlanıyor…</p>');
 let kod=null,hata='';
 try{kod=await akKodYap();}catch(e){hata=e.message||'Kod hazırlanamadı.';}
 if(!kod){akKutu('<h2 id="akBaslik">Bu cihazdan kod al</h2><p role="alert">'+esc(hata||'Kod hazırlanamadı.')+'</p><button type="button" class="btn pri" id="akGeri">Geri</button>');document.getElementById('akGeri').onclick=window.akAc;return;}
 const kb=Math.max(1,Math.round(kod.length/1024));
 akKutu('<h2 id="akBaslik">Bu cihazdan kod al</h2>'+
  '<p>Öteki cihazda <b>Başka cihaza taşı → Kodu yükle</b> deyip bu kodu yapıştır.</p>'+
  '<textarea id="akMetin" class="ak-metin" readonly rows="6" aria-label="Aktarma kodu">'+esc(akSatirla(kod))+'</textarea>'+
  '<div class="row"><button type="button" class="btn" id="akKopya">Kopyala</button><button type="button" class="btn" id="akDosya">Dosya olarak indir</button></div>'+
  '<p class="note">Kod yaklaşık '+kb+' KB. Uzun olduğu için elle yazılmaz; kopyala ya da dosyayı kullan. Kodda oyun adın ve çalışma kayıtların var, başkasıyla paylaşma.</p>'+
  '<button type="button" class="btn pri" id="akGeri">Geri</button>');
 document.getElementById('akKopya').onclick=async function(){
  const t=document.getElementById('akMetin');t.select();
  let oldu=false;
  try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(kod);oldu=true;}}catch(e){}
  if(!oldu){try{oldu=document.execCommand('copy');}catch(e){}}
  if(typeof adToast==='function')adToast(oldu?'Kod kopyalandı.':'Kopyalanamadı. Metni seçip kendin kopyala.');
 };
 document.getElementById('akDosya').onclick=function(){
  const b=new Blob([kod],{type:'text/plain'}),u=URL.createObjectURL(b),a=document.createElement('a');
  a.href=u;a.download='mesleki-oyunlar-aktarma.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
 };
 document.getElementById('akGeri').onclick=window.akAc;
 document.getElementById('akGeri').focus();
}
function akVerEkrani(){
 akKutu('<h2 id="akBaslik">Kodu yükle</h2>'+
  '<p>Öteki cihazdan aldığın kodu yapıştır ya da indirdiğin dosyayı seç.</p>'+
  '<textarea id="akGiris" class="ak-metin" rows="6" aria-label="Aktarma kodu" placeholder="MOZ1:…"></textarea>'+
  '<div class="row"><label class="btn ak-dosya" for="akDos">Dosya seç<input type="file" id="akDos" accept=".txt,.json,text/plain"></label></div>'+
  '<p class="note" id="akNot">Bu cihazda aynı adlı bir profil varsa onun kayıtlarının üzerine yazılır.</p>'+
  '<div class="row"><button type="button" class="btn" id="akGeri">Geri</button><button type="button" class="btn pri" id="akYukle">Yükle</button></div>');
 const not=document.getElementById('akNot');
 document.getElementById('akDos').onchange=function(e){
  const f=e.target.files&&e.target.files[0];if(!f)return;
  const fr=new FileReader();fr.onload=()=>{document.getElementById('akGiris').value=String(fr.result||'');not.textContent='Dosya okundu. Şimdi Yükle düğmesine dokun.';};
  fr.onerror=()=>{not.textContent='Dosya okunamadı.';};fr.readAsText(f);
 };
 document.getElementById('akGeri').onclick=window.akAc;
 document.getElementById('akYukle').onclick=async function(){
  const kod=document.getElementById('akGiris').value;
  not.textContent='Kod okunuyor…';
  let p;try{p=await akKodCoz(kod);}catch(e){not.textContent=e.message||'Kod okunamadı.';return;}
  const ad=p.veri.ad,tarih=p.t?new Date(p.t).toLocaleDateString('tr-TR'):'';
  akKutu('<h2 id="akBaslik">Kodu yükle</h2>'+
   '<p>Kod okundu: <b>'+esc(ad)+'</b>'+(tarih?' · '+esc(tarih):'')+'</p>'+
   '<p>Bu profilin ilerlemesi, rütbesi ve çalışma geçmişi bu cihaza yazılacak. Bu cihazda aynı adlı profil varsa kayıtlarının üzerine yazılır.</p>'+
   '<div class="row"><button type="button" class="btn" id="akVaz">Vazgeç</button><button type="button" class="btn pri" id="akOnay">Yükle</button></div>');
  document.getElementById('akVaz').onclick=window.akAc;
  document.getElementById('akOnay').onclick=function(){
   let yazilan='';try{yazilan=akYukle(p);}catch(e){
    akKutu('<h2 id="akBaslik">Kodu yükle</h2><p role="alert">Yüklenemedi. Cihazın deposu dolu olabilir.</p><button type="button" class="btn pri" id="akGeri2">Geri</button>');
    document.getElementById('akGeri2').onclick=window.akAc;return;}
   akKutu('<h2 id="akBaslik">Yüklendi</h2><p><b>'+esc(yazilan)+'</b> bu cihaza taşındı. Profil listesinden bu profili seçip devam edebilirsin.</p><button type="button" class="btn pri" id="akBitti">Tamam</button>');
   document.getElementById('akBitti').onclick=function(){closeModal();if(typeof go==='function')go('profiles');};
   document.getElementById('akBitti').focus();
  };
  document.getElementById('akOnay').focus();
 };
 document.getElementById('akGiris').focus();
}

/* Profil ayrıntısı penceresine "Başka cihaza taşı" düğmesini ekler. */
const AK_PROFIL=profilAyrintiAc;
profilAyrintiAc=function(){
 const r=AK_PROFIL.apply(this,arguments);
 if(st.guest)return r;
 /* Taşıma düğmesi silme düğmesinden önce durur: yıkıcı işlem en sonda kalsın. */
 const hedef=document.getElementById('profileWipe')||document.getElementById('profileClose');
 if(!hedef||document.getElementById('akTasi'))return r;
 hedef.insertAdjacentHTML('beforebegin','<button type="button" class="btn" id="akTasi">Başka cihaza taşı</button>');
 const b=document.getElementById('akTasi');
 if(b)b.onclick=function(){closeModal();window.akAc();};
 return r;
};
