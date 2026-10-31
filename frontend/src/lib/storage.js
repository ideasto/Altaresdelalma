import { BRAND, LIMITS } from "../config/brand";
import { markBackup } from "./backupReminder";

export const KEY = "ma_data_v1";
export const LEGACY_KEY = "mensajes_ancestrales_v1";
export const DATA_VERSION = 2;
export const BACKUP_FORMAT = "ecos-del-alma-backup";

const uid = () => (crypto.randomUUID && crypto.randomUUID()) || String(Date.now() + Math.random());
export const newId = uid;

export const emptyBookMeta = () => ({ title: "", subtitle: "", coverPhoto: "", backText: "", closing: "" });

export function newAvatar(partial = {}) {
  return normalizeAvatar({ id: uid(), createdAt: new Date().toISOString(), ...partial });
}

const arr = (v) => (Array.isArray(v) ? v : []);
const str = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));
const img = (v) => (typeof v === "string" && v.startsWith("data:image") ? v : "");

export function normalizeAvatar(a) {
  const g = a.gallery || {};
  const meta = { ...emptyBookMeta(), ...(a.bookMeta || {}) };
  if (!meta.coverPhoto && a.bookCoverPhoto) meta.coverPhoto = img(a.bookCoverPhoto);
  return {
    id: str(a.id) || uid(),
    name: str(a.name),
    symbol: str(a.symbol) || (a.kind === "animal" ? "paw" : ""),
    phrase: str(a.phrase),
    birth: str(a.birth),
    passing: str(a.passing),
    photo: img(a.photo),
    photoCropped: img(a.photoCropped),
    crop: a.crop || null,
    cards: arr(a.cards).map((c) => ({ id: str(c.id) || uid(), message: str(c.message), name: str(c.name), origin: c.origin === "escrita" ? "escrita" : c.origin === "recordada" ? "recordada" : "", hint: str(c.hint) })),
    letters: arr(a.letters).map((l) => ({ id: str(l.id) || uid(), date: str(l.date), to: str(l.to), body: str(l.body), sign: str(l.sign) })),
    timeline: arr(a.timeline).map((e) => ({ id: str(e.id) || uid(), date: str(e.date), icon: str(e.icon) || "star", title: str(e.title), description: str(e.description), photo: img(e.photo) })),
    gallery: {
      folders: arr(g.folders).map((f) => ({ id: str(f.id) || uid(), name: str(f.name) })),
      photos: arr(g.photos).filter((p) => img(p.src)).map((p) => ({ id: str(p.id) || uid(), src: p.src, folderId: p.folderId || null, caption: str(p.caption) })),
    },
    book: arr(a.book).map((p) => ({ id: str(p.id) || uid(), title: str(p.title), text: str(p.text), photo: img(p.photo), source: str(p.source) })),
    bookMeta: meta,
    createdAt: str(a.createdAt) || new Date().toISOString(),
  };
}

// --- Migración del formato viejo "mensajes_ancestrales_v1" / "espacios" (tolerante a alias) ---
const pick = (o, ...keys) => { for (const k of keys) if (o && o[k] != null && o[k] !== "") return o[k]; return undefined; };

