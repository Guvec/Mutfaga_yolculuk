# Değişiklik ve kontrol raporu

Temel: `mutfaga_yolculuk_main_7e54712.zip` (7e5471283744dbd9593c5b4a1a50c7518c1e3a94). Tarih: 5 Kasım 2026. GitHub'a gönderim ve Firebase yayını yapılmadı. Tam depoda `.git` yoktur.

## Uygulanan paketler

| Paket | Değişiklik | İlgili dosyalar |
|---|---|---|
| 0 | Şekerlik, tereyağı bıçağı ve lito bezi aynı adlarla değiştirildi. | `assets/mutfak-araclari/guncel-030.jpg`, `guncel-022.jpg`, `guncel-028.jpg` |
| A1 | Kılavuzdaki ad yazma cümleleri düzeltildi. Temel ekrandaki eski ad kutusu ve serbest ad oluşturma yolu kaldırıldı. Eski profiller internetsizken de hazır karaktere dönüştürülüyor. | `js/core.js`, `js/kilavuz.js`, `js/ad.js` |
| A2 | Kapışma ve Er Meydanı bekleme ekranında 30 saniyeyi aşan sinyal kesilmesi uyarısı. 45 saniyelik ayrılma eşiği korundu. | `js/yaris.js`, `js/ermeydani.js` |
| A3 | Kapışmada iki oyuncunun Hazırım demesi gerekiyor. Diğer odalarda Hazır/Bekliyor ve kurucuya hazır olmayan kişi sayısı gösteriliyor. Eski sürüm denetimi korunup protokol sürümü ayrıldı. | `js/yaris.js`, `ci/firebase/firestore.rules` |
| A4 | Tek kişilik değerlendirmeden önce geçilebilir ilk üç kartı; Kapışma/Er Meydanı geri sayımında ilgili ayarın liderleri; ana sayfada sıralama kartı; sonuç altında ilk 10 ve kişisel sıra/fark. Oyun Odası için ayrı tablo açılmadı. | `js/rekor-akis.js`, `js/rekor.js`, `js/paket-ui.js`, yarış dosyaları |
| B | Üç kapsam, dört konuya dengeli pay, sabit kalan pay sırası, konu içeren soru kimlikleri, aynı tohum/sıralama ve yeni sorulara öncelik. İlk maçın görselleri her oyuncuda yüklenmeden başlangıca izin verilmiyor; rövanş isteyen oyuncu yeni setin görsellerini önceden yüklüyor. Havuz eksikse sayı gizlice azaltılmıyor. | `js/yaris-model.js`, `js/yaris.js`, `js/canavar.js` |
| D | 8/7/5/5 dağılımlı haftalık 25 soru; haftalık sabit tohum; üç tamamlanmış sıralamalı deneme; en iyi sonuç; kaldığı yerden devam; bir mola; misafire antrenman; haftaya özel tablo ve geçen hafta görünümü. | `js/haftalik.js`, `js/rekor.js`, kural dosyası |
| E1 | Son soru ve 15/20 soruda yarı yol bildirimi; iki saniye; mevcut sesli okuma tercihi. Yeni ses/animasyon yok. | `js/paket-ui.js`, yarış dosyaları |
| E2 | Üç çok oyunculu modun soru/sonuç ekranında efekt, müzik ve sesli okuma ayarlarına erişim. Mevcut müzik/okuma karşılıklı kapatma kuralı kullanılıyor. | `js/paket-ui.js` |
| E3 | Kurucu etiketi eklendi. Çağrıldı bilgisi korundu; oyuncu girince Katıldı gösteriliyor. | `js/yaris.js`, `js/arkadas.js` |
| E4 | Eşit sırayı paylaşanlar aynı madalyayı alıyor; ikinciye gümüş, üçüncüye bronz. | `js/rekor-akis.js` |
| R1–R4 | MP formülü, ilk tamamlama/rekor bonusları, günlük ve rakip sınırları, haftalık sınır, düşmeyen rütbe ve altı rozet. Veriler pid ile yerel saklanıyor; profil silmede kaldırılıyor. Kısa geçilebilir kutlama ve isteğe bağlı dinleme var. | `js/rutbe.js`, `js/rutbe-ui.js`, `js/paket-ui.js` |
| R5 | İsteğe bağlı 1–5 tam sayı rank; mevcut yazma/okuma yolunda simge ve ad. Rank reddedilirse aynı yazım rank olmadan bir kez deneniyor. | `js/rekor.js`, `js/rekor-baglanti.js`, kural dosyası |
| Şef kepi | Şeffaf 1024×1024 PNG ve 128×128 ekran kopyası; tüm eşit birincilerin adının solunda. Büyük mevcut Haftanın Mutfak Kaptanı kartının tasarımı korunuyor; haftalık yarışma tablosu bu ayrı kartı açmıyor. | `assets/tasarim/sef-kepi.png`, `sef-kepi-128.png`, `js/rekor-akis.js` |
| Bağlantı ve test | Yeni modüller ve CSS yüklendi; önbellek v45'e yükseltildi; yeni varlıklar CORE'a eklendi. CI test listesine yeni kontroller ve jsdom bağımlılığı eklendi. | `index.html`, `sw.js`, `css/paket.css`, `ci/package.json`, `.github/workflows/rekor-test.yml`, `tests/` |

