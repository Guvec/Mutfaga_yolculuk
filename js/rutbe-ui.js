/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
'use strict';
const RUTBE_ROZET={
 arac:{ad:'Araçları Tanıyorum',gorsel:'ascidostum/konu-araclar.webp',
  kosul:'Mutfak Araçları yolculuğunun bütün bölümlerini ve etap sonlarını bitir.',
  tamam:'Mutfak Araçları yolculuğunun bütün bölümlerini ve etap sonlarını bitirdin.'},
 baharat:{ad:'Baharatları Tanıyorum',gorsel:'ascidostum/konu-baharat.webp',
  kosul:'Baharat yolculuğunun bütün bölümlerini ve etap sonlarını bitir.',
  tamam:'Baharat yolculuğunun bütün bölümlerini ve etap sonlarını bitirdin.'},
 kuver:{ad:'Kuver Ustası',gorsel:'ascidostum/konu-kuver.webp',
  kosul:'Basit Kuver ve Tabldot Kuver değerlendirmelerinde hatasız ol.',
  tamam:'Basit Kuver ve Tabldot Kuver değerlendirmelerinde hatasız oldun.'},
 temizlik:{ad:'Temizlik ve Düzen',gorsel:'ascidostum/konu-bulasik.webp',
  kosul:'Bulaşık eşleştirmede en az 10/12, bulaşık sorularında 65 sorudan en az 55 doğru.',
  tamam:'Bulaşık eşleştirmede en az 10/12, bulaşık sorularında 65 sorudan en az 55 doğru yaptın.'},
 karisik:{ad:'Karışık Oyun Ustası',gorsel:'tasarim/sef-kepi-128.png',
  kosul:'Bütün konular kapsamında 5 oturum tamamla; birinde en az %70 doğru yap.',
  tamam:'Bütün konular kapsamında 5 oturum tamamladın; birinde en az %70 doğru yaptın.'},
 rekor:{ad:'Kendi Rekorumu Aştım',gorsel:'lig/sezon-kupasi.webp',
  kosul:'En az 5 farklı tabloda kendi rekorunu geç.',
  tamam:'En az 5 farklı tabloda kendi rekorunu geçtin.'}
};
/* Dal puanı ayrı, günlük sınır, rekor, rozet ve görev kayıtları ortaktır. */
const RUTBE_DALLAR=Object.keys(RUTBE_AYAR.dallar);
function rutbeDal(){const y=ls('ana_yol','sicak');return RUTBE_DALLAR.includes(y)?y:'sicak';}
function rutbeDalAll(){return ls('rutbe_dal',{});}
function rutbeDalState(pid,dal){
 const x=rutbeDalAll()[pid]?.[dal||rutbeDal()];
 const mp=(x||rutbeAll()[pid])?.mp||0;
 return {...x,mp,rank:Rutbe.level(mp)};
}
function rutbeDalYaz(pid,eski){
 const all=rutbeDalAll();if(!all[pid]){const mp=eski?.mp||0;all[pid]={};RUTBE_DALLAR.forEach(d=>all[pid][d]={mp,rank:Rutbe.level(mp)});}
 return all;
}
function rutbeAdHTML(step,dal){
 const ad=esc(Rutbe.name(step.rank,dal));
 if(!step.stars)return ad;
 return '<span aria-hidden="true">'+ad+' <span class="ry-yildizlar">'+'★'.repeat(step.stars)+'</span></span>'+
  '<span class="sr-only">'+esc(Rutbe.rankText(step,dal,true))+'</span>';
}
/* Altıncı rütbe için aynı dalın mevcut son görseli kullanılır. */
function rutbeRozetYolu(dal,rank){return 'assets/rozet/'+dal+'-'+Math.min(rank,5)+'.webp';}
function rutbeAll(){return ls('rutbe',{});}
function rutbeGenel(pid){const g=rutbeAll()[pid]||{mp:0,best:{},badges:{}};return {...g,rank:Rutbe.level(g.mp)};}
/* Ekranlar seçili dalın puanını ve rütbesini görür. */
function rutbeState(pid){const g=rutbeGenel(pid),d=rutbeDalState(pid);return {...g,mp:d.mp,rank:d.rank,dal:rutbeDal()};}
/* Sıralama satırına yazılan rütbe: dalların en yükseği. */
function rutbeNumber(pid){return Math.max(1,...RUTBE_DALLAR.map(d=>rutbeDalState(pid,d).rank||1));}
function rutbeIcon(rank){if(!Number.isInteger(rank)||rank<1||rank>RUTBE_AYAR.ranks.length)return '';return '<svg class="rutbe-icon" viewBox="0 0 36 32" aria-hidden="true"><rect x="1" y="1" width="34" height="30" rx="5" fill="var(--rutbe-bg,#e6f4ef)" stroke="currentColor" stroke-width="2"/>'+Array.from({length:rank},(_,i)=>'<path d="M'+(7+i*Math.min(5.5,22/(rank-1)))+' 8v16" stroke="currentColor" stroke-width="3"/>').join('')+'</svg>';}
function rutbeLabel(rank){return Number.isInteger(rank)&&rank>=1&&rank<=RUTBE_AYAR.ranks.length?'<span class="rutbe-small">'+rutbeIcon(rank)+'<span>'+esc(Rutbe.name(rank))+'</span></span>':'';}
function rutbePuanDali(e,table){
 const konu=e.scope==='butun'?null:e.subject||table.split('|')[1];
 if(konu==='kuver'||/^(?:kv-|yol-(?:tk-)?kv-)/.test(table))return 'servis';
 if(konu==='pastacilik'||table.startsWith('yol-pasta-malzeme-'))return 'pasta';
 return rutbeDal();
}
function rutbeComplete(e){
 if(st.guest||!st.prof)return;
 const pid=rkPid(st.prof,true),all=rutbeAll();
 const r=Rutbe.complete(all[pid],{...e,pid});
 const table=String(e.table||'');
 const task=/^kv-(basit|tabldot)(?:\||$)/.test(table)?'kuver':
  /^(ma-|yol-ma-e\d+b\d+$)/.test(table)?'arac':
  /^(bh-|yol-bh-e\d+b\d+$)/.test(table)?'baharat':null;
 if(task&&e.total>0&&e.correct>=0&&e.correct<=e.total&&!e.abandoned){
  const date=Rutbe.day(e.at),previous=r.state.gorev;
  if(!previous||previous.date<=date){
   const done=previous?.date===date?previous.done:{};
   r.state.gorev={date,done:{...done,[task]:true}};
  }
 }
 const dAll=rutbeDalYaz(pid,all[pid]),dal=rutbePuanDali(e,table);
 const ds=dAll[pid][dal]??=rutbeDalState(pid,dal),eskiRank=Rutbe.level(ds.mp);
 if(r.gain>0){ds.mp=(ds.mp||0)+r.gain;ds.rank=Rutbe.level(ds.mp);if(ds.rank>eskiRank){ds.history=ds.history||[];ds.history.push({rank:ds.rank,at:e.at||Date.now(),mp:ds.mp});}}
 r.dalStep=Rutbe.progress(ds.mp).current;
 r.rankUp=r.dalStep.rank>eskiRank;r.dal=dal;r.dalRank=r.dalStep.rank;
 lsSet('rutbe_dal',dAll);
 all[pid]=r.state;
 lsSet('rutbe',all);
 if(r.rankUp)setTimeout(()=>rutbeSyncRows(pid),0);
 if(r.gain||r.newBadges.length||r.rankUp)rutbeCelebrate(r);
 return r;
}

