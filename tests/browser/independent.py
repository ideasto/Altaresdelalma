"""Validate the actual production UI with all external requests denied and recorded.
Start serve_static.py on 3100 using the clean build first. Requires Playwright + Chromium.
"""
import base64,json,os
import fitz
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'artifacts/independiente';OUT.mkdir(exist_ok=True)
BASE='http://127.0.0.1:3100'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 c=b.new_context(accept_downloads=True,viewport={'width':1440,'height':1000});page=c.new_page();external=[];errors=[];bad=[]
 def intercept(route):
  if route.request.url.startswith((BASE+'/', 'blob:', 'data:')):route.continue_()
  else: external.append(route.request.url);route.abort()
 page.route('**/*',intercept);page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:bad.append(r.url) if r.status>=400 else None)
 # Synthetic image made in the browser. All storage keys remain the app's original keys.
 page.goto(BASE,wait_until='networkidle')
 photo=page.evaluate('''()=>{const c=document.createElement('canvas');c.width=1200;c.height=800;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,1200,800);g.addColorStop(0,'#356b8c');g.addColorStop(1,'#e5cf83');x.fillStyle=g;x.fillRect(0,0,1200,800);x.fillStyle='white';x.font='48px serif';x.fillText('Una foto de prueba',60,120);return c.toDataURL('image/jpeg',.92)}''')
 image_file=OUT/'foto-prueba.jpg';image_file.write_bytes(base64.b64decode(photo.split(',')[1]))
 fixture={'id':'independent','name':'Papá Jorge','photo':photo,'photoCropped':photo,'phrase':'Tu luz nos acompaña','gallery':{'folders':[],'photos':[{'id':'p1','src':photo,'caption':'Un viaje familiar'}]},'cards':[{'id':'c1','message':'La alegría vive en los pequeños recuerdos.','name':'Papá Jorge','origin':'recordada'}], 'letters':[{'id':'l1','date':'2026-10-31','to':'Papá Jorge','body':('Una canción y un recuerdo.\n'*80)+'FIN CARTA INDEPENDIENTE','sign':'Sole, tu hija'}], 'timeline':[{'id':'t1','date':'2020-05','title':'Un viaje familiar','description':'Un recuerdo sin inventar el día.','icon':'dot','photo':photo}], 'book':[{'id':'b1','title':'Nuestro día','text':('Una historia con tildes y compañía. '*100)+'FIN LIBRO INDEPENDIENTE','photo':photo}], 'bookMeta':{'title':'El amor permanece','subtitle':'Una historia querida','coverPhoto':photo,'backText':'Nuestros recuerdos compartidos.','closing':'Con amor, Sole'}}
 # Fresh context so the normal localStorage migration, not a test stub, loads this backup.
 c.close();c=b.new_context(accept_downloads=True,viewport={'width':1440,'height':1000});page=c.new_page();page.route('**/*',intercept);page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:bad.append(r.url) if r.status>=400 else None)
 seed=json.dumps({'avatars':[fixture],'trash':[]})
 c.add_init_script("if(!localStorage.getItem('independent_test_seed')){localStorage.setItem('independent_test_seed','1');localStorage.setItem('ma_data_v1',"+json.dumps(seed)+");localStorage.setItem('altares_welcome_seen','1');}")
 page.goto(BASE+'/espacio/independent',wait_until='networkidle');page.get_by_test_id('header-name').wait_for()
 page.evaluate('document.fonts.ready');assert page.evaluate("document.fonts.check('16px \"Plus Jakarta Sans\"') && document.fonts.check('16px \"Cormorant Garamond\"')")
 page.screenshot(path=str(OUT/'panel-escritorio.png'),full_page=True)
 routes=['/','/espacio/independent','/espacio/independent/galeria','/espacio/independent/oraculo','/espacio/independent/linea','/espacio/independent/cartas','/espacio/independent/libro','/terminos','/privacidad']
 for path in routes:
  response=page.goto(BASE+path,wait_until='networkidle');assert response.status==200,path
  page.reload(wait_until='networkidle');assert page.locator('#root').inner_text().strip(),path
 page.goto(BASE+'/avatar/independent/libro',wait_until='networkidle');assert '/espacio/independent/libro' in page.url
 print('DIRECT ROUTES, RELOAD, LEGACY ROUTE, LOCAL FONTS PASS',flush=True)
 for module,button in [('galeria','galeria-pdf'),('oraculo','oraculo-pdf'),('linea','timeline-pdf'),('cartas','cartas-pdf-all'),('libro','libro-pdf')]:
  page.goto(BASE+'/espacio/independent/'+module,wait_until='networkidle')
  if module=='galeria':
   page.get_by_test_id('galeria-file-input').set_input_files(str(image_file));page.wait_for_timeout(1000);assert page.locator('[data-testid^="galeria-photo-"]').count()==2
  if module=='libro':
   page.get_by_test_id('libro-cover-edit').click();page.get_by_test_id('libro-meta-title').fill('Nuestro libro independiente');page.get_by_test_id('libro-meta-save').click();page.get_by_test_id('libro-meta-modal').wait_for(state='hidden')
  if module=='linea':
   page.get_by_test_id(button).click();button='timeline-export-generate'
  with page.expect_download(timeout=60000) as dl:page.get_by_test_id(button).click()
  target=OUT/(module+'.pdf');dl.value.save_as(target);assert target.read_bytes().startswith(b'%PDF-')
  doc=fitz.open(target);text=' '.join(' '.join(p.get_text() for p in doc).split())
  if module=='cartas':assert 'FIN CARTA INDEPENDIENTE' in text
  if module=='libro':assert 'FIN LIBRO INDEPENDIENTE' in text and 'Nuestro libro independiente' in text
  w,h=(297,210) if module=='linea' else (210,297)
  assert all(abs(p.rect.width*25.4/72-w)<.1 and abs(p.rect.height*25.4/72-h)<.1 for p in doc)
  doc.close()
  print('MODULE AND PDF',module,'PASS',flush=True)
 page.goto(BASE+'/espacio/independent/cartas',wait_until='networkidle');page.get_by_test_id('cartas-add').click();page.get_by_test_id('carta-body-input').fill('Texto guardado sin servicios de plataforma.');page.get_by_test_id('carta-form-save').click();page.get_by_test_id('cartas-form-modal').wait_for(state='hidden');page.reload(wait_until='networkidle');assert page.get_by_test_id('cartas-count').inner_text().startswith('2 cartas')
 page.goto(BASE+'/espacio/independent',wait_until='networkidle');page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(OUT/'panel-celular.png'),full_page=True);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not external,external;assert not errors,errors;assert not bad,bad
 report={'build':'clean Node 22 + frozen yarn.lock','routes_and_reload':routes,'legacy_route':True,'modules_and_pdf':5,'photo_upload':True,'letter_save_and_reload':True,'book_cover_edit':True,'local_fonts':True,'external_requests':external,'javascript_errors':errors,'http_errors':bad,'blocked_external_network':True,'vercel_deployed':False}
 (OUT/'verificacion.json').write_text(json.dumps(report,indent=2,ensure_ascii=False));print(json.dumps(report),flush=True);b.close()
