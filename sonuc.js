/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Oyun sonu raporu: puan, doğru/yanlış, en iyi seri, rekor, ortalama süre. Ekranda kart, istenirse resim olarak kaydedilir.
   Puan = doğru sayısı × 10. Rekor, aynı oyun ve aynı soru ayarı için bu profilin telefondaki en iyi puanıdır. */
'use strict';
function sonucIst(log){
 let d=0,y=0,seri=0,en=0,top=0;
 (log||[]).forEach(x=>{if(x.ok){d++;seri++;if(seri>en)en=seri;}else{y++;seri=0;}top+=Math.max(0,x.ms|0);});
 const n=d+y;return {dogru:d,yanlis:y,seri:en,toplam:n,ort:n?top/n/1000:0,puan:d*10};
}
function sonucRekor(key,puan){
 if(st.guest||!st.prof)return {durum:'',en:puan};
 const all=ls('rk_oyun',{}),mine=all[st.prof]=all[st.prof]||{},old=mine[key];
 let durum='';if(old===undefined)durum='ilk';else if(puan>old)durum='yeni';
 const en=Math.max(old|0,puan);mine[key]=en;lsSet('rk_oyun',all);
 return {durum,en};
}
function sonucUret(oyun,alt,key,log,ek){
 const i=sonucIst(log),r=sonucRekor(key,i.puan);
 return {oyun,alt,ad:st.guest||!st.prof?'Misafir':st.prof,puan:i.puan,dogru:i.dogru,yanlis:i.yanlis,seri:i.seri,toplam:i.toplam,ort:i.ort,rekor:r.en,durum:r.durum,ek:ek||'',zaman:new Date()};
}
function sonucSn(x){return (Math.round(x*10)/10).toFixed(1).replace('.',',')+' sn';}
function sonucTarih(d){const p=n=>String(n).padStart(2,'0');return p(d.getDate())+'.'+p(d.getMonth()+1)+'.'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes());}
function sonucSerit(d){return d.durum==='yeni'?'🏆 YENİ REKOR!':d.durum==='ilk'?'⭐ İlk sonucun kaydedildi':'';}
function sonucHTML(d){
 if(!d)return '';
 const tile=(a,b,c)=>'<div class="sn-tile"><small>'+a+'</small><b class="'+(c||'')+'">'+b+'</b></div>';
 return '<section class="sn-kart" aria-label="Oyun sonucu"><div class="sn-ust"><p class="sn-oyun">'+esc(d.oyun)+'</p><p class="sn-ad">'+esc(d.ad)+'</p><p class="sn-alt">'+esc(d.alt)+'</p><p class="sn-zaman">'+sonucTarih(d.zaman)+'</p>'+(d.ek?'<p class="sn-ek">'+esc(d.ek)+'</p>':'')+'<div class="sn-puan">'+d.puan+'</div><div class="sn-pl">PUAN</div></div>'
  +(sonucSerit(d)?'<div class="sn-serit" role="status">'+sonucSerit(d)+'</div>':'')
  +'<div class="sn-izgara">'+tile('Doğru',d.dogru,'ok')+tile('Yanlış / süre doldu',d.yanlis,'bad')+tile('En iyi seri',d.seri)+tile('Rekor',d.rekor)+tile('Toplam soru',d.toplam)+tile('Ortalama süre / soru',sonucSn(d.ort))+'</div>'
  +'<button type="button" class="btn" onclick="sonucKaydet()">📷 Kartı resim olarak kaydet</button></section>';
}
var SONUC_SON=null;
function sonucGoster(d){SONUC_SON=d;return sonucHTML(d);}
/* Kartı resme çizer (1080×1440). */
function sonucResim(d){
 const c=document.createElement('canvas');c.width=1080;c.height=1440;const g=c.getContext('2d');
 const gr=g.createLinearGradient(0,0,0,740);gr.addColorStop(0,'#0f7a74');gr.addColorStop(1,'#123d52');g.fillStyle=gr;g.fillRect(0,0,1080,740);
 g.fillStyle='#fff';g.fillRect(0,740,1080,700);g.textAlign='center';
 g.fillStyle='#fff';g.font='bold 64px Arial';g.fillText(d.oyun,540,130);
 g.font='44px Arial';g.fillStyle='#d6f0ee';g.fillText(d.ad,540,205);
 g.font='34px Arial';g.fillText(d.alt,540,265);g.font='30px Arial';g.fillText(sonucTarih(d.zaman),540,315);
 if(d.ek){g.font='bold 40px Arial';g.fillStyle='#fff';g.fillText(d.ek,540,380);}
 g.fillStyle='#ffe14d';g.font='bold 250px Arial';g.fillText(String(d.puan),540,610);
 g.fillStyle='#fff';g.font='bold 48px Arial';g.fillText('PUAN',540,700);
 let y=780;
 if(sonucSerit(d)){g.fillStyle='#ffe14d';g.beginPath();g.roundRect?g.roundRect(50,y,980,90,24):g.rect(50,y,980,90);g.fill();g.fillStyle='#123d52';g.font='bold 50px Arial';g.fillText(sonucSerit(d),540,y+62);y+=130;}else y+=20;
 const T=[['Doğru',d.dogru,'#1b9a4f'],['Yanlış / süre doldu',d.yanlis,'#d6453d'],['En iyi seri',d.seri,'#1b2a33'],['Rekor',d.rekor,'#1b2a33'],['Toplam soru',d.toplam,'#1b2a33'],['Ortalama süre / soru',sonucSn(d.ort),'#1b2a33']];
 T.forEach((t,i)=>{const x=50+(i%2)*500,yy=y+Math.floor(i/2)*150;g.fillStyle='#f1f4f6';g.beginPath();g.roundRect?g.roundRect(x,yy,480,130,24):g.rect(x,yy,480,130);g.fill();g.textAlign='left';g.fillStyle='#5b6b75';g.font='30px Arial';g.fillText(t[0],x+28,yy+48);g.fillStyle=t[2];g.font='bold 54px Arial';g.fillText(String(t[1]),x+28,yy+108);});
 g.textAlign='center';g.fillStyle='#8a979f';g.font='28px Arial';g.fillText('Rapor: '+sonucTarih(new Date()),540,1400);
 return c.toDataURL('image/png');
}
function sonucKaydet(){
 const d=SONUC_SON;if(!d)return;const url=sonucResim(d);
 modalFocus=document.activeElement;st.modalOpen=true;pauseT();const ov=document.getElementById('ov');ov.className='on';
 ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="snT"><h2 id="snT">Sonuç kartın</h2><img class="sn-resim" src="'+url+'" alt="Oyun sonuç kartı: '+esc(d.puan)+' puan"><div class="row"><a class="btn pri" id="snIndir" href="'+url+'" download="oyun-sonucu.png">Telefona kaydet</a><button class="btn" id="snKapat">Kapat</button></div></div>';
 document.getElementById('snKapat').onclick=function(){closeModal();};document.getElementById('snKapat').focus();
}
/* Rekor sesi: yeni rekor ya da ilk sonuç değil, gerçekten kırılan rekor. */
function sonucSes(d,kazandi){
 if(typeof EFEKT==='undefined')return;
 if(d&&d.durum==='yeni')EFEKT.cal('rekor');else if(kazandi)EFEKT.cal('win');else EFEKT.cal('kayip');
}
