# Mutfağa Yolculuk — onaylı ortak tasarım dili

16 Kasım 2026. Bu belge bu konudaki eski tasarım önerilerinin önündedir. Kullanıcı uygulama ve mevcut GitHub Pages adresinde yayın için açık yetki verdi.

## Korunacak görünüş

- Krem parşömen, lacivert, işlenmiş altın, turkuaz; sıcak ışık ve kahverengi temas gölgeleri. Renkli yapraklı kart kenarları kullanılmaz. İnce altın örgü/düğüm ve kıvrımlı, kartla bütünleşen isimlikler kullanılır.
- Üstte oyuncunun özgün profil portresi ve hazır adı; isim ve portre aynı profil parşömenini açar. Oyuncu kodu mevcut arkadaş kimliğinden gelir. Müzik, arkadaşlar ve ayarlar küçük yardımcı kontrollerdir.
- Kompakt rütbe şeridi mevcut dalın gerçek rütbesini, sıradaki basamağı ve ilerlemeyi kullanır. Puanlar, eşikler ve kayıt kimlikleri değişmez.
- Yolculuğum büyük ana karttır. Başlık büyük açık krem; “Senin yolun, senin hikâyen.” sıcak altın-kremdir. Koyu geçiş okunurluğu destekler. Arkadan görünen erzak çantalı dost, orman, dağ ve üç yol ayrımı referanstır.
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
