/* DOM mantık testi; tarayıcı yerleşimi, ses cihazı ve Firestore güvenlik testi değildir. */
const {JSDOM,VirtualConsole}=require('jsdom'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>{if(!/Not implemented|Could not load/.test(e.message))errors.push(e.message);});
const raw=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g,(_,p)=>'<script>'+fs.readFileSync(path.join(root,p),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
const dom=new JSDOM(raw,{url:'http://localhost/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});w.fetch=async url=>{const p=path.resolve(root,String(url));return {ok:fs.existsSync(p),json:async()=>JSON.parse(fs.readFileSync(p,'utf8'))};};w.ResizeObserver=class{observe(){} disconnect(){}};w.Image=class{set src(v){this._src=v;setTimeout(()=>this.onload&&this.onload(),0)}get src(){return this._src}};}});
const w=dom.window,run=s=>w.eval(s);
(async()=>{try{
await new Promise(r=>setTimeout(r,50));assert.deepEqual(errors,[]);
run(`lsSet('profiles',['Test']);lsSet('ad_map',{'Test':{e:0,n:0,c:false}});st.prof='Test';st.guest=false;RK.backend={ensureProfile:async()=>({status:'in',gen:0}),list:async()=>[],submit:async()=>({written:true}),removeRow:async()=>{}};`);
run("go('home')");assert(w.document.body.textContent.includes('Haftalık Mutfak Yarışması'));assert(w.document.body.textContent.includes('Rütbem ve Rozetlerim'));
run("go('rutbe')");assert(w.document.body.textContent.includes('Çırak'));assert(w.document.body.textContent.includes('Henüz kazanılmadı'));
run("haftaOpen()");await run('haftaStart()');assert.equal(run('HAFTA.qs.length'),25);assert.equal(run('HAFTA.ranked'),true);
for(let i=0;i<25;i++){run(`haftaAnswer(HAFTA.qs[HAFTA.k].choices.findIndex(c=>c.id===HAFTA.qs[HAFTA.k].correct))`);if(i===4){run('haftaBreak()');assert(run('HAFTA.paused'));run('haftaResume()');}run('haftaNext()');}
assert.equal(run('HAFTA.score'),25);assert.equal(run('haftaState()[haftaPid()].attempts[rkWeekNo()]'),1);assert.equal(run('rutbeState(haftaPid()).mp'),10);
run('haftaFinish()');assert.equal(run('haftaState()[haftaPid()].attempts[rkWeekNo()]'),1);
run('haftaOpen()');await run('haftaStart()');run('haftaAnswer(0);haftaSave();HAFTA=null');await run('haftaStart()');assert.equal(run('HAFTA.answers.length'),1);assert.equal(run('haftaState()[haftaPid()].attempts[rkWeekNo()]'),1);
const rows=run(`rkRowsHTML([{pid:'a',name:'Bir',correct:10,rank:3},{pid:'b',name:'İki',correct:10},{pid:'c',name:'Üç',correct:8,rank:2}],'bh-e1','genel',10)`);const box=w.document.createElement('div');box.innerHTML=rows;assert.deepEqual([...box.querySelectorAll('li')].map(x=>x.querySelectorAll('.rk-hat').length),[1,1,0]);assert(box.querySelectorAll('li')[0].textContent.includes('Aşçı'));assert.equal(box.querySelectorAll('li')[1].querySelector('.rutbe-small'),null);
run("YR.room={mode:'duel',created:123,host:'host',subject:'baharat',scope:'butun',kind:'gorsel',set:0,n:15,lim:20,seed:1};YR.code='ABCDE';YR.players=[{uid:'host',nick:'Bir',ready:false,loaded:true},{uid:'guest',nick:'İki',ready:true,loaded:true}];YR.host=true;yrTransport={uid:'host'};YR.active=true;go('racelobby')");assert(w.document.body.textContent.includes('Hazırım'));assert(w.document.body.textContent.includes('Kurucu'));assert(w.document.body.textContent.includes('Bütün konular'));
run('YR.room.mode="arena";render()');assert(w.document.body.textContent.includes('1 hazır değil'));
assert.deepEqual(errors,[]);console.log('PASS DOM: tüm yeni modüller açılır; ana kartlar; rütbe ekranı; 25 soru; tek yanıt; mola; deneme/dedup; devam; kep ve rütbe; lobi Hazırım/Kurucu/uyarı.');
}finally{dom.window.close();}})().catch(e=>{console.error(e);process.exitCode=1});
