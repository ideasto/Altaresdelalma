// Almacenamiento principal en IndexedDB (mucho más espacio que localStorage).
// Las imágenes se guardan una sola vez en "images" y los espacios las referencian.
const DB_NAME = "ecos_del_alma";
const REF = "idbimg:";
const isImg = (s) => typeof s === "string" && s.startsWith("data:image") && s.length > 200;

let dbp = null;
export function openDb() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    let req;
    try { req = indexedDB.open(DB_NAME, 1); } catch (e) { reject(e); return; }
    req.onupgradeneeded = () => {
      const db = req.result;
      ["spaces", "trash", "images", "meta"].forEach((s) => db.objectStoreNames.contains(s) || db.createObjectStore(s));
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("blocked"));
  });
  dbp.catch(() => { dbp = null; });
  return dbp;
}

const keyOf = new Map(); // dataURL -> key
const urlOf = new Map(); // key -> dataURL
const newKey = () => (crypto.randomUUID && crypto.randomUUID()) || String(Date.now() + Math.random());

function walk(v, fn) {
  if (Array.isArray(v)) return v.map((x) => walk(x, fn));
  if (v && typeof v === "object") { const o = {}; for (const k in v) o[k] = walk(v[k], fn); return o; }
  return fn(v);
}

function dehydrate(obj, fresh) {
  return walk(obj, (s) => {
    if (!isImg(s)) return s;
    let k = keyOf.get(s);
    if (!k) { k = newKey(); keyOf.set(s, k); urlOf.set(k, s); fresh.set(k, s); }
    return REF + k;
  });
}

const hydrate = (obj, missing) => walk(obj, (s) => {
  if (typeof s !== "string" || !s.startsWith(REF)) return s;
  const u = urlOf.get(s.slice(REF.length));
  if (!u) { missing.n++; return ""; }
  return u;
});

function collectKeys(state) {
  const used = new Set();
  const add = (v) => walk(v, (s) => { if (isImg(s) && keyOf.has(s)) used.add(keyOf.get(s)); return s; });
  state.avatars.forEach(add);
  state.trash.forEach(add);
  return used;
}

const reqP = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

export async function loadAll() {
  const db = await openDb();
  const tx = db.transaction(["spaces", "trash", "images", "meta"], "readonly");
  const [meta, sKeys, sVals, tVals, iKeys, iVals] = await Promise.all([
    reqP(tx.objectStore("meta").get("main")),
    reqP(tx.objectStore("spaces").getAllKeys()),
    reqP(tx.objectStore("spaces").getAll()),
    reqP(tx.objectStore("trash").getAll()),
    reqP(tx.objectStore("images").getAllKeys()),
    reqP(tx.objectStore("images").getAll()),
  ]);
  if (!meta) return null;
  iKeys.forEach((k, i) => { urlOf.set(k, iVals[i]); keyOf.set(iVals[i], k); });
  const missing = { n: 0 };
  const byId = new Map(sKeys.map((k, i) => [k, hydrate(sVals[i], missing)]));
  const order = Array.isArray(meta.order) ? meta.order : [];
  const avatars = [...order.filter((id) => byId.has(id)).map((id) => byId.get(id)), ...[...byId.keys()].filter((k) => !order.includes(k)).map((k) => byId.get(k))];
  const trash = tVals.map((t) => hydrate(t, missing)).sort((a, b) => (b.deletedAt || "").localeCompare(a.deletedAt || ""));
  return { meta, avatars, trash, missingImages: missing.n, imageCount: iKeys.length };
}

// Escribe solo lo que cambió, en una única transacción (todo o nada).
export async function saveState(next, prev, extraMeta = {}) {
  const db = await openDb();
  const fresh = new Map();
  const prevA = new Map((prev?.avatars || []).map((a) => [a.id, a]));
  const prevT = new Map((prev?.trash || []).map((t) => [t.space.id, t]));
  const writesA = next.avatars.filter((a) => prevA.get(a.id) !== a).map((a) => [a.id, dehydrate(a, fresh)]);
  const writesT = next.trash.filter((t) => prevT.get(t.space.id) !== t).map((t) => [t.space.id, dehydrate(t, fresh)]);
  const nextIds = new Set(next.avatars.map((a) => a.id));
  const nextT = new Set(next.trash.map((t) => t.space.id));
  const used = collectKeys(next);
  return new Promise((resolve) => {
    const tx = db.transaction(["spaces", "trash", "images", "meta"], "readwrite");
    const S = tx.objectStore("spaces"), T = tx.objectStore("trash"), I = tx.objectStore("images");
    fresh.forEach((url, k) => I.put(url, k));
    writesA.forEach(([id, v]) => S.put(v, id));
    writesT.forEach(([id, v]) => T.put(v, id));
    prevA.forEach((_, id) => nextIds.has(id) || S.delete(id));
    prevT.forEach((_, id) => nextT.has(id) || T.delete(id));
    I.getAllKeys().onsuccess = (e) => e.target.result.forEach((k) => used.has(k) || I.delete(k));
    tx.objectStore("meta").put({ version: 2, order: next.avatars.map((a) => a.id), updatedAt: new Date().toISOString(), ...extraMeta }, "main");
    tx.oncomplete = () => resolve({ ok: true });
    const fail = () => {
      fresh.forEach((url, k) => { keyOf.delete(url); urlOf.delete(k); });
      const err = tx.error;
      resolve({ ok: false, quota: err && err.name === "QuotaExceededError", blocked: !err || err.name !== "QuotaExceededError", error: err });
    };
    tx.onerror = (e) => e.preventDefault();
    tx.onabort = fail;
  });
}

export async function writeAll(state, extraMeta) {
  const db = await openDb();
  await new Promise((res, rej) => {
    const tx = db.transaction(["spaces", "trash", "images"], "readwrite");
    ["spaces", "trash", "images"].forEach((s) => tx.objectStore(s).clear());
    tx.oncomplete = res; tx.onabort = () => rej(tx.error);
  });
  keyOf.clear(); urlOf.clear();
  return saveState(state, { avatars: [], trash: [] }, extraMeta);
}

export async function storageEstimate() {
  try {
    const e = await navigator.storage.estimate();
    return { used: e.usage || 0, quota: e.quota || 0 };
  } catch { return null; }
}

export function requestPersistence() {
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch { /* noop */ }
}
