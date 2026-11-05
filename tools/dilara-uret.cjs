#!/usr/bin/env node
/* Dilara klip üretici — KENDİ bilgisayarında, KENDİ anahtarınla çalıştırılır. Anahtar depoya yazılmaz.
   Kullanım:
     set ELEVENLABS_API_KEY=...   (Windows: set / PowerShell: $env:ELEVENLABS_API_KEY="...")
     set DILARA_VOICE_ID=...      (ElevenLabs'te Dilara sesinin kimliği)
     node tools/dilara-uret.cjs --liste eksik.json --limit 20     # deneme: ilk 20 metin
     node tools/dilara-uret.cjs --liste eksik.json                # hepsi
     node tools/dilara-uret.cjs --kuru --liste eksik.json         # üretmeden sayı ve karakter göster
     --max-karakter 30000   # toplam karakter üst sınırı (kredi korumak için)
     --model eleven_flash_v2_5   # daha ucuz model (kredi oranı ElevenLabs'te doğrulanmalı)
   --liste: metin dizisi içeren JSON (uygulamadaki "Ses ayarları > Listeyi kopyala" çıktısı) ya da satır başına bir metin içeren .txt
   Var olan klipler atlanır. Çıktı: audio/dilara/<özet>.mp3 ve audio/dilara/manifest.json */
const fs=require('fs'),path=require('path'),vm=require('vm');
const kok=path.resolve(__dirname,'..'),dizin=path.join(kok,'audio','dilara'),mf=path.join(dizin,'manifest.json');
const arg=n=>{const i=process.argv.indexOf(n);return i<0?null:(process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:true);};
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(kok,'js','dilara-hash.js'),'utf8').replace(/if\(typeof module[^\n]*\n?/,''),ctx);
const ses=fs.readFileSync(path.join(kok,'js','ses.js'),'utf8').split('\n');
vm.runInContext(ses.filter(l=>/^var OKUNUS=|^function sesMetin\(/.test(l)).join('\n'),ctx);
function oku(f){const s=fs.readFileSync(f,'utf8');if(f.endsWith('.json'))return JSON.parse(s);return s.split(/\r?\n/).filter(Boolean);}
(async()=>{
 const lf=arg('--liste');if(!lf||lf===true){console.error('--liste gerekli');process.exit(1);}
 const limit=Number(arg('--limit'))||Infinity,kuru=!!arg('--kuru');
 const man=fs.existsSync(mf)?JSON.parse(fs.readFileSync(mf,'utf8')):{v:1,ses:'Dilara',klip:{}};
 const ham=oku(lf),islenen=new Map();
 ham.forEach(m=>{const t=ctx.sesMetin(m);if(t)islenen.set(ctx.dilHash(t),t);});
 const yapilacak=[...islenen].filter(([h])=>!man.klip[h]||!fs.existsSync(path.join(dizin,h+'.mp3')));
 const mk=Number(arg('--max-karakter'))||Infinity;let top=0;
 const sec=yapilacak.slice(0,limit).filter(([,t])=>{if(top+t.length>mk)return false;top+=t.length;return true;}),kar=sec.reduce((a,[,t])=>a+t.length,0);
 console.log(`Listede ${islenen.size} ayrı metin; üretilecek ${sec.length}; yaklaşık ${kar} karakter.`);
 if(kuru)return;
 const key=process.env.ELEVENLABS_API_KEY,voice=process.env.DILARA_VOICE_ID;
 if(!key||!voice){console.error('ELEVENLABS_API_KEY ve DILARA_VOICE_ID ortam değişkenleri gerekli.');process.exit(1);}
 fs.mkdirSync(dizin,{recursive:true});let ok=0,hata=0;
 for(const [h,t] of sec){
  try{
   const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_64`,{method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json',Accept:'audio/mpeg'},body:JSON.stringify({text:t,model_id:(typeof arg('--model')==='string'?arg('--model'):'eleven_multilingual_v2'),language_code:'tr',voice_settings:{stability:0.55,similarity_boost:0.75}})});
   if(!r.ok)throw new Error(r.status+' '+(await r.text()).slice(0,120));
   fs.writeFileSync(path.join(dizin,h+'.mp3'),Buffer.from(await r.arrayBuffer()));
   man.klip[h]=1;fs.writeFileSync(mf,JSON.stringify(man));ok++;console.log(`+ ${h} ${t.slice(0,50)}`);
  }catch(e){hata++;console.error(`! ${t.slice(0,40)}: ${e.message}`);if(/^(401|402|429)/.test(e.message)){console.error('Anahtar/kota sorunu; durduruldu.');break;}}
 }
 console.log(`Bitti: ${ok} üretildi, ${hata} hata. Manifest güncel.`);
})();
