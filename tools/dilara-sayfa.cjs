const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
module.exports=async function(fn,arg){
 const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
 const srv=http.createServer((q,r)=>{let u=decodeURIComponent(new URL(q.url,'http://x').pathname);if(u==='/')u='/index.html';fs.readFile(path.join(root,u),(e,b)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('Content-Type',types[path.extname(u)]||'application/octet-stream');r.end(b);});});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const br=await chromium.launch({args:['--no-sandbox']}),ctx=await br.newContext({serviceWorkers:'block'}),p=await ctx.newPage();
 await p.goto('http://127.0.0.1:'+srv.address().port+'/');await p.waitForFunction(()=>typeof ITEMS!=='undefined'&&typeof dilCumleler==='function');
 const out=await p.evaluate(fn,arg);await br.close();srv.close();return out;};
