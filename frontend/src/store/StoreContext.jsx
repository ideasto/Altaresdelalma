import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { loadData, saveData, newAvatar } from "../lib/storage";
import { toast } from "sonner";

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [avatars, setAvatars] = useState(() => loadData());
  const first = useRef(true);

  // Persist instantly on every change (spec: localStorage updated before re-render of list)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const res = saveData(avatars);
    if (!res.ok) {
      toast.error("No se pudo guardar. El almacenamiento del navegador está lleno.", {
        description: "Hacé un respaldo y liberá espacio (muchas fotos pueden superar el límite).",
      });
    }
  }, [avatars]);

  const createAvatar = (partial) => {
    const a = newAvatar(partial);
    setAvatars((prev) => [...prev, a]);
    return a;
  };

  const updateAvatar = (id, patch) => {
    setAvatars((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...(typeof patch === "function" ? patch(a) : patch) } : a))
    );
  };

  const deleteAvatar = (id) => {
    setAvatars((prev) => prev.filter((a) => a.id !== id));
  };

  const getAvatar = (id) => avatars.find((a) => a.id === id);

  const replaceAll = (list) => setAvatars(list);

  return (
    <StoreCtx.Provider value={{ avatars, createAvatar, updateAvatar, deleteAvatar, getAvatar, replaceAll }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