export function migrateLegacySpace(e) {
  const libro = pick(e, "libro", "book") || {};
  const libroIsObj = libro && !Array.isArray(libro);
  const galeria = pick(e, "galeria", "gallery", "fotos") || [];
  const photosSrc = Array.isArray(galeria) ? galeria : arr(galeria.fotos || galeria.photos);
  const folders = Array.isArray(galeria) ? [] : arr(galeria.carpetas || galeria.folders);
  return normalizeAvatar({
    id: pick(e, "id"),
    name: pick(e, "nombre", "name", "titulo"),
    phrase: pick(e, "frase", "phrase", "dedicatoria"),
    birth: pick(e, "fechaNacimiento", "nacimiento", "birth"),
    passing: pick(e, "fechaPartida", "partida", "passing"),
    photo: pick(e, "foto", "photo", "imagen"),
    photoCropped: pick(e, "fotoRecortada", "photoCropped", "foto", "photo", "imagen"),
    kind: pick(e, "tipo", "kind") === "animal" ? "animal" : "",
    cards: arr(pick(e, "mazo", "oraculo", "cards")).map((c) => ({ id: c.id, message: pick(c, "frase", "mensaje", "texto", "message"), name: pick(c, "firma", "nombre", "name"), origin: c.origin })),
    letters: arr(pick(e, "duelario", "cartas", "letters")).map((l) => ({ id: l.id, date: pick(l, "fecha", "date"), to: pick(l, "para", "destinatario", "to"), body: pick(l, "texto", "cuerpo", "body", "contenido"), sign: pick(l, "firma", "sign") })),
    timeline: arr(pick(e, "lineaTiempo", "linea", "cronologia", "timeline")).map((t) => ({ id: t.id, date: pick(t, "fecha", "date"), title: pick(t, "titulo", "title"), description: pick(t, "descripcion", "texto", "description"), photo: pick(t, "foto", "photo"), icon: pick(t, "icono", "icon") })),
    gallery: {
      folders: folders.map((f) => ({ id: f.id, name: pick(f, "nombre", "name") })),
      photos: photosSrc.map((p) => (typeof p === "string" ? { src: p } : { id: p.id, src: pick(p, "src", "foto", "imagen", "url"), folderId: pick(p, "carpetaId", "folderId"), caption: pick(p, "pie", "caption", "descripcion") })),
    },
    book: arr(libroIsObj ? pick(libro, "paginas", "pages") : libro).map((p) => ({ id: p.id, title: pick(p, "titulo", "title"), text: pick(p, "texto", "text"), photo: pick(p, "foto", "photo") })),
    bookMeta: libroIsObj ? {
      title: str(pick(libro, "titulo", "title")),
      subtitle: str(pick(libro, "subtitulo", "frase", "subtitle")),
      coverPhoto: img(pick(libro, "fotoTapa", "tapa", "coverPhoto")),
      backText: str(pick(libro, "contratapa", "resena", "backText")),
      closing: str(pick(libro, "cierre", "closing")),
    } : undefined,
    createdAt: pick(e, "creado", "createdAt"),
  });
}

// Acepta: array de espacios, {avatars}, {espacios}, {data:{...}}
export function extractSpaces(parsed) {
  if (Array.isArray(parsed)) return { list: parsed.map((x) => (x && x.nombre && !x.name ? migrateLegacySpace(x) : normalizeAvatar(x || {}))), legacy: false };
  if (parsed && Array.isArray(parsed.avatars)) return { list: parsed.avatars.map((x) => normalizeAvatar(x || {})), legacy: false, trash: arr(parsed.trash) };
  if (parsed && Array.isArray(parsed.espacios)) return { list: parsed.espacios.map((x) => migrateLegacySpace(x || {})), legacy: true };
  if (parsed && parsed.data && typeof parsed.data === "object") return extractSpaces(parsed.data);
  return null;
}

// --- Lectura con estados diferenciados ---
export function readStorage() {
  let ls;
  try {
    ls = window.localStorage;
    const t = "__altares_test__";
    ls.setItem(t, "1");
    ls.removeItem(t);
  } catch (e) {
    return { status: "inaccessible", avatars: [], trash: [] };
  }
  const raw = ls.getItem(KEY);
  if (raw == null) {
    const legacy = ls.getItem(LEGACY_KEY);
    if (legacy) {
      try {
        const ex = extractSpaces(JSON.parse(legacy));
        if (ex) return { status: "migrated", avatars: ex.list, trash: [] };
      } catch { /* cae a corrupto */ }
      return { status: "corrupt", raw: legacy, rawKey: LEGACY_KEY, avatars: [], trash: [] };
    }
    return { status: "first", avatars: [], trash: [] };
  }
  try {
    const ex = extractSpaces(JSON.parse(raw));
    if (!ex) throw new Error("estructura desconocida");
    return { status: "ok", avatars: ex.list, trash: (ex.trash || []).map((t) => ({ ...t, space: normalizeAvatar(t.space || {}) })) };
  } catch {
    return { status: "corrupt", raw, rawKey: KEY, avatars: [], trash: [] };
  }
}

