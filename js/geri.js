/* Oyun ekranlarında "← Geri": yanıt yoksa doğrudan, yanıt varsa onayla bir önceki ekrana döner.
   Yarıda bırakılan çalışma kaydedilmez, rekora ve sıralamaya yazılmaz. Telefonun geri tuşu da aynı yolu kullanır. */
'use strict';
function oyundaMi(){return (st.screen==='quiz'||st.screen==='board')&&!(typeof YR!=='undefined'&&YR.active);}
function oyunYanitli(){
 if(st.sess&&st.sess.qs&&st.sess.qs.length)return true;
 const b=st.board;return !!(st.screen==='board'&&b&&(Object.keys(b.pair||{}).length||Object.keys(b.res||{}).length));
}
function oyunHedef(){
 if(st.screen==='board')return 'boardmode';
 if(st.op==='mcq')return 'mcqmode';
 if(st.op==='kur'||st.op==='ad')return 'mode';
 return 'content';
}
function oyunDurdur(){
 st.run=false;st.t0=0;st.inBreak=false;st.modalOpen=false;
 try{if(typeof sesSus==='function')sesSus();}catch(e){}
 try{if(typeof MUZIK!=='undefined'&&MUZIK.efektBitti)MUZIK.efektBitti();}catch(e){}
}
function oyunVazgec(){
 const s=st.sess;
 if(s&&!st.kDone){try{lsSet('records',records().filter(function(r){return !(r.id===s.id&&r.p===s.p);}));}catch(e){}}
 oyunDurdur();
 if(!st.kDone){st.sess=null;st.q=null;st.board=null;st.lastRes=null;}
}
function oyunGeri(){
 if(!oyundaMi())return;
 const hedef=oyunHedef();
 if(st.kDone||!oyunYanitli()){oyunVazgec();go(hedef);return;}
 modal('Geri dönülürse bu çalışmadaki yanıtlar silinecek.',function(){closeModal();oyunVazgec();go(hedef);});
}
(function(){
 const G_BACK=back;
 back=function(){if(oyundaMi()){var ov=document.getElementById('ov');if(ov&&ov.classList.contains('on'))return;oyunGeri();return;}G_BACK();};
})();
