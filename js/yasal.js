/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
/* Yasal metinler ve ilk açılış onayı.
   Her kullanıcı (misafir ve eski kullanıcılar dâhil) Uygulamayı kullanmadan önce metinleri sayfa sayfa okur,
   son sayfada yaş beyanını ve iki onayı verir. Kayıt cihazda tutulur; profil açıksa sunucuya da yazılır.
   Metinler değişip YS_SURUM artarsa onay yeniden istenir. Metin satır biçimi:
   "# başlık", "- madde", "|sütun|sütun|sütun" (tablo satırı), "~ küçük not", başka her satır paragraf. */
'use strict';
const YS_SURUM=1;
const YS_TARIH='12.11.2026';
const YS_EPOSTA='';
function ysEposta(){return YS_EPOSTA||'İletişim adresi Uygulamada yayımlanacaktır.';}
const YS_METIN=[
 {id:'kosul',ad:'Kullanım Koşulları',satir:()=>[
  '~ Son güncelleme: '+YS_TARIH+' · Sürüm '+YS_SURUM,
  '# 1. Taraflar ve konu',
  'İşin Mutfağına Yolculuk ("Uygulama"), Ali Arıkoğlu tarafından kişisel olarak geliştirilen, ücretsiz bir eğitim oyunudur. Bu koşullar, Uygulamayı kullanan kişi ile geliştirici arasındaki kullanım kurallarını belirler.',
  '# 2. Kimler kullanabilir?',
  'Uygulamayı herkes kullanabilir. 18 yaşından küçük kullanıcılar, bu koşulları kanuni temsilcileriyle (anne, baba veya vasi) birlikte okumalı ve Uygulamayı onların izniyle kullanmalıdır.',
  '# 3. Uygulamanın amacı',
  'Uygulama, mutfak ve servis konularında bilgi pekiştirmek için hazırlanmış bir oyundur. Uygulamadaki bilgiler genel eğitim amaçlıdır. Mutfakta ve atölyede yapılacak işlerde yetişkin ya da eğitici gözetimi ve yerinde verilen talimatlar esastır. Uygulama bu gözetimin yerine geçmez.',
  '# 4. Uygulama olduğu gibi sunulur',
  'Uygulama ücretsizdir ve "olduğu gibi" sunulur. Kesintisiz, hatasız çalışacağı, her cihazda açılacağı ya da içeriğin her zaman eksiksiz olacağı garanti edilmez. Geliştirici, Uygulamayı önceden haber vermeden değiştirebilir, bir bölümünü ya da tamamını kapatabilir. Kayıtlı ilerlemenin, puanların ve sıralamaların kaybolmayacağı garanti edilmez.',
  '# 5. Sorumluluğun sınırı',
  'Kanunun izin verdiği ölçüde geliştirici; Uygulamanın kullanılmasından ya da kullanılamamasından doğabilecek dolaylı zararlardan, veri ve ilerleme kayıplarından, internet bağlantısından ve cihazdan kaynaklanan sorunlardan sorumlu tutulamaz. Bu madde, kanunen sınırlanamayan sorumlulukları kapsamaz.',
  '# 6. Kullanım kuralları',
  'Kullanıcı:',
  '- Uygulamayı yalnız kendi kişisel ve eğitsel amacıyla kullanır.',
  '- Başkasının profilini kullanmaz, başkalarını rahatsız etmez.',
  '- Uygulamanın çalışmasını bozmaya, sıralamayı hileyle değiştirmeye ya da sunuculara izinsiz erişmeye çalışmaz.',
  'Bu kurallara aykırı kullanımda ilgili profil ve kayıtları silinebilir.',
  '# 7. Telif hakkı',
  '© 2026 Ali Arıkoğlu. Tüm hakları saklıdır. Uygulamanın yazılımı, düzeni ve özgün içeriği izinsiz kopyalanamaz, çoğaltılamaz, dağıtılamaz ve yeniden yayımlanamaz.',
  '# 8. Değişiklikler',
  'Bu koşullar güncellenebilir. Önemli bir değişiklik olursa yeni metin Uygulamada gösterilir ve yeniden onay istenir.',
  '# 9. Uygulanacak hukuk',
  'Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır.',
  '# 10. İletişim',
  ysEposta()]},
 {id:'gizlilik',ad:'Gizlilik Politikası',satir:()=>[
  '~ Son güncelleme: '+YS_TARIH+' · Sürüm '+YS_SURUM,
  '# Kısaca',
  '- Gerçek ad, e-posta, telefon numarası, konum ve fotoğraf istenmez. Profil adı hazır listeden seçilen bir karakter adıdır.',
  '- Uygulamada reklam ve satın alma yoktur.',
  '- Profil, Hesabım sayfasından silinebilir.',
  '# 1. Hangi bilgiler kullanılır?',
  '|Karakter adı (ör. "Huzurlu Civciv")|Profilin oyunda, sıralamada ve arkadaş listesinde görünmesi|Cihaz ve sunucu',
  '|Oyun ve çalışma sonuçları, rütbe, rozetler, dost puanı|İlerlemenin saklanması ve sıralama|Cihaz; sıralamaya giren sonuçlar sunucuda',
  '|Oyuncu kodu, arkadaşlık kayıtları ve davetler|Arkadaş ekleme ve birlikte oynama|Sunucu',
  '|Çevrim içi durumu (Uygulamanın son açık olduğu zaman)|Arkadaşların birbirini oyuna çağırabilmesi|Sunucu',
  '|Oyun odası kayıtları (puan, cevap süresi)|Birlikte oynanan oyunun yürütülmesi|Sunucu (geçici)',
  '|Cihaz kimliği (Uygulamanın kendiliğinden oluşturduğu rastgele kimlik)|Sunucudaki kayıtları yalnız sahibinin değiştirebilmesi|Sunucu',
  '|Koşulların kabul kaydı (sürüm, tarih, yaş beyanı türü)|Koşulların kabul edildiğinin gösterilebilmesi|Cihaz ve sunucu',
  '|Ayarlar (yazı boyutu, ses, tema)|Tercihlerin hatırlanması|Yalnız cihaz',
  'Misafir olarak oynayan kişinin sonuçları sunucuya gönderilmez.',
  'İnternete bağlanırken hizmet sağlayıcıların sunucuları, bağlantının kurulabilmesi için cihazın IP adresini teknik olarak işler.',
  '# 2. Bilgileri kimler görür?',
  '- Herkes: sıralamadaki karakter adı, puan ve rütbe.',
  '- Arkadaşlar: çevrim içi durumu ve davetler.',
  '- Aynı oyun odasındakiler: karakter adı ve o oyundaki puanlar.',
  '# 3. Hizmet sağlayıcılar',
  '- Google Firebase (kimlik doğrulama ve veritabanı): sunucular Avrupa\'dadır.',
  '- GitHub Pages: Uygulama dosyalarının yayımlanması.',
  'Bilgiler satılmaz ve reklam amacıyla kullanılmaz. Yasal bir zorunluluk olursa yetkili kurumlarla paylaşılabilir.',
  '# 4. Ne kadar süre saklanır?',
  'Bilgiler profil silinene kadar saklanır. Oyun odası ve davet kayıtları kısa süre sonra geçersiz olur.',
  '# 5. Silme',
  'Ayrıntılar "Veri Silme" bölümündedir.',
  '# 6. Değişiklikler',
  'Bu metin güncellenebilir. Önemli bir değişiklik Uygulamada duyurulur.',
  '# 7. İletişim',
  ysEposta()]},
 {id:'kvkk',ad:'KVKK Aydınlatma Metni',satir:()=>[
  '~ Son güncelleme: '+YS_TARIH+' · Sürüm '+YS_SURUM,
  '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanmıştır.',
  '# 1. Verileri işleyen',
  'Ali Arıkoğlu · İletişim: '+ysEposta(),
  '# 2. İşlenen veriler',
  '- Kullanıcı bilgileri: karakter adı, oyuncu kodu, cihaz kimliği',
  '- Kullanım bilgileri: oyun ve çalışma sonuçları, rütbe, rozetler, dost puanı',
  '- Etkileşim bilgileri: arkadaşlık kayıtları, davetler, oyun odası kayıtları, çevrim içi durumu',
  '- Kabul kaydı: koşul sürümü, tarih, yaş beyanı türü (18 yaşını doldurmuş / kanuni temsilci izinli)',
  '- Teknik bilgi: bağlantı sırasında hizmet sağlayıcıların işlediği IP adresi',
  'Gerçek ad, iletişim bilgisi, konum, görüntü ve ses kaydı işlenmez. Özel nitelikli kişisel veri işlenmez.',
  '# 3. Amaçlar',
  'Oyunun sunulması ve ilerlemenin saklanması; sıralama, arkadaşlarla oynama ve davet özelliklerinin çalışması; hesabın güvenliği ve kötüye kullanımın önlenmesi; koşulların kabul edildiğinin gösterilebilmesi.',
  '# 4. Hukuki sebepler',
  '- KVKK m. 5/2-c: Uygulamanın sunduğu hizmetin verilebilmesi',
  '- KVKK m. 5/2-e: Bir hakkın kurulması, kullanılması veya korunması (kabul kaydı)',
  '- KVKK m. 5/2-f: Temel hak ve özgürlüklere zarar vermemek kaydıyla meşru menfaat (hesap güvenliği, kötüye kullanımın önlenmesi)',
  '# 5. Toplama yöntemi',
  'Veriler, Uygulama kullanılırken elektronik ortamda otomatik yollarla toplanır.',
  '# 6. Aktarım',
  'Veriler yurt içinde üçüncü kişilere aktarılmaz. Uygulamanın altyapısı yurt dışında yerleşik hizmet sağlayıcılar tarafından sunulduğu için veriler bu sağlayıcıların sunucularında saklanır: Google (Firebase; sunucular Avrupa\'da) ve GitHub (Uygulama dosyaları).',
  '# 7. Haklar (KVKK m. 11)',
  'Kişisel verisi işlenen kişi; verisinin işlenip işlenmediğini öğrenme, işlenmişse bilgi isteme, işlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme, aktarıldığı kişileri bilme, eksik ya da yanlışsa düzeltilmesini, KVKK m. 7 çerçevesinde silinmesini isteme, bu işlemlerin aktarılan kişilere bildirilmesini isteme, otomatik analiz sonucu aleyhine çıkan bir sonuca itiraz etme ve kanuna aykırı işleme nedeniyle zarara uğrarsa zararın giderilmesini isteme haklarına sahiptir.',
  '18 yaşından küçükler bu hakları kanuni temsilcileri aracılığıyla kullanabilir.',
  '# 8. Başvuru',
  'Başvurular şu adrese yapılabilir: '+ysEposta(),
  'Uygulamada e-posta kayıtlı olmadığı için başvuruya karakter adı ve oyuncu kodu eklenmelidir. Başvurular en geç 30 gün içinde ücretsiz yanıtlanır.']},
 {id:'silme',ad:'Veri Silme',satir:()=>[
  '~ Son güncelleme: '+YS_TARIH+' · Sürüm '+YS_SURUM,
  '# Uygulamadan silme',
  '- İnternete bağlı olduğundan emin ol.',
  '- Profil adına dokunarak Hesabım sayfasını aç.',
  '- En alttaki "Hesabımı sil" düğmesine dokun ve onayla.',
  '# Silinenler',
  '- Karakter adı (başkası seçebilsin diye serbest bırakılır)',
  '- Sunucudaki sonuçlar, sıralama satırları, rütbe ve rozet kayıtları',
  '- Arkadaşlıklar, davetler, oyuncu kartı ve kabul kaydı',
  '- Cihazdaki profil kayıtları',
  '# Bir süre kalabilenler',
  '- Oyun odası kayıtları: oda kısa süre sonra geçersiz olur.',
  '- Arkadaşların cihazları: arkadaşların kendi oyun geçmişlerinde karakter adı görünmeye devam edebilir. Bu kayıtlar onların cihazındadır.',
  '# Uygulamaya erişemiyorsan',
  'Silme talebini şu adrese gönder: '+ysEposta(),
  'Talebe karakter adını ve oyuncu kodunu ekle. Talep doğrulandıktan sonra en geç 30 gün içinde yerine getirilir.',
  'Uygulamayı cihazdan kaldırmak cihazdaki kayıtları siler, sunucudaki kayıtları silmez.']}
];
const YS_BEYAN={
 b:'18 yaşını doldurduğumu beyan ederim.',
 k:'18 yaşından küçük olduğumu; Kullanım Koşulları, Gizlilik Politikası ve KVKK Aydınlatma Metni\'nin kanuni temsilcim (anne, baba veya vasim) tarafından okunduğunu ve Uygulamayı kullanmama kanuni temsilcimin izin verdiğini beyan ederim.',
 kosul:'Kullanım Koşulları\'nı okuduğumu, anladığımı ve kabul ettiğimi beyan ederim.',
 aydin:'Gizlilik Politikası ve KVKK Aydınlatma Metni ile kişisel verilerimin işlenmesi hakkında aydınlatıldığımı kabul ederim.'
};
const YS={acik:false,kapi:false,sayfalar:[],i:0,enCok:0,yas:'',kosul:false,aydin:false,mesgul:false};

