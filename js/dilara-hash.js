/* Dilara klipleri için metin özeti. Tarayıcı ve üretim betiği AYNI işlevi kullanır (cyrb53). */
function dilHash(s){s=String(s);var h1=0xdeadbeef,h2=0x41c6ce57,i,c;for(i=0;i<s.length;i++){c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}
 h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
 return (4294967296*(2097151&h2)+(h1>>>0)).toString(36);}
if(typeof module!=='undefined')module.exports={dilHash:dilHash};
