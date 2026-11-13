/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
'use strict';
const RUTBE_ROZET={arac:['Araçları Tanıyorum','Mutfak Araçları yolculuğunun bütün bölümlerini ve etap sonlarını bitir.'],baharat:['Baharatları Tanıyorum','Baharat yolculuğunun bütün bölümlerini ve etap sonlarını bitir.'],kuver:['Kuver Ustası','Basit Kuver 5/5 ve Tabldot Kuver 9/9.'],temizlik:['Temizlik ve Düzen','Bulaşık eşleştirme en az 10/12 ve bütün bölümler soruları en az 11/13.'],karisik:['Karışık Oyun Ustası','Bütün konular kapsamında 5 maç tamamla; en az birinde %70 doğru yap.'],rekor:['Kendi Rekorumu Aştım','En az 5 farklı tabloda kendi rekorunu geç.']};
/* Dallar (13.11): Sıcak Mutfak, Pastacılık ve Servis'in ayrı puanı ve rütbesi vardır. Puan, çalışma bitince o an seçili dala yazılır.
   Eşikler ortak (RUTBE_AYAR.ranks). Bu sürümden önce toplanan puan üç dala da aynen yazılır (kimsenin rütbesi düşmez).
   Günlük sınır, rekor, rozet ve görev kayıtları ortak durumda ('rutbe') kalır. */
const RUTBE_DAL_AD={
 sicak:['Stajyer','Çırak','Aşçı Yardımcısı','Aşçı','Sıcak Mutfak Ustası'],
 pasta:['Stajyer','Çırak','Pastacı Yardımcısı','Pastacı','Pastacılık Ustası'],
 servis:['Stajyer','Çırak','Servis Yardımcısı','Servis Elemanı','Servis Ustası']};
