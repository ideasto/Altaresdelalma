"""Run after building tests/browser/entry.js with webpack's Node API.
Needs the app on port 3000, Playwright, Chromium and /tmp/ecos-validation/validation.js.
External services are blocked; all data is synthetic and isolated per browser context.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT = Path(os.environ.get('ECOS_TEST_OUTPUT', str(Path(__file__).resolve().parents[2] / 'artifacts'))); OUT.mkdir(parents=True, exist_ok=True)
results = []
with sync_playwright() as p:
 b = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
 context = b.new_context(accept_downloads=True, viewport={'width':1440,'height':1050})
 page = context.new_page()
 page.route('**/*',lambda r: r.continue_() if r.request.url.startswith(('http://127.0.0.1:3000','data:','blob:')) else r.abort())
 page.goto('http://127.0.0.1:3000',wait_until='domcontentloaded')
 page.add_script_tag(path='/tmp/ecos-validation/validation.js')
 result = page.evaluate('''async () => {
 const E=window.ecos; const assert=(v,m)=>{if(!v)throw Error(m)};
 const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=1200;
 const ctx=canvas.getContext('2d');const d=ctx.createImageData(1800,1200);
 for(let i=0;i<d.data.length;i+=4){ const n=Math.random()*70;d.data[i]=40+n;d.data[i+1]=100+n;d.data[i+2]=150+n;d.data[i+3]=255; }ctx.putImageData(d,0,0);
 const photos=[];for(let i=0;i<24;i++){ctx.fillStyle='#fff7da';ctx.fillRect(20,20,500,120);ctx.fillStyle='#234766';ctx.font='48px serif';ctx.fillText('Recuerdo de prueba '+i,35,95);photos.push({id:'p'+i,src:canvas.toDataURL('image/jpeg',.92),caption:'Árbol, canción y memoria '+i});}
 const a=E.newAvatar({id:'sample',name:'Papá Jorge',photo:photos[0].src,photoCropped:photos[0].src,phrase:'Tu luz nos acompaña',gallery:{folders:[],photos},cards:Array.from({length:11},(_,i)=>({id:'c'+i,message:'La alegría también vive en los pequeños recuerdos. '+i,name:'Papá Jorge',origin:'recordada'})),letters:[{id:'l1',date:'2026-10-30',to:'Papá Jorge',body:('Querido papá: una canción, un árbol, una emoción.\\n').repeat(130)+'FIN CARTA UNO',sign:'Sole, tu hija'},{id:'l2',date:'2026-10-30',to:'Papá Jorge',body:'Otra carta completa. FIN CARTA DOS',sign:'Sole'}],book:Array.from({length:5},(_,i)=>({id:'b'+i,title:'Recuerdo '+i,text:('Un día de alegría, canción y compañía. ').repeat(80)+'FIN PÁGINA '+i,photo:photos[i].src})),bookMeta:{title:'El amor permanece',subtitle:'Nuestra historia compartida',coverPhoto:photos[0].src,backText:('Este libro guarda momentos y palabras queridas. ').repeat(40)+'FIN CONTRATAPA',closing:'Con amor, Sole'},timeline:Array.from({length:9},(_,i)=>({id:'t'+i,date:i===0?'1946':i===1?'2020-05':'',title:'Un viaje familiar '+i,description:('Una historia con tildes y recuerdos. ').repeat(i===0?30:3)+'FIN MOMENTO '+i,icon:'dot',photo:photos[i].src}))});
 const state={avatars:[a],trash:[{space:E.newAvatar({id:'trash',name:'Papelera',photo:photos[1].src}),deletedAt:'2026-10-30'}]};
 assert((await E.writeAll(state)).ok,'initial write');
 const loaded=await E.loadAll();assert(JSON.stringify(loaded.avatars)===JSON.stringify(state.avatars),'full image/text roundtrip');assert(JSON.stringify(loaded.trash)===JSON.stringify(state.trash),'trash roundtrip');
 const put=IDBObjectStore.prototype.put; IDBObjectStore.prototype.put=function(...args){if(this.name==='meta')throw new DOMException('Injected quota','QuotaExceededError');return put.apply(this,args)};
 try{const res=await E.writeAll({avatars:[],trash:[]});assert(!res.ok,'quota failure reported');}finally{IDBObjectStore.prototype.put=put;}
 const after=await E.loadAll();assert(JSON.stringify(after.avatars)===JSON.stringify(state.avatars),'atomic replacement preserves old data');
 const compact=E.newAvatar({name:'Lectura llena'}); localStorage.setItem(E.KEY,JSON.stringify({avatars:[compact],trash:[]}));
 const set=Storage.prototype.setItem; Storage.prototype.setItem=()=>{throw new DOMException('full','QuotaExceededError')};
 try {assert(E.readStorage().avatars[0].name==='Lectura llena','quota does not block reads');}finally{Storage.prototype.setItem=set;localStorage.removeItem(E.KEY)}
 for(const bad of [{avatars:[{name:'X',letters:'invalid'}]},{avatars:[{name:'X',gallery:{photos:[{src:'idbimg:missing'}]}}]},{avatars:[{name:'X',bookMeta:{title:42}}]}]){let rejected=false;try{E.parseBackup(JSON.stringify(bad))}catch{rejected=true}assert(rejected,'reject malformed backup')}
 const backup=JSON.stringify({format:E.BACKUP_FORMAT,version:2,avatars:[a]});const parsed=E.parseBackup(backup);assert(parsed.list[0].gallery.photos[23].src===photos[23].src,'backup includes complete images');
 window.sample=a;window.backup=backup;
 return {checks:['IndexedDB full roundtrip + trash','Atomic writeAll under injected quota failure','localStorage read under quota','3 malformed backups rejected','24 complete backup images'],photos:24,bytes:photos.reduce((n,p)=>n+p.src.length,0)};
}''')
 results.append(result); print(json.dumps(result),flush=True)
 # Generate actual downloadable PDFs from the same public generators used by the app.
 for kind,expr in [('libro','ecos.bookPdf(sample)'),('cartas',"ecos.lettersPdf(sample.letters,'cartas-ejemplo.pdf')"),('mazo',"ecos.deckPdf(sample.cards,'mazo-ejemplo.pdf')"),('cronologia','ecos.timelinePdf(sample)'),('galeria',"ecos.galleryPdf(sample.gallery.photos.slice(0,5),{perPage:2,frame:true,title:'Recuerdos'},'galeria-ejemplo.pdf')")]:
  with page.expect_download(timeout=120000) as dl: page.evaluate(expr)
  dl.value.save_as(OUT/(kind+'-ejemplo.pdf'));print('PDF',kind,flush=True)
 # Restore backup in another clean browser context, with no existing IndexedDB.
 backup=page.evaluate('backup')
 clean=b.new_context(); q=clean.new_page();q.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:3000') else r.abort());q.goto('http://127.0.0.1:3000',wait_until='domcontentloaded');q.add_script_tag(path='/tmp/ecos-validation/validation.js')
 q.evaluate('''async text=>{const a=ecos.parseBackup(text).list;const r=await ecos.writeAll({avatars:a,trash:[]});if(!r.ok)throw Error('restore failed');const read=await ecos.loadAll();if(read.avatars[0].gallery.photos.length!==24||read.missingImages)throw Error('restore incomplete')}''',backup)
 q.reload(wait_until='domcontentloaded');q.get_by_test_id('space-enter-sample').click();q.get_by_test_id('header-name').wait_for();q.screenshot(path=str(OUT/'panel-con-fotos-escritorio.png'),full_page=True)
 q.set_viewport_size({'width':390,'height':844});q.screenshot(path=str(OUT/'panel-con-fotos-celular.png'),full_page=True)
 assert q.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'mobile overflow'
 results.append('Clean browser restore, dashboard desktop/mobile without horizontal overflow')
 (OUT/'validacion.json').write_text(json.dumps(results,indent=2,ensure_ascii=False))
 b.close()
