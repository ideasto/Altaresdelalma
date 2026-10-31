import { newDoc, save, setFont, lines, lh, fillPage, doubleBorder, drawContain, footer, logoUrl, GOLD, BLUE, MUTED } from "./core";
import { bookTitle, BOOK_FONTS } from "../format";
import { BRAND } from "../../config/brand";

const W = 210, H = 297;
const CREAM = [236, 228, 205];

async function cover(doc, a) {
  fillPage(doc, BLUE);
  doubleBorder(doc, 10);
  const m = a.bookMeta;
  setFont(doc, "Cormorant", "bold", 30, GOLD);
  const t = lines(doc, bookTitle(a), 160);
  let y = 34;
  t.forEach((l) => { doc.text(l, W / 2, y, { align: "center" }); y += lh(30, 1.15); });
  const photo = m.coverPhoto || a.photoCropped;
  const subLines = m.subtitle ? (setFont(doc, "Caveat", "normal", 20), lines(doc, m.subtitle, 150)) : [];
  const bottom = 232 - subLines.length * lh(20, 1.2);
  if (photo) {
    const box = await drawContain(doc, photo, 32, y + 4, W - 64, bottom - y - 8);
    if (box) {
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.6);
      doc.rect(box.x - 2, box.y - 2, box.w + 4, box.h + 4);
      y = box.y + box.h + 12;
    }
  } else y += 10;
  if (subLines.length) {
    setFont(doc, "Caveat", "normal", 20, CREAM);
    subLines.forEach((l) => { doc.text(l, W / 2, y, { align: "center" }); y += lh(20, 1.2); });
  }
  await drawContain(doc, logoUrl(), W / 2 - 13, 242, 26, 30, "logo");
  setFont(doc, "helvetica", "normal", 9, GOLD);
  doc.setCharSpace(0.6);
  doc.text(BRAND.editorialCredit.toUpperCase(), W / 2, 279, { align: "center" });
  doc.setCharSpace(0);
}

async function interior(doc, p, pageNo) {
  const f = BOOK_FONTS[p.font] || BOOK_FONTS.serif;
  const size = f.pt[p.size] || f.pt.m;
  const frame = () => { doc.setDrawColor(...GOLD); doc.setLineWidth(0.3); doc.rect(12, 12, W - 24, H - 24); };
  doc.addPage(); frame();
  let y = 30;
  if (p.title) {
    setFont(doc, "Cormorant", "bold", 22);
    lines(doc, p.title, 150).forEach((l) => { doc.text(l, W / 2, y, { align: "center" }); y += lh(22, 1.15); });
    y += 4;
  }
  if (p.photo) {
    const maxH = p.text ? 115 : 220;
    const box = await drawContain(doc, p.photo, 25, y, W - 50, maxH);
    if (box) y = box.y + box.h + 10;
  }
  if (p.text) {
    setFont(doc, f.family, f.style, size);
    const step = lh(size, f.lead);
    const ls = lines(doc, p.text, W - 50);
    ls.forEach((l) => {
      if (y > H - 28) {
        setFont(doc, "helvetica", "italic", 9, MUTED);
        doc.text("continúa en la página siguiente", W - 25, H - 18, { align: "right" });
        doc.addPage(); frame(); y = 30;
        setFont(doc, f.family, f.style, size);
      }
      doc.text(l, 25, y);
      y += step;
    });
  }
  footer(doc, String(pageNo));
}

async function back(doc, a) {
  doc.addPage();
  fillPage(doc, BLUE);
  doubleBorder(doc, 10);
  const m = a.bookMeta;
  let y = 62;
  setFont(doc, "Cormorant", "bold", 26, GOLD);
  lines(doc, bookTitle(a), 150).forEach((l) => { doc.text(l, W / 2, y, { align: "center" }); y += lh(26, 1.15); });
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.4); doc.line(W / 2 - 15, y, W / 2 + 15, y);
  y += 12;
  if (m.backText) {
    let size = 14;
    setFont(doc, "Cormorant", "normal", size, [231, 238, 246]);
    let ls = lines(doc, m.backText, 140);
    while (ls.length * lh(size, 1.4) > 150 && size > 10) { size -= 0.5; setFont(doc, "Cormorant", "normal", size, [231, 238, 246]); ls = lines(doc, m.backText, 140); }
    ls.forEach((l) => { doc.text(l, 35, y); y += lh(size, 1.4); });
    y += 8;
  }
  if (m.closing) {
    setFont(doc, "Caveat", "normal", 20, [253, 230, 138]);
    lines(doc, m.closing, 140).forEach((l) => { doc.text(l, W / 2, y, { align: "center" }); y += lh(20, 1.2); });
  }
  await drawContain(doc, logoUrl(), W / 2 - 11, 244, 22, 26, "logo");
  setFont(doc, "helvetica", "normal", 9, GOLD);
  doc.setCharSpace(0.6);
  doc.text(BRAND.editorialCredit.toUpperCase(), W / 2, 279, { align: "center" });
  doc.setCharSpace(0);
}

// Tapa, interiores en el orden elegido y contratapa al final. Sin páginas en blanco agregadas.
export async function bookPdf(a) {
  const doc = await newDoc();
  await cover(doc, a);
  for (let i = 0; i < a.book.length; i++) await interior(doc, a.book[i], i + 1);
  await back(doc, a);
  return save(doc, `libro-${a.name}.pdf`);
}
