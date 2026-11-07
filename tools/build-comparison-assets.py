"""Compose exact-scale SVG teaching figures from intact photographs.

SVG owns placement, scale, measurement text and the target triangle. No names
or answer keys are embedded in a figure. Existing card IDs remain unchanged.
"""
import base64
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/karsilastirma'

for name in ['duz-tabak', 'corba-tabagi', 'makarna-tabagi']:
    source = OUT / 'kaynak' / (name + '.png')
    dest = source.with_suffix('.jpg')
    if source.exists():
        Image.open(source).convert('RGB').save(dest, quality=90, optimize=True)
    elif not dest.exists():
        raise FileNotFoundError(dest)

flat = 'assets/karsilastirma/kaynak/duz-tabak.jpg'
soup = 'assets/karsilastirma/kaynak/corba-tabagi.jpg'
pasta = 'assets/karsilastirma/kaynak/makarna-tabagi.jpg'
fork = 'assets/mutfak-araclari/guncel-018.jpg'
knife = 'assets/meb-servis/meb-009.jpg'
spoon = 'assets/mutfak-araclari/guncel-023.jpg'

families = {
    'duz': [('guncel-001',25,flat), ('guncel-004',19,flat), ('guncel-005',16,flat)],
    'buyuk-duz': [('meb-001',30,flat), ('guncel-001',25,flat), ('meb-002',22,flat)],
    'cukur': [('guncel-003',27,pasta), ('guncel-002',24,soup), ('meb-003',20,soup)],
    'catal': [('guncel-018',20,fork), ('guncel-020',18,fork), ('guncel-021',16,fork)],
    'bicak': [('guncel-019',23,knife), ('meb-009',21,knife), ('meb-011',18,knife)],
    'kasik': [('guncel-023',21,spoon), ('meb-010',19,spoon), ('guncel-024',17,spoon)],
    # Tea/coffee sizes below are layout ratios, not claimed product dimensions.
    'kucuk-kasik': [('guncel-024',17,spoon), ('guncel-025',12,spoon), ('meb-017',10,spoon)],
}
targets = {row[0]: name for name, rows in families.items() for row in rows}
targets['guncel-001'] = 'duz'
targets['guncel-024'] = 'kasik'

def embedded(path):
    return 'data:image/jpeg;base64,' + base64.b64encode((ROOT/path).read_bytes()).decode()

manifest = {'source': 'Temel Mutfak ve Servis Becerileri 9, s.35 ve 38',
            'note': 'Örnek ölçüler evrensel ürün standardı değildir. Küçük kaşıklarda yalnız göreli boy gösterilir.',
            'figures': []}
for target, family in targets.items():
    rows = families[family]
    metal = family in ['catal','bicak','kasik','kucuk-kasik']
    # A fixed common scale is used within each family, never fit each object
    # independently to its cell. Reorder peers by target so position is not a key.
    shift = sum(target.encode()) % 3
    rows = rows[shift:] + rows[:shift]
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">',
             '<title>Üçgenle işaretlenen aracı karşılaştırarak tanıma</title>',
             '<rect width="960" height="640" fill="white"/>']
    # Store each photograph once; repeated instances share the same symbol.
    # This keeps offline files and downloads small without changing pixels.
    photos = list(dict.fromkeys(row[2] for row in rows))
    parts.append('<defs>')
    for n,photo in enumerate(photos):
        parts.append(f'<symbol id="photo{n}" viewBox="0 0 1 1"><image width="1" height="1" href="{embedded(photo)}" preserveAspectRatio="xMidYMid meet"/></symbol>')
    parts.append('</defs>')
    for i, (item, size, photo) in enumerate(rows):
        cx = 160 + i*320
        if metal:
            h = 460 * size / 23
            w = h
            y = 495 - h
        else:
            # Generated sources share square framing. Dish diameters remain
            # proportional because every flat plate uses the same photograph.
            w = 310 * size / 30
            h = w
            y = 275 - h/2
        parts.append(f'<use x="{cx-w/2:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" href="#photo{photos.index(photo)}"/>')
        if family != 'kucuk-kasik':
            parts.append(f'<text x="{cx}" y="540" text-anchor="middle" font-family="Arial,sans-serif" font-size="48" fill="#193b3b">{size} cm</text>')
        if item == target:
            parts.append(f'<path data-target="true" d="M {cx} 558 L {cx-25} 601 L {cx+25} 601 Z" fill="#087f79" stroke="#174b49" stroke-width="3"/>')
    parts.append('</svg>')
    name = 'assets/karsilastirma/' + target + '.svg'
    (ROOT/name).write_text('\n'.join(parts))
    manifest['figures'].append({'id':target,'family':family,'image':name,'peers':[r[0] for r in rows],
                                'dimensions':None if family=='kucuk-kasik' else [r[1] for r in rows]})
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')

path = ROOT/'content/mutfak-araclari/icerik.json'
data = json.loads(path.read_text())
replacement = {}
for item in data['matches']:
    if item['id'] not in targets:
        continue
    replacement[item['image']] = 'assets/karsilastirma/'+item['id']+'.svg'
    item['image'] = replacement[item['image']]
    item['comparison'] = True
    item['imageAlt'] = 'Üç araç arasından üçgenle işaretlenen örnek'
    item['prompt'] = 'Üçgenle işaretlenen aracın adı nedir?'
    item['hint'] = 'Üçgenin gösterdiği aracın boyunu ve biçimini diğer örneklerle karşılaştır.'
    prefix = 'Üçgenin gösterdiği örneği incele. '
    item['task'] = prefix+item.get('task','').removeprefix(prefix)

# Preserve every key/answer/choice; only route references to the same identity
# through the reviewed comparison figure, including content question images.
def replace_images(node):
    if isinstance(node,dict):
        for key,value in node.items():
            if key=='image' and isinstance(value,str) and value in replacement:
                node[key]=replacement[value]
            else:
                replace_images(value)
    elif isinstance(node,list):
        for value in node: replace_images(value)
replace_images(data)
data['revision'] = str(data.get('revision','')).split('-karsilastirma-')[0] + '-karsilastirma-20261106'
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f'{len(targets)} comparison figures; all card IDs and answer keys retained.')
