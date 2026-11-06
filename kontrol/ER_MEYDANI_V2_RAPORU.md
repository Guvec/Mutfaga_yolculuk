# Er Meydanı 2 — Değişiklik ve denetim kaydı

6 Kasım 2026. Yayınlanan profil sürümü: **1.3**, GitHub commit `c4d15536d90cbb31910a28737308e6e90159d7d3`. GitHub Pages build/deploy başarıyla tamamlandı; canlı core.js profilDevamEt ve telif.js APP_SURUM1.3 doğrulandı.

Bu belgede anlatılan yeni Er Meydanı **1.4 yayın adayıdır**; Firebase kuralı kullanıcı tarafından yayınlanana kadar main'e alınmadı. Bu oturumda Firebase yayın bağlantısı ve CLI oturumu bulunmuyor.

## Son davranış

- 3–4 oyuncu, aynı tohumla aynı 75 görsel soruyu kendi hızında çözer. Havuz yalnız Mutfak Araçları ve Baharatlar: 38 araç + 37 baharat. Kuver ve bulaşık yüklemesi/sürümü arena başlangıcını engellemez.
- Diğer oyuncuların cevabı beklenmez. Kendi cevabından sonra Sıradaki soru düğmesi kullanılabilir; doğru cevap sonrası 350 ms, yanlış/süre sonrası 1400 ms içinde otomatik ilerleme de vardır.
- Dört yanlış veya 75 sorunun tamamlanması denemeyi bitirir. Süresi dolan soru bir yanlış sayılır.
- Soru süresi 15 sn başlar; her 5 doğru cevapta 1 sn azalır, alt sınır 7 sn. Formül saf modelde ve kuralda aynı sınırlara sahiptir.
- Canlı sıra geçicidir. Kesin sonuç yalnız başlangıç kadrosundaki herkesin bitmiş, sunucu onaylı kaydı üzerinden hesaplanır. Sıra: doğru sayısı azalan, eşit doğruda toplam cevap süresi artan; aynı doğru ve süre ortak sıradır.
- Oyun sırasında bağlantısı 60 sn'den uzun süre güncellenmeyen kişi sunucu kuralı denetimiyle ayrıldı işaretlenebilir. Yerel 2 sn tahmini artık yanlış cevap veya kesin sonuç üretmez. Ayrılan oyuncu kazanan sayılmaz.
- Aktif ve bitmiş yanıtlar server kurallarında yalnız sona eklenir; n/ok/bad/tt uyumu, dört yanlış, 75 sınırı ve bitmiş sonuç değişmezliği denetlenir. Aktif kadrodan oyuncu silinemez.
- Yazılar sırayla gönderilir, başarısız ilk yazı atlanmaz. Kuyruğa alınan yanıt dizileri kopyadır. Eski odanın geç gelen yazı/hata callback'i yeni odayı etkilemez.
- Aktif/bitmiş arena odasına aynı kişi döndüğünde kaydı sıfırlanmaz. Sunucu kişiyi ayrıldı olarak kesinleştirdiyse fazla yerel cevaplar ve eski kuyruk bırakılıp ortak kayıt kullanılır.
- Ödül tekrar bildirilen snapshot veya bitmiş odaya dönüşle tekrar verilmez. Yeni **oy-arena2** tablosu kazanılan oyunları sayar; eski **oy-arena** tur kayıtları korunur ve yeni metrikle karıştırılmaz. Sıfır doğruya galibiyet puanı verilmez.
- Sonuç ekranında sıralama ve mevcut arkadaş ekleme erişimi korunur. Kılıç başlangıç efekti ve doğru/yanlış sesleri kodla sentezlenir. Efekt kapalı ve Sakin mod tercihi bunları durdurur; müzik/sesli okuma tercihleri değiştirilmez. Gerçek hoparlörde dinleme testi yapılmadı.

## Bulunan ve giderilen hatalar