## Korunanlar

- Bütün `content/**/icerik.json` dosyaları kaynak ZIP ile byte düzeyinde aynı. `kok`, `disla`, `grup` ve içerik sürümleri değiştirilmedi.
- `guncel-099.jpg` ve `bulasik-6` maddesinin gerçek görsel yolu olan `assets/bulasik-guncel/arac-11.jpg` kaynakla byte düzeyinde aynı.
- TIE_MS=200 ve mevcut kazanan/beraberlik kuralı değiştirilmedi. Maç seçenekleri 10/15/20, mevcut süre seçenekleri 15/20/30 olarak korundu.
- Konu kartları, ana sayfanın süs alanı ve mevcut Rekorlarım ve Sıralama menüsü korundu. Yeni kartlar eklendi.
- Mevcut ödül koleksiyonu sistemi korunuyor; yeni MP hesabı ayrı. Bu eski ödül puanı MP'ye çevrilmedi.

## Testlerin gerçek sonucu

Son başarılı koşuların birleşiminde 27 test dosyası geçti. Tarayıcı: masaüstü Chromium 153; Playwright 1.62.1. Fiziksel telefon testi değildir. Firebase: Auth + Firestore yerel emülatörü ve gerçek 10.12.2 SDK.

```
ad-tests.cjs: PASS — ad-final-verified.log
adim1-tests.cjs: PASS — final/adim1-tests.log
adim2-tests.cjs: PASS — final/adim2-tests.log
adim3-tests.cjs: PASS — final/adim3-tests.log
adim4-tests.cjs: PASS — final/adim4-tests.log
adim5-tests.cjs: PASS — final/adim5-tests.log
arkadas-rules-tests.cjs: PASS — emulator/arkadas-rules-tests.log
arkadas-ui-tests.cjs: PASS — final/arkadas-ui-tests.log
efekt-tests.cjs: PASS — final/efekt-tests.log
ermeydani-ui-tests.cjs: PASS — final/ermeydani-ui-tests.log
geri-tests.cjs: PASS — final/geri-tests.log
giris-tests.cjs: PASS — final/giris-tests.log
paket-akis-tests.cjs: PASS — dom-final.log
paket-ui-tests.cjs: PASS — paket-final-check.log
rekor-entegrasyon-tests.cjs: PASS — emulator/rekor-entegrasyon-tests.log
rekor-rules-tests.cjs: PASS — emulator/rekor-rules-tests.log
rekor-ui-tests.cjs: PASS — final/rekor-ui-tests.log
rutbe-tests.cjs: PASS — final/rutbe-tests.log
sonuc-tests.cjs: PASS — final/sonuc-tests.log
soru-denetim-tests.cjs: PASS — final/soru-denetim-tests.log
speech-tests.cjs: PASS — final/speech-tests.log
spice-info-tests.cjs: PASS — final/spice-info-tests.log
state-tests.cjs: PASS — final/state-tests.log
ui-regression.cjs: PASS — final/ui-regression.log
yaris-model-tests.cjs: PASS — final/yaris-model-tests.log
yaris-rules-tests.cjs: PASS — emulator/yaris-rules-tests.log
yaris-ui-tests.cjs: PASS — yaris-final.log
```

