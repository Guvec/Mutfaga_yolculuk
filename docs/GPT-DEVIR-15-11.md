# İşin Mutfağına Yolculuk — devir belgesi ve gelişim planı (15.11.2026)

Bu belge oyunu devralan yapay zekâ (GPT) ve Ali Arıkoğlu için hazırlandı. Önce "Çalışma kuralları"nı oku. Sonra "Oyun ağacı", "Yeni menü yapısı", "Denetim bulguları" ve "İş listesi" sırasıyla ilerle.

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
1. **XP** → Aşçı Seviyesi (Ustalık Ligi'nin kapısı).
2. **Kart ustalığı** → Mutfağım'daki ilgili malzeme kartlarının yıldızı.
3. **Yanlışlar** → Tekrar listesi (Antrenman Şefi bunlardan soru seçer).

| Etkinlik | XP | Kart | Yanlış → Tekrar | Açtığı şey |
|---|---|---|---|---|
| Yolculuğum bölümü | ✓ (en çok) | Kartı açar (gri → renkli) | ✓ | Sonraki bölüm, dal rütbesi |
| Antrenman Şefi | ✓ | Yıldız tazeler | Kapatır | Üst zorluk |
| 1'e 1, 2'ye 2, Blitz, Er Meydanı | ✓ | Yıldız tazeler | ✓ | Rövanş, görev |
| Günlük 3 görev | ✓ bonus | — | — | Sezon şeridi adımı |
| Tarif pişirme (Mutfağım) | ✓ | Tarif kartı | — | Menü, unvan |
| Ustalık Ligi | lig puanı | — | ✓ | Basamak, kupa |

## 3. Malzeme Dolabı → önerilen biçim: "Mutfağım"
Gemini'nin Metin2 tarzı "topla-üret-güçlen" önerisi rekabete güç kattığı için alınmadı. Bilgi yerine oynama süresini ödüllendirir. Yerine şu kurgu öneriliyor; yarışta avantaj vermez, yalnız prestij ve görünüş verir:

- **Malzeme kartları:** Her öğrenme maddesi bir karttır: araç, baharat kavanozu, besin, temizlik malzemesi, kuver parçası. Yolculuğum'da öğrenilince kart açılır (gri silüet → renkli).
- **Ustalık yıldızı (1–3):** Antrenman ve maçlarda doğru bilinen kart yıldız kazanır. Yıldız zamanla yavaşça solar (ör. 7 ve 21 gün). Soluklaşan kart "Tazele" işareti alır. Bu, aralıklı tekrarın oyun hâlidir; öğrenciyi doğal olarak tekrara çağırır.
- **İstasyonlar** (her konu bir istasyon): Hazırlık tezgâhı (Mutfak Araçları), Baharat rafı (Baharatlar — mevcut kutular buraya bağlanır), Kiler (Beslenme), Bulaşık istasyonu (Bulaşık ve Atık), Servis masası (Servant ve Kuver), Pasta tezgâhı (Pastacılık).
- **Tarif defteri:** Her tarif gerekli kartları listeler (ör. Mercimek Çorbası: kırmızı mercimek, soğan, havuç, kimyon, tencere, kepçe, el blenderi). Gerekli kartların hepsi en az 1 yıldızdaysa tarif "pişirilir". Pişirme, adım sıralama mini oyunudur. Biten tarif "Menüm"e girer; Aşçı Dostu servis eder.
- **Ödül:** unvan ("Çorba Ustası"), tezgâh süsü, Aşçı Dostu kıyafeti. Rekabette güç, can ya da süre avantajı yok.
- **Veri:** telefonda (localStorage) profil başına `kv_mutfagim`: `{kart:{id:{acik:t, yildiz:0-3, son:t}}, tarif:{id:t}}`. Kart kimliği içerik maddesinin kimliğidir. Firestore gerekmez.

## 4. Yeni menü yapısı (bilgi mimarisi)
Bugün aynı yere birden çok yoldan gidiliyor: Aşçılık Atölyesi, Mutfak Kitabım ve dal pencereleri aynı konuları gösteriyor. Ayrıca Haftalık Mutfak Yarışması Ustalar Ligi'nin dışında duruyor ve dört farklı "tekrar" adı var. Öneri: alt çubukta 4 kapı.

1. **Öğren** — Yolculuğum (dallar → konular → bölümler); konu sayfası tek düzen: Yolculuğum · Kartları incele · Sorular. Aşçılık Atölyesi ve Mutfak Kitabım buraya katılır.
2. **Oyna** — Ustalar Ligi: Hızlı Şef, mod karoları, Antrenman Şefi, açık odalar, Ustalık Ligi. Haftalık Mutfak Yarışması burada "Haftanın Turnuvası" olur.
3. **Mutfağım** — İstasyonlar, kartlar, tarif defteri, Menüm, Aşçı Dostum (karakter, kıyafet, lezzet tattır).
4. **Ben** — Profil, Aşçı Seviyesi, Rütbe Yolu, rozetler, Rekorlarım, Sıralama, arkadaşlar, Ayarlar.

Ana sayfa: Günlük 3 görev kartı + "Kaldığın yer" + 4 kapı. Ana sayfanın görsel düzeni Ali'nin onayıyla değişir.

**Tek ad sözlüğü (her kavram için tek ad):**
- "Yanlışlarımı çalış", "Pekiştiriyorum", "Tekrar", "Pekiştir" → **Tekrar**.
- "Skorlarım" ve "Çalışma geçmişim" → **Çalışma geçmişim**.
- "Uygulama kılavuzu" ve "Kılavuz" → **Kılavuz**.
- "Dostlar" → **Karakterler**; "Dostum olsun" → **Mutfağıma al** (yapıldı).

## 5. Denetim bulguları (15.11, 360×640, ana sayfa hariç)
1. **İki farklı tasarım dili:** Dal pencereleri (Sıcak Mutfak, Pastacılık, Servis), Aşçılık Atölyesi, Lezzetleri Keşfet, Günlük Görevler, Servant ve Kuver, Mutfak Kitabım ekranın ortasında yüzen krem panellerle açılıyor; diğerleri tek satır üst çubukla. Hepsi tek düzene (üst çubuk + tam sayfa) geçmeli.
2. **Tekrar eden giriş yolları:** Aşçılık Atölyesi ana sayfadaki dal düğmelerini, Mutfak Kitabım dal konularını tekrarlıyor.
3. **Ligin dışında yarışma:** "Haftalık Mutfak Yarışması" (5 konu, 145 soru, 15 yanlış) Ustalar Ligi'nin dışında, ayrı ekranda.
4. **Boş durumlar zayıf:** Yanlışlarım ekranında yalnız "Geri dön" düğmesi var, açıklama yok; Pekiştiriyorum, Çalışma geçmişi ve Rekorlarım düz metin. Her boş durumda ne yapılacağını söyleyen bir cümle ve tek düğme olmalı.
5. **Konu sayfaları farklı:** Kuver'de "Kuveri Kur, Adını Bul, Pekiştiriyorum"; diğerlerinde "Yolculuğum, Kartları tanı, Çoktan Seçmeli". Tek düzen olmalı.
6. **Baharat Rafı başlığı** koyu yeşil ve farklı bir şerit kullanıyor; diğer başlıklarla aynı olmalı.
7. **Aşçı Dostum:** Lezzet karoları, "Diğer besinler", "Tekrar izle", "Lezzetleri Keşfet" ve "Görünüm ve Hareketler" aynı ekranda; kalabalık. Mutfağım'a taşınınca sekmelere ayrılmalı.
8. **Hesabım** 849 px (1,3 ekran), **Kılavuz** 658 px; ikisi de tek ekrana indirilebilir.
9. **Ayarlar penceresi** 821 px; kendi içinde kayıyor. Grup başlıkları küçültülebilir.
10. **Rütbe Yolu** sekmeleri (Sıcak Mutfak / Pastacılık / Servis) ile ana sayfa dal renkleri farklı.
11. **Odalar:** Yeni düzen kuruldu (Hızlı Şef, mod karoları, Kodun var mı?). Gerçek telefonlarla denenmeli.

## 6. İş listesi (öncelik sırasıyla)
Her maddede: dosya, yapılacak, kabul ölçütü. Her madde ayrı onay ister.

1. **Tek tasarım dili:** Yüzen panelli ekranlar (yolpenceresi, ascilikatolyesi, mutfakkitabi, market, gunlukgorevler, servantkuver; kodu bulmak için: grep "st.screen==='<ad>'" js/*.js) üst çubuk + tam sayfa düzenine geçer. Ölçüt: 360×640'ta kaydırmasız, yatay taşma yok, hepsinde aynı başlık yapısı.
2. **Alt çubuk ve 4 kapı:** Öğren, Oyna, Mutfağım, Ben. Ölçüt: her ekrandan en çok 2 dokunuşla 4 kapıya ulaşılır; eski yollar yönlendirilir, hiçbir içerik kaybolmaz.
3. **Tek ad sözlüğü:** Bütün metinlerde (js/*.js) uygulanır. Ölçüt: eski adlar hiçbir ekranda görünmez.
4. **Mutfağım v1:** Kartlar + istasyonlar + yıldız (solma dahil); Yolculuğum ve Antrenman bağlantısı. Ölçüt: bir bölüm bitince kartlar açılır, Antrenman doğrusu yıldız verir, 7 gün sonra yıldız solar.
5. **Antrenman Şefi zayıf konular:** Tekrar listesinden ve solan kartlardan soru seçer (js/antrenman.js antBasla). Ölçüt: tekrar listesi boş değilse sorular en az yarı yarıya oradan gelir.
6. **Günlük 3 görev** ana sayfa kartında; görev türleri: Yolculuğum'da 1 bölüm, Antrenman'da 8 doğru, 1 maç. Ölçüt: gece yarısı yenilenir; kaçırınca ceza yok.
7. **Haftanın Turnuvası:** Haftalık Mutfak Yarışması (js/haftalik.js, js/kaptan.js) Ustalar Ligi'ne taşınır.
8. **Tarif defteri ve pişirme mini oyunu** (Mutfağım v2): ilk 5 tarif atölye uygulamalarından (Mercimek Çorbası, Sebze Çorbası, Sebzeli Omlet, Kek ve bir pastacılık tarifi). Reçete miktarları onaylı kaynaktan; uydurulmaz.
9. **Ustalık Ligi:** Mutfağa Kabul Sınavı, lig basamakları, sezon, ücretsiz sezon şeridi (bkz. claude/oyun-plan-15-11-rekabetci.md Faz 2).
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

### 7.2 Mutfağım istasyonları (6)
```
Bir mutfak eğitim oyununun "Mutfağım" ekranı için 6 istasyon görseli üret. 1600x900 yatay, aynı kamera açısı (hafif yukarıdan), aynı sıcak ışık, 3B animasyon filmi kalitesi, profesyonel çelik mutfak. İnsan ve hayvan yok, yazı yok.
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
- Rütbe ve lig basamak rozetleri (Çırak, Kalfa, Usta, Şef, Baş Şef; her biri 3 kademe): Faz 2'de istenecek.

## 8. Doğrulama listesi (her teslimden önce)
- 360×640, 390×844, 1280×800'de ekran görüntüsü; yatay taşma 0; menüler kaydırmasız.
- Sayfa hatası (pageerror) 0.
- tests/blitz-ui-tests.cjs geçer; kural değiştiyse emülatör testi geçer.
- sw.js CACHE ve sürüm metinleri güncel.
- Metinlerde yasaklar ve tek ad sözlüğü kontrol edilir.
