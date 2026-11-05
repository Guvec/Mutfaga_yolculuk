/* Actual Chromium tests. A desktop viewport is not a physical Android device. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const root=path.resolve(__dirname,'..'),server=http.createServer((req,res)=>{const rel=new URL(req.url,'http://localhost').pathname;const file=path.resolve(root,'.'+(rel==='/'?'/index.html':decodeURIComponent(rel)));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}try{const ext=path.extname(file);res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.jpg':'image/jpeg','.png':'image/png'})[ext]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--disable-gpu','--disable-software-rasterizer','--no-zygote','--single-process']});const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await require('./helpers/sound-choice.cjs')(page);await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>typeof CONTENT!=='undefined'&&CONTENT.baharat);
 const data=JSON.parse(fs.readFileSync(root+'/content/baharat/icerik.json'));assert.equal(data.matches.length,96);assert.equal(data.learningCards.length,121);for(const it of [...data.matches,...data.learningCards]){assert(it.explanation.trim().length>25,it.id);assert(it.detail.includes(it.explanation),'short/detail mismatch: '+it.id);}
 for(const set of [...new Set(data.matches.map(x=>x.set))]){
  const result=await page.evaluate(set=>{st.guest=true;st.subject='baharat';st.op='match';st.contentSet=set;startBoard('check');openSpiceReview();const locked=st.screen==='board';st.board.items.forEach(x=>tryPair(x.id,x.answer));const hidden=!document.querySelector('.spice-fact')&&st.sess.qs.length===0;checkBoard();return {locked,hidden,screen:st.screen,ok:st.sess.ok,info:st.sess.qs.every(q=>q.explanation),fact:document.querySelector('.spice-fact').textContent,expected:st.board.items[0].explanation};},set);
  assert(result.locked&&result.hidden);assert.equal(result.screen,'spicereview');assert.equal(result.ok,12);assert(result.info);assert.equal(result.fact,result.expected);
 }
 console.log('PASS: all 8 sets / 96 assessment cards and 121 learning cards have short information; review inaccessible before checking; all-correct scoring and saved explanations.');
 for(const width of [390,1200,844]){
  await page.setViewportSize({width,height:width===844?390:844});
  await page.evaluate(()=>{st.subject='baharat';st.op='match';st.contentSet=1;startBoard('check');st.board.items.forEach((x,i)=>tryPair(x.id,st.board.items[(i+1)%12].answer));checkBoard();});
  assert.equal(await page.evaluate(()=>st.sess.bad),12);assert(await page.locator('.spice-fact').isVisible());assert.equal(await page.evaluate(()=>document.activeElement.id),'spiceProductTitle');
  const before=await page.evaluate(()=>JSON.stringify({session:st.sess,pair:st.board.pair,attempts:st.board.attempts,run:st.run}));
  await page.evaluate(()=>{window.infoSpoken=[];SES.acik=true;/* müzik varsayılan açık olduğundan sesli okumayı açan öğrenci durumu */sesSoyle=text=>window.infoSpoken.push(text);});
  await page.getByRole('button',{name:'Bilgiyi dinle',exact:true}).click();assert.equal(await page.evaluate(()=>window.infoSpoken[0]),await page.evaluate(()=>st.board.items[0].answer+'. '+st.board.items[0].explanation));await page.getByRole('button',{name:'Sesi durdur',exact:true}).click();
  await page.getByRole('button',{name:'Sonraki ürün',exact:true}).focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>spiceReviewIndex),1);
  await page.getByRole('button',{name:'Önceki ürün',exact:true}).click();assert.equal(await page.evaluate(()=>spiceReviewIndex),0);
  await page.locator('article img').evaluate(async i=>{await i.decode()});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const box=await page.getByRole('button',{name:'Sonraki ürün',exact:true}).boundingBox();assert(box.height>=48);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,'bilgi-'+width+'.png'),fullPage:true});}
  for(let i=1;i<12;i++)await page.getByRole('button',{name:'Sonraki ürün',exact:true}).click();
  assert.equal(await page.evaluate(()=>spiceReviewIndex),11);assert(await page.getByRole('button',{name:'Sonucumu gör',exact:true}).isVisible());assert.equal(await page.evaluate(()=>JSON.stringify({session:st.sess,pair:st.board.pair,attempts:st.board.attempts,run:st.run})),before);
  await page.getByRole('button',{name:'Eşleştirmelere dön',exact:true}).click();assert.equal(await page.evaluate(()=>st.screen),'board');await page.getByRole('button',{name:'Kısa ürün bilgilerini oku',exact:true}).click();assert.equal(await page.evaluate(()=>spiceReviewIndex),0);
  await page.evaluate(()=>spiceReviewMove(11));await page.getByRole('button',{name:'Sonucumu gör',exact:true}).click();assert.equal(await page.evaluate(()=>st.screen),'summary');assert.equal(await page.locator('.audit-report details').count(),12);assert.equal(await page.evaluate(()=>st.sess.s),0);
  console.log('PASS '+width+'px: wrong responses still receive information; visible fact/photo/name; keyboard and focus; correct speech text; previous/next/all 12; board/review/report return; score/time/attempts unchanged; no horizontal overflow.');
 }
 assert.deepEqual(errors,[]);console.log('PASS: no uncaught JavaScript errors. Viewport checks in desktop Chromium; no physical Android test.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
