'use strict';
function yrMilestone(k,total){const text=k===total-1?'Son soru!':[15,20].includes(total)&&k===Math.ceil(total/2)?'Yarı yoldasın':'';if(!text)return;setTimeout(()=>{if(!['dplay','aplay'].includes(st.screen))return;const old=document.getElementById('yrMilestone');if(old)old.remove();const e=document.createElement('p');e.id='yrMilestone';e.className='card yr-milestone';e.setAttribute('role','status');e.textContent=text;const w=document.querySelector('#app .wrap');if(w)w.prepend(e);if(SES.acik)sesSoyle(text);setTimeout(()=>e.remove(),2000);},0);}
function paketSes(){voiceSettings();const d=document.querySelector('#ov .modal');if(d){d.insertAdjacentHTML('afterbegin','<div class="row">'+muzikDugme()+'<button class="btn ses-ac" onclick="sesAcKapa();paketSes()">Sesli okuma: '+(SES.acik?'Açık':'Kapalı')+'</button></div>');}}
function rkHomeRank(board){const key=rkInlineKey(board,'genel'),e=RK_INLINE.get(key);if(!e){RK_INLINE.set(key,{state:'loading'});rkInlineLoad(board,'genel');return '<p>Sıralama yükleniyor…</p>';}if(e.state==='error')return '<p>Sıralamaya şu anda ulaşılamadı.</p>';if(e.state!=='ready')return '<p>Sıralama yükleniyor…</p>';const rank=rkRank(e.rows,rkPid(st.prof));return '<p>'+ (rank?'Sıran: '+rank.rank+'.'+(rank.tie>1?' · Ortak sıra':''):'Bu tabloda henüz sonucun yok.')+'</p>';}
function rkHomeHTML(){const pid=!st.guest&&st.prof?rkPid(st.prof,true):null,mine=pid?(rkBestAll()[pid]||{}):{},last=Object.keys(mine).sort((a,b)=>String(mine[b].lastAt).localeCompare(String(mine[a].lastAt)))[0];return '<section class="paket-home"><h2>Yarışma ve başarılarım</h2><div class="design-grid"><div class="card"><button class="btn" onclick="rkOpenBoard()">Rekorlar Tablosu</button><p>'+(last?'Son oynadığın oyundaki sıran:':'Henüz kayıtlı sonucun yok.')+'</p>'+(last?rkHomeRank(last):'')+'</div><div class="card"><button class="btn" onclick="haftaOpen()">Haftalık Mutfak Yarışması</button><p>Dört konu · 25 soru · haftada 3 sıralamalı deneme</p></div><div class="card"><button class="btn" onclick="go(\'rutbe\')">Rütbem ve Rozetlerim</button><p>'+(pid?esc(RUTBE_AYAR.ranks[rutbeNumber(pid)-1].name):'Karakterini seçerek yolculuğa başla.')+'</p></div></div></section>';}
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
 if(st.screen==='home'){const wrap=app.querySelector('.design-wrap')||app.querySelector('.wrap');if(wrap)wrap.insertAdjacentHTML('beforeend',rkHomeHTML());}
 if(['dplay','dover','aplay','aover','raceplay','raceover'].includes(st.screen)){const w=app.querySelector('.wrap');if(w)w.insertAdjacentHTML('afterbegin','<button class="btn sm" onclick="paketSes()" aria-label="Efekt, müzik ve sesli okuma ayarları">Ses ayarları</button>');}
 if(['board','quiz','summary','spicereview'].includes(st.screen)&&st.sess&&rkSessionDone()){const b=rkBoardForSession();if(b){const w=app.querySelector('.wrap')||app.querySelector('.quiz .side');if(w)w.insertAdjacentHTML('beforeend',rkInlineHTML(b.id,'genel'));}}
};
back=function(){if(['rutbe','haftamenu','haftaover'].includes(st.screen)){go('home');return;}if(st.screen==='haftaplay'){haftaSave();haftaOpen();return;}if(st.screen==='rkpre'){const from=RK_PRE&&RK_PRE.from;RK_PRE=null;go(from||'home');return;}PAKET_BACK();};
const PAKET_RANKLOAD=rkLoadRows;rkLoadRows=async function(){if(RK.view.board==='haftalik')RK.view.period='hafta';return PAKET_RANKLOAD();};
render();
