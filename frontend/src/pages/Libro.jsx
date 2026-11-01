import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/StoreContext";
import { PageHeader, ConfirmDialog, GoldButton, GhostButton, EditPencil, TrashButton } from "../components/common";
import { BookCover, BookBack } from "../components/libro/BookCovers";
import BookMetaEditor from "../components/libro/BookMetaEditor";
import PageEditor from "../components/libro/PageEditor";
import ImportDialog from "../components/libro/ImportDialog";
import { bookPdf } from "../lib/pdf/book";
import BookPage from "../components/libro/BookPage";
import { bookTitle } from "../lib/format";
import { BRAND } from "../config/brand";
import { toast } from "sonner";
import { FileDown, Plus, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Import } from "lucide-react";

export default function Libro() {
  const { id } = useParams();
  const { getAvatar, updateAvatar, removeItem } = useStore();
  const avatar = getAvatar(id);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [pageOpen, setPageOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [meta, setMeta] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [del, setDel] = useState(null);

  if (!avatar) return <Link to="/" className="gold-text underline block p-10">Volver</Link>;
  const pages = avatar.book;
  const total = pages.length + 2;
  const i = Math.min(index, total - 1);
  const view = i === 0 ? "cover" : i === total - 1 ? "back" : pages[i - 1];
  const go = (d) => { setDir(d); setIndex(Math.max(0, Math.min(total - 1, i + d))); };

  const savePage = async (draft) => {
    const ok = editing
      ? await updateAvatar(id, (a) => ({ book: a.book.map((p) => (p.id === editing.id ? { ...p, ...draft } : p)) }))
      : await updateAvatar(id, (a) => ({ book: [...a.book, { id: crypto.randomUUID(), source: "", ...draft }] }));
    if (ok) {
      toast.success(editing ? "Página actualizada." : "Página guardada.");
      if (!editing) { setDir(1); setIndex(pages.length + 1); }
    }
    return ok;
  };

  const move = async (pid, d) => {
    const from = pages.findIndex((p) => p.id === pid);
    const to = from + d;
    if (to < 0 || to >= pages.length) return;
    if (await updateAvatar(id, (a) => { const b = [...a.book]; [b[from], b[to]] = [b[to], b[from]]; return { book: b }; })) { setDir(d); setIndex(to + 1); }
  };

  const importPages = async (list) => {
    const ok = await updateAvatar(id, (a) => ({ book: [...a.book, ...list.map((p) => ({ id: crypto.randomUUID(), ...p }))] }));
    if (ok) toast.success(`Se agregaron ${list.length} página(s) al final del libro.`);
    return ok;
  };

  const exportPdf = () => toast.promise(bookPdf(avatar), { loading: "Encuadernando el libro…", success: "PDF descargado.", error: "Error al generar el PDF." });

  const isEditing = pageOpen || !!meta;
  const label = view === "cover" ? "Tapa" : view === "back" ? "Contratapa" : `Página ${i} de ${pages.length}`;

  return (
    <div className="pb-10">
      <PageHeader title="Libro de Recuerdos" subtitle={bookTitle(avatar)}>
        <GhostButton disabled={isEditing} onClick={exportPdf} testId="libro-pdf"><FileDown className="w-4 h-4" /> PDF</GhostButton>
        <GhostButton disabled={isEditing} onClick={() => setImportOpen(true)} testId="libro-import"><Import className="w-4 h-4" /> Traer recuerdos</GhostButton>
        <GoldButton onClick={() => { setEditing(null); setPageOpen(true); }} disabled={isEditing} testId="libro-add" className="px-5 py-2.5"><Plus className="w-4 h-4" /> Agregar página</GoldButton>
      </PageHeader>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-10">
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <button className="icon-btn shrink-0 disabled:opacity-30" style={{ display: isEditing ? "none" : undefined }} onClick={() => go(-1)} disabled={i === 0 || isEditing} aria-label="Página anterior" data-testid="libro-prev"><ChevronLeft className="w-7 h-7" /></button>
          <div className="relative w-full max-w-md" style={{ perspective: 1800 }}>
            <PageEditor inline open={pageOpen} onClose={() => setPageOpen(false)} editing={editing} spaceId={id} onSave={savePage} />
            <BookMetaEditor inline open={!!meta} part={meta} onClose={() => setMeta(null)} a={avatar} onSave={async (m) => { const ok = await updateAvatar(id, { bookMeta: m }); if (ok) toast.success("Libro actualizado."); return ok; }} />
            {!isEditing && <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={i} initial={{ rotateY: dir > 0 ? 30 : -30, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: dir > 0 ? -30 : 30, opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                {view === "cover" && <BookCover a={avatar} onEdit={() => setMeta("cover")} />}
                {view === "back" && <BookBack a={avatar} onEdit={() => setMeta("back")} />}
                {typeof view === "object" && (
                  <div data-testid={`libro-page-${view.id}`}><BookPage page={view} /></div>
                )}
              </motion.div>
            </AnimatePresence>}
          </div>
          <button className="icon-btn shrink-0 disabled:opacity-30" style={{ display: isEditing ? "none" : undefined }} onClick={() => go(1)} disabled={i >= total - 1 || isEditing} aria-label="Página siguiente" data-testid="libro-next"><ChevronRight className="w-7 h-7" /></button>
        </div>

        <div className="flex flex-col items-center gap-3 mt-6">
          <p className="text-[#a9bacb] text-sm" data-testid="libro-position">{label}{pages.length === 0 && " · Todavía no hay páginas interiores."}</p>
          {!isEditing && typeof view === "object" && (
            <div className="flex items-center gap-1 glass rounded-full px-2 py-1" data-testid="libro-page-tools">
              <button className="icon-btn disabled:opacity-30" disabled={i === 1} onClick={() => move(view.id, -1)} title="Mover antes" aria-label="Mover antes" data-testid="libro-move-up"><ArrowUp className="w-4 h-4" /></button>
              <button className="icon-btn disabled:opacity-30" disabled={i === pages.length} onClick={() => move(view.id, 1)} title="Mover después" aria-label="Mover después" data-testid="libro-move-down"><ArrowDown className="w-4 h-4" /></button>
              <EditPencil onClick={() => { setEditing(view); setPageOpen(true); }} testId={`libro-edit-${view.id}`} />
              <TrashButton onClick={() => setDel(view)} testId={`libro-delete-${view.id}`} />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-8"><GoldButton onClick={() => { setEditing(null); setPageOpen(true); }} disabled={isEditing} testId="libro-add-bottom">Agregar página</GoldButton></div>
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} a={avatar} onImport={importPages} />

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={() => { removeItem(id, "book", del.id, "Página eliminada."); setIndex(Math.max(0, i - 1)); setDel(null); }}
        title="¿Eliminar esta página?"
        message="La página se quita del libro. Vas a poder deshacerlo unos segundos."
        testId="libro-delete-confirm"
      />
    </div>
  );
}
