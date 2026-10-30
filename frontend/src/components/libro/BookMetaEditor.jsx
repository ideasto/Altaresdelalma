import React, { useEffect, useState } from "react";
import { Modal, Field, TextInput, TextArea, GoldButton, GhostButton } from "../common";
import PhotoEditor from "../PhotoEditor";
import { Image as ImageIcon } from "lucide-react";

// Edita tapa y contratapa. El título no depende del nombre del espacio.
export default function BookMetaEditor({ open, onClose, a, part, onSave }) {
  const [m, setM] = useState(a.bookMeta);
  const [photoOpen, setPhotoOpen] = useState(false);
  useEffect(() => { if (open) setM({ ...a.bookMeta, title: a.bookMeta.title || `El libro de ${a.name}` }); }, [open, a]);

  const save = () => {
    if (!m.title.trim()) return;
    if (onSave({ ...m, title: m.title.trim() })) onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={part === "back" ? "Contratapa" : "Tapa del libro"} maxWidth="max-w-xl" testId="libro-meta-modal">
      <Field label="Título del libro (se repite en la contratapa)">
        <TextInput value={m.title} onChange={(e) => setM({ ...m, title: e.target.value })} maxLength={80} data-testid="libro-meta-title" />
      </Field>
      {part !== "back" ? (
        <>
          <Field label="Frase o subtítulo (opcional)">
            <TextInput value={m.subtitle} onChange={(e) => setM({ ...m, subtitle: e.target.value })} maxLength={100} data-testid="libro-meta-subtitle" />
          </Field>
          <Field label="Foto de tapa (independiente de la foto del espacio)">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-md overflow-hidden bg-[#152438] border border-[#d4af37]/40 flex items-center justify-center">
                {m.coverPhoto || a.photoCropped ? <img src={m.coverPhoto || a.photoCropped} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 gold-text" />}
              </div>
              <GhostButton className="py-2" onClick={() => setPhotoOpen(true)} testId="libro-meta-photo">Elegir y recortar</GhostButton>
              {m.coverPhoto && <button className="text-xs text-[#a9bacb] underline" onClick={() => setM({ ...m, coverPhoto: "" })}>Usar la del espacio</button>}
            </div>
          </Field>
        </>
      ) : (
        <>
          <Field label="Reseña, presentación o resumen">
            <TextArea rows={7} value={m.backText} onChange={(e) => setM({ ...m, backText: e.target.value })} maxLength={1500} placeholder="Escribí con tus palabras de qué trata este libro…" data-testid="libro-meta-backtext" />
          </Field>
          <Field label="Frase de cierre (opcional)">
            <TextInput value={m.closing} onChange={(e) => setM({ ...m, closing: e.target.value })} maxLength={120} data-testid="libro-meta-closing" />
          </Field>
        </>
      )}
      <div className="flex justify-end gap-3 mt-2">
        <GhostButton onClick={onClose} testId="libro-meta-cancel">Cancelar</GhostButton>
        <GoldButton onClick={save} testId="libro-meta-save">Guardar</GoldButton>
      </div>
      <PhotoEditor open={photoOpen} onClose={() => setPhotoOpen(false)} initialPhoto={m.coverPhoto || a.photo} aspect={1} title="Foto de la tapa" onSave={(d) => setM((x) => ({ ...x, coverPhoto: d.photoCropped }))} />
    </Modal>
  );
}
