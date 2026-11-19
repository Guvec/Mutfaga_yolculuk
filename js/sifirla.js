/* © 2026 Ali Arıkoğlu. Tüm hakları saklıdır. */
(function () {
  'use strict';

  const APP_RESET = 1;
  const SURUM = 'kv_app_reset';
  const BEKLEYEN_EKRAN = 'kv_app_reset_ekran';
  const ILERLEME = new Set([
    'profiles', 'sonProfil',
    'rutbe', 'rutbe_dal', 'sv_baz', 'odul', 'records', 'yanlislarim',
    'rk_ids', 'rk_best', 'rk_win', 'rk_pek', 'rk_oyun', 'rk_setting', 'rk_queue',
    'arena_devam', 'arena_odul', 'arena_pek', 'arena_rekor', 'haftalik',
    'dost_gorev',
    'yol_ma', 'yol_bh', 'yol_bl', 'yol_tk_ma', 'yol_tk_bh', 'yol_tk_bl',
    'pastacilik_ilk_v1', 'baharat_rafi_v1', 'lezzet_tezgah', 'yedek_2026_11',
  ]);
  const ESKI_ISARETLER = ['kv_sifirla_bekleyen', 'kv_sifirla_haber'];
  const SEKME_DEVAMI = ['yr_devam', 'yr_menu_profil'];
  const BOS = new Set([null, '', '[]', '{}', 'null', 'false', '""']);

  function kayitHaritasi(anahtar) {
    try {
      const kayit = JSON.parse(localStorage.getItem(anahtar));
      if (kayit && typeof kayit === 'object' && !Array.isArray(kayit)) return kayit;
    } catch (e) {}
    return {};
  }

  function eskiTemizlikleriKoru() {
    // Önceden talep edilen hesap ve sıralama silme işlemleri kendi akışlarında devam eder.
    const profiller = kayitHaritasi('kv_rk_prof');
    const eskiTemizlikler = kayitHaritasi('kv_rk_clean');
    const bekleyen = Object.entries(profiller).filter(([pid, profil]) =>
      profil && (profil.pendingDelete === true ||
        (['out', 'deleted'].includes(profil.status) && eskiTemizlikler[pid]?.length))
    );
    const temizlenecek = bekleyen.filter(([pid]) => Array.isArray(eskiTemizlikler[pid]))
      .map(([pid]) => [pid, eskiTemizlikler[pid]]);
    for (const [anahtar, kayitlar] of [['kv_rk_prof', bekleyen], ['kv_rk_clean', temizlenecek]]) {
      if (kayitlar.length) localStorage.setItem(anahtar, JSON.stringify(Object.fromEntries(kayitlar)));
      else localStorage.removeItem(anahtar);
    }
  }

  function adRezervasyonlariniKoru() {
    let profiller, korunanlar;
    try { profiller = JSON.parse(localStorage.getItem('kv_profiles')); } catch (e) {}
    try { korunanlar = JSON.parse(localStorage.getItem('kv_app_reset_adlar')); } catch (e) {}
    if (!Array.isArray(profiller)) return;
    const adlar = kayitHaritasi('kv_ad_map');
    const ayrilan = profiller.filter(ad => Object.hasOwn(adlar, ad));
    if (!ayrilan.length) return;
    const eski = Array.isArray(korunanlar) ? korunanlar : [];
    localStorage.setItem('kv_app_reset_adlar', JSON.stringify([...new Set([...eski, ...ayrilan])]));
  }

  function sekmeyiSifirla(numara) {
    if (sessionStorage.getItem(SURUM) === numara) return;
    for (const anahtar of SEKME_DEVAMI) sessionStorage.removeItem(anahtar);
    sessionStorage.setItem(SURUM, numara);
  }

  function yerelSifirla() {
    const numara = String(APP_RESET);
    try {
      if (localStorage.getItem(SURUM) === numara) {
        sekmeyiSifirla(numara);
        return;
      }
      const anahtarlar = Object.keys(localStorage).filter(anahtar => {
        if (!anahtar.startsWith('kv_')) return false;
        const ad = anahtar.slice(3);
        return ILERLEME.has(ad) || ad.startsWith('ana_son_konu_');
      });
      const eskiVeriVar = anahtarlar.some(anahtar => !BOS.has(localStorage.getItem(anahtar))) ||
        SEKME_DEVAMI.some(anahtar => !BOS.has(sessionStorage.getItem(anahtar)));
      if (eskiVeriVar) localStorage.setItem(BEKLEYEN_EKRAN, numara);
      adRezervasyonlariniKoru();
      eskiTemizlikleriKoru();
      for (const anahtar of anahtarlar) localStorage.removeItem(anahtar);
      for (const anahtar of ESKI_ISARETLER) localStorage.removeItem(anahtar);
      // Önbellekten açılan önceki sürüm eski bulut temizliğini yeniden başlatmasın.
      localStorage.setItem('kv_sifirlama', JSON.stringify('2026-11-10-tam'));
      sekmeyiSifirla(numara);
      localStorage.setItem(SURUM, numara);
    } catch (e) {
      // Depolama tekrar kullanılabilir olduğunda açılışta işlem yeniden denenir.
    }
  }

  function ekranBekliyor() {
    try {
      const numara = String(APP_RESET);
      return localStorage.getItem(SURUM) === numara && localStorage.getItem(BEKLEYEN_EKRAN) === numara;
    } catch (e) {
      return false;
    }
  }

  function ekraniGoster() {
    if (!ekranBekliyor() || st.modalOpen || typeof adOpen !== 'function' ||
        (typeof ysKapiGerekli === 'function' && ysKapiGerekli()) ||
        (typeof YS !== 'undefined' && YS.acik) ||
        document.getElementById('yerelSifirlama')) return false;

    const ekran = document.createElement('dialog');
    ekran.id = 'yerelSifirlama';
    ekran.className = 'modal';
    ekran.setAttribute('aria-labelledby', 'sifirlamaBaslik');
    ekran.setAttribute('aria-describedby', 'sifirlamaAciklama');
    ekran.style.cssText = 'top:max(16px,env(safe-area-inset-top));margin:0 auto;width:calc(100% - 32px);max-height:calc(100dvh - 32px);overflow:auto;border:0';
    ekran.innerHTML = '<h2 id="sifirlamaBaslik">Bu cihazda yeni başlangıç</h2>' +
      '<p id="sifirlamaAciklama">Bu cihazdaki profilin, puanların, rütben, rozetlerin, kişisel rekorların sıfırlandı.</p>' +
      '<button type="button" class="btn pri" style="min-height:48px" autofocus>Profil seç</button>' +
      '<p>İnternetteki eski sıralama kayıtları duruyor.</p>';
    document.body.appendChild(ekran);

    function profilSec() {
      try { localStorage.removeItem(BEKLEYEN_EKRAN); } catch (e) {}
      ekran.close();
      ekran.remove();
      if (st.screen !== 'pedit') adOpen(-1, 'home');
    }

    ekran.querySelector('button').addEventListener('click', profilSec);
    ekran.addEventListener('cancel', event => {
      event.preventDefault();
      profilSec();
    });
    ekran.showModal();
    return true;
  }

  yerelSifirla();
  document.addEventListener('DOMContentLoaded', () => {
    if (!ekranBekliyor() || ekraniGoster() || typeof render !== 'function') return;
    const oncekiRender = render;
    render = function () {
      const sonuc = oncekiRender.apply(this, arguments);
      if (ekraniGoster()) render = oncekiRender;
      return sonuc;
    };
  }, {once: true});
})();