export function serialize(state) {
  return JSON.stringify({ version: DATA_VERSION, app: BRAND.appName, avatars: state.avatars, trash: state.trash });
}

export function writeStorage(state) {
  try {
    localStorage.setItem(KEY, serialize(state));
    return { ok: true };
  } catch (e) {
    const quota = e && (e.name === "QuotaExceededError" || e.code === 22 || e.code === 1014);
    return { ok: false, quota, error: e };
  }
}

export function storageUsage() {
  let used = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      used += k.length + (localStorage.getItem(k) || "").length;
    }
  } catch { /* noop */ }
  return { used, total: LIMITS.approxStorageChars, pct: Math.min(100, Math.round((used / LIMITS.approxStorageChars) * 100)) };
}

export const fmtMB = (chars) => `${(chars / (1024 * 1024)).toFixed(1)} MB`;

// --- Respaldo ---
export function downloadFile(content, filename, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = (s) => str(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "espacio";
export const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// No incluye el registro de contacto/marketing.
export function exportBackup(avatars, space = null) {
  const list = space ? [space] : avatars;
  const payload = {
    format: BACKUP_FORMAT,
    app: BRAND.appName,
    formerApp: BRAND.formerAppName,
    brand: BRAND.brandName,
    version: DATA_VERSION,
    scope: space ? "space" : "all",
    exportedAt: new Date().toISOString(),
    avatars: list,
  };
  const name = space ? `ecos-del-alma-${slug(space.name)}-${todayLocal()}.json` : `ecos-del-alma-santuario-${todayLocal()}.json`;
  downloadFile(JSON.stringify(payload), name);
  if (!space) markBackup();
}

export function summarize(list) {
  const sum = (f) => list.reduce((n, a) => n + f(a), 0);
  return {
    spaces: list.length,
    letters: sum((a) => a.letters.length),
    cards: sum((a) => a.cards.length),
    photos: sum((a) => a.gallery.photos.length),
    moments: sum((a) => a.timeline.length),
    pages: sum((a) => a.book.length),
  };
}

// Valida y prepara un respaldo. Lanza Error con mensaje legible.
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const LISTS = { cards: ["message"], letters: ["body"], timeline: ["title"], book: [] };
const IMG_FIELDS = ["photo", "photoCropped", "bookCoverPhoto"];

// Rechaza estructuras y tipos incorrectos antes de restaurar (no los convierte en vacíos).
export function validateBackupShape(parsed) {
  const errs = [];
  const okImg = (v) => v == null || v === "" || (typeof v === "string" && v.startsWith("data:image"));
  let list;
  if (Array.isArray(parsed)) list = parsed;
  else if (isObj(parsed) && "avatars" in parsed) { if (!Array.isArray(parsed.avatars)) errs.push("«avatars» no es una lista."); else list = parsed.avatars; }
  else if (isObj(parsed) && "espacios" in parsed) { if (!Array.isArray(parsed.espacios)) errs.push("«espacios» no es una lista."); else list = parsed.espacios; }
  else errs.push("No tiene la estructura de un respaldo de Ecos del Alma / Mensajes Ancestrales.");
  if (list && list.length === 0) errs.push("El respaldo no contiene ningún espacio.");
  (list || []).forEach((a, i) => {
    const n = `Espacio ${i + 1}`;
    if (!isObj(a)) return errs.push(`${n}: no es un objeto válido.`);
    const name = a.name ?? a.nombre;
    if (typeof name !== "string" || !name.trim()) errs.push(`${n}: falta el nombre o no es texto.`);
    if (a.id != null && typeof a.id !== "string" && typeof a.id !== "number") errs.push(`${n}: identificador inválido.`);
    IMG_FIELDS.forEach((f) => okImg(a[f]) || errs.push(`${n}: la imagen «${f}» no es una imagen incluida en el archivo.`));
    Object.keys(LISTS).forEach((k) => {
      if (a[k] == null) return;
      if (!Array.isArray(a[k])) return errs.push(`${n}: «${k}» no es una lista.`);
      a[k].forEach((it, j) => {
        if (!isObj(it)) return errs.push(`${n}: «${k}» ${j + 1} no es válido.`);
        LISTS[k].forEach((f) => it[f] != null && typeof it[f] !== "string" && errs.push(`${n}: «${k}» ${j + 1} tiene «${f}» que no es texto.`));
        if (!okImg(it.photo)) errs.push(`${n}: «${k}» ${j + 1} tiene una foto que no está incluida.`);
      });
    });
    if (a.gallery != null) {
      if (!isObj(a.gallery)) errs.push(`${n}: la galería no es válida.`);
      else {
        if (a.gallery.photos != null && !Array.isArray(a.gallery.photos)) errs.push(`${n}: las fotos de la galería no son una lista.`);
        (a.gallery.photos || []).forEach((p, j) => (!isObj(p) || !okImg(p.src) || !p.src) && errs.push(`${n}: la foto ${j + 1} de la galería no está incluida o es inválida.`));
        if (a.gallery.folders != null && !Array.isArray(a.gallery.folders)) errs.push(`${n}: las carpetas no son una lista.`);
      }
    }
    if (a.bookMeta != null && !isObj(a.bookMeta)) errs.push(`${n}: los datos del libro no son válidos.`);
    if (isObj(a.bookMeta) && !okImg(a.bookMeta.coverPhoto)) errs.push(`${n}: la foto de tapa no está incluida.`);
  });
  return errs;
}

export function parseBackup(text) {
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new Error("El archivo no es un respaldo legible (JSON dañado o incompleto)."); }
  const errs = validateBackupShape(isObj(parsed) && isObj(parsed.data) ? parsed.data : parsed);
  if (errs.length) throw new Error(`Respaldo rechazado, no se modificó nada: ${errs.slice(0, 3).join(" ")}${errs.length > 3 ? ` (y ${errs.length - 3} problema(s) más)` : ""}`);
  const version = Number(parsed?.version || 1);
  if (version > DATA_VERSION) throw new Error(`El respaldo es de una versión más nueva (${version}). Actualizá la app antes de restaurarlo.`);
  const ex = extractSpaces(parsed);
  if (!ex) throw new Error("El archivo no tiene la estructura de un respaldo de Ecos del Alma / Mensajes Ancestrales.");
  const ids = new Set();
  const warnings = [];
  ex.list.forEach((a) => {
    if (!a.name) { warnings.push("Un espacio no tenía nombre; quedó como «Sin nombre»."); a.name = "Sin nombre"; }
    if (ids.has(a.id)) { a.id = uid(); warnings.push("Había identificadores repetidos dentro del respaldo; se corrigieron."); }
    ids.add(a.id);
  });
  return {
    list: ex.list,
    version,
    legacy: ex.legacy || /mensajes/i.test(str(parsed?.app)),
    sourceApp: str(parsed?.app) || (ex.legacy ? BRAND.formerAppName : "desconocida"),
    exportedAt: str(parsed?.exportedAt),
    warnings: [...new Set(warnings)],
    summary: summarize(ex.list),
  };
}

// mode: "replace" | "merge"; dup: "copy" | "overwrite" | "skip"
export function applyRestore(current, incoming, mode, dup = "copy") {
  if (mode === "replace") return incoming;
  const ids = new Set(current.map((a) => a.id));
  const out = [...current];
  incoming.forEach((a) => {
    if (!ids.has(a.id)) return out.push(a);
    if (dup === "skip") return;
    if (dup === "overwrite") { const i = out.findIndex((x) => x.id === a.id); out[i] = a; return; }
    out.push({ ...a, id: uid(), name: `${a.name} (copia restaurada)` });
  });
  return out;
}
