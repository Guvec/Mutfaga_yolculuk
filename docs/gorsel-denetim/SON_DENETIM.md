# 108 soru ve 24 hedefli üçlü karşılaştırma

95 Mutfak Araçları ve 13 Bulaşık Yıkama–Atık Yönetimi sorusu güncellendi.
Kalıcı madde kimlikleri ve bölüm grupları korundu; seçeneklerle doğru cevap
harfleri birlikte güncellendi. Sayısal/alfabetik sıra korunur, olumsuz kök
vurgulanır. Eşdeğer maddeler aynı karma oturumda birlikte seçilmez.

Üçlü görseller 24 kartı kapsar. Önceki 19 tabak ve metal takım kartına fincan
tabağı, çay tabağı ve üç kâse kartı eklendi. Kullanıcının
Mutfak_Araclari-3(1).pdf dosyasındaki 5–6. sayfa fotoğrafları değişmeden
çıkarıldı; yerleşim SVG ile yapıldı. 10. kart Kahvaltılık kâse olarak
adlandırıldı. Kitap dosyası değiştirilmedi. Örnek boyutlar evrensel ürün
standardı değildir. Aileler arasındaki ölçek farkı düzeltildi.

Q75'in çukur tabak çeldiricisi değiştirildi. Q76 dört kaşığı ortak ölçekte
gösteriyor. Q84'te kutu/şerit rende yerine mevcut sarımsak ezici ve soyacak
fotoğrafları kullanılıyor. Öğrenci seçeneklerinde araç adı yazmıyor.
Kevgir, ayaklı süzgeç ve tel süzgeç adları tutarlılaştırıldı.

58. sorudaki 3–4 gün önerisi güvenli soğutma ve 4 °C veya altında saklama
koşullarına bağlıdır; ürüne özel daha kısa süre önceliklidir. 60. sorudaki
75 °C, seçilen Ordu İl Tarım ve Orman Müdürlüğü yayınının yeniden ısıtma
önerisidir; bütün gıdaların ilk pişirme sıcaklığı değildir. Kaynaklar
reviewSource alanında tutuldu; öğrenci açıklamalarına bağlantı eklenmedi.

## Geçen 10 hedefli kontrol

| Kontrol | Sonuç |
|---|---|
| reviewed-bank-tests | 108 kimlik/anahtar/görsel; sıralı seçenekler; 200 bilgi havuzu ve 100 karma oturumda eşdeğer madde seçimi |
| soru-denetim-tests | 50.400 görsel soru üretimi; her bilgi sorusunun 200 kez doğru cevap/fotoğraf eşlemesi |
| karsilastirma-tests | 24 hedef, üç nesne/tek üçgen; 12 kartın puanlaması; 18 ada erişim; yanıtların sayfa değişiminde korunması |
| yaris-model-tests | Tohum, kapsam, rövanş ve oyun kuralları |
| speech-tests | Geçti |
| adim1-tests | Geçti |
| ui-regression | Geçti |
| rekor-ui-tests | 40 tablo sınırı; kayıt/sıralama/Pekiştiriyorum; sorulmayan tekrar doğru sayılmıyor |
| yaris-ui-tests | Sahte bağlantıyla çoklu telefon, kapışma, sürüm, kapasite, yeniden gönderim ve güncel davet akışı |
| mobil-karsilastirma-tests | 320×568, 390×844, 1363×936 eşleştirmede taşma yok; telefon ad paneli sığıyor; 24 SVG yükleniyor; Q53/75/76/84 yatay taşmıyor |

Bağımsız denetçi ajan 108 veriyi ve eriştiği son ekran görüntülerini yeniden
inceledi; yeni somut içerik hatası bildirmedi. Resmî MEB onayı, kazanım/BEP
eşleştirmesi ve öğrenci verisine dayalı ölçme analizi yapılmadı. Fiziksel
telefon/Android uygulaması testi yapılmadı. Firestore kuralları değişmedi;
kural-emülatör testi tamamlanan kontrollerde sayılmadı: önceki deneme eksik
test bağımlılığı nedeniyle başlayamadı.

Dinamik çeldirici dışlamaları korundu; üçlü görselin varlığı bütün yarış
modlarının yakın aile ayrımını ölçtüğü anlamına gelmez. Balık, peynir ve
tereyağı gibi özel takım fotoğrafları bu pakette yenilenmedi.

## Yeniden üretim

Önce tools/apply-reviewed-bank.py, ardından tools/build-comparison-assets.py
ve tools/extend-comparisons.py çalıştırılır. Son komut kaynak PDF yolunu
argüman alır. Hazır veri ve SVG'ler depoda olduğu için uygulamayı çalıştırmak
için kaynak PDF gerekmez. Tarayıcı testleri Playwright/Chromium, DOM testleri
jsdom gerektirir.
