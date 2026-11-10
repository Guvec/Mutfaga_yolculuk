/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Yolculuğum çalışmalarında sonuç sesleri. Cevap sırasında ses yok (geri bildirim bölüm sonunda verilir); bölüm bitince tek kısa ses çalar.
   Geçti: kazanma sesi + alkış. Geçemedi: yumuşak kayıp sesi. Efekt sesleri ayardan kapatılabilir; sesli okuma açıkken efekt çalmaz. */
'use strict';
(function(){
  var son=null;
  try{
    var R0=render;
    render=function(){
      var r=R0.apply(this,arguments);
      try{
        if(st.screen==='yolplay'&&typeof Y!=='undefined'&&Y){
          var f=Y.phase,anahtar=f+'|'+(Y.node&&Y.node.id)+'|'+(Y.mode||'');
          if((f==='bitti'||f==='basarisiz')&&anahtar!==son){
            son=anahtar;
            if(typeof SES!=='undefined'&&SES.acik)return r;
            if(f==='bitti'){EFEKT.cal('win');setTimeout(function(){EFEKT.cal('alkis');},700);}
            else EFEKT.cal('kayip');
          }else if(f!=='bitti'&&f!=='basarisiz')son=null;
        }
      }catch(e){}
      return r;
    };
  }catch(e){}
})();
