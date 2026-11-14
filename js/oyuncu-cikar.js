/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* 14.11 akşam: Oda sahibi salonda bir oyuncuyu çıkarabilir (oyun başlamadan). Çıkarılan bu odaya yeniden giremez.
   Firestore kuralı gerekir (oyunOdalari güncelleme: ban listesi). Kural yayımlanmadıysa "izin yok" uyarısı çıkar, başka bir şey bozulmaz. */
'use strict';
if(typeof YarisFirebase==='function'&&!YarisFirebase.prototype.kick){
 YarisFirebase.prototype.kick=async function(code,uid){
  await this.connect();const fb=this.sdk;
  await fb.runTransaction(this.db,async tx=>{
   const s=await tx.get(this.room(code));if(!s.exists())throw Error('Oda bulunamadı.');const r=s.data();
   if(r.host!==this.uid||r.status!=='lobby')throw Error('Oyun başladıktan sonra oyuncu çıkarılamaz.');
   const ban=[...(r.ban||[])];if(!ban.includes(uid))ban.push(uid);if(ban.length>20)throw Error('Bu odada çıkarma sınırı doldu.');
   const p=await tx.get(this.player(code,uid));
   const yeni={ban};
   if(r.mode==='duel'){if(r.guest!==uid)throw Error('Bu oyuncu odada değil.');yeni.guest=null;}
   else{if(!p.exists())throw Error('Bu oyuncu odada değil.');yeni.cnt=Math.max(1,(r.cnt||1)-1);}
   if(p.exists())tx.delete(this.player(code,uid));
   tx.update(this.room(code),yeni);
  });
 };
}
window.ocCikar=function(uid){
 const p=YR.players.find(x=>x.uid===uid);if(!p||!YR.host||!YR.room||YR.room.status!=='lobby')return;
 modal('<b>'+esc(p.nick)+'</b> odadan çıkarılsın mı?<br>Bu odaya yeniden giremez.',async()=>{
  closeModal();
  try{await yrService().kick(YR.code,uid);YR.notice=p.nick+' odadan çıkarıldı.';}
  catch(e){YR.error=/permission|insufficient/i.test(String(e&&e.message))?'Oyuncu çıkarma henüz açılmadı (Firebase kuralı yayımlanmalı).':yrErrText(e);}
  render();
 });
};
/* Salon listesinde: oda sahibi her oyuncunun yanında "Çıkar" görür. */
if(typeof yrPlayersListHTML==='function'){const O=yrPlayersListHTML;yrPlayersListHTML=function(){
 let h=O.apply(this,arguments);
 if(!YR.host||!YR.room||YR.room.status!=='lobby')return h;
 const me=yrMe();
 YR.players.filter(p=>p.uid!==me).forEach(p=>{
  const ad=esc(p.nick);
  h=h.replace(new RegExp('(<span class="yr-nm">'+ad.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'</span>)'),'$1<button type="button" class="oc-cikar" onclick="ocCikar(\''+esc(p.uid)+'\')" aria-label="'+ad+' odadan çıkar">Çıkar</button>');
 });
 return h;
};}
/* Çıkarılan oyuncu: kaydı silinir, oda "ban" listesinde adını görür → salondan çıkar ve nedenini okur. */
if(typeof yrRoomChanged==='function'){const O=yrRoomChanged;yrRoomChanged=function(room){
 if(room&&YR.active&&room.status==='lobby'&&Array.isArray(room.ban)&&room.ban.includes(yrMe())&&room.host!==yrMe()){
  try{mdSil();}catch(e){}
  yrReset();YR.error='Oda sahibi seni bu odadan çıkardı. Başka bir odaya katılabilirsin.';st.screen='racemenu';render();return;
 }
 return O.apply(this,arguments);
};}
