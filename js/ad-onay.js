/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Karakteri bir kez değiştirme: kaydetmeden önce "son hak" uyarısı. Evet derse mevcut kayıtlar (puan, rütbe, rozet, arkadaşlar) yeni karaktere taşınır. */
'use strict';
(function(){
  if(typeof adSave!=='function')return;
  var K0=adSave;
  function sor(eski,yeni){
    return new Promise(function(coz){
      var ov=document.createElement('div');ov.className='yeni-surum-kilit';ov.id='adOnayKapi';ov.setAttribute('role','alertdialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','adOnayBaslik');
      ov.innerHTML='<div class="ys-kutu"><h2 id="adOnayBaslik">Karakterini değiştirelim mi?</h2><p><b>'+eski+'</b><br>↓<br><b>'+yeni+'</b></p><p>Puanların, rütben ve rozetlerin yeni karakterine taşınır.</p><p><b>Bu son hakkın.</b> Değiştirdikten sonra karakterini bir daha değiştiremezsin.</p><button type="button" class="btn pri" id="adOnayEvet">Evet, değiştir</button><button type="button" class="btn" id="adOnayHayir" style="margin-top:8px">Hayır, vazgeç</button></div>';
      document.body.appendChild(ov);
      var kapat=function(v){ov.remove();coz(v);};
      document.getElementById('adOnayEvet').onclick=function(){kapat(true);};
      document.getElementById('adOnayHayir').onclick=function(){kapat(false);};
      document.getElementById('adOnayHayir').focus();
    });
  }
  adSave=async function(){
    try{
      var P=st.pe,old=P&&P.i>=0?profiles()[P.i]:null;
      if(old&&!adSabit(old)){
        var om=adInfo(old);
        if(om&&om.e!==P.e&&P.av&&P.av[P.e]!==false){
          var ek=(AD_KAR[om.e]||[])[0]||'',yk=(AD_KAR[P.e]||[])[0]||'';
          var e=ek+' '+((AD_KAR[om.e]||[])[1]||old),y=yk+' '+((AD_KAR[P.e]||[])[1]||'');
          var ok=await sor(e,y);if(!ok)return;
        }
      }
    }catch(x){}
    return K0.apply(this,arguments);
  };
})();
