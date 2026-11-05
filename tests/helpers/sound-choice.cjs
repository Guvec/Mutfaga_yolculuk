/* Diğer arayüz testleri ses girişinde gerçek Sessiz düğmesini seçer.
   Uygulama fonksiyonlarını değiştirmez; profil değişimindeki pencereyi de işler. */
module.exports=async function acceptSoundChoice(page){
 await page.addInitScript(()=>{
  const choose=()=>{const b=document.getElementById('sesSecSessiz');if(b){b.click();window.__soundChoices=(window.__soundChoices||0)+1;}};
  new MutationObserver(choose).observe(document,{childList:true,subtree:true});
 });
};
