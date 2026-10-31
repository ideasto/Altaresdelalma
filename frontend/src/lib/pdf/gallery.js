import { newDoc, save, setFont, lines, lh, drawContain, footer, brandLine, INK, GOLD } from "./core";

const W = 210, H = 297, M = 15;
const LAYOUT = { 1: [1, 1], 2: [1, 2], 4: [2, 2] };

// Fotos completas y proporcionadas, con pie de foto y marco opcional (sin deformar).
export async function galleryPdf(photos, { perPage = 2, frame = true, title = "" }, filename) {
  const doc = await newDoc();
  const [cols, rows] = LAYOUT[perPage] || LAYOUT[2];
  const top = title ? 26 : M;
  const cw = (W - M * 2 - (cols - 1) * 8) / cols;
  const ch = (H - top - M - 8 - (rows - 1) * 8) / rows;
  for (let i = 0; i < photos.length; i++) {
    const slot = i % (cols * rows);
    if (i > 0 && slot === 0) doc.addPage();
    if (slot === 0) {
      if (title) { setFont(doc, "Cormorant", "bold", 16, INK); doc.text(title, W / 2, 17, { align: "center" }); }
      footer(doc, brandLine());
    }
    const p = photos[i];
    const x = M + (slot % cols) * (cw + 8), y = top + Math.floor(slot / cols) * (ch + 8);
    let capLines = [];
    if (p.caption) { setFont(doc, "Cormorant", "italic", 12); capLines = lines(doc, p.caption, cw); }
    const capH = capLines.length * lh(12, 1.2) + (capLines.length ? 3 : 0);
    const pad = frame ? 3 : 0;
    const box = await drawContain(doc, p.src, x + pad, y + pad, cw - pad * 2, ch - capH - pad * 2);
    if (!box) continue;
    if (frame) { doc.setDrawColor(...GOLD); doc.setLineWidth(0.5); doc.rect(box.x - 2.5, box.y - 2.5, box.w + 5, box.h + 5); }
    let cy = box.y + box.h + pad + 5;
    setFont(doc, "Cormorant", "italic", 12, INK);
    capLines.forEach((l) => { doc.text(l, x + cw / 2, cy, { align: "center" }); cy += lh(12, 1.2); });
  }
  return save(doc, filename);
}
