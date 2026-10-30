import React from "react";
import { storageUsage, fmtMB } from "../lib/storage";
import { useStore } from "../store/StoreContext";

// Uso aproximado del almacenamiento del navegador (estimado, no garantizado).
export function StorageMeter({ className = "" }) {
  useStore();
  const u = storageUsage();
  const warn = u.pct >= 80;
  return (
    <div className={`text-xs ${className}`} data-testid="storage-meter">
      <div className="flex justify-between text-[#a9bacb] mb-1">
        <span>Espacio usado en este navegador</span>
        <span className={warn ? "text-amber-300" : ""}>{fmtMB(u.used)} de ~{fmtMB(u.total)} ({u.pct}%)</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#152438]/70 overflow-hidden">
        <div className={`h-full rounded-full ${warn ? "bg-amber-400" : "bg-[#d4af37]"}`} style={{ width: `${Math.max(2, u.pct)}%` }} />
      </div>
      {warn && <p className="text-amber-200 mt-1">Queda poco lugar. Descargá un respaldo; las fotos son lo que más ocupa.</p>}
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
