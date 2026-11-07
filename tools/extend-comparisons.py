"""Reuse intact embedded photos from the user's PDF; create native SVG layouts."""
import base64,json,sys
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]
pdf=fitz.open(sys.argv[1]);out=ROOT/'assets/karsilastirma';src=out/'kaynak'
for name,xref in [('fincan',290),('cay',313),('salata',375),('kase',347),('duz',151)]:
 im=pdf.extract_image(xref);assert im['ext']=='jpeg';(src/('pdf-'+name+'.jpeg')).write_bytes(im['image'])

def photo(file):return 'data:image/jpeg;base64,'+base64.b64encode((ROOT/file).read_bytes()).decode()
def svg(items,target=None,metal=False):
 parts=['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><rect width="960" height="640" fill="white"/>']
 for i,(id,scale,file) in enumerate(items):
  size=290*scale;cx=160+320*i
  parts.append(f'<image x="{cx-size/2}" y="{300-size/2}" width="{size}" height="{size}" preserveAspectRatio="xMidYMid meet" href="{photo(file)}"/>')
  if id==target:parts.append(f'<path data-target="true" d="M {cx} 520 L {cx-25} 563 L {cx+25} 563 Z" fill="#087f79" stroke="#174b49" stroke-width="3"/>')
 return '\n'.join(parts+['</svg>'])
groups={
 'kase':[('guncel-009',1.0,'assets/karsilastirma/kaynak/pdf-salata.jpeg'),('guncel-008',.84,'assets/karsilastirma/kaynak/pdf-kase.jpeg'),('guncel-010',.66,'assets/karsilastirma/kaynak/pdf-kase.jpeg')],
 'altlik':[('guncel-005',1.0,'assets/karsilastirma/kaynak/pdf-duz.jpeg'),('guncel-006',.9,'assets/karsilastirma/kaynak/pdf-fincan.jpeg'),('guncel-007',.75,'assets/karsilastirma/kaynak/pdf-cay.jpeg')],
}
p=ROOT/'content/mutfak-araclari/icerik.json';d=json.loads(p.read_text());ms={m['id']:m for m in d['matches']}
manifest=json.loads((out/'manifest.json').read_text())
for family,rows in groups.items():
 for target,_,_ in rows:
  if target=='guncel-005':continue
  shift=sum(target.encode())%3;peers=rows[shift:]+rows[:shift];file='assets/karsilastirma/'+target+'.svg';(ROOT/file).write_text(svg(peers,target))
  m=ms[target];m.update(image=file,comparison=True,comparisonPosition=[r[0] for r in peers].index(target)+1,prompt='Üçgenin gösterdiği aracın adını seç.',kok='Üçgenin gösterdiği aracın adı nedir?',hint='Üçgenin gösterdiği örneğin biçimini ve boyunu karşılaştır.')
  m['comparisonSource']={'file':'Mutfak_Araclari-3(1).pdf','pages':[5,6]}
  manifest['figures']=[f for f in manifest['figures'] if f['id']!=target]
  manifest['figures'].append({'id':target,'family':family,'image':file,'peers':[r[0] for r in peers],'dimensions':None})
for f in manifest['figures']:
 m=ms[f['id']];m['comparisonPosition']=f['peers'].index(f['id'])+1;m['imageAlt']=f'Üç araç. Üçgen {m["comparisonPosition"]}. aracı gösteriyor.';m['kok']='Üçgenin gösterdiği aracın adı nedir?'
manifest['note']='Ölçüler örnek ürünlere aittir. PDF kaynaklı kâse ve altlık görsellerinde evrensel boyut iddiası yoktur.'
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')

def single(name,file,ratio=1):
 size=580*ratio;svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640"><rect width="640" height="640" fill="white"/><image x="{320-size/2}" y="{320-size/2}" width="{size}" height="{size}" preserveAspectRatio="xMidYMid meet" href="{photo(file)}"/></svg>'
 dest='assets/karsilastirma/'+name+'.svg';(ROOT/dest).write_text(svg);return dest
