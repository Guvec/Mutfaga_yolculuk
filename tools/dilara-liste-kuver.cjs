/* Kuver'de okunabilecek bütün metinleri sayfanın kendi koduyla cümle/parça listesine çevirir → tools/dilara-kuver.json. Çalıştırma: node tools/dilara-liste-kuver.cjs (playwright gerekir) */
const fs=require('fs');
const icerik=JSON.parse(fs.readFileSync(''+require('path').resolve(__dirname,'..')+'/content/kuver/icerik.json','utf8'));
require('./dilara-sayfa.cjs')((ic)=>{
 const cumle=new Set(),parca=new Set();
 const C=t=>{t=sesMetin(t);if(t)dilCumleler(t).forEach(c=>cumle.add(c));};
 const P=t=>{t=sesMetin(t);if(t)dilCumleler(t).forEach(s=>dilVirgul(s).forEach(c=>parca.add(c)));};
 // Kuveri Kur ve Parçanın adı (iki düzey; peçete düzeye göre değişir)
 [1,3].forEach(l=>{kvUygula(l);['kuver_tabagi'].concat(LEVELS[l].items).forEach(k=>{const it=ITEMS[k];C(it.kural);C(it.ayirt);P(sesAd(it.ad));P(it.AD);});});
 ['Kuver tabağı masada hazır.','Tekrar dene.','Bu yer başka bir parçanın yeri.','Görsele dikkatle bak.','Henüz doğru yanıt bulunmadı.','Doğru yeri görmek için düğmeye dokun.','Doğru cevabı görmek için düğmeye dokun.',
  'Doğru! +'+PTS+' puan','Doğru! +10 puan','Düzelttin! +5 puan. İkinci denemede buldun.','Düzelttin! +5 puan','Doğru yer burası.','Doğru cevap:','Doğru yanıt:',
  'Birlikte tekrar deneyelim.','Doğru yanıtı inceleyelim.','Yanıtın kaydedildi.','Açıklamayı görmek için düğmeye dokun.','Çok hızlısın, minik şef! ⚡ +10 puan',
  'Öne çıkan parçanın adı nedir? Seçenekler:','Sıradaki parça:','Masada bu parçanın yerine dokun.','Seçenekler fotoğraflıdır: A, B, C ve D.',
  'Soruyu ve seçenekleri yeniden incele.','Pekiştiriyorum: önce yanlış yerleştirdiğin parçalar gelecek.','Sonraki parçaya geç. Sonuçlar çalışma bitince açılır.','Doğru.'].forEach(C);
 ['A','B','C','D'].forEach(P);
 ic.questions.forEach(q=>{C(q.prompt);q.choices.forEach(c=>P(c.text));C(q.explanation||'');C(q.hint||'');P(q.choices.find(c=>c.id===q.correct).text);});
 cumle.forEach(c=>parca.delete(c));
 return {cumle:[...cumle],parca:[...parca]};
},icerik).then(o=>{
 const all=[...o.cumle,...o.parca];
 fs.writeFileSync(''+require('path').resolve(__dirname,'..')+'/tools/dilara-kuver.json',JSON.stringify(all,null,1));
 console.log('cümle',o.cumle.length,'parça',o.parca.length,'karakter',all.join('').length);
 console.log(all.slice(0,12).join('\n'));
});