| Bulgu | Düzeltme |
|---|---|
| Arena her telefonda 2 sn gecikeni yerel -1 sayıyor, puanı sonradan düzeltmiyordu | Ortak r dizisinden saf hesap, sunucu onaylı final |
| Yerel pendingWrites sonucu kesinmiş gibi görünebiliyordu | Metadata değişikliklerini dinleme; pending/fromCache sırasında kesin final/ödül yok |
| Ağ yazıları üst üste gelip eski sonuç yeninin üzerine yazılabiliyordu | Oda kimliğine bağlı sıralı yeniden gönderim kuyruğu |
| Başlangıç kadrosu değişebiliyor, bitmiş/aktif oyuncu silinebiliyordu | Kadro başlangıçta dondurulur; yeni arena kuralı aktif silmeyi ve sonuç gerilemesini reddeder |
| Kurucu yeniden girişte boş kayıt yazabiliyordu | Oynayan/bitmiş arenada mevcut kaydı oku ve koru |
| Model 20, kayıt listeleri 60 sınırındaydı | Ayrı av2 arena protokolü, 75 sınırı; diğer modlar 20 kalır |
| Kapışmada aynı 2 sn varsayımı ve eşitlik içindeki geç doğruyu yanlış yazma vardı | İki paylaşılan cevabı kullan; doğru cevap işaretini koru |
| Oyun Odası yerel kopma tahminini kesin final kabul edebiliyordu | Ortak onaylı done kayıtları tamamlanmadan kesin final yok |
| Uzun isim/uyarı/yanıt sonrası ekranda alt taşma vardı | Gerçek üst çubukla ölçülerek min48 dokunma ve kompakt boşluklar korundu |

## Testler

39 dosya: **15 geçti, 0 başarısız, 24 çalıştırılamadı**.

- arena-kural-tests.cjs: **47** gerçek Firestore emülatör kontrolü; diğer modların sınırları ve yeni global tablo da dahil.
- arena-baglanti-tests.cjs: **6** gerçek Firebase SDK + emülatör bağlantı kontrolü. Üç kimlik/kayıt; gerçek onSnapshot pending metadata; yeniden giriş; kadro; aynı ortak final.
- arena-akis-tests.cjs: **8** gerçek uygulama betikleri + üç jsdom istemci kontrolü; farklı hız, geciken yazı, eşitlik, terminal uzlaşma ve ödül tekrar koruması.
- coklu-oyun-akis-tests.cjs: **8** kapışma, Oyun Odası, kuyruk, eski callback ve efekt/Sakin mod kontrolü.
- Profildeki 16 kontrol ile mevcut saf durum/ses/rütbe/soru ve diğer kural testleri geçti.
- 84 JavaScript/test dosyasında sözdizimi; HTML ve SW dosya başvuruları; git diff --check geçti.

24 tarayıcı dosyası Playwright Chromium yürütülebilir dosyası eksik olduğundan tamamlanamadı. Önceki indirme bozuk/0 MiB ZIP ile sonuçlanmıştı. Çalıştırılamayan testler başarılı sayılmadı; fiziksel üç telefon ve canlı Firebase oyun odası denemesi yapılmadı. SDK/emülatör ve kontrollü UI testleri bunlarla aynı şey olarak sunulmaz.

## Gerçek tarayıcıda görünüm

Bağımsız QA, güncel arPlayHTML, gerçek ses/profil üst çubuğu, en uzun hazır profil adı ve bağlantı uyarısıyla yürütüldü. Seçilen aynı 75 sorunun soru ve yanıt sonrası hâli dört iframe boyutunda ölçüldü: **600/600 geçti**.

| Boyut | Durum | Sonuç |
|---|---:|---|
| 360×740 | 150 | Yatay/dikey taşma yok |
| 412×915 | 150 | Yatay/dikey taşma yok |
| 768×1024 | 150 | Yatay/dikey taşma yok |
| 1280×800 | 150 | Yatay/dikey taşma yok |

