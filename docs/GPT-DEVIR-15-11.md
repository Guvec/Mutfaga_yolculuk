# İşin Mutfağına Yolculuk — devir belgesi ve gelişim planı (15.11.2026)

Bu belge oyunu devralan yapay zekâ (GPT) ve Ali Arıkoğlu için hazırlandı. Önce "Çalışma kuralları"nı oku. Sonra "Oyun ağacı", "Yeni menü yapısı", "Denetim bulguları" ve "İş listesi" sırasıyla ilerle.

## ★ GÜNCEL ANA YAPI VE SADELEŞTİRME KARARLARI (15.11.2026 11:05 — Ali onayladı)
Bu bölüm belgenin geri kalanıyla çelişirse **bu bölüm geçerlidir.** Amaç: daha sade ama mantıklı bir bütün. Ağaç budandı.

**A. Ağaç (budanmış hâli)**
- Kök: konular (Mutfak Araçları, Baharatlar, Yeterli ve Dengeli Beslenme, Pastacılık, Servant ve Kuver, Bulaşık ve Atık, Gastronomi Tarihi).
- Gövde: XP (Aşçı Seviyesi) + **"Bugün ne yapayım?"** (oyunun önerdiği sıradaki adım).
- Dallar: **tek harita**, 7 durak.
- Yapraklar: bölümler, Antrenman Şefi, maçlar.
- Meyve: kart yıldızları, tarifler (Servis Günü), unvanlar.

**B. Yalnız üç ilerleme ölçüsü** (öğrenci "neyi neden kazandım?" sorusunu kolay cevaplasın)
1. **XP** — ne kadar çalıştığını gösterir → Aşçı Seviyesi. Dal rütbeleri (Rütbe Yolu) XP'nin dala göre görünümüdür, ayrı puan değildir. Dost puanı XP'ye katılır (ayrı sayaç kalkar). Ekrandaki "Mutfak Puanı" adı da XP olur.
2. **Kart yıldızı (1–3)** — ne kadar bildiğini gösterir → Mutfağım ve duraklar. İtibar ayrı puan değildir: bir duraktaki kart yıldızlarının toplamıdır (durak ilerleme çubuğu).
3. **Lig puanı** — yalnız Kupa Ligi'nde, rekabet için.
- **Yıldız solması olumlu dille:** Öğrenilmiş bir kart hiçbir zaman 1 yıldızın altına düşmez ve "kaybettin" denmez; yalnız 2. ve 3. yıldız zamanla solar, kart "Tazele" işareti alır (ör. "Kimyonu tazeleyelim mi?"). Amaç aralıklı tekrar, ceza değil.

**C. Tek harita: "Ustalık Yolculuğum"**
- Hikâyenin ve haritanın adı **Ustalık Yolculuğum**. Dünya adı ayrıca kullanılmaz (gerekirse ileride).
- 7 durak = 7 konu: Araç Atölyesi · Baharat Çarşısı · Pazar ve Kiler (Beslenme) · Pastane · Restoran Salonu (Servant ve Kuver) · Bulaşıkhane · **Gastronomi Tarihçisi** (dünya haritası; aşağıda F).
- Durak = Mutfağım istasyonu: bir durağa girilince içinde **Bölümler** (eski konu başına Yolculuğum haritası), **Keşif kartları** (o durağın kartları ve yıldızları; ekranda "Baharat Çarşısı kartları" gibi), **Usta Sınavı** ve durak ilerleme çubuğu var. Ayrı istasyon ekranı, ayrı Gastronomi Haritası yok.
- Aynı anda tek "parlayan" görev; ekranda tek ana eylem.
- **Alt çubuk ve harita ilişkisi:** **Öğren** kapısı = Ustalık Yolculuğum haritası (7 durak). **Mutfağım** kapısı = **Kart dolabım** (bütün durakların keşif kartları tek yerde) + Tarif defteri + Servis Günü + Menüm + Aşçı Dostu. **Oyna** = yarış modları. **Ben** = Aşçı Kartı, rütbe, unvanlar, rekorlar, arkadaşlar, ayarlar. Ayrı "istasyon" ekranı yoktur; belgenin eski bölümlerinde "istasyon" geçen yerler "durak keşif kartları" diye okunur.

**D. Adlar (karışıklık giderildi)**
- Hikâye: **Ustalık Yolculuğum**.
- Yarış menüsü: **Oyna** kapısı ("Ustalar Ligi" adı kalkar).
- Ligler: **Ümit Ligi** (derecesiz, herkese açık) ve **Kupa Ligi** (dereceli; eski adı "Ustalık Ligi" kalkar). Lig basamakları: Bakır Kepçe, Gümüş Kepçe, Altın Kepçe, Elmas Kepçe, Şampiyon Kepçe (★N-12; rütbe adlarıyla çakışmasın diye).
- Unvanlar: Baharat Uzmanı, Kuver Ustası, Çorba Ustası, Gastronomi Tarihçisi…
- Tek ad sözlüğü (bölüm 4) geçerli: Tekrar, Çalışma geçmişim, Kılavuz, Karakterler, Mutfağıma al.

**E. "Bugün ne yapayım?"**
- Oyuna her girişte (ana sayfa açılırken) kısa bir kart olarak çıkar; ana sayfada da sürekli büyük bir düğmedir. Mevcut "Kaldığın yer" kartı bunun içine katılır.
- İçeriği oyun seçer, öncelik sırası: (1) solan kart varsa 2 dakikalık Antrenman ("Kimyon kartın soluyor"), (2) yarım kalan bölüm ("Kaldığın yer: Baharat Çarşısı · Bölüm 3"), (3) bir tarife eksik tek kart ("Mercimek Çorbası'na 1 kart kaldı"), (4) günlük görev, (5) "Bir maç oyna".
- Tek dokunuşla ilgili ekrana gider. Kart kapatılabilir; sakin modda hareketsiz.
- Ana sayfaya eklenmesi ana sayfa değişikliğidir: Ali'nin onayıyla yapılır (örnek ekran önce).