const RUTBE_DALLAR=['sicak','pasta','servis'];
function rutbeDal(){const y=ls('ana_yol','sicak');return RUTBE_DALLAR.includes(y)?y:'sicak';}
function rutbeDalAll(){return ls('rutbe_dal',{});}
function rutbeDalState(pid,dal){
 const all=rutbeDalAll(),g=rutbeAll()[pid]||{mp:0,rank:1},p=all[pid];
 const x=p&&p[dal||rutbeDal()];return x?x:{mp:g.mp||0,rank:g.rank||1};
}
function rutbeDalYaz(pid,eski){
 const all=rutbeDalAll();if(!all[pid]){const g=eski||{mp:0,rank:1};all[pid]={};RUTBE_DALLAR.forEach(d=>all[pid][d]={mp:g.mp||0,rank:g.rank||1});}
 return all;
}
function rutbeAd(i){const a=typeof anaRutbeAdlari==='function'?anaRutbeAdlari():null;return a&&a[i]||RUTBE_AYAR.ranks[i].name;}
function rutbeAll(){return ls('rutbe',{});}
function rutbeGenel(pid){return rutbeAll()[pid]||{mp:0,rank:1,best:{},badges:{}};}
/* Ekranlar seçili dalın puanını ve rütbesini görür. */
function rutbeState(pid){const g=rutbeGenel(pid),d=rutbeDalState(pid);return {...g,mp:d.mp,rank:d.rank,dal:rutbeDal()};}
/* Sıralama satırına yazılan rütbe: dalların en yükseği. */
function rutbeNumber(pid){return Math.max(1,...RUTBE_DALLAR.map(d=>rutbeDalState(pid,d).rank||1));}
function rutbeIcon(rank){if(!Number.isInteger(rank)||rank<1||rank>5)return '';return '<svg class="rutbe-icon" viewBox="0 0 36 32" aria-hidden="true"><rect x="1" y="1" width="34" height="30" rx="5" fill="var(--rutbe-bg,#e6f4ef)" stroke="currentColor" stroke-width="2"/>'+Array.from({length:rank},(_,i)=>'<path d="M'+(7+i*5.5)+' 8v16" stroke="currentColor" stroke-width="3"/>').join('')+'</svg>';}
function rutbeLabel(rank){return Number.isInteger(rank)&&rank>=1&&rank<=5?'<span class="rutbe-small">'+rutbeIcon(rank)+'<span>'+esc(RUTBE_AYAR.ranks[rank-1].name)+'</span></span>':'';}
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
 const dAll=rutbeDalYaz(pid,all[pid]),dal=rutbeDal(),ds=dAll[pid][dal],eskiRank=ds.rank||1;
 if(r.gain>0){ds.mp=(ds.mp||0)+r.gain;ds.rank=Math.max(eskiRank,Rutbe.level(ds.mp));if(ds.rank>eskiRank){ds.history=ds.history||[];ds.history.push({rank:ds.rank,at:e.at||Date.now(),mp:ds.mp});}}
 r.rankUp=ds.rank>eskiRank;r.dal=dal;r.dalRank=ds.rank;
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
/* Rütbe atlama (13.11): ekranın ortasında rozetli kart. Hareket kapalıysa animasyonsuz görünür. "Devam" ile kapanır. */
const RUTBE_DAL_BASLIK={sicak:'Sıcak Mutfak',pasta:'Pastacılık',servis:'Servis'};
function rutbeYeniGoster(dal,rank){
 const eski=document.getElementById('rutbeYeni');if(eski)eski.remove();
 const ad=(RUTBE_DAL_AD[dal]||RUTBE_DAL_AD.sicak)[rank-1],d=document.createElement('div'),once=document.activeElement;
 d.id='rutbeYeni';d.className='rutbe-yeni';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','Yeni rütbe: '+ad);
 d.innerHTML='<div class="rutbe-yeni-kart"><p class="rutbe-yeni-ust">Yeni rütben</p><span class="rutbe-yeni-rozet"><img src="assets/rozet/'+dal+'-'+rank+'.webp" alt="" width="200" height="200"></span><h2>'+esc(ad)+'</h2><p class="rutbe-yeni-dal">'+esc(RUTBE_DAL_BASLIK[dal]||'')+'</p><button type="button" class="btn pri">Devam</button></div>';
 const kapat=()=>{d.remove();try{if(once&&document.contains(once))once.focus();}catch(e){}};
 d.querySelector('button').onclick=kapat;d.addEventListener('keydown',e=>{if(e.key==='Escape')kapat();});
 document.body.appendChild(d);setTimeout(()=>{const b=d.querySelector('button');if(b)b.focus();},50);
}
function rutbeCelebrate(r){if(r&&r.rankUp&&r.dal&&r.dalRank>1){if(typeof EFEKT!=='undefined'&&!(typeof SES!=='undefined'&&SES.acik))EFEKT.cal('rutbe');rutbeYeniGoster(r.dal,r.dalRank);return;}if(r&&r.rankUp&&typeof EFEKT!=='undefined'&&!(typeof SES!=='undefined'&&SES.acik))EFEKT.cal('rutbe');const old=document.getElementById('rutbeKutlama');if(old)old.remove();const d=document.createElement('section');d.id='rutbeKutlama';d.className='card rutbe-kutlama';d.setAttribute('role','status');d.innerHTML='<strong>'+esc(r.rankUp?'Yeni rütben: '+(RUTBE_DAL_AD[r.dal]||RUTBE_DAL_AD.sicak)[(r.dalRank||1)-1]:'+'+r.gain+' Mutfak Puanı')+'</strong>'+(r.newBadges.length?'<p>'+r.newBadges.map(k=>esc(RUTBE_ROZET[k][0])).join(' · ')+'</p>':'')+'<button class="btn sm" onclick="this.parentNode.remove()">Geç</button>';document.body.appendChild(d);setTimeout(()=>d.remove(),3000);}
function rutbeHTML(){if(st.guest||!st.prof)return topBar('Rütbem ve Rozetlerim')+'<div class="wrap"><p>Rütbe ve rozetler için karakterini seç.</p></div>';const s=rutbeState(rkPid(st.prof,true)),r=s.rank||1,next=RUTBE_AYAR.ranks[r],text=rutbeAd(r-1)+'. '+s.mp+' Mutfak Puanı. '+(next?rutbeAd(r)+' için '+Math.max(0,next.mp-s.mp)+' puan kaldı.':'En yüksek öğrenci rütbesindesin.');return topBar('Rütbem ve Rozetlerim')+'<div class="wrap"><h1>Rütbem ve Rozetlerim</h1><section class="card">'+rutbeIcon(r)+'<h2>'+esc(rutbeAd(r-1))+'</h2><p>'+esc(text)+'</p>'+(r===1?'<p>Yolculuğa başladın.</p>':'')+sesDugme(text,'Rütbeni dinle')+'</section><p>Rütbe ve rozetler bu cihazdaki profiline kaydedilir. Rozetler oyundaki başarını gösterir.</p>'+Object.entries(RUTBE_ROZET).map(([k,v])=>'<section class="card"><h2>'+(s.badges[k]?'✓ ':'◇ ')+v[0]+'</h2><p>'+(s.badges[k]?'Kazanıldı.':'Henüz kazanılmadı.')+'</p><p>'+v[1]+'</p>'+sesDugme(v.join('. '),'Rozet koşulunu dinle')+'</section>').join('')+'</div>';}
function rutbeAssessment(){const s=st.sess;if(!s||s.rutbeDone||s.unranked||s.practice==='pek'||!rkSessionDone())return;s.rutbeDone=true;const b=rkBoardForSession()||(st.op==='match'&&st.board&&!st.board.variant&&RK_SUBJ[st.subject]?rkBoard(RK_SUBJ[st.subject]+'-e'+st.contentSet):st.op==='kur'?rkBoard(st.lvl===3?'kv-tabldot':st.lvl===1?'kv-basit':''):st.op==='mcq'?RK_BOARDS.find(b=>b.kind==='mcq'&&b.subject===st.subject&&b.group===st.mcqGroup):null);if(!b)return;rutbeComplete({id:'s-'+s.id,table:s.total&&s.total!==b.total?b.id+'|'+s.total:b.id,correct:s.ok,total:s.total||b.total,scope:'tek'});}
const RUTBE_AFTER=rkAfterAssessment;rkAfterAssessment=function(){rutbeAssessment();return RUTBE_AFTER.apply(this,arguments);};
const RUTBE_FORGET=rkForgetProfile;rkForgetProfile=function(name){const pid=rkPid(name),a=rutbeAll(),w=haftaState();delete a[pid];delete w[pid];lsSet('rutbe',a);lsSet('haftalik',w);return RUTBE_FORGET(name);};
function rutbeMatch(kind,state){if(!state||state.rutbeDone||state.left||state.quit||kind==='arena'&&!state.finalized)return;state.rutbeDone=true;const others=YR.players.filter(p=>p.uid!==yrMe());if(others.some(p=>!p.pid))return;rutbeComplete({id:kind+'-'+YR.room.created+'-'+(state.m||0),table:[kind,YR.room.subject,YR.room.scope,YR.room.kind,YR.room.set,YR.room.n].join('|'),correct:state.myR.filter(x=>x>0).length,total:state.myR.length,match:true,opponents:others.map(p=>p.pid),win:kind==='kapisma'?state.result==='win':state.final===1,scope:YR.room.scope});}
