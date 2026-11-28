import { newDoc, save, setFont, lines, lh, drawContain, footer, brandLine, asDataUrl, rasterize, INK, GOLD, MUTED } from "./core";
import { fmtDate, sortMoments } from "../format";
import { symbolSvg } from "../symbolSvg";

const W = 297, H = 210, PY = 105, L = 14, R = W - 14, SLOTS = 4;

function path(doc) {
  doc.setDrawColor(...GOLD); doc.setLineWidth(1);
  const seg = (R - L) / 4;
  // Onda suave que siempre entra y sale a la misma altura para unir hojas.
  doc.lines([[seg / 2, -10, seg / 2, 10, seg, 0], [seg / 2, -10, seg / 2, 10, seg, 0], [seg / 2, -10, seg / 2, 10, seg, 0], [seg / 2, -10, seg / 2, 10, seg, 0]], L, PY, [1, 1], "S");
}

function joins(doc, i, n) {
  setFont(doc, "helvetica", "normal", 9, MUTED);
  doc.setLineDashPattern([1.5, 1.5], 0); doc.setDrawColor(...MUTED); doc.setLineWidth(0.2);
  if (i > 0) { doc.line(L, PY - 14, L, PY + 14); doc.text(`Unir con la hoja ${i}`, L + 1, PY + 19); }
  if (i < n - 1) { doc.line(R, PY - 14, R, PY + 14); doc.text(`Continúa en la hoja ${i + 2}`, R - 1, PY + 19, { align: "right" }); }
  doc.setLineDashPattern([], 0);
}

async function marker(doc, sym, x) {
  if (!sym || sym === "dot") {
    doc.setFillColor(...GOLD); doc.circle(x, PY, 2.6, "F");
    doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.5); doc.circle(x, PY, 2.6, "S");
    return;
  }
  doc.setFillColor(255, 255, 255); doc.circle(x, PY, 4.2, "F");
  const png = await asDataUrl(await rasterize(symbolSvg(sym, "#b8933a"), 96, 96));
  doc.addImage(png, "PNG", x - 3.4, PY - 3.4, 6.8, 6.8, `sym-${sym}`, "FAST");
}

async function moment(doc, e, x, w, up) {
  const top = up ? 16 : PY + 12, bottom = up ? PY - 12 : H - 14, avail = bottom - top;
  let size = 11;
  setFont(doc, "Cormorant", "normal", size);
  let desc = e.description ? lines(doc, e.description, w) : [];
  const head = 6 + lh(14, 1.2) * lines(doc, e.title, w).length;
  const photoH = e.photo ? Math.min(34, avail * 0.4) : 0;
  while (head + photoH + desc.length * lh(size) > avail && size > 9) { size -= 0.5; setFont(doc, "Cormorant", "normal", size); desc = lines(doc, e.description, w); }
  const total = head + (photoH ? photoH + 3 : 0) + desc.length * lh(size);
  let y = up ? bottom - total : top;
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.3); doc.line(x + w / 2, up ? y + total : PY + 4, x + w / 2, up ? PY - 4 : y);
  setFont(doc, "helvetica", "bold", 9, [150, 120, 40]);
  doc.text(fmtDate(e.date) || "Sin fecha", x + w / 2, y + 3, { align: "center" }); y += 6;
  setFont(doc, "Cormorant", "bold", 14, INK);
  lines(doc, e.title, w).forEach((l) => { doc.text(l, x + w / 2, y + 3.5, { align: "center" }); y += lh(14, 1.2); });
  if (photoH) { const b = await drawContain(doc, e.photo, x, y + 1, w, photoH); y += photoH + 3; void b; }
  setFont(doc, "Cormorant", "normal", size, INK);
  desc.forEach((l) => { doc.text(l, x + w / 2, y + 3, { align: "center" }); y += lh(size); });
}

// A4 apaisado, camino continuo con puntos, tantas hojas como haga falta y referencias de unión.
export async function timelinePdf(a) {
  const doc = await newDoc("landscape");
  const list = [];
  for (const e of sortMoments(a.timeline)) {
    setFont(doc, "Cormorant", "normal", 11);
    const all = lines(doc, e.description, (R - L) / SLOTS - 8);
    let offset = 0, part = 0;
    do {
      const count = part === 0 && e.photo ? 3 : 8;
      list.push({ ...e, photo: part === 0 ? e.photo : "", title: part === 0 ? e.title : `${e.title} (continúa)`, description: all.slice(offset, offset + count).join("\n") });
      offset += count; part++;
    } while (offset < all.length);
  }
  const n = Math.max(1, Math.ceil(list.length / SLOTS));
  const slotW = (R - L) / SLOTS;
  for (let s = 0; s < n; s++) {
    if (s > 0) doc.addPage();
    path(doc); joins(doc, s, n);
    const chunk = list.slice(s * SLOTS, s * SLOTS + SLOTS);
    for (let i = 0; i < chunk.length; i++) {
      const cx = L + slotW * i + slotW / 2;
      await marker(doc, chunk[i].icon, cx);
      await moment(doc, chunk[i], cx - slotW / 2 + 4, slotW - 8, (s * SLOTS + i) % 2 === 0);
    }
    footer(doc, `${a.name} · Línea de tiempo · hoja ${s + 1} de ${n} · ${brandLine()}`);
  }
  return save(doc, `linea-de-tiempo-${a.name}.pdf`);
}