Öne çıkan gerçek çıktı:

```
PASS rütbe: formül; dört toplam; günlük/haftalık/rakip sınırı; misafir; yarım oturum; eşikler; düşmeme; tüm rozetlerin sınırları; Türkiye gün sınırı; bonus ve yinelenen kayıt.
PASS: seeded questions (baharat 8, mutfak 12, bulaşık, kuver 1/3, bilgi) have 4 distinct choices; deterministic; rematch differs; duel first-correct rule, ties to host, early finish; shared ranks; first name only; room code slug.
PASS dengeli kapsam: 10/15/20 dağılım, sabit kalan pay, kimlik, tohum, rövanş; haftalık 8/7/5/5; boş havuz hatası.
PASS Chromium: 390px yeni ekranlar; eşit lider kartı/Geç; 3 haftalık deneme; tek yanıt; antrenman ve misafir; Türkiye pazartesi sınırı; rank reddinde tek geri deneme; önizlemeler.
PASS DOM: tüm yeni modüller açılır; ana kartlar; rütbe ekranı; 25 soru; tek yanıt; mola; deneme/dedup; devam; kep ve rütbe; lobi Hazırım/Kurucu/uyarı.
PASS: menu/name rules; custom+duplicate codes; race lobby (min 2, 3 players), same seeded questions, late join refused, live finish rules, shared final ranks; subjects (mutfak bilgi, kuver); duel auto-start, 3rd player refused, first-correct/both-wrong/wrong-then-right rounds, early finish, rematch with new questions, opponent-left win; version mismatch; invite link; no overflow; no JS errors. (mock Firestore, desktop Chromium)
PASS Başka hesap adına profil açılamaz
PASS Geçersiz profil kimliği reddedilir
PASS Profil gen 0 ve in ile açılmak zorunda
PASS Profile fazladan alan eklenemez
PASS Profil açılır
PASS Geçersiz rank 0
PASS Geçersiz rank 6
PASS Geçersiz rank "3"
PASS Geçersiz rank 2.5
PASS rank 1 kabul
PASS rank 2 kabul
PASS rank 3 kabul
PASS rank 4 kabul
PASS rank 5 kabul
PASS rank olmayan eski yazım kabul
PASS Haftalık metadata ve 25 puan kabul
PASS Haftalık 26 puan reddi
PASS Ayar tablosuna yazım
PASS Ayar tablosunda fazladan alan reddi
PASS Başkası profili okuyamaz
PASS Sahibi profili okur
PASS Olmayan profil sorgulanabilir (açma öncesi)
PASS Profiller listelenemez
PASS Başkası profil durumunu değiştiremez
PASS Sahip değiştirilemez
PASS Nesil 1 artmadan durum değişmez
PASS Profil silinemez
PASS Var olan profil yeniden "açılamaz" (sahiplenme yok)
PASS Profilsiz satır yazılamaz
PASS Nesil eşleşmeden yazılamaz
PASS Yanlış dönem reddedilir
PASS Geçmiş dönem tablosuna yazılamaz
PASS Yanlış sürüm reddedilir
PASS Açık satıra fazladan alan (süre) eklenemez
PASS Açık satıra hesap kimliği eklenemez
PASS Tablo üst sınırı aşılamaz (13 / 12)
PASS Kuver Basit üst sınırı 5
PASS Tanımsız tablo reddedilir
PASS Doğru sayısı sayı olmak zorunda
PASS Negatif doğru sayısı reddedilir
PASS Kesirli doğru sayısı reddedilir
PASS Boş ad reddedilir
PASS Ad en fazla 40 karakter
PASS Geçen haftaya yazılamaz
PASS Gelecek haftaya yazılamaz
PASS Genel tabloya yazılır
PASS Bu haftaya (sunucu saati) yazılır
PASS Birleşik soru denemesine yazılır (10 üzerinden)
PASS Başkası satırı yazamaz
PASS Başkası satırı silemez
PASS Doğru sayısı düşürülemez
PASS Eşit sonuç yeniden yazılamaz
PASS Doğru sayısı artar
PASS Skor güncellemesinde dönem değişemez
PASS Skor ve ad aynı güncellemede değişemez
PASS Yalnız ad değişir
PASS Giriş yapmamış okuyamaz
PASS Giriş yapan listeyi okur
PASS Güncel nesildeki satır "in" iken silinemez
PASS Tek pakette profili kapatıp satır yazmak reddedilir
PASS Listeden çık: in → out, nesil 1
PASS Çıkıştan sonra gecikmiş eski nesil yazma reddedilir
PASS Çıkıştan sonra yeni nesille de yazılamaz (durum out)
PASS Çıkışta satırlar silinir
PASS Çıkışta haftalık satır silinir
PASS Tek pakette listeye dönüp yeni nesille yazmak reddedilir
PASS Listeye dön: out → in, nesil 2
PASS Eski nesille (0) yazma reddedilir
PASS Yeni nesille (2) yazılır
PASS Gecikmiş eski silme isteği yeni nesil satırını silemez
PASS Kalmış eski nesil satırı "in" iken silinebilir
PASS Kalmış eski nesil satırı yeni nesille değiştirilebilir
PASS Başka hesabın eski nesil satırı silinemez
PASS Sahibi çıkıştan sonra kendi satırını siler
PASS Profil silme: in → deleted
PASS deleted durumunda yazma reddedilir
PASS deleted durumunda kalan satırlar silinir
PASS deleted son durumdur, geri dönülemez
PASS deleted profil yeniden açılamaz
PASS deleted profil başka hesapça sahiplenilemez
PASS: 80 rekor kuralı denetimi
PASS Gerçek kurallarla ilk sonuç genel ve haftalık tabloya yazıldı; açık satırda süre/hesap kimliği yok
PASS Ad değişikliği + yüksek sonuç, ad değişikliği + düşük sonuç kurallarla uyumlu
PASS Kural reddinde öğrenciye yazma hatası gösterilmedi; sonuç kuyrukta tutulup tekrar gönderildi
PASS İki ayrı cihaz aynı listeyi görüyor; başka cihaz yabancı satıra yazamıyor
PASS Listeden çık: sunucudaki satırlar silindi, sonraki sonuç yazılmadı
PASS Listeye dön: yeni nesil (2) ile yazıldı
PASS Puansız yoklama: geçmiş kaydında puan 0 (yenileme sonrası), gönderim çağrısı 0
PASS Çevrimdışı profil silme engellendi; çevrimiçi silmede durum deleted ve satırlar silindi
PASS Tarayıcıda yakalanmamış JavaScript hatası yok (gerçek SDK + emülatör; fiziksel Android değil)
```

