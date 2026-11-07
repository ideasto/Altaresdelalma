// Pure pagination check plus mocked canvas rendering. No network or personal data.
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const path = require('path');
const painted = [];
const ctx = { measureText: s => ({ width: [...s].length * 21 }), fillRect() {}, strokeRect() {}, drawImage() {}, fillText: s => painted.push(s) };
const canvas = { getContext: () => ctx, toBlob: cb => cb(new Blob(['png'], { type: 'image/png' })) };
const sandbox = { BRAND: { brandName: 'Marca de prueba' }, document: { fonts: { ready: Promise.resolve() }, createElement: () => canvas }, File, Blob, Intl, setTimeout, clearTimeout };
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
  console.log(`Sharing: ${files.length} images, full long text and heading preserved, long words wrapped.`);
})().catch(e => { console.error(e); process.exitCode = 1; });
