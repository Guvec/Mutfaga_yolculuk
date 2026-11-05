# İşin Mutfağına Yolculuk

© 2026 Ali Arıkoğlu. Tüm hakları saklıdır. Yazılı izin olmadan kopyalanamaz, dağıtılamaz. Ayrıntı: LICENSE.

## Önceki not (v9)

Bu sürüm, kullanıcının gönderdiği Temel Mutfak ve Servis Becerileri 9 kitabının ilgili sınıflandırmalarıyla güncellendi. Canlı GitHub sitesine yüklenmedi.

## Çalıştırma
Bu klasörde `python3 -m http.server 8000` çalıştırıp `http://localhost:8000` açın. JSON içerikleri dosyaya çift tıklayarak çalıştırmak uygun değildir.

## GitHub Pages
ZIP içindeki `site/` klasörünün İÇİNDEKİLERİNİ mevcut yayımlama klasörüne aktarın. `index.html`, `js/`, `css/`, `content/`, `assets/`, `sw.js` aynı düzeyde kalmalıdır. Sürüm yazısı: “MEB sınıflandırması ve görsel denetimi 9”. `denetim/` öğretmen raporudur; siteye yüklemek gerekmez.

## İçerik
- Mutfak: 144 kart, 12 takım. Baharat:132 kart, 11 takım. Bulaşık/atık:12 kart, 1 takım.
- Toplam:288 kart, 24 takım. Her takımda12 görsel, 18 benzersiz ad; 6 ad fazladandır.
- Yeni Servis takımlarını tanı ekranı, sınıfları ad ve açıklamalarıyla öğretir. Cevaplar bağımsız eşleştirme ekranına aktarılmaz.
- Tatlı çatalı dört dişlidir; antre takımının parçaları tamamlandı. Tabak adları ve ilgili soru seçenekleri birlikte düzeltildi.
- Bardaklar boştur. Portakal suyu ve kısa/kalın tabanlı önceki model kullanılmaz.
- Düz tabak ve metal takım ailelerinde ortak tasarım/ölçek korunur. Aynı ölçekle yenilenen tatlı kaşığı sorusu etkindir:95 mutfak ve 13 bulaşık/atık sorusu vardır.
- Kapsam ve sınırlılıklar: `denetim/V9_RAPOR.md`, `denetim/SON_DENETCI_V9.md`.
- Bütün 525 görsel tarandı. Baharatlardaki çoklu biçim/kaynak ipuçları ayrıca kaydedildi; tüm bankaya koşulsuz bağımsız tanıma geçerliği onayı verilmez.
- Önceki v6–v8 raporları tarihsel kayıttır. V8 ve V9 takım içerikleri değiştiğinden puanlar doğrudan karşılaştırılmamalıdır.

## Kontrol
`node tests/state-tests.cjs` ve `node tests/speech-tests.cjs`. Son tarayıcı denemeleri ve yeniden çalıştırma bilgisi `denetim/V9_TEST_SONUCLARI.txt` içindedir.
