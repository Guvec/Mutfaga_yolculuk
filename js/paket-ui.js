/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
'use strict';
function yrMilestone(k,total){const text=k===total-1?'Son soru!':[15,20].includes(total)&&k===Math.ceil(total/2)?'Yarı yoldasın':'';if(!text)return;setTimeout(()=>{if(!['dplay','aplay'].includes(st.screen))return;const old=document.getElementById('yrMilestone');if(old)old.remove();const e=document.createElement('p');e.id='yrMilestone';e.className='card yr-milestone';e.setAttribute('role','status');e.textContent=text;const w=document.querySelector('#app .wrap');if(w)w.prepend(e);if(SES.acik)sesSoyle(text);setTimeout(()=>e.remove(),2000);},0);}
function paketSes(){voiceSettings();const d=document.querySelector('#ov .modal');if(d){d.insertAdjacentHTML('afterbegin','<div class="row">'+muzikDugme()+'<button class="btn ses-ac" onclick="sesAcKapa();paketSes()">Sesli okuma: '+(SES.acik?'Açık':'Kapalı')+'</button></div>');}}
function rkHomeRank(board){const key=rkInlineKey(board,'genel'),e=RK_INLINE.get(key);if(!e){RK_INLINE.set(key,{state:'loading'});rkInlineLoad(board,'genel');return '<p>Sıralama yükleniyor…</p>';}if(e.state==='error')return '<p>Sıralamaya şu anda ulaşılamadı.</p>';if(e.state!=='ready')return '<p>Sıralama yükleniyor…</p>';const rank=rkRank(e.rows,rkPid(st.prof));return '<p>'+ (rank?'Sıran: '+rank.rank+'.'+(rank.tie>1?' · Ortak sıra':''):'Bu tabloda henüz sonucun yok.')+'</p>';}
function rkHomeHTML(){const pid=!st.guest&&st.prof?rkPid(st.prof,true):null,mine=pid?(rkBestAll()[pid]||{}):{},last=Object.keys(mine).sort((a,b)=>String(mine[b].lastAt).localeCompare(String(mine[a].lastAt)))[0];return '<section class="paket-home"><h2>Yarışma ve başarılarım</h2><div class="design-grid"><div class="card"><button class="btn" onclick="rkOpenBoard()">Rekorlar Tablosu</button><p>'+(last?'Son oynadığın oyundaki sıran:':'Henüz kayıtlı sonucun yok.')+'</p>'+(last?rkHomeRank(last):'')+'</div><div class="card"><button class="btn" onclick="haftaOpen()">Haftalık Mutfak Yarışması</button><p>Dört konu · 25 soru · Herkes aynı soruları çözer · haftada 3 sıralamalı deneme</p></div><div class="card"><button class="btn" onclick="go(\'rutbe\')">Rütbem ve Rozetlerim</button><p>'+(pid?esc(RUTBE_AYAR.ranks[rutbeNumber(pid)-1].name):'Karakterini seçerek yolculuğa başla.')+'</p></div></div></section>';}

