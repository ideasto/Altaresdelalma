import React, { useEffect, useState } from "react";
import { Modal, Field, TextInput, TextArea, GoldButton, GhostButton } from "../common";
import { BookCover, BookBack } from "./BookCovers";
import useDraft from "../../hooks/useDraft";
import DraftNotices from "../DraftNotices";
import PhotoEditor from "../PhotoEditor";
import { Image as ImageIcon } from "lucide-react";

// Edita tapa y contratapa. El título no depende del nombre del espacio.
export default function BookMetaEditor({ open, onClose, a, part, onSave }) {
  const [m, setM] = useState(a.bookMeta);
  const draft = useDraft(`book-meta-${a.id}`, m, open);
  const [photoOpen, setPhotoOpen] = useState(false);
  useEffect(() => { if (open) setM({ ...a.bookMeta, title: a.bookMeta.title || `El libro de ${a.name}` }); }, [open, a]);

  const save = async () => {
    if (!m.title.trim()) return;
    if (await onSave({ ...m, title: m.title.trim() })) { draft.clear(); onClose(); }
  };

  return (
    <Modal open={open} onClose={onClose} title={part === "back" ? "Contratapa" : "Tapa del libro"} maxWidth="max-w-xl" testId="libro-meta-modal">
      <DraftNotices draft={draft} onApply={r => setM(r)} />
      <div className="max-w-md mx-auto">{part === "back" ? <BookBack a={{ ...a, bookMeta: m }} onChange={setM} /> : <BookCover a={{ ...a, bookMeta: m }} onChange={setM} onPhoto={() => setPhotoOpen(true)} />}</div>
      <div className="flex justify-end gap-3 mt-2">
        <GhostButton onClick={onClose} testId="libro-meta-cancel">Cancelar</GhostButton>
        <GoldButton onClick={save} testId="libro-meta-save">Guardar</GoldButton>
      </div>
      <PhotoEditor open={photoOpen} onClose={() => setPhotoOpen(false)} initialPhoto={m.coverPhoto || a.photo} aspect={1} title="Foto de la tapa" onSave={(d) => setM((x) => ({ ...x, coverPhoto: d.photoCropped }))} />
    </Modal>
  );
}