/* Rütbe atlayınca buluttaki satırlardaki rütbe de güncellenir (aynı sonuç, yalnız rank alanı). */
function rutbeSyncRows(pid){try{const p=rkProf(pid);if(p.status!=='in')return;const q=rkQueue(),name=rkName(st.prof),best=rkBestAll()[pid]||{};
 Object.entries(best).forEach(([bid,v])=>{if(rkBoard(bid)&&v&&v.best>0)q.push({qid:rkRandomId(),pid,board:bid,period:'genel',name,correct:v.best,gen:p.gen,at:Date.now(),sess:'rutbe'});});
 const w=rkWeekNo(),hs=(haftaState()[pid]||{}),hb=(hs.best||{})[w];
 if(hb>0){const d=(hs.bestDur||{})[w];q.push({qid:rkRandomId(),pid,board:'haftalik',period:'hafta',name,correct:hb,gen:p.gen,at:Date.now(),sess:'rutbe',week:w,meta:{game:'haftalik',scope:'butun',total:HAFTA_AYAR.n,contentVersion:HAFTA_AYAR.contentVersion+'-'+yrRev('butun'),week:w,...(Number.isInteger(d)?{dur:d}:{})}});}
 lsSet('rk_queue',q);rkFlush('rutbe');}catch(e){}}
