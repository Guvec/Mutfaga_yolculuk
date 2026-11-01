const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),elements=new Map(),store=new Map();
const el=id=>{if(!elements.has(id))elements.set(id,{id,innerHTML:'',className:'',style:{},isConnected:true,value:'',focus(){},setAttribute(){},classList:{contains(){return false}},insertAdjacentHTML(_,s){this.innerHTML+=s}});return elements.get(id)};
const ctx=new Proxy({measureText:t=>({width:String(t).length*11})},{get:(o,k)=>o[k]||(()=>{})});
const doc={hidden:false,activeElement:null,addEventListener(){},getElementById:el,querySelector:s=>s==='.rep'?el('app'):el(s),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?{width:0,height:0,getContext:()=>ctx,toDataURL:()=> 'data:image/png;base64,',toBlob(){}}:el(tag),body:el('body')};
const env={console,document:doc,window:{scrollTo(){}},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},navigator:{},location:{protocol:'http:',hostname:'test'},fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,url),'utf8'))}),setTimeout,clearTimeout,URL,Date,Math,JSON};vm.createContext(env);
for(const file of ['js/core.js','js/platform.js','js/eslestirme.js','js/sorular.js','js/ses.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),env,{filename:file});
const run=s=>vm.runInContext(s,env),html=()=>el('app').innerHTML;
(async()=>{await run('loadContent()');assert.equal(run('VERSION'),'Sürüm · 01.11.2026');assert(html().includes('Sürüm · 01.11.2026'));run('guest()');for(const t of ['Kuver','Mutfak Araçları','Beslenme İlkeleri','Bulaşık Makinesi Temizliği'])assert(html().includes(t));run("openSubject('kuver');pickOp('kur')");assert(html().includes('Basit Kuver'));assert(html().includes('Tabldot Kuver'));assert(!html().includes('Tam Kuver'));run("pickLevel(1);choosePractice('learn')");assert.equal(run('LEVELS[st.lvl].items.length'),5);
run("answer(LEVELS[1].items.find(k=>k!==st.q.key))");assert(html().includes('Birlikte tekrar deneyelim'));run('askBreak();startBreak()');assert.equal(run('st.brk'),1);assert.equal(run('st.t0'),0);el('bGo').onclick();run('answer(st.q.key)');assert.equal(run('st.sess.fix'),1);assert.equal(run('st.sess.s'),5);
for(let i=1;i<5;i++)run('nextQ();answer(st.q.key)');run('nextQ()');assert.equal(run('st.kDone'),true);assert(!html().includes('class="done-photo"'));assert(html().includes('basit kuver örneği'));assert.equal(run('st.sess.s'),45);
run("st.lvl=3;st.practice='check';startSession()");for(let i=0;i<9;i++){assert.equal((html().match(/onclick="answer\('/g)||[]).length,9);run('answer(st.q.key);nextQ()');}assert.equal(run('st.kDone'),true);assert.equal(run('st.sess.s'),90);assert(html().includes('tabldot-kuver-referans.png'));assert.equal(run('st.sess.variant'),'tabldot');
run("st.op='ad';st.practice='learn';startSession()");assert.equal(run('st.kDone'),false);assert(!html().includes('Çalışma tamamlandı'));for(let i=0;i<10;i++)run('answer(st.q.ans);nextQ()');assert.equal(run('st.kDone'),true);assert.equal(run('st.sess.ok'),10);assert.equal(run('new Set(st.sess.qs.map(q=>q.prompt)).size'),10);
run("st.op='kur';st.practice='check';startSession();answer(LEVELS[3].items.find(k=>k!==st.q.key))");assert.equal(run('st.tries'),2);assert.equal(run('st.t0'),0);run('showSol()');assert.equal(run('st.sess.bad'),1);
run("st.subject='beslenme-ilkeleri';pickContent('mcq')");assert(html().includes('PDF içeriği henüz eklenmedi'));
run("CONTENT['beslenme-ilkeleri']={questions:[{id:'T',prompt:'TEST',choices:[{id:'A',text:'TEST A'},{id:'B',text:'TEST B'}],correct:'B',explanation:'TEST açıklama',source:{file:'test.pdf',page:1}}],matches:[],words:[]};startContent()");assert(html().indexOf('TEST A')<html().indexOf('TEST B'));run("answer('A');answer('B');nextQ()");assert.equal(run('st.sess.fix'),1);run('finish()');assert(html().includes('Sonuç özeti'));assert.equal(run('st.sess.qs[0].source.page'),1);run('startSession()');assert(html().includes('TEST A'));
// Takımsız eşleştirme kartları da 12'li tahtaya bölünür (14 kart -> 12 + 2).
run("CONTENT.kuver={questions:[],matches:Array.from({length:14},(_,i)=>({id:'m'+i,prompt:'TEST',image:'x.jpg',answer:'AD '+i})),words:[{id:'a',prompt:'TEST KELİME A',answer:'ANLAM A'},{id:'b',prompt:'TEST KELİME B',answer:'ANLAM B'}]};st.subject='kuver';pickContent('match')");assert.equal((html().match(/startContent\(\d+\)/g)||[]).length,2);
run("startContent(1);startBoard('learn')");assert.equal(run('st.board.items.length'),12);run("st.board.items.forEach(it=>{tapImg(it.id);tapName(st.board.names.indexOf(it.answer));})");assert.equal(run('st.kDone'),true);assert.equal(run('st.sess.s'),120);run("st.op='word';startContent()");assert.equal(run('st.q.choices.length'),2);run('answer(st.q.correct)');assert.equal(run('st.sess.ok'),1);
run("st.prof='TEST';st.guest=false;st.op='kur';st.lvl=1;startSession();answer(st.q.key)");assert.equal(JSON.parse(store.get('kv_records')).at(-1).variant,'basit');run("st.guest=true;startSession();answer(st.q.key)");assert.equal(JSON.parse(store.get('kv_records')).length,1);
assert.throws(()=>run("validateContent({questions:[{id:'x',prompt:'x',choices:[{id:'A',text:'a'},{id:'A',text:'b'}],correct:'A'}],matches:[],words:[]})"));
// Kaynağı henüz gelmeyen konuların JSON dosyaları boş kalmalı; test verisi yalnız VM belleğinde kullanıldı.
for(const slug of ['kuver','beslenme-ilkeleri','bulasik-makinesi-temizligi']){const d=JSON.parse(fs.readFileSync(path.join(root,'content',slug,'icerik.json')));for(const f of ['questions','matches','words'])assert.equal(d[f].length,0);}
// Mutfak Araçları eşleştirme kartları: 11 takım × 12 kart, 120 farklı araç.
const mk=JSON.parse(fs.readFileSync(path.join(root,'content','mutfak-araclari','icerik.json'),'utf8'));
assert.equal(mk.matches.length,132);assert.equal(new Set(mk.matches.map(m=>m.answer)).size,120);assert.equal(new Set(mk.matches.map(m=>m.id)).size,132);
const names=new Set(mk.matches.map(m=>m.answer));
for(const m of mk.matches){assert(fs.existsSync(path.join(root,m.image)),m.image);assert(m.explanation&&m.source&&m.source.page);for(const x of m.similar||[])assert(names.has(x),x);assert(!(m.imageAlt||'').includes(m.answer));}
for(let t=1;t<=11;t++){const g=mk.matches.filter(m=>m.set===t);assert.equal(g.length,12);assert.equal(new Set(g.map(m=>m.answer)).size,12);}
// Çeldiriciler: her takımda 6 sabit ad; kitaptaki 120 addan; tahtada görseli yok; tekrar yok.
for(let t=1;t<=11;t++){const L=mk.distractors[String(t)],on=new Set(mk.matches.filter(m=>m.set===t).map(m=>m.answer));assert.equal(L.length,6);assert.equal(new Set(L).size,6);for(const x of L){assert(names.has(x),x);assert(!on.has(x),t+': '+x);}}
// Kitapla eşitlenen adlar: eski adlar kalmadı.
const mkText=JSON.stringify(mk);for(const old of ['ORTA BOY TABAK','SERVİS TABAĞI','KURU GIDA KABI','"SİLİKON SPATULA"','Reçellik'])assert(!mkText.includes(old),old);
for(const nw of ['TATLI TABAĞI','ANA YEMEK TABAĞI','KURU GIDA KAVANOZU','SİLİKON SIYIRMA SPATULASI','KAHVALTILIK KÂSE'])assert(names.has(nw),nw);
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');assert(sw.includes('"js/ses.js"'));for(const m of mk.matches)assert(sw.includes('"'+m.image+'"'),'sw: '+m.image);
await run('loadContent()');assert(run("CONTENT['mutfak-araclari'].matches.length")===132);
run("st.guest=true;st.prof=null;openSubject('kuver')");assert(html().includes('Kuveri Kur')&&html().includes('Adını Bul')&&html().includes('Çoktan Seçmeli'));assert(!html().includes("pickContent('match')"));assert(!html().includes('Kelime Kartları'));
for(const s of ['mutfak-araclari','beslenme-ilkeleri','bulasik-makinesi-temizligi']){run("openSubject('"+s+"')");assert(html().includes("pickContent('match')")&&html().includes("pickContent('mcq')"));assert(!html().includes('Kelime Kartları'));}
run("st.guest=true;st.prof=null;openSubject('mutfak-araclari');pickContent('match')");assert.equal((html().match(/startContent\(\d+\)/g)||[]).length,11);assert(html().includes('12 kart'));
// Öğreniyorum: 12 görsel ve 12 ad birlikte; yanlışta ipucu, ikinci yanlışta doğru ad gösterilir.
for(let t=1;t<=11;t++){run('startContent('+t+')');assert.equal(run('st.screen'),'boardmode');run("startBoard('learn')");
  assert.equal((html().match(/class="bimg(?:"| )/g)||[]).length,12);assert.equal((html().match(/class="bname/g)||[]).length,18);
  assert.equal(run('JSON.stringify([...st.board.names].sort())'),run('JSON.stringify(st.board.items.map(x=>x.answer).concat(getData().distractors["'+t+'"]).sort())'));
  assert(html().includes('12 görsel ve 18 ad var. 6 adın görseli yok.'));
  const ids=run('st.board.items.map(x=>x.id)');
  ids.forEach((id,k)=>{
    if(k===0){run("tapImg('"+id+"');tapName(st.board.names.findIndex(n=>n!==boardItem('"+id+"').answer))");assert(html().includes('Birlikte tekrar deneyelim'));assert.equal(run("st.board.res['"+id+"']"),undefined);
      run("tapName(st.board.names.indexOf(boardItem('"+id+"').answer));tapImg('"+id+"')");assert.equal(run("st.board.res['"+id+"']"),2);}
    else if(k===1){for(let z=0;z<2;z++)run("tapImg('"+id+"');tapName(st.board.names.findIndex(n=>n!==boardItem('"+id+"').answer&&!boardUsed(n)))");assert.equal(run("st.board.res['"+id+"']"),0);}
    else run("tapImg('"+id+"');tapName(st.board.names.indexOf(boardItem('"+id+"').answer))");
  });
  assert.equal(run('st.kDone'),true);assert.equal(run('st.sess.qs.length'),12);assert.equal(run('st.sess.ok'),10);assert.equal(run('st.sess.fix'),1);assert.equal(run('st.sess.bad'),1);assert.equal(run('st.sess.s'),105);
  assert.equal((html().match(/class="bname/g)||[]).length,0);assert(html().includes('Raporu Gör'));}
run('finish()');assert(html().includes('Sonuç özeti'));assert.equal(run('catName(st.sess)'),'Mutfak Araçları · Eşleştirme · 11. takım · Öğreniyorum');
run('startSession()');assert.equal(run('st.screen'),'board');assert.equal(run('st.contentSet'),11);assert.equal(run('Object.keys(st.board.res).length'),0);
// Kendimi Deniyorum: hepsi eşlenmeden kontrol yok; bir eşleşme değiştirilebilir; kontrolden sonra yanlış olan gösterilir.
run("startContent(3);startBoard('check')");const ids3=run('st.board.items.map(x=>x.id)');
run("tapImg('"+ids3[0]+"');tapName(st.board.names.indexOf(boardItem('"+ids3[1]+"').answer))");run("tapImg('"+ids3[1]+"');tapName(st.board.names.indexOf(boardItem('"+ids3[0]+"').answer))");
for(let k=2;k<12;k++){run("tapImg('"+ids3[k]+"');tapName(st.board.names.indexOf(boardItem('"+ids3[k]+"').answer))");if(k===5){run('checkBoard()');assert.equal(run('st.board.checked'),false);}}
assert(html().includes('Kontrol et'));run("tapImg('"+ids3[0]+"')");assert.equal(run("st.board.pair['"+ids3[0]+"']"),undefined);
run("tapName(st.board.names.indexOf(boardItem('"+ids3[1]+"').answer))");run('checkBoard()');
assert.equal(run('st.sess.ok'),10);assert.equal(run('st.sess.bad'),2);assert.equal(run('st.sess.s'),100);assert(html().includes('<s>'));assert.equal(run('st.kDone'),true);
run("pickContent('match')");assert.equal(run('st.contentSet'),null);
// Mutfak Araçları çoktan seçmeli sorular: 211 soru, 22 konu; A-B-C-D sırası korunur.
assert.equal(mk.questions.length,211);assert.equal(mk.groups.length,22);
for(const q of mk.questions){assert.deepEqual(q.choices.map(c=>c.id),['A','B','C','D']);assert(['A','B','C','D'].includes(q.correct));assert(q.group&&q.prompt);
  for(const c of q.choices){if(c.image){assert(fs.existsSync(path.join(root,c.image)),c.image);assert(sw.includes('"'+c.image+'"'));}else assert(c.text.length>0,q.id);}
  if(q.image){assert(fs.existsSync(path.join(root,q.image)));assert(sw.includes('"'+q.image+'"'));}}
assert.equal(mk.questions.filter(q=>q.choices.some(c=>c.image)).length,9);assert.equal(mk.questions.filter(q=>q.image).length,21);
run("openSubject('mutfak-araclari');pickContent('mcq')");assert.equal((html().match(/pickGroup\(\d+\)/g)||[]).length,22);assert(html().includes('1. Bölüm'));
for(let g=0;g<22;g++){run('pickGroup('+g+')');const n=run('st.contentItems.length');const ids=run('st.contentItems.map(q=>q.id)');assert.equal(JSON.stringify(ids),run('JSON.stringify(getData().questions.filter(q=>q.group===st.mcqGroup).map(q=>q.id))'));
  for(let i=0;i<n;i++){assert(html().includes(run('esc(st.q.prompt)')));assert.equal((html().match(/class="olet"/g)||[]).length,4);
    if(i===0){run("answer(st.q.choices.find(c=>c.id!==st.q.correct).id)");run("answer(st.q.choices.find(c=>c.id!==st.q.correct&&!st.wrong.includes(c.id)).id)");run('showSol()');assert(html().includes('Doğru yanıt: '+run('st.q.correct')));}
    else run('answer(st.q.correct)');run('nextQ()');}
  assert.equal(run('st.kDone'),true);assert.equal(run('st.sess.ok'),n-1);assert.equal(run('st.sess.bad'),1);run("pickContent('mcq')");}
run("pickGroup(4)");run('finish()');assert.equal(run('catName(st.sess)'),'Mutfak Araçları · Çoktan Seçmeli Sorular · 1. Bölüm sonu değerlendirme');run('startSession()');assert.equal(run('st.sess.group'),'1. Bölüm sonu değerlendirme');assert(html().includes('opts-pic'));
// Sesli okuma: ad kartı okunur; görselin adı eşleşmeden önce okunmaz; soru ve seçenekler okunur.
run("globalThis.SPOKEN=[];globalThis.SpeechSynthesisUtterance=function(t){this.text=t};globalThis.speechSynthesis={speak(u){SPOKEN.push(u.text)},cancel(){},getVoices(){return [{lang:'tr-TR'}]}};window.speechSynthesis=speechSynthesis;SES.acik=true");
assert.equal(run("sesMetin('Süt ……… ile 250 ml ölçülür; 74 °C; 3–4 gün; 200 g un')"),'Süt boşluk ile 250 mililitre ölçülür; 74 derece; 3 ile 4 gün; 200 gram un');
assert.equal(run("sesAd('SMOOTHİE BLENDERİ')"),'smuti blenderi');assert.equal(run("sesAd('TATLI KAŞIĞI')"),'tatlı kaşığı');
run("openSubject('mutfak-araclari');pickContent('match');startContent(5);startBoard('check');SPOKEN.length=0");
const id5=run('st.board.items[0].id');run("tapImg('"+id5+"')");assert.equal(run('SPOKEN.length'),0,'görsel adı okunmamalı');
run("tapName(0)");assert.equal(run('SPOKEN.at(-1)'),run("sesMetin(sesAd(st.board.names[0]))"));
run("startBoard('learn');SPOKEN.length=0;tapImg(st.board.items[0].id)");assert.equal(run('SPOKEN.length'),0);
run("tapName(st.board.names.indexOf(st.board.items[0].answer))");assert(run("SPOKEN.some(t=>t.startsWith('Doğru!'))"));
run("SPOKEN.length=0;tapImg(st.board.items[0].id)");assert(run("SPOKEN[0].startsWith(sesMetin(sesAd(st.board.items[0].answer)))"),'eşlenmiş görsel okunur');
run("pickContent('mcq');pickGroup(0)");assert(run("SPOKEN.at(-1).startsWith(sesMetin(st.q.prompt))"));assert(run("SPOKEN.at(-1).includes('A, ')"));assert(html().includes('class="spk"'));
run("sesAcKapa();SPOKEN.length=0;answer(st.q.correct)");assert.equal(run('SPOKEN.length'),0,'ses kapalıyken okunmaz');run('sesAcKapa()');

// Baharat: 11 bağımsız takım; altı çeldirici kontrol bitene kadar kullanılabilir.
for(let n=1;n<=11;n++){
 run("openSubject('baharat');pickContent('match');startContent("+n+");startBoard('check')");
 assert.equal(run('st.board.items.length'),12);assert.equal(run('st.board.names.length'),18);
 assert.equal(run('new Set(st.board.names).size'),18);assert.equal(run('st.board.extra'),6);
 const its=run('st.board.items');for(const it of its)assert(fs.existsSync(path.join(root,it.image)));
 run("st.board.items.forEach(it=>tryPair(it.id,it.answer));checkBoard()");assert.equal(run('st.sess.ok'),12);assert.equal(run('st.sess.bad'),0);
 run("startBoard('check');tryPair(st.board.items[0].id,boardDistractors(st.contentSet,st.board.items)[0]);st.board.items.slice(1).forEach(it=>tryPair(it.id,it.answer));checkBoard()");assert.equal(run('st.sess.ok'),11);assert.equal(run('st.sess.bad'),1);
 run("startBoard('learn');tryPair(st.board.items[0].id,boardDistractors(st.contentSet,st.board.items)[0]);tryPair(st.board.items[0].id,st.board.items[0].answer)");assert.equal(run('st.sess.fix'),1);
}
console.log('PASS: Baharat 11 takım × 12 görsel / 18 benzersiz ad / 6 çeldirici / doğru ve yanlış yanıt / öğrenme ve bağımsız deneme.');
console.log('PASS: Sesli okuma / 18 ad tahtası / ');
console.log('PASS: Mutfak Araçları 211 soru / 22 konu / Mutfak Araçları 11 takım × 12 görsel-ad tahtası (öğrenme + toplu kontrol) / Menü / basit ve tabldot / 1 mola / +5 düzeltme / 5 ve 9 parça / sabit bağımsız hedefler / 10 benzersiz tanıma sorusu / tek yanıt / rapor / soru-kart motorları / kaynak izi / misafir-kayıt / JSON doğrulama.');})().catch(e=>{console.error(e);process.exit(1)});
