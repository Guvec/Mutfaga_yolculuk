/* © 2026 Ali Arıkoğlu. Pastacılık malzeme bölümleri, yerel sürüm. */
'use strict';
const PastacilikIlk = (() => {
 const art = 'assets/pastacilik-ilk/';
 const materials = {
  un: {name:'Un', request:'Unu bul.', shape:'Cam kasede beyaz toz', intro:['Hamur yapımında kullanılır.'], feature:'toz halindedir'},
  sut: {name:'Süt', request:'Sütü bul.', shape:'Cam sürahide beyaz sıvı', intro:['Kek ve krema yapımında kullanılır.', 'Buzdolabında saklanır.'], feature:'sıvıdır'},
  yumurta: {name:'Yumurta', request:'Yumurtayı bul.', shape:'Beyaz tabakta kahverengi oval ürün', intro:['Kek ve kurabiye yapımında kullanılır.'], feature:'kabukludur'},
  tereyagi: {name:'Tereyağı', request:'Tereyağını bul.', shape:'Beyaz tabakta sarı dikdörtgen ürün', intro:['Hamura yağ ve lezzet katar.', 'Buzdolabında saklanır.'], feature:'katı bir yağdır'},
  seker: {name:'Toz şeker', request:'Toz şekeri bul.', shape:'Cam kasede beyaz kristaller', intro:['Kek ve kurabiyeye tatlılık verir.'], feature:'beyaz kristallerden oluşur'},
  kakao: {name:'Kakao', request:'Kakaoyu bul.', shape:'Cam kasede kahverengi ince toz', intro:['Kek ve kurabiyeye çikolata tadı ve kahverengi renk verir.'], feature:'kahverengi, ince bir tozdur'},
  'damla-cikolata': {name:'Damla çikolata', request:'Damla çikolatayı bul.', shape:'Cam kasede koyu renkli, sivri uçlu damlalar', intro:['Kurabiye ve kek hamuruna eklenir.'], feature:'küçük damlalar biçimindedir'},
  'kuru-uzum': {name:'Kuru üzüm', request:'Kuru üzümü bul.', shape:'Cam kasede koyu renkli, buruşuk oval taneler', intro:['Kek ve kurabiye hamuruna eklenir.'], feature:'buruşuk ve oval tanelerden oluşur'},
  'limon-rendesi': {name:'Limon kabuğu rendesi', shape:'Kabuğunun bir bölümü rendelenmiş limon ve kasede sarı kabuk rendesi', request:'Limon kabuğu rendesini bul.', intro:['Kek ve kurabiyeye limon kokusu ve tadı verir.'], feature:'ince sarı parçalardan oluşur'},
  'portakal-rendesi': {name:'Portakal kabuğu rendesi', shape:'Kabuğunun bir bölümü rendelenmiş portakal ve kasede turuncu kabuk rendesi', request:'Portakal kabuğu rendesini bul.', intro:['Kek ve kurabiyeye portakal kokusu ve tadı verir.'], feature:'ince turuncu parçalardan oluşur'},
  tarcin: {name:'Tarçın', request:'Tarçını bul.', shape:'Cam kasede açık kahverengi toz ve yanında kıvrılmış çubuklar', intro:['Kek ve kurabiyeye hoş bir koku verir.'], feature:'kahverengi toz veya kıvrılmış çubuk halinde bulunur'},
  'hindistan-cevizi': {name:'Hindistan cevizi rendesi', request:'Hindistan cevizi rendesini bul.', shape:'Cam kasede beyaz ince parçalar, yanında kahverengi kabuklu yarım meyve', intro:['Kurabiye hamuruna eklenir. Tatlıların üzerine serpilir.'], feature:'beyaz ince parçalardan oluşur'}
 };
 const lessons = [
  {ids:['un','sut','yumurta','tereyagi'],
   order:['un:iste','sut:ad','yumurta:iste','tereyagi:ad','sut:iste','un:ad','tereyagi:iste','yumurta:ad','sut:ozellik','tereyagi:ozellik']},
  {ids:['seker','kakao','damla-cikolata','kuru-uzum'],
   order:['seker:iste','kakao:ad','damla-cikolata:iste','kuru-uzum:ad','kakao:iste','seker:ad',
    'kuru-uzum:iste','damla-cikolata:ad','un:iste','yumurta:ad','seker:ozellik','kuru-uzum:ozellik']},
  {ids:['limon-rendesi','portakal-rendesi','tarcin','hindistan-cevizi'],
   order:['limon-rendesi:iste','portakal-rendesi:ad','tarcin:ad','hindistan-cevizi:ad',
    'portakal-rendesi:iste','limon-rendesi:ad','hindistan-cevizi:iste','tarcin:iste',
    'tarcin:ozellik','hindistan-cevizi:ozellik']}
 ];
 const properties = {
  sut:'Buzdolabında saklanan beyaz sıvı hangisi?',
  tereyagi:'Sarı renkli, katı yağ hangisi?',
  seker:'Beyaz kristallerden oluşan gereç hangisi?',
  'kuru-uzum':'Buruşuk, oval taneleri olan gereç hangisi?',
  tarcin:'Kıvrılmış çubuk halinde de kullanılan gereç hangisi?',
  'hindistan-cevizi':'Tatlıların üzerine hangi beyaz rende serpilir?'
 };
 const fastSeconds = 25;
 const fastBonus = 4;
 let ids = lessons[0].ids, order = lessons[0].order;
 const screens = ['pastacilikilk', 'pastacilikoyun', 'pastacilikrutbe'];
 const storageKey = 'pastacilik_ilk_v1';
 const guestSessions = new Map();
 let owner, state, first, lesson = 0, opening = false, timer;

 function fresh() {
  return {stage:'box', intro:0, turn:0, correct:[], pending:[], question:null, chosen:null, fast:false, seconds:fastSeconds};
 }
 function valid(value) {
  if (!value || !['box','intro','question','feedback','done'].includes(value.stage) ||
   !Number.isInteger(value.intro) || value.intro < 0 || value.intro >= ids.length ||
   !Number.isInteger(value.turn) || value.turn < 0 ||
   !Array.isArray(value.correct) || !value.correct.every(key => order.includes(key)) ||
   !Array.isArray(value.pending) || !value.pending.every(item => item && order.includes(item.key) && Number.isInteger(item.turn))) return false;
  if (value.stage !== 'question' && value.stage !== 'feedback') return true;
  const q = value.question;
  return q && order.includes(q.key) && Array.isArray(q.options) && q.options.length === 4 &&
   new Set(q.options).size === 4 && q.options.every(id => optionPool(q.key).includes(id)) &&
   q.options.includes(q.key.split(':')[0]) &&
   (value.stage !== 'feedback' || q.options.includes(value.chosen));
 }
 function selectLesson(index) {
  lesson = index;
  ({ids, order} = lessons[index]);
  state = [first, first.following, first.third][index];
  if (!valid(state)) state = fresh();
  if (index === 0) first = state;
  else if (index === 1) first.following = state;
  else first.third = state;
 }
 function session() {
  const pid = st.prof && !st.guest ? rkPid(st.prof, true) : null;
  const key = pid || (st.guest ? 'misafir' : 'profilsiz');
  if (owner !== key) {
   owner = key;
   first = pid ? ls(storageKey, {})[pid] : guestSessions.get(key);
   lesson = 0;
   ({ids, order} = lessons[0]);
   if (!valid(first)) first = fresh();
   selectLesson(first.stage !== 'done' ? 0 : first.active === 2 && first.following?.stage === 'done' ? 2 : first.active ? 1 : 0);
  }
  return state;
 }
 function save() {
  if (st.prof && !st.guest) {
   const progress = ls(storageKey, {});
   progress[owner] = first;
   lsSet(storageKey, progress);
  } else guestSessions.set(owner, first);
 }
 function forget(pid) {
  if (owner === pid) { owner = null; state = null; }
 }
 function paint() {
  render();
  document.querySelector('.pi-stage h2')?.focus({preventScroll:true});
 }
 function navigate(screen) {
  go(screen);
  document.querySelector('.pi-stage h2, .pi-header h1')?.focus({preventScroll:true});
 }

 function optionPool(key) {
  if (key === 'un:iste' && lesson === 1) return ['un','seker','kakao','tereyagi'];
  if (key === 'yumurta:ad' && lesson === 1) return ['yumurta','kuru-uzum','damla-cikolata','tereyagi'];
  if (key === 'tarcin:iste' && lesson === 2) return ['tarcin','kakao','limon-rendesi','hindistan-cevizi'];
  if (key === 'hindistan-cevizi:iste' && lesson === 2) return ['hindistan-cevizi','seker','portakal-rendesi','tarcin'];
  return ids;
 }
 function nextQuestion() {
  const due = state.pending.find(item => item.turn <= state.turn);
  let key = due?.key ?? order.find(item => !state.correct.includes(item) &&
   !state.pending.some(retry => retry.key === item));
  if (!key && state.pending.length) {
   // Son kart da sıradaysa arayı daha önce doğru yanıtlanan kartlarla doldur.
   const last = state.question?.key.split(':')[0];
   const fillers = order.filter(item => state.correct.includes(item) &&
    !state.pending.some(retry => retry.key === item) && !item.startsWith(last + ':'));
   const pool = fillers.length ? fillers : order.filter(item => !state.pending.some(retry => retry.key === item));
   key = pool[state.turn % pool.length];
  }
  if (!key) {
   state.stage = 'done';
   state.question = null;
   award();
   return;
  }
  if (due) state.pending = state.pending.filter(item => item !== due);
  const options = lesson === 0 && state.turn === 0 ? ['sut','un','yumurta','tereyagi'] :
   lesson === 0 && state.turn === 1 ? ['un','tereyagi','sut','yumurta'] : [...optionPool(key)];
  if (lesson || state.turn > 1) {
   for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
   }
  }
  state.question = {key, options};
  state.seconds = fastSeconds;
  state.stage = 'question';
 }
 function answer(id) {
  if (state.stage !== 'question' || !state.question.options.includes(id)) return;
  const {key} = state.question;
  state.turn++;
  state.expired = false;
  if (id === key.split(':')[0]) {
   if (!state.correct.includes(key)) state.correct.push(key);
   const last = order.every(item => state.correct.includes(item)) && !state.pending.length;
   sesCal(last ? 'kutuBitti' : 'yerlesti');
   nextQuestion();
  } else {
   sesCal('tekrarDene');
   state.pending.push({key, turn:state.turn + 3});
   state.chosen = id;
   state.stage = 'feedback';
  }
  save();
  paint();
 }
 function openBox(button) {
  sesCal('ac');
  const motion = GIRIS.motion !== false && document.documentElement.dataset.sakin !== '1' &&
   !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = () => {
   opening = false;
   if (!button.isConnected || st.screen !== 'pastacilikoyun') return;
   state.stage = 'intro';
   save();
   paint();
  };
  if (!motion) { reveal(); return; }
  opening = true;
  button.disabled = true;
  const box = document.querySelector('.pi-box');
  box.src = art + 'kutu-yari-acik.webp';
  box.classList.add('pi-box-opening');
  setTimeout(() => {
   if (box.isConnected) box.src = art + 'kutu-acik.webp';
  }, 180);
  setTimeout(reveal, 350);
 }

 function image(id, cls='', alt='') {
  return `<img class="${cls}" src="${art}${id}.webp" alt="${alt}" draggable="false">`;
 }
 function heading(text) { return `<h2 tabindex="-1">${text}</h2>`; }
 function button(text, action, style='') {
  return `<button class="pi-button ${style}" type="button" data-pi="${action}">${text}</button>`;
 }
 function scene(pose, props='', cls='') {
  return `<div class="pi-scene ${cls}"><div class="pi-actor">${image('panda-'+pose,'pi-panda')}</div>${props}</div>`;
 }
 function rank() {
  const pid = st.prof && !st.guest ? rkPid(st.prof, false) : null;
  const points = pid ? rutbeDalState(pid, 'pasta').mp : 0;
  const ranks = RUTBE_AYAR.ranks;
  const index = ranks.reduce((last, item, i) => points >= item.mp ? i : last, 0);
  const next = ranks[index + 1];
  return {index, points, next};
 }
 function badge(index) {
  return `<img src="assets/rozet/pasta-${index + 1}.webp" alt="" width="66" height="66">`;
 }
 function rankPanel() {
  const {index, points, next} = rank();
  const floor = RUTBE_AYAR.ranks[index].mp;
  return `<section class="pi-rank pi-panel">${badge(index)}<div>
   <strong>${RUTBE_DAL_AD.pasta[index]}</strong>
   ${next ? `<p>${points} / ${next.mp} puan</p>
    <progress value="${points - floor}" max="${next.mp - floor}" aria-label="Sonraki rütbeye ilerleme"></progress>
    <p>Sonraki rütbe: ${RUTBE_DAL_AD.pasta[index + 1]}</p>` : `<p>${points} puan</p>`}
   </div></section>`;
 }
 function entry() {
  return rankPanel() + scene('bekleme', image('kutu-kapali','pi-box'), 'pi-hero') +
   button('Tezgâh seni bekliyor','start') + button('Ustalık Yolum','rank','pi-secondary');
 }
 function rankList() {
  const {index, points, next} = rank();
  const floor = RUTBE_AYAR.ranks[index].mp;
  const place = ['Kendi tezgâhın','Kendi istasyonun','Kendi bölümün','Kendi pastanen açılır','Pastanen en üst seviyede'];
  return heading('Ustalık Yolum') + `<section class="pi-panel pi-yol-hero">${badge(index)}<div>
    <strong>${RUTBE_DAL_AD.pasta[index]}</strong>
    ${next ? `<p>${points} / ${next.mp} puan</p>
     <progress value="${points - floor}" max="${next.mp - floor}" aria-label="Sonraki rütbeye ilerleme"></progress>
     <p>${RUTBE_DAL_AD.pasta[index + 1]} için ${next.mp - points} puan kaldı.</p>` : `<p>${points} puan</p><p>En yüksek rütbedesin.</p>`}
   </div></section>
   <ol class="pi-yol">${RUTBE_AYAR.ranks.map((item, i) =>
   `<li class="pi-panel ${i < index ? 'pi-yol-ok' : i === index ? 'pi-yol-now' : 'pi-yol-lock'}" ${i === index ? 'aria-current="step"' : ''}>${badge(i)}
    <div><strong>${RUTBE_DAL_AD.pasta[i]}</strong><p>${place[i]}</p></div>
    <span>${i < index ? '✓ Kazanıldı' : i === index ? 'Buradasın' : item.mp + ' puan'}</span></li>`).join('')}</ol>`;
 }
 function award() {
  if (st.guest || !st.prof || typeof rutbeComplete !== 'function') return;
  const id = 'yol-pasta-malzeme-' + (lesson + 1);
  const result = rutbeComplete({id, table:id, correct:order.length, total:order.length,
   ilerleme:true, puan:RUTBE_AYAR.yolBolum + (state.fast ? fastBonus : 0), dal:'pasta'});
  state.earned = result?.gain || 0;
 }
 function startClock() {
  clearInterval(timer);
  const clock = document.querySelector('.pi-clock');
  if (!clock) return;
  timer = setInterval(() => {
   if (st.screen !== 'pastacilikoyun' || !clock.isConnected || state.stage !== 'question' || !state.fast) {
    clearInterval(timer);
    return;
   }
   if (document.hidden || st.modalOpen || document.querySelector('dialog[open], #ov.on')) return;
   state.seconds = Math.max(0, (state.seconds ?? fastSeconds) - 1);
   if (state.seconds === 0) {
    state.fast = false;
    state.expired = true;
    save();
    paint();
   } else {
    clock.textContent = state.seconds + ' sn';
    save();
   }
  }, 1000);
 }
 function materialCard(id) {
  const material = materials[id];
  return `<div class="pi-panel pi-copy"><h3>${material.name}</h3>${material.intro.map(line => `<p>${line}</p>`).join('')}${properties[id] ? `<p>${material.name} ${material.feature}.</p>` : ''}</div>`;
 }
 function intro() {
  const id = ids[state.intro];
  return `<div class="pi-panel pi-intro-head">${heading('Gereçlerle tanış')}
   <span aria-label="${state.intro + 1}. gereç, toplam 4">${state.intro + 1} / 4</span></div>` +
   scene('alma', image(id,'pi-ingredient',materials[id].shape) + (state.intro === 0 ? image('kutu-acik','pi-box') : ''), 'pi-hero pi-intro') +
   materialCard(id) +
   (state.intro === ids.length - 1
    ? button('Haydi deneyelim · Süresiz','quiz') + button('Hızlı mod · 25 sn','fast','pi-secondary')
    : button('Sıradaki gereç','intro-next'));
 }
 function question() {
  const [id, type] = state.question.key.split(':');
  const picture = type === 'iste';
  const property = type === 'ozellik';
  const material = materials[id];
  const description = id.endsWith('-rendesi')
   ? material.shape.replace(/rendelenmiş (limon|portakal)/, 'rendelenmiş meyve')
   : material.shape;
  const visual = picture ? `<p id="pi-prompt" class="pi-bubble">${material.request}</p>` :
   `<img id="pi-prompt" class="pi-ingredient" src="${art}${id}.webp" alt="${description}" draggable="false">`;
  const options = state.question.options.map((choice, i) =>
   `<button type="button" class="pi-option pi-panel" data-pi="answer" data-choice="${choice}">
    <span class="pi-letter">${'ABCD'[i]}</span>
    ${picture ? image(choice,'pi-option-image',materials[choice].shape.replace(/rendelenmiş (limon|portakal)/, 'rendelenmiş meyve')) : `<span>${materials[choice].name}</span>`}
   </button>`).join('');
  return `<h2 tabindex="-1" aria-describedby="pi-prompt">${property ? 'Usta soruyor' : picture ? 'Usta istiyor' : 'Bu ne?'}</h2>` +
   (state.fast ? `<div class="pi-fast-row"><span class="pi-note pi-clock" role="timer" aria-live="off">${state.seconds ?? fastSeconds} sn</span>${button('Süresiz devam et','untimed','pi-secondary')}</div>` : '') +
   (state.expired ? '<p class="pi-note" role="status">Süre doldu. Süresiz devam edebilirsin.</p>' : '') +
   (property ? `<div class="pi-panel pi-copy"><p id="pi-prompt">${properties[id]}</p></div>` : scene(picture ? 'isteme' : 'bekleme', visual, 'pi-quiz-scene')) +
   `<div class="pi-options ${picture ? 'pi-pictures' : 'pi-names'}" role="group" aria-label="Dört seçenek">${options}</div>
   <p class="pi-panel pi-copy">${picture ? 'Doğru görseli seç.' : 'Gerecin adını seç.'}</p>`;
 }
 function feedback() {
  const target = materials[state.question.key.split(':')[0]], chosen = materials[state.chosen];
  const pair = [state.question.key.split(':')[0], state.chosen];
  const difference = pair.includes('un') && pair.includes('sut')
   ? 'Un toz halindedir; süt sıvıdır.'
   : pair.includes('tarcin') && pair.includes('kakao')
   ? 'Tarçın açık kahverengidir, yanında çubuğu vardır. Kakao koyu kahverengidir.'
   : `${target.name} ${target.feature}. ${chosen.name} ${chosen.feature}.`;
  return heading('Birlikte bakalım') + scene('dusunme', '', 'pi-quiz-scene') +
   `<div class="pi-options pi-pair">${pair.map((id, i) =>
    `<figure class="pi-panel"><strong>${i ? 'Seçilen' : '✓ Doğru cevap'}</strong>${image(id)}
    <figcaption>${materials[id].name}</figcaption></figure>`).join('')}</div>
   <p class="pi-panel pi-copy">${difference}</p><p class="pi-note">Biraz sonra yeniden deneyelim.</p>` +
   button('Devam et','continue');
 }
 function done() {
  const {index} = rank();
  return heading('Güzel bir adım attın!') + scene('alkis','','pi-quiz-scene') +
   `<h3 class="pi-done-title">Tanışılan gereçler</h3><div class="pi-options pi-learned">${ids.map(id =>
    `<figure class="pi-panel">${image(id)}<figcaption>${materials[id].name}</figcaption></figure>`).join('')}</div>
   <div class="pi-rank pi-panel">${badge(index)}<div><strong>${RUTBE_DAL_AD.pasta[index]}</strong><p>${Number.isInteger(state.earned) && state.earned > 0 ? '+' + state.earned + ' Pastacılık puanı' : 'Ustalık yolun devam ediyor.'}</p></div></div>` +
   (lesson < lessons.length - 1 ? button('Yeni gereçleri keşfet','next-lesson') : '') +
   button('Pastacılığa dön','return','pi-secondary');
 }
 function game() {
  const stages = {
   box:() => heading('Gereçlerle tanış') + scene('bekleme',image('kutu-kapali','pi-box'),'pi-hero') + button('Kutuyu aç','box'),
   intro, question, feedback, done
  };
  return stages[state.stage]();
 }
 function handle(event) {
  const control = event.target.closest('[data-pi]');
  if (!control || opening) return;
  switch (control.dataset.pi) {
   case 'back': back(); return;
   case 'settings': anaAyarlar(); return;
   case 'start': navigate('pastacilikoyun'); return;
   case 'rank': if (typeof rutbeYolAc === 'function') { window.RUTBE_DONUS = 'pastacilikilk'; rutbeYolAc('pasta'); } else navigate('pastacilikrutbe'); return;
   case 'return': navigate('pastacilikilk'); return;
   case 'box': openBox(control); return;
   case 'answer': answer(control.dataset.choice); return;
   case 'next-lesson':
    selectLesson(lesson + 1);
    first.active = lesson;
    save();
    paint();
    return;
   case 'intro-next': state.intro++; break;
   case 'untimed': state.fast = false; break;
   case 'fast': state.fast = true; nextQuestion(); break;
   case 'quiz': state.fast = false;
    nextQuestion(); break;
   case 'continue': state.chosen = null; nextQuestion(); break;
   default: return;
  }
  save();
  paint();
 }
 function renderScreen(screen) {
  session();
  const body = screen === 'pastacilikilk' ? entry() : screen === 'pastacilikrutbe' ? rankList() : game();
  const app = document.getElementById('app');
  app.innerHTML = `<div class="pi-shell">
   <header class="pi-header">
    <button type="button" data-pi="back" aria-label="Geri">‹</button>
    <h1 tabindex="-1">Pastacılık</h1>
    <button type="button" data-pi="settings" aria-label="Ayarlar">⚙︎</button>
   </header>
   <section class="pi-stage pi-${screen === 'pastacilikoyun' ? state.stage : screen}">${body}</section>
  </div>`;
  startClock();
  app.firstElementChild.addEventListener('click', handle);
 }
 return {screens, renderScreen, navigate, forget};
})();

/* Ortak Rütbe Yolu'ndan geri: Pastacılık'tan açıldıysa oraya döner. */
(function(){const PI_BACK=back;back=function(){if(st.screen==='rutbe'&&window.RUTBE_DONUS){const d=window.RUTBE_DONUS;window.RUTBE_DONUS=null;go(d);return;}return PI_BACK.apply(this,arguments);};})();
