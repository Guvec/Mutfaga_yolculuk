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
Seçtiğim tasarım dili ile 3 telefon ekranı görseli üret (390x844, dikey, tek seferde): 1) Ustalar Ligi (Hızlı Şef, 2x2 mod karosu, Antrenman Şefi, açık odalar, alt çubuk), 2) Mutfak Araçları konu sayfası (Yolculuğum, Kartları incele, Sorular; alt çubuk), 3) Maç sonu (kazanan kartı, sıralama, Rövanş iste). Türkçe yazılar okunaklı; insan, el, marka, alkol yok; Aşçı Dostu panda görünebilir. Her ekranın altına hareket tarifi yaz (hangi öğe nasıl ve kaç saniyede hareket eder). Kod yazma.
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
Ekran grupları sırası: Ustalar Ligi ve maç ekranları → konu sayfaları ve Yolculuğum → soru ekranları → Mutfağım → Ben (kart, rütbe, ayarlar) → ana sayfa (en son, Ali onayıyla).

## 9. Matematik Canavarı'ndan (sürüm 67) uyarlanacaklar
Kaynak: github.com/digerpchesabim-stack/matematikcanavari — CLAUDE.md (pakette MC-REFERANS-CLAUDE.md olarak var). Aynı öğretmenin oyunu; teknik çözümleri denenmiş. Kopyalanmaz, mutfak oyununa uyarlanır ve geliştirilir.

