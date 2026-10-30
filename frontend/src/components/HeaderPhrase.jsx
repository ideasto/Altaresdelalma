import React, { useEffect, useState } from "react";
import { Modal, TextArea, GoldButton, GhostButton } from "./common";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

const SUGGESTION = "Honramos tu luz, siempre.";

// Frase personal opcional de la cabecera: editar con lápiz, quitar o sugerencia editable.
export default function HeaderPhrase({ phrase, onSave }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(phrase);
  useEffect(() => { if (open) setDraft(phrase); }, [open, phrase]);

  const save = (value) => {
    if (onSave(value.trim())) {
      toast.success(value.trim() ? "Frase guardada." : "Frase quitada.");
      setOpen(false);
    }
  };

  return (
    <>
      {phrase ? (
        <div className="flex items-start gap-2 mt-2 justify-center sm:justify-start">
          <p className="text-[#e7eef6] font-hand text-2xl sm:text-3xl whitespace-pre-wrap" data-testid="header-phrase">{phrase}</p>
          <button className="icon-btn mt-1" onClick={() => setOpen(true)} title="Editar frase" aria-label="Editar frase" data-testid="header-phrase-edit"><Pencil className="w-4 h-4" /></button>
        </div>
      ) : (
        <button className="mt-2 text-sm text-[#a9bacb] hover:text-[#f8fafc] inline-flex items-center gap-1.5" onClick={() => setOpen(true)} data-testid="header-phrase-add">
          <Pencil className="w-3.5 h-3.5 gold-text" /> Agregar una frase
        </button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Frase de la cabecera" maxWidth="max-w-md" testId="header-phrase-modal">
        <p className="text-sm text-[#a9bacb] mb-3">Una frase suya, unas palabras tuyas o algo que quieras tener cerca.</p>
        <TextArea rows={3} maxLength={140} value={draft} onChange={(e) => setDraft(e.target.value)} className="font-hand text-2xl" data-testid="header-phrase-input" />
        {!draft && (
          <button className="text-xs gold-text underline mt-2" onClick={() => setDraft(SUGGESTION)} data-testid="header-phrase-suggest">Usar como idea: «{SUGGESTION}»</button>
        )}
        <div className="flex justify-between gap-3 mt-5">
          {phrase ? <button className="text-sm text-red-300 underline" onClick={() => save("")} data-testid="header-phrase-remove">Quitar frase</button> : <span />}
          <div className="flex gap-3">
            <GhostButton onClick={() => setOpen(false)} testId="header-phrase-cancel">Cancelar</GhostButton>
            <GoldButton onClick={() => save(draft)} testId="header-phrase-save">Guardar</GoldButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
