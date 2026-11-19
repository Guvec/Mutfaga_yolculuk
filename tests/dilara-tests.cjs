/* Dilara katmanı: klip varsa çalar, yoksa cihaz sesi; durdurma; ses türü ayarı; eksik listesi. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
 const srv=http.createServer((q,r)=>{let u=decodeURIComponent(new URL(q.url,'http://x').pathname);if(u==='/')u='/index.html';fs.readFile(path.join(root,u),(e,b)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('Content-Type',types[path.extname(u)]||'application/octet-stream');r.end(b);});});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 // 3 sn'lik sessiz WAV (.mp3 adıyla verilir; tarayıcı içeriğe bakar)
 const n=8000*3,w=Buffer.alloc(44+n,128);w.write('RIFF',0);w.writeUInt32LE(36+n,4);w.write('WAVEfmt ',8);w.writeUInt32LE(16,16);w.writeUInt16LE(1,20);w.writeUInt16LE(1,22);w.writeUInt32LE(8000,24);w.writeUInt32LE(8000,28);w.writeUInt16LE(1,32);w.writeUInt16LE(8,34);w.write('data',36);w.writeUInt32LE(n,40);
 const br=await chromium.launch({args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']}),ctx=await br.newContext({serviceWorkers:'block'}),p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const base='http://127.0.0.1:'+srv.address().port+'/';
 let H=null;const KL={};
 await p.route('**/audio/dilara/manifest.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({v:1,klip:KL})}));
 await p.route('**/audio/dilara/*.mp3',r=>r.fulfill({contentType:'audio/mpeg',body:w}));
 await p.addInitScript(()=>{try{sessionStorage.setItem('mesleki-ses-secim','1');}catch(e){}window.__tts=[];
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speaking:false,pending:false,getVoices:()=>[{lang:'tr-TR',name:'T',voiceURI:'t',localService:true,default:true}],speak(u){window.__tts.push(u.text);setTimeout(()=>u.onstart&&u.onstart(),5);},cancel(){},addEventListener(){}}});
  window.SpeechSynthesisUtterance=function(t){this.text=t;};});
 await p.goto(base);await p.waitForFunction(()=>typeof dilHash==='function'&&typeof sesSoyle==='function'&&DIL.man!==null);
 let c=0;const ok=m=>{c++;console.log('PASS '+m);};
 const T='Sesli okuma denemesi. Hazır olduğunda çalışmaya devam edebilirsin.';
 H=await p.evaluate(t=>dilHash(sesMetin(t)),T);KL[H]=1;
 // manifest H ile yeniden yüklensin
 await p.evaluate(()=>{DIL.yuk=null;DIL.man=null;return dilManifest();});
 await p.evaluate(()=>{SES.acik=true;DIL.mod='dilara';});
 await p.evaluate(t=>sesSoyle(t),T);await p.waitForFunction(()=>SES.klip&&!SES.klip.paused);
 assert.strictEqual(await p.evaluate(()=>__tts.length),0);ok('Klibi olan metin Dilara ile çalar, cihaz sesi kullanılmaz');
 assert.ok(await p.evaluate(()=>SES.klip.playbackRate===1));ok('Konuşma hızı klibe uygulanır');
 await p.evaluate(()=>sesSus());assert.strictEqual(await p.evaluate(()=>SES.klip),null);ok('sesSus klibi durdurur');
 await p.evaluate(()=>sesSoyle('Bu metnin klibi yok.'));await p.waitForTimeout(300);
 assert.deepStrictEqual(await p.evaluate(()=>__tts),['Bu metnin klibi yok.']);ok('Klibi olmayan metin cihaz sesine düşer');
 assert.deepStrictEqual(await p.evaluate(()=>DIL.eksik),['Bu metnin klibi yok.']);ok('Eksik metin listeye yazılır');
 await p.evaluate(()=>{DIL.mod='cihaz';});await p.evaluate(t=>sesSoyle(t),T);await p.waitForTimeout(100);
 assert.strictEqual(await p.evaluate(()=>SES.klip),null);assert.strictEqual(await p.evaluate(()=>__tts.length),2);ok('"Cihaz sesi" seçilince klip çalmaz');
 await p.evaluate(()=>{DIL.mod='dilara';SES.acik=true;});await p.evaluate(t=>sesSoyle(t),T);await p.waitForFunction(()=>SES.klip);
 await p.evaluate(()=>sesSoyle('Başka bir metin.'));assert.strictEqual(await p.evaluate(()=>SES.klip),null);ok('Yeni okuma öncekini keser');

 // Parça parça okuma: iki cümlenin ayrı klipleri, virgüllü seçenek adları
 const C1='Öne çıkan parçanın adı nedir?',C2='Seçenekler:';const PS=['çatal','bıçak','peçete'];
 for(const x of [C1,C2,...PS])KL[await p.evaluate(t=>dilHash(t),x)]=1;
 await p.evaluate(()=>{DIL.yuk=null;DIL.man=null;DIL.eksik=[];return dilManifest();});
 await p.evaluate(()=>{window.__tts.length=0;SES.acik=true;DIL.mod='dilara';});
 const plan=await p.evaluate(()=>dilPlan(sesMetin('Öne çıkan parçanın adı nedir? Seçenekler: çatal, bıçak, peçete.'),DIL.man));
 assert.strictEqual(plan.hs.length,5);assert.deepStrictEqual(plan.eksik,[]);ok('Cümle ve virgüllü parçalar ayrı kliplerden planlanır');
 await p.evaluate(()=>sesSoyle('Öne çıkan parçanın adı nedir? Seçenekler: çatal, bıçak, peçete.'));await p.waitForFunction(()=>SES.klip&&!SES.klip.paused);
 assert.strictEqual(await p.evaluate(()=>__tts.length),0);ok('Parçalı metin Dilara ile çalar');
 const s1=await p.evaluate(()=>SES.klip.src);await p.evaluate(()=>{SES.klip.currentTime=SES.klip.duration;});await p.waitForFunction(s=>SES.klip&&SES.klip.src!==s,s1);
 ok('Bir parça bitince sıradaki parça çalar');
 await p.evaluate(()=>sesSus());
 await p.evaluate(()=>sesSoyle('Öne çıkan parçanın adı nedir? Bu cümlenin klibi yok.'));await p.waitForTimeout(200);
 assert.strictEqual(await p.evaluate(()=>SES.klip),null);assert.deepStrictEqual(await p.evaluate(()=>__tts),['Öne çıkan parçanın adı nedir? Bu cümlenin klibi yok.']);ok('Bir parça eksikse metnin tamamı cihaz sesiyle okunur');
 assert.deepStrictEqual(await p.evaluate(()=>DIL.eksik),['Bu cümlenin klibi yok.']);ok('Eksik listesine yalnız eksik cümle yazılır');
 assert.deepStrictEqual(await p.evaluate(()=>dilCumleler('Su 2.5 litre. Hazır mısın? Evet!')),['Su 2.5 litre.','Hazır mısın?','Evet!']);ok('Sayıdaki nokta cümleyi bölmez');
 await p.evaluate(()=>{SES.acik=true;voiceSettings();});assert.ok(await p.$('#sesMotor'));ok('Ses ayarlarında "Ses türü" seçimi var');
 assert.deepStrictEqual(errs,[]);ok('Sayfa hatası yok');
 console.log(c+' kontrol geçti');await br.close();srv.close();
})().catch(e=>{console.error(e);process.exit(1);});