function ysEsc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function ysKabul(){try{const v=JSON.parse(localStorage.getItem(PRE+'yasal_kabul')||'null');return v&&v.s>=YS_SURUM?v:null;}catch(e){return null;}}
function ysSatirHTML(x){
 if(x.startsWith('# '))return '<h3>'+ysEsc(x.slice(2))+'</h3>';
 if(x.startsWith('- '))return '<p class="ys-madde">'+ysEsc(x.slice(2))+'</p>';
 if(x.startsWith('~ '))return '<p class="ys-kucuk">'+ysEsc(x.slice(2))+'</p>';
 if(x.startsWith('|')){const c=x.slice(1).split('|');return '<div class="ys-satir"><b>'+ysEsc(c[0])+'</b><span><i>Neden:</i> '+ysEsc(c[1])+'</span><span><i>Nerede:</i> '+ysEsc(c[2])+'</span></div>';}
 return '<p>'+ysEsc(x)+'</p>';
}
function ysDuz(html){const d=document.createElement('div');d.innerHTML=html;return d.textContent.replace(/\s+/g,' ').trim();}

/* Metinleri ekrandaki sayfa alanına sığacak sayfalara böler. Her metin yeni sayfadan başlar. */
function ysSayfala(){
 const alan=document.querySelector('#ysKapi .ys-sayfa');if(!alan)return;
 const olc=alan.cloneNode(false);olc.classList.add('ys-olc');olc.style.cssText='position:absolute;visibility:hidden;left:0;top:0;width:'+alan.clientWidth+'px;height:'+alan.clientHeight+'px';
 alan.parentNode.appendChild(olc);
 const sayfalar=[];
 if(YS.kapi)sayfalar.push({tur:'giris',doc:-1});
 YS_METIN.forEach((d,di)=>{
  let parca=['<h2>'+ysEsc(d.ad)+'</h2>'];
  const sigar=h=>{olc.innerHTML=h;return olc.scrollHeight<=olc.clientHeight+1;};
  const ekle=h=>{
   if(sigar(parca.join('')+h)){parca.push(h);return;}
   /* Uzun paragraf: sığan cümleler bu sayfada kalır, kalanı sonraki sayfada sürer. */
   const m=h.match(/^<p( class="[^"]*")?>([\s\S]*)<\/p>$/);
   if(m){
    const cumle=m[2].split(/(?<=[.;:]) /);let al=[];
    while(cumle.length&&sigar(parca.join('')+'<p'+(m[1]||'')+'>'+al.concat(cumle[0]).join(' ')+'</p>'))al.push(cumle.shift());
    if(al.length&&cumle.length){parca.push('<p'+(m[1]||'')+'>'+al.join(' ')+'</p>');sayfalar.push({tur:'metin',doc:di,html:parca.join('')});parca=[];ekle('<p'+(m[1]||'')+'>'+cumle.join(' ')+'</p>');return;}
   }
   if(parca.length>1||(parca.length===1&&!parca[0].startsWith('<h2>'))){
    /* Başlık sayfanın en altında yalnız kalmasın. */
    let tasi=[];if(parca[parca.length-1].startsWith('<h3>')&&parca.length>2)tasi=[parca.pop()];
    sayfalar.push({tur:'metin',doc:di,html:parca.join('')});parca=tasi;ekle(h);return;
   }
   parca.push(h);
  };
  for(const x of d.satir())ekle(ysSatirHTML(x));
  sayfalar.push({tur:'metin',doc:di,html:parca.join('')});
 });
 if(YS.kapi){sayfalar.push({tur:'yas',doc:YS_METIN.length-1});sayfalar.push({tur:'onay',doc:YS_METIN.length-1});}
 olc.remove();
 const eski=YS.sayfalar[YS.i],oran=YS.sayfalar.length?YS.i/YS.sayfalar.length:0;
 YS.sayfalar=sayfalar;
 if(eski&&(eski.tur==='onay'||eski.tur==='yas'))YS.i=sayfalar.findIndex(p=>p.tur===eski.tur);else YS.i=Math.min(sayfalar.length-1,Math.round(oran*sayfalar.length));
 YS.enCok=Math.min(Math.max(YS.enCok,YS.i),sayfalar.length-1);
}
function ysYasHTML(){
 const r=(v,t)=>'<label class="ys-sec"><input type="radio" name="ysYas" value="'+v+'"'+(YS.yas===v?' checked':'')+' onchange="ysSecim()"><span>'+ysEsc(t)+'</span></label>';
 return '<h2>Yaş beyanı</h2><p class="ys-kucuk">Sana uyan beyanı seç.</p>'+r('b',YS_BEYAN.b)+r('k',YS_BEYAN.k);
}
function ysOnayHTML(){
 const c=(id,t,on)=>'<label class="ys-sec"><input type="checkbox" id="'+id+'"'+(on?' checked':'')+' onchange="ysSecim()"><span>'+ysEsc(t)+'</span></label>';
 const hazir=YS.yas&&YS.kosul&&YS.aydin;
 return '<h2>Onay</h2>'+c('ysKosul',YS_BEYAN.kosul,YS.kosul)+c('ysAydin',YS_BEYAN.aydin,YS.aydin)+
  (YS.yas?'':'<p class="ys-kucuk" id="ysYasUyari">Önce bir önceki sayfada yaş beyanını seç.</p>')+
  '<button type="button" class="ys-basla" id="ysBasla" onclick="ysBasla()"'+(hazir?'':' disabled')+'>Başla</button>';
}
function ysSayfaHTML(s){
 if(s.tur==='giris')return '<h2>Başlamadan önce</h2><p>İşin Mutfağına Yolculuk\'u kullanmadan önce Kullanım Koşulları\'nı, Gizlilik Politikası\'nı, KVKK Aydınlatma Metni\'ni ve Veri Silme bilgilerini okuman gerekir.</p><p>Metinler kitap gibi sayfa sayfa ilerler. Son sayfada yaş beyanını ve onaylarını verirsin.</p><p>Her sayfadaki 🔊 düğmesiyle metni dinleyebilirsin.</p><p>18 yaşından küçüksen metinleri anne, baba veya vasinle birlikte oku.</p>';
 if(s.tur==='yas')return ysYasHTML();
 if(s.tur==='onay')return ysOnayHTML();
 return s.html;
}
function ysCiz(yon){
 const k=document.getElementById('ysKapi');if(!k)return;
 const s=YS.sayfalar[YS.i];if(!s)return;
 const alan=k.querySelector('.ys-sayfa');
 const koy=()=>{alan.innerHTML=ysSayfaHTML(s);alan.scrollTop=0;alan.classList.toggle('ys-form',s.tur!=='metin');};
 const sakin=document.documentElement.getAttribute('data-sakin')==='1'||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
 if(yon&&!sakin&&alan.animate){
  const ileri=yon>0;
  alan.animate([{transform:'rotateY(0deg)',opacity:1},{transform:'rotateY('+(ileri?-88:88)+'deg)',opacity:.5}],{duration:180,easing:'ease-in'}).onfinish=()=>{
   koy();alan.animate([{transform:'rotateY('+(ileri?88:-88)+'deg)',opacity:.5},{transform:'rotateY(0deg)',opacity:1}],{duration:220,easing:'ease-out'});
  };
  alan.style.transformOrigin=ileri?'left center':'right center';
 }else koy();
 /* Sekmeler: okunmuş metinlere dönülebilir, okunmamışa atlanamaz (onay modunda). */
 k.querySelectorAll('.ys-sekme').forEach((b,di)=>{
  const ilk=YS.sayfalar.findIndex(p=>p.doc===di&&p.tur==='metin');
  b.setAttribute('aria-current',s.doc===di?'true':'false');
  b.disabled=YS.kapi&&ilk>YS.enCok;
 });
 k.querySelector('#ysNo').textContent='Sayfa '+(YS.i+1)+' / '+YS.sayfalar.length;
 k.querySelector('#ysGeri').disabled=YS.i===0;
 const son=YS.i>=YS.sayfalar.length-1;
 const ileriB=k.querySelector('#ysIleri');ileriB.hidden=son;ileriB.textContent=YS.i===0&&YS.kapi?'Okumaya başla ›':'Sonraki sayfa ›';
}
function ysGit(n){
 n=Math.max(0,Math.min(YS.sayfalar.length-1,n));if(n===YS.i)return;
 if(YS.sayfalar[YS.i]&&YS.sayfalar[YS.i].tur==='yas'&&n>YS.i&&!YS.yas){const e=document.querySelector('#ysKapi .ys-sayfa .ys-kucuk');if(e){e.textContent='Devam etmek için bir beyan seç.';e.classList.add('ys-uyari');}return;}
 if(typeof sesSus==='function')sesSus();try{speechSynthesis.cancel();}catch(e){}
 const yon=n>YS.i?1:-1;YS.i=n;YS.enCok=Math.max(YS.enCok,n);ysCiz(yon);
}
function ysSekme(di){const ilk=YS.sayfalar.findIndex(p=>p.doc===di&&p.tur==='metin');if(ilk>=0&&(!YS.kapi||ilk<=YS.enCok))ysGit(ilk);}
function ysDinle(){
 const alan=document.querySelector('#ysKapi .ys-sayfa');if(!alan)return;
 const t=ysDuz(alan.innerHTML.replace(/<\/(p|h2|h3|span|b|label)>/g,'$&. '));
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='tr-TR';
  const v=speechSynthesis.getVoices().find(x=>/^tr/i.test(x.lang));if(v)u.voice=v;speechSynthesis.speak(u);}catch(e){}
}
function ysSecim(){
 if(document.querySelector('input[name=ysYas]')){const y=document.querySelector('input[name=ysYas]:checked');YS.yas=y?y.value:'';}
 const k1=document.getElementById('ysKosul'),k2=document.getElementById('ysAydin');if(k1)YS.kosul=k1.checked;if(k2)YS.aydin=k2.checked;
 const b=document.getElementById('ysBasla');if(b)b.disabled=!(YS.yas&&YS.kosul&&YS.aydin);
}
function ysBasla(){
 if(!(YS.yas&&YS.kosul&&YS.aydin)||YS.i<YS.sayfalar.length-1)return;
 const kayit={s:YS_SURUM,t:new Date().toISOString(),y:YS.yas};
 try{localStorage.setItem(PRE+'yasal_kabul',JSON.stringify(kayit));localStorage.setItem(PRE+'yasal_sunucu','0');}catch(e){}
 ysKapat();ysSunucuYaz();
}
function ysKapat(){
 try{speechSynthesis.cancel();}catch(e){}
 const k=document.getElementById('ysKapi');if(k)k.remove();
 YS.acik=false;document.documentElement.classList.remove('ys-kilit');
 window.removeEventListener('resize',ysBoyut);
}
let ysBoyutZ=0;function ysBoyut(){clearTimeout(ysBoyutZ);ysBoyutZ=setTimeout(()=>{ysSayfala();ysCiz(0);},150);}

