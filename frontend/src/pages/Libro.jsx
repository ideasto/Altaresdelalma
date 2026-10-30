import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/StoreContext";
import { PageHeader, ConfirmDialog, GoldButton, GhostButton, EditPencil, TrashButton } from "../components/common";
import { BookCover, BookBack } from "../components/libro/BookCovers";
import BookMetaEditor from "../components/libro/BookMetaEditor";
import PageEditor from "../components/libro/PageEditor";
import ImportDialog from "../components/libro/ImportDialog";
import { makeSheet, renderPdf } from "../lib/pdf";
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

  const savePage = (draft) => {
    const ok = editing
      ? updateAvatar(id, (a) => ({ book: a.book.map((p) => (p.id === editing.id ? { ...p, ...draft } : p)) }))
      : updateAvatar(id, (a) => ({ book: [...a.book, { id: crypto.randomUUID(), source: "", ...draft }] }));
    if (ok) {
      toast.success(editing ? "Página actualizada." : "Página guardada.");
      if (!editing) { setDir(1); setIndex(pages.length + 1); }
    }
    return ok;
  };

  const move = (pid, d) => {
    const from = pages.findIndex((p) => p.id === pid);
    const to = from + d;
    if (to < 0 || to >= pages.length) return;
    if (updateAvatar(id, (a) => { const b = [...a.book]; [b[from], b[to]] = [b[to], b[from]]; return { book: b }; })) { setDir(d); setIndex(to + 1); }
  };

  const importPages = (list) => {
    const ok = updateAvatar(id, (a) => ({ book: [...a.book, ...list.map((p) => ({ id: crypto.randomUUID(), ...p }))] }));
    if (ok) toast.success(`Se agregaron ${list.length} página(s) al final del libro.`);
    return ok;
  };

  const exportPdf = () => {
    const sheets = [];
    const add = (opts, build) => { const { sheet, content } = makeSheet(opts); build(content); sheets.push(sheet); };
    const cover = avatar.bookMeta.coverPhoto || avatar.photoCropped;
    add({ title: bookTitle(avatar), subtitle: avatar.bookMeta.subtitle }, (c) => {
      if (!cover) return;
      c.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100%"><img src="${cover}" style="max-width:70%;max-height:100%;object-fit:contain;border:4px solid #c9a94a;border-radius:4px"/></div>`;
    });
    pages.forEach((p) => add({ title: p.title || "" }, (c) => {
      const w = document.createElement("div");
      w.style.textAlign = "center";
      if (p.photo) { const im = document.createElement("img"); im.src = p.photo; Object.assign(im.style, { maxWidth: "80%", maxHeight: "420px", objectFit: "contain", marginBottom: "22px", border: "2px solid #d8c9a3" }); w.appendChild(im); }
      if (p.text) { const t = document.createElement("div"); Object.assign(t.style, { fontFamily: "'Caveat',cursive", fontSize: "26px", lineHeight: "1.5", whiteSpace: "pre-wrap" }); t.textContent = p.text; w.appendChild(t); }
      c.appendChild(w);
    }));
    add({ title: bookTitle(avatar) }, (c) => {
      const w = document.createElement("div");
      Object.assign(w.style, { textAlign: "center", fontSize: "20px", lineHeight: "1.6", whiteSpace: "pre-wrap" });
      w.textContent = avatar.bookMeta.backText || "";
      if (avatar.bookMeta.closing) { const cl = document.createElement("div"); Object.assign(cl.style, { fontFamily: "'Caveat',cursive", fontSize: "28px", marginTop: "28px", color: "#8a6d1f" }); cl.textContent = avatar.bookMeta.closing; w.appendChild(cl); }
      const cr = document.createElement("div"); Object.assign(cr.style, { marginTop: "40px", fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase", color: "#9c8a66", fontFamily: "'Plus Jakarta Sans',sans-serif" }); cr.textContent = BRAND.editorialCredit; w.appendChild(cr);
      c.appendChild(w);
    });
    toast.promise(renderPdf(sheets, `libro-${avatar.name}.pdf`), { loading: "Encuadernando el libro…", success: "PDF descargado.", error: "Error al generar el PDF." });
  };

  const label = view === "cover" ? "Tapa" : view === "back" ? "Contratapa" : `Página ${i} de ${pages.length}`;

  return (
    <div className="pb-10">
      <PageHeader title="Libro de Recuerdos" subtitle={bookTitle(avatar)}>
        <GhostButton onClick={exportPdf} testId="libro-pdf"><FileDown className="w-4 h-4" /> PDF</GhostButton>
        <GhostButton onClick={() => setImportOpen(true)} testId="libro-import"><Import className="w-4 h-4" /> Traer recuerdos</GhostButton>
        <GoldButton onClick={() => { setEditing(null); setPageOpen(true); }} testId="libro-add" className="px-5 py-2.5"><Plus className="w-4 h-4" /> Agregar página</GoldButton>
      </PageHeader>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-10">
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <button className="icon-btn shrink-0 disabled:opacity-30" onClick={() => go(-1)} disabled={i === 0} aria-label="Página anterior" data-testid="libro-prev"><ChevronLeft className="w-7 h-7" /></button>
          <div className="relative w-full max-w-md" style={{ perspective: 1800 }}>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={i} initial={{ rotateY: dir > 0 ? 30 : -30, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: dir > 0 ? -30 : 30, opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                {view === "cover" && <BookCover a={avatar} onEdit={() => setMeta("cover")} />}
                {view === "back" && <BookBack a={avatar} onEdit={() => setMeta("back")} />}
                {typeof view === "object" && (
                  <div className="paper-sheet book-depth rounded-r-xl rounded-l-sm aspect-[3/4] p-7 relative overflow-hidden" data-testid={`libro-page-${view.id}`}>
                    <div className="absolute inset-3 rounded-lg border border-[#c9a94a]/40 pointer-events-none" />
                    <div className="h-full overflow-y-auto fancy-scroll flex flex-col items-center text-center pt-2">
                      {view.title && <h3 className="font-heading text-3xl text-[#2b2114] mb-4">{view.title}</h3>}
                      {view.photo && <div className="bg-white p-1.5 shadow mb-4"><img src={view.photo} alt="" className="max-h-56 object-contain" /></div>}
                      {view.text && <p className="font-hand text-[24px] leading-relaxed text-[#2b2114] whitespace-pre-wrap">{view.text}</p>}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <button className="icon-btn shrink-0 disabled:opacity-30" onClick={() => go(1)} disabled={i >= total - 1} aria-label="Página siguiente" data-testid="libro-next"><ChevronRight className="w-7 h-7" /></button>
        </div>

        <div className="flex flex-col items-center gap-3 mt-6">
          <p className="text-[#a9bacb] text-sm" data-testid="libro-position">{label}{pages.length === 0 && " · Todavía no hay páginas interiores."}</p>
          {typeof view === "object" && (
            <div className="flex items-center gap-1 glass rounded-full px-2 py-1" data-testid="libro-page-tools">
              <button className="icon-btn disabled:opacity-30" disabled={i === 1} onClick={() => move(view.id, -1)} title="Mover antes" aria-label="Mover antes" data-testid="libro-move-up"><ArrowUp className="w-4 h-4" /></button>
              <button className="icon-btn disabled:opacity-30" disabled={i === pages.length} onClick={() => move(view.id, 1)} title="Mover después" aria-label="Mover después" data-testid="libro-move-down"><ArrowDown className="w-4 h-4" /></button>
              <EditPencil onClick={() => { setEditing(view); setPageOpen(true); }} testId={`libro-edit-${view.id}`} />
              <TrashButton onClick={() => setDel(view)} testId={`libro-delete-${view.id}`} />
            </div>
          )}
        </div>
      </div>

      <PageEditor open={pageOpen} onClose={() => setPageOpen(false)} editing={editing} spaceId={id} onSave={savePage} />
      <BookMetaEditor open={!!meta} part={meta} onClose={() => setMeta(null)} a={avatar} onSave={(m) => { const ok = updateAvatar(id, { bookMeta: m }); if (ok) toast.success("Libro actualizado."); return ok; }} />
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
