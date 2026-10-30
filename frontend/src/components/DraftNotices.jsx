import React from "react";

// Avisos de borrador: recuperado o imposible de guardar.
export default function DraftNotices({ draft, onApply, onCopy, onDownload }) {
  return (
    <>
      {draft.recovered && (
        <div className="rounded-xl border border-[#d4af37]/45 bg-[#d4af37]/10 p-3 text-sm text-[#f8fafc] mb-3" data-testid="draft-recovered">
          Hay un borrador sin guardar de {new Date(draft.recovered.savedAt).toLocaleString("es-AR")}.
          <div className="flex gap-4 mt-2">
            <button className="gold-text underline" onClick={() => { onApply(draft.recovered); draft.dismissRecovered(); }} data-testid="draft-apply">Recuperarlo</button>
            <button className="text-[#a9bacb] underline" onClick={draft.clear} data-testid="draft-discard">Descartarlo</button>
          </div>
        </div>
      )}
      {draft.failed && (
        <div className="rounded-xl border border-amber-400/50 bg-amber-500/10 p-3 text-sm text-amber-100 mb-3" data-testid="draft-failed" role="alert">
          No hay lugar ni para guardar el borrador. Copiá o descargá el texto para no perderlo.
          <div className="flex gap-4 mt-2">
            <button className="underline" onClick={onCopy}>Copiar</button>
            <button className="underline" onClick={onDownload}>Descargar</button>
          </div>
        </div>
      )}
    </>
  );
}
