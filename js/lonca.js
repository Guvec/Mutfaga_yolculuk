/* © 2026 Ali Arıkoğlu. Ortak lonca arayüzü; oyun kurallarını değiştirmez. */
'use strict';
(function(){
 const root=document.documentElement;
 const A='assets/lonca/';
 const INFO={dost:['Aşçı Dostum','Birlikte hazırlayacağınız çok şey var.'],lig:['Ustalar Ligi','Yarışlara buradan katıl.'],sira:['Sıralama','Oyunlardaki sıralamanı gör.'],rozet:['Rozetlerim','Kazandığın rozetleri ve kazanma koşullarını burada gör.']};
 const S={note:'<path d="M9 18V5l11-2v13M9 7l11-2"/><ellipse cx="5.5" cy="18" rx="3.5" ry="2.5"/><ellipse cx="16.5" cy="16" rx="3.5" ry="2.5"/>',friends:'<circle cx="8" cy="7" r="3"/><circle cx="18" cy="8" r="2.5"/><path d="M2 21v-3a6 6 0 0 1 12 0v3zM16 14a5 5 0 0 1 6 4v3h-5"/>',settings:'<path d="M10 2h4l1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3L1 9l2-4 3 1 3-1z"/><circle cx="12" cy="12" r="4"/>'};
 function yolDevam(){try{const pid=st.prof&&!st.guest&&typeof rkPid==='function'?rkPid(st.prof,false):null;return !!pid&&typeof rutbeState==='function'&&(rutbeState(pid).mp||0)>0;}catch(e){return false;}}
function ico(k){return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">'+S[k]+'</svg>';}
 function emblem(i){return '<svg class="lc-emblem" viewBox="0 0 724 724" aria-hidden="true"><svg viewBox="'+(i*724)+' 0 724 724" width="724" height="724"><image href="'+A+'menu-armalari.png" width="2172" height="724"/></svg></svg>';}
 function portrait(){return typeof anaProfilGorsel==='function'?anaProfilGorsel():'<span aria-hidden="true">'+esc(adEmo(st.prof))+'</span>';}
 function companion(){const id=dostSecili(),art=DOST_CHARACTERS[id].art;if(id==='panda'&&typeof sahnePandaYigin==='function')return sahnePandaYigin();return '<img class="lc-companion" src="assets/ascidostum/'+art+'.webp" alt="" width="414" height="414">';}
 function card(k,title,action,art){return '<article class="lc-card'+(k==='dost'?' lc-dost':'')+'"><button class="lc-card-open" type="button" onclick="'+action+'" aria-label="'+title+'"><span class="lc-stage">'+art+(k==='dost'&&art.indexOf('lc-poz-yigin')<0?'<span class="ae-dost-poz" aria-hidden="true"><img alt=""></span>':'')+'</span><span class="lc-nameplate lc-title">'+title+'</span></button><button type="button" class="lc-info" aria-label="'+title+' hakkında bilgi" onclick="loncaBilgi(\''+k+'\')">i</button><span class="lc-knot" aria-hidden="true">⌘</span></article>';}
 window.loncaHome=function(rank){
  const name=st.guest?'Misafir':st.prof?adRest(st.prof):'Karakterini seç';
  const selected=dostSecili(),branch=ls('ana_yol','sicak');
  const scene=selected==='panda'?A+'yolculuk-panda-yol.webp':'assets/ascidostum/ana-'+(selected==='rabbit'?'tavsan':selected)+'-'+(branch==='pasta'?'pastacilik':branch==='servis'?'servis':'sicak')+'.webp';
  return '<div class="lc-home"><header class="lc-header lc-paper"><button class="lc-profile" type="button" onclick="anaProfil()" aria-label="'+esc(name)+'. Profil ve oyuncu kodu"><span class="lc-avatar">'+portrait()+'</span><strong class="lc-title">'+esc(name)+'</strong></button><button class="lc-tool" type="button" onclick="muzikAcKapa()" aria-label="Müzik: '+(MUZIK.acikMi()?'Açık':'Kapalı')+'" aria-pressed="'+MUZIK.acikMi()+'">'+ico('note')+'</button><button class="lc-tool" type="button" onclick="anaArkadas()" aria-label="Arkadaşlar">'+ico('friends')+'</button><button class="lc-tool" type="button" onclick="anaAyarlar()" aria-label="Ayarlar">'+ico('settings')+'</button></header><div class="lc-rank lc-paper">'+rank+'</div><button type="button" class="lc-journey" style="--lc-scene:url(\''+new URL(scene,document.baseURI).href+'\')" onclick="loncaYolAc()"><span class="lc-journey-copy"><strong class="lc-title lc-gizli">Yolculuğum</strong><span class="lc-yol-alt">Senin yolun, senin hikâyen.</span><span class="lc-yol-dugme">'+(yolDevam()?'Yolculuğa devam et':'Yolculuğa başla')+' <b aria-hidden="true">›</b></span></span><span class="lc-kis-yol-etiket lc-title">Yolculuğum <span aria-hidden="true">›</span></span></button><nav class="lc-grid" aria-label="Ana menü">'+card('dost','Aşçı Dostum','anaDostMutfak()',companion())+card('lig','Ustalar Ligi',"tasarimOda('create')",emblem(0))+card('sira','Sıralama','rkOpenBoard()',emblem(1))+card('rozet','Rozetlerim','loncaRozetAc()',emblem(2))+'</nav>'+automaticHelp()+'</div>';
 };
 function automaticHelp(){
  if(!ls('lonca_yardim',true)||ls('lonca_yardim_goruldu',false)||!st.prof)return '';
  return '<aside class="lc-onboard lc-paper" aria-label="Kısa yardım"><p>Kartlara dokunarak aç. Bilgi için <b>i</b> düğmesini kullan.</p><label><input type="checkbox" onchange="lsSet(\'lonca_yardim\',!this.checked)"> Bir daha otomatik gösterme</label><button type="button" class="btn" onclick="lsSet(\'lonca_yardim_goruldu\',true);render()">Kapat</button></aside>';
 }
 window.loncaYolAc=function(){go('loncayollar');};
 window.anaProfil=function(){
  if(!st.prof&&!st.guest){go('profiles');return;}if(st.modalOpen)return;
  const name=st.guest?'Misafir':adRest(st.prof);
  const box=ayAc('<button class="lc-close" type="button" aria-label="Kapat" onclick="closeModal()">×</button><h2 class="lc-title">Profilim</h2><div class="lc-profile-portrait">'+portrait()+'</div><h3 class="lc-title">'+esc(name)+'</h3>'+(st.guest?'<p>Misafir oturumunda sonuçlar kaydedilmez.</p>':'<section id="profileCode" aria-live="polite"></section>')+'<div class="row"><button class="btn" type="button" onclick="closeModal();hesabimAc()">Hesabım</button><button class="btn pri" type="button" onclick="closeModal()">Kapat</button></div>','Profilim');
  box.classList.add('lc-parchment');if(!st.guest)profilKodGuncelle(true);box.querySelector('.lc-close').focus();
 };
 window.loncaRozetAc=rozetlerAc;
 function yollar(){return topBar('Yolculuğum')+'<div class="wrap lc-path-page"><h1 class="lc-title">Hikâyen hangi yoldan ilerlesin?</h1><p>Meslek alanını seç.</p><div class="lc-path-choices">'+[['sicak','Sıcak Mutfak'],['pasta','Pastacılık'],['servis','Servis']].map(([id,ad])=>'<button type="button" class="lc-paper lc-path" onclick="anaYol(\''+id+'\')"><img src="assets/ascidostum/dal-'+dostSecili()+'-'+id+'.webp" alt=""><strong class="lc-title">'+ad+'</strong><span aria-hidden="true">›</span></button>').join('')+'</div></div>';}
 window.loncaBilgi=function(k,automatic){
  if(!INFO[k]||st.modalOpen)return;
  const [title,copy]=INFO[k];
  const art=k==='dost'?companion():emblem({lig:0,sira:1,rozet:2}[k]);
  const box=ayAc('<button type="button" class="lc-close" aria-label="Kapat" onclick="closeModal()">×</button><h2 class="lc-title">'+title+'</h2><div class="lc-help-art">'+art+'</div><p>'+copy+'</p><label class="lc-help-choice"><input type="checkbox" id="lcHelpOff"> Bir daha otomatik gösterme</label><button class="btn pri" type="button" onclick="closeModal()">Anladım</button><span class="lc-seal" aria-hidden="true">♜</span>',title+' hakkında bilgi');
  box.classList.add('lc-parchment');
  box.querySelector('#lcHelpOff').checked=!ls('lonca_yardim',true);
  box.querySelector('#lcHelpOff').onchange=e=>lsSet('lonca_yardim',!e.target.checked);
  box.querySelector('.lc-close').focus();
  if(automatic)lsSet('lonca_yardim_goruldu',true);
 };
 function fontApply(){root.dataset.font=ls('lonca_yazi','hikaye')==='sade'?'sade':'hikaye';}
 fontApply();
 window.loncaYaziSec=function(v){lsSet('lonca_yazi',v==='sade'?'sade':'hikaye');fontApply();};
 const settings=anaAyarlar;
 anaAyarlar=function(){settings();const box=document.querySelector('#ov .ay-modal');if(!box)return;
  const group=document.createElement('section');group.className='lc-preferences';group.innerHTML='<h3>Yazı ve yardım</h3><label for="lcFont">Yazı görünümü</label><select id="lcFont"><option value="hikaye">Hikâye yazısı — Almendra uyarlaması</option><option value="sade">Sade yazı — Lexend</option></select><p class="lc-title lc-font-preview">Yolculuğum · Aşçı Dostum · Sıralama</p><label class="lc-help-choice"><input id="lcHelp" type="checkbox"> Otomatik yardımları göster</label>';
  const close=box.querySelector('.ay-kapat');box.insertBefore(group,close);group.querySelector('#lcFont').value=ls('lonca_yazi','hikaye');group.querySelector('#lcFont').onchange=e=>loncaYaziSec(e.target.value);group.querySelector('#lcHelp').checked=ls('lonca_yardim',true);group.querySelector('#lcHelp').onchange=e=>lsSet('lonca_yardim',e.target.checked);
 };
 const oldRender=render;
 render=function(){
  if(st.screen==='loncayollar'){document.body.classList.remove('ae-is-home','oyun-ekrani');document.body.dataset.screen=st.screen;document.getElementById('app').innerHTML=yollar();}else oldRender.apply(this,arguments);
  decorate();
 };
 const oldBack=back;back=function(){if(st.modalOpen){closeModal();return;}if(st.screen==='loncayollar'){go('home');return;}oldBack.apply(this,arguments);};
 const oldClose=closeModal;closeModal=function(){const focus=typeof modalFocus!=='undefined'?modalFocus:null;oldClose.apply(this,arguments);if(focus?.isConnected)focus.focus();};
 function decorate(){
  if(!window.document)return;
  document.querySelectorAll('#ov .modal').forEach(box=>{box.classList.add('lc-parchment');if(!box.querySelector('[aria-label="Kapat"],#profileClose,.ay-kapat,#mNo')){const b=document.createElement('button');b.type='button';b.className='lc-close';b.textContent='×';b.setAttribute('aria-label','Kapat');b.onclick=()=>closeModal();box.prepend(b);}});
 }
 const observer=new MutationObserver(()=>decorate());observer.observe(document.getElementById('ov'),{childList:true,subtree:true});
 document.addEventListener('keydown',e=>{
  if(!st.modalOpen)return;const box=document.querySelector('#ov .modal');if(!box)return;
  if(e.key==='Escape'&&!st.inBreak){e.preventDefault();closeModal();return;}
  if(e.key==='Tab'){const a=[...box.querySelectorAll('button,input,select,a[href],[tabindex="0"]')].filter(n=>!n.disabled&&!n.hidden);if(!a.length)return;const first=a[0],last=a[a.length-1];if(e.shiftKey&&(document.activeElement===first||!box.contains(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!box.contains(document.activeElement))){e.preventDefault();first.focus();}}
 });
 render();
})();
