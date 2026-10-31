import React, { useEffect, useState } from "react";
import { Modal, GoldButton, GhostButton } from "../common";
import DraftNotices from "../DraftNotices";
import { SaveFailNotice } from "../StorageBits";
import useDraft from "../../hooks/useDraft";
import { copyText, downloadText } from "../../lib/drafts";
import { getContact } from "../../lib/contact";
import { todayLocal } from "../../lib/storage";
import { toast } from "sonner";

const letterText = (d) => `${d.date}\nPara ${d.to}\n\n${d.body}\n\n${d.sign}`.trim();

export default function LetterEditor({ open, onClose, editing, spaceId, spaceName, onSave }) {
  const [draft, setDraft] = useState({ date: todayLocal(), to: "", body: "", sign: "" });
  const [fail, setFail] = useState(false);
  const d = useDraft(`carta-${spaceId}-${editing?.id || "nueva"}`, draft, open);

  useEffect(() => {
    if (!open) return;
    setFail(false);
    const initial = editing ? { date: editing.date, to: editing.to, body: editing.body, sign: editing.sign } : { date: todayLocal(), to: spaceName, body: "", sign: getContact()?.name || "" };
    d.rebase(initial);
    setDraft(initial);
  }, [open, editing, spaceName]);

  const copy = async () => toast[(await copyText(letterText(draft))) ? "success" : "error"]("Texto copiado.");
  const download = () => downloadText(letterText(draft), "carta");

  const save = async () => {
    if (!draft.body.trim()) return toast.error("Escribí el cuerpo de la carta.");
    if (await onSave(draft)) { d.clear(); onClose(); } else setFail(true);
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Editar carta" : "Nueva carta"} maxWidth="max-w-2xl" testId="cartas-form-modal">
      <DraftNotices draft={d} onApply={(r) => setDraft({ date: r.date, to: r.to, body: r.body, sign: r.sign })} onCopy={copy} onDownload={download} />
      <SaveFailNotice show={fail} onCopy={copy} onDownload={download} />
      <div className="paper-sheet rounded-2xl p-5 sm:p-7">
        <div className="grid grid-cols-2 gap-4">
          <label className="block"><span className="text-xs uppercase tracking-wider text-[#6b5a3e]">Fecha</span>
            <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="w-full bg-transparent border-b border-[#c9a94a]/60 py-1 outline-none text-[#2b2114]" data-testid="carta-date-input" />
          </label>
          <label className="block"><span className="text-xs uppercase tracking-wider text-[#6b5a3e]">Para</span>
            <input value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className="w-full bg-transparent border-b border-[#c9a94a]/60 py-1 outline-none text-[#2b2114] font-heading text-xl" data-testid="carta-to-input" />
          </label>
        </div>
        <textarea
          rows={10}
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          placeholder="Querido/a…"
          className="w-full mt-4 bg-transparent outline-none resize-y font-hand text-2xl leading-relaxed text-[#2b2114] placeholder:text-[#b3a27f]"
          style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 35px, rgba(201,169,74,0.25) 36px)", lineHeight: "36px" }}
          data-testid="carta-body-input"
        />
        <input value={draft.sign} onChange={(e) => setDraft({ ...draft, sign: e.target.value })} placeholder="Firma (opcional)" className="w-full text-right bg-transparent outline-none font-hand text-2xl text-[#2b2114] placeholder:text-[#b3a27f] mt-2" data-testid="carta-sign-input" />
      </div>
      <div className="flex justify-end gap-3 mt-5">
        <GhostButton onClick={onClose} testId="carta-form-cancel">Cancelar</GhostButton>
        <GoldButton onClick={save} testId="carta-form-save">{editing ? "Guardar cambios" : "Guardar carta"}</GoldButton>
      </div>
    </Modal>
  );
}

export { letterText };
