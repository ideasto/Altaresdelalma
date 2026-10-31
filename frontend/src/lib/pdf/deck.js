import { jsPDF } from "jspdf";
import { newDoc, save, setFont, lines, lh, drawContain, logoUrl, asDataUrl, INK, GOLD, BLUE, MUTED } from "./core";
import { DECK_FRAME_URL } from "../deckFrame";

const CW = 63, CH = 90, COLS = 3, ROWS = 3;
const X0 = (210 - CW * COLS) / 2, Y0 = (297 - CH * ROWS) / 2;
const TEXT_W = 45, TEXT_H = 52, MAX_PT = 16, MIN_PT = 9;
const ORIGIN = { recordada: "Palabras suyas", escrita: "Escrita por mí" };

// Busca el tamaño más grande (entre 16 y 9 pt) en el que la frase entra en la carta.
export function fitMessage(doc, message) {
  const fam = doc.getFontList().Cormorant ? "Cormorant" : "times";
  for (let s = MAX_PT; s >= MIN_PT; s -= 0.5) {
    setFont(doc, fam, "italic", s);
    const ls = lines(doc, message, TEXT_W);
    if (ls.length * lh(s, 1.25) <= TEXT_H) return { size: s, lines: ls, fits: true };
  }
  return { size: MIN_PT, lines: lines(doc, message, TEXT_W), fits: false };
}

let probe = null;
export async function initDeckProbe() { if (!probe) probe = await newDoc(); }
// Para avisar durante la edición: misma medición y fuente que el PDF.
export function deckFits(message) {
  if (!probe) { probe = new jsPDF({ unit: "mm" }); initDeckProbe(); }
  return fitMessage(probe, message || "");
}

function cutMarks(doc) {
  doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.2);
  for (let c = 0; c <= COLS; c++) {
    const x = X0 + c * CW;
    doc.line(x, Y0 - 7, x, Y0 - 2); doc.line(x, Y0 + ROWS * CH + 2, x, Y0 + ROWS * CH + 7);
  }
  for (let r = 0; r <= ROWS; r++) {
    const y = Y0 + r * CH;
    doc.line(X0 - 7, y, X0 - 2, y); doc.line(X0 + COLS * CW + 2, y, X0 + COLS * CW + 7, y);
  }
}

function note(doc, text) {
  setFont(doc, "helvetica", "normal", 9, MUTED);
  doc.text(text, 105, 8, { align: "center" });
}

async function front(doc, c, x, y, frame) {
  doc.addImage(frame, "PNG", x, y, CW, CH, "deckframe", "FAST");
  const f = fitMessage(doc, c.message);
  setFont(doc, "Cormorant", "italic", f.size, INK);
  const h = f.lines.length * lh(f.size, 1.25);
  let ty = y + CH / 2 - h / 2 + lh(f.size, 1.25) * 0.75 - 3;
  f.lines.forEach((l) => { doc.text(l, x + CW / 2, ty, { align: "center" }); ty += lh(f.size, 1.25); });
  if (c.name) { setFont(doc, "Cormorant", "bold", 9.5, [110, 90, 55]); doc.text(c.name, x + CW / 2, y + CH - 15, { align: "center" }); }
  if (c.origin) { setFont(doc, "helvetica", "normal", 8.5, [150, 130, 95]); doc.text(ORIGIN[c.origin], x + CW / 2, y + CH - 9.5, { align: "center" }); }
}

async function back(doc, x, y) {
  doc.setFillColor(...BLUE); doc.roundedRect(x, y, CW, CH, 3, 3, "F");
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.6); doc.roundedRect(x + 3, y + 3, CW - 6, CH - 6, 2, 2);
  doc.setLineWidth(0.2); doc.roundedRect(x + 5, y + 5, CW - 10, CH - 10, 1.5, 1.5);
  await drawContain(doc, logoUrl(), x + 14, y + 25, CW - 28, 40, "logo");
}

// Frentes y dorsos alineados para doble faz (volteo por el borde largo: columnas espejadas).
export async function deckPdf(cards, filename) {
  const doc = await newDoc();
  const frame = await asDataUrl(DECK_FRAME_URL);
  const per = COLS * ROWS;
  const sheets = Math.ceil(cards.length / per);
  for (let s = 0; s < sheets; s++) {
    const chunk = cards.slice(s * per, s * per + per);
    if (s > 0) doc.addPage();
    note(doc, `Frentes · hoja ${s + 1} de ${sheets} · Imprimir al 100 % (tamaño real) · Doble faz, volteo por el borde largo`);
    for (let i = 0; i < chunk.length; i++) await front(doc, chunk[i], X0 + (i % COLS) * CW, Y0 + Math.floor(i / COLS) * CH, frame);
    cutMarks(doc);
    doc.addPage();
    note(doc, `Dorsos de la hoja ${s + 1} · imprimir en el reverso de los frentes`);
    for (let i = 0; i < chunk.length; i++) await back(doc, X0 + (COLS - 1 - (i % COLS)) * CW, Y0 + Math.floor(i / COLS) * CH);
    cutMarks(doc);
  }
  return save(doc, filename);
}
