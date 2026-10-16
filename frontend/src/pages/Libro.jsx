import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/StoreContext";
import PhotoEditor from "../components/PhotoEditor";
import { CatSeal } from "../components/Logo";
import { PageHeader, Modal, ConfirmDialog, GoldButton, GhostButton, EditPencil, TrashButton, Field, TextInput, TextArea } from "../components/common";
import { makeSheet, renderPdf } from "../lib/pdf";
import { fileToDataUrl, shrinkDataUrl } from "../lib/image";
import { toast } from "sonner";
import { FileDown, Plus, ChevronLeft, ChevronRight, Image as ImageIcon, Pencil } from "lucide-react";

export default function Libro() {
  const { id } = useParams();
  const { getAvatar, updateAvatar } = useStore();
  const avatar = getAvatar(id);

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ title: "", text: "", photo: "" });
  const [del, setDel] = useState(null);
  const [coverEdit, setCoverEdit] = useState(false);

  if (!avatar) return <Link to="/" className="gold-text underline block p-10">Volver</Link>;
  const pages = avatar.book;
  const cover = avatar.bookCoverPhoto || avatar.photoCropped || "";
  const views = ["cover", ...pages.map((p) => p.id), "back"];
  const total = views.length;
  const view = views[Math.min(index, total - 1)];

  const go = (d) => { setDir(d); setIndex((i) => Math.max(0, Math.min(total - 1, i + d))); };

  const openCreate = () => { setEditing(null); setDraft({ title: "", text: "", photo: "" }); setFormOpen(true); };
  const openEdit = (p) => { setEditing(p); setDraft({ title: p.title, text: p.text, photo: p.photo || "" }); setFormOpen(true); };

  const save = () => {
    if (!draft.title.trim() && !draft.text.trim() && !draft.photo) return toast.error("Agregá un título, un texto o una foto.");
    if (editing) {
      updateAvatar(id, (a) => ({ book: a.book.map((p) => (p.id === editing.id ? { ...p, ...draft } : p)) }));
      toast.success("Página actualizada.");
    } else {
      const np = { id: crypto.randomUUID(), ...draft };
      const newIndex = pages.length + 1; // cover(0) + existing pages -> new page sits at end
      updateAvatar(id, (a) => ({ book: [...a.book, np] }));
      toast.success("Página guardada.");
      setDir(1);
      setIndex(newIndex); // go to the end (the new page)
    }
    setFormOpen(false);
  };

  const handlePagePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const d = await fileToDataUrl(file);
    const s = await shrinkDataUrl(d, 1100, 0.82);
    setDraft((prev) => ({ ...prev, photo: s }));
  };

  const exportPdf = () => {
    const sheets = [];
    // cover
    {
      const { sheet, content } = makeSheet({ title: avatar.name, subtitle: "Libro de Recuerdos" });
      if (cover) {
        const box = document.createElement("div");
        Object.assign(box.style, { display: "flex", justifyContent: "center", alignItems: "center", height: "100%" });
        const img = document.createElement("img");
        img.src = cover; img.crossOrigin = "anonymous";
        Object.assign(img.style, { maxWidth: "70%", maxHeight: "100%", objectFit: "contain", border: "4px solid #c9a94a", borderRadius: "6px" });
        box.appendChild(img); content.appendChild(box);
      }
      sheets.push(sheet);
    }
    pages.forEach((p) => {
      const { sheet, content } = makeSheet({ title: p.title || "" });
      const wrap = document.createElement("div");
      wrap.style.textAlign = "center";
      if (p.photo) {
        const img = document.createElement("img");
        img.src = p.photo; img.crossOrigin = "anonymous";
        Object.assign(img.style, { maxWidth: "80%", maxHeight: "420px", objectFit: "contain", borderRadius: "6px", marginBottom: "22px", border: "2px solid #d8c9a3" });
        wrap.appendChild(img);
      }
      if (p.text) {
        const t = document.createElement("div");
        Object.assign(t.style, { fontFamily: "'Caveat',cursive", fontSize: "30px", lineHeight: "1.5", color: "#2b2114", whiteSpace: "pre-wrap", textAlign: "center" });
        t.textContent = p.text;
        wrap.appendChild(t);
      }
      content.appendChild(wrap);
      sheets.push(sheet);
    });
    // back cover with seal
    {
      const { sheet, content } = makeSheet({});
      const wrap = document.createElement("div");
      Object.assign(wrap.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "24px" });
      const seal = document.createElement("div");
      Object.assign(seal.style, {
        width: "130px", height: "130px", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(circle at 35% 30%, #f4e4b0, #d4af37 60%, #a67c20)", color: "#5a4410", boxShadow: "inset 0 0 18px rgba(90,68,16,0.3)",
      });
      seal.innerHTML = `<svg width="60" height="72" viewBox="0 0 100 120" fill="none" stroke="#5a4410" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M31 50 L35 16 L52 40"/><path d="M69 50 L65 16 L48 40"/><path d="M31 50 L35 72 L50 82 L65 72 L69 50"/><path d="M50 44 L54 50 L50 56 L46 50 Z"/><path d="M38 74 L29 112 L50 119 L71 112 L62 74"/><path d="M71 112 C93 110 91 84 76 88"/></svg>`;
      wrap.appendChild(seal);
      const txt = document.createElement("div");
      txt.innerHTML = `<div style="font-size:28px;color:#b8922c;letter-spacing:2px;">La Gata y la Magia</div><div style="font-size:14px;letter-spacing:4px;text-transform:uppercase;color:#9c8a66;font-family:'Plus Jakarta Sans',sans-serif;margin-top:4px;">Con amor eterno</div>`;
      txt.style.textAlign = "center";
      wrap.appendChild(txt);
      content.appendChild(wrap);
      sheets.push(sheet);
    }
    toast.promise(renderPdf(sheets, `libro-${avatar.name}.pdf`), {
      loading: "Encuadernando el libro…", success: "PDF descargado.", error: "Error al generar el PDF.",
    });
  };

  const curPage = typeof view === "string" && view !== "cover" && view !== "back" ? pages.find((p) => p.id === view) : null;

  return (
    <div className="pb-10">
      <PageHeader title="Libro de Recuerdos" subtitle={avatar.name}>
        <GhostButton onClick={exportPdf} testId="libro-pdf"><FileDown className="w-4 h-4" /> PDF</GhostButton>
        <GoldButton onClick={openCreate} testId="libro-add" className="px-5 py-2.5"><Plus className="w-4 h-4" /> Nueva página</GoldButton>
      </PageHeader>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-10">
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <button className="icon-btn shrink-0 disabled:opacity-30" onClick={() => go(-1)} disabled={index === 0} data-testid="libro-prev"><ChevronLeft className="w-7 h-7" /></button>

          <div className="relative w-full max-w-md" style={{ perspective: 1800 }}>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={index}
                custom={dir}
                initial={{ rotateY: dir > 0 ? 35 : -35, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: dir > 0 ? -35 : 35, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative"
                style={{ transformStyle: "preserve-3d" }}
              >
                {view === "cover" && (
                  <div className="paper-sheet book-depth rounded-r-xl rounded-l-sm aspect-[3/4] flex flex-col items-center justify-center p-8 relative" style={{ background: "linear-gradient(145deg,#15325c,#0b1a2f)" }} data-testid="libro-cover">
                    <div className="absolute inset-4 rounded-lg border-2 border-[#d4af37]/50" />
                    <div className="relative">
                      <div className="rounded-lg overflow-hidden bg-[#0b1a2f] flex items-center justify-center" style={{ width: 160, height: 160, border: "3px solid #d4af37", boxShadow: "0 0 24px rgba(212,175,55,0.4)" }}>
                        {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 gold-text opacity-50" />}
                      </div>
                      <button className="absolute -bottom-2 -right-2 icon-btn bg-[#0b1a2f] border border-[#d4af37]/60" onClick={() => setCoverEdit(true)} data-testid="libro-cover-edit" title="Cambiar foto de tapa"><Pencil className="w-4 h-4" /></button>
                    </div>
                    <h2 className="font-heading text-4xl gold-gradient-text mt-7 text-center">{avatar.name}</h2>
                    <p className="font-ui text-xs tracking-[0.3em] uppercase text-[#94a3b8] mt-2">Libro de Recuerdos</p>
                  </div>
                )}

                {view === "back" && (
                  <div className="paper-sheet book-depth rounded-r-xl rounded-l-sm aspect-[3/4] flex flex-col items-center justify-center p-8 gap-6" style={{ background: "linear-gradient(145deg,#15325c,#0b1a2f)" }} data-testid="libro-back">
                    <CatSeal size={130} />
                    <div className="text-center">
                      <div className="font-heading text-3xl gold-gradient-text">La Gata y la Magia</div>
                      <div className="font-ui text-xs tracking-[0.3em] uppercase text-[#94a3b8] mt-2">Con amor eterno</div>
                    </div>
                  </div>
                )}

                {curPage && (
                  <div className="paper-sheet book-depth rounded-r-xl rounded-l-sm aspect-[3/4] p-7 relative overflow-hidden" data-testid={`libro-page-${curPage.id}`}>
                    <div className="absolute inset-3 rounded-lg border border-[#c9a94a]/40 pointer-events-none" />
                    <div className="absolute top-3 right-3 flex gap-1 z-10">
                      <EditPencil onClick={() => openEdit(curPage)} testId={`libro-edit-${curPage.id}`} />
                      <TrashButton onClick={() => setDel(curPage)} testId={`libro-delete-${curPage.id}`} />
                    </div>
                    <div className="h-full overflow-y-auto fancy-scroll flex flex-col items-center text-center pt-4">
                      {curPage.title && <h3 className="font-heading text-3xl text-[#2b2114] mb-4">{curPage.title}</h3>}
                      {curPage.photo && <img src={curPage.photo} alt="" className="rounded-lg max-h-56 object-contain mb-4 border-2 border-[#d8c9a3]" />}
                      {curPage.text && <p className="font-hand text-[26px] leading-relaxed text-[#2b2114] whitespace-pre-wrap">{curPage.text}</p>}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <button className="icon-btn shrink-0 disabled:opacity-30" onClick={() => go(1)} disabled={index >= total - 1} data-testid="libro-next"><ChevronRight className="w-7 h-7" /></button>
        </div>

        <p className="text-center text-[#94a3b8] text-sm mt-6">
          {view === "cover" ? "Tapa" : view === "back" ? "Contratapa" : `Página ${index} de ${pages.length}`}
          {pages.length === 0 && " · El libro está vacío, creá tu primera página."}
        </p>
      </div>

      {/* page form */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar página" : "Nueva página"} maxWidth="max-w-xl" testId="libro-form-modal">
        <Field label="Título (opcional)"><TextInput value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} data-testid="libro-title-input" /></Field>
        <Field label="Foto (opcional)">
          {draft.photo ? (
            <div className="relative inline-block">
              <img src={draft.photo} alt="" className="h-28 rounded-xl object-cover" />
              <button className="icon-btn danger absolute -top-2 -right-2 bg-[#0b1a2f]" onClick={() => setDraft({ ...draft, photo: "" })}><Plus className="w-4 h-4 rotate-45" /></button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 ghost-gold rounded-full px-4 py-2 text-sm cursor-pointer">
              <ImageIcon className="w-4 h-4" /> Subir foto
              <input type="file" accept="image/*" className="hidden" onChange={handlePagePhoto} data-testid="libro-photo-input" />
            </label>
          )}
        </Field>
        <Field label="Recuerdo"><TextArea rows={5} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} className="font-hand text-2xl leading-relaxed" placeholder="Aquel día…" data-testid="libro-text-input" /></Field>
        <div className="flex justify-end gap-3">
          <GhostButton onClick={() => setFormOpen(false)} testId="libro-form-cancel">Cancelar</GhostButton>
          <GoldButton onClick={save} testId="libro-form-save">{editing ? "Guardar" : "Guardar página"}</GoldButton>
        </div>
      </Modal>

      <PhotoEditor open={coverEdit} onClose={() => setCoverEdit(false)} initialPhoto={avatar.bookCoverPhoto || avatar.photo || ""} aspect={1} title="Foto de la tapa" onSave={(d) => updateAvatar(id, { bookCoverPhoto: d.photoCropped })} />

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={() => { updateAvatar(id, (a) => ({ book: a.book.filter((p) => p.id !== del.id) })); toast.success("Página eliminada."); setIndex(0); setDel(null); }}
        title="¿Eliminar esta página?"
        message="La página se quitará del libro."
        testId="libro-delete-confirm"
      />
    </div>
  );
}
