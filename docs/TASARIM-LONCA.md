# Mutfağa Yolculuk — onaylı ortak tasarım dili

16 Kasım 2026. Bu belge bu konudaki eski tasarım önerilerinin önündedir. Kullanıcı uygulama ve mevcut GitHub Pages adresinde yayın için açık yetki verdi.

## Korunacak görünüş

- Krem parşömen, lacivert, işlenmiş altın, turkuaz; sıcak ışık ve kahverengi temas gölgeleri. Renkli yapraklı kart kenarları kullanılmaz. İnce altın örgü/düğüm ve kıvrımlı, kartla bütünleşen isimlikler kullanılır.
- Üstte oyuncunun özgün profil portresi ve hazır adı; isim ve portre aynı profil parşömenini açar. Oyuncu kodu mevcut arkadaş kimliğinden gelir. Müzik, arkadaşlar ve ayarlar küçük yardımcı kontrollerdir.
- Kompakt rütbe şeridi mevcut dalın gerçek rütbesini, sıradaki basamağı ve ilerlemeyi kullanır. Puanlar, eşikler ve kayıt kimlikleri değişmez.
- Yolculuğum büyük ana karttır; başlığı küçük açık krem metin olarak görselin sol altına yerleşir. “Senin yolun, senin hikâyen.” sıcak altın-kremdir. Alttaki koyu geçiş okunurluğu destekler. Arkadan görünen erzak çantalı dost, orman, dağ ve üç yol ayrımı referanstır.
- Altında Aşçı Dostum / Ustalar Ligi; Sıralama / Rozetlerim sırasıyla eşit 2×2 kartlar. Ortak görsel alanı ve başlık taban çizgisi; aynı genişlikte nesne zorlaması yoktur. Panda kepi kart içinde kalır.
- Lig: mutfak araçlı arma. Sıralama: turkuaz taşlı oymalı altın kupa, krem taş kaide. Rozet menüsü: pasta, aşçı şapkası ve çırpma telli üç yuvarlak lonca rozeti. Bu dekoratif menü simgeleri yeni kazanım veya ödül kuralı değildir.

## Yazı, paneller ve erişim

- Hikâye yazısı / Sade yazı seçimi ve aynı metinli önizleme hatırlanır. Küçük bilgiler, soru ve seçenekler Lexend kullanır.
- Almendra Bold özgün dosyasında ğ/Ğ/İ/ş/Ş bulunmadığı dosya incelemesiyle görüldü. OFL kapsamında bu glifler eklendi; Reserved Font Name şartına uygun türev aile adı **Lonca Hikaye**. Özgün kaynak, lisans ve yeniden üretim betiği depodadır.
- Profil ve bilgi panelleri ortak krem parşömenle açılır; temiz yazı alanı, açık kapatma, Escape/cihaz geri, klavye odağı ve tek panel kuralı korunur.
- Bilgi düğmeleri 48×48 CSS px. Yardım tercihi yalnız otomatik açıklamayı etkiler; profil, hata ve gerekli işlemleri kapatmaz. İlk kısa yardım ekran ortasında kendiliğinden modal açmaz, ana sayfaya bağlıdır. Bilgi düğmeleri her zaman çalışır.
- Hareket azaltma ve sistem tercihi dekoratif hareketleri kapatır. Müzik ve sesli okuma ayrıdır. Büyük yazıda gerekirse kaydırma kullanılır.
- Lonca Gecesi ve Lonca Işığı mevcut tema dizisine eklendi. Kayıtlı tema tercihi korunur; yeni temalar seçilebilir. Ortak menü/panel stilleri mevcut işlevleri taşır.

## Bu uygulamanın kapsamı ve sınırları

Ana sayfa canlı HTML metinleri, düğmeler ve gerçek rütbe verisi kullanır. Onaylı tam ekran maket tek resim olarak uygulamaya konmadı. Yeni menü armaları ve yol sahnesi ayrı raster varlıklardır; çalışan Three.js sahnesi veya iskeletli karakter animasyonu değildir. Bu aşamada profil/ilerleme/çok oyunculu protokolü ve soru bankası değiştirilmedi.

Civciv ve ön plandaki dost mevcut oyun dosyalarındandır. Panda için arkadan yol sahnesi hazırlanmıştır. Diğer seçili dostlar için mevcut dala özel sahneler kullanılır; bütün dostların arkadan erzak çantalı sürümleri henüz üretilmedi. Panda kartında özgün fotoğraf arka planı halen vardır; üretilmiş yeni bir yüzle değiştirilmedi.

