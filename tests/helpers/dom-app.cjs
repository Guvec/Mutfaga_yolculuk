/* Yerel uygulamanın gerçek betiklerini yükler; ağ ve duvar saati test denetimindedir. */
const fs=require('fs'),path=require('path'),vm=require('vm'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../..');
module.exports=async function open(query='',options={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://example.test/'+query,runScripts:'dangerously',pretendToBeVisual:true}),w=dom.window;
 w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.setTimeout=()=>1;w.clearTimeout=()=>{};w.setInterval=()=>1;w.clearInterval=()=>{};w.requestAnimationFrame=()=>1;
 Object.defineProperty(w.navigator,'onLine',{value:!!options.online,configurable:true});
 w.fetch=async url=>{const p=path.join(root,String(url));return {ok:fs.existsSync(p),status:200,json:async()=>JSON.parse(fs.readFileSync(p,'utf8'))};};
 for(const [key,value] of Object.entries(options.seed||{}))w.localStorage.setItem(key,JSON.stringify(value));
 for(const el of w.document.querySelectorAll('script[src]'))vm.runInContext(fs.readFileSync(path.join(root,el.getAttribute('src')),'utf8'),dom.getInternalVMContext(),{filename:el.getAttribute('src')});
 if(options.beforeBoot)options.beforeBoot(w);
 await new Promise(setImmediate);await new Promise(setImmediate);return {dom,w};
};
