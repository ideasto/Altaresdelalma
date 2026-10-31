import React, { useEffect, useState } from "react";
import { Modal, Field, TextInput, TextArea, GoldButton, GhostButton, Plus } from "../common";
import DraftNotices from "../DraftNotices";
import { SaveFailNotice } from "../StorageBits";
import useDraft from "../../hooks/useDraft";
import { copyText, downloadText } from "../../lib/drafts";
import { fileToDataUrl, shrinkDataUrl } from "../../lib/image";
import { toast } from "sonner";
import { Image as ImageIcon } from "lucide-react";

const asText = (d) => `${d.title}\n\n${d.text}`.trim();

export default function PageEditor({ open, onClose, editing, spaceId, onSave }) {
  const [draft, setDraft] = useState({ title: "", text: "", photo: "" });
  const [fail, setFail] = useState(false);
  const d = useDraft(`pagina-${spaceId}-${editing?.id || "nueva"}`, { title: draft.title, text: draft.text }, open);

  useEffect(() => {
    if (!open) return;
    setFail(false);
    setDraft(editing ? { title: editing.title, text: editing.text, photo: editing.photo } : { title: "", text: "", photo: "" });
  }, [open, editing]);

  const onPhoto = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const s = await shrinkDataUrl(await fileToDataUrl(f), 2400, 0.9);
    setDraft((p) => ({ ...p, photo: s }));
  };

  const copy = async () => toast.success((await copyText(asText(draft))) ? "Texto copiado." : "No se pudo copiar.");
  const save = () => {
    if (!draft.title.trim() && !draft.text.trim() && !draft.photo) return toast.error("Agregá un título, un texto o una foto.");
    if (onSave(draft)) { d.clear(); onClose(); } else setFail(true);
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Editar página" : "Nueva página"} maxWidth="max-w-xl" testId="libro-form-modal">
      <DraftNotices draft={d} onApply={(r) => setDraft((p) => ({ ...p, title: r.title, text: r.text }))} onCopy={copy} onDownload={() => downloadText(asText(draft), "pagina")} />
      <SaveFailNotice show={fail} onCopy={copy} onDownload={() => downloadText(asText(draft), "pagina")} />
      <Field label="Título (opcional)"><TextInput value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={90} data-testid="libro-title-input" /></Field>
      <Field label="Foto (opcional)">
        {draft.photo ? (
          <div className="relative inline-block">
            <img src={draft.photo} alt="" className="h-28 rounded-xl object-contain bg-[#fdfbf5] p-1" />
            <button className="icon-btn danger absolute -top-2 -right-2 bg-[#152438]" onClick={() => setDraft({ ...draft, photo: "" })} aria-label="Quitar foto" data-testid="libro-photo-remove"><Plus className="w-4 h-4 rotate-45" /></button>
          </div>
        ) : (
          <label className="inline-flex items-center gap-2 ghost-gold rounded-full px-4 py-2 text-sm cursor-pointer">
            <ImageIcon className="w-4 h-4" /> Subir foto
            <input type="file" accept="image/*" className="hidden" onChange={onPhoto} data-testid="libro-photo-input" />
          </label>
        )}
      </Field>
      <Field label="Texto"><TextArea rows={7} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} className="font-hand text-2xl leading-relaxed resize-y" placeholder="Aquel día…" data-testid="libro-text-input" /></Field>
      <div className="flex justify-end gap-3">
        <GhostButton onClick={onClose} testId="libro-form-cancel">Cancelar</GhostButton>
        <GoldButton onClick={save} testId="libro-form-save">{editing ? "Guardar cambios" : "Guardar página"}</GoldButton>
      </div>
    </Modal>
  );
}
