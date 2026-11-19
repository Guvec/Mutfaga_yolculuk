#!/usr/bin/env node
/* Dilara içe aktarıcı — ElevenLabs'te (site ya da bağlantı) üretilip indirilen MP3'leri oyuna ekler.
   Kullanım: node tools/dilara-ice-aktar.cjs eslesme.json
   eslesme.json: [{"metin":"Kuver tabağı büyük, düz bir tabaktır.","dosya":"indirilen/12.mp3"}, ...]
   "metin", üretim listesindeki parçanın AYNISI olmalı (ör. tools/dilara-kuver.json).
   Dosya audio/dilara/<özet>.mp3 adıyla kopyalanır, manifest güncellenir. Var olan klipler korunur. */
const fs=require('fs'),path=require('path');
const {dilHash}=require('../js/dilara-hash.js');
const kok=path.resolve(__dirname,'..'),dizin=path.join(kok,'audio','dilara'),mf=path.join(dizin,'manifest.json');
const lf=process.argv[2];if(!lf){console.error('eslesme.json gerekli');process.exit(1);}
const liste=JSON.parse(fs.readFileSync(lf,'utf8')),taban=path.dirname(path.resolve(lf));
const man=fs.existsSync(mf)?JSON.parse(fs.readFileSync(mf,'utf8')):{v:1,ses:'Dilara',klip:{}};
fs.mkdirSync(dizin,{recursive:true});let ok=0,atla=0,hata=0;
for(const {metin,dosya} of liste){
 const h=dilHash(metin),hedef=path.join(dizin,h+'.mp3'),kaynak=path.resolve(taban,dosya);
 if(man.klip[h]&&fs.existsSync(hedef)){atla++;continue;}
 if(!fs.existsSync(kaynak)||fs.statSync(kaynak).size<500){hata++;console.error('! dosya yok ya da boş: '+dosya);continue;}
 fs.copyFileSync(kaynak,hedef);man.klip[h]=1;ok++;
}
fs.writeFileSync(mf,JSON.stringify(man));
console.log(`Bitti: ${ok} eklendi, ${atla} zaten vardı, ${hata} hata. Manifestte ${Object.keys(man.klip).length} klip.`);
