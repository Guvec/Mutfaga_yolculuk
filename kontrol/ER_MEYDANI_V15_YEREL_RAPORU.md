# Er Meydanı v1.5 yerel değişiklik kaydı

6 Kasım 2026. Yerel uygulama kaydı; yayın durumu son bölümde belirtilir. Taban main 25c0a095b0af0a89d7ccc167a3e4c101298dc5ff. Kullanıcının son kapsamı: doğrudan link katılımı, bütün/tek konu, yedi yanlış, görünür sıralama/taç ve etkinlik sonrası yanlışların tekrarı. Kek oyunu bu işin kapsamında değil.

## Davranış

- Davet URL'si oda kurma menüsü yerine raceinvite akışını açar; kayıtlı kimlikle otomatik lobi katılımı. Geçersiz/dolu/silinmiş/çevrimdışı durumda aynı davette hata ve yeniden deneme. Eski çoklu kayıtta sadece mevcut profilden bir defalık seçim; yeni profil kartı yok. İptal/çıkış oda parametresini tüketir; diğer URL alanları korunur. Geç gelen yanıt iptal edilmiş daveti açmaz.
- Yeni arena4 odaları bütün konular veya tek araç/baharat/kuver/bulaşık konusu seçebilir. En çok 75 benzersiz soru; küçük havuzun gerçek sayısı kullanılır. Bütün konular round-robin paylaştırılır; eksik pay diğer konularla doldurulur. Soru üreticisinin mevcut çeldirici mantığı bu tur düzeltilmedi.
- Yeni arena4 odaları 7 yanlışta biter. Eski arena2 odalarının 4 yanlış ve 38+37 havuz sözleşmesi korunur; yeni oyun için yeni oda gerekir. av2 kayıt/kadro formatı sürer, içerik rev öneki arena4 eski istemciyi uyumsuzluk mesajıyla engeller.
- Oda kurulumunda/lobide/geri sayımda genel lider tablosu; sonuçta önce taç ve maç sıralaması, sonra genel sıralama, tekrar düğmesi ve kişisel rapor. Ana sayfada genel Er Meydanı liderleri ve birincilerde taç. Genel tablo kazanılan oyun sayısıdır; tek maçın kazananıyla karıştırılmaz.
- Kişi kendi denemesini bitirince geçici sıra görünür; kesin sıra/taç/ödül bütün kadronun sunucu onaylı kayıtları bitmeden üretilmez. UI talebi yüzünden ortak final güvenliği kaldırılmadı.
- Yalnız cevaplanmış yanlışlar (süre dolanlar dahil) sunucu onaylı final sonrası profil pid'sine bağlı arena_pek listesine alınır. Doğru cevap/görsel/seçenek/açıklama fotoğrafı ve soru metni saklanır. Görülmemiş sorular eklenmez; snapshot tekrarında çoğaltılmaz.
- Sonuçtaki Pekiştiriyorum veya konu Pekiştiriyorum menüsündeki Er Meydanı yanlışlarını çalış erişimiyle: önce doğru cevabı incele/dinle, sonra süresiz tekrar sorusu. Doğru listeden çıkar; yanlış kalır. Bu tur rütbe puanı/yarış sıralaması üretmez. Eski Pekiştiriyorum'un iki ayrı gün kuralından ayrı, açıkça etiketli bir arena tekrarıdır.

## Son ekler: 10 kişi, süre, gezinme ve menü