Ham çıktılar tam depoda `kontrol/test-kayitlari/`; son koşu eşlemesi `kontrol/SON_TEST_SONUCLARI.txt` içindedir. Başlangıçta Chromium bulunamadı ve doğrudan indirme başarısız oldu. Alternatif yerel Chromium ile tarayıcı kontrolleri tamamlandı. İlk başarısız ara koşular silinmedi. Eski testlerde otomatik başlangıç, anlık görsel hazırlığı ve serbest ad kullanan fixture beklentileri yeni davranışa uyarlandı; emülatör rekor fixture'ında ad göçü devre dışı bırakıldı. Ürün kodundaki ad göçü ayrıca `ad-tests.cjs` ile sınandı. Çok telefonlu tur testinde cevap süreleri fixture'da sabitlenerek çalışan ortamın işlem yükünden ayrıldı; ürünün beraberlik kuralı değiştirilmedi.

Ara test koşuları 0–A, B, D–E–R grupları halinde yapıldı; her A/E/R alt adımı için ayrı bir tam test koşusu yapılmadı. Son doğrulamada her `.cjs` dosyası ayrı Node süreciyle çalıştırıldı.

## Yalnız kontrol edilen beş konu

| Kontrol | Bulgular; bu davranışa müdahale edilmedi |
|---|---|
| Oyun Odası sonunda çıkış/paylaş kilidi | Çıkış düğmesi diğerleri bitirmeden de kullanılabiliyor. Sonuç kartını resim olarak kaydetme düğmesi de açık; ayrıca zorunlu sonuç bekleme kilidi bulunmuyor. |
| Dinle süreyi durduruyor mu? | Hayır. `sesSoyle` yarışın `performance.now()` başlangıcını değiştirmiyor. Kapışma, Er Meydanı ve Oyun Odası sayaçları sesli okuma sırasında işlemeye devam ediyor. |
| Arkadaş profilinde ikili maç geçmişi | Yok. Arkadaşlık/davet/çevrimiçi durum var; iki kişi arasında maç ve galibiyet geçmişi tutulmuyor. |
| Arka plana alınan sekme | Bireysel temel sayaç duraklatılıyor. Yarış sayaçları `performance.now()` farkıyla çalışıyor; arka planda tarayıcı aralıkları yavaşlatabilir. Yeniden çalışınca geçen zaman hesaba katılıyor; süre aşan cevap kabul edilmiyor. Fiziksel mobilde işletim sistemi askıya alma davranışı ayrıca denenmedi. |
| Sıralama satırından arkadaş ekleme | Yok. Rekor satırında arkadaş ekleme düğmesi bulunmuyor. Yarış sonuçlarında mevcut arkadaş düğmeleri korunuyor. |