| # | MC'de | Bizde şu an | Uyarlama ve geliştirme | Öncelik |
|---|---|---|---|---|
| 1 | Alt çubuk: Oyna · Arkadaşlar · Kartım · Ayarlar | Yok | 4 kapı: Öğren · Oyna · Mutfağım · Ben (Arkadaşlar ve Kartım "Ben"in içinde, arkadaş isteği kırmızı rozetle alt çubukta) | 1 |
| 2 | Kabartmalı 3B tasarım sistemi; tek dosyada renk belirteçleri; düğmede alt kenar gölgesi + basınca inme; 3 tema | Her menü farklı ton | Bölüm 8: tek tema "Mutfak Atölyesi"; kabartma kuralı aynen; temalar yalnız ton değiştirir | 1 |
| 3 | Canlı maskot (durum görselleri; zayıf telefonda hazır pozlar); karşılama sahnesi; dokununca tepki | Panda tek resim | Aşçı Dostu durum görselleri (bekliyor, sevinç, kutlama, düşünüyor); dokununca tepki + ses; ana sayfada hafif yüzme | 1 |
| 4 | Sade mod: "hareketi azalt" ayarı, düşük bellek (deviceMemory ≤1) veya ≤2 çekirdekte efektler kapanır | Sakin mod elle | Sakin mod + otomatik sade mod birlikte | 1 |
| 5 | Ekran geçişleri (ileri kayma, geri kayma, oyun ekranlarında solma) | Yok | Aynısı; oyun ve soru ekranlarında yalnız solma | 2 |
| 6 | Online Oyna: açık odalar listesi, 🔄 Yenile, seviyeye göre sıra, 🔒 şifreli, kişi sayısı, renkli konu karesi, Hemen Oyna | Var (Hızlı Şef, açık odalar, Kodun var mı) | Liste her zaman canlı yerine 20 sn önbellek + Yenile (Firestore okuma tasarrufu); konu renk karesi; oda kartında kurucunun rütbe rozeti | 2 |
| 7 | Rütbesi çok farklı oyuncuların odaları listede görünmez | Yok | Ustalık Ligi'nde zorunlu; Ümit Ligi'nde yalnız Hızlı Şef eşleşmesinde yakın düzey önceliği | 3 |
| 8 | Botlar: kimse gelmezse "Botla oyna"; kurucu boş yerlere bot ekler; gerçek oyuncu gelince bot yer açar; bota karşı rütbe puanı yok | Antrenman Şefi tek başına | Odalarda "Şef ekle" (Antrenman Şefi botu): 2'ye 2 ve Er Meydanı eksik kişiyle başlayabilir; bot maçında XP var, lig puanı yok | 2 |
| 9 | Takım odası: Kırmızı/Mavi takımı oyuncu seçer, dolu takıma girilemez, başlarken eşitlenir, eksik yer botla dolar; Takım 2'ye 2 … 5'e 5 | 2'ye 2 kura ile | Takım seçimi (🔥 Ateş / 🌿 Fesleğen), 2'ye 2–4'e 4, eksik yere Şef botu | 2 |
| 10 | Herkes Tek: en hızlı doğru 3, ikinci 2, üçüncü 1 puan | Blitz (her doğru 1, son 20 sn 2) | Blitz'e "hız sırası" puanı eklenmez (bilgi önce); yalnız eşitlik bozucu olarak kalır | — (alınmadı) |
| 11 | Takımım: kalıcı takım (≤4), takım adı listeden, kaptan, galibiyet/mağlubiyet, takım kapışması, Takım Oyuncusu madalyası | Yok | Faz 3 "Mutfak Ekibi" bu yapıyla: ekip adı hazır listeden (yazı yok), kaptan, haftalık ekip puanı | 3 |
| 12 | Karakter Kartı: büyük rozet, rütbe, madalyalar, 6 istatistik, oyuncu kodu, paylaşılabilir PNG | Hesabım + Rütbe ayrı | "Ben" kapısında Aşçı Kartı: Aşçı Dostu, seviye, rütbe, rozetler, 6 istatistik, oyuncu kodu; paylaşım PNG (kişisel veri yok) | 2 |
| 13 | Madalyalar bronz/gümüş/altın; adil oyun: aynı rakiple günde en çok 5 puanlı maç, yarıdan önce çıkan rakip sayılmaz | Rozetler var, adil oyun sınırı yok | Aynı rakiple günlük sınır ve erken çıkış kuralı Ustalık Ligi'ne | 3 |
| 14 | Davete cevap: Kabul et / Meşgulüm / Daha sonra; gönderen "gördü" bilgisini görür | Davet var, cevap seçenekleri yok | Aynı üç cevap; "Daha sonra" → Zamanlı Oyun | 3 |
| 15 | Zamanlı Oyun (randevu, 15–60 dk sonra) + 5 dk kala hatırlatma | Yok | Okul saatine uygun: teneffüs için 15/30 dk randevu | 4 |
| 16 | Herkesi çağır (çevrimiçi arkadaşlara toplu davet) + hazır mesajlar ve emoji (yazı yok) | Hazır mesaj kararı var, uygulanmadı | Aynısı; mutfak temalı hazır mesajlar ("Hazırım şef!", "Rövanş?") | 3 |
| 17 | Web bildirimleri (Cloudflare Worker, ücretsiz) | Yok | Ali'nin Cloudflare hesabıyla; önce Ali'ye kurulum adımları verilir | 4 |
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
| Baharatlar | Baharat kavanozu kartı (Mutfağım → Baharat rafı) | Tariflerde gerekli; doğru baharatı bilmeden tarif pişmez (ör. mercimek çorbası: kimyon, pul biber; kek: tarçın, vanilin) |
| Mutfak Araçları | Araç kartı (Hazırlık tezgâhı) | Pişirme adımlarında "hangi araçla?" sorusu; araç kartı yoksa adım kilitli |
| Yeterli ve Dengeli Beslenme | Besin kartı (Kiler) + tabak dengesi bilgisi | Servis Günü'nde menü kurarken dengeli tabak puanı; Pastacılık'ta tatlının menüdeki yeri |
| Pastacılık | Pasta tarifleri (Pasta tezgâhı) | Servis Günü'nün tatlı aşaması; baharat (tarçın, vanilin, kakao) ve araç (çırpma teli, silikon spatula, sıkma torbası) kartlarını kullanır |
| Servant ve Kuver | Kuver türü kartı (Servis masası) | Pişen yemeği servis etmek için doğru kuver: çorba → çorba kaşığı, tatlı → tatlı kuveri |
| Bulaşık ve Atık | Temizlik kartı (Bulaşık istasyonu) | Servis Günü'nün son aşaması: hijyen yıldızı; atık ayırma |

Not: Tariflerin malzeme, baharat, miktar ve adımları yalnız Ali'nin onaylı reçetelerinden alınır; tablodaki baharat örnekleri yalnız örnektir, uydurma reçete yazılmaz.

