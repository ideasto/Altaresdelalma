"""Synthetic browser checks; native sharing is simulated, never posts to a network."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MEMORIA_TEST_URL', 'http://127.0.0.1:3100')
OUT = Path(os.environ.get('MEMORIA_TEST_OUTPUT', '/tmp/memoria-sharing-qa'))
OUT.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    context = browser.new_context(accept_downloads=True, viewport={'width': 1440, 'height': 1050})
    page = context.new_page()
    errors = []
    external = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    def route(r):
        if r.request.url.startswith((BASE+'/', 'blob:', 'data:')): r.continue_()
        else: external.append(r.request.url); r.abort()
    page.route('**/*', route)
    page.goto(BASE, wait_until='networkidle')
    photo = page.evaluate("""() => { const c=document.createElement('canvas'); c.width=1200;c.height=800;
      const x=c.getContext('2d');x.fillStyle='#347ca9';x.fillRect(0,0,1200,800);return c.toDataURL('image/jpeg'); }""")
    fixture = {'id':'share-test','name':'Recuerdo de prueba','photo':photo,'photoCropped':photo,
      'gallery':{'folders':[],'photos':[{'id':'p1','src':photo,'caption':'Primera foto'},{'id':'p2','src':photo,'caption':'Segunda foto'}]},
      'cards':[{'id':'c1','message':'Una frase que quiero conservar.','name':'Un recuerdo','origin':'recordada'}],
      'letters':[{'id':'l1','to':'Un recuerdo','date':'2026-11-06','body':('Una línea de prueba.\n'*70)+'FIN CARTA','sign':'Firma de prueba'}],
      'timeline':[{'id':'t1','title':'Primer momento','date':'2020','description':'Una escena cotidiana.','icon':'dot','photo':photo},{'id':'t2','title':'Sin fecha','description':'Otro recuerdo.','icon':'dot'}],
      'book':[{'id':'b1','title':'Una página','text':('Una historia para compartir sin cortar. '*120)+'FIN PAGINA','photo':photo,'font':'manuscrita'}],
      'bookMeta':{'title':'Libro de prueba','backText':'Una presentación escrita por mí.'}}
    page.evaluate('(s)=>{localStorage.clear();localStorage.setItem("ma_data_v1",JSON.stringify(s));localStorage.setItem("altares_welcome_seen","1")}', {'avatars':[fixture],'trash':[]})
    context.add_init_script("""window._shared=[];window._shareError='';
      Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});
      Object.defineProperty(navigator,'share',{configurable:true,value:async d=>{
        window._shared.push({count:d.files.length,active:navigator.userActivation.isActive,names:d.files.map(f=>f.name)});
        if(window._shareError)throw new DOMException('Simulado',window._shareError);
      }});""")
    def visit(module): page.goto(BASE+'/espacio/share-test/'+module, wait_until='networkidle')
    def ready():
        page.get_by_test_id('share-preview').wait_for(timeout=20000)
        return int(page.get_by_test_id('share-count').inner_text().split(' de ')[1])
    def close():
        dialog=page.get_by_test_id('share-dialog');dialog.get_by_test_id('modal-close').click();dialog.wait_for(state='hidden')

    visit('oraculo');page.get_by_test_id('oraculo-share-c1').click();assert ready()==1
    page.get_by_test_id('share-native').click();assert page.evaluate('window._shared[0].active')
    page.evaluate("window._shareError='AbortError'");page.get_by_test_id('share-native').click()
    assert not page.get_by_text('No se abrió el menú', exact=False).count()
    page.evaluate("window._shareError='NotAllowedError'");page.get_by_test_id('share-native').click()
    page.get_by_text('No se abrió el menú', exact=False).wait_for()
    with page.expect_download() as d: page.get_by_test_id('share-download').click()
    target=OUT/'mazo.png';d.value.save_as(target);assert target.read_bytes().startswith(b'\x89PNG')
    page.screenshot(path=str(OUT/'mazo-preview.png'), full_page=True);close()

    visit('galeria');page.get_by_test_id('galeria-select-p1').click();page.get_by_test_id('galeria-select-p2').click();page.get_by_test_id('galeria-share-selection').click();assert ready()==2
    page.get_by_test_id('share-native').click();assert page.evaluate('window._shared[0].count')==2;close()
    page.get_by_test_id('galeria-open-p1').click();page.get_by_test_id('lightbox-share').click();assert ready()==1
    # The share dialog must be above the photo reader and accept clicks.
    page.get_by_test_id('share-download').click();close()

    visit('linea');page.get_by_test_id('timeline-share').click();assert ready()==2;close()
    page.get_by_test_id('timeline-share-t2').click();assert ready()==1;close()

    visit('libro');page.get_by_test_id('libro-share').click();assert ready()==1;close()
    page.get_by_test_id('libro-next').click();page.get_by_test_id('libro-page-b1').wait_for();page.get_by_test_id('libro-share').click();pages=ready();assert pages>1
    for _ in range(pages-1):page.get_by_test_id('share-next').click()
    with page.expect_download() as d:page.get_by_test_id('share-download').click()
    d.value.save_as(OUT/'pagina-final.png');assert (OUT/'pagina-final.png').read_bytes().startswith(b'\x89PNG');close()
    page.get_by_test_id('libro-edit-b1').click();page.get_by_test_id('libro-text-input').fill('Mi texto anterior.');page.get_by_test_id('writing-ideas').get_by_role('button').click();page.get_by_role('button',name='Aquel día…',exact=True).click();assert page.get_by_test_id('libro-text-input').input_value()=='Mi texto anterior.\n\nAquel día…'

    visit('cartas');page.get_by_test_id('carta-l1').click();page.get_by_test_id('carta-share').click();assert ready()>1;close()
    page.get_by_test_id('carta-reader').get_by_test_id('modal-close').click()
    page.get_by_test_id('cartas-add').click();page.get_by_test_id('carta-body-input').fill('Texto mío.');page.get_by_test_id('writing-ideas').get_by_role('button').click();page.get_by_role('button',name='Hoy quería contarte…',exact=True).click();assert page.get_by_test_id('carta-body-input').input_value().startswith('Texto mío.\n\n')

    visit('linea');page.set_viewport_size({'width':390,'height':844});page.get_by_test_id('timeline-share').click();ready()
    page.evaluate("Object.defineProperty(navigator,'canShare',{value:undefined,configurable:true})")
    page.get_by_test_id('share-next').click();assert page.get_by_test_id('share-native').count()==0
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.screenshot(path=str(OUT/'movil-share.png'),full_page=True)
    assert not errors,errors
    assert not external,external
    report={'modules':5,'multiple_photos':True,'long_content_paginated':True,'native_share_simulated':True,'explicit_user_activation':True,'cancel_and_error_handled':True,'download_fallback':True,'writing_ideas_preserve_text':True,'mobile_overflow':False,'javascript_errors':errors,'external_requests':external,'actual_social_network_posting_tested':False}
    (OUT/'verification.json').write_text(json.dumps(report,indent=2))
    print(json.dumps(report));browser.close()
