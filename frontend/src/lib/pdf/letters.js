import { newDoc, save, setFont, lines, lh, footer, brandLine, GOLD_SOFT, MUTED, INK } from "./core";
import { fmtDate } from "../format";

const W = 210, H = 297, X = 24, CW = W - 48, TOP = 24, BOTTOM = H - 22;
const BODY = 16, STEP = lh(BODY, 1.45);

function paper(doc) {
  doc.setFillColor(253, 251, 245); doc.rect(0, 0, W, H, "F");
  doc.setDrawColor(220, 200, 150); doc.setLineWidth(0.3); doc.rect(10, 10, W - 20, H - 20);
  footer(doc, brandLine());
}

function measure(doc, l) {
  setFont(doc, "Caveat", "normal", BODY);
  const body = lines(doc, l.body, CW);
  const sign = l.sign ? lines(doc, l.sign, CW) : [];
  setFont(doc, "Cormorant", "bold", 18);
  const heading = lines(doc, `Para ${l.to}`, CW);
  return { body, sign, heading, h: 8 + heading.length * lh(18, 1.3) + 4 + body.length * STEP + STEP * 0.6 + (sign.length ? 6 + sign.length * STEP : 0) };
}

// Cada carta completa empieza en la hoja actual si entra; si no, en una nueva. Las largas continúan.
export async function lettersPdf(list, filename) {
  const doc = await newDoc();
  paper(doc);
  let y = TOP;
  list.forEach((l, i) => {
    const m = measure(doc, l);
    if (i > 0) {
      if (y + 14 + m.h > BOTTOM && y > TOP) { doc.addPage(); paper(doc); y = TOP; }
      else { doc.setDrawColor(...GOLD_SOFT); doc.setLineWidth(0.4); doc.line(W / 2 - 20, y + 4, W / 2 + 20, y + 4); y += 14; }
    }
    setFont(doc, "Cormorant", "normal", 11, MUTED);
    doc.text(fmtDate(l.date), W - X, y + 4, { align: "right" });
    y += 8;
    setFont(doc, "Cormorant", "bold", 18, INK);
    m.heading.forEach(t => { if (y + lh(18, 1.3) > BOTTOM) { doc.addPage(); paper(doc); y = TOP; setFont(doc, "Cormorant", "bold", 18, INK); } doc.text(t, X, y + 4); y += lh(18, 1.3); });
    y += 4;
    const row = (text, align) => {
      if (y + STEP > BOTTOM) { doc.addPage(); paper(doc); y = TOP; }
      doc.setDrawColor(...GOLD_SOFT); doc.setLineWidth(0.2);
      doc.line(X, y + 1.6, W - X, y + 1.6);
      setFont(doc, "Caveat", "normal", BODY, INK);
      doc.text(text, align === "right" ? W - X : X, y, { align: align || "left" });
      y += STEP;
    };
    y += STEP * 0.6;
    m.body.forEach((t) => row(t));
    if (m.sign.length) { y += 6; m.sign.forEach((t) => row(t, "right")); }
  });
  return save(doc, filename);
}
