import { useCallback, useEffect, useRef, useState } from "react";
import { loadDraft, saveDraft, clearDraft } from "../lib/drafts";

const blank = (v) => Object.values(v || {}).every((x) => !String(x || "").trim());

// Borradores: solo se escriben cuando hubo cambios reales y nunca pisan un borrador pendiente
// hasta que se recupere, se descarte explícitamente o se guarde la pieza.
export default function useDraft(key, value, active) {
  const [failed, setFailed] = useState(false);
  const [recovered, setRecovered] = useState(null);
  const base = useRef(null);
  const pending = useRef(false);
  const latest = useRef(value); latest.current = value;
  const cleared = useRef(false);

  useEffect(() => {
    if (!active) return;
    cleared.current = false;
    const d = loadDraft(key);
    pending.current = !!d;
    setRecovered(d);
    setFailed(false);
    base.current = null;
    return () => {
      if (!cleared.current && !pending.current && base.current !== null && JSON.stringify(latest.current) !== base.current) saveDraft(key, latest.current);
    };
  }, [key, active]);

  useEffect(() => {
    if (!active) return;
    const json = JSON.stringify(value);
    if (base.current === null) { base.current = json; return; }
    if (pending.current || json === base.current || blank(value)) return;
    cleared.current = false;
    const t = setTimeout(() => setFailed(!saveDraft(key, value)), 500);
    return () => clearTimeout(t);
  }, [key, value, active]);

  const rebase = useCallback((v) => { base.current = JSON.stringify(v); }, []);

  return {
    failed,
    recovered,
    pending: !!recovered,
    apply: () => { pending.current = false; const r = recovered; setRecovered(null); return r; },
    clear: () => { cleared.current = true; clearDraft(key); pending.current = false; setRecovered(null); },
    // Se llama al abrir para fijar el contenido inicial (no cuenta como cambio).
    rebase,
  };
}