Ortak sistem bütün mevcut menülere temel görünüm sağlar. Her özel alt ekranın özgün 3B varlıklarla yeniden çizildiği veya bütün cihazlarda test edildiği iddia edilmez.

## Gerçekleştirilen kontroller

- 10 yeni lonca davranış kontrolü; 16 oda düzeltme, 12 davet/konu ve 8 çoklu oyun kontrolü geçti. Rütbe model testi geçti.
- Gerçek tarayıcıdaki 360×740 ve 390×844 iframe önizlemelerinde ana sayfa ve bilgi paneli görüntülendi. Dört kart ölçüleri kendi ekranında eşit; bilgi düğmeleri 48×48 ölçüldü. Fiziksel telefon veya ağ gecikmesi testi değildir.
- Eski profil testi değişiklik öncesi temiz 9052831 sürümünde de null/profil uyuşmazlığıyla başarısız. Eski state testi temiz sürümde de soru logu/tamamlanmamış soru sayısı aşamasında başarısız; bu turda o kod değiştirilmedi. Eski rutbe-dal tarayıcı betiği playwright paketi bulunmadığı için çalışmadı; yerine geçmiş test başarısı iddia edilmez.
- Service worker sürümü artırıldı. Yeni arayüz, font ve temel görseller çekirdek önbelleğe eklendi; derslerin tam çevrimdışı hazırlığı mevcut ayrı kullanıcı işlemi olarak kaldı.

Sonraki geliştirmelerde bu görünüşü koruyun; ekran düzenini veya nesne motiflerini tekrar tasarlamayın. Özel ekranın görsel incelemesini ve gerekli işlev kontrollerini ayrıca kaydedin.

## 16 Kasım — küçük başlık ve mobil düzen düzeltmesi

- Karşılaştırma temeli main `b1674530cd888a16229b45f59f1c7488b7a7f316`. En yeni kayıtlı `Mutfaga_Yolculuk_v3_21_3_Hata_Duzeltmeleri.zip` içindeki 18 kaynak/test dosyasından 17'si depoyla birebir aynı; service worker depoda daha yeni lonca önbelleğini içeriyor. ZIP'teki eski service worker geri alınmadı. Paket içindeki açıklama ve eski test sonuçları uygulama kaynağı değildir.
- `.lc-home` için eksik `display:grid` eklendi; tanımlı satırlar ve boşluklar artık etkin. Tek sütunun asgari genişliği sıfırlandı ve ana alan yatayda ortalandı.
- Yolculuğum başlığı normal yazı boyutunda 1.2–1.5rem aralığına indirildi; sol altta görsel içine yerleştirildi. Küçük ekranın eski büyük başlık kuralı kaldırıldı. Slogan ve sağ ok korundu; okunurluk geçişi görselin altına taşındı. Büyük yazı tercihi ölçeklenmeye devam eder.
- Yeni düğme gerektiren bir eksik bulunmadı. 13 ana sayfa kontrolü (profil, üç üst araç, yolculuk, dört kart ve dört bilgi düğmesi) gerçek uygulama betiklerini yükleyen JSDOM ortamında tıklanarak doğrulandı. Dokuz dostun 63 karakter/sahne/yol dosyası başvurusu mevcut.
- 10 lonca, 16 oda, 12 davet/konu ve 8 çoklu oyun kontrolü ile mevcut rütbe modeli testi geçti. Bunlar tarayıcı geometrisi veya canlı çok oyunculu ağ testi değildir.
- Bu turda yerel Chromium `socket() failed: Operation not permitted` nedeniyle açılamadı. Canlı site ayrı tarayıcıda kullanım koşulları ekranına açıldı; kabul verilmedi. Yerel önizleme bağlantısı reddedildi ve veri URL'si tarayıcı güvenlik ilkesi tarafından engellendi. Bu nedenle bu düzeltmenin 360×740, 390×844 ve masaüstündeki son görünüşü veya 48px dokunma ölçüleri bu turda ölçüldü sayılmaz. İlk yardım açıkken ve büyük yazıda kaydırma kullanılabilir.
- Service worker v178'e çıkarıldı; görseller dosya olarak korundu, Base64 dönüşümü yapılmadı. Soru bankası, kayıtlar, puanlar ve sunucu kuralları değiştirilmedi.