q=d['questions'];q[0].update(image='assets/karsilastirma/kaynak/makarna-tabagi.jpg',imageAlt='Adı sorulan tabak örneği.')
for c in q[74]['choices']:
 c['image']=single('tabak-secim-'+c['id'],'assets/karsilastirma/kaynak/duz-tabak.jpg',{'A':25,'C':19,'D':16}[c['id']]/30) if c['id']!='B' else 'assets/karsilastirma/kaynak/makarna-tabagi.jpg'
for c,size in zip(q[75]['choices'],[12,21,10,17]):c['image']=single('kasik-secim-'+c['id'],'assets/mutfak-araclari/guncel-023.jpg',size/23)
q[76]['choices'][2]['image']='assets/karsilastirma/kaynak/pdf-fincan.jpeg'
q[83]['choices'][1]['image']='assets/mutfak-araclari/guncel-057.jpg'
q[83]['choices'][2]['image']='assets/mutfak-araclari/guncel-052.jpg'

def card(id,text,task=None):
 m=ms[id];m['explanation']=text;m['detail']=text
 if task:m['task']=task
card('guncel-010','Kahvaltılık kâse, reçel, bal, zeytin ve peynir gibi yiyecekleri küçük porsiyonlar hâlinde sunmak için kullanılır. Her yiyecek ayrı kâseye konur. Bu karşılaştırmada en küçük kâsedir; kâse boyları modele göre değişir.','Kahvaltılıkları küçük porsiyonlar hâlinde sunmak için kullanılan örnek.')
card('guncel-006','Fincanın altına konur. Bu örnekte ortasında fincanın oturacağı çukur bölüm vardır. Fincan kendi tabağıyla eşleştirilir. Çay tabağından yalnız boyuna göre ayırt edilmez.','Fincanın altına konan, ortasında oturma bölümü bulunan örnek.')
card('guncel-007','Çay bardağının altına konur. Çay bardağı kendi tabağıyla eşleştirilir. Bu örneğin biçimi ve kenarları fincan tabağıyla karşılaştırılır. Her modelde boy farkı aynı değildir.','Çay bardağının altına konan örnek.')
card('guncel-074','Ayaklı süzgeç, yiyeceklerin suyunu süzmek için kullanılır. Sıcak suyu süzme işlemini öğretmen yapar.')
card('guncel-077','Kevgir, uzun saplı ve delikli başı olan araçtır. Yiyeceği sıvısından ayırarak almak için kullanılır. Kepçenin başı deliksizdir. Ayaklı süzgeç ve tel süzgeç ayrı araçlardır. Sıcak suyla ilgili işlemi öğretmen yapar; öğrenci sıcak su ve buhardan uzakta durur.')
ms['guncel-074']['answer']='Ayaklı süzgeç'
for m in d['matches']:
 for field in ['similar','disla']:
  if field in m:m[field]=['Ayaklı süzgeç' if x=='Süzgeç' else x for x in m[field]]
for k,vs in d.get('distractors',{}).items():d['distractors'][k]=['Ayaklı süzgeç' if x=='Süzgeç' else x for x in vs]
micro=ms['guncel-098'];micro['detail']=micro.get('detail','').replace('74 °C','75 °C');micro['detail']+=' Bu sıcaklık, güvenli saklanmış artan yemeği yeniden ısıtmak içindir; bütün yiyeceklerin ilk pişirme sıcaklığı değildir.'
ms['guncel-106']['detail']+=' Artan pişmiş yemeğin saklama süresi, yiyeceğe ve güvenli soğutma koşullarına göre öğretmen tarafından kontrol edilir.'
for id,key in {'guncel-003':'makarna-tabagi','guncel-055':'ince-rende','guncel-010':'kahvalti-kasesi'}.items():ms[id]['equivalenceKey']=key
q[2]['equivalenceKey']='kahvalti-kasesi'
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print('24 target figures, user PDF photographs and reviewed MCQ images ready.')
