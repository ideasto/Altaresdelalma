import React, { useState } from "react";
import { Modal, GoldButton, GhostButton } from "./common";
import { useStore } from "../store/StoreContext";
import { applyRestore, exportBackup } from "../lib/storage";
import { toast } from "sonner";
import { Download } from "lucide-react";

const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;

export function SummaryList({ s }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#d5dfea]" data-testid="restore-summary">
      <li>{plural(s.spaces, "espacio", "espacios")}</li>
      <li>{plural(s.letters, "carta escrita", "cartas escritas")}</li>
      <li>{plural(s.cards, "carta del mazo", "cartas del mazo")}</li>
      <li>{plural(s.photos, "foto", "fotos")}</li>
      <li>{plural(s.moments, "momento", "momentos")}</li>
      <li>{plural(s.pages, "página del libro", "páginas del libro")}</li>
    </ul>
  );
}

// Vista previa antes de restaurar: cancelar, combinar (con duplicados explícitos) o reemplazar.
export default function RestoreDialog({ data, onClose }) {
  const { avatars, replaceAll } = useStore();
  const [mode, setMode] = useState("merge");
  const [dup, setDup] = useState("copy");
  const [ack, setAck] = useState(false);
  if (!data) return null;

  const existing = new Set(avatars.map((a) => a.id));
  const dups = data.list.filter((a) => existing.has(a.id));

  const apply = () => {
    if (mode === "replace" && !ack) return toast.error("Confirmá que entendés que se reemplaza todo.");
    const next = applyRestore(avatars, data.list, mode, dup);
    if (!replaceAll(next)) return toast.error("No se pudo restaurar sin pasar la capacidad del navegador. Tu estado anterior quedó intacto.");
    toast.success("Respaldo restaurado.");
    onClose();
  };

  const Opt = ({ value, cur, set, label, desc, testId }) => (
    <label className={`block rounded-xl border px-4 py-3 cursor-pointer mb-2 ${cur === value ? "border-[#d4af37] bg-[#d4af37]/10" : "border-[#d4af37]/25"}`} data-testid={testId}>
      <input type="radio" className="mr-2 accent-[#d4af37]" checked={cur === value} onChange={() => set(value)} />
      <span className="text-[#f8fafc]">{label}</span>
      {desc && <span className="block text-xs text-[#a9bacb] mt-1 ml-5">{desc}</span>}
    </label>
  );

  return (
    <Modal open={!!data} onClose={onClose} title="Restaurar un respaldo" maxWidth="max-w-xl" testId="restore-dialog">
      <p className="text-sm text-[#a9bacb] mb-3">
        Origen: {data.sourceApp} · versión {data.version}{data.exportedAt ? ` · ${new Date(data.exportedAt).toLocaleDateString("es-AR")}` : ""}
        {data.legacy && " · formato anterior, se convierte automáticamente"}
      </p>
      <SummaryList s={data.summary} />
      {data.warnings.length > 0 && <ul className="mt-3 text-xs text-amber-200">{data.warnings.map((w) => <li key={w}>· {w}</li>)}</ul>}

      <div className="mt-5">
        <Opt value="merge" cur={mode} set={setMode} label="Combinar con lo que ya tengo" testId="restore-mode-merge" />
        {mode === "merge" && dups.length > 0 && (
          <div className="ml-5 mb-3" data-testid="restore-dup-options">
            <p className="text-xs text-[#a9bacb] mb-2">{plural(dups.length, "espacio ya existe", "espacios ya existen")} acá ({dups.map((d) => d.name).join(", ")}). ¿Qué hacemos?</p>
            <Opt value="copy" cur={dup} set={setDup} label="Conservar ambos (el del respaldo entra como copia)" testId="restore-dup-copy" />
            <Opt value="overwrite" cur={dup} set={setDup} label="Reemplazar el existente por el del respaldo" testId="restore-dup-overwrite" />
            <Opt value="skip" cur={dup} set={setDup} label="Saltear los repetidos" testId="restore-dup-skip" />
          </div>
        )}
        <Opt value="replace" cur={mode} set={setMode} label="Reemplazar todo" desc="Se eliminan los cambios que no estén en este respaldo." testId="restore-mode-replace" />
        {mode === "replace" && (
          <div className="ml-5 mt-2 space-y-2">
            <GhostButton onClick={() => exportBackup(avatars)} testId="restore-download-current" className="py-2"><Download className="w-4 h-4" /> Descargar mi estado actual primero</GhostButton>
            <label className="flex items-center gap-2 text-sm text-[#d5dfea]">
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="accent-[#d4af37]" data-testid="restore-replace-ack" />
              Entiendo que reemplazar borra lo que no esté en el respaldo.
            </label>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <GhostButton onClick={onClose} testId="restore-cancel">Cancelar</GhostButton>
        <GoldButton onClick={apply} testId="restore-apply">Restaurar</GoldButton>
      </div>
    </Modal>
  );
}
