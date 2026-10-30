import { useEffect, useRef, useState } from "react";
import { loadDraft, saveDraft, clearDraft } from "../lib/drafts";

// Guarda borradores mientras se escribe; avisa si no hay lugar ni para el borrador.
export default function useDraft(key, value, active) {
  const [failed, setFailed] = useState(false);
  const [recovered, setRecovered] = useState(null);
  const skip = useRef(true);

  useEffect(() => {
    if (!active) return;
    skip.current = true;
    const d = loadDraft(key);
    setRecovered(d);
    setFailed(false);
  }, [key, active]);

  useEffect(() => {
    if (!active) return;
    if (skip.current) { skip.current = false; return; }
    const t = setTimeout(() => setFailed(!saveDraft(key, value)), 500);
    return () => clearTimeout(t);
  }, [key, value, active]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    failed,
    recovered,
    dismissRecovered: () => setRecovered(null),
    clear: () => { clearDraft(key); setRecovered(null); },
  };
}