Bu beş bulgu kaynak kodu üzerinden kontrol edildi; mobil cihazda ses/arka plan deneyi yapılmadı.

## Kural değişiklik özeti — 5 satır

1. Rekor satırında rank isteğe bağlıdır; varsa yalnız 1–5 tam sayıdır, eski rank'sız yazımlar geçerlidir.
2. Puan artırma işlemine rank eşlik edebilir; yalnız rank değişimi de yapılabilir; aynı puanı değişikliksiz yeniden yazmaya izin verilmez.
3. Haftalık yarışma tablosuna oyun/kapsam/toplam/içerik sürümü/hafta metadata alanları yalnız doğrulanmış şemayla eklenir; diğer tablolara bu alanlar açılamaz.
4. Mevcut rekor koleksiyonunda oyun ayarına özel tablo kimlikleri doğrulanır; yeni koleksiyon yoktur, fazladan alanlar reddedilir.
5. Oda belgelerine isteğe bağlı scope; oyuncu belgelerine boolean ready/loaded eklenir; eski belgelerin zorunlu alanları ve sahiplik kuralları korunur.

## Yayın sırası

1. Önce bu teslimdeki `firestore.rules` Firebase Console'dan yayımlanmalı. Tam depoda aynı dosya `ci/firebase/firestore.rules` konumunda bulunur.
2. Yeni `firestore.indexes.json` gerekmez ve üretilmedi; mevcut sorgular koleksiyonun satırlarını okur, birleşik yeni indeks istenmez.
3. Sonra ZIP'teki uygulama dosyaları, yeni JS/CSS ve iki kep PNG'si birlikte yüklenmeli. `sw.js` v45 eski önbelleği yeniler.
4. Rank alanı reddedilirse rank'sız tek geri deneme eski kuralla uyumluluk sağlar. Haftalık/kapsam/hazırlık alanlarının çalışması için yeni kuralın önce yayımlanması gerekir. Başarısız rekor yazımı öğrenciye teknik hata olarak gösterilmez; yerel sonuç ve kuyruk korunur.
5. Bu turda Firebase veya GitHub yayını yapılmadı. Depodaki mevcut CI iş akışının otomatik test sonucu gönderme adımı bu çalışmada tetiklenmedi.

## Belirsiz kalanlar ve sınırlar

