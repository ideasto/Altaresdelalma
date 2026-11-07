import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { readStorage, writeStorage, newAvatar, normalizeAvatar, KEY } from "../lib/storage";
import { loadAll, saveState, writeAll, requestPersistence } from "../lib/db";
import { markChange } from "../lib/backupReminder";
import { toast } from "sonner";

const StoreCtx = createContext(null);
const EMPTY = { avatars: [], trash: [] };

function failMessage(res) {
  if (res.quota) return "No se guardó: no queda lugar en el almacenamiento del navegador.";
  return "No se guardó: el navegador bloqueó la escritura.";
}

// Arranque: IndexedDB primero; si no hay, se migra desde localStorage verificando antes de borrar.
async function bootstrap() {
  let idbOk = true;
  try {
    const data = await loadAll();
    if (data && !data.meta.migrationPending) {
      if (data.missingImages) return { boot: { status: "corrupt", backend: "idb", raw: JSON.stringify(data), missingImages: data.missingImages }, state: EMPTY };

      return { boot: { status: "ok", backend: "idb", missingImages: data.missingImages }, state: { avatars: data.avatars.map(normalizeAvatar), trash: data.trash } };
    }
  } catch (e) {
    idbOk = false;
  }
  const ls = readStorage();
  if (!idbOk) return { boot: { ...ls, backend: "ls", idbBlocked: true }, state: { avatars: ls.avatars, trash: ls.trash } };
  if (ls.status === "corrupt" || ls.status === "inaccessible") return { boot: { ...ls, backend: "idb" }, state: EMPTY };
  const state = { avatars: ls.avatars, trash: ls.trash };
  if (ls.status === "first") return { boot: { status: "first", backend: "idb" }, state };
  const res = await writeAll(state, { migratedFromLS: true, migrationPending: true });
  if (!res.ok) return { boot: { status: "ok", backend: "ls", migrationFailed: true }, state };
  const check = await loadAll();
  const canonical = (v) => JSON.stringify(v, (k, x) => x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map(key => [key, x[key]])) : x);
  const verified = check && check.missingImages === 0 && canonical({ avatars: check.avatars, trash: check.trash }) === canonical(state);
  if (!verified) return { boot: { status: "ok", backend: "ls", migrationFailed: true }, state };
  const finalized = await saveState(state, state, { migratedFromLS: true, migrationPending: false });
  if (!finalized.ok) return { boot: { status: "ok", backend: "ls", migrationFailed: true }, state };
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
  return { boot: { status: "ok", backend: "idb", migrated: ls.status === "migrated" ? "legacy" : "ls" }, state: { avatars: check.avatars.map(normalizeAvatar), trash: check.trash } };
}

