"""Check generated examples with PyMuPDF; run from the repository root."""
import json
from pathlib import Path
import fitz
out=[]
for p in Path('artifacts').glob('*.pdf'):
 d=fitz.open(p);txt='\n'.join(page.get_text() for page in d)
 width,height=(297,210) if p.name.startswith('cronologia') else (210,297)
 for page in d:
  assert abs(page.rect.width*25.4/72-width)<.1 and abs(page.rect.height*25.4/72-height)<.1
 if p.name.startswith('libro'): assert all('FIN PÁGINA '+str(i) in txt for i in range(5)) and 'FIN CONTRATAPA' in txt
 if p.name.startswith('cartas'): assert 'FIN CARTA UNO' in txt and 'FIN CARTA DOS' in txt and len(d)>1
 if p.name.startswith('cronologia'): assert all('FIN MOMENTO '+str(i) in txt for i in range(9))
 if p.name.startswith('mazo'):
  assert len(d)==4
  rects=d[0].get_image_rects(d[0].get_images()[0][0]);assert len(rects)==9
  assert all(abs(r.width*25.4/72-63)<.1 and abs(r.height*25.4/72-90)<.1 for r in rects)
  # Partial second sheet: two fronts, two reverses reflected across the vertical axis.
  fronts=d[2].get_image_rects(d[2].get_images()[0][0]);assert len(fronts)==2
  backs=[x['rect'] for x in d[3].get_drawings() if x.get('fill') and abs(x['rect'].width*25.4/72-63)<.1]
  assert len(backs)==2
  for a,z in zip(fronts,backs): assert abs((a.x0+z.x1)*25.4/72-210)<.1
 d[0].get_pixmap().save('artifacts/'+p.stem+'.png')
 out.append({'file':p.name,'pages':len(d),'selectable_characters':len(txt),'size_mm':[width,height]})
Path('artifacts/pdf-verificacion.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
