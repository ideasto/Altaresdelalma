import { useEffect, useRef, useState } from "react";
import { loadDraft, saveDraft, clearDraft } from "../lib/drafts";

const blank = (v) => Object.values(v || {}).every((x) => !String(x || "").trim());

// Borradores: solo se escriben cuando hubo cambios reales y nunca pisan un borrador pendiente
// hasta que se recupere, se descarte explícitamente o se guarde la pieza.
export default function useDraft(key, value, active) {
  const [failed, setFailed] = useState(false);
  const [recovered, setRecovered] = useState(null);
  const base = useRef(null);
  const pending = useRef(false);

  useEffect(() => {
    if (!active) return;
    const d = loadDraft(key);
    pending.current = !!d;
    setRecovered(d);
    setFailed(false);
    base.current = null;
  }, [key, active]);

  useEffect(() => {
    if (!active) return;
    const json = JSON.stringify(value);
    if (base.current === null) { base.current = json; return; }
    if (pending.current || json === base.current || blank(value)) return;
    const t = setTimeout(() => setFailed(!saveDraft(key, value)), 500);
    return () => clearTimeout(t);
  }, [key, value, active]);

  return {
    failed,
    recovered,
    pending: !!recovered,
    apply: () => { pending.current = false; const r = recovered; setRecovered(null); return r; },
    clear: () => { clearDraft(key); pending.current = false; setRecovered(null); },
    // Se llama al abrir para fijar el contenido inicial (no cuenta como cambio).
    rebase: (v) => { base.current = JSON.stringify(v); },
  };
}
