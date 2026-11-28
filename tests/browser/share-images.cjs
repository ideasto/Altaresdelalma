// Pure pagination check plus mocked canvas rendering. No network or personal data.
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const path = require('path');
const painted = [];
const ctx = { measureText: s => ({ width: [...s].length * 21 }), fillRect() {}, strokeRect() {}, drawImage() {}, fillText: s => painted.push(s) };
const canvas = { getContext: () => ctx, toBlob: cb => cb(new Blob(['png'], { type: 'image/png' })) };
const appUrl = 'https://ejemplo.test';
const loadedFonts = new Set();
const fonts = { load: async font => { await Promise.resolve(); loadedFonts.add(font); } };
const document = { fonts, createElement: () => {
  assert(loadedFonts.has('italic 400 56px "Cormorant Garamond"'));
  return canvas;
} };
const sandbox = { BRAND: { brandName: 'Marca de prueba', appUrl }, DECK_FRAME_URL: 'data:image/svg+xml,test', Image: class { naturalWidth = 400; naturalHeight = 300; set src(value) { this.onload(); } }, document, File, Blob, Intl, setTimeout, clearTimeout };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../../frontend/src/lib/shareImages.js'), 'utf8').replace(/^import .*;\n/gm, '').replace(/export /g, ''), sandbox);
(async () => {
  const longWord = 'x'.repeat(3000);
  const wrapped = sandbox.wrapShareText(ctx, longWord, 880);
  assert.strictEqual(wrapped.join(''), longWord);
  assert(wrapped.every(line => ctx.measureText(line).width <= 880));
  const text = Array.from({ length: 180 }, (_, i) => `Línea de prueba ${i}`).join('\n') + '\nFIN CONTENIDO';
  const files = await sandbox.prepareShareImages([{ title: 'Título largo '.repeat(70), subtitle: 'Un recuerdo', text }]);
  assert(files.length > 1);
  assert(painted.includes('FIN CONTENIDO'));
  for (let i = 0; i < 180; i++) assert(painted.includes(`Línea de prueba ${i}`));
  assert(files.every(f => f.type === 'image/png' && f.size > 0));
  assert.strictEqual(painted.filter(x => x === appUrl).length, files.length);
  const photo = await sandbox.prepareShareImages([{ kind: 'photo', title: 'Una foto', photo: 'data:image/png;base64,dGVzdA==' }]);
  assert.strictEqual(photo.length, 1);
  const card = await sandbox.prepareShareImages([{ kind: 'card', title: 'Una firma', text: 'Una frase' }]);
  assert.strictEqual(card.length, 1);
  assert.strictEqual(painted.filter(x => x === appUrl).length, files.length + 2);
  console.log(`Sharing: ${files.length} images, full long text and heading preserved, long words wrapped.`);
})().catch(e => { console.error(e); process.exitCode = 1; });
