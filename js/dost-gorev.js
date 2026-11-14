/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
'use strict';

const DOST_ACMA_PUANI=50;
const DOST_KILITLI=['rabbit','koala','civciv','penguen','papagan','kedi','keci','geyik'];

function dostGorevDepo(){return ls('dost_gorev',{});}
function dostGorevProfil(pid=dostPid()){
 const old=pid?dostGorevDepo()[pid]:null;
 if(old&&Number.isInteger(old.total))return old;
 const runs=Object.entries(old?.runs||{});
 const earned=([,run])=>Math.max(0,Math.trunc(Number(run.earned)||0));
 return {active:old?.active||null,unlocked:old?.unlocked||{},seen:{},
  total:runs.reduce((sum,run)=>sum+earned(run),0),
  spent:runs.filter(([id])=>old?.unlocked?.[id]).reduce((sum,run)=>sum+earned(run),0)};
}
function dostGorevYaz(pid,entry){return lsSet('dost_gorev',{...dostGorevDepo(),[pid]:entry});}
function dostGorevAcik(id,pid=dostPid()){
 return !DOST_KILITLI.includes(id)||!!dostGorevProfil(pid).unlocked[id];
}
function dostPuanBakiye(entry){return Math.max(0,entry.total-entry.spent);}
function dostGorevSec(id){
 const pid=dostPid();
 if(!pid||!DOST_KILITLI.includes(id)||dostGorevAcik(id,pid))return false;
 const entry=dostGorevProfil(pid);
 entry.active=id;
 return dostGorevYaz(pid,entry);
}
function dostGorevAc(id){
 const pid=dostPid(),entry=dostGorevProfil(pid);
 if(!pid||!DOST_KILITLI.includes(id)||entry.active!==id||entry.unlocked[id]||dostPuanBakiye(entry)<DOST_ACMA_PUANI)return false;
 entry.spent+=DOST_ACMA_PUANI;
 entry.unlocked[id]=true;
 entry.active=null;
 return dostGorevYaz(pid,entry);
}
function dostOyunPuanla(sonuc){
 const pid=dostPid();
 if(!pid||!sonuc?.key||!Number.isInteger(sonuc.total)||sonuc.total<1||!Number.isInteger(sonuc.correct)||sonuc.correct<0||sonuc.correct>sonuc.total)return 0;
 const entry=dostGorevProfil(pid);
 if(Object.hasOwn(entry.seen,sonuc.key))return entry.seen[sonuc.key];
 const puan=5+Math.round(5*sonuc.correct/sonuc.total);
 entry.total+=puan;
 entry.seen[sonuc.key]=puan;
 return dostGorevYaz(pid,entry)?puan:0;
}
/* 14.11: Kilitli dost için açma hedefi (Valorant ajan kontratı mantığı, öğrenci diliyle): dost puanı biriktirilir, dolunca kilit açılır. */
function dostPuanHTML(id){
 const pid0=dostPid();
 if(pid0&&id){const entry=dostGorevProfil(pid0),bal=dostPuanBakiye(entry),locked=!dostGorevAcik(id,pid0),aktif=entry.active===id,ad=(typeof DOST_CHARACTERS!=='undefined'&&DOST_CHARACTERS[id]?DOST_CHARACTERS[id].ad:'Dost');
  if(!locked)return '<div class="dost-kontrat tamam"><b>✅ '+esc(ad)+' senin dostun</b><span>Kullanılabilir dost puanı: '+bal+'</span></div>';
  const v=Math.min(bal,DOST_ACMA_PUANI),y=Math.round(100*v/DOST_ACMA_PUANI);
  return '<div class="dost-kontrat'+(aktif?' aktif':'')+'"><div class="dk-bas"><b>'+(aktif?'🎯 Hedefin: ':'🔒 ')+esc(ad)+'</b><span>Açmak için '+v+' / '+DOST_ACMA_PUANI+' dost puanı</span></div><div class="dk-cubuk" role="progressbar" aria-label="Kilidi açma ilerlemesi" aria-valuemin="0" aria-valuemax="'+DOST_ACMA_PUANI+'" aria-valuenow="'+v+'"><i style="width:'+y+'%"></i></div><p>'+(bal>=DOST_ACMA_PUANI?'Puanın yetti! "Kilidi aç" düğmesine bas.':(aktif?'Oynadıkça puanın dolacak. ':'Bu dostu açmak istiyorsan "Hedefim olsun" düğmesine bas. ')+'Her biten oyun 5–10 dost puanı kazandırır.')+'</p></div>';}
 return dostPuanHTMLEski(id);
}
function dostPuanHTMLEski(id){
 const pid=dostPid();
 if(!pid)return '<div class="dost-gorev"><p>Dost puanlarını biriktirmek için profil seçilir.</p></div>';
 const entry=dostGorevProfil(pid),balance=dostPuanBakiye(entry);
 const locked=id&&!dostGorevAcik(id,pid);
 return '<div class="dost-gorev"><p><strong>Kullanılabilir dost puanı: '+balance+'</strong></p><p>Toplam kazanılan: '+entry.total+'</p>'+
  (locked?'<p>Açma bedeli: '+DOST_ACMA_PUANI+' puan</p><progress aria-label="Dostu açma ilerlemesi" value="'+Math.min(balance,DOST_ACMA_PUANI)+'" max="'+DOST_ACMA_PUANI+'"></progress>'+
   '<p>'+ (balance>=DOST_ACMA_PUANI?'Bu dostu açmak için yeterli puan var.':DOST_ACMA_PUANI-balance+' puan kaldı. Her tamamlanan oyun puan kazandırır.')+'</p>':'')+'</div>';
}
function dostPuanSonucu(){
 switch(st.screen){
  case 'aover':return AR?.over&&!AR.quit?dostPuanYanitlari('arena|'+arCacheKey(),AR.myR.map(v=>v>0)):null;
  case 'dover':return DU?.over&&!DU.left&&!DU.quit?dostPuanYanitlari('kapisma|'+YR.code+'|'+YR.room.created+'|'+DU.m,DU.myR.filter(v=>Number.isFinite(v)).map(v=>v>0)):null;
  case 'raceover':return YR.g?.done?dostPuanYanitlari('oda|'+YR.code+'|'+YR.room.created,YR.g.log.map(a=>a.ok)):null;
  case 'cvover':return CV?.over?dostPuanYanitlari('meydan|'+CV.id,CV.log.map(a=>a.ok)):null;
  case 'haftaover':return HAFTA?.done&&HAFTA.pid===dostPid()?dostPuanYanitlari('hafta|'+HAFTA.id,HAFTA.answers.map(a=>a.ok)):null;
  case 'yolplay':return dostPuanYol();
  case 'summary':
  case 'quiz':
  case 'board':
  case 'spicereview': {
   const s=st.sess;
   if(!st.kDone||!s||(s.p&&s.p!==st.prof)||s.race||s.practice==='pek'||st.practice==='pek')return null;
   return dostPuanYanitlari('tek|'+s.id,s.qs.filter(a=>a.r!=null).map(a=>a.r===1));
  }
  default:return null;
 }
}
function dostPuanYanitlari(key,answers){
 return {key,correct:answers.filter(Boolean).length,total:answers.length};
}
function dostPuanYol(){
 if(!Y||!['bitti','sbitti','basarisiz'].includes(Y.phase)||!Y.tohum)return null;
 const key='yol|'+YOL_AYAR.subject+'|'+Y.tohum;
 const score=Y.phase==='bitti'?Y.sk?.s3:Y.fark;
 if(Number.isInteger(score))return {key,correct:score,total:Y.qs?.length||Y.node.items.length};
 const matched=Y.m?.ogeler?.length||0;
 return {key,correct:matched,total:matched+(Y.m?.hata||0)};
}
function dostPuanSonucGoster(){
 const sonuc=dostPuanSonucu(),puan=dostOyunPuanla(sonuc);
 if(!puan)return;
 const target=document.querySelector('#app .wrap, #app .quiz .side, #app .yol-sayfa');
 if(!target||target.querySelector('.dost-puan-sonuc'))return;
 target.insertAdjacentHTML('afterbegin','<p class="card dost-puan-sonuc"><strong>+'+puan+' dost puanı</strong> · Kullanılabilir: '+dostPuanBakiye(dostGorevProfil())+'</p>');
}
