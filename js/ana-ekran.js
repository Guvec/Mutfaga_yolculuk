/* © 2026 Ali Arıkoğlu. Onaylı ana ekran; soru bankasını değiştirmez. */
'use strict';
(function(){
 const ART='assets/ana-ekran/onayli-seffaf.png';
 const crops={book:[523,430,329,191],workshop:[387,666,585,210],panda:[590,901,313,217],chick:[526,20,136,135],rabbit:[495,1139,114,114],fox:[650,1139,114,114],turtle:[805,1139,114,114],rank:[82,196,100,124],hat:[97,23,88,70],cake:[315,24,81,73],trophy:[438,1301,97,121],badge:[772,1301,93,123],pair:[36,1310,138,110]};
 let pendingSubject=null,pendingYol=null;
 function art(k,cls){const c=crops[k];return '<svg class="ae-art '+(cls||'')+'" viewBox="0 0 '+c[2]+' '+c[3]+'" aria-hidden="true" focusable="false"><svg width="'+c[2]+'" height="'+c[3]+'" viewBox="'+c.join(' ')+'" overflow="hidden"><image href="'+ART+'" width="1094" height="1438"/></svg></svg>';}
 function path(){const y=ls('ana_yol','sicak');return y==='pasta'?'pasta':y==='servis'?'servis':'sicak';}
 const pastry=['Çırak','Pastacı Yardımcısı','Pastacı','Kıdemli Pastacı','Pasta Şefi Yardımcısı'];
 const servisAd=['Stajyer','Servis Eleman Yardımcısı','Servis Elemanı','Kaptan','Servis Şefi (Şef Garson)'];
 function rutbeAdlari(){return path()==='pasta'?pastry:path()==='servis'?servisAd:RUTBE_AYAR.ranks.map(r=>r.name);}
 window.anaRutbeAdlari=rutbeAdlari;
 function foto(id,cls='ae-art'){return '<img class="'+cls+'" src="assets/ascidostum/'+id+'.webp" alt="">';}
 function dalArt(id){return foto('dal-'+GIRIS.character+'-'+id);}
 function arkadasPortreleri(){
  if(!st.prof||st.guest||!FR.ready||FR.prof!==st.prof)return '';
  return FR.list.filter(id=>FR.nick[id]&&FR.nick[id]!=='(silinmiş profil)').slice(0,3)
   .map(id=>'<span class="ae-avatar" title="'+esc(adRest(FR.nick[id]))+'">'+profileArt(FR.nick[id])+'</span>').join('');
 }
 window.anaArkadasPortreleri=function(){
  const box=document.getElementById('aeArkadasPortreleri');
  if(box)box.innerHTML=arkadasPortreleri();
 };
 function profileArt(name){name=String(name||'');const key=/civciv/i.test(name)?'chick':/panda/i.test(name)?'panda':/tavşan/i.test(name)?'rabbit':/tilki/i.test(name)?'fox':/kaplumbağa/i.test(name)?'turtle':null;return key==='chick'?'<img class="ae-avatar-art" src="assets/ascidostum/civciv.webp" alt="" width="96" height="96">':key?art(key,'ae-avatar-art'):'<span class="ae-avatar-emoji" aria-hidden="true">'+esc(typeof adEmo==='function'&&name?adEmo(name):'👨‍🍳')+'</span>';}
 window.anaProfilGorsel=function(){return profileArt(st.prof);};
 function rankHTML(){
  const pid=st.prof&&!st.guest?rkPid(st.prof,false):null;
  const state=pid?rutbeState(pid):{mp:0,rank:1};
  const ranks=RUTBE_AYAR.ranks;
  const index=Math.max(0,Math.min(ranks.length-1,(state.rank||1)-1));
  const current=ranks[index],next=ranks[index+1],points=state.mp||0;
  const remaining=next?Math.max(0,next.mp-points):0;
  const percent=next?Math.max(0,Math.min(100,100*(points-current.mp)/(next.mp-current.mp))):100;
  const names=rutbeAdlari(),title=(names[index]||current.name)+(next?' → '+(names[index+1]||next.name):'');
  const note=next?remaining+' puan kaldı':'En yüksek öğrenci rütbesi';
  rankHTML.title=title;
  return `<button type="button" class="ae-rank" onclick="go('rutbe')" aria-label="${esc(title+'. '+note)}">
   <span class="ae-rank-copy"><strong>${esc(title)}</strong><span class="ae-progress" role="progressbar"
    aria-label="Sonraki rütbeye ilerleme" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(percent)}" aria-valuetext="${esc(note)}"><span style="width:${percent}%"></span></span>
    <small class="ae-rank-note">${esc(note)}</small></span>
   <img class="ae-rank-hat" src="assets/tasarim/sef-kepi-128.png" alt="" width="64" height="64">
  </button>`;
 }
 const YOLLAR={
  sicak:{ad:'Sıcak Mutfak',konular:['mutfak-araclari','baharat','beslenme-ilkeleri','bulasik-makinesi-temizligi'],tarif:'sicak'},
  pasta:{ad:'Pastacılık',konular:['mutfak-araclari','baharat','beslenme-ilkeleri','bulasik-makinesi-temizligi'],tarif:'pasta'},
  servis:{ad:'Servis',konular:['kuver','bulasik-makinesi-temizligi'],tarif:null}
 };
 function home(){
  GIRIS.character=dostSecili();
  const name=st.guest?'Misafir':st.prof?adRest(st.prof):'Profil seç';
  const action=devamBilgi();
  const homeArt=GIRIS.homeArt();
  const scene=homeArt==='ana-panda'?{sicak:'ana-panda-sicak',pasta:'ana-panda-pastacilik',servis:'ana-panda-servis'}[path()]:GIRIS.character!=='panda'&&GIRIS.dalArt?GIRIS.dalArt(path()):homeArt;
  const avatar=profileArt(st.prof);
  const crown=typeof kaptanTacHTML==='function'?kaptanTacHTML():'';
  return `<div class="ae-home" data-yol="${path()}">
   <header class="ae-header ae-paper">
    <button type="button" class="ae-profile" onclick="anaProfil()" aria-label="${esc(name+(crown?'. Haftanın kaptanı':'')+'. Profil ayrıntıları')}">
     <span class="ae-avatar">${avatar}</span>${crown}
    </button>
    <strong class="ae-profile-name">${esc(name)}</strong>
    <button type="button" class="ae-settings" onclick="anaAyarlar()" aria-label="Ayarlar"><span aria-hidden="true">⚙︎</span></button>
    ${rankHTML()}<span class="ae-rank-baslik" aria-hidden="true">${esc(rankHTML.title||'')}</span>
   </header>
   <nav class="ae-paths" aria-label="Mutfak dalları">
    <button type="button" class="ae-paper" onclick="anaYol('sicak')" aria-pressed="${path()==='sicak'}">${dalArt('sicak')}<span>Sıcak Mutfak</span></button>
    <button type="button" class="ae-paper" onclick="anaYol('pasta')" aria-pressed="${path()==='pasta'}">${dalArt('pasta')}<span>Pastacılık</span></button>
    <button type="button" class="ae-paper" onclick="anaYol('servis')" aria-pressed="${path()==='servis'}">${dalArt('servis')}<span>Servis</span></button>
   </nav>
   <button type="button" class="ae-paper ae-dost" onclick="anaDostMutfak()" aria-label="Aşçı Dostum. Besle ve tepkisini izle">
    <strong>Aşçı Dostum</strong>
    <picture class="ae-dost-artwork" data-dost="${GIRIS.character}">${foto(scene)}</picture>
    <span class="ae-dost-poz" aria-hidden="true"><img alt=""></span>
   </button>
   ${resumeHTML(action)}
   <section class="ae-paper ae-friends" aria-label="Arkadaşlarım">
    <button type="button" class="ae-friends-open" data-ark="1" onclick="anaArkadas()">${foto('ana-arkadas')}<strong>Arkadaşlarım</strong></button>
    <span class="ae-friends-portraits" id="aeArkadasPortreleri" aria-hidden="true">${arkadasPortreleri()}</span>
    <button type="button" class="ae-friends-add" onclick="anaArkadas(true)" aria-label="Arkadaş ekle"><span aria-hidden="true">+</span></button>
   </section>
   <nav class="ae-paper ae-bottom" aria-label="Oyun ve başarılar">
    <button type="button" class="ae-paper" onclick="tasarimOda('create')">${foto('ana-birlikte')}<span>Birlikte Oyna</span></button>
    <button type="button" class="ae-paper" onclick="rkOpenBoard()">${foto('ana-siralama')}<span>Sıralama</span></button>
    <button type="button" class="ae-paper" onclick="go('rutbe')">${foto('ana-rozet')}<span>Rozetlerim</span></button>
   </nav>
  </div>`;
 }
 function resumeHTML(a){
  const title='Yolculuğuna devam et';
  const progress=a.total
   ?`<p>${a.completed} / ${a.total} çalışma tamamlandı</p><progress value="${a.completed}" max="${a.total}" aria-label="Tamamlanan çalışma sayısı"></progress>`
   :'';
  const topic=a.name
   ?`<div class="ae-home-topic">${foto(topicArt(a.id))}<span><strong>${esc(a.name)}</strong>${a.detail?'<small>'+esc(a.detail)+'</small>':''}</span></div>`
   :'';
  return `<section class="ae-paper ae-kald" aria-labelledby="ae-resume-title">
   <div class="ae-resume-head"><h2 id="ae-resume-title"><svg class="ae-takvim" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="14" r="1.2"/><circle cx="12" cy="14" r="1.2"/><circle cx="16" cy="14" r="1.2"/><circle cx="8" cy="17.5" r="1.2"/><circle cx="12" cy="17.5" r="1.2"/></svg>${esc(title)}</h2></div>
   ${progress}${topic}${devamHTML(a)}</section>`;
 }
 function sonKonuAnahtar(){return 'ana_son_konu_'+(st.guest?'misafir':st.prof||'');}
 const TOPICS={
  'beslenme-ilkeleri':['Yeterli ve Dengeli Beslenme','kitap-beslenme-tabak'],
  'mutfak-araclari':['Mutfak Araçları','konu-araclar'],
  baharat:['Baharatlar','konu-baharat'],
  'bulasik-makinesi-temizligi':['Bulaşık Yıkama ve Atık Yönetimi','konu-bulasik'],
  kuver:['Servant ve Kuver','konu-kuver']
 };
 function topicArt(id){return TOPICS[id][1];}
 function topicRow(title,image,onclick,detail=''){
  return `<button type="button" class="ae-list-item ae-paper" onclick="${onclick}">
   ${foto(image)}<span><strong>${esc(title)}</strong>${detail?'<small>'+esc(detail)+'</small>':''}</span><b aria-hidden="true">›</b>
  </button>`;
 }
 function interior(title,content){
  return `<div class="ae-interior"><header class="ae-interior-head ae-paper">
   <button type="button" onclick="back()" aria-label="Geri">‹</button><h1>${esc(title)}</h1>
   </header>${content}</div>`;
 }
 const DAILY_TASKS=[
  {key:'kuver',title:'Kuver çalışması',image:'konu-kuver',action:"anaKonu('kuver','gunlukgorevler')"},
  {key:'arac',title:'Mutfak araçları çalışması',image:'konu-araclar',action:"anaKonu('mutfak-araclari','gunlukgorevler')"},
  {key:'baharat',title:'Baharat çalışması',image:'konu-baharat',action:"anaKonu('baharat','gunlukgorevler')"}
 ];
 function gunlukDurum(){
  const pid=st.prof&&!st.guest?rkPid(st.prof,false):null;
  const day=pid?rutbeState(pid).gorev:null;
  return day?.date===Rutbe.day()?day.done||{}:{};
 }
 function gunlukKartHTML(){
  const done=gunlukDurum(),total=DAILY_TASKS.length;
  const count=DAILY_TASKS.filter(task=>done[task.key]).length;
  const next=DAILY_TASKS.find(task=>!done[task.key]);
  return `<section class="ae-paper ae-daily">
   <h2><span aria-hidden="true">▦</span> Günlük Görevler</h2>
   <p>${count} / ${total} görev tamamlandı</p>
   <progress value="${count}" max="${total}" aria-label="Tamamlanan günlük görev sayısı"></progress>
   ${next?topicRow(next.title,next.image,next.action,'0 / 1'):'<p>Bugünkü görevler tamamlandı.</p>'}
   <button type="button" class="ae-primary" onclick="go('gunlukgorevler')">Görevleri gör <span aria-hidden="true">›</span></button>
  </section>`;
 }
 function gunlukListeHTML(){
  const done=gunlukDurum();
  return (st.prof&&!st.guest?'':'<p>Görevlerin kaydedilmesi için bir profil seçilir.</p>')+
   '<div class="ae-list">'+DAILY_TASKS.map(task=>topicRow(task.title,task.image,task.action,
    done[task.key]?'1 / 1 · Tamamlandı':'0 / 1')).join('')+'</div>';
 }
 function book(){
  const task=gunlukKartHTML();
  const topics=Object.entries(TOPICS).map(([id,[name,art]])=>topicRow(name,art,"anaKitapKonu('"+id+"')")).join('');
  const review=typeof yanlisSonrakiDers==='function'?yanlisSonrakiDers().length:0;
  return interior('Mutfak Kitabım',task+(review?'<button class="ae-primary" type="button" onclick="yanlisAc(true)">Pekiştiriyorum ('+review+')</button>':'')+'<h2>Konular</h2><div class="ae-list">'+topics+'</div>');
 }
 function atelier(){
  return interior('Aşçılık Atölyesi','<div class="ae-list">'+
   topicRow('Sıcak Mutfak','sicak-mutfak',"anaTarif('sicak')")+
   topicRow('Pastacılık','cake',"anaTarif('pasta')")+'</div>');
 }
 const RECIPES={
  mercimek:{name:'Mercimek Çorbası',image:'tarif-mercimek',group:'sicak',items:['Kırmızı mercimek','Soğan','Su','Limon']},
  sebze:{name:'Sebze Çorbası',image:'tarif-sebze',group:'sicak',items:['Havuç','Patates','Kabak','Su']},
  omlet:{name:'Sebzeli Omlet',image:'tarif-omlet',group:'sicak',items:['Yumurta','Biber','Mantar']},
  kek:{name:'Kek',image:'cake',group:'pasta',items:['Un','Yumurta','Şeker','Kabartma tozu']}
 };
 let recipe=null;
 function recipeList(group){
  const rows=Object.entries(RECIPES).filter(([,r])=>r.group===group)
   .map(([id,r])=>topicRow(r.name,r.image,"anaTarifKart('"+id+"')")).join('');
  return interior(group==='sicak'?'Sıcak Mutfak':'Pastacılık',
   (group==='sicak'?foto('sicak-mutfak','ae-interior-banner'):'')+'<h2>Tarifler</h2><div class="ae-list">'+rows+'</div>');
 }
 function recipePage(){
  const r=RECIPES[recipe];
  return interior(r.name,foto(r.image,'ae-interior-banner')+'<section class="ae-paper ae-reading"><h2>Örnek malzemeler</h2><ul>'+
   r.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><p>Uygulama için öğretmenin verdiği reçete kullanılır.</p></section>');
 }
 function serving(){
  return interior('Servant ve Kuver','<h2>Konuyu seç</h2><div class="ae-list ae-serving">'+
   topicRow('Servant','servant',"go('servant')")+topicRow('Kuver','kuver',"anaKonu('kuver','servantkuver')")+'</div>');
 }
 function servant(){
  return interior('Servant',foto('servant','ae-interior-banner')+
   '<section class="ae-paper ae-reading"><h2>Servantı tanı</h2><p>Servant, servis sırasında kullanılan temiz tabak ve takımların düzenli tutulduğu servis dolabıdır.</p><p>Tabaklar boylarına göre ayrılır. Çatal, kaşık ve bıçaklar ayrı bölmelere yerleştirilir.</p></section>');
 }
 function nutrition(){
  return interior('Yeterli ve Dengeli Beslenme',foto('kitap-beslenme-tabak','ae-interior-banner')+
   '<section class="ae-paper ae-reading"><h2>Sağlıklı yemek tabağı</h2><p>Sağlıklı yemek tabağı, bir öğündeki besin gruplarını görmeye yardım eder.</p><p>Dilimler grupları gösterir. Her dilim için aynı miktarda besin alınması gerekmez. Öğünün yanında su içilebilir.</p></section>'+
   '<button type="button" class="ae-paper ae-soru-git" onclick="anaBeslenmeSoru()"><span>Sorulara geç</span><b aria-hidden="true">›</b></button>');
 }
 window.anaBeslenmeSoru=function(){anaKonu('beslenme-ilkeleri','beslenmeokuma');};
 function market(){
  const rows=['apple','lemon','yogurt','milk','ayran','cake'].map(id=>{
   const food=GIRIS.foods.find(f=>f.id===id);
   return `<button type="button" class="ae-paper ae-market-food" onclick="GIRIS.ac('market','${id}')">${foto(id)}<strong>${esc(food.name)}</strong></button>`;
  }).join('');
  return interior('Lezzetleri Keşfet','<h2>Besinler</h2><div class="ae-market-grid">'+rows+'</div>');
 }
 window.anaYol=function(y){
  lsSet('ana_yol',y==='pasta'?'pasta':y==='servis'?'servis':'sicak');
  /* Dal kartına dokunan öğrenci o dalın Teori ve Uygulama penceresine geçer. */
  go('yolpenceresi');
 };
 window.anaTema=function(){temaDegistir();render();};
 window.anaSes=function(){SES.acik=!SES.acik;lsSet('ses',SES.acik);sesSus();render();};
 window.anaAyarlar=function(){voiceSettings();const box=document.querySelector('#ov .modal');if(!box)return;const nav=document.createElement('div');nav.className='row';const tm=()=>'Tema: '+({light:'Aydınlık',sepia:'Sepya',okyanus:'Okyanus',orman:'Orman',lavanta:'Lavanta',seftali:'Şeftali',yuksek:'Yüksek kontrast',dark:'Gece'}[document.documentElement.dataset.theme]||'Aydınlık');const sm=()=>'Sesli okuma: '+(SES.acik?'Açık':'Kapalı');const tema=document.createElement('div');tema.className='row';const YZ=['normal','buyuk','cok'],YZN={normal:'Normal',buyuk:'Büyük',cok:'Çok büyük'},yzm=()=>'Yazı boyutu: '+YZN[document.documentElement.getAttribute('data-yz')||'normal'];tema.innerHTML='<button class="btn" id="aeTemaBtn">'+tm()+'</button><button class="btn" id="aeSesBtn">'+sm()+'</button><button class="btn" id="aeYzBtn">'+yzm()+'</button>';tema.querySelector('#aeYzBtn').onclick=function(){const now=document.documentElement.getAttribute('data-yz')||'normal',nx=YZ[(YZ.indexOf(now)+1)%YZ.length];document.documentElement.setAttribute('data-yz',nx);try{localStorage.setItem('mesleki-yazi',nx);}catch(e){}this.textContent=yzm();};box.insertBefore(tema,box.querySelector('.row'));tema.querySelector('#aeTemaBtn').onclick=function(){temaDegistir();this.textContent=tm();};tema.querySelector('#aeSesBtn').onclick=function(){SES.acik=!SES.acik;lsSet('ses',SES.acik);if(!SES.acik)sesSus();this.textContent=sm();};
  nav.innerHTML=`<button class="btn" onclick="closeModal();anaKitap()">Mutfak Kitabım</button>
   <button class="btn" onclick="closeModal();anaDost()">Görünüm ve Hareketler</button>
   <button class="btn" onclick="closeModal();go('market')">Lezzetleri Keşfet</button>
   <button class="btn" onclick="closeModal();go('history')">Çalışma geçmişim</button>
   <button class="btn" onclick="closeModal();kilavuzAc()">📖 Kılavuz</button>`;
  box.appendChild(nav);};
 const aeSpeak=sesSoyle;sesSoyle=function(t){const r=aeSpeak.apply(this,arguments);if(SES.acik&&t&&MUZIK.acikMi())MUZIK.okumaIcinDuraklat();return r;};
 window.anaProfil=function(){if(st.prof||st.guest)profilAyrintiAc();else go('profiles');};
 window.anaArkadas=function(ekle=false){
  if(!st.prof||st.guest){adToast('Arkadaş eklemek için kayıtlı profilini seç.');go('profiles');return;}
  frOpen();
  if(ekle){
   const prof=st.prof;
   frEnsure().then(()=>{if(st.screen==='friends'&&st.prof===prof)document.getElementById('fr-code')?.focus();});
  }
 };
 function devamBilgi(){
  const saved=ls(sonKonuAnahtar(),null);
  const konular=YOLLAR[path()].konular;
  const id=konular.includes(saved)?saved:konular[0];
  const progress=typeof yolDevamBilgi==='function'?yolDevamBilgi(id):null;
  /* "Kaldığın yer" yalnız gerçek ilerleme varsa çıkar; konuyu açmak (saved) ilerleme sayılmaz. */
  const started=!!progress?.basladi;
  const title=progress?.bitti?'Tekrar çalış':'Devam et';
  const detail=progress?.bitti?'Çalışma tamamlandı':
   progress?.node?(st.prof&&!st.guest?'0 / 1 · +'+progress.points+' puan':'0 / 1'):progress?.basladi?'Çalışma sürüyor':'';
  return {id,name:TOPICS[id][0],started,title,detail,total:progress?.total,completed:progress?.completed};
 }
 function devamHTML({title,name}){
  return `<button type="button" class="ae-devam" onclick="anaDevam()" aria-label="${esc(title+'. '+name)}">
   <b>${esc(title)}</b><span aria-hidden="true">›</span></button>`;
 }
 let subjectReturn='home',kitapGeri='mutfakkitabi',recipeFrom='';
 function openFrom(id,from){
  subjectReturn=from;
  lsSet(sonKonuAnahtar(),id);
  openSubject(id);
 }
 window.anaKonu=function(id,from='mutfakkitabi'){
  if(st.prof||st.guest){openFrom(id,from);return;}
  pendingSubject={id,from};go('profiles');
 };
 window.anaKitapKonu=function(id,from='mutfakkitabi'){
  if(!Object.hasOwn(TOPICS,id))return;
  kitapGeri=from;
  if(id==='kuver'){go('servantkuver');return;}
  if(id==='beslenme-ilkeleri'){if(st.prof||st.guest)lsSet(sonKonuAnahtar(),id);go('beslenmeokuma');return;}
  anaKonu(id,from);
 };
 window.anaYolPencere=function(){go('yolpenceresi');};
 window.anaYolKonu=function(id){anaKitapKonu(id,'yolpenceresi');};
 window.anaYolTarif=function(id){if(Object.hasOwn(RECIPES,id)){recipe=id;recipeFrom='yol';go('tarifkart');}};
 function yolPenceresi(){
  const y=YOLLAR[path()];
  const konular=y.konular.map(id=>topicRow(TOPICS[id][0],TOPICS[id][1],"anaYolKonu('"+id+"')")).join('');
  const tarifler=y.tarif?Object.entries(RECIPES).filter(([,r])=>r.group===y.tarif)
   .map(([id,r])=>topicRow(r.name,r.image,"anaYolTarif('"+id+"')")).join(''):'';
  return interior(y.ad+': Konular ve Uygulama','<h2>Konular</h2><div class="ae-list">'+konular+'</div>'+
   (tarifler?'<h2>Uygulama</h2><div class="ae-list">'+tarifler+'</div>':''));
 }
 function resume(id){
  if(id==='beslenme-ilkeleri'||id==='kuver'){anaKitapKonu(id);return;}
  lsSet(sonKonuAnahtar(),id);
  if(typeof yolKonuVar==='function'&&yolKonuVar(id)){
   subjectReturn='home';
   st.subject=id;
   const progress=yolDevamBilgi(id);
   if(progress?.node){YOL_AYAR.subject=id;yolBaslat(progress.node);}
   else yolAc(id);
   return;
  }
  openFrom(id,'home');
 }
 window.anaDevam=function(){
  const {id}=devamBilgi();
  if(st.prof||st.guest||id==='beslenme-ilkeleri'||id==='kuver'){resume(id);return;}
  pendingYol=id;go('profiles');
 };
 window.anaKitap=function(){if(typeof EFEKT!=='undefined')EFEKT.cal('click');kitapGeri='mutfakkitabi';go('mutfakkitabi');};
 window.anaAtolye=function(){go('ascilikatolyesi');};
 window.anaDost=function(){GIRIS.ac('home');};
 window.anaTarif=function(y){
  if(y==='servis'){go('servantkuver');return;}
  if(y==='sicak'||y==='pasta')go(y==='sicak'?'sicakmutfak':'pastacilik');
 };
 window.anaTarifKart=function(id){if(Object.hasOwn(RECIPES,id)){recipe=id;recipeFrom='';go('tarifkart');}};
 /* Ana sayfada Aşçı Dostum hep canlıdır: hafifçe nefes alır, birkaç saniyede bir selam verir ya da başını eğer.
    Fare üzerine gelince ya da parmakla dokununca gülümseyip zıplar. Hareket ayarı kapalıysa ya da cihazda
    "hareketi azalt" açıksa durur. Pozu olmayan dostlar yalnız nefes alır ve zıplar. */
 const DOST_POZLAR={panda:['panda-selam','panda-bas','panda-kek'],rabbit:['tavsan-selam','tavsan-bas','tavsan-kek']};
 let dostZaman=null,dostGizle=null;
 function dostHareketli(){
  return GIRIS.motion!==false&&document.documentElement.dataset.sakin!=='1'&&
   !(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
 }
 function dostDurdur(){clearInterval(dostZaman);clearTimeout(dostGizle);dostZaman=dostGizle=null;}
 function dostPoz(kart,id,sure){
  const kutu=kart.querySelector('.ae-dost-poz'),img=kutu?.querySelector('img');
  clearTimeout(dostGizle);
  kart.classList.remove('ae-dost-zipla');void kart.offsetWidth;kart.classList.add('ae-dost-zipla');
  if(img&&id){img.src='assets/ascidostum/'+id+'.webp';kutu.classList.add('acik');}
  dostGizle=setTimeout(()=>{kutu?.classList.remove('acik');kart.classList.remove('ae-dost-zipla');},sure);
 }
 function dostCanlandir(){
  dostDurdur();
  const kart=document.querySelector('.ae-home .ae-dost');if(!kart)return;
  kart.classList.toggle('ae-dost-canli',dostHareketli());
  if(!dostHareketli())return;
  const pozlar=DOST_POZLAR[GIRIS.character]||[];let sira=0;
  dostZaman=setInterval(()=>{if(!document.hidden&&kart.isConnected)dostPoz(kart,pozlar.length?pozlar[sira++%pozlar.length]:null,2200);else if(!kart.isConnected)dostDurdur();},6000);
  const gulumse=()=>dostPoz(kart,pozlar[0]||null,1800);
  kart.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')gulumse();});
  kart.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')gulumse();});
 }
 window.anaDostMutfak=function(){
  const kart=document.querySelector('.ae-home .ae-dost');
  if(kart&&dostHareketli()&&kart.querySelector('.ae-dost-poz.acik')){setTimeout(()=>{dostDurdur();GIRIS.mutfak();},350);return;}
  dostDurdur();GIRIS.mutfak();
 };
 const screens={
  home,welcome:home,yolpenceresi:yolPenceresi,mutfakkitabi:book,ascilikatolyesi:atelier,
  sicakmutfak:()=>recipeList('sicak'),pastacilik:()=>recipeList('pasta'),
  tarifkart:recipePage,servantkuver:serving,servant,beslenmeokuma:nutrition,market,
  gunlukgorevler:()=>interior('Günlük Görevler',gunlukListeHTML())
 };
 const prevRender=render;
 render=function(){
  if(st.screen==='home'&&(st.prof||st.guest)){
   if(pendingYol){const id=pendingYol;pendingYol=null;resume(id);return;}
   if(pendingSubject){const {id,from}=pendingSubject;pendingSubject=null;openFrom(id,from);return;}
  }
  const screen=st.screen;
  const isHome=screen==='home'||screen==='welcome';
  if(isHome){subjectReturn='home';kitapGeri='mutfakkitabi';}
  document.body.classList.toggle('ae-is-home',isHome);
  if(!Object.hasOwn(screens,screen)){dostDurdur();prevRender();return;}
  if(typeof GIRIS.dur==='function'&&document.getElementById('actor'))GIRIS.dur();
  dostDurdur();
  document.getElementById('app').innerHTML=screens[screen]();
  if(isHome)dostCanlandir();
  document.body.dataset.screen=isHome?'home':screen;
  document.body.classList.remove('oyun-ekrani');
  if(isHome&&st.prof&&!st.guest){frEnsure();setTimeout(frInvCheck,300);}
 };
 const prevBack=back;
 back=function(){
  const destinations={mutfakkitabi:'home',ascilikatolyesi:'home',market:'home',
   sicakmutfak:'ascilikatolyesi',pastacilik:'ascilikatolyesi',
   yolpenceresi:'home',
   tarifkart:recipeFrom==='yol'?'yolpenceresi':RECIPES[recipe]?.group==='pasta'?'pastacilik':'sicakmutfak',
   servantkuver:kitapGeri,servant:'servantkuver',beslenmeokuma:kitapGeri,
   gunlukgorevler:'mutfakkitabi',subject:subjectReturn};
  if(Object.hasOwn(destinations,st.screen)){go(destinations[st.screen]);return;}
  if(st.screen==='profiles'){pendingSubject=null;pendingYol=null;}
  prevBack();
 };
 if(st.screen==='giris'&&!new URLSearchParams(location.search).has('oda'))st.screen='home';
 render();
})();