360×740 en zor örnekte belge 360×740; profil düğmesi48,38 px; üst çubuk53,38 px; son öğe726,44 px. Soru hâlinde dört seçenek etkin, seçenekler en az48 px. Önceki eksik üst çubukla yapılan 150 geçiş ve ilk dört görüntü tam uygulama kanıtı sayılmadı; son gerçek üst çubuklu ölçüm esas alındı. Genişletilen Canlı sıralama paneli isteğe bağlıdır; panel açıkken uzayan içerik bu soru/yanıt sığdırma ölçümünün dışında.

## Sınırlar

Zamanlar istemci tarafından ölçülür; bu sunucu tarafı hile tespiti veya tam güvenlik sertifikası değildir. Sunucu sınırları/önceki cevapları korur; cevabın gerçekten doğru olduğu ve kullanıcının ölçtüğü süre için yetkili sunucu hakemi henüz yok. Kapışma/Oyun Odası'ndaki hedeflenen gecikme ve final hataları giderildi; bütün multiplayer senaryolarının fiziksel cihazda tamamlandığı iddia edilmez.

## Yayın sırası — tek kalan dış işlem

1. Kullanıcı, mesleki-oyunlar projesinde Firestore → Kurallar ekranına **firestore_nihai.rules dosyasının TAMAMINI** koyup Yayınla'ya basar. Fark dosyasını doğrudan yapıştırmaz.
2. Kullanıcı kuralın yayınlandığını bildirir. Yeni oyunun kodu daha sonra main'e alınır; henüz Firestore kuralı eskiyken yeni 75 soruluk kodu yayınlamak oda oluşturmayı reddettirir.
3. Tüm telefonlarda Güncelle yapılır ve yeni oda kurulur. Eski odalar yeni protokole çevrilmez; eski/yeni oyun sürümleri aynı odada karıştırılmaz.

Kural kaynağı: ci/firebase/firestore.rules. Tam dosya SHA-256: `c92fddeca70424eeb66b275c7629dda5a3ad27c3c11b6758e997924e81105a0f`. Yeni arena av2/roster/left ve 75 cevap sözleşmesi; oy-arena2 global tablosu eklendi. Haftalık süre/sürüm kuralları, hazır ad rezervasyonu, mevcut rütbeler ve hafta sınırı korundu.

## Çalıştırılamayan dosyalar

- ad-tests.cjs: Playwright Chromium eksik.
- adim1-tests.cjs: Playwright Chromium eksik.
- adim2-tests.cjs: Playwright Chromium eksik.
- adim3-tests.cjs: Playwright Chromium eksik.
- adim4-tests.cjs: Playwright Chromium eksik.
- adim5-tests.cjs: Playwright Chromium eksik.
- arkadas-ui-tests.cjs: Playwright Chromium eksik.
- dilara-tests.cjs: Playwright Chromium eksik.
- efekt-tests.cjs: Playwright Chromium eksik.
- er-meydani-neden-tests.cjs: Playwright Chromium eksik.
- ermeydani-ui-tests.cjs: Playwright Chromium eksik.
- geri-tests.cjs: Playwright Chromium eksik.
- giris-tests.cjs: Playwright Chromium eksik.
- hafta-kart-tests.cjs: Playwright Chromium eksik.
- haftalik-sure-tests.cjs: Playwright Chromium eksik.
- paket-ui-tests.cjs: Playwright Chromium eksik.
- rekor-entegrasyon-tests.cjs: Playwright Chromium eksik.
- rekor-ui-tests.cjs: Playwright Chromium eksik.
- ses-esleme-tests.cjs: Playwright Chromium eksik.
- sonuc-tests.cjs: Playwright Chromium eksik.
- spice-info-tests.cjs: Playwright Chromium eksik.
- telif-sakin-tests.cjs: Playwright Chromium eksik.
- ui-regression.cjs: Playwright Chromium eksik.
- yaris-ui-tests.cjs: Playwright Chromium eksik.