**10.2 Servis Günü (yeni ana mod — ağacın meyvesi):**
- Haftada bir yeni "sipariş": ör. "4 kişilik öğle menüsü: çorba, ana yemek, tatlı".
- Aşamalar: 1) menüyü dengeli kur (beslenme), 2) malzeme ve baharatları raftan seç, 3) araçları seç, 4) reçete adımlarını sırala, 5) kuveri kur, 6) servis sırası (servant), 7) bulaşık ve atık.
- Her aşama bir mini soru tipi; hepsinde öğrencinin Mutfağım kartları kullanılır. Kartı olmayan malzeme "önce Yolculuğum'da öğren" bağlantısıyla kilitli görünür (amaç verir).
- Sonuç: müşteri memnuniyeti 1–3 yıldız; Aşçı Dostu servis eder; tarif "Menüm"e girer.
- Tek başına ya da 2'ye 2 takım (ekip mutfağı: biri pişirir, biri servis kurar). Yarış avantajı yok; XP ve unvan var.

**10.3 Yeni soru tipleri (her konuda karışık kullanılır):**
1. Görsel seç (var) · 2. Ad seç (var) · 3. Eşleştir (var)
4. **Adım sıralama:** reçete ya da iş adımlarını sürükleyerek sırala (Pastacılık, bulaşık makinesi, kuver kurma sırası).
5. **Eksik olanı bul:** kuverde/tarifte eksik parça hangisi?
6. **Hatayı bul:** yanlış kurulmuş kuver, yanlış yerde duran bıçak, yanlış kaba konan atık.
7. **Ayır (kategori):** atıkları kutulara, besinleri besin gruplarına, baharatları tohum/yaprak/kabuk diye.
8. **Tabak doldur:** dengeli tabak için doğru grupları seç (Beslenme).
9. **Yerleştir:** kuver parçalarını yerine koy (var; Servis Günü'ne bağlanır).
10. **Durum sorusu (vaka):** kısa atölye durumu, ne yapılmalı? (güvenlikte doğru davranış: uzaklaş, öğretmene haber ver).
11. **Hızlı doğru/yanlış:** Blitz ve ısınma için.
Kural: her soru tipinin tek düzen kartı olur (görsel üstte, soru, seçenekler, alt sabit düğme); geri bildirimde doğru cevap + bir cümlelik "Neden?".

**10.4 Modlar ve menüler:**
- **Öğren:** Yolculuğum (her konuda aynı harita), Kartları incele, Tekrar.
- **Oyna:** Hızlı Şef, 1'e 1, 2'ye 2, Blitz, Er Meydanı, Antrenman Şefi, Haftanın Turnuvası, (Ustalık Ligi).
- **Mutfağım:** İstasyonlar, Tarif defteri, **Servis Günü**, Menüm, Aşçı Dostu.
- **Ben:** Aşçı Kartı, Rütbe Yolu (dal başına), rozetler, rekorlar, arkadaşlar, ayarlar.
- **Rütbe atlama sınavı:** her dalda rütbe yükselirken kısa "usta sınavı" (o dalın konularından karışık 10 soru); geçince tören ekranı.

**10.5 Bağlantıların görünür olması:**
- Her etkinlik sonunda "Bu iş neye yaradı?" şeridi: "+3 XP · Kimyon kartı ★★ · Mercimek Çorbası tarifine 1 adım kaldı".
- Konu sayfalarında "Bu konu şu tariflerde işe yarar" satırı.
- Mutfağım'da kilitli tarife dokununca eksik kartlar ve onları öğreteceği bölümlere tek dokunuşla geçiş.

## 11. Doğrulama listesi (her teslimden önce)
- 360×640, 390×844, 1280×800'de ekran görüntüsü; yatay taşma 0; menüler kaydırmasız.
- Sayfa hatası (pageerror) 0.
- tests/blitz-ui-tests.cjs geçer; kural değiştiyse emülatör testi geçer.
- sw.js CACHE ve sürüm metinleri güncel.
- Metinlerde yasaklar ve tek ad sözlüğü kontrol edilir.