function rutbeYeniGoster(dal,step){
 const eski=document.getElementById('rutbeYeni');if(eski)eski.remove();
 const d=document.createElement('div'),once=document.activeElement;
 d.id='rutbeYeni';d.className='rutbe-yeni';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','Yeni rütbe: '+Rutbe.rankText(step,dal,true));
 d.innerHTML='<div class="rutbe-yeni-kart"><p class="rutbe-yeni-ust">Yeni rütben</p><span class="rutbe-yeni-rozet"><img src="'+rutbeRozetYolu(dal,step.rank)+'" alt="" width="200" height="200"></span><h2>'+rutbeAdHTML(step,dal)+'</h2><p class="rutbe-yeni-dal">'+esc(RUTBE_AYAR.dallar[dal].baslik)+'</p><button type="button" class="btn pri">Devam</button></div>';
 const kapat=()=>{d.remove();try{if(once&&document.contains(once))once.focus();}catch(e){}};
 d.querySelector('button').onclick=kapat;d.addEventListener('keydown',e=>{if(e.key==='Escape')kapat();});
 document.body.appendChild(d);setTimeout(()=>{const b=d.querySelector('button');if(b)b.focus();},50);
}
function rutbeCelebrate(r){if(r.rankUp){if(typeof EFEKT!=='undefined'&&!(typeof SES!=='undefined'&&SES.acik))EFEKT.cal('rutbe');rutbeYeniGoster(r.dal,r.dalStep);return;}const old=document.getElementById('rutbeKutlama');if(old)old.remove();const d=document.createElement('section');d.id='rutbeKutlama';d.className='card rutbe-kutlama';d.setAttribute('role','status');d.innerHTML='<strong>+'+r.gain+' Mutfak Puanı</strong>'+(r.newBadges.length?'<p>'+r.newBadges.map(k=>esc(RUTBE_ROZET[k].ad)).join(' · ')+'</p>':'')+'<button class="btn sm" onclick="this.parentNode.remove()">Geç</button>';document.body.appendChild(d);setTimeout(()=>d.remove(),3000);}
let RUTBE_GORUNEN=null,ROZETLER_DONUS='home';
function rutbeYolAc(dal){RUTBE_GORUNEN=RUTBE_DALLAR.includes(dal)?dal:null;go('rutbe');}
function rutbeYolDal(d){RUTBE_GORUNEN=d;render();}
function rozetlerAc(){ROZETLER_DONUS=st.screen==='rutbe'?'rutbe':'home';go('rozetler');}
function rozetlerHTML(){
 const ust=topBar('Rozetlerim')+'<div class="ry-rozetler">';
 if(st.guest||!st.prof)return ust+'<div class="wrap"><p>Rütbe ve rozetler için karakterini seç.</p></div></div>';
 const kazanilan=rutbeGenel(rkPid(st.prof,true)).badges||{};
 const rozetler=Object.entries(RUTBE_ROZET);
 const tamamlanan=rozetler.filter(([kod])=>kazanilan[kod]).length;
 return ust+'<div class="wrap"><p class="ry-roz-sayac"><strong>'+tamamlanan+' / '+rozetler.length+'</strong> rozet kazanıldı</p>'+
  '<section id="ryRozetAyrinti" class="card ry-roz-ayrinti" aria-labelledby="ryRozetAdi" hidden></section>'+
  '<div class="ry-rozet-izgara">'+rozetler.map(([kod,rozet])=>{
  const kazanildi=!!kazanilan[kod],durum=kazanildi?'Kazanıldı':'Kilitli';
  return '<button type="button" class="ry-roz-kart '+(kazanildi?'ry-roz-ok':'ry-roz-kilit')+'" aria-expanded="false" aria-controls="ryRozetAyrinti" aria-label="'+esc(rozet.ad+'. '+durum)+'" onclick="rozetAyrintiAc(\''+kod+'\',this)">'+
   '<span class="ry-roz-gorsel" aria-hidden="true"><img src="assets/'+esc(rozet.gorsel)+'" alt="" width="30" height="30"></span>'+
   '<strong>'+esc(rozet.ad)+'</strong><span class="ry-roz-durum" aria-hidden="true">'+(kazanildi?'Kazanıldı':'🔒')+'</span></button>';
 }).join('')+'</div></div></div>';
}
function rozetAyrintiAc(kod,kart){
 const rozet=RUTBE_ROZET[kod];
 const panel=document.getElementById('ryRozetAyrinti');
 if(!rozet||!panel||st.guest||!st.prof||st.modalOpen)return;
 const kazanildi=!!rutbeGenel(rkPid(st.prof,true)).badges?.[kod];
 const metin=kazanildi?rozet.tamam:rozet.kosul;
 sesSus();
 document.querySelector('.ry-roz-kart[aria-expanded="true"]')?.setAttribute('aria-expanded','false');
 kart.setAttribute('aria-expanded','true');
 panel.innerHTML='<div class="ry-roz-ayrinti-baslik"><h2 id="ryRozetAdi" tabindex="-1">'+esc(rozet.ad)+'</h2>'+
  sesDugme(rozet.ad+'. '+metin,kazanildi?'Rozetini dinle':'Rozet koşulunu dinle')+
  '</div><p>'+esc(metin)+'</p><button type="button" class="ry-roz-kapat" aria-label="Kapat" onclick="rozetAyrintiKapat()">✕</button>';
 panel.hidden=false;
 panel.querySelector('h2').focus({preventScroll:true});
 const ust=panel.closest('.ry-rozetler').previousElementSibling;
 if(panel.getBoundingClientRect().top<ust.getBoundingClientRect().bottom)window.scrollTo(0,0);
}
function rozetAyrintiKapat(){
 const panel=document.getElementById('ryRozetAyrinti');
 if(!panel||panel.hidden)return;
 const kart=document.querySelector('.ry-roz-kart[aria-expanded="true"]');
 sesSus();
 panel.hidden=true;
 panel.replaceChildren();
 kart?.setAttribute('aria-expanded','false');
 kart?.focus({preventScroll:true});
}
function rutbeHTML(){
 if(st.guest||!st.prof)return topBar('Rütbe Yolu')+'<div class="wrap ry"><p>Rütbe ve rozetler için karakterini seç.</p></div>';
 const pid=rkPid(st.prof,true),dal=RUTBE_GORUNEN||rutbeDal(),d=rutbeDalState(pid,dal),g=rutbeGenel(pid);
 const {index,current,next}=Rutbe.progress(d.mp);
 const rozet=rank=>'<img class="ry-rozet" src="'+rutbeRozetYolu(dal,rank)+'" alt="" width="64" height="64">';
 const text=Rutbe.rankText(current,dal,true)+'. '+d.mp+' puan. '+(next?Rutbe.rankText(next,dal,true)+' için '+(next.mp-d.mp)+' puan kaldı.':'En yüksek rütbedesin.');
 let h=topBar('Rütbe Yolu')+'<div class="wrap ry">';
 h+='<div class="yr-chips ry-dallar" role="tablist" aria-label="Dal">'+RUTBE_DALLAR.map(x=>'<button type="button" role="tab" class="yr-chip'+(x===dal?' on':'')+'" aria-selected="'+(x===dal)+'" onclick="rutbeYolDal(\''+x+'\')">'+RUTBE_AYAR.dallar[x].baslik+'</button>').join('')+'</div>';
 h+='<section class="card ry-ust">'+rozet(current.rank).replace('width="64" height="64"','width="104" height="104"')+'<div><h1>'+rutbeAdHTML(current,dal)+'</h1>'+(next?'<p>Sıradaki: <b>'+rutbeAdHTML(next,dal)+'</b></p><progress value="'+(d.mp-current.mp)+'" max="'+(next.mp-current.mp)+'" aria-label="Sonraki rütbeye ilerleme"></progress><p class="sub">'+d.mp+' / '+next.mp+' puan</p>':'<p>En yüksek rütbedesin. '+d.mp+' puan</p>')+sesDugme(text,'Rütbeni dinle')+'</div></section>';
 const kodlar=Object.keys(RUTBE_ROZET),toplam=kodlar.filter(k=>g.badges?.[k]).length;
 h+='<button type="button" class="ry-rozet-gecis" onclick="rozetlerAc()"><span aria-hidden="true">🏅</span><b class="lc-title">Rozetlerim</b><span class="ay-deger">'+toplam+' / '+kodlar.length+'</span><span class="ay-ok" aria-hidden="true">›</span></button>';
 h+='<ol class="ry-yol ry-serit">'+Rutbe.steps.map((step,k)=>{const cls=k<index?'ok':k===index?'simdi':'kilit';return '<li class="ry-'+cls+'"'+(k===index?' aria-current="step"':'')+'>'+rozet(step.rank)+'<div><strong>'+rutbeAdHTML(step,dal)+'</strong><small>'+(k<index?'Kazanıldı':k===index?'Şu anki rütbe':(k===index+1?'Sıradaki · ':'')+step.mp+' puan')+'</small></div><span aria-hidden="true">'+(k<index?'✓':k===index?'●':'🔒')+'</span></li>';}).join('')+'</ol>';
 return h+'</div>';
}
function rutbeAssessment(){const s=st.sess;if(!s||s.rutbeDone||s.unranked||s.practice==='pek'||!rkSessionDone())return;s.rutbeDone=true;const b=rkBoardForSession()||(st.op==='match'&&st.board&&!st.board.variant&&RK_SUBJ[st.subject]?rkBoard(RK_SUBJ[st.subject]+'-e'+st.contentSet):st.op==='kur'?rkBoard(st.lvl===3?'kv-tabldot':st.lvl===1?'kv-basit':''):st.op==='mcq'?RK_BOARDS.find(b=>b.kind==='mcq'&&b.subject===st.subject&&b.group===st.mcqGroup):null);if(!b)return;rutbeComplete({id:'s-'+s.id,table:s.total&&s.total!==b.total?b.id+'|'+s.total:b.id,subject:b.subject,correct:s.ok,total:s.total||b.total,scope:'tek'});}
const RUTBE_AFTER=rkAfterAssessment;rkAfterAssessment=function(){rutbeAssessment();return RUTBE_AFTER.apply(this,arguments);};
const RUTBE_FORGET=rkForgetProfile;rkForgetProfile=function(name){const pid=rkPid(name),a=rutbeAll(),w=haftaState();delete a[pid];delete w[pid];lsSet('rutbe',a);lsSet('haftalik',w);return RUTBE_FORGET(name);};
function rutbeMatch(kind,state){if(!state||state.rutbeDone||state.left||state.quit||kind==='arena'&&!state.finalized)return;state.rutbeDone=true;const others=YR.players.filter(p=>p.uid!==yrMe());if(others.some(p=>!p.pid))return;rutbeComplete({id:kind+'-'+YR.room.created+'-'+(state.m||0),table:[kind,YR.room.subject,YR.room.scope,YR.room.kind,YR.room.set,YR.room.n].join('|'),correct:state.myR.filter(x=>x>0).length,total:state.myR.length,match:true,opponents:others.map(p=>p.pid),win:kind==='kapisma'?state.result==='win':state.final===1,scope:YR.room.scope});}
