/* Öğrenme ile bağımsız deneme ayrı kaydedilir. Süreler cevap yazılırken değil,
   etkin çalışma süresinden alınır. Tahtada bağımsız kart süresi türetilmez. */
'use strict';
const BOARD_PREV_START=startContent,BOARD_PREV_RENDER=render,BOARD_PREV_BACK=back;
function boardSetsFill(){const a=contentArr();if(st.op!=='match'||!a.length||a.some(x=>x.set))return;a.forEach((x,i)=>{x.set=Math.floor(i/12)+1;x.source=x.source||{};x.source.card=i%12+1;});}
function boardActive(){boardSetsFill();return st.op==='match'&&contentSets().length>0;}
startContent=function(setNo){if(!boardActive())return BOARD_PREV_START(setNo);if(setNo!==undefined){st.contentSet=setNo;go('boardmode');return;}startBoard(st.practice||'learn');};
back=function(){if(st.screen==='boardmode'){go('content');return;}BOARD_PREV_BACK();};
function boardDistractors(n,items){const on=new Set(items.map(x=>x.answer));return [...new Set((getData().distractors||{})[String(n)]||[])].filter(x=>!on.has(x));}
function boardIntro(n,e){return 'Bu oyunda '+n+' görsel ve '+(n+e)+' ad var. Bir görsele dokun, ardından o görselin adını seç. Tüm görselleri bu şekilde eşleştir. Her görsel için farklı bir ad seç. Adlardan '+e+' tanesi hiçbir görselle eşleşmez.';}
function startBoard(practice,size,variant){
 st.practice=practice;let items=contentArr().filter(x=>x.set===st.contentSet).slice().sort((a,b)=>(a.currentBoardCard||a.source.card||0)-(b.currentBoardCard||b.source.card||0));
 const full=items.slice();size=practice==='check'?12:(size||12);items=shuffle(items);items=items.slice(0,size);
 let dis=boardDistractors(st.contentSet,full);if(size<12)dis=full.filter(x=>!items.includes(x)).map(x=>x.answer).concat(dis).slice(0,Math.min(3,size));
 if(items.length===12&&dis.length!==6)throw Error('Takımda altı farklı çeldirici gerekir.');
 st.board={items,names:shuffle(items.map(x=>x.answer).concat(dis)),extra:dis.length,pair:{},sel:null,selName:null,tries:{},res:{},attempts:{},responseTime:{},checked:false,size,variant:!!variant};
 st.brk=0;st.kDone=false;st.done=false;st.inBreak=false;st.lastRes={cls:'',head:boardIntro(items.length,dis.length),text:'Bir görsel seç.',intro:true};
 st.sess={id:Date.now(),revision:getData().revision||VERSION,p:st.guest?'Misafir':st.prof,t:new Date().toISOString(),op:'match',subject:st.subject,practice,set:st.contentSet,s:0,ok:0,fix:0,bad:0,br:0,total:items.length,qs:[],preparation:size<12};
 st.savedMsg=st.guest?((typeof YR!=='undefined'&&YR.active)?'Yanıtların, çalışmayı bitirince yarış odasına gönderilir.':'Misafir oturumu: sonuçlar kaydedilmiyor.'):'';tStart();st.screen='board';render();window.scrollTo(0,0);
}
function boardItem(id){return st.board.items.find(x=>x.id===id);}
function boardUsed(n){return Object.values(st.board.pair).includes(n);}
function boardIntroClose(){if(st.lastRes&&st.lastRes.intro)st.lastRes=null;}
function boardRow(it,r){
 const b=st.board,attempts=b.attempts[it.id]||[];b.res[it.id]=r;
 if(r===1){st.sess.ok++;st.sess.s+=10;}else if(r===2){st.sess.fix++;st.sess.s+=5;}else st.sess.bad++;
 st.sess.qs.push({q:it.set+'. takım, '+(it.currentBoardCard||it.source.card)+'. kart: '+it.answer,a:it.answer,r,s:null,timeScope:'board',responseAt:b.responseTime[it.id]??null,selectedAnswer:attempts.length?attempts.at(-1).answer:null,firstAnswer:attempts.length?attempts[0].answer:null,attempts:attempts.slice(),attemptCount:attempts.length,hintUsed:st.practice==='learn'&&attempts.some(x=>!x.correct),source:it.source,...(st.subject==='baharat'?{explanation:it.explanation}:{}),assessment:st.practice==='check'});
}
function boardFinished(){st.sess.duration=tStop();st.kDone=true;saveProgress();}
function tapImg(id){
 const b=st.board;if(st.kDone||st.inBreak||st.modalOpen||b.checked)return;boardIntroClose();
 if(st.practice==='learn'&&b.res[id]!==undefined){sesSoyle(boardItem(id).answer+'. '+boardItem(id).explanation);return;}
 if(b.selName){tryPair(id,b.selName);return;}
 if(b.sel!==id)st.lastRes=null;b.sel=id;render();
}
function tapName(i){const b=st.board,n=b.names[i];if(st.kDone||st.inBreak||st.modalOpen||b.checked||(boardUsed(n)&&(!b.sel||b.pair[b.sel]!==n)))return;boardIntroClose();if(b.sel){tryPair(b.sel,n);return;}(typeof sesAdOku==='function'?sesAdOku:sesSoyle)(sesAd(n));b.selName=b.selName===n?null:n;render();}
function tryPair(id,name){
 const b=st.board,it=boardItem(id);if(!it||b.checked||st.kDone||(boardUsed(name)&&b.pair[id]!==name)||b.res[id]!==undefined||!b.names.includes(name))return;
 if(st.practice==='check'&&b.pair[id]===name){b.sel=null;b.selName=null;st.lastRes=null;render();return;}
 b.sel=null;b.selName=null;const at=Math.round(elapsed()*10)/10;(b.attempts[id]||(b.attempts[id]=[])).push({answer:name,correct:name===it.answer,at});b.responseTime[id]=at;
 if(st.practice==='check'){b.pair[id]=name;st.lastRes=null;render();return;}
 if(name===it.answer){const r=(b.tries[id]||0)?2:1;b.pair[id]=name;boardRow(it,r);st.lastRes={cls:'ok',head:'Doğru eşleştirdin: '+it.answer,text:it.explanation||'',detail:it.detail||''};}
 else{b.tries[id]=(b.tries[id]||0)+1;if(b.tries[id]>=2){b.pair[id]=it.answer;boardRow(it,0);st.lastRes={cls:'fix',head:'Doğru ad: '+it.answer,text:it.explanation||'',detail:it.detail||''};}else{b.sel=id;st.lastRes={cls:'fix',head:'Henüz eşleşmedi.',text:it.hint||'Biçimini ve kullanım yerini düşün.'};}}
 if(Object.keys(b.res).length===b.items.length){boardFinished();st.lastRes.text+=' Çalışma tamamlandı. Açıklamayı okuduktan sonra raporu açabilirsin.';}render();
}
function checkBoard(){const b=st.board;if(b.checked||Object.keys(b.pair).length<b.items.length)return;b.checked=true;b.items.forEach(it=>boardRow(it,b.pair[it.id]===it.answer?1:0));boardFinished();st.lastRes={cls:st.sess.bad?'fix':'ok',head:st.sess.ok+' / '+b.items.length+' doğru.',text:'Yanıtların kaydedildi. Yanlış eşleşmelerin altında doğru adları inceleyebilirsin.'};render();}
function zoomImg(id){const it=boardItem(id),ov=document.getElementById('ov');modalFocus=document.activeElement;st.modalOpen=true;pauseT();sesSus();ov.innerHTML='<div class="modal zoom" role="dialog" aria-modal="true" aria-label="Büyük görsel"><img src="'+esc(it.image)+'" alt="Seçilen görsel"><button class="btn pri" id="zClose">Kapat</button></div>';ov.className='on';ov.onclick=function(e){if(e.target===ov&&ov.querySelector('.zoom'))closeModal();};document.getElementById('zClose').onclick=closeModal;document.getElementById('zClose').focus();}
function boardModeHTML(){const its=contentArr().filter(x=>x.set===st.contentSet);return topBar(subjectName()+' · '+st.contentSet+'. takım')+'<div class="wrap"><h1>Nasıl çalışalım?</h1><p class="note">Bazı görsellerin yanında kullanım bilgisi var. Seçimini yaparken bu bilgiyi de oku.</p><p class="card">'+sesDugme(boardIntro(its.length,6))+esc(boardIntro(its.length,6))+'</p><div class="list">'+menuButton('Öğreniyorum','Her yanıttan sonra geri bildirim alırsın. Yanlış yanıtta yeniden deneyebilirsin.',"startBoard('learn',12)")+menuButton('Uyguluyorum','Tüm görselleri eşleştir. Sonra “Yanıtları kontrol et” düğmesine dokun.'+(st.subject==='baharat'?' Kontrolden sonra ürünlerin kısa bilgilerini oku.':''),"startBoard('check',12)")+'</div><details class="card"><summary>Öğretmen için hazırlık çalışmaları</summary><p>Bu kısa çalışmalar, 12 görsellik değerlendirmeyle karşılaştırılmaz.</p><div class="row"><button class="btn" onclick="startBoard(\'learn\',4)">4 görselle hazırlan</button><button class="btn" onclick="startBoard(\'learn\',6)">6 görselle hazırlan</button><button class="btn" onclick="startBoard(\'learn\',12,true)">Yerleri değiştirerek tekrar et</button></div><p>Farklı fotoğraflarla ve gerçek '+(st.subject==='baharat'?'ürünlerle':'araçlarla')+' tanıma ayrıca çalışılır. Kartların yerini değiştirmek, farklı örnekleri tanıdığını tek başına göstermez.</p></details></div>';}
function boardHTML(){
 const b=st.board,done=Object.keys(st.practice==='check'?b.pair:b.res).length;let h=topBar(subjectName()+' · '+st.contentSet+'. takım',true)+'<div class="wrap board-wrap"><div class="stats"><span class="chip">Eşlenen '+done+' / '+b.items.length+'</span><span class="chip">Ad kartı '+b.names.length+'</span>'+(st.practice==='learn'||b.checked?'<span class="chip">Puan '+st.sess.s+'</span>':'')+'</div>';
 h+='<p class="board-help" role="status">'+(st.kDone?'Çalışma tamamlandı.':b.selName?'Şimdi '+esc(b.selName)+' adına uygun görseli seç.':b.sel?'Şimdi bu görselin adını seç.':'Bir görsel seç. İstersen önce bir ad da seçebilirsin.')+'</p><div class="board"><div class="board-imgs" id="boardPictureArea">';
 b.items.forEach((it,i)=>{const r=b.res[it.id],nm=b.pair[it.id];let cls='bimg'+(st.practice==='check'&&!b.checked&&nm?' paired':'')+(b.sel===it.id?' sel':'')+(r===1||r===2?' ok':r===0?' bad':'');let lbl=nm?esc(nm):'&nbsp;';if(b.checked&&r===0)lbl='<s>'+esc(nm)+'</s><br>Doğru: '+esc(it.answer);else if(r===0)lbl='Yanıt gösterildi: '+esc(it.answer);else if(r===1||r===2)lbl='✓ '+lbl;
 h+='<div class="'+cls+'"><button class="bimg-btn" aria-pressed="'+(b.sel===it.id)+'"'+(it.task?' aria-describedby="task-'+it.id+'"':'')+' aria-label="'+(i+1)+'. görsel'+(nm?', eşlenen ad: '+esc(nm):'')+'" onclick="tapImg(\''+it.id+'\')"><img src="'+esc(it.image)+'" alt=""></button><div class="bimg-tools"><button class="zoom-btn" aria-label="'+(i+1)+'. görseli büyüt" onclick="zoomImg(\''+it.id+'\')">⤢</button><div class="blbl">'+lbl+'</div></div>';
 if(it.task)h+='<p id="task-'+it.id+'" class="card-task">'+esc(it.task)+'</p>';
 if(b.checked)h+='<details class="card"><summary>Açıklama</summary><p>'+esc(it.explanation||'')+'</p>'+sesDugme(it.answer+'. '+it.explanation)+'</details>';h+='</div>';});
 h+='</div><div class="board-side" id="boardChoiceArea">'+(b.sel?'<div class="mobile-selected"><img src="'+esc(boardItem(b.sel).image)+'" alt="Seçilen görsel"><span>Bu görselin adını seç.</span></div>':'')+msgHtml()+'<div class="board-names">';
 b.names.forEach((n,i)=>{const used=boardUsed(n),unavailable=used&&!(st.practice==='check'&&b.sel&&b.pair[b.sel]===n);if(st.kDone)return;/* Değerlendirmede adlar yerlerinde kalır; kaybolup yeni yerleşim oluşturmaz. */if(used&&st.practice==='learn')return;h+='<button class="bname'+(b.selName===n?' sel':'')+'" aria-pressed="'+(b.selName===n)+'"'+(unavailable?' disabled':'')+' onclick="tapName('+i+')">'+esc(n)+'</button>';});
 h+='</div>';if(st.practice==='check'&&!b.checked)h+='<button class="btn pri" onclick="checkBoard()"'+(done<b.items.length?' disabled':'')+'>Yanıtları kontrol et</button>';if(st.kDone)h+='<button class="btn pri" onclick="finish()">Raporu Gör</button><button class="btn" onclick="startBoard(st.practice,'+b.size+')">Yeniden çalış</button>';return h+'</div></div>'+footHtml()+'</div>';
}
render=function(){if(st.screen==='boardmode'||st.screen==='board'){document.getElementById('app').innerHTML=st.screen==='board'?boardHTML():boardModeHTML();return;}BOARD_PREV_RENDER();};
