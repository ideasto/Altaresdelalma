import React, { useState } from "react";
import { Modal, ConfirmDialog } from "./common";
import { useStore } from "../store/StoreContext";
import { toast } from "sonner";
import { RotateCcw, Trash2 } from "lucide-react";

export default function TrashDialog({ open, onClose }) {
  const { trash, restoreFromTrash, purgeTrash } = useStore();
  const [purge, setPurge] = useState(null);
  return (
    <Modal open={open} onClose={onClose} title="Papelera" maxWidth="max-w-lg" testId="trash-dialog">
      <p className="text-sm text-[#a9bacb] mb-4">Los espacios borrados quedan acá hasta que los elimines definitivamente. Siguen ocupando lugar en el navegador.</p>
      {trash.length === 0 ? (
        <p className="text-[#d5dfea]" data-testid="trash-empty">La papelera está vacía.</p>
      ) : (
        <ul className="space-y-2">
          {trash.map((t) => (
            <li key={t.space.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#d4af37]/25 px-4 py-3" data-testid={`trash-item-${t.space.id}`}>
              <div className="min-w-0">
                <p className="text-[#f8fafc] truncate">{t.space.name}</p>
                <p className="text-xs text-[#a9bacb]">Borrado el {new Date(t.deletedAt).toLocaleDateString("es-AR")}</p>
              </div>
              <div className="flex gap-1">
                <button className="icon-btn" title="Recuperar" onClick={() => restoreFromTrash(t.space.id) && toast.success("Espacio recuperado.")} data-testid={`trash-restore-${t.space.id}`}><RotateCcw className="w-4 h-4" /></button>
                <button className="icon-btn danger" title="Eliminar definitivamente" onClick={() => setPurge(t.space)} data-testid={`trash-purge-${t.space.id}`}><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={!!purge}
        onClose={() => setPurge(null)}
        onConfirm={() => { purgeTrash(purge.id) && toast.success("Eliminado definitivamente."); setPurge(null); }}
        title="¿Eliminar definitivamente?"
        message={`El espacio de ${purge?.name} se borrará para siempre de este navegador. No se puede deshacer.`}
        confirmLabel="Eliminar definitivamente"
        testId="trash-purge-confirm"
      />
    </Modal>
  );
}
