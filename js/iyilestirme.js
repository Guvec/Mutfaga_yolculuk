'use strict';
function sessionTimeLabel(r){return typeof r.duration==='number'?'Toplam '+fmtDur(r.duration):r.op==='match'?'Süre kaydı yok':'Ort. '+fmtS(r.qs.length?r.qs.reduce((n,q)=>n+(Number(q.s)||0),0)/r.qs.length:0);}
// Ayrıntı metni kısa açıklamanın altında isteğe bağlı açılır.
const U_MSG=msgHtml;
msgHtml=function(){let h=U_MSG();if(st.lastRes&&st.lastRes.detail&&!(st.practice==='check'&&!st.kDone))h+='<details class="feedback-detail"><summary>Kullanımını öğren</summary><p>'+esc(st.lastRes.detail)+'</p>'+sesDugme(st.lastRes.detail,'Ayrıntılı bilgiyi dinle')+'</details>';return h;};
const U_ANSWER=answer;
answer=function(v){
 if(st.op!=='mcq'||st.practice!=='check')return U_ANSWER(v);
 if(st.done||!st.q||st.inBreak||st.modalOpen)return;sesSus();const q=st.q,c=q.choices.find(x=>x.id===v);if(!c)return;const right=v===q.correct;
 q.responses=[{answer:v,text:c.text||c.id+' seçeneği',at:Math.round(elapsed()*10)/10,correct:right}];st.done=true;st.res=right?1:0;const secs=tStop();
 if(right){st.sess.ok++;st.sess.s+=10;}else st.sess.bad++;
 st.sess.qs.push({q:q.prompt,a:q.correctText,r:st.res,s:secs,selectedAnswer:c.text||c.id+' seçeneği',firstAnswer:c.text||c.id+' seçeneği',attempts:q.responses,attemptCount:1,hintUsed:false,assessment:true,explanation:q.explanation||'',source:q.source});
 st.lastRes={cls:'',head:'Yanıtın kaydedildi.',text:'Sonraki soruya geçebilirsin. Açıklamalar çalışma bitince açılacak.'};saveProgress();render();
};
const U_RESOLVE=resolve;
resolve=function(r){U_RESOLVE(r);if(st.op!=='kur'&&st.op!=='ad'&&st.sess.qs.length){st.sess.qs.at(-1).explanation=st.q.explanation||'';saveProgress();}};
const U_NEXT=nextQ;
nextQ=function(){sesSus();U_NEXT();};
const U_CLOSE=closeModal;
closeModal=function(){sesSus();U_CLOSE();};
const U_FINISH=finish;
finish=function(){
 sesSus();const s=st.sess;if(!s)return;
 if(st.op==='match'&&st.board){const b=st.board;if(!st.kDone){s.duration=Math.round(elapsed()*10)/10;b.items.forEach(it=>{if(b.res[it.id]===undefined){if(st.practice==='check'&&b.pair[it.id])boardRow(it,b.pair[it.id]===it.answer?1:0);else s.qs.push({q:it.set+'. takım, '+(it.currentBoardCard||it.source.card)+'. kart: '+it.answer,a:it.answer,r:null,s:null,selectedAnswer:null,attemptCount:(b.attempts[it.id]||[]).length,attempts:b.attempts[it.id]||[],source:it.source});}});}}
 if(st.op==='mcq'){
  const ids=new Set(s.qs.map(x=>x.source?.question));
  // Match by prompt rather than source number, which can repeat between groups.
  const done=new Set(s.qs.map(x=>x.q));(st.contentItems||[]).forEach(q=>{if(!done.has(q.prompt)){const c=q.choices.find(x=>x.id===q.correct);s.qs.push({q:q.prompt,a:c?(c.text||c.id+' seçeneği'):'',r:null,s:null,selectedAnswer:null,attemptCount:0,explanation:q.explanation||'',source:q.source});}});
  s.duration=s.qs.reduce((n,x)=>n+(Number(x.s)||0),0);
 }
 if(st.op==='kur'&&typeof LEVELS!=='undefined'&&LEVELS[st.lvl]){
  // Kuver: yer seçilmeyen hedefler de raporda "Yanıtlanmadı" olarak görünür.
  const answered=new Set(s.qs.map(x=>x.q));
  LEVELS[st.lvl].items.forEach(k=>{const q=ITEMS[k].AD+' için yer seçimi';if(!answered.has(q))s.qs.push({q,a:PLACE_LABEL[k]||'',r:null,s:null,selectedAnswer:null,attemptCount:0});});
  s.total=LEVELS[st.lvl].items.length;
 }
 s.unanswered=s.qs.filter(x=>x.r===null).length;s.completed=s.qs.filter(x=>x.r!==null).length;U_FINISH();
};
function resultText(q){return q.r===null?'Yanıtlanmadı':q.r===1?'İlk denemede doğru':q.r===2?'İpucundan sonra doğru':'Yanlış / yanıt gösterildi';}
function extraReport(){const s=st.sess;return '<section class="card audit-report"><h2>Yanıt ayrıntıları</h2><p>Yanıtlanan: '+(s.completed??s.qs.length)+' / '+(s.total||s.qs.length)+' · Yanıtlanmayan: '+(s.unanswered||0)+'</p><p>Etkin çalışma süresi: '+fmtDur(s.duration??s.qs.reduce((n,x)=>n+(Number(x.s)||0),0))+'</p><p>Görseli adıyla eşleştirmek, '+(st.subject==='baharat'?'gerçek ürünü':'gerçek aracı')+' bağımsız ve güvenli kullanabildiğini tek başına göstermez.</p><div class="report-scroll"><table><thead><tr><th>Görsel / soru</th><th>Öğrencinin ilk yanıtı</th><th>Son yanıtı</th><th>Doğru yanıt</th><th>Deneme</th><th>Sonuç</th></tr></thead><tbody>'+s.qs.map(q=>'<tr><td>'+esc(q.q)+'</td><td>'+esc(q.firstAnswer||q.selectedAnswer||'—')+'</td><td>'+esc(q.selectedAnswer||'—')+'</td><td>'+esc(q.a)+'</td><td>'+(q.attemptCount??'—')+'</td><td>'+resultText(q)+'</td></tr>').join('')+'</tbody></table></div>'+s.qs.filter(q=>q.explanation).map(q=>'<details><summary>'+esc(q.q)+'</summary><p>'+esc(q.explanation)+'</p>'+sesDugme(q.explanation)+'</details>').join('')+'<p class="note">Tahta eşleştirmesinde yalnız toplam etkin süre kullanılır. Kart başına bağımsız yanıt süresi hesaplanmaz.</p></section>';}
const U_RENDER=render;
render=function(){U_RENDER();const app=document.getElementById('app');if(!app)return;
 if(st.screen==='summary')app.insertAdjacentHTML('beforeend',extraReport());
 if(st.screen!=='welcome')app.insertAdjacentHTML('beforeend','<div class="voice-tools"><button class="btn sm" onclick="voiceSettings()">Ses ayarları</button><button class="btn sm" onclick="sesSus()">Sesi durdur</button></div>');
};
const U_BACK=back;
back=function(){if(st.screen==='mcqmode'){go('content');return;}U_BACK();};
// Paylaşılabilir rapor, öğrencinin seçtiği yanıtı da içerir.
drawReport=function(r){
 const c=document.createElement('canvas'),W=1280,cols=[{x:30,w:360},{x:410,w:285},{x:710,w:285},{x:1010,w:240}];c.width=W;let x=c.getContext('2d');x.font='21px Arial';
 const rows=r.qs.map(q=>{const lines=[q.q,q.selectedAnswer||'Yanıt yok',q.a,resultText(q)].map((t,i)=>wrapText(x,t,cols[i].w));return {lines,h:Math.max(...lines.map(v=>v.length))*27+25};});c.height=260+rows.reduce((n,r)=>n+r.h,0);x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,c.height);x.fillStyle='#0f6e72';x.fillRect(0,0,W,160);x.fillStyle='#fff';x.font='bold 28px Arial';x.fillText('Mesleki Oyunlar · '+r.p,30,45);x.font='22px Arial';wrapText(x,catName(r),W-60).forEach((t,i)=>x.fillText(t,30,80+i*28));x.fillText('Doğru: '+r.ok+' · İpucuyla: '+r.fix+' · Yanlış: '+r.bad+' · Yanıtsız: '+(r.unanswered||0),30,140);
 let y=195;x.fillStyle='#18343a';x.font='bold 21px Arial';['Soru / görsel','Öğrencinin yanıtı','Doğru yanıt','Sonuç'].forEach((t,i)=>x.fillText(t,cols[i].x,y));y+=25;x.font='21px Arial';rows.forEach((row,i)=>{if(i%2){x.fillStyle='#f0f5f5';x.fillRect(0,y-4,W,row.h);}x.fillStyle='#18343a';row.lines.forEach((ls,j)=>ls.forEach((t,k)=>x.fillText(t,cols[j].x,y+22+k*27)));y+=row.h;});return c;
};
render();
function prepareOffline(){const p=document.getElementById('offlineStatus');if(!('serviceWorker' in navigator)){if(p)p.textContent='Bu tarayıcı çevrimdışı hazırlığı desteklemiyor.';return;}if(p)p.textContent='Görseller hazırlanıyor. Bağlantıyı açık tut.';navigator.serviceWorker.ready.then(r=>{const w=r.active;if(w)w.postMessage({type:'CACHE_LESSONS'});else if(p)p.textContent='Sayfayı yenileyip yeniden dene.';}).catch(()=>{if(p)p.textContent='Hazırlık başlatılamadı. Çevrimiçi devam edebilirsin.';});}
if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',e=>{const d=e.data,p=document.getElementById('offlineStatus');if(p&&d&&d.type==='CACHE_PROGRESS')p.textContent=d.ok+' / '+d.total+' görsel hazır. Erişilemeyen: '+d.bad;if(p&&d&&d.type==='CACHE_DONE')p.textContent=d.bad?'Hazırlık kısmen tamamlandı. '+d.bad+' görsele erişilemedi.':'Tüm ders görselleri çevrimdışı kullanım için hazır.';});
const U_VOICESET=voiceSettings;
voiceSettings=function(){U_VOICESET();const box=document.querySelector('#ov .modal');if(box)box.insertAdjacentHTML('beforeend','<hr><button class="btn" onclick="prepareOffline()">Dersleri çevrimdışı kullanıma hazırla</button><p id="offlineStatus" role="status">İlk hazırlıkta internet bağlantısı gerekir.</p>');};
const U_STATS=statsHtml;
statsHtml=function(){if(st.op==='mcq'&&st.practice==='check'&&st.screen!=='summary'&&st.sess)return '<div class="stats"><span class="chip">Yanıtlanan '+st.sess.qs.length+' / '+(st.contentItems||[]).length+'</span></div>';return U_STATS();};

