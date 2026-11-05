/* Oyun ayarına ait liderler ve sonuç altı sıralama. Okumalar ekran başına paylaşılır. */
'use strict';
const RK_INLINE=new Map();let RK_PRE=null;
function rkHat(period){return '<img class="rk-hat" src="assets/tasarim/sef-kepi-128.png" width="128" height="128" alt=""><span class="sr-only">'+(period==='hafta'?'Haftanın birincisi':'Genel birinci')+'</span>';}
function rkRowsHTML(rows,board,period,limit){
 const b=rkBoard(board),sorted=rkSorted(rows||[]),pid=!st.guest&&st.prof?rkPid(st.prof):null,shown=sorted.slice(0,limit||10),mine=sorted.find(r=>r.pid===pid);if(mine&&!shown.includes(mine)&&limit!==3)shown.push(mine);
 return '<ol class="rk-rows">'+shown.map(r=>{const rank=sorted.filter(x=>x.correct>r.correct).length+1;return '<li class="rk-row'+(r.pid===pid?' rk-me':'')+'"><span class="rk-rank">'+(rank===2?'🥈':rank===3?'🥉':rank+'.')+'</span><span class="rk-name">'+(rank===1?rkHat(period):'')+esc(r.name)+(r.pid===pid?' <b>(sen)</b>':'')+(typeof rutbeLabel==='function'?rutbeLabel(r.rank):'')+'</span><span class="rk-score">'+r.correct+(b&&b.kind!=='win'?' / '+b.total:'')+'</span></li>';}).join('')+'</ol>';
}
function rkGap(rows,b){if(st.guest||!st.prof)return '';const pid=rkPid(st.prof),me=rows.find(r=>r.pid===pid);if(!me)return '';const higher=rkSorted(rows).filter(r=>r.correct>me.correct),equal=rows.find(r=>r.pid!==pid&&r.correct===me.correct);if(!higher.length)return equal?esc(equal.name)+' ile aynı puandasın. Zirveye ortak oldun!':RK.msg&&RK.msg.board===b.id&&['Yeni kişisel rekor!','İlk sonucun kaydedildi.'].includes(RK.msg.head)?'Bu oyunda zirveye çıktın!':'Zirvedesin.';if(equal)return esc(equal.name)+' ile aynı puandasın.';const next=higher[higher.length-1];return esc(next.name)+"’i geçmek için "+(next.correct-me.correct+1)+' '+(b.kind==='win'?'galibiyet':'doğru')+' daha.';}
function rkInlineKey(board,period,week){return rkTable(board,period||'genel',week);}
function rkInlineHTML(board,period,week){
 if(!rkBoard(board))return '';const key=rkInlineKey(board,period,week),entry=RK_INLINE.get(key);
 if(!entry){RK_INLINE.set(key,{state:'loading'});rkInlineLoad(board,period,week);return '<section class="card rk-inline" role="status">Sıralama yükleniyor…</section>';}
 if(entry.state==='error')return '<section class="card rk-inline" role="status">Sıralamaya şu anda ulaşılamadı.</section>';
 if(entry.state==='loading')return '<section class="card rk-inline" role="status">Sonucun kaydediliyor.</section>';
 if(!entry.rows.length)return '<section class="card rk-inline">Bu listede henüz sonuç yok.</section>';
 return '<section class="card rk-inline"><h2>İlgili sıralama</h2>'+rkRowsHTML(entry.rows,board,period,10)+'<p role="status">'+rkGap(entry.rows,rkBoard(board))+'</p></section>';
}
async function rkInlineLoad(board,period,week){const key=rkInlineKey(board,period,week);try{const be=rkBackend();if(!be)throw Error('NO_CONFIG');const rows=await be.list(key);RK_INLINE.set(key,{state:'ready',rows});}catch(e){RK_INLINE.set(key,{state:'error'});}render();}
function rkInlineRefresh(){RK_INLINE.clear();}
async function rkBefore(board,fn){
 if(!board||!rkOnline()||!rkBackend())return fn();const screen=st.screen,prof=st.prof,token={};RK_PRE=token;
 let rows;try{rows=await Promise.race([rkBackend().list(rkTable(board,'genel')),new Promise(resolve=>setTimeout(()=>resolve(null),2000))]);}catch(e){}
 if(RK_PRE!==token||st.screen!==screen||st.prof!==prof)return;
 if(!rows||!rows.length){RK_PRE=null;return fn();}RK_PRE={...token,board,rows,fn,from:screen};go('rkpre');
}
function rkPreGo(){const p=RK_PRE;RK_PRE=null;if(p&&p.fn)p.fn();}
function rkPreHTML(){const p=RK_PRE;return topBar('Oyunun liderleri')+'<div class="wrap"><h1>Bu oyunun liderleri</h1>'+rkRowsHTML(p.rows,p.board,'genel',3)+'<button class="btn pri" onclick="rkPreGo()">Başla</button><button class="btn" onclick="rkPreGo()">Geç</button></div>';}
function rkBoardBefore(kind,arg){if(kind==='board')return RK_SUBJ[st.subject]?RK_SUBJ[st.subject]+'-e'+st.contentSet:null;if(kind==='kuver')return st.op==='kur'?(st.lvl===3?'kv-tabldot':st.lvl===1?'kv-basit':null):null;const b=RK_BOARDS.find(b=>b.kind==='mcq'&&b.subject===st.subject&&b.group===st.mcqGroup);return b&&b.id;}
const FLOW_BOARD=startBoard,FLOW_START=startSession,FLOW_CONTENT=startContent;
startBoard=function(practice,size){const args=arguments;return practice==='check'&&size===12?rkBefore(rkBoardBefore('board'),()=>FLOW_BOARD.apply(this,args)):FLOW_BOARD.apply(this,args);};
startSession=function(){const args=arguments;return st.practice==='check'?rkBefore(rkBoardBefore('kuver'),()=>FLOW_START.apply(this,args)):FLOW_START.apply(this,args);};
startContent=function(){const args=arguments;return st.practice==='check'?rkBefore(rkBoardBefore('mcq'),()=>FLOW_CONTENT.apply(this,args)):FLOW_CONTENT.apply(this,args);};
function rkDuelBoard(room){return room&&room.mode==='duel'?'oy-kapisma':room&&room.mode==='arena'?'oy-arena':null;}
function rkCountdownHTML(){return YR.leaderRows&&YR.leaderRows.length?'<section class="card"><b>Bu oyunun liderleri</b>'+rkRowsHTML(YR.leaderRows,YR.leaderBoard,'genel',3)+'</section>':'';}
function rkCountLeaders(room){YR.leaderRows=null;const b=rkSettingBoard(room);if(!b||!rkBackend())return;YR.leaderBoard=b.id;const start=Date.now(),code=YR.code;rkBackend().list(rkTable(b.id,'genel')).then(rows=>{if(Date.now()-start>2000||YR.code!==code||!['dintro','aintro'].includes(st.screen)||!rows.length)return;YR.leaderRows=rows;render();}).catch(()=>{});}
function rkSettingBoard(c){
 if(!c||c.mode==='race')return null;const mode=c.mode==='canavar'?'cv':c.mode==='duel'?'du':c.mode==='arena'?'ar':null;if(!mode)return null;
 const sub={baharat:'bh','mutfak-araclari':'ma','bulasik-makinesi-temizligi':'bl',kuver:'kv'}[c.subject],scope={tek:'t',konu:'k',butun:'a'}[c.scope||'tek'],kind={gorsel:'g',bilgi:'b',kuver:'v'}[c.kind];
 const id=['ayar',mode,sub,scope,kind,c.set||0,c.n||10,c.mode==='canavar'?0:c.lim||20].join('-');return rkDynamicBoard(id);
}
function rkDynamicBoard(id){
 const m=/^ayar-(du|ar|cv)-(bh|ma|bl|kv)-(t|k|a)-(g|b|v)-(\d|1[012])-(10|15|20)-(0|15|20|30)$/.exec(id);if(!m)return null;
 return {id,subject:'oyun',kind:m[1]==='cv'?'score':'win',total:m[1]==='cv'?Number(m[6]):999,label:({du:'Kapışma',ar:'Er Meydanı',cv:'Meydan Okuma'}[m[1]])+' · '+id.split('-').slice(2).join(' · '),dynamic:true};
}
const FLOW_FIND=rkBoard;rkBoard=function(id){return FLOW_FIND(id)||rkDynamicBoard(id);};
function rkSettingSubmit(c,value){const b=rkSettingBoard(c);if(!b||st.guest||!st.prof)return;const pid=rkPid(st.prof,true),p=rkProf(pid),all=ls('rk_setting',{}),mine=all[pid]=all[pid]||{},record=mine[b.id]||{g:0,w:{}};const w=rkWeekNo();if(b.kind==='win'){record.g=Math.min(999,record.g+value);record.w[w]=Math.min(999,(record.w[w]||0)+value);}else{record.g=Math.max(record.g,value);record.w[w]=Math.max(record.w[w]||0,value);}mine[b.id]=record;lsSet('rk_setting',all);if(p.status!=='in')return;const q=rkQueue();for(const period of ['genel','hafta'])q.push({qid:rkRandomId(),pid,board:b.id,period,name:rkName(st.prof),correct:period==='genel'?record.g:record.w[w],gen:p.gen,at:Date.now(),sess:null});lsSet('rk_queue',q);rkFlush(null);}
const FLOW_FLUSH=rkFlush;rkFlush=async function(){await FLOW_FLUSH.apply(this,arguments);rkInlineRefresh();if(['dover','aover','cvover','haftaover'].includes(st.screen))render();};

const FLOW_CV_START=cvStart,FLOW_CV_NEW=cvNew;
cvStart=function(c){const b=rkSettingBoard({...c,mode:'canavar'});return rkBefore(b&&b.id,()=>FLOW_CV_START(c));};
cvNew=function(first){if(first)return FLOW_CV_NEW(first);const b=rkSettingBoard({...CV.cfg,mode:'canavar'});return rkBefore(b&&b.id,()=>FLOW_CV_NEW(false));};

function rkSettingInline(c){const b=rkSettingBoard(c);return b?rkInlineHTML(b.id,'genel'):'';}
