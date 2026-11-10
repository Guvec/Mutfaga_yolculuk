/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
try{var t=localStorage.getItem('mesleki-tema');if(['light','sepia','okyanus','orman','lavanta','seftali','yuksek','dark'].indexOf(t)<0)t=localStorage.getItem('mesleki-gece')==='true'?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t==='dark'?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}
try{var ak=localStorage.getItem('mesleki-aksan');if(['okyanus','orman','bordo','kehribar','mor'].indexOf(ak)>=0)document.documentElement.setAttribute('data-aksan',ak);}catch(e){}
