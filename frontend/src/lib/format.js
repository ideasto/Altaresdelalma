export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Fecha civil local (evita el corrimiento de día por UTC).
export function fmtDate(d, month = "long") {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return d;
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
