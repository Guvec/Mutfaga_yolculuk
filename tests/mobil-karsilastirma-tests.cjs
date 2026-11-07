const {chromium}=require('playwright'),fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.QA_SCREENSHOTS||path.join(require('os').tmpdir(),'mutfak-visual-qa');fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(new URL(req.url,'http://local').pathname).replace(/^\/$/,'/index.html'));fs.readFile(f,(e,b)=>{res.statusCode=e?404:200;res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(e?'missing':b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({args:['--no-sandbox']});
 try{
  const page=await browser.newPage({serviceWorkers:'block'});
  await page.addInitScript(()=>{localStorage.setItem('mesleki-ses-soru','1');localStorage.setItem('mesleki-ses-secim','1');});
  await require(root+'/tests/helpers/sound-choice.cjs')(page);await page.goto(base);await page.waitForFunction(()=>CONTENT['mutfak-araclari']&&typeof aracGoPage==='function');
  const results=[];
  for(const [width,height] of [[320,568],[390,844],[1363,936]]){
   await page.setViewportSize({width,height});
   await page.evaluate(()=>{st.subject='mutfak-araclari';st.guest=true;st.op='match';st.contentSet=1;saveProgress=function(){};if(st.modalOpen)closeModal();startBoard('check');});
   await page.locator('.bimg:visible img').first().evaluate(img=>img.decode());
   const size=await page.evaluate(()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight}));
   assert(size.sw<=width,'horizontal overflow '+JSON.stringify(size));assert(size.sh<=height,'vertical overflow '+JSON.stringify(size));
   await page.screenshot({path:out+'/match-'+width+'.png'});
   if(width<760){await page.locator('.bimg:visible .bimg-btn').first().click();const box=await page.locator('#phoneNameSheet').boundingBox();assert(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1,'name panel overflow');await page.screenshot({path:out+'/names-'+width+'.png'});}
   results.push(size);
  }
  await page.setViewportSize({width:960,height:640});
  const manifest=JSON.parse(fs.readFileSync(root+'/assets/karsilastirma/manifest.json'));
  for(const f of manifest.figures){await page.goto(base+'/'+f.image);assert(await page.locator('svg').count(),f.id);}
  for(const name of ['guncel-010','guncel-006','guncel-007','guncel-024']){await page.goto(base+'/assets/karsilastirma/'+name+'.svg');await page.screenshot({path:out+'/'+name+'.png'});}
  await page.goto(base);await page.waitForFunction(()=>CONTENT['mutfak-araclari']);await page.setViewportSize({width:390,height:844});
  for(const num of [53,75,76,84]){
   await page.evaluate(n=>{st.subject='mutfak-araclari';st.guest=true;st.op='mcq';st.practice='check';st.screen='quiz';const q=CONTENT[st.subject].questions.find(q=>q.reviewNumber===n);st.contentItems=[q];st.contentIndex=0;st.sess={id:Date.now(),total:1,s:0,ok:0,fix:0,bad:0,qs:[]};contentNext();render();},num);
   await page.waitForFunction(()=>[...document.querySelectorAll('.opts-pic img')].every(x=>x.complete&&x.naturalWidth));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'MCQ overflow '+num);
   await page.screenshot({path:out+'/q'+num+'-390.png',fullPage:true});
  }
  fs.writeFileSync(out+'/measurements.json',JSON.stringify(results,null,2));console.log('PASS: matching 320×568,390×844,1363×936; mobile names; 24 SVG loads; Q53/75/76/84 width.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
