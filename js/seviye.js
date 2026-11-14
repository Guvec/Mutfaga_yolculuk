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
 kutu.innerHTML='<div class="mola-ic sv-ic"><div class="sv-buyuk" aria-hidden="true">'+k+'</div><h2>Aşçı Seviyesi '+k+'</h2><div class="sv-cubuk" aria-hidden="true"><i style="width:'+yuzde+'%"></i></div><p>'+(k>=SV.max?'En yüksek seviyedesin.':'Sonraki seviyeye <b>'+(ust-p)+' puan</b> kaldı.')+'</p><p class="mola-not">Yolculuk bölümleri, sorular, kartlar ve Ustalar Ligi maçları puan kazandırır.</p><ul class="sv-liste">'+satir+'</ul><button type="button" class="btn pri" id="svKapat">Tamam</button></div>';
 document.body.appendChild(kutu);kutu.addEventListener('click',e=>{if(e.target===kutu)kutu.remove();});document.getElementById('svKapat').onclick=()=>kutu.remove();document.getElementById('svKapat').focus();
}
/* Seviye atlayınca kutlama: rütbe puanı yazıldıktan sonra karşılaştırılır. */
if(typeof rutbeComplete==='function'){
 const SV_RC=rutbeComplete;
 rutbeComplete=function(e){
  const once=svPid()?svSeviye():null,r=SV_RC(e);
  try{if(once!==null){const sonra=svSeviye();if(sonra>once){const acilan=Object.keys(SV.ac).filter(m=>SV.ac[m]>once&&SV.ac[m]<=sonra&&m!=='kabul').map(m=>SV.ad[m]);
   const m='Tebrikler Şefim! Aşçı Seviyesi '+sonra+'.'+(acilan.length?' Açıldı: '+acilan.join(', ')+'.':'');
   setTimeout(()=>{if(typeof adToast==='function')adToast('⭐ '+m);if(typeof sesSoyle==='function')try{sesSoyle(m);}catch(x){}if(typeof EFEKT!=='undefined')try{EFEKT.cal('tur');}catch(x){}},1200);}}}catch(x){}
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
  try{if(st.screen==='home'&&svPid()){const ad=document.querySelector('.ae-profile-name');if(ad&&!ad.querySelector('.sv-chip')){const k=svSeviye();ad.insertAdjacentHTML('beforeend',' <button type="button" class="sv-chip" onclick="svPanel()" aria-label="Aşçı Seviyesi '+k+'. Ayrıntılar">⭐ Seviye '+k+'</button>');}}}catch(e){}
 };
}