/* kapi=true: ilk açılış onayı (kapatılamaz). kapi=false: Hesabım'dan okuma. */
function yasalAc(kapi,doc){
 if(YS.acik)return;
 YS.acik=true;YS.kapi=!!kapi;YS.i=0;YS.enCok=0;YS.sayfalar=[];
 const k=document.createElement('div');k.id='ysKapi';k.className='ys-kapi';
 k.setAttribute('role','dialog');k.setAttribute('aria-modal','true');k.setAttribute('aria-label',kapi?'Kullanım koşulları ve onay':'Gizlilik ve koşullar');
 k.innerHTML='<div class="ys-kitap"><header class="ys-ust"><nav class="ys-sekmeler" aria-label="Metinler">'+
  YS_METIN.map((d,di)=>'<button type="button" class="ys-sekme" onclick="ysSekme('+di+')">'+ysEsc(d.ad)+'</button>').join('')+
  '</nav><button type="button" class="ys-dinle" onclick="ysDinle()" aria-label="Bu sayfayı sesli oku">🔊</button>'+
  (kapi?'':'<button type="button" class="ys-kapat" onclick="ysKapat()" aria-label="Kapat">✕</button>')+
  '</header><div class="ys-sahne"><article class="ys-sayfa" tabindex="0"></article></div>'+
  '<footer class="ys-alt"><button type="button" id="ysGeri" onclick="ysGit(YS.i-1)">‹ Önceki</button><span id="ysNo" aria-live="polite"></span><button type="button" id="ysIleri" onclick="ysGit(YS.i+1)">Sonraki sayfa ›</button></footer></div>';
 document.body.appendChild(k);document.documentElement.classList.add('ys-kilit');
 /* Kaydırarak sayfa çevirme */
 let x0=null;const sahne=k.querySelector('.ys-sahne');
 sahne.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
 sahne.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>50)ysGit(YS.i+(dx<0?1:-1));},{passive:true});
 k.addEventListener('keydown',e=>{if(e.target.matches('input'))return;if(e.key==='ArrowRight')ysGit(YS.i+1);if(e.key==='ArrowLeft')ysGit(YS.i-1);});
 window.addEventListener('resize',ysBoyut);
 ysSayfala();
 if(doc!==undefined){const ilk=YS.sayfalar.findIndex(p=>p.doc===doc);if(ilk>=0)YS.i=ilk;}
 ysCiz(0);
}

