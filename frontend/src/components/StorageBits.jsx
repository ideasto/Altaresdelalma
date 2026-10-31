import React, { useEffect, useState } from "react";
import { storageEstimate } from "../lib/db";
import { useStore } from "../store/StoreContext";

const mb = (b) => `${(b / (1024 * 1024)).toFixed(b < 10 * 1024 * 1024 ? 1 : 0)} MB`;
const gb = (b) => (b > 1024 ** 3 ? `${(b / 1024 ** 3).toFixed(1)} GB` : mb(b));

// Uso aproximado del almacenamiento del navegador (estimado por el propio navegador).
export function StorageMeter({ className = "" }) {
  const { avatars, boot } = useStore();
  const [est, setEst] = useState(null);
  useEffect(() => { storageEstimate().then(setEst); }, [avatars]);
  const photos = avatars.reduce((n, a) => n + a.gallery.photos.length, 0);
  if (!est || !est.quota) return null;
  const pct = Math.min(100, Math.round((est.used / est.quota) * 100));
  const warn = pct >= 80;
  return (
    <div className={`text-xs ${className}`} data-testid="storage-meter">
      <div className="flex justify-between gap-3 text-[#a9bacb] mb-1">
        <span>Guardado en este navegador · {photos} foto{photos === 1 ? "" : "s"} en galerías</span>
        <span className={warn ? "text-amber-300" : ""} data-testid="storage-meter-usage">{mb(est.used)} usados de ~{gb(est.quota)} disponibles</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#152438]/70 overflow-hidden">
        <div className={`h-full rounded-full ${warn ? "bg-amber-400" : "bg-[#d4af37]"}`} style={{ width: `${Math.max(1, pct)}%` }} />
      </div>
      {warn && <p className="text-amber-200 mt-1">Queda poco lugar. Descargá un respaldo; las fotos son lo que más ocupa.</p>}
      {boot.backend === "ls" && <p className="text-amber-200 mt-1">Este navegador no permite el almacenamiento grande: la capacidad para fotos es limitada.</p>}
    </div>
  );
}

// Aviso inline cuando un guardado falla: el texto sigue en el editor.
export function SaveFailNotice({ show, onDownload, onCopy }) {
  if (!show) return null;
  return (
    <div className="rounded-xl border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-100 mb-3" data-testid="save-fail-notice" role="alert">
      Todavía no se guardó (el navegador no tiene lugar o bloqueó la escritura). Tu texto sigue acá.
      <div className="flex gap-3 mt-2">
        <button className="underline" onClick={onDownload} data-testid="save-fail-download">Descargar texto</button>
        <button className="underline" onClick={onCopy} data-testid="save-fail-copy">Copiar</button>
      </div>
    </div>
  );
}
