"""Almendra Bold OFL türevi: Türkçe glifler, ayrılmış yeni aile adı."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.transformPen import TransformPen
root = Path(__file__).resolve().parents[1]
f = TTFont(root/'assets/yazi/almendra-bold.ttf')
gs = f.getGlyphSet()
def draw(pen, name, dx=0, dy=0):
    rec = DecomposingRecordingPen(gs); gs[name].draw(rec)
    rec.replay(TransformPen(pen, (1,0,0,1,dx,dy)))
for code, name, base, mark in [(0x11f,'gbreve','g','breve'),(0x11e,'Gbreve','G','breve'),(0x130,'Idotaccent','I','dotaccentcmb.cap'),(0x15f,'scedilla','s','cedilla'),(0x15e,'Scedilla','S','cedilla')]:
    p = TTGlyphPen(None); draw(p, base)
    g=f['glyf'][base];g.recalcBounds(f['glyf']);cx=(g.xMin+g.xMax)/2
    if mark=='breve':
        y=g.yMax+80
        p.moveTo((cx-85,y+30));p.qCurveTo((cx,y-65),(cx+85,y+30));p.lineTo((cx+66,y+49));p.qCurveTo((cx,y-6),(cx-66,y+49));p.closePath()
    else:
        m=f['glyf'][mark];m.recalcBounds(f['glyf']);dx=round(cx-(m.xMin+m.xMax)/2)
        dy=round(g.yMax+65-m.yMin) if 'dot' in mark else 0
        draw(p,mark,dx,dy)
    f['glyf'][name]=p.glyph();f['hmtx'][name]=f['hmtx'][base]
    for c in f['cmap'].tables:
        if c.isUnicode():c.cmap[code]=name
f.setGlyphOrder(f.getGlyphOrder())
for n in f['name'].names:
    if n.nameID in [1,2,3,4,6,16,17]:
        value={1:'Lonca Hikaye',2:'Bold',3:'LoncaHikaye-Bold-20261116',4:'Lonca Hikaye Bold',6:'LoncaHikaye-Bold',16:'Lonca Hikaye',17:'Bold'}[n.nameID]
        n.string=value.encode(n.getEncoding())
f.save(root/'assets/yazi/lonca-hikaye-bold.ttf')
assert all(ord(x) in f.getBestCmap() for x in 'çÇğĞıİöÖşŞüÜ')
print('Türkçe glifler hazır: Lonca Hikaye (Almendra Bold OFL türevi).')