/* Kabul kaydını, profil açıkken bir kez sunucuya yazar (kabul/{cihaz kimliği}). Başarısızsa sonra yeniden dener. */
async function ysSunucuYaz(){
 const v=ysKabul();
 if(!v||localStorage.getItem(PRE+'yasal_sunucu')==='1'||!navigator.onLine)return;
 if(typeof st==='undefined'||!st.prof||st.guest||typeof adFb!=='function')return;
 if(YS.mesgul||Date.now()-(YS.son||0)<60000)return;
 YS.mesgul=true;YS.son=Date.now();
 try{const t=await adFb(),fb=t.sdk;
  await fb.setDoc(fb.doc(t.db,'kabul',t.uid),{s:v.s,y:v.y,t:fb.serverTimestamp()});
  localStorage.setItem(PRE+'yasal_sunucu','1');
 }catch(e){}finally{YS.mesgul=false;}
}
async function ysSunucuSil(){
 try{const t=await adFb(),fb=t.sdk;await fb.deleteDoc(fb.doc(t.db,'kabul',t.uid));}catch(e){}
 try{localStorage.setItem(PRE+'yasal_sunucu','0');}catch(e){}
}

/* Otomatik testlerde (navigator.webdriver) onay ekranı kendiliğinden açılmaz; ?yasaltest ile açılır. */
function ysKapiGerekli(){
 if(ysKabul())return false;
 try{if(navigator.webdriver&&!/[?&]yasaltest/.test(location.search))return false;}catch(e){}
 return true;
}
(function(){
 const basla=()=>{if(ysKapiGerekli())yasalAc(true);};
 if(document.body)basla();else document.addEventListener('DOMContentLoaded',basla);
 if(typeof render==='function'){const R=render;render=function(){const r=R.apply(this,arguments);if(ysKabul()&&localStorage.getItem(PRE+'yasal_sunucu')!=='1')setTimeout(ysSunucuYaz,0);return r;};}
})();
