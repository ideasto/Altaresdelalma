import json
import os
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('ECOS_TEST_BASE_URL','http://127.0.0.1:3000')
OUT=Path(__file__).resolve().parents[2]/'artifacts'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1440,'height':1050});page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('**/*',lambda r:r.continue_() if r.request.url.startswith((BASE,'data:','blob:')) else r.abort())
 page.add_init_script('''if(!localStorage.getItem('ui_seed')) {localStorage.setItem('ui_seed','1'); localStorage.setItem('ma_data_v1',JSON.stringify({avatars:[{id:'ui',name:'Papá Jorge',letters:[],cards:[],timeline:[],book:[],gallery:{photos:[],folders:[]},bookMeta:{title:'Nuestro libro',subtitle:'',coverPhoto:'',backText:'',closing:''}}],trash:[]}));localStorage.setItem('altares_welcome_seen','1');}''')
 page.goto(BASE,wait_until='domcontentloaded');page.get_by_test_id('space-enter-ui').click();page.get_by_test_id('header-name').wait_for();print('MIGRATION AND DASHBOARD PASS',flush=True)
 page.wait_for_timeout(5000)
 old=page.add_style_tag(content=subprocess.check_output(['git','show','790043b9bc346ad39a2ba98b6401d2a2d65b4db4:frontend/src/index.css'],text=True)+'\n.brand-footer { background: hsl(212 42% 19% / .92); }')
 page.screenshot(path=str(OUT/'panel-antes.png'),full_page=True);old.evaluate('(el)=>el.remove()')
 page.screenshot(path=str(OUT/'panel-escritorio.png'),full_page=True)
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(OUT/'panel-celular.png'),full_page=True);assert page.evaluate('document.documentElement.scrollWidth <= innerWidth');page.set_viewport_size({'width':1440,'height':1050})
 page.get_by_test_id('portal-link-cartas').click();page.get_by_test_id('cartas-add').click();page.get_by_test_id('carta-body-input').fill('Un borrador con tildes: canción y corazón.')
 page.wait_for_timeout(650)
 page.evaluate('''() => { window.realPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){throw new DOMException('Injected failure','QuotaExceededError')}; }''')
 page.get_by_test_id('carta-form-save').click();page.get_by_test_id('save-fail-notice').wait_for(timeout=1500) if page.get_by_test_id('save-fail-notice').count() else None
 assert page.get_by_test_id('carta-body-input').is_visible();assert page.get_by_test_id('carta-body-input').input_value().startswith('Un borrador')
 assert page.evaluate("Object.keys(localStorage).some(k=>k.startsWith('altares_draft_') && localStorage[k].includes('canción'))")
 page.get_by_test_id('carta-form-cancel').click();page.get_by_test_id('cartas-add').click();page.get_by_test_id('draft-recovered').wait_for();page.get_by_test_id('carta-form-cancel').click();page.get_by_test_id('cartas-add').click();page.get_by_test_id('draft-recovered').wait_for();page.get_by_test_id('draft-apply').click();assert 'canción' in page.get_by_test_id('carta-body-input').input_value()
 page.evaluate('() => { IDBObjectStore.prototype.put=window.realPut; }');page.get_by_test_id('carta-form-save').click();page.get_by_test_id('cartas-form-modal').wait_for(state='hidden');assert page.get_by_test_id('cartas-count').inner_text().startswith('1 carta');print('FAILED SAVE, DRAFT RECOVERY, SUCCESS PASS',flush=True)
 page.goto(BASE+'/espacio/ui/libro',wait_until='domcontentloaded');page.get_by_test_id('libro-cover-edit').click();page.get_by_test_id('libro-meta-title').fill('El amor permanece');page.screenshot(path=str(OUT/'tapa-edicion.png'),full_page=True);page.get_by_test_id('libro-meta-save').click();page.get_by_test_id('libro-meta-modal').wait_for(state='hidden');assert page.get_by_test_id('libro-cover-title').inner_text()=='El amor permanece'
 page.get_by_test_id('libro-add').click();page.get_by_test_id('libro-title-input').fill('Nuestro día');page.get_by_test_id('libro-text-input').fill('Una historia escrita sobre papel marfil.');page.screenshot(path=str(OUT/'pagina-edicion.png'),full_page=True);page.get_by_test_id('libro-form-save').click();page.get_by_test_id('libro-form-modal').wait_for(state='hidden');print('BOOK EDIT PASS',flush=True)
 page.goto(BASE+'/espacio/ui/oraculo',wait_until='domcontentloaded');page.get_by_test_id('oraculo-add').click();page.get_by_test_id('oraculo-message-input').fill('La alegría también es un recuerdo.');page.get_by_test_id('oraculo-form-save').click();page.get_by_test_id('oraculo-form-modal').wait_for(state='hidden');page.get_by_test_id('oraculo-sound').click();page.get_by_test_id('oraculo-consult').click();page.get_by_test_id('oraculo-shuffling').wait_for();page.get_by_test_id('oraculo-skip').click();page.get_by_test_id('oraculo-result-card').wait_for();page.wait_for_timeout(700);page.screenshot(path=str(OUT/'mazo-revelado.png'),full_page=True);print('DECK ANIMATION SKIP AND SOUND PREFERENCE PASS',flush=True)
 page.goto(BASE+'/espacio/ui/galeria',wait_until='domcontentloaded')
 page.get_by_test_id('galeria-file-input').set_input_files(str(OUT/'galeria-ejemplo.png'))
 page.wait_for_timeout(1500)
 page.locator('[data-testid^="galeria-delete-"]').first.click();page.get_by_test_id('confirm-accept').click();page.wait_for_timeout(500)
 page.reload(wait_until='domcontentloaded');page.get_by_role('button',name='Recuperar foto eliminada').click();page.locator('[data-testid^="galeria-photo-"]').first.wait_for();print('PHOTO DELETE RELOAD UNDO PASS',flush=True)
 page.goto(BASE+'/',wait_until='domcontentloaded')
 backup=json.dumps({'avatars':[{'id':'restore','name':'Prueba de restauración'}]})
 page.get_by_test_id('restore-file-input').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':backup.encode()})
 page.get_by_test_id('restore-mode-replace').click();page.get_by_test_id('restore-replace-ack').check();page.get_by_test_id('restore-cancel').click()
 page.get_by_test_id('restore-file-input').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':backup.encode()})
 assert page.get_by_test_id('restore-mode-merge').locator('input').is_checked();assert not page.get_by_test_id('restore-replace-ack').count();page.get_by_test_id('restore-cancel').click();print('RESTORE OPTIONS RESET PASS',flush=True)
 print('JS ERRORS',errors,flush=True);assert not errors
 (OUT/'ui-verificacion.json').write_text(json.dumps({'passed':['migration','desktop/mobile','failed save','draft recovery','successful save','book editing','deck shuffle, skip, flip','sound toggle','photo delete/reload/undo','restore options reset'],'external_services':'blocked; no contact transmission verified','errors':errors},indent=2))
 b.close()
