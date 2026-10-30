import React, { createContext, useContext, useRef, useState } from "react";
import { readStorage, writeStorage, newAvatar, normalizeAvatar } from "../lib/storage";
import { toast } from "sonner";

const StoreCtx = createContext(null);

function failMessage(res) {
  return res.quota
    ? "No se guardó: el almacenamiento del navegador está lleno."
    : "No se guardó: el navegador no permitió escribir los datos.";
}

export function StoreProvider({ children }) {
  const initial = useRef(null);
  if (!initial.current) initial.current = readStorage();
  const [boot, setBoot] = useState(initial.current);
  const [state, setState] = useState({ avatars: initial.current.avatars, trash: initial.current.trash });
  const ref = useRef(state);

  // Al migrar el formato viejo, se guarda una vez en el formato nuevo (el original no se toca).
  React.useEffect(() => {
    if (initial.current.status === "migrated" && writeStorage(ref.current).ok) {
      toast.success("Recuperamos tus recuerdos del formato anterior (Mensajes Ancestrales).");
    }
  }, []);

  // Escribe primero; solo actualiza la pantalla si la escritura terminó bien.
  const commit = (updater, { silent = false } = {}) => {
    if (boot.status === "corrupt" || boot.status === "inaccessible") {
      if (!silent) toast.error("No se puede guardar hasta resolver el problema del almacenamiento.");
      return false;
    }
    const next = updater(ref.current);
    const res = writeStorage(next);
    if (!res.ok) {
      if (!silent) toast.error(failMessage(res), { description: "Lo que ya estaba guardado sigue intacto. Lo que estás editando sigue abierto." });
      return false;
    }
    ref.current = next;
    setState(next);
    if (boot.status === "migrated" || boot.status === "first") setBoot((b) => ({ ...b, status: "ok" }));
    return true;
  };

  const createAvatar = (partial) => {
    const a = newAvatar(partial);
    return commit((s) => ({ ...s, avatars: [...s.avatars, a] })) ? a : null;
  };

  const updateAvatar = (id, patch, opts) =>
    commit((s) => ({
      ...s,
      avatars: s.avatars.map((a) => (a.id === id ? { ...a, ...(typeof patch === "function" ? patch(a) : patch) } : a)),
    }), opts);

  const deleteAvatar = (id) =>
    commit((s) => {
      const space = s.avatars.find((a) => a.id === id);
      return { avatars: s.avatars.filter((a) => a.id !== id), trash: [{ space, deletedAt: new Date().toISOString() }, ...s.trash] };
    });

  const restoreFromTrash = (id) =>
    commit((s) => {
      const item = s.trash.find((t) => t.space.id === id);
      return { avatars: [...s.avatars, item.space], trash: s.trash.filter((t) => t.space.id !== id) };
    });

  const purgeTrash = (id) => commit((s) => ({ ...s, trash: id ? s.trash.filter((t) => t.space.id !== id) : [] }));

  // Borra un elemento de una lista ("letters", "cards", "timeline", "book", "gallery.photos") y ofrece deshacer.
  const removeItem = (avatarId, path, itemId, doneMsg) => {
    const get = (a) => (path === "gallery.photos" ? a.gallery.photos : a[path]);
    const set = (a, list) => (path === "gallery.photos" ? { gallery: { ...a.gallery, photos: list } } : { [path]: list });
    let item = null, index = -1;
    const ok = updateAvatar(avatarId, (a) => {
      const list = get(a);
      index = list.findIndex((x) => x.id === itemId);
      item = list[index];
      return set(a, list.filter((x) => x.id !== itemId));
    });
    if (ok && item) {
      toast.success(doneMsg, {
        duration: 7000,
        action: { label: "Deshacer", onClick: () => {
          const back = updateAvatar(avatarId, (a) => { const l = [...get(a)]; l.splice(Math.min(index, l.length), 0, item); return set(a, l); });
          if (back) toast.success("Listo, lo recuperamos.");
        } },
      });
    }
    return ok;
  };

  const getAvatar = (id) => state.avatars.find((a) => a.id === id);

  const replaceAll = (list) => commit((s) => ({ ...s, avatars: list.map(normalizeAvatar) }));

  const resetStorage = (list = []) => {
    const next = { avatars: list.map(normalizeAvatar), trash: [] };
    const res = writeStorage(next);
    if (!res.ok) return false;
    ref.current = next;
    setState(next);
    setBoot({ status: "ok", ...next });
    return true;
  };

  return (
    <StoreCtx.Provider
      value={{
        boot, avatars: state.avatars, trash: state.trash, commit, createAvatar, updateAvatar, deleteAvatar,
        restoreFromTrash, purgeTrash, removeItem, getAvatar, replaceAll, resetStorage,
      }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
