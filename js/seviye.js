/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Aşçı Seviyesi (14.11.2026, 2. aşama): rütbe puanlarının toplamı XP sayılır; ayrı bir puan sistemi yoktur.
   Eşik: seviye k için 15·(k−1)·k puan (2: 30, 5: 300, 10: 1350).
   Açılış: 10 → Mutfağa Kabul Sınavı ve dereceli lig (sonraki aşama). Bugün kullanılan modlar (Kapışma, Er Meydanı, Meydan Okuma) her seviyede açık.
   Kodla girme ve açık odaya katılma her seviyede serbesttir.
   Geçmiş çalışmalar sayılır ama bu sürümden önce toplanan puan en çok 9. seviyeye götürür (sv_baz). */
'use strict';
/* 14.11 karar (Valorant gibi): bugün kullanılan her şey açık kalır; kilit yalnız yeni dereceli moda (Mutfağa Kabul Sınavı, 10. seviye). */
const SV={max:30,ac:{kabul:10},ad:{kabul:'Mutfağa Kabul Sınavı ve dereceli lig'}};
function svEsik(k){return 15*(k-1)*k;}
/* Seviye arması: Pastacının Yolu rozetleri gibi koyu yeşil kalkan, altın çerçeve, üstte yıldız. */
function svArma(k,boy){boy=boy||34;return '<svg class="sv-arma" width="'+boy+'" height="'+Math.round(boy*1.15)+'" viewBox="0 0 60 69" aria-hidden="true"><defs><linearGradient id="svAltin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a3"/><stop offset=".45" stop-color="#e0a21b"/><stop offset="1" stop-color="#9c6a08"/></linearGradient><linearGradient id="svYesil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f7a72"/><stop offset="1" stop-color="#0b3f3c"/></linearGradient></defs><path d="M30 8 L53 16 V36 C53 51 42 61 30 66 C18 61 7 51 7 36 V16 Z" fill="url(#svAltin)"/><path d="M30 12.5 L49 19 V36 C49 48.5 40 57 30 61.5 C20 57 11 48.5 11 36 V19 Z" fill="url(#svYesil)"/><path d="M30 1 l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="url(#svAltin)" stroke="#7a5206" stroke-width=".8"/><path d="M14 21 Q30 15 46 21" stroke="#ffffff33" stroke-width="2" fill="none"/><text x="30" y="'+(k>=10?45:46)+'" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="'+(k>=10?20:24)+'" fill="#fff8e1" stroke="#0b3f3c" stroke-width=".6">'+k+'</text></svg>';}
function svPid(){return (!st.guest&&st.prof&&typeof rkPid==='function')?rkPid(st.prof,true):null;}
function svPuan(pid){
 pid=pid||svPid();if(!pid||typeof rutbeGenel!=='function')return 0;
 const mp=rutbeGenel(pid).mp||0,baz=ls('sv_baz',{});
 if(baz[pid]===undefined){baz[pid]=mp;lsSet('sv_baz',baz);}
 return Math.max(0,mp-Math.max(0,baz[pid]-svEsik(9)));
}
function svSeviye(pid){const p=svPuan(pid);let k=1;while(k<SV.max&&p>=svEsik(k+1))k++;return k;}
function svAcik(mod){return svSeviye()>=(SV.ac[mod]||1);}
function svKalan(){const k=svSeviye(),p=svPuan();return k>=SV.max?0:svEsik(k+1)-p;}
function svKilitHTML(mod){return '<small class="sv-kilit">🔒 '+SV.ac[mod]+'. seviyede açılır</small>';}
function svKilit(mod){
 const k=svSeviye(),gerek=SV.ac[mod];
 const m=st.guest||!st.prof?'Bunun için profil oluştur ve çalışarak seviye kazan.':SV.ad[mod]+' '+gerek+'. seviyede açılır. Şu an '+k+'. seviyedesin. Yolculuğunda çalışarak puan topla.';
 if(typeof adToast==='function')adToast(m);if(typeof sesSoyle==='function')try{sesSoyle(m);}catch(e){}
}
/* Seviye paneli: ana ekrandaki rozet açar. */
function svPanel(){
 const k=svSeviye(),p=svPuan(),alt=svEsik(k),ust=svEsik(k+1),yuzde=k>=SV.max?100:Math.round(100*(p-alt)/(ust-alt));
 const satir=Object.keys(SV.ac).map(m=>{const a=k>=SV.ac[m];return '<li class="'+(a?'acik':'')+'">'+(a?'✅':'🔒')+' <b>'+SV.ac[m]+'. seviye:</b> '+SV.ad[m]+(m==='kabul'?' (yakında)':'')+'</li>';}).join('');
 const kutu=document.createElement('div');kutu.className='mola-kutu';kutu.id='svKutu';kutu.setAttribute('role','dialog');kutu.setAttribute('aria-modal','true');
 kutu.innerHTML='<div class="mola-ic sv-ic"><div class="sv-buyuk" aria-hidden="true">'+svArma(k,84)+'</div><h2>Aşçı Seviyesi '+k+'</h2><div class="sv-cubuk" aria-hidden="true"><i style="width:'+yuzde+'%"></i></div><p>'+(k>=SV.max?'En yüksek seviyedesin.':'Sonraki seviyeye <b>'+(ust-p)+' puan</b> kaldı.')+'</p><p class="mola-not">Yolculuk bölümleri, sorular, kartlar ve Ustalar Ligi maçları puan kazandırır.</p><ul class="sv-liste">'+satir+'</ul><button type="button" class="btn pri" id="svKapat">Tamam</button></div>';
 document.body.appendChild(kutu);kutu.addEventListener('click',e=>{if(e.target===kutu)kutu.remove();});document.getElementById('svKapat').onclick=()=>kutu.remove();document.getElementById('svKapat').focus();
}
/* Seviye atlayınca kutlama: rütbe puanı yazıldıktan sonra karşılaştırılır. */
if(typeof rutbeComplete==='function'){
 const SV_RC=rutbeComplete;
 rutbeComplete=function(e){
  const once=svPid()?svSeviye():null,r=SV_RC(e);
  try{if(once!==null){const sonra=svSeviye();if(sonra>once){const acilan=Object.keys(SV.ac).filter(m=>SV.ac[m]>once&&SV.ac[m]<=sonra&&m!=='kabul').map(m=>SV.ad[m]);
   const m='Tebrikler Şefim! Aşçı Seviyesi '+sonra+'.'+(acilan.length?' Açıldı: '+acilan.join(', ')+'.':'');
   setTimeout(()=>{if(typeof adToast==='function')adToast('⭐ '+m);if(typeof sesSoyle==='function')try{sesSoyle(m);}catch(x){}try{sesEfekt('yildiz');}catch(x){}},1200);}}}catch(x){}
  return r;
 };
}
/* Ustalar Ligi: kurma düğmeleri seviyeye göre kilitli. */
if(false&&typeof yrMenuHTML==='function'){
 const SV_MENU=yrMenuHTML;
 yrMenuHTML=function(){
  let h=SV_MENU();
  [['duel',"yrCreateOpen('duel')"],['arena',"yrCreateOpen('arena')"],['canavar',"yrCreateOpen('canavar')"]].forEach(([m,on])=>{
   if(svAcik(m))return;
   const esc1=on.replace(/'/g,"\\'");
   h=h.replace(new RegExp('(<button class="btn[^"]*") onclick="'+esc1.replace(/[()]/g,'\\$&')+'"([^>]*)>([^<]*)</button>'),(all,a,b,t)=>a.replace('class="btn','class="btn sv-kilitli')+' onclick="svKilit(\''+m+'\')"'+b.replace(' disabled','')+' aria-disabled="true">'+t+svKilitHTML(m)+'</button>');
  });
  return h;
 };
}
/* Ana ekran: adın yanında seviye rozeti. */
if(typeof render==='function'){
 const SV_RENDER=render;
 render=function(){
  SV_RENDER.apply(this,arguments);
  try{if(st.screen==='home'&&svPid()){const ad=document.querySelector('.ae-profile-name');if(ad&&!ad.querySelector('.sv-chip')){const k=svSeviye();ad.insertAdjacentHTML('beforeend',' <button type="button" class="sv-chip" onclick="svPanel()" aria-label="Aşçı Seviyesi '+k+'. Ayrıntılar">'+svArma(k,26)+'<span>Seviye</span></button>');}}}catch(e){}
 };
}
/* 14.11: Ustalar Ligi iki bölüm. Derecesiz maçlar herkese açık (eğlence, XP kazandırır, lig puanı yok).
   Dereceli lig 10. seviyede ve Mutfağa Kabul Sınavı ile açılır; neden kilitli olduğu açıkça yazılır. */
if(typeof yrMenuHTML==='function'){
 const SV_MENU2=yrMenuHTML;
 yrMenuHTML=function(){
  let h=SV_MENU2();
  if(h.indexOf('<div class="lb-eylem">')<0)return h;
  const k=svPid()?svSeviye():1,acik=k>=SV.ac.kabul;
  h=h.replace('<div class="lb-eylem">','<h2 class="sv-mod-bas">🎉 Derecesiz maçlar <small>Herkese açık · XP kazandırır · lig puanı yok</small></h2><div class="lb-eylem">');
  const kart='<section class="sv-dereceli'+(acik?' acik':'')+'" aria-label="Dereceli lig"><div class="sv-d-bas">'+svArma(k,40)+'<div><h2>🏆 Dereceli lig '+(acik?'<span class="sv-yakin">yakında</span>':'<span class="sv-kilit-et">🔒 Kilitli</span>')+'</h2><p>Dereceli maçlar lig puanı ve sezon ödülü verir. Herkes kendi düzeyindeki oyuncularla yarışsın diye bir şartı var.</p></div></div>'+
   '<ul><li class="'+(k>=SV.ac.kabul?'ok':'')+'">'+(k>=SV.ac.kabul?'✅':'⬜')+' Aşçı Seviyesi 10 <small>(şu an '+k+')</small></li><li>⬜ Mutfağa Kabul Sınavı (5 yerleştirme maçı)</li></ul>'+
   '<p class="sv-d-not">Derecesiz maçları her zaman oynayabilirsin. Seviye, çalıştıkça ve oynadıkça yükselir.</p></section>';
  h=h.replace(/(<div class="lb-eylem">[\s\S]*?<\/div>)/,'$1'+kart);
  return h;
 };
}
