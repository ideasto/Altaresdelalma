export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Fecha civil local (evita el corrimiento de día por UTC).
// Acepta "AAAA", "AAAA-MM" o "AAAA-MM-DD" sin inventar día ni mes.
export function fmtDate(d, month = "long") {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  if (!y) return d;
  if (!m) return String(y);
  if (!day) return new Date(y, m - 1, 1).toLocaleDateString("es-AR", { month, year: "numeric" });
  return new Date(y, m - 1, day).toLocaleDateString("es-AR", { day: "numeric", month, year: "numeric" });
}

// Regla estable: con fecha primero (ascendente), sin fecha al final en orden de carga.
export const sortMoments = (list) =>
  list.map((e, i) => ({ e, i })).sort((a, b) => {
    if (a.e.date && b.e.date) return a.e.date.localeCompare(b.e.date) || a.i - b.i;
    if (a.e.date) return -1;
    if (b.e.date) return 1;
    return a.i - b.i;
  }).map((x) => x.e);

export const bookTitle = (a) => a.bookMeta.title || `El libro de ${a.name}`;

// Opciones tipográficas del libro (pantalla en px, PDF en pt).
export const BOOK_FONTS = {
  serif: { label: "Clásica", family: "Cormorant", style: "normal", css: "font-heading", px: { s: 18, m: 21, l: 24 }, pt: { s: 12, m: 13.5, l: 15.5 }, lead: 1.4 },
  manuscrita: { label: "Manuscrita", family: "Caveat", style: "normal", css: "font-hand", px: { s: 22, m: 26, l: 30 }, pt: { s: 14, m: 16.5, l: 19 }, lead: 1.3 },
};
