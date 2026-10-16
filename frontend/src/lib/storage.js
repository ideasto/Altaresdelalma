const KEY = "ma_data_v1";

export const emptyGallery = () => ({ folders: [], photos: [] });

export function newAvatar(partial = {}) {
  return {
    id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now() + Math.random()),
    name: "",
    kind: "persona", // persona | animal
    birth: "",
    passing: "",
    photo: "",        // original dataURL
    photoCropped: "", // baked cropped dataURL used for display / pdf
    crop: null,       // { x, y, zoom }
    cards: [],        // oracle cards: { id, message, name }
    letters: [],      // { id, date, to, body, sign }
    timeline: [],     // { id, date, icon, title, description, photo }
    gallery: emptyGallery(),
    book: [],         // { id, photo, title, text }
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.avatars)) return parsed.avatars;
    return [];
  } catch {
    return [];
  }
}

export function saveData(avatars) {
  try {
    localStorage.setItem(KEY, JSON.stringify(avatars));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}

export function exportBackup(avatars) {
  const payload = {
    app: "Mensajes Ancestrales",
    brand: "La Gata y la Magia",
    version: 1,
    exportedAt: new Date().toISOString(),
    avatars,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mensajes-ancestrales-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseBackup(text) {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.avatars)) return parsed.avatars;
  throw new Error("Archivo de respaldo no válido");
}