export function StoreProvider({ children }) {
  const [boot, setBoot] = useState({ status: "loading" });
  const [state, setState] = useState(EMPTY);
  const ref = useRef(EMPTY);
  const bootRef = useRef(boot);
  const queue = useRef(Promise.resolve());
  const bootStarted = useRef(false);

  useEffect(() => {
    if (bootStarted.current) return;
    bootStarted.current = true;
    bootstrap().then(({ boot: b, state: s }) => {
      ref.current = s; bootRef.current = b; setState(s); setBoot(b);
      requestPersistence();
      if (b.migrated === "legacy") toast.success("Recuperamos tus recuerdos del formato anterior (Mensajes Ancestrales).");
      if (b.migrated === "ls") toast.success("Pasamos tus recuerdos a un almacenamiento con más capacidad para fotos.");
      if (b.migrationFailed) toast.error("No pudimos pasar tus recuerdos al almacenamiento grande; siguen donde estaban. Se reintentará en la próxima visita.");
      if (b.missingImages) toast.error(`${b.missingImages} imagen(es) no se pudieron leer.`);
    });
  }, []);

  const persist = async (next, prev) => {
    if (bootRef.current.backend === "ls") return writeStorage(next);
    return saveState(next, prev);
  };

  // Escribe primero; solo actualiza la pantalla si la escritura terminó bien.
  const commit = (updater, { silent = false } = {}) => {
    const run = async () => {
      const st = bootRef.current.status;
      if (st === "corrupt" || st === "inaccessible" || st === "loading") {
        if (!silent) toast.error("No se puede guardar hasta resolver el problema del almacenamiento.");
        return false;
      }
      const prev = ref.current;
      const next = updater(prev);
      if (next === prev) return true;
      let res;
      try { res = await persist(next, prev); } catch (e) { res = { ok: false, error: e }; }
      if (!res.ok) {
        if (!silent) toast.error(failMessage(res), { description: "Lo que ya estaba guardado sigue intacto y se puede leer. Lo que estás editando sigue abierto." });
        return false;
      }
      ref.current = next;
      setState(next);
      markChange();
      if (st === "first") { bootRef.current = { ...bootRef.current, status: "ok" }; setBoot(bootRef.current); }
      return true;
    };
    const p = queue.current.then(run, run);
    queue.current = p.catch(() => false);
    return p;
  };

  const createAvatar = async (partial) => {
    const a = newAvatar(partial);
    return (await commit((s) => ({ ...s, avatars: [...s.avatars, a] }))) ? a : null;
  };

  const updateAvatar = (id, patch, opts) =>
    commit((s) => ({ ...s, avatars: s.avatars.map((a) => (a.id === id ? { ...a, ...(typeof patch === "function" ? patch(a) : patch) } : a)) }), opts);

  const deleteAvatar = (id) =>
    commit((s) => !s.avatars.some(a => a.id === id) ? s : ({ avatars: s.avatars.filter((a) => a.id !== id), trash: [{ space: s.avatars.find((a) => a.id === id), deletedAt: new Date().toISOString() }, ...s.trash] }));

  const restoreFromTrash = (id) =>
    commit((s) => { const item = s.trash.find(t => t.space.id === id); if (!item) return s; const space = s.avatars.some(a => a.id === id) ? { ...item.space, id: crypto.randomUUID() } : item.space; return { avatars: [...s.avatars, space], trash: s.trash.filter(t => t.space.id !== id) }; });

  const purgeTrash = (id) => commit((s) => ({ ...s, trash: id ? s.trash.filter((t) => t.space.id !== id) : [] }));

  // Borra un elemento de una lista ("letters", "cards", "timeline", "book", "gallery.photos") y ofrece deshacer.
  const removeItem = async (avatarId, path, itemId, doneMsg) => {
    const get = (a) => (path === "gallery.photos" ? a.gallery.photos : a[path]);
    const set = (a, list) => (path === "gallery.photos" ? { gallery: { ...a.gallery, photos: list } } : { [path]: list });
    let item = null, index = -1;
    const ok = await updateAvatar(avatarId, (a) => {
      const list = get(a);
      index = list.findIndex((x) => x.id === itemId);
      item = list[index];
      return { ...set(a, list.filter((x) => x.id !== itemId)), removedItems: [...(a.removedItems || []), { path, item, index, removedAt: new Date().toISOString() }] };
    });
    if (ok && item) {
      toast.success(doneMsg, {
        duration: 7000,
        action: { label: "Deshacer", onClick: async () => {
          const back = await updateAvatar(avatarId, (a) => { const l = [...get(a)]; l.splice(Math.min(index, l.length), 0, item); return { ...set(a, l), removedItems: (a.removedItems || []).filter(r => r.item.id !== itemId) }; });
          if (back) toast.success("Listo, lo recuperamos.");
        } },
      });
    }
    return ok;
  };

  const undoRemoved = (avatarId, itemId) => updateAvatar(avatarId, a => {
    const r = (a.removedItems || []).find(r => r.item.id === itemId);
    if (!r) return {};
    const list = r.path === "gallery.photos" ? a.gallery.photos : a[r.path];
    const next = [...list]; if (!next.some(x => x.id === itemId)) next.splice(Math.min(r.index, next.length), 0, r.item);
    return { ...(r.path === "gallery.photos" ? { gallery: { ...a.gallery, photos: next } } : { [r.path]: next }), removedItems: a.removedItems.filter(x => x !== r) };
  });

  const getAvatar = (id) => state.avatars.find((a) => a.id === id);
  const replaceAll = (list) => commit((s) => ({ ...s, avatars: list.map(normalizeAvatar) }));

  // Solo tras confirmación explícita (datos ilegibles).
  const resetStorage = async (list = []) => {
    const next = { avatars: list.map(normalizeAvatar), trash: [] };
    const res = bootRef.current.backend === "ls" ? writeStorage(next) : await writeAll(next);
    if (!res.ok) return false;
    try { localStorage.removeItem(KEY); } catch { /* noop */ }
    ref.current = next; setState(next);
    bootRef.current = { status: "ok", backend: bootRef.current.backend }; setBoot(bootRef.current);
    return true;
  };

  return (
    <StoreCtx.Provider value={{ boot, avatars: state.avatars, trash: state.trash, commit, undoRemoved, createAvatar, updateAvatar, deleteAvatar, restoreFromTrash, purgeTrash, removeItem, getAvatar, replaceAll, resetStorage }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
