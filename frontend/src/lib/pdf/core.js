import { jsPDF } from "jspdf";
import { BRAND } from "../../config/brand";

export const INK = [43, 33, 20];
export const GOLD = [196, 160, 64];
export const GOLD_SOFT = [228, 214, 176];
export const BLUE = [33, 60, 86];
export const MUTED = [120, 105, 80];
export const PT = 0.3528; // mm por punto

const FONTS = [
  ["Caveat.ttf", "Caveat", "normal"],
  ["Cormorant.ttf", "Cormorant", "normal"],
  ["Cormorant-Italic.ttf", "Cormorant", "italic"],
  ["Cormorant-Bold.ttf", "Cormorant", "bold"],
];
let fontCache = null;
const b64 = (buf) => {
  let s = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
async function fonts() {
  if (!fontCache) fontCache = Promise.all(FONTS.map(async ([f, n, st]) => [f, n, st, b64(await (await fetch(`/fonts/${f}`)).arrayBuffer())]));
  return fontCache;
}

export async function newDoc(orientation = "portrait") {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation, compress: true });
  (await fonts()).forEach(([f, n, st, d]) => { doc.addFileToVFS(f, d); doc.addFont(f, n, st); });
  doc.setProperties({ title: BRAND.appName, creator: `${BRAND.appName} · ${BRAND.brandName}` });
  return doc;
}

const urlCache = new Map();
export async function asDataUrl(url) {
  if (url.startsWith("data:image/png") || url.startsWith("data:image/jpeg")) return url;
  if (!urlCache.has(url)) {
    urlCache.set(url, (async () => {
      if (url.startsWith("data:image/svg")) return rasterize(url, 1260, 1800);
      const blob = await (await fetch(url)).blob();
      return new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    })());
  }
  return urlCache.get(url);
}

export function imgSize(src) {
  return new Promise((res) => { const i = new Image(); i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => res(null); i.src = src; });
}

export async function rasterize(src, w, h) {
  const img = new Image();
  await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = src; });
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d").drawImage(img, 0, 0, w, h);
  return c.toDataURL("image/png");
}

const fmt = (src) => (src.startsWith("data:image/png") ? "PNG" : "JPEG");

// Dibuja la imagen completa, proporcionada, centrada en la caja. Devuelve la caja real.
export async function drawContain(doc, src, x, y, w, h, alias) {
  const data = await asDataUrl(src);
  const s = await imgSize(data);
  if (!s) throw new Error("No se pudo leer una imagen del documento; no se exportó un PDF incompleto.");
  const r = Math.min(w / s.w, h / s.h);
  const dw = s.w * r, dh = s.h * r;
  const dx = x + (w - dw) / 2, dy = y + (h - dh) / 2;
  doc.addImage(data, fmt(data), dx, dy, dw, dh, alias, "FAST");
  return { x: dx, y: dy, w: dw, h: dh };
}

export const setFont = (doc, family, style, size, color = INK) => { doc.setFont(family, style); doc.setFontSize(size); doc.setTextColor(...color); };
export const lines = (doc, text, width) => doc.splitTextToSize(String(text || ""), width);
export const lh = (size, f = 1.35) => size * PT * f;

export function fillPage(doc, rgb) {
  const { width, height } = doc.internal.pageSize;
  doc.setFillColor(...rgb);
  doc.rect(0, 0, width, height, "F");
}

export function doubleBorder(doc, inset = 10, color = GOLD) {
  const { width, height } = doc.internal.pageSize;
  doc.setDrawColor(...color);
  doc.setLineWidth(0.7);
  doc.rect(inset, inset, width - inset * 2, height - inset * 2);
  doc.setLineWidth(0.25);
  doc.rect(inset + 2.5, inset + 2.5, width - inset * 2 - 5, height - inset * 2 - 5);
}

export function footer(doc, text, color = MUTED) {
  const { width, height } = doc.internal.pageSize;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...color);
  doc.text(text, width / 2, height - 6, { align: "center" });
}

export const brandLine = () => `${BRAND.appName} · ${BRAND.brandName} · ${BRAND.email}`;
export const logoUrl = () => BRAND.logos.goldFull;

export function save(doc, filename) {
  doc.save(filename);
  return doc.output("blob");
}
