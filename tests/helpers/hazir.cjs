/* 14.11: İlk açılışta kullanım koşulları ve oyun adı seçimi çıkar (v3.16+). Eski arayüz testleri doğrudan ana ekranı beklediği için
   bu yardımcı koşulları kabul edilmiş sayar ve ad seçimi açılırsa misafir olarak devam eder. Uygulama kodunu değiştirmez. */
module.exports=async function hazir(target){
 await target.addInitScript(()=>{
  try{if(!localStorage.getItem('kv_yasal_kabul'))localStorage.setItem('kv_yasal_kabul',JSON.stringify({s:99,t:Date.now()}));}catch(e){}
  const tick=()=>{try{if(typeof st!=='undefined'&&!st.prof&&!st.guest&&st.screen==='pedit'&&typeof profiles==='function'&&profiles().length===0&&typeof guest==='function')guest();}catch(e){}};
  const t=setInterval(tick,50);setTimeout(()=>clearInterval(t),8000);
 });
};
