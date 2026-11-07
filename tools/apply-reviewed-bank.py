"""Rebuild reviewed content while preserving every persistent question/card ID."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
paths=[ROOT/'content'/s/'icerik.json' for s in ['mutfak-araclari','bulasik-makinesi-temizligi']]
data=[json.loads(p.read_text()) for p in paths]
qs=[q for d in data for q in d['questions']]
rows=(ROOT/'tools/reviewed-items.txt').read_text().splitlines()
assert len(qs)==len(rows)==108
for row in rows:
 n,prompt,*tail=row.split('¦');assert len(tail)==5,n
 n=int(n);q=qs[n-1];q.update(prompt=prompt,correct=tail[4],reviewNumber=n)
 q['choices']=[dict(id=c,text='',image=t[1:],imageAlt=c+' seçeneği') if t.startswith('@') else dict(id=c,text=t) for c,t in zip('ABCD',tail[:4])]
 if n in [32,38,65]:q['choiceOrder']='alphabetical'
 if n in [58,59,60,61,62]:q['choiceOrder']='numeric'
 if n==47:q['emphasis']=['kullanılmaz']

explanations={
1:'Makarna tabağının çukur orta bölümü, makarnanın sosuyla birlikte sunulmasını sağlar.',
2:'Kahve fincanı tabağı, fincanın yerinde durmasına yardımcı olur ve damlayan kahveyi toplar.',
3:'Kahvaltılık kâse, reçel veya bal gibi kahvaltılıkları küçük porsiyonlar hâlinde sunmak için kullanılır.',
4:'Üstte boşluk kalması dökülme riskini azaltır.',
7:'Tabak dış kenarından desteklenir. Yiyeceğe ve tabağın yiyecekle temas eden iç yüzeyine dokunulmaz.',
15:'Toz şeker temiz ve kuru kaşıkla alınır. Islak kaşık şekeri nemlendirir; kullanılmış kaşık şekere kir bulaştırabilir.',
16:'Serviste ısıtılmış tabak, temiz ve kuru lito beziyle tutulur. Fırından çıkan çok sıcak tepsiler için fırın eldiveni kullanılır.',
19:'Yavaş geçiş, sarsılma ve kapların devrilme riskini azaltır.',
24:'Çok sıcak tepsi, kuru ve ısıya dayanıklı fırın eldiveniyle tutulur. Islak eldiven yanık riskini artırabilir.',
25:'Tavaya ve çalışma sıcaklığına uygun silikon çevirme spatulası, yapışmaz kaplamayı çizmeden omleti çevirmeye yardımcı olur.',
27:'Reçetede belirtilen miktar kullanılır. Hamurun kabarması için kalıpta gerekli boşluk bırakılır.',
28:'Ekmek bıçağının keskin kenarı tırtıklıdır. Bu kenar, ekmeği dilimlemek için kullanılır.',
30:'İnce rende, sarı kabuğu küçük ve ince parçalar hâlinde rendeler. Acı tat vermemesi için kabuğun beyaz kısmı alınmaz.',
36:'Kepçenin deliksiz başı, çorbayı sıvısıyla birlikte almaya yarar. Kevgirin başı deliklidir; süzgeçler sıvıyı süzmek için kullanılır.',
39:'Ölçü kabındaki 200 ml çizgisi kullanılarak süt tek seferde ölçülür.',
44:'Üstte boşluk bırakılması ve üst kısmın bükülmesi, kremanın yukarıdan çıkmasını önler.',
45:'Yıkama ve durulama, yumurta kalıntılarını uzaklaştırır. Fırça yeniden kullanılmadan önce öğretmenin yönettiği hijyen işlemleri tamamlanır.',
50:'Isıtma sonrasındaki bekleme süresi, yiyecek ve cihaz için verilen talimatlara göre belirlenir.',
51:'El blenderinin bıçaklı ucu yiyeceği parçalayarak püre yapar. İşlem, öğretmen gözetiminde ve cihazın kullanım talimatına göre yapılır.',
53:'Malzemeler en yüksek dolum çizgisini aşmayacak şekilde konur. Fazla doldurma, taşmaya neden olabilir.',
58:'Bu koşullarda genel öneri 3–4 gündür. Ürüne özel daha kısa süre varsa ona uyulur. Saklama süresini ve koşullarını öğretmen kontrol eder.',
59:'Yemek bekletilmeden, en geç iki saat içinde buzdolabına alınır. Hızlı soğuması için sığ kaplara bölünür. Ortam 32 °C’den sıcaksa süre en çok bir saattir. İşlemi öğretmen yönetir.',
60:'Bu çalışmada yeniden ısıtılan yemeğin iç sıcaklığı en az 75 °C’ye ulaştırılır. Öğretmen, temiz yemek termometresiyle farklı noktalardan kontrol eder. Yeniden ısıtma, kötü saklanmış yemeği güvenli hâle getirmez.',
70:'Bu atölyede eller temiz kâğıt havluyla kurulanır. Başka işler için kullanılan bezler el kurulamak için kullanılmaz.',
75:'Gösterilen makarna tabağının geniş kenarı ve çukur orta bölümü birlikte incelenir.',
77:'Gösterilen fincan tabağının ortasındaki çukur bölüm, fincanın yerinde durmasına yardımcı olur.',
79:'Bu servis düzeninde fincan, kulpu konuğun sağına bakacak biçimde kendi tabağıyla sunulur.',
81:'Ortak kaptaki pilav, servis için ayrılmış kaşıkla alınır. Konuğun kullandığı kaşık ortak kaba sokulmaz.',
83:'Kevgirin uzun saplı, delikli başı sıvıyı geçirirken yiyeceği almaya yardımcı olur. Ayaklı süzgeç ve tel süzgeç ayrı araçlardır.',
84:'İnce rende, küçük dişleriyle yiyeceği ince parçalar hâlinde rendelemek için kullanılır.',
85:'Unun gram cinsinden miktarı mutfak terazisiyle tartılır.',
92:'Cam kabın mikrodalga fırında kullanıma uygun olduğu belirtilmelidir. Yalnız camdan yapılmış olması yeterli değildir.',
97:'Yırtılmış bulaşık eldiveni kullanılmaz. Temiz, sağlam ve içi kuru bir eldiven seçilir.',
99:'Temiz suyla durulama, deterjan kalıntılarını ve gevşeyen kirleri uzaklaştırır.',
100:'Kirli su boşaltılır ve temiz yıkama suyu hazırlanır. Kirli suyun üzerine su veya deterjan eklemek yeterli değildir.',
105:'Kutunun rengi, yazısı ve atık türünü gösteren simgesi birlikte kontrol edilir. Okulun atık toplama düzenine uyulur.',
108:'Öğrenci tabağına yiyebileceği miktarda yemek alır. Gereğinden fazla alıp bırakmak yemek israfına neden olur.'}
for n,text in explanations.items():qs[n-1]['explanation']=text
for q in qs:q['hint']=q['explanation']
# Duplicate items from different chapter assessments may remain in the bank,
# but must not be drawn into the same mixed assessment/race.
families={'gaz-kokusu':[48,95,104],'sicak-tepsi':[24,71,88],'cig-et-raf':[56,94],
 'kirli-lito':[21,78],'tablet-kuru-el':[65,102],'kaplama-temizlik':[63,98],
 'kaplama-cevirme':[25,86],'un-tartma':[35,85],'mikrodalga-kap':[47,92],
 'ince-rende':[30,84],'makarna-tabagi':[1,75]}
for key,ns in families.items():
 for n in ns:qs[n-1]['equivalenceKey']=key
refs={58:'https://ask.fsis.usda.gov/article/How-do-I-handle-leftovers-safely',59:'https://guvenilirgida.tarimorman.gov.tr/Haber/Detay/15501',60:'https://ordu.tarimorman.gov.tr/Belgeler/G%C4%B1da%20Dergisi/g%C4%B1da%20g%C3%BCvenli%C4%9Fi%20say%C4%B1%2034%20.pdf'}
for n,url in refs.items():qs[n-1]['reviewSource']={'url':url,'checked':'2026-11-06'}
def rename(x):
 if isinstance(x,str):return x.replace('Reçellik','Kahvaltılık kâse').replace('reçellik','kahvaltılık kâse')
 if isinstance(x,list):return [rename(v) for v in x]
 if isinstance(x,dict):return {k:rename(v) for k,v in x.items()}
 return x
data[0]=rename(data[0])
for p,d in zip(paths,data):
 d['revision']='soru-denetimi-20261107-v1';p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print('108 reviewed questions applied with stable IDs and four keyed choices.')