/* Ana sayfa "Bu hafta" kartı: kalan hak, sıra, rütbe, haftanın şampiyonu ve en çok gelişen. Veriler yalnız okunur, yeni kural gerektirmez. */
function haftaRowsOf(week){const key=rkInlineKey('haftalik','hafta',week),e=RK_INLINE.get(key);if(!e){RK_INLINE.set(key,{state:'loading'});rkInlineLoad('haftalik','hafta',week);return null;}return e.state==='ready'?e.rows:null;}
function haftaSorted(rows){return rows.slice().sort((a,b)=>rkBetter(a,b)?-1:rkBetter(b,a)?1:String(a.name).localeCompare(String(b.name),'tr'));}
function haftaMostImproved(now,prev){if(!now||!prev||!prev.length)return null;const old=Object.fromEntries(prev.map(r=>[r.pid,r.correct]));let best=null;haftaSorted(now).forEach(r=>{if(!(r.pid in old))return;const g=r.correct-old[r.pid];if(g>0&&(!best||g>best.gain))best={row:r,gain:g};});return best;}
function haftaHomeHTML(){
 const pid=!st.guest&&st.prof?rkPid(st.prof,true):null,week=rkWeekNo(),mine=pid?(haftaState()[pid]||{}):{},used=(mine.attempts||{})[week]||0,left=Math.max(0,HAFTA_AYAR.attempts-used);
 const now=haftaRowsOf(week),prev=haftaRowsOf(week-1);
 let h='<section class="card hafta-kart" aria-labelledby="haftaKartBaslik"><h2 id="haftaKartBaslik">Bu haftanın yarışması</h2><p>Herkes aynı 25 soruyu çözer. Haftada '+HAFTA_AYAR.attempts+' sıralamalı deneme hakkın var.</p>';
 if(pid){const rank=now?rkRank(now,pid):null,ri=rutbeState(pid),nx=RUTBE_AYAR.ranks[(ri.rank||1)];
  h+='<p><b>Kalan hakkın: '+left+' / '+HAFTA_AYAR.attempts+'</b>'+(rank?' · Sıran: '+rank.rank+'.':now?' · Bu hafta henüz sonucun yok.':'')+'</p>'+'<p>'+rutbeLabel(ri.rank||1)+(nx?' · Sonraki rütbe için '+Math.max(0,nx.mp-(ri.mp||0))+' puan':'')+'</p>';
 }else h+='<p>Karakterini seçersen sonucun sıralamaya yazılır. Misafir olarak antrenman yapabilirsin.</p>';
 if(now&&now.length){const top=haftaSorted(now)[0];h+='<p>Haftanın şampiyonu: <b>'+esc(top.name)+'</b> '+rutbeLabel(top.rank)+' · '+top.correct+' / 25</p>';}
 const gi=haftaMostImproved(now,prev);if(gi)h+='<p>En çok gelişen: <b>'+esc(gi.row.name)+'</b> · geçen haftaya göre +'+gi.gain+' doğru</p>';
 return h+'<button class="btn pri" onclick="haftaOpen()">'+(left>0&&pid?'Yarışmaya başla':'Yarışmayı aç')+'</button></section>';
}
const PAKET_RENDER=render,PAKET_BACK=back;
render=function(){
 const app=document.getElementById('app');if(!app)return;
 if(st.screen==='rutbe'){app.innerHTML=rutbeHTML();return;}
 if(st.screen==='haftamenu'){app.innerHTML=haftaMenuHTML();return;}
 if(st.screen==='haftaplay'){app.innerHTML=haftaPlayHTML();return;}
 if(st.screen==='haftaover'){app.innerHTML=haftaOverHTML();return;}
 if(st.screen==='rkpre'&&RK_PRE){app.innerHTML=rkPreHTML();return;}
 if(st.sess&&!rkRaceActive()&&rkSessionDone())rutbeAssessment();
 PAKET_RENDER();
 if(st.screen==='siralama'&&RK.view.board==='haftalik'){const general=app.querySelector("button[onclick=\"rkPickPeriod('genel')\"]");if(general)general.remove();}
 if(st.screen==='home'){const wrap=app.querySelector('.design-wrap')||app.querySelector('.wrap');if(wrap){const hk=haftaHomeHTML(),cta=[...wrap.querySelectorAll('button.btn.pri,a.btn.pri')].find(b=>/Çalışmaya başla/.test(b.textContent));if(cta)cta.insertAdjacentHTML('afterend',hk);else wrap.insertAdjacentHTML('afterbegin',hk);wrap.insertAdjacentHTML('beforeend',rkHomeHTML());}}
 if(['dplay','dover','aplay','aover','raceplay','raceover'].includes(st.screen)){const w=app.querySelector('.wrap');if(w)w.insertAdjacentHTML('afterbegin','<button class="btn sm" onclick="paketSes()" aria-label="Efekt, müzik ve sesli okuma ayarları">Ses ayarları</button>');}
 if(['board','quiz','summary','spicereview'].includes(st.screen)&&st.sess&&rkSessionDone()){const b=rkBoardForSession();if(b){const w=app.querySelector('.wrap')||app.querySelector('.quiz .side');if(w)w.insertAdjacentHTML('beforeend',rkInlineHTML(b.id,'genel'));}}
};
back=function(){if(['rutbe','haftamenu','haftaover'].includes(st.screen)){go('home');return;}if(st.screen==='haftaplay'){haftaSave();haftaOpen();return;}if(st.screen==='rkpre'){const from=RK_PRE&&RK_PRE.from;RK_PRE=null;go(from||'home');return;}PAKET_BACK();};
const PAKET_RANKLOAD=rkLoadRows;rkLoadRows=async function(){if(RK.view.board==='haftalik')RK.view.period='hafta';return PAKET_RANKLOAD();};
render();
