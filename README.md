# İşin Mutfağına Yolculuk (Mesleki Oyunlar)

© 2026 Ali Arıkoğlu. Tüm hakları saklıdır. Yazılı izin olmadan kopyalanamaz, dağıtılamaz. Ayrıntı: LICENSE.

Yiyecek İçecek Hizmetleri alanındaki öğrenciler için çalışma uygulaması (PWA). GitHub Pages'ten yayımlanır; `main` dalı canlı sitedir.

## Çalıştırma
Bu klasörde `python3 -m http.server 8000` çalıştırıp `http://localhost:8000` açın. Dosyaya çift tıklayarak açmak çalışmaz.

## Yapı
- `index.html`, `js/`, `css/`, `content/`, `assets/`, `audio/`, `sw.js` aynı düzeyde kalmalıdır.
- `sw.js` içindeki `CACHE` adı, her yayında elle değiştirilir; sürüm numarası `js/telif.js` içindeki `APP_SURUM` değeridir.
- `ci/` ve `tests/`: Firebase kuralları ve arayüz testleri (yalnız `test-rekor` dalında çalışır).
- Öğretmen notları ve denetim raporları depoda tutulmaz.