- Yeni arena4: 3–10 kişi; 20 saniyeyle başlar, her 6 doğruda 1 saniye azalır, alt sınır 7 saniye. Eski arena2/arena3 odaları önceki süre/kadro sözleşmelerini korur. Yeni özellik için yeni oda gerekir.
- Onuncu kişinin yüklenme kontrolü sunucu kuralına dahildir. Oda başlatmada 10 belge erişimi sınırı korunur. On birinci katılım reddedilir.
- Üst çubukta Ana sayfa: aktif çoklu oyunda mevcut çıkış/onay işlemiyle doğrudan home; bireysel yarım çalışmada mevcut vazgeçme/puan kaydı temizliği ve süre durdurma. Meydan Okuma durumu temizlenir.
- Kullanıcının son açık talebiyle Haftalık Mutfak Yarışması’nın iki ana sayfa girişi kaldırıldı. Kod/sonuç geçmişi/puanlar silinmedi; eski sonuç tabloları korunur. Haftalık görevler ayrı özelliktir.
- Oyun Odası canlı sıralaması kapalı açılır alan, race/duel/cv uzun açıklamaları Neden? alanı oldu. Ses ayarları üst çubuğa taşındı; müzik/okuma erişimi korunur. Oyun sırasında yinelenen alt çıkış düğmesi gizlendi; Geri ve Ana sayfa çıkış işlemlerini yürütür. Dar telefonda yanıt sonrası soru görseli 100px’e kadar küçülür; kırpılmaz.
- Onaylı “Çok hızlısın, minik şef! ⚡” mesajı üç hızlı ilk doğru yanıttan sonra, en sık45 saniyede bir gösterilir. Yanlış/süre dolması veya ikinci deneme övülmez. Yeni puan/ödül yok. Er Meydanı, Oyun Odası, Kapışma ve bireysel soru çözümünde ortak eşik kullanılır. Mesajı okumak için arena otomatik geçişi2,2 saniye; Sıradaki soru düğmesiyle beklemeden geçilebilir.

## Kontroller

9 test dosyasında toplam **134 kontrol geçti**: davet/kapsam12 + yedi yanlış/tekrar7 + eski arena akışı8 + diğer çoklu oyun8 + profil16 + ana sayfa6 + Firestore kural57 + SDK bağlantı11 + yeni on kişi/süre9. JavaScript sözdizimi ve git diff --check geçti.

Gerçek bulut tarayıcısında kaynak ekran üreticileriyle hazırlanan yalıtılmış test sayfasında **468 yerleşim kontrolü geçti**: dört oyun ekranı (Oyun Odası, Kapışma, Meydan Okuma, Er Meydanı), soru/yanlış/doğru durumları, 360×740 / 390×844 /1280×800; dört konudan 13 uzun/görselli temsilî soru. Seçenekler en az48px; sayfa yatay/dikey taşması yok. Bu, tüm soru tohumlarının, her cihazın veya uygulamanın bütün betik etkileşimlerinin canlı E2E onayı değildir. Açık Neden?/sıralama ayrıntısı veya büyük yazı ayarında doğal kaydırma korunur; içerik kesilmez. 12’li eşleştirme ve diğer bireysel ekranlar bu piksel denetiminin kapsamında değil; bütün oyunlar çözüldü iddiası yok. Fiziksel on telefonla oyun/hoparlör dinlemesi yapılmadı.

## Soru denetimi ayrı çıktı

108 hazır soru okundu; 9 fotoğraflı sorunun 36 seçenek görseli görüntülendi. 252 dinamik madde havuzu çıkarıldı; 100 tohumda25.200 yapısal soru örneği denetlendi. Kuver 26 seviye örneği/17 kimlik ve eski10 hedef üretimi incelendi. Yapısal geçiş iyi çeldirici demek değildir; öğrenci yanıt istatistiği yok. Soru içerik dosyalarında değişiklik yapılmadı.

Analiz raporu: https://chatgpt.com/library?file_id=libfile_fc4a06bb258481919bf75fafcc565502&account_id=personal

## Yayın kapısı

Kullanıcı yeni tam Firestore kuralını yayınladığını bildirmeden yeni konu/yedi yanlış/on kişi/süre sürümü main'e gönderilmez. Eski kural yeni arena4 oda oluşturmasını reddeder. Kaynak ci/firebase/firestore.rules; teslim firestore_er_meydani_v1_5.rules.
SHA-256: e10cc9a7b43d0ad0613d52aa951fae48f1662dd01356b7fd95de84f93da9438a.
APP_SURUM1.5 ve SW mesleki-oyunlar-v60-davet-konu-20261106 birlikte hazırlanmıştır; bu mevcut canlı sürümün değiştiği anlamına gelmez. Kullanıcı ayrıca gönderim/yayın istemedikçe dış işlem yapılmaz.

## Yayına hazırlık

Kullanıcı güncel Firestore kurallarını yayınladığını bildirdi. İstemci sürümü1.5/önbellek v62; değişiklikler main’e atomik tek commit olarak gönderilecek. Kaynak 6df81d4 üzerine hız övgüsü eklendi; ayrı davranış testi geçti. Önceki134 kontrole ek olarak etkilenen altı dosya kontrolü ve hız övgüsü sınırı yeniden çalıştırıldı. Canlı dağıtım teyidi gönderim sonrasında yapılır.