- MP değerleri ve eşikler öneri olarak `js/rutbe.js` başındaki RUTBE_AYAR nesnesinde tutuluyor. Rütbeler kesin sırayla Çırak → Aşçı Yardımcısı → Aşçı → Kaptan → Şef Yardımcısı.
- Sıralama satırındaki rank, o satırın son yazıldığı andaki rütbedir. Rütbe atlayınca eski satırlar topluca yenilenmez; sonraki sıralama yazımında güncellenir.
- Uygulamada kullanıcıya açık bir yedek/geri yükleme yolu bulunmadı. Olmayan bir yol eklenmedi. MP/rozet/geçmiş localStorage'dadır; bunlar sunucuya gönderilmez. Hazır karakter göçünde pid korunabilen profillerin rütbe kaydı da korunur.
- Rakibin profil kimliği bulunmayan maçta rakip sınırı güvenilir hesaplanamayacağı için maç MP'si verilmez. Kimlik yerine görünen ad kullanılmaz.
- Haftalık üç deneme ve oturum devamı cihazdaki pid kaydıyla yürür; sunucu doğrulaması eklenmedi. Bu sınıf içi oyunda kesin şampiyon iddiası kullanılmaz.
- Haftalık oturum hafta değişirse sıralamalı sonuç olarak yeni haftaya taşınmaz. İlgili soruların işaretlenmiş belirsiz/çakışan/güvensiz halleri ve öğrenciye tehlikeli müdahale yükleyen doğru cevaplar haftalık havuzdan elenir. İçerik için yeni bir bilimsel/MEB uygunluk onayı iddia edilmez.
- Seçilen takım veya kuver havuzu 15/20 soruya yetmiyorsa açık eksik havuz mesajı gösterilir; tekrar veya gizli soru azaltımı yapılmaz.
- Rütbe simgeleri beş farklı çizgili SVG işaretidir; yeni rütbe görseli üretilmedi. Kep görseli şeffaf üretildi; 1024 px kaynak ve 128 px kopya hazır. 32 px beyaz/koyu gri/krem önizlemesi ve beş rütbenin önizlemesi ayrı teslimdir.
- Masaüstü dar ekran ve koyu/sepya görünümü kontrol edildi. Gerçek Android, telefonun Türkçe sesi, canlı sınıf ağı ve üretim Firebase ortamı denenmedi.

## Değişen ve eklenen dosyalar

Değişenler:

- `.github/workflows/rekor-test.yml`
- `assets/mutfak-araclari/guncel-022.jpg`
- `assets/mutfak-araclari/guncel-028.jpg`
- `assets/mutfak-araclari/guncel-030.jpg`
- `ci/firebase/firestore.rules`
- `ci/package.json`
- `index.html`
- `js/ad.js`
- `js/arkadas.js`
- `js/canavar.js`
- `js/core.js`
- `js/ermeydani.js`
- `js/kilavuz.js`
- `js/rekor-baglanti.js`
- `js/rekor.js`
- `js/yaris-model.js`
- `js/yaris.js`
- `sw.js`
- `tests/adim4-tests.cjs`
- `tests/ermeydani-ui-tests.cjs`
- `tests/rekor-entegrasyon-tests.cjs`
- `tests/rekor-rules-tests.cjs`
- `tests/rekor-ui-tests.cjs`
- `tests/sonuc-tests.cjs`
- `tests/yaris-model-tests.cjs`
- `tests/yaris-ui-tests.cjs`

Eklenenler:

- `assets/tasarim/sef-kepi-128.png`
- `assets/tasarim/sef-kepi.png`
- `css/paket.css`
- `js/haftalik.js`
- `js/paket-ui.js`
- `js/rekor-akis.js`
- `js/rutbe-ui.js`
- `js/rutbe.js`
- `tests/paket-akis-tests.cjs`
- `tests/paket-ui-tests.cjs`
- `tests/rutbe-tests.cjs`

Ek olarak bu rapor, test kayıtları ve iki istenen önizleme kontrol klasörüne kondu.