**F. Gastronomi Tarihçisi durağı (harita)**
- Bir dünya haritası; **Türkiye'den başlar.** Önce Türkiye'nin bölgeleri: her bölgede **coğrafi işaretli ürünler** (ör. Antep baklavası, Afyon kaymağı, Malatya kayısısı gibi) ve ünlü yemek-tatlılar; sonra mutfağıyla ünlü ülkeler ve onların dünyaca ünlü yemek ve tatlıları.
- Coğrafi işaret bilgisi yalnız resmî kayıttan (TÜRKPATENT coğrafi işaret veri tabanı) doğrulanarak yazılır; doğrulanmayan ürün eklenmez. Alkollü ürün yok.
- Her ürün = keşif kartı (bölüm 10.7'deki üç etiket: Biliniyor / Bir anlatıya göre / Adı nereden gelir?) + 1 soru. Bölge kartları toplanınca bölge açılır, harita bitince **Gastronomi Tarihçisi** unvanı. Er Meydanı'na gastronomi tarihinden 5 soru.
- Kartlar yazılmadan önce Ali'nin ~50 metni kaynakla ayrılır (zorunlu).

**G. Tek haftalık etkinlik: "Bu Hafta"**
- Her hafta tek tema döner: bir konu (ör. Baharat Haftası), bir mevsim (ör. Kış Çorbaları, Sonbahar Sofrası) ya da bir bölge (ör. Ege Mutfağı). O temadan XP iki katı.
- Hafta sonunda tek **Er Meydanı finali** (Haftanın Turnuvası bunun adıdır). Ayrı mevsim haftası, ayrı turnuva, ayrı bölge savaşı yok.

**H. Her menüde hareketli görseller (Matematik Canavarı gibi, ondan üst seviye)**
- Evet: **bütün menülerde** kart ve düğmeler hafifçe yüzer (sıra kaydırılmış), birincil düğmede ara sıra parıltı, basınca küçülüp yaylanma; durak ve mod simgeleri 3B ve canlı (hafif sallanma, ışık geçişi); Aşçı Dostu her menüde köşede canlı (bekliyor/sevinç/kutlama/düşünüyor).
- Soru ekranları **sakin** kalır: yalnız doğru-yanlış geri bildirimi hareket eder (dikkat dağılmasın).
- Sakin mod ve "hareketi azalt" ayarında hepsi durur; zayıf telefonda otomatik sade mod. Kurallar bölüm 8.2.

**I. Öğrenme yolları süreye bağlanmaz (kural)**
- Yolculuğum, Antrenman Şefi, Keşif kartları ve Usta Sınavı süresiz. Süre baskısı yalnız seçmeli yarış modlarında (Blitz, 1'e 1, Er Meydanı) vardır.

**J. İlk 10 dakika (yeni öğrenci akışı)**
- Karakter seç → Aşçı Dostu ile tanışma (1 cümle) → ilk durakta ilk bölüm → ilk kart ★ → 2 dakikalık ilk antrenman → "Bugün ne yapayım?" ile tanışma → isteğe bağlı ilk maç. Her adımda tek düğme.

**K. Ertelenenler (son faza)**
- Ekip baskını (Büyük Ziyafet) ve bölge savaşı: aynı anda çok kişinin çevrimiçi olmasını ve yeni Firestore kurallarını gerektirir; okul telefon/internet koşulu belirsiz.
- Zamanlı oyun (randevulu maç). (Telefon bildirimleri ertelemeden çıkarıldı: ★N-9.)
- Mutfak Ekibi (kalıcı takım) Kupa Ligi'nden sonra.
- Dev Sipariş kaldırıldı. Ayrı mevsim haftaları kaldırıldı (G'ye katıldı). Ayrı Gastronomi Haritası kaldırıldı (F'ye katıldı). Ayrı itibar puanı ve dost puanı kaldırıldı (B). Sezon şeridi kaldırıldı (★N-7).

**L. Servis Günü kapsamı**
- 3 onaylı tarifle başlar: Mercimek Çorbası, Sebzeli Omlet, Kek (miktarlar Ali'nin onaylı reçetelerinden). Diğer tarifler onaylandıkça eklenir.

**M. Güncel iş sırası — İKİ PARTİ (önceki iş listelerinin yerine; 15.11 son hâli, Ali onayladı)**
Kalite her zaman hızdan önce gelir: iş uzun sürebilir. Her adım bitince ekran görüntüsü + kısa rapor + Ali onayı; onay gelmeden sonraki adıma geçilmez.

*PARTİ 1 — Sağlam temel ve ilk tam dilim*
1. **Hız ve boyut (★N-1):** İlk açılış 5 MB'ın altına; görseller WebP ve küçültülmüş; yalnız açılan bölümün görselleri indirilir.
2. **Kod temeli (★N-2):** Tek ilerleme veri katmanı (XP, kart yıldızı, durak ilerlemesi, tanışma yolu); en az 10 çalışan duman testi; yeni modüllerde sarmalama yerine bu katman.
3. **Menü yapısı taslağı + tasarım örnekleri birlikte (★N-3, bölüm 8):** alt çubuk (Öğren · Oyna · Mutfağım · Ben), Oyna ekranının Matematik Canavarı düzeni (★N-8), 3 örnek ekran → Ali onayı.
4. **Onaylanan tasarım dilinin koda uygulanması** (ekran grubu grubu; ana sayfa en son, Ali onayıyla) + tek ad sözlüğü (Ustalar Ligi → Oyna; Mutfak Puanı → XP; dost puanı → XP/tanışma yolu).
5. **"Bugün ne yapayım?" + İlk 10 dakika.**
6. **Baharat Çarşısı tam dilimi (★N-4):** harita (yalnız bu durak açık, diğerleri "yakında"), bölümler, keşif kartları, yıldız (oyun gününe bağlı solma, ★N-5), Antrenman Şefi bağlantısı, Usta Sınavı, 1 tarifle 3 aşamalı Servis Günü (★N-6).
7. **Aşçı Dostum açma ekranı** (Valorant tarzı tanışma yolu; ★D altındaki plan).
8. **Telefon bildirimleri ve Arkadaşlarım ekranı (★N-9, ★N-10).** Firestore kuralı gerekirse tek dosya → Ali yayımlar → sonra gönderim.
9. **Öğrencilerle 2 haftalık deneme** (gerçek telefonlar, okul interneti); bulgulara göre düzeltme. Parti 2 bu deneme bitmeden başlamaz.

*PARTİ 2 — Genişleme*
10. Diğer 5 durak (Araç Atölyesi, Pazar ve Kiler, Pastane, Restoran Salonu, Bulaşıkhane) Baharat Çarşısı kalıbıyla; yeni soru tipleri (10.3) konu konu.
11. Servis Günü'nün 3 tarifle tamamı; aşamalar denemeye göre 3'ten yukarı çıkarılabilir.
12. Gastronomi Tarihçisi durağı (7. durak; önce ~50 metnin kaynakla ayrılması, sonra TÜRKPATENT'ten doğrulanmış coğrafi işaretli ürünler, sonra dünya).
13. "Bu Hafta" etkinliği ve Er Meydanı finali.
14. Kupa Ligi — haftalık lig turu biçiminde (★N-11), yeni basamak adlarıyla (★N-12); usta-çırak; uzmanlık seçimi.
15. Matematik Canavarı uyarlamalarından kalanlar (bölüm 9) ve ertelenenler (K).

**N. 15.11 son eleştiri ve kararlar (Claude'un mobil oyun geliştirici gözüyle incelemesi; Ali hepsini onayladı)**
1. **Hız ve boyut:** Bugün sw.js 555 görseli (≈54 MB) ilk girişte önbelleğe alıyor; okulda mobil veriyle ve eski telefonda ilk açılış uzun sürer veya yarıda kalır. Hedef: ilk açılış < 5 MB; görseller WebP ve ekrandaki boyuta küçültülmüş; durak/bölüm görselleri ilk açıldığında indirilip sonra çevrimdışı saklanır; hareketli menüler eklenince de bu bütçe korunur. Ölçüt: 360×640, yavaş 4G benzetiminde ana sayfa 3 sn içinde açılır.
2. **Kod temeli:** Bugün 11 dosya genel fonksiyonları üst üste sarıyor; 62 testin çoğu eski ekranlara göre ya da jsdom gerektiriyor. Önce: tek ilerleme veri katmanı (ör. js/ilerleme.js; XP, kart yıldızı, durak, tanışma yolu tek yerde; okuma/yazma tek fonksiyonla) ve Playwright ile en az 10 duman testi (açılış, ana sayfa, bir bölüm, Antrenman, maç sonu, Aşçı Dostum, ayarlar, çevrimdışı açılış, sayfa hatası 0, yatay taşma 0). Yeni özellikler bu katmanı kullanır; eski sarmalamalar fırsat buldukça sadeleşir.
3. **Önce yapı, sonra görünüş:** Menü yapısı (alt çubuk, kapılar, Oyna düzeni) tasarım örnekleriyle birlikte onaylanır; görsel dil yapı kesinleşmeden bütün ekranlara uygulanmaz (aksi hâlde iş iki kez yapılır).
4. **Dikey dilim:** Önce yalnız Baharat Çarşısı baştan sona biter ve öğrencilerle denenir; işe yarıyorsa diğer duraklara kopyalanır.
5. **Yıldız solması oyun gününe bağlı:** Solma takvim gününe değil, öğrencinin oynadığı gün sayısına göre (ör. 7 ve 21 oyun günü). Tatilde ve oynanmayan günlerde hiçbir kart solmaz. 1 yıldız kuralı (★B) geçerli.
6. **Servis Günü ilk sürüm 3 aşama:** malzeme ve baharat seç → adımları sırala → kuveri kur. Bir oturum 5–7 dakikayı geçmez. Diğer aşamalar (menü dengesi, araç, servis sırası, bulaşık) denemeden sonra eklenir.
7. **Sezon şeridi kaldırıldı:** Ekranda en çok üç ilerleme çubuğu olur (durak ilerlemesi, Aşçı Seviyesi/rütbe, tanışma yolu). Günlük görevler "Bugün ne yapayım?" içindedir; ayrı ana sayfa kartı yoktur.
8. **Oyna ekranı Matematik Canavarı düzeninde (Ali beğendi):** en üstte büyük **Hızlı Şef** kartı ("Sana uygun odaya girersin"; MC'deki "Hemen Oyna"nın karşılığı) → iki büyük karo **Oda Kur** (mod seçimi burada: 1'e 1, 2'ye 2, Blitz, Er Meydanı) ve **Kodla Gir** → **Açık odalar** + **Yenile** düğmesi; boşsa "Şu an açık oda yok. Hızlı Şef ile ilk odayı sen aç!" → altta **Yarış Geçmişim** ve **Nasıl oynanır?** → **Antrenman Şefi** ayrı bir kart olarak (çevrimiçi değil). Bugünkü 2×2 mod karoları Oda Kur'un içine taşınır. Bu, Ali'nin örnek ekran görüntüsündeki sadeliği hedefler; bizim tasarım dilimizle ve daha üst kalitede yapılır.
9. **Telefon bildirimleri (ertelemeden çıkarıldı, Ali istedi):** Arkadaşlarım ekranında **"🔔 Bildirimleri aç"** düğmesi ve altında açıklama: "Uygulama kapalıyken bir arkadaşın seni kapışmaya çağırırsa telefonuna haber gelir." Altyapı Matematik Canavarı'ndaki gibi ücretsiz Cloudflare Worker + web bildirimi; kurulum adımları önce Ali'ye yazılır, Ali kendi hesabında kurar. Kurallar: bildirim yalnız oyun içi olay için (kapışma daveti, rövanş, arkadaşlık isteği); bildirimde gerçek ad yok, oyun adı var; sessiz saatler (21.00–08.00 ve ders saatlerinde bildirim gönderilmez; okul saatleri ayardan); tek dokunuşla kapatılır; reklam/hatırlatma bildirimi yok. Abonelik bilgisi için Firestore kuralı gerekirse tek kural dosyası → Ali yayımlar → sonra gönderim.
10. **Arkadaşlarım ekranı (MC örneği):** üstte Takımım kartı (Mutfak Ekibi gelince; o zamana kadar gizli) → Bildirimleri aç → **Senin oyuncu kodun** (büyük harflerle, **Kopyala** ve **Paylaş**; "Bu kodu arkadaşına ver. O seni eklesin, sen kabul et.") → arkadaşın kodunu ekleme alanı → arkadaş listesi (çevrimiçi noktası, "Çağır", aranızdaki skor). Alt çubuk düğmesi kırmızı rozetle arkadaşlık isteğini gösterir. Bu ekran "Ben" kapısının içindedir. Alt çubuktaki son öğe sayfa içeriğini örtmemeli (ekran görüntüsünde arkadaş kodu alanı alt çubuğun altında kalmış; bizde alt boşluk zorunlu).
11. **Kupa Ligi canlı eşleşmeye bağlanmaz:** Bir okulda aynı anda çevrimiçi oyuncu az; lig "haftalık lig turu" olur: herkes hafta içinde istediği zaman aynı soru setini bir kez çözer, hafta sonunda tablo ve basamak değişimi çıkar (hayalet maçı değildir; aynı sınava farklı saatte girmek gibidir). Canlı modlarda eksik yerleri Antrenman Şefi botu doldurur (bot maçında XP var, lig puanı yok). Basamak düşmesi en çok bir basamak ve "koruma" haftası ile; listelerde sonuncular gösterilmez.
12. **Lig basamaklarının adı değişti (rütbe adlarıyla çakışıyordu):** Rütbe Yolu adları (Stajyer, Çırak, Aşçı Yardımcısı, Aşçı, Usta) kalır. Kupa Ligi basamakları: **Bakır Kepçe · Gümüş Kepçe · Altın Kepçe · Elmas Kepçe · Şampiyon Kepçe** (her biri 3 kademe). Rozetler önce örnekle Ali'ye sunulur.
13. **Yayın yolu ve geri dönüş:** GPT her teslimi ayrı paket olarak verir (değişen dosyalar + sürüm numarası + kısa değişiklik listesi). GitHub'a yükleme yalnız Ali "Gönder" deyince. Her sürümden önce bir önceki sürümün paketi saklanır; sorun çıkarsa o paket geri yüklenir. sw.js CACHE adı her sürümde değişir.
14. **Gerçek telefon denemesi:** Her sürüm öğrencilere açılmadan önce en az 1 eski Android telefonda ve okul internetinde denenir (açılış süresi, ses, kaydırma, çevrimdışı açılış).

## 0. Çalışma kuralları (değişmez)
- Hedef kitle: 14–17 yaş; hafif düzeyde zihinsel yetersizliği olan, bir kısmı otizm spektrumunda meslek lisesi öğrencileri. Dil: doğal Türkiye Türkçesi, yaşa saygılı, çocuksu değil.
- Kimlik: eğitim odaklı **mobil rekabetçi oyun**. Rekabet bilgiyle kazanılır. "Sınıf yarışı" çerçevesi yok.
- Yasaklar: para ve satın alma yok · alkol yok (metin ve görsel) · serbest yazışma yok (yalnız hazır mesaj ve emoji) · kişisel veri toplanmaz · ahşap ve plastik eşya önerilmez (BPA içermeyen silikon spatula ve atık yağ bidonu hariç) · temizlikte çamaşır suyu yok (beyaz sirke, karbonat, limon tuzu) · yangın ve gaz kaçağında öğrenci müdahale etmez, uzaklaşır ve öğretmene haber verir.
- Sorular: üçüncü şahıs, kural dili, kısa ve somut kök, dört seçenek (A–D), çeldiriciler aynı aileden ve gerçek yanılgılardan.
- İş sırası: plan → Ali'nin onayı → değişiklik. Ali "Gönder" demeden GitHub'a gönderme yok. Firestore kuralı değişirse tek dosya verilir; Ali yayımlar, sonra gönderilir.
- Yapılmayan denetim yapılmış gibi yazılmaz. Rekabetsiz yollar (Yolculuğum, Antrenman Şefi, Ümit Ligi) her zaman açık kalır. Listelerde sonuncular gösterilmez.

## 1. Teknik özet
- Depo: Guvec/Mutfaga_yolculuk (main), canlı: guvec.github.io/Mutfaga_yolculuk. Saf JavaScript PWA; derleme yok.
- Yükleme düzeni: index.html sırayla js/*.js dosyalarını yükler. Çoğu modül genel fonksiyonları sarmalar (render, yrMenuHTML, answer vb.); sonra yüklenen dosya dıştadır. index.html sonundaki sıra: seviye → mac-devam → ayarlar → blitz → sonuc-ekrani → lig-menu → antrenman → er-meydani-sade → sade-ekranlar → oyuncu-cikar → ust-cubuk.
- Her sürümde: sw.js içindeki CACHE adı (şu an v173), js/telif.js APP_SURUM (3.21.x), js/platform.js 14. satır VERSION metni güncellenir; yeni dosyalar sw.js CORE listesine eklenir.
- Çevrimiçi kısım: Firebase Firestore (ci/firebase/firestore.rules). Odalar "oyunOdalari", sıralamalar "rk…". Kural testi: tests/oyuncu-cikar-rules-tests.cjs ve tests/er-meydani-giris-tests.cjs (emülatör; GitHub Actions test-rekor-er dalında çalışır).
- Arayüz testi: tests/blitz-ui-tests.cjs (Playwright, sahte bağlantı, 4 telefon). Eski arayüz testlerinin çoğu ekranlar değiştiği için güncellenmeli; tests/helpers/hazir.cjs ilk açılış pencerelerini atlar.
- Yerel deneme: `python3 -m http.server` + Playwright, 360×640 ve 390×844 telefon, 1280×800 bilgisayar.

## 2. Oyun ağacı — her iş bir yere bağlanır
Oyun bir ağaç gibi kurulur. Her yaprak (etkinlik) gövdeyi besler ve meyve verir.

| Ağaç | Oyundaki karşılığı |
|---|---|
| Kök | Mesleki bilgi: Mutfak Araçları, Baharatlar, Yeterli ve Dengeli Beslenme, Bulaşık ve Atık, Servant ve Kuver, Pastacılık, reçeteler |
| Gövde | Aşçı Seviyesi (XP) ve Aşçı Pasaportu (profil) |
| Dallar | Üç meslek dalı: Sıcak Mutfak, Pastacılık, Servis — her dalda Rütbe Yolu |
| Yapraklar | Etkinlikler: Yolculuğum bölümleri, Antrenman Şefi, maçlar, günlük görevler |
| Meyve | Mutfağım (malzeme kartları → tarif → menü), lig kupaları, unvanlar |

**Bağlantı kuralı (her etkinlik için zorunlu):** Her etkinlik bitince üç çıktı verir:
1. **XP** → Aşçı Seviyesi (Kupa Ligi'nin kapısı).
2. **Kart ustalığı** → Mutfağım'daki ilgili malzeme kartlarının yıldızı.
3. **Yanlışlar** → Tekrar listesi (Antrenman Şefi bunlardan soru seçer).

| Etkinlik | XP | Kart | Yanlış → Tekrar | Açtığı şey |
|---|---|---|---|---|
| Yolculuğum bölümü | ✓ (en çok) | Kartı açar (gri → renkli) | ✓ | Sonraki bölüm, dal rütbesi |
| Antrenman Şefi | ✓ | Yıldız tazeler | Kapatır | Üst zorluk |
| 1'e 1, 2'ye 2, Blitz, Er Meydanı | ✓ | Yıldız tazeler | ✓ | Rövanş, görev |
| Günlük görev ("Bugün ne yapayım?" içinde) | ✓ bonus | — | — | — |
| Tarif pişirme (Mutfağım) | ✓ | Tarif kartı | — | Menü, unvan |
| Kupa Ligi | lig puanı | — | ✓ | Basamak, kupa |

## 3. Malzeme Dolabı → önerilen biçim: "Mutfağım"
Gemini'nin Metin2 tarzı "topla-üret-güçlen" önerisi rekabete güç kattığı için alınmadı. Bilgi yerine oynama süresini ödüllendirir. Yerine şu kurgu öneriliyor; yarışta avantaj vermez, yalnız prestij ve görünüş verir:

- **Malzeme kartları:** Her öğrenme maddesi bir karttır: araç, baharat kavanozu, besin, temizlik malzemesi, kuver parçası. Yolculuğum'da öğrenilince kart açılır (gri silüet → renkli).
- **Ustalık yıldızı (1–3):** Antrenman ve maçlarda doğru bilinen kart yıldız kazanır. Yıldız zamanla yavaşça solar (ör. 7 ve 21 gün). Soluklaşan kart "Tazele" işareti alır. Bu, aralıklı tekrarın oyun hâlidir; öğrenciyi doğal olarak tekrara çağırır.
- **Keşif kartları / Kart dolabım** (★C: her konu bir durak; kartlar o durağın içindedir, Mutfağım'da Kart dolabım hepsini toplar). Kart bölmeleri: Hazırlık tezgâhı (Mutfak Araçları), Baharat rafı (Baharatlar — mevcut kutular buraya bağlanır), Kiler (Beslenme), Bulaşık istasyonu (Bulaşık ve Atık), Servis masası (Servant ve Kuver), Pasta tezgâhı (Pastacılık).
- **Tarif defteri:** Her tarif gerekli kartları listeler (ör. Mercimek Çorbası: kırmızı mercimek, soğan, havuç, kimyon, tencere, kepçe, el blenderi). Gerekli kartların hepsi en az 1 yıldızdaysa tarif "pişirilir". Pişirme, adım sıralama mini oyunudur. Biten tarif "Menüm"e girer; Aşçı Dostu servis eder.
- **Ödül:** unvan ("Çorba Ustası"), tezgâh süsü, Aşçı Dostu kıyafeti. Rekabette güç, can ya da süre avantajı yok.
- **Veri:** telefonda (localStorage) profil başına `kv_mutfagim`: `{kart:{id:{acik:t, yildiz:0-3, son:t}}, tarif:{id:t}}`. Kart kimliği içerik maddesinin kimliğidir. Firestore gerekmez.

## 4. Yeni menü yapısı (bilgi mimarisi)
Bugün aynı yere birden çok yoldan gidiliyor: Aşçılık Atölyesi, Mutfak Kitabım ve dal pencereleri aynı konuları gösteriyor. Ayrıca Haftalık Mutfak Yarışması Ustalar Ligi'nin dışında duruyor ve dört farklı "tekrar" adı var. Öneri: alt çubukta 4 kapı.

1. **Öğren** — Yolculuğum (dallar → konular → bölümler); konu sayfası tek düzen: Yolculuğum · Kartları incele · Sorular. Aşçılık Atölyesi ve Mutfak Kitabım buraya katılır.
2. **Oyna** — ★N-8 düzeni: Hızlı Şef, Oda Kur (modlar içinde), Kodla Gir, açık odalar + Yenile, Yarış Geçmişim, Nasıl oynanır?, Antrenman Şefi, Kupa Ligi. Haftalık Mutfak Yarışması burada "Bu Hafta" Er Meydanı finali olur.
3. **Mutfağım** — Kart dolabım (bütün keşif kartları), tarif defteri, Servis Günü, Menüm, Aşçı Dostum (karakter, kıyafet, "Lezzet tattır").
4. **Ben** — Profil, Aşçı Seviyesi, Rütbe Yolu, rozetler, Rekorlarım, Sıralama, arkadaşlar, Ayarlar.

Ana sayfa: "Bugün ne yapayım?" (Kaldığın yer ve günlük görevler bunun içinde; ★E) + 4 kapı. Ana sayfanın görsel düzeni Ali'nin onayıyla değişir.

**Tek ad sözlüğü (her kavram için tek ad):**
- "Yanlışlarımı çalış", "Pekiştiriyorum", "Tekrar", "Pekiştir" → **Tekrar**.
- "Skorlarım" ve "Çalışma geçmişim" → **Çalışma geçmişim**.
- "Uygulama kılavuzu" ve "Kılavuz" → **Kılavuz**.
- "Dostlar" → **Karakterler**; "Dostum olsun" → **Mutfağıma al** (yapıldı).
- **15.11 ad kararları (Ali onayladı):** **Aşçı Dostu / Aşçı Dostum** adı KALIR (değiştirilmez). "Dostlar" sekmesi → **Karakterler**; "Dostuna lezzet tattır / Dostuma sun" → **Lezzet tattır** (oyunda yapıldı); "durak rafı" → **Keşif kartları** (durak içinde); Mutfağım'daki toplu koleksiyon → **Kart dolabım**. "Dost" sözcüğü ekran metninde yalnız "Aşçı Dostu/Aşçı Dostum" adında geçer; "dostlar, dostum olsun, dostuma sun" gibi kullanımlar olmaz.
- **Aşçı Dostum ekranı ve yeni karakter açma — Valorant ajan sözleşmesi gibi (15.11; Claude'un incelemesi ve önerisi; önce örnek ekran, Ali onayıyla kod):**
  - *Bugün olan (360×640 ve 390×844'te açılıp ekran görüntüsüyle kontrol edildi; pakette `asci-dostum-acma-ekrani-bugun.png`):* Kilitli karaktere dokununca büyük kilitli görsel, "Açmak için 0 / 50 dost puanı" çubuğu, "Hedefim olsun" düğmesi ve tek cümlelik açıklama çıkıyor; puan dolunca "🔓 Kilidi aç". Bilgi var ama Valorant'taki gibi ilk bakışta anlaşılmıyor.
  - *Sorunlar:* (1) Karakter ızgarası büyük görselin ve iki panelin altında kalıyor; kaç karakter açık, kaç kilitli görmek için kaydırmak gerekiyor. (2) Kilitli kart açık karttan zor ayrılıyor (yalnız küçük "🔒 Kilitli" yazısı). (3) Hedef ve ilerlemesi yalnız o karaktere dokununca görünüyor. (4) Puanın nereden geldiği tek cümle; somut değil (kodda: her biten oyun 5 + doğru oranına göre 0–5; açma 50). (5) "Lezzet tattır" kilitli karakter seçiliyken de görünüyor. (6) Üstteki profil çipinde oyuncu adı "Aşçı Tavşan", ama Tavşan karakteri kilitli; öğrenci "Ben tavşanım, neden kilitli?" diye karışabilir — çip yalnız Aşçı Dostu'nun görseliyle gösterilmeli ya da oyuncu adı ile karakter ayrı yazılmalı.
  - *Önerilen düzen (tek ekran, 360×640'ta kaydırmasız):*
    1. **Başlık:** "Aşçı Dostum" + sağda "4 / 12 açık".
    2. **Hedef şeridi** (hedef varsa hep üstte): hedef karakterin küçük görseli · "Tanışma yolu 30 / 50" çubuğu · somut tahmin ("Yaklaşık 3 oyun kaldı") · dokununca karakter kartı açılır. Hedef yoksa: "Yeni bir Aşçı Dostu seç, onunla tanışmaya başla" ve kilitli kartlar hafifçe parlar.
    3. **Izgara (3 sütun, küçük kartlar):** açık kart renkli; seçili (mutfağındaki) altın çerçeveli; kilitli kart soluk renkte ve ortada büyük kilit rozetiyle; hedef kartın altında mini çubuk; puanı dolan kartta parlayan "Tanış!" rozeti. Gölge veya siluet görseli kullanılmaz.
    4. **Karakter kartı (alttan açılan pencere):** büyük canlı görsel + karakterin tek cümlelik tanıtımı (sesli okunur, ör. "Ben Penguen. Servis masası benden sorulur."). *Açık karakter:* "Mutfağıma al" ve "Lezzet tattır". *Kilitli karakter:* **Tanışma yolu** — 5 basamak (10 · 20 · 30 · 40 · 50); ara basamaklarda küçük görünüş ödülleri (selam pozu, önlük rengi, şapka süsü, rozet), son basamakta karakter açılır; altında "Hedefim olsun" (hedefse "🎯 Hedefim ✓"); altında **"Nasıl ilerler?"** üç satır: bölüm bitirmek · Antrenman Şefi · maçlar (değerler koddaki gerçek değerlerden yazılır).
    5. **Tanışma anı:** puan dolunca tam ekran kısa kutlama (karakter dönerek gelir, konfeti, tanıtım cümlesi; sakin modda durağan görsel + cümle) → "Mutfağıma al" / "Şimdilik kalsın".
  - *Kurallar (Valorant'tan alınan ve uyarlanan):* Aynı anda tek hedef (bilişsel yük az). Hedef değiştirilince eski hedefin ilerlemesi **kaybolmaz**, geri dönünce kaldığı yerden sürer (Valorant'taki gibi; öğrenci "emeğim gitti" duygusu yaşamaz). Sıra öğrencinin seçimi; karakterler sabit sırada açılmaz. Kilitli karakter önizlemede tam renkli görülebilir (merak uyandırır); yalnız ızgarada soluk durur. Dil kayıp değil yakınlık dilidir: "Tanışmana 20 puan kaldı". Rekabette hiçbir avantaj yok; yalnız görünüş.
  - *Puan birliği (★B ile uyum):* Dost puanı ayrı para olarak kalmaz; hedef seçildikten sonra kazanılan **XP** tanışma yolunu doldurur (ekranda "Tanışma yolu 30 / 50" yazar, ölçek XP'ye göre ayarlanır). **Geçiş:** öğrencilerin bugünkü dost puanı silinmez; ilk açılışta mevcut hedefin tanışma yoluna aktarılır.
  - *Bağlantılar:* Ana sayfadaki Aşçı Dostum kartında hedef mini çubuğu; maç ve bölüm sonundaki "Bu iş neye yaradı?" şeridinde "Penguen'le tanışmana 8 puan yaklaştın".
  - *İş sırası:* M-2 (dost puanının XP'ye katılması) ile birlikte. Önce 390×844 örnek ekran görseli (ızgara + hedef şeridi + kilitli karakter kartı + tanışma anı) → Ali onayı → kod. Veri telefonda (localStorage); Firestore gerekmez.
- **Yazı tipi kararı (15.11):** Norway kullanılmaz (yalnız büyük harf, ücretsiz sürümde Türkçe harf yok, ticari lisans gerekir). Başlık/logo için Türkçe harfleri (ç ğ ı İ ö ş ü) tam olan, açık lisanslı (OFL) bir başlık yazı tipi önerilir ve ğ, ş, İ ile denenip Ali'ye örnekle sunulur; soru, seçenek ve açıklama metinleri sade, okunaklı yazı tipinde kalır; büyük harfle uzun metin yazılmaz.

## 5. Denetim bulguları (15.11, 360×640, ana sayfa hariç)
1. **İki farklı tasarım dili:** Dal pencereleri (Sıcak Mutfak, Pastacılık, Servis), Aşçılık Atölyesi, Lezzetleri Keşfet, Günlük Görevler, Servant ve Kuver, Mutfak Kitabım ekranın ortasında yüzen krem panellerle açılıyor; diğerleri tek satır üst çubukla. Hepsi tek düzene (üst çubuk + tam sayfa) geçmeli.
2. **Tekrar eden giriş yolları:** Aşçılık Atölyesi ana sayfadaki dal düğmelerini, Mutfak Kitabım dal konularını tekrarlıyor.
3. **Ligin dışında yarışma:** "Haftalık Mutfak Yarışması" (5 konu, 145 soru, 15 yanlış) Oyna kapısının dışında, ayrı ekranda.
4. **Boş durumlar zayıf:** Yanlışlarım ekranında yalnız "Geri dön" düğmesi var, açıklama yok; Pekiştiriyorum, Çalışma geçmişi ve Rekorlarım düz metin. Her boş durumda ne yapılacağını söyleyen bir cümle ve tek düğme olmalı.
5. **Konu sayfaları farklı:** Kuver'de "Kuveri Kur, Adını Bul, Pekiştiriyorum"; diğerlerinde "Yolculuğum, Kartları tanı, Çoktan Seçmeli". Tek düzen olmalı.
6. **Baharat Rafı başlığı** koyu yeşil ve farklı bir şerit kullanıyor; diğer başlıklarla aynı olmalı.
7. **Aşçı Dostum:** Lezzet karoları, "Diğer besinler", "Tekrar izle", "Lezzetleri Keşfet" ve "Görünüm ve Hareketler" aynı ekranda; kalabalık. Mutfağım'a taşınınca sekmelere ayrılmalı.
8. **Hesabım** 849 px (1,3 ekran), **Kılavuz** 658 px; ikisi de tek ekrana indirilebilir.
9. **Ayarlar penceresi** 821 px; kendi içinde kayıyor. Grup başlıkları küçültülebilir.
10. **Rütbe Yolu** sekmeleri (Sıcak Mutfak / Pastacılık / Servis) ile ana sayfa dal renkleri farklı.
11. **Odalar:** Yeni düzen kuruldu (Hızlı Şef, mod karoları, Kodun var mı?); ★N-8'e göre MC düzenine geçecek. Gerçek telefonlarla denenmeli.

## 6. İş listesi (ESKİ — geçerli sıra ★M'deki iki partidir; aşağıdaki maddeler yalnız ayrıntı ve kabul ölçütü için okunur)
Her maddede: dosya, yapılacak, kabul ölçütü. Her madde ayrı onay ister.

1. **Tek tasarım dili:** Yüzen panelli ekranlar (yolpenceresi, ascilikatolyesi, mutfakkitabi, market, gunlukgorevler, servantkuver; kodu bulmak için: grep "st.screen==='<ad>'" js/*.js) üst çubuk + tam sayfa düzenine geçer. Ölçüt: 360×640'ta kaydırmasız, yatay taşma yok, hepsinde aynı başlık yapısı.
2. **Alt çubuk ve 4 kapı:** Öğren, Oyna, Mutfağım, Ben. Ölçüt: her ekrandan en çok 2 dokunuşla 4 kapıya ulaşılır; eski yollar yönlendirilir, hiçbir içerik kaybolmaz.
3. **Tek ad sözlüğü:** Bütün metinlerde (js/*.js) uygulanır. Ölçüt: eski adlar hiçbir ekranda görünmez.
4. **Mutfağım v1:** Kart dolabım + durak keşif kartları + yıldız (solma dahil); Yolculuğum ve Antrenman bağlantısı. Ölçüt: bir bölüm bitince kartlar açılır, Antrenman doğrusu yıldız verir, 7 gün sonra yıldız solar.
5. **Antrenman Şefi zayıf konular:** Tekrar listesinden ve solan kartlardan soru seçer (js/antrenman.js antBasla). Ölçüt: tekrar listesi boş değilse sorular en az yarı yarıya oradan gelir.
6. **Günlük görevler** "Bugün ne yapayım?" içinde (★E; ayrı ana sayfa kartı yok); görev türleri: Yolculuğum'da 1 bölüm, Antrenman'da 8 doğru, 1 maç. Ölçüt: gece yarısı yenilenir; kaçırınca ceza yok.
7. **Bu Hafta finali:** Haftalık Mutfak Yarışması (js/haftalik.js, js/kaptan.js) Oyna kapısına "Bu Hafta" finali olarak taşınır.
8. **Tarif defteri ve pişirme mini oyunu** (Mutfağım v2): ilk 3 tarif (★L): Mercimek Çorbası, Sebzeli Omlet, Kek. Reçete miktarları onaylı kaynaktan; uydurulmaz.
9. **Kupa Ligi:** Mutfağa Kabul Sınavı, haftalık lig turu (★N-11), lig basamakları (★N-12), sezon. Sezon şeridi yok (★N-7).
10. **Mutfak Ekibi** (3–5 kişi), hazır tepkiler, joker seçimi, MVP ekranı.
11. **İçerik:** baharat kutu 5–7, beslenme ~250 soru, reçete sıralama.
12. **Eski testlerin güncellenmesi** ve son denetim.

## 7. GPT görsel komutları (tek seferde üretim; yapıştırmaya hazır)
Ortak kurallar (her komutun başına eklenir): Türkçe yazılar büyük ve okunaklı; insan, el, silüet, marka, logo yok; alkol, kadeh, sigara yok; tanınmış film/oyun karakterlerine benzemesin; hepsini tek seferde ver, arada onay bekleme.

### 7.1 Alt çubuk simgeleri (4)
```
Mutfak temalı bir mobil eğitim oyununun alt gezinti çubuğu için 4 simge üret. 512x512, saydam zemin, aynı stil: yumuşak 3B, hafif parlak, sıcak renkler, kalın sade biçim, küçük boyda da okunur.
1. Öğren: açık bir yemek kitabı, üstünde küçük bir şef şapkası.
2. Oyna: çapraz duran çelik kepçe ve çelik spatula, arkasında küçük altın yıldız.
3. Mutfağım: içinde kavanozlar olan küçük çelik raf ve bir tencere.
4. Ben: altın kenarlı rozet, ortasında şef şapkası.
Yazı yok.
```

### 7.2 Durak görselleri (6; Gastronomi Tarihçisi durağı için ayrıca harita görseli)
```
Bir mutfak eğitim oyununun "Ustalık Yolculuğum" haritasındaki ilk 6 durak için iç mekân görseli üret (7. durak Gastronomi Tarihçisi için ayrıca harita görseli istenir). 1600x900 yatay, aynı kamera açısı (hafif yukarıdan), aynı sıcak ışık, 3B animasyon filmi kalitesi, profesyonel çelik mutfak. İnsan ve hayvan yok, yazı yok.
1. Hazırlık tezgâhı: çelik tezgâh, bıçak seti çelik tutucuda, çelik kaseler, rende, çırpma teli.
2. Baharat rafı: duvarda cam kavanozlu baharat rafı, kavanozlarda kırmızı pul biber, kimyon, nane, karabiber, sumak.
3. Kiler: raflarda bakliyat kavanozları, sebze sepeti (çelik tel sepet), süt ve yoğurt cam şişelerde.
4. Bulaşık istasyonu: endüstriyel bulaşık makinesi, çelik eviye, beyaz sirke ve karbonat kapları, temiz tabak rafı.
5. Servis masası: beyaz örtülü masa, tabldot kuveri (tabak, çatal, bıçak, kaşık, su bardağı, peçete), şık çelik servis arabası.
6. Pasta tezgâhı: mermer tezgâh, çelik mikser, pasta servis küreği, krema torbası, süslenmiş pasta.
Ahşap ve plastik eşya yok (yalnız silikon spatula olabilir).
```

### 7.3 Malzeme kartı çerçevesi (stil örneği)
```
Bir mobil oyunda toplanan "malzeme kartı" için çerçeve tasarımı üret: 3 sürüm (gri kilitli, açık, 3 yıldız ustalık). 600x800 dikey, yuvarlak köşeli kart, üstte görsel alanı (boş, beyaz), altta isim şeridi (boş), sağ üstte 3 yıldız yuvası. Renkler: lacivert (#14234a), altın (#c99a2e), krem (#fbf7ee). Yazı yok.
```

### 7.4 Diğer bekleyenler
- Aşçı Dostum tepki pozları, 7 yeni karakter, arayüz örnek ekranları: claude/gpt-komutlari-14-11-canlilik.md (proje dosyası).
- 24 lezzet görseli: Ali'de; "Şefe sun" etkileşimi bunlarla yapılacak.
- Kupa Ligi basamak rozetleri (Bakır, Gümüş, Altın, Elmas, Şampiyon Kepçe; her biri 3 kademe; ★N-12): Parti 2'de, önce örnekle.

## 8. Tek tasarım dili ve hareketli arayüz (Ali'nin 15.11 isteği — EN ÖNCE YAPILACAK İŞLERDEN)
Sorun: Her menü farklı tonda; oyun "birçok oyun bir arada" gibi görünüyor. Hedef: tek, modern, üst düzey, 3B görsel dil; ana sayfa ve menüler canlı ve hareketli. Örnek: Ali'nin Matematik Canavarı oyunu (github.com/digerpchesabim-stack/matematikcanavari) — ana sayfa düğmeleri ve maskot sürekli hafifçe hareket eder; maskotun durum görselleri ayrıdır (mc-idle, mc-happy, mc-cheer, mc-look, mc-wait.webp); ekran geçişleri perspektifli kayar.

**8.1 Tasarım sistemi (önce bu, sonra kod):**
- Tek tema adı: "Mutfak Atölyesi". Renk belirteçleri (CSS değişkeni): mürekkep lacivert #14234a, altın vurgu #c99a2e, krem zemin #fbf7ee, kart beyaz, doğru yeşil, yanlış kiremit; her konu için yalnız simgede kullanılan tek bir konu rengi. Kullanıcının seçtiği tema (lavanta vb.) yalnız zemin ve vurgu tonunu değiştirir; yapı aynı kalır.
- Yazı: tek aile (şu an kullanılan yuvarlak sans-serif), 3 boy (başlık, gövde, küçük), 2 kalınlık.
- Bileşenler: üst çubuk, birincil düğme (ekranda tek), kart düğme (görsel + başlık + alt yazı), liste satırı, alt pencere, rozet/çip, boş durum. Hepsi bir CSS dosyasında (ör. css/tasarim-sistemi.css); eski ekran CSS'leri bunları kullanacak biçimde sadeleşir.
- Görsel dil: bütün simgeler ve kart görselleri aynı 3B stil (aynı ışık yönü, aynı kamera açısı, aynı malzeme parlaklığı, aynı renk paleti), saydam zemin WebP.

**8.2 Hareket kuralları:**
- Ana sayfa ve menü kartları: sıra kaydırılmış (her kart 0,2 sn arayla) 2,4–2,8 sn'lik yumuşak yüzme (translateY −4…−8 px); birincil düğmede ara sıra parlama geçişi; basınca küçülme (scale .96) ve bırakınca yaylanma.
- Panda (ve her Aşçı Dostu): tek resim yerine durum görselleri — bekliyor (nefes alır gibi yüzme), dokununca sevinç, doğru cevapta kutlama, yanlışta "birlikte bakalım", beklerken etrafa bakma; durumlar arasında kısa geçiş.
- Ekran geçişi: perspektifli kayma (0,25 sn). Ödül anlarında konfeti/parıltı.
- Yalnız transform ve opacity ile; ekran dışı animasyonlar durur. Sakin mod ve işletim sisteminin "hareketi azalt" ayarında hareketler kapanır (OSB'li öğrenciler için zorunlu).

**8.3 Uygulama sırası:** (1) tasarım sistemi belgesi + örnek 3 ekran görseli → Ali onayı; (2) GPT görsel paketi (simgeler, kart görselleri, panda durumları); (3) css/tasarim-sistemi.css + hareket; (4) ekran ekran geçiş (ana sayfa Ali'nin onayıyla en son).

**8.4 GPT görsel komutu — tek stil 3B simge paketi:**
```
Mutfak temalı mobil eğitim oyunu için TEK STİLDE 3B simge paketi üret. Hepsini tek seferde ver; arada onay bekleme.
STİL: yumuşak 3B oyun simgesi (mobil oyun kalitesi), soldan üstten tek sıcak ışık, hafif parlak malzeme, kalın sade biçim, aynı kamera açısı (hafif üstten 3/4), saydam zemin, 1024x1024, nesne ortada ve aynı ölçekte. Renk paleti: lacivert #14234a, altın #c99a2e, krem #fbf7ee, çelik gümüş; konuya göre tek vurgu rengi. Yazı, logo, marka, insan, el yok. Ahşap ve plastik görünüm yok (çelik, cam, seramik, silikon olabilir).
SİMGELER: 1 Öğren (açık yemek kitabı + küçük şef şapkası) · 2 Oyna (çapraz çelik kepçe ve spatula + altın yıldız) · 3 Mutfağım (kavanozlu çelik raf + tencere) · 4 Ben (altın kenarlı rozet + şef şapkası) · 5 Sıcak Mutfak (buharı tüten çelik tencere) · 6 Pastacılık (dilimli çilekli pasta, pasta servis küreği) · 7 Servis (beyaz tabak + çatal bıçak + peçete) · 8 Mutfak Araçları (çırpma teli, kepçe, rende) · 9 Baharatlar (3 cam baharat kavanozu) · 10 Beslenme (dengeli tabak: sebze, protein, tahıl) · 11 Bulaşık ve Atık (temiz tabak yığını + su damlası) · 12 Kuver (tabldot kuveri, üstten) · 13 Hızlı Şef (şimşek + şef şapkası) · 14 1'e 1 (iki çelik kepçe karşılıklı) · 15 2'ye 2 (iki şef şapkası yan yana, iki renk) · 16 Blitz (kum saati + şimşek) · 17 Er Meydanı (küçük arena, bayraklar) · 18 Antrenman Şefi (sevimli robot aşçı) · 19 Sıralama (altın kupa) · 20 Ayarlar (çelik dişli) · 21 Arkadaşlar (iki şef şapkası ve kalp) · 22 Görevler (pano ve tik) · 23 Rozet (altın madalya) · 24 Tekrar (dairesel ok + kitap).
```

**8.5 ZORUNLU KURAL — örnek olmadan toplu tasarım yok:** GPT hiçbir ekranı toplu olarak yeniden tasarlamaz. Sıra her zaman: (a) 3 örnek ekran görseli + hareket tarifi → (b) Ali onayı → (c) yalnız onaylanan örneğe göre kod → (d) her ekran grubundan sonra ekran görüntüsüyle yeniden onay. Onaylanmayan örnek koda dökülmez.

**8.6 Üst düzey tasarım için GPT'ye verilecek komutlar (sırayla; her biri ayrı mesaj):**
Gerekirse GPT kendi ajan/araç kipini (kod çalıştırma, görsel üretim, tarayıcı) kullanır ve işi alt görevlere böler: tasarım sistemi, görsel üretim, kod, test. Her alt görevin sonunda ekran görüntüsü ve kısa rapor ister.

1. **Tasarım dili araştırması:**
```
Mobil rekabetçi eğitim oyunları için üst düzey bir görsel dil öner. Önce kısa bir "moodboard" tarifi yaz (renk, malzeme, ışık, köşe yuvarlaklığı, gölge, yazı, hareket). Hedef: 14–17 yaş, mutfak teması, çocuksu değil, premium mobil oyun hissi (kabartmalı 3B kartlar, yumuşak gölgeler, canlı ama göz yormayan renkler). Ekteki devir belgesinin 8. bölümüne uy. Kod yazma; yalnız öneri ve 3 seçenek (A/B/C) sun.
```
2. **Örnek ekranlar (onay için):**
```
Seçtiğim tasarım dili ile 3 telefon ekranı görseli üret (390x844, dikey, tek seferde): 1) Oyna (★N-8 düzeni: büyük Hızlı Şef kartı, Oda Kur ve Kodla Gir karoları, Açık odalar + Yenile, Yarış Geçmişim, Nasıl oynanır?, Antrenman Şefi, alt çubuk), 2) Mutfak Araçları konu sayfası (Yolculuğum, Kartları incele, Sorular; alt çubuk), 3) Maç sonu (kazanan kartı, sıralama, Rövanş iste). Türkçe yazılar okunaklı; insan, el, marka, alkol yok; Aşçı Dostu panda görünebilir. Her ekranın altına hareket tarifi yaz (hangi öğe nasıl ve kaç saniyede hareket eder). Kod yazma.
```
3. **Hareket kılavuzu:**
```
Onayladığım örnekler için hareket kılavuzu yaz: kart yüzmesi, düğme basma/bırakma, birincil düğme parıltısı, ekran geçişleri, ödül anı (konfeti, rozet dönmesi), Aşçı Dostu durumları ve geçişleri. Her biri için süre, eğri (easing), gecikme, tekrar ve "sakin mod"da ne olacağı. Yalnız transform ve opacity. Sonra bunları css/tasarim-sistemi.css içine CSS değişkenleri ve sınıflar olarak yaz; bir örnek sayfada (docs/ornek.html) hepsini göster.
```
4. **Simge ve görsel paketi:** 8.4 komutu + claude/gpt-komutlari-14-11-canlilik.md içindeki Aşçı Dostu poz komutu (aynı stil).
5. **Ekran geçişi (grup grup):**
```
Onaylı tasarım sistemine göre şu ekran grubunu geçir: [grup adı]. Yalnız CSS sınıflarını ve gerekli HTML yapısını değiştir; oyun kurallarına ve verilere dokunma. 360x640 ve 390x844'te ekran görüntüsü ver; yatay taşma ve kaydırma olmasın; sakin modda hareket kapalı olsun. Değişen dosyaları listele.
```
Ekran grupları sırası: Oyna ve maç ekranları → konu sayfaları ve Yolculuğum → soru ekranları → Mutfağım → Ben (kart, rütbe, ayarlar) → ana sayfa (en son, Ali onayıyla).

## 9. Matematik Canavarı'ndan (sürüm 67) uyarlanacaklar
Kaynak: github.com/digerpchesabim-stack/matematikcanavari — CLAUDE.md (pakette MC-REFERANS-CLAUDE.md olarak var). Aynı öğretmenin oyunu; teknik çözümleri denenmiş. Kopyalanmaz, mutfak oyununa uyarlanır ve geliştirilir.

| # | MC'de | Bizde şu an | Uyarlama ve geliştirme | Öncelik |
|---|---|---|---|---|
| 1 | Alt çubuk: Oyna · Arkadaşlar · Kartım · Ayarlar | Yok | 4 kapı: Öğren · Oyna · Mutfağım · Ben (Arkadaşlar ve Kartım "Ben"in içinde, arkadaş isteği kırmızı rozetle alt çubukta) | 1 |
| 2 | Kabartmalı 3B tasarım sistemi; tek dosyada renk belirteçleri; düğmede alt kenar gölgesi + basınca inme; 3 tema | Her menü farklı ton | Bölüm 8: tek tema "Mutfak Atölyesi"; kabartma kuralı aynen; temalar yalnız ton değiştirir | 1 |
| 3 | Canlı maskot (durum görselleri; zayıf telefonda hazır pozlar); karşılama sahnesi; dokununca tepki | Panda tek resim | Aşçı Dostu durum görselleri (bekliyor, sevinç, kutlama, düşünüyor); dokununca tepki + ses; ana sayfada hafif yüzme | 1 |
| 4 | Sade mod: "hareketi azalt" ayarı, düşük bellek (deviceMemory ≤1) veya ≤2 çekirdekte efektler kapanır | Sakin mod elle | Sakin mod + otomatik sade mod birlikte | 1 |
| 5 | Ekran geçişleri (ileri kayma, geri kayma, oyun ekranlarında solma) | Yok | Aynısı; oyun ve soru ekranlarında yalnız solma | 2 |
| 6 | Online Oyna (★N-8: Hemen Oyna → Hızlı Şef, Oda Kur, Kodla Gir, Açık odalar + Yenile, Yarış Geçmişim, Nasıl çalışır?): açık odalar listesi, 🔄 Yenile, seviyeye göre sıra, 🔒 şifreli, kişi sayısı, renkli konu karesi, Hemen Oyna | Var (Hızlı Şef, açık odalar, Kodun var mı) | Liste her zaman canlı yerine 20 sn önbellek + Yenile (Firestore okuma tasarrufu); konu renk karesi; oda kartında kurucunun rütbe rozeti | 2 |
| 7 | Rütbesi çok farklı oyuncuların odaları listede görünmez | Yok | Kupa Ligi'nde zorunlu; Ümit Ligi'nde yalnız Hızlı Şef eşleşmesinde yakın düzey önceliği | 3 |
| 8 | Botlar: kimse gelmezse "Botla oyna"; kurucu boş yerlere bot ekler; gerçek oyuncu gelince bot yer açar; bota karşı rütbe puanı yok | Antrenman Şefi tek başına | Odalarda "Şef ekle" (Antrenman Şefi botu): 2'ye 2 ve Er Meydanı eksik kişiyle başlayabilir; bot maçında XP var, lig puanı yok | 2 |
| 9 | Takım odası: Kırmızı/Mavi takımı oyuncu seçer, dolu takıma girilemez, başlarken eşitlenir, eksik yer botla dolar; Takım 2'ye 2 … 5'e 5 | 2'ye 2 kura ile | Takım seçimi (🔥 Ateş / 🌿 Fesleğen), 2'ye 2–4'e 4, eksik yere Şef botu | 2 |
| 10 | Herkes Tek: en hızlı doğru 3, ikinci 2, üçüncü 1 puan | Blitz (her doğru 1, son 20 sn 2) | Blitz'e "hız sırası" puanı eklenmez (bilgi önce); yalnız eşitlik bozucu olarak kalır | — (alınmadı) |
| 11 | Takımım: kalıcı takım (≤4), takım adı listeden, kaptan, galibiyet/mağlubiyet, takım kapışması, Takım Oyuncusu madalyası | Yok | Parti 2 sonrası "Mutfak Ekibi" bu yapıyla: ekip adı hazır listeden (yazı yok), kaptan, haftalık ekip puanı | 3 |
| 12 | Karakter Kartı: büyük rozet, rütbe, madalyalar, 6 istatistik, oyuncu kodu, paylaşılabilir PNG | Hesabım + Rütbe ayrı | "Ben" kapısında Aşçı Kartı: Aşçı Dostu, seviye, rütbe, rozetler, 6 istatistik, oyuncu kodu; paylaşım PNG (kişisel veri yok) | 2 |
| 13 | Madalyalar bronz/gümüş/altın; adil oyun: aynı rakiple günde en çok 5 puanlı maç, yarıdan önce çıkan rakip sayılmaz | Rozetler var, adil oyun sınırı yok | Aynı rakiple günlük sınır ve erken çıkış kuralı Kupa Ligi'ne | 3 |
| 14 | Davete cevap: Kabul et / Meşgulüm / Daha sonra; gönderen "gördü" bilgisini görür | Davet var, cevap seçenekleri yok | Aynı üç cevap; "Daha sonra" → Zamanlı Oyun | 3 |
| 15 | Zamanlı Oyun (randevu, 15–60 dk sonra) + 5 dk kala hatırlatma | Yok | Okul saatine uygun: teneffüs için 15/30 dk randevu | 4 |
| 16 | Herkesi çağır (çevrimiçi arkadaşlara toplu davet) + hazır mesajlar ve emoji (yazı yok) | Hazır mesaj kararı var, uygulanmadı | Aynısı; mutfak temalı hazır mesajlar ("Hazırım şef!", "Rövanş?") | 3 |
| 17 | Web bildirimleri (Cloudflare Worker, ücretsiz) | Yok | ★N-9 (Parti 1, 8. adım; Ali beğendi). Ali'nin Cloudflare hesabıyla; önce Ali'ye kurulum adımları verilir | 4 |
| 18 | Başlangıç kartı: zirve ve ilk hedef, 5 sn sayım, düdük; birini geçince alkış kartı | Er Meydanı'nda hedef rakip var | Bütün maçlara aynı giriş kartı (iki ad, VS, sayım, düdük) | 2 |
| 19 | Arkadaş profili: aranızdaki skor, son maçlar, çağır | Yok | "Ben → Arkadaşlar"da arkadaş kartı + aranızdaki skor | 3 |
| 20 | Telefon geri tuşu = uygulama içi geri; çıkışta soru | Kısmen | NAV geçmiş tamponu yaklaşımı denetlenip uygulanır | 2 |
| 21 | Okuma tasarrufu (Firestore günlük 50 bin okuma): sıralama 2 dk önbellek, arkadaş durumu 2 dk | Kısmen | Bütün listelere önbellek | 2 |
| 22 | Her yeni özellikte kılavuz metni güncellenir | Kılavuz eski | Kılavuz yeni menüye göre baştan; kural olarak her sürümde güncellenir | 2 |

Not: MC'de 1'e 1'de hız her telefonda yerel ölçülür (adil hız karşılaştırması); bizde de aynı. MC'nin "hepsi hız motorunda" kararı bizde alınmadı: Er Meydanı ve Yolculuk bilgi önceliklidir.

## 10. Claude'un geliştirme önerileri — her konunun bir amacı olsun
Sorun: Baharat, Mutfak Araçları, Beslenme, Kuver, Servant, Bulaşık ve Pastacılık ayrı oyunlar gibi; öğrenilen bilgi başka yerde işe yaramıyor. Çözüm: hepsi tek bir mesleki zincirin halkası olur ve **Servis Günü**nde birleşir.

**10.1 Mesleki zincir (atölyedeki gerçek iş sırası):**
Menü planla (Beslenme) → malzeme ve baharat seç (Baharatlar, Kiler) → doğru araçları hazırla (Mutfak Araçları) → pişir (Sıcak Mutfak / Pastacılık: reçete adımları) → servise hazırla (Servant ve Kuver) → servis et → temizle ve atığı ayır (Bulaşık ve Atık).

| Konu | Öğrenince ne kazanılır | Nerede işe yarar |
|---|---|---|
| Baharatlar | Baharat kavanozu kartı (Kart dolabım → Baharat kartları) | Tariflerde gerekli; doğru baharatı bilmeden tarif pişmez (ör. mercimek çorbası: kimyon, pul biber; kek: tarçın, vanilin) |
| Mutfak Araçları | Araç kartı (Hazırlık tezgâhı) | Pişirme adımlarında "hangi araçla?" sorusu; araç kartı yoksa adım kilitli |
| Yeterli ve Dengeli Beslenme | Besin kartı (Kiler) + tabak dengesi bilgisi | Servis Günü'nde menü kurarken dengeli tabak puanı; Pastacılık'ta tatlının menüdeki yeri |
| Pastacılık | Pasta tarifleri (Pasta tezgâhı) | Servis Günü'nün tatlı aşaması; baharat (tarçın, vanilin, kakao) ve araç (çırpma teli, silikon spatula, sıkma torbası) kartlarını kullanır |
| Servant ve Kuver | Kuver türü kartı (Servis masası) | Pişen yemeği servis etmek için doğru kuver: çorba → çorba kaşığı, tatlı → tatlı kuveri |
| Bulaşık ve Atık | Temizlik kartı (Bulaşıkhane kartları) | Servis Günü'nün son aşaması: hijyen yıldızı; atık ayırma |

Not: Tariflerin malzeme, baharat, miktar ve adımları yalnız Ali'nin onaylı reçetelerinden alınır; tablodaki baharat örnekleri yalnız örnektir, uydurma reçete yazılmaz.

**10.2 Servis Günü (yeni ana mod — ağacın meyvesi):**
- Haftada bir yeni "sipariş": ör. "4 kişilik öğle menüsü: çorba, ana yemek, tatlı".
- Aşamalar: 1) menüyü dengeli kur (beslenme), 2) malzeme ve baharatları raftan seç, 3) araçları seç, 4) reçete adımlarını sırala, 5) kuveri kur, 6) servis sırası (servant), 7) bulaşık ve atık.
- Her aşama bir mini soru tipi; hepsinde öğrencinin Mutfağım kartları kullanılır. Kartı olmayan malzeme "önce Yolculuğum'da öğren" bağlantısıyla kilitli görünür (amaç verir).
- Sonuç: müşteri memnuniyeti 1–3 yıldız; Aşçı Dostu servis eder; tarif "Menüm"e girer.
- Tek başına ya da 2'ye 2 takım (ekip mutfağı: biri pişirir, biri servis kurar). Yarış avantajı yok; XP ve unvan var.

**10.3 Soru tipleri (Ali beğendi; konuya göre ayrıntılı)**
Ortak ilkeler: her tipin tek kart düzeni (görsel üstte, kısa kök, en çok 4 seçenek, alt sabit düğme); sürükleme gereken her yerde "dokun-yerleştir" seçeneği de olur (ince motor güçlüğü); her tipin Öğreniyorum (ipuçlu, destekli) ve Uyguluyorum (bağımsız) kipi; cevaptan sonra doğru cevap + bir cümlelik "Neden?"; kök üçüncü şahıs ve kural dili.

| Tip | Ne yapılır | Mutfak Araçları | Baharatlar | Beslenme | Pastacılık | Kuver / Servant | Bulaşık ve Atık |
|---|---|---|---|---|---|---|---|
| Görsel seç / Ad seç | Görsel ↔ ad | ✓ | ✓ | besin | malzeme | parça adı | malzeme |
| İşlev eşleştir | Araç/ürün ↔ ne işe yarar | "Hangi iş için hangi araç?" | "Bu yemeğe hangi baharat?" | besin ↔ besin grubu | araç ↔ adım | parça ↔ kullanım | ürün ↔ temizlik işi |
| Boy/sıra diz | Büyükten küçüğe, önce-sonra | tabak, tencere boyları | — | porsiyon | — | kuver kurma sırası | — |
| Adım sıralama | Adımları sırala | — | — | — | reçete adımları | servis sırası | makine çalıştırma |
| Eksik olanı bul | Setteki eksik | takımdaki eksik araç | tarifteki eksik baharat | tabaktaki eksik grup | tarifteki eksik malzeme | kuverdeki eksik parça | temizlik sırasındaki eksik adım |
| Hatayı bul | Görselde yanlış olan | yanlış işte kullanılan araç | yanlış rafa konan kavanoz | dengesiz tabak | yanlış araçla yapılan adım | yanlış yerdeki bıçak | yanlış kutuya atılan atık |
| Ayır (kategori) | Kutulara dağıt | kesme/karıştırma/ölçme | tohum/yaprak/kabuk/kök | besin grupları | kuru/yaş malzeme | servis/hazırlık | geri dönüşüm/organik/atık yağ |
| Benzerini ayırt et | İki benzer öğeden doğrusu | kepçe ↔ süzgeçli kepçe | kimyon ↔ çörek otu | — | vanilin ↔ pudra şekeri | tatlı ↔ yemek kaşığı | — |
| Tabak doldur | Dengeli tabak kur | — | — | ✓ | tatlının menüdeki yeri | — | — |
| Durum (vaka) | Kısa atölye durumu, ne yapılmalı? | güvenli kullanım | — | — | — | — | kırık cam, kaygan zemin (öğrenci uzaklaşır, öğretmene haber verir) |
| Vaka zinciri | Aynı durumda 3–4 bağlı soru: kavram → neden → sonuç → uygulama | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hızlı doğru/yanlış | Blitz ve ısınma | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Servis Günü aşamaları bu tiplerden kurulur: menü → Tabak doldur; malzeme ve baharat → İşlev eşleştir + Eksik olanı bul; araçlar → İşlev eşleştir; pişirme → Adım sıralama; kuver → Yerleştir + Hatayı bul; servis → Adım sıralama; bulaşık → Ayır + Adım sıralama.
Yazım: her yeni soru "olcme-degerlendirme-uzmani" ölçütleriyle denetlenir (tek doğru, aynı aileden çeldirici, ipucu cevabı vermez); görselli tiplerde görsel metinle birebir uyar.

**10.4 Modlar ve menüler:**
- **Öğren:** Yolculuğum (her konuda aynı harita), Kartları incele, Tekrar.
- **Oyna:** Hızlı Şef, 1'e 1, 2'ye 2, Blitz, Er Meydanı, Antrenman Şefi, Bu Hafta finali, (Kupa Ligi).
- **Mutfağım:** Kart dolabım, Tarif defteri, **Servis Günü**, Menüm, Aşçı Dostu.
- **Ben:** Aşçı Kartı, Rütbe Yolu (dal başına), rozetler, rekorlar, arkadaşlar, ayarlar.
- **Rütbe atlama sınavı:** her dalda rütbe yükselirken kısa "usta sınavı" (o dalın konularından karışık 10 soru); geçince tören ekranı.

**10.5 Bağlantıların görünür olması:**
- Her etkinlik sonunda "Bu iş neye yaradı?" şeridi: "+3 XP · Kimyon kartı ★★ · Mercimek Çorbası tarifine 1 adım kaldı".
- Konu sayfalarında "Bu konu şu tariflerde işe yarar" satırı.
- Mutfağım'da kilitli tarife dokununca eksik kartlar ve onları öğreteceği bölümlere tek dokunuşla geçiş.

**10.6 Hikâye ve dünya (MMORPG, Valorant, Battlefield'dan uyarlama)**
İlke: Bu oyunlardan "anlam, görev, rol ve ekip" alınır; "süre harcayarak güçlenme", para ve şans alınmaz. Her ilerleme kapısı bilgidir.

*Dünya (MMORPG haritası; ★C: ayrı dünya adı kullanılmaz, harita "Ustalık Yolculuğum" adını taşır):* Her konu yolculuğun bir durağıdır: Baharat Çarşısı (Baharatlar), Araç Atölyesi (Mutfak Araçları), Pazar ve Kiler (Beslenme), Pastane (Pastacılık), Restoran Salonu (Kuver, Servant), Bulaşıkhane (Bulaşık ve Atık). Öğrenci dünyaya stajyer olarak gelir. Haritada bir anda yalnız bir "parlayan görev" vurgulanır (bilişsel yük az, OSB için öngörülebilir).

*Görev verenler (NPC):* İnsan görseli kuralı gereği hepsi hayvan aşçı karakterler: ör. Baharat Çarşısı'nda Attar Baykuş, Pastane'de Pastacı Kirpi, Salon'da Garson Penguen, Atölye'de Usta Ayı. Kısa, sesli okunan görev metni: "Çarşıya yeni kimyon geldi. Kimyonu tanıyıp rafa koyar mısın?"

*Toplama (gathering) = hatırlama çalışması:* Baharat toplama, Çarşı'da kısa soru turudur; doğru bilinen baharat kavanoza girer (Mutfağım kartı). Rastgele düşme, saatlerce toplama yok; günlük toplama sınırı ve mola hatırlatması var. Toplanan her kart Servis Günü'nde kullanılır (10.1).

*Üretim (crafting) = tarif pişirme* (10.2); *meslek = dal* (Sıcak Mutfak, Pastacılık, Servis); *yetenek ağacı = Rütbe Yolu + konu ustalıkları* (ör. "Bıçak Ustası", "Baharat Uzmanı" unvanı; yalnız görünüş ve prestij).

*Durak ilerlemesi (para yerine; ★B: ayrı itibar puanı yok, durağın kart yıldızlarının toplamıdır):* Her durakta ilerleme çubuğu. Çubuk yeni görevleri, tezgâh süslerini ve Aşçı Dostu kıyafetlerini açar.

*Hikâye kampanyası — adı "Ustalık Yolculuğum" (Ali'nin kararı; mevcut "Yolculuğum" öğrenme haritası bu hikâyenin içine katılır):* Her sezon bir bölüm (4 hafta). Kısa ara sahneler (2–3 görsel + sesli okunan 1–2 cümle; atlanabilir). Sezon sonunda büyük açılış: öğrencinin restoranı açılır, Menüm sergilenir.

*(ERTELENDİ — ★K)* *Ekip baskını (raid) — "Büyük Ziyafet":* 4 kişilik Mutfak Ekibi büyük bir siparişi birlikte tamamlar. Her üyenin rolü var (Valorant'taki rol mantığı): Sıcak Mutfak (pişirme adımları), Pastacı (tatlı), Servis (kuver ve servis sırası), Hijyen (bulaşık ve atık). Herkes kendi rolünün sorularını cevaplar; ekip ilerleme çubuğu birlikte dolar. Kaybeden yok; yıldız sayısı değişir. Rol, ekipte herkesin gerekli olduğunu öğretir.

*(ERTELENDİ — ★K)* *Bölge savaşı (Battlefield'ın Conquest mantığı):* Haftalık takım etkinliği; Gastronomi Haritası'nda bölgeler (ör. Ege, Karadeniz, İtalya mutfağı). Bir bölgeyi ele geçirmek için takım o bölgenin sorularında en çok doğruyu yapar. Hafta sonunda haritayı en çok tutan takım kupayı alır. Yalnız Ümit Ligi etkinliği; lig puanı vermez.

*Valorant'tan rekabet:* yerleştirme maçları (Mutfağa Kabul Sınavı), basamaklar, sezon (act), maç sonu MVP, ajan seçimi yerine Aşçı Dostu seçimi (yalnız görünüş; dereceli maçta güç yok).

*Daha fazla MMORPG öğesi (öğrenmeye uyarlanmış):*
- **Zindan = Usta Sınavı:** Her durağın sonunda o durağın ustası (ör. Usta Ayı) ile kısa sınav; geçince durak rozeti ve sonraki durak açılır. Kaybetmek yok; eksik kartlar gösterilir, "Antrenmana git" önerilir.
- **Envanter = Mutfağım; ekipman = iş kıyafeti** (önlük, şapka, ceket; yalnız görünüş).
- **Keşif:** Haritada gizli "Biliyor muydun?" kartları (gastronomi tarihi; doğrulanmış bilgi). Toplanınca Mutfak Ansiklopedisi'ne girer (oyunun bilgi kitabı = Mutfak Kitabım).
- **Mentor (usta-çırak):** Üst rütbedeki oyuncu bir arkadaşını Antrenman'a davet eder; çırak doğru yaptıkça ikisi de bonus XP alır. Akran öğrenmesi.
- **Uzmanlık seçimi:** 10. seviyeden sonra öğrenci bir dalı "uzmanlık" seçer; o dalın görevlerinde unvan ve kıyafet kazanır (güç vermez).
- **Mevsim haftaları (★G: "Bu Hafta" temalarından biri olarak):** "Sonbahar Sofrası" (mevsimin sebze ve meyveleri: balkabağı, nar, ayva…), "Kış Çorbaları Haftası", "Pastacılar Haftası" (dinî ve siyasi tema yok); o haftanın konusu çift XP.
- **Unvan ve başarımlar (ad biçiminde):** "Baharat Uzmanı" (bütün baharat kartları ★), "Kuver Ustası" (10 kuver hatasız), "Çorba Ustası" (çorba tarifleri), "Gastronomi Tarihçisi" (10.7); Aşçı Kartı'nda görünür.
- **Hızlı seyahat:** Haritadaki duraklara tek dokunuşla gidilir; uzun yürüme/yükleme yok.

*Uyum ve risk:* Bu yapı öğrenmeye uyar, çünkü toplama ve görev aslında aralıklı tekrar ve amaçlı uygulamadır. Risk, karmaşıklıktır: harita küçük tutulur (6 durak), aynı anda tek görev, her ekranda tek ana eylem, okunan kısa metin. Uygulama sırası: önce Mutfağım ve Servis Günü (10.1–10.2), sonra harita ve görevler, en son baskın ve bölge savaşı.

**10.7 Gastronomi Tarihi (Gastronomi Tarihçisi durağı ve unvanı; harita için ★F)**
- Ürünlerin keşif ve ad hikâyeleri (ör. yoğurdun bulunuşu, menemen, çatal ve kaşığın tarihi, sütlacın adı) keşif kartı olarak toplanır; her kart 2 kısa cümle, sesli okunur, bir araca ya da malzemeye bağlanır (ör. menemen kartı → sahan aracı).
- Her kartta üç etiketten biri (Ali'nin kararı): **Biliniyor** (kaynakla doğrulanmış), **Bir anlatıya göre** (efsane; kesin bilgi gibi sunulmaz), **Adı nereden gelir?** (ad kökeni).
- Onaylı örnek kart metni: "Yoğurt nasıl bulundu? Kesin bilinmiyor. Bir anlatıya göre süt, kapta kendiliğinden ekşiyip koyulaştı. Anadolu'da eskiden yoğurt, palamut ya da çam kozalağıyla da mayalanırdı." (Evde deneme çağrışımı yok.) "Sütlaç adı nereden gelir? Eskiden bu tatlıya 'sütlü aş' denirdi. Söylene söylene 'sütlaç' oldu."
- Efsane olarak verilecekler: yoğurdun at sırtında bulunması, pastırmanın eyer altı, çayın bardağa düşen yaprağı, peynirin mide tulumu, kazandibinin yanık kazası, menemen–1920 göçü. Doğrulanmış yıllar: Türk kahvesi kültürü UNESCO 2013, Napoli pizza ustalığı 2017, ince ekmek/yufka 2016.
- Yapılmadı (kartlardan önce şart): Ali'nin gönderdiği ~50 metnin tek tek kaynakla "doğru / anlatı / çıkarılmalı" diye ayrılması. Uydurma tarih, yıl, kişi adı yazılmaz.
- İlerleme: her kart durağın ilerleme çubuğunu doldurur; bütün kartlar ve bölüm sorusu tamamlanınca **Gastronomi Tarihçisi** unvanı.
- Soru: her kartın 1 sorusu olur (Biliniyor ve Adı nereden gelir? kartlarından; efsaneden kesin bilgi sorusu sorulmaz). Er Meydanı'na gastronomi tarihinden 5 soru girer (konu payı). Harita Türkiye'den (coğrafi işaretli ürünler) başlar, sonra dünyaya açılır (★F).

## 11. Doğrulama listesi (her teslimden önce)
- 360×640, 390×844, 1280×800'de ekran görüntüsü; yatay taşma 0; menüler kaydırmasız.
- Sayfa hatası (pageerror) 0.
- tests/blitz-ui-tests.cjs geçer; kural değiştiyse emülatör testi geçer.
- sw.js CACHE ve sürüm metinleri güncel.
- Metinlerde yasaklar ve tek ad sözlüğü kontrol edilir.
