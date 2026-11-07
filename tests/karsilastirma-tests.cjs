const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const d=JSON.parse(fs.readFileSync(path.join(root,'content/mutfak-araclari/icerik.json')));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/karsilastirma/manifest.json')));
assert.equal(manifest.figures.length,24);
for(const f of manifest.figures){
 const svg=fs.readFileSync(path.join(root,f.image),'utf8');
 assert.equal((svg.match(/<use /g)||[]).length || (svg.match(/<image /g)||[]).length,3,f.id);
 assert((svg.match(/<image /g)||[]).length>=1,f.id+' missing photo source');
 assert.equal((svg.match(/data-target="true"/g)||[]).length,1,f.id);
 assert(!svg.includes(d.matches.find(x=>x.id===f.id).answer),f.id+' reveals name');
 assert(d.matches.find(x=>x.id===f.id).comparison);
}
const dom=new JSDOM('<main id="app"></main><div id="ov"></div>',{url:'https://test.example/',runScripts:'outside-only'});
const w=dom.window;let narrow=true;
w.matchMedia=()=>({get matches(){return narrow},addEventListener(){}});
w.scrollTo=()=>{};w.fetch=async()=>({ok:false,status:404});w.setInterval=()=>0;w.setTimeout=()=>0;
const ctx=dom.getInternalVMContext();
for(const name of ['core','platform','eslestirme','sorular','ses','iyilestirme','android','denetim-v10','arac-gorselleri']){
 vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),ctx);
}
ctx.input=d;
const run=s=>vm.runInContext(s,ctx);
run("CONTENT['mutfak-araclari']=validateContent(input);st.subject='mutfak-araclari';st.guest=true;st.op='match';st.contentSet=1;saveProgress=function(){};startBoard('check')");
const visible=s=>[...w.document.querySelectorAll(s)].filter(e=>!e.hidden);
assert.equal(visible('.bimg').length,1);
for(let page=0;page<12;page++){
 assert.equal(run('ARAC_VIEW.page'),page);
 run('{const currentPageItem=st.board.items[ARAC_VIEW.page];tryPair(currentPageItem.id,currentPageItem.answer);}');
 if(page<11)run('aracGoPage(1)');
}
assert.equal(run('Object.keys(st.board.pair).length'),12);
assert.equal(run('st.sess.qs.length'),0,'answer keys exposed before checking');
run('checkBoard()');assert.equal(run('st.sess.ok'),12);assert.equal(run('st.sess.qs.length'),12);
run("startBoard('check');tapImg(st.board.items[0].id)");
assert.equal(visible('#phoneNameSheet .bname').length,6);
const visited=new Set();
for(let i=0;i<3;i++){
 for(const b of visible('#phoneNameSheet .bname'))visited.add(b.textContent);
 if(i<2)run('aracNamePage(1)');
}
assert.equal(visited.size,18,'not every name is reachable');
run('phoneCloseNames();aracGoPage(1);tapImg(st.board.items[1].id)');
assert.equal(run('ARAC_VIEW.namePage'),0);
run('phoneCloseNames()');narrow=false;run('render()');assert.equal(visible('.bimg').length,6);
run('aracGoPage(1)');assert.equal(visible('.bimg').length,6);
assert.equal(run('st.board.items.length'),12);
// A partially completed choice survives a page change and a cancelled edit.
run("startBoard('check');const keep=st.board.items[0];tryPair(keep.id,keep.answer);aracGoPage(1);aracGoPage(-1)");
assert.equal(run('Object.keys(st.board.pair).length'),1);
assert.equal(run('st.sess.qs.length'),0);
assert(!run('boardHTML()').includes('✓'));
console.log('PASS: 24 figures, one target each; 12-card scoring preserved; all 18 names reachable; mobile/desktop paging; choices preserved; no early answer reveal');
dom.window.close();
