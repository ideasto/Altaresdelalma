import React, { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import PhotoEditor from "../components/PhotoEditor";
import { PageHeader, Modal, ConfirmDialog, GoldButton, GhostButton, EditPencil, TrashButton, Field, TextInput, TextArea } from "../components/common";
import { makeSheet, renderPdf } from "../lib/pdf";
import { shrinkDataUrl, fileToDataUrl } from "../lib/image";
import { toast } from "sonner";
import { fmtDate, sortMoments } from "../lib/format";
import {
  Clock, FileDown, Plus, Home, Heart, Star, Plane, Cake, Music, Camera, Sun, Moon, MapPin, Gift, PawPrint, GraduationCap, Baby, Image as ImageIcon,
} from "lucide-react";

const ICONS = { star: Star, heart: Heart, home: Home, plane: Plane, cake: Cake, music: Music, camera: Camera, sun: Sun, moon: Moon, pin: MapPin, gift: Gift, paw: PawPrint, grad: GraduationCap, baby: Baby };
const ICON_KEYS = Object.keys(ICONS);

const fmt = (d) => fmtDate(d, "short");

export default function Timeline() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { getAvatar, updateAvatar, removeItem } = useStore();
  const avatar = getAvatar(id);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ date: "", icon: "star", title: "", description: "", photo: "" });
  const [del, setDel] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [headerImg, setHeaderImg] = useState("");
  const [headerEdit, setHeaderEdit] = useState(false);

  const openCreate = () => { setEditing(null); setDraft({ date: "", icon: "star", title: "", description: "", photo: "" }); setFormOpen(true); };
  useEffect(() => { if (params.get("nueva") === "1") openCreate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!avatar) return <Link to="/" className="gold-text underline block p-10">Volver</Link>;
  const events = sortMoments(avatar.timeline);
  const openEdit = (e) => { setEditing(e); setDraft({ date: e.date, icon: e.icon, title: e.title, description: e.description, photo: e.photo || "" }); setFormOpen(true); };

  const save = () => {
    if (!draft.title.trim()) return toast.error("Poné un título al momento.");
    const ok = editing
      ? updateAvatar(id, (a) => ({ timeline: a.timeline.map((e) => (e.id === editing.id ? { ...e, ...draft } : e)) }))
      : updateAvatar(id, (a) => ({ timeline: [...a.timeline, { id: crypto.randomUUID(), ...draft }] }));
    if (ok) { toast.success(editing ? "Momento actualizado." : "Momento agregado."); setFormOpen(false); }
  };

  const handleEventPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const d = await fileToDataUrl(file);
    const s = await shrinkDataUrl(d, 1600, 0.88);
    setDraft((prev) => ({ ...prev, photo: s }));
  };

  const openExport = () => {
    if (events.length === 0) return toast.error("No hay momentos para exportar.");
    setHeaderImg(avatar.photoCropped || "");
    setExportOpen(true);
  };

  const generatePdf = () => {
    const { sheet, content } = makeSheet({ title: "Línea de Tiempo", subtitle: avatar.name });
    const wrap = document.createElement("div");
    if (headerImg) {
      const h = document.createElement("div");
      Object.assign(h.style, { display: "flex", justifyContent: "center", marginBottom: "22px" });
      const circle = document.createElement("div");
      Object.assign(circle.style, { width: "120px", height: "120px", borderRadius: "9999px", overflow: "hidden", border: "2px solid #c9a94a" });
      const img = document.createElement("img");
      img.src = headerImg; img.crossOrigin = "anonymous";
      Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover" });
      circle.appendChild(img); h.appendChild(circle); wrap.appendChild(h);
    }
    events.forEach((e, i) => {
      const row = document.createElement("div");
      Object.assign(row.style, { display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid #e3d9c0" });
      row.innerHTML = `
        <div style="width:34px;height:34px;border-radius:9999px;background:#d4af37;color:#2b2114;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;flex-shrink:0;">${i + 1}</div>
        <div style="flex:1;">
          <div style="font-size:14px;color:#9c8a66;font-family:'Plus Jakarta Sans',sans-serif;letter-spacing:1px;">${escapeHtml(fmt(e.date)) || "—"}</div>
          <div style="font-size:24px;color:#2b2114;font-weight:600;">${escapeHtml(e.title)}</div>
          ${e.description ? `<div style="font-size:16px;color:#5a4a32;font-style:italic;">${escapeHtml(e.description)}</div>` : ""}
        </div>`;
      wrap.appendChild(row);
    });
    content.appendChild(wrap);
    setExportOpen(false);
    toast.promise(renderPdf([sheet], `linea-de-tiempo-${avatar.name}.pdf`), {
      loading: "Generando línea de tiempo…", success: "PDF descargado.", error: "Error al generar el PDF.",
    });
  };

  return (
    <div className="pb-10">
      <PageHeader title="Línea de Tiempo" subtitle={avatar.name}>
        <GhostButton onClick={openExport} testId="timeline-pdf"><FileDown className="w-4 h-4" /> PDF</GhostButton>
        <GoldButton onClick={openCreate} testId="timeline-add" className="px-5 py-2.5"><Plus className="w-4 h-4" /> Nuevo momento</GoldButton>
      </PageHeader>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-10">
        {events.length === 0 ? (
          <div className="glass rounded-3xl py-20 text-center">
            <span className="gold-text inline-block mb-4"><Clock className="w-16 h-16" strokeWidth={1} /></span>
            <p className="text-[#cbd5e1] mb-5">Su historia, momento a momento, como vos quieras contarla.</p>
            <GoldButton onClick={openCreate} testId="timeline-add-empty"><Plus className="w-4 h-4" /> Agregar un momento</GoldButton>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-2 bottom-2 w-[2px] timeline-line left-5 md:left-1/2 md:-translate-x-1/2" />
            {events.map((e, i) => {
              const Icon = ICONS[e.icon] || Star;
              const left = i % 2 === 0;
              return (
                <div key={e.id} className="relative mb-10 md:grid md:grid-cols-2 md:gap-12" data-testid={`timeline-event-${e.id}`}>
                  <span
                    className="absolute left-5 md:left-1/2 -translate-x-1/2 z-10 rounded-full p-2 bg-[#152438] border border-[#d4af37] gold-text shadow-[0_0_16px_rgba(212,175,55,0.5)]"
                    style={{ top: 4 }}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className={`ml-16 md:ml-0 glass rounded-2xl p-5 pt-10 relative ${left ? "md:col-start-1 md:text-right" : "md:col-start-2"}`}>
                    <div className={`absolute top-3 ${left ? "left-3 md:left-auto md:right-3" : "right-3"} flex gap-1`}>
                      <EditPencil onClick={() => openEdit(e)} testId={`timeline-edit-${e.id}`} />
                      <TrashButton onClick={() => setDel(e)} testId={`timeline-delete-${e.id}`} />
                    </div>
                    <p className="gold-text text-xs tracking-[0.2em] uppercase mb-1">{fmt(e.date) || "Sin fecha"}</p>
                    <h3 className="font-heading text-2xl text-[#f8fafc]">{e.title}</h3>
                    {e.description && <p className="text-[#cbd5e1] text-sm mt-1 leading-relaxed">{e.description}</p>}
                    {e.photo && (
                      <img src={e.photo} alt={e.title} className={`mt-3 rounded-xl max-h-48 w-full object-cover ${left ? "md:ml-auto" : ""}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* form */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar momento" : "Nuevo momento"} maxWidth="max-w-xl" testId="timeline-form-modal">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha"><TextInput type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} data-testid="timeline-date-input" /></Field>
          <Field label="Título"><TextInput value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ej: Su casamiento" data-testid="timeline-title-input" /></Field>
        </div>
        <Field label="Ícono representativo">
          <div className="grid grid-cols-7 gap-2">
            {ICON_KEYS.map((k) => {
              const I = ICONS[k];
              return (
                <button key={k} onClick={() => setDraft({ ...draft, icon: k })} data-testid={`timeline-icon-${k}`}
                  className={`rounded-xl p-2.5 flex items-center justify-center border transition-all ${draft.icon === k ? "border-[#d4af37] bg-[#d4af37]/15 gold-text" : "border-[#d4af37]/20 text-[#a9bacb] hover:border-[#d4af37]/50"}`}>
                  <I className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Descripción"><TextArea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} data-testid="timeline-desc-input" /></Field>
        <Field label="Foto (opcional)">
          {draft.photo ? (
            <div className="relative inline-block">
              <img src={draft.photo} alt="" className="h-28 rounded-xl object-cover" />
              <button className="icon-btn danger absolute -top-2 -right-2 bg-[#152438]" onClick={() => setDraft({ ...draft, photo: "" })}><Plus className="w-4 h-4 rotate-45" /></button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 ghost-gold rounded-full px-4 py-2 text-sm cursor-pointer">
              <ImageIcon className="w-4 h-4" /> Subir foto
              <input type="file" accept="image/*" className="hidden" onChange={handleEventPhoto} data-testid="timeline-photo-input" />
            </label>
          )}
        </Field>
        <div className="flex justify-end gap-3 mt-2">
          <GhostButton onClick={() => setFormOpen(false)} testId="timeline-form-cancel">Cancelar</GhostButton>
          <GoldButton onClick={save} testId="timeline-form-save">{editing ? "Guardar" : "Añadir"}</GoldButton>
        </div>
      </Modal>

      {/* export preview */}
      <Modal open={exportOpen} onClose={() => setExportOpen(false)} title="Exportar línea de tiempo" testId="timeline-export-modal">
        <p className="text-[#cbd5e1] text-sm mb-4">Elegí la imagen que irá en la cabecera del PDF.</p>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full overflow-hidden flex items-center justify-center bg-[#152438]" style={{ width: 130, height: 130, border: "2px solid rgba(212,175,55,0.7)" }}>
            {headerImg ? <img src={headerImg} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 gold-text opacity-50" />}
          </div>
          <GhostButton onClick={() => setHeaderEdit(true)} testId="timeline-header-change">Cambiar imagen de cabecera</GhostButton>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <GhostButton onClick={() => setExportOpen(false)} testId="timeline-export-cancel">Cancelar</GhostButton>
          <GoldButton onClick={generatePdf} testId="timeline-export-generate"><FileDown className="w-4 h-4" /> Descargar PDF</GoldButton>
        </div>
      </Modal>

      <PhotoEditor open={headerEdit} onClose={() => setHeaderEdit(false)} initialPhoto={headerImg} round title="Imagen de cabecera" onSave={(d) => setHeaderImg(d.photoCropped)} />

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={() => { removeItem(id, "timeline", del.id, "Momento eliminado."); setDel(null); }}
        title="¿Eliminar este momento?"
        message="Se quita de la línea de tiempo. Vas a poder deshacerlo unos segundos."
        testId="timeline-delete-confirm"
      />
    </div>
  );
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