// Küçük ekranda seçilen görsel adların yanında da görünür.
const LAST_TAPIMG=tapImg,LAST_TAPNAME=tapName;
function narrowScreen(){return typeof window.matchMedia==='function'&&window.matchMedia('(max-width: 759px)').matches;}
function scrollBoardArea(id){if(!narrowScreen())return;const area=document.getElementById(id);if(area&&area.scrollIntoView)area.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
tapImg=function(id){LAST_TAPIMG(id);};
tapName=function(i){LAST_TAPNAME(i);};
// Aynı bitirme isteği iki kere gelirse yanıtlanmayan satırlar çoğaltılmaz.
const LAST_FINISH=finish;
finish=function(){if(st.sess&&st.sess.finalized){st.screen='summary';render();return;}LAST_FINISH();if(st.sess){st.sess.finalized=true;saveProgress();}};
// Ses düğmesi metinleri her yeni ekran çiziminde yenilenir; oturum boyunca birikmez.
const LAST_RENDER=render;
render=function(){if(typeof SES!=='undefined')SES.sira=[];LAST_RENDER();};
// Hazırlık başlatılamadığında kullanıcı sonsuz süre beklemez.
prepareOffline=function(){const status=document.getElementById('offlineStatus');if(!('serviceWorker' in navigator)){if(status)status.textContent='Bu tarayıcı çevrimdışı hazırlığı desteklemiyor.';return;}if(status)status.textContent='Hazırlık başlatılıyor. İnternet bağlantısını açık tut.';let ended=false;const timeout=setTimeout(()=>{if(!ended){ended=true;const p=document.getElementById('offlineStatus');if(p)p.textContent='Hazırlık başlatılamadı. Siteyi internet bağlantısıyla yeniden açıp tekrar deneyebilirsin.';}},12000);navigator.serviceWorker.ready.then(r=>{if(ended)return;clearTimeout(timeout);ended=true;if(!r.active)throw Error('Worker unavailable');r.active.postMessage({type:'CACHE_LESSONS'});const p=document.getElementById('offlineStatus');if(p)p.textContent='Görseller indiriliyor. Hazırlık tamamlanana kadar bağlantıyı açık tut.';}).catch(()=>{clearTimeout(timeout);ended=true;const p=document.getElementById('offlineStatus');if(p)p.textContent='Hazırlık başlatılamadı. Çevrimiçi devam edebilirsin.';});};
