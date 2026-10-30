import React, { useState } from "react";
import { Modal, GoldButton, GhostButton } from "../common";
import { fmtDate } from "../../lib/format";

const TABS = [
  { key: "gallery", label: "Fotos" },
  { key: "letters", label: "Cartas" },
  { key: "timeline", label: "Momentos" },
];

// Incorpora copias editoriales desde otros módulos (evita repetir lo ya incorporado).
export default function ImportDialog({ open, onClose, a, onImport }) {
  const [tab, setTab] = useState("gallery");
  const [sel, setSel] = useState([]);
  const used = new Set(a.book.map((p) => p.source).filter(Boolean));

  const items = {
    gallery: a.gallery.photos.map((p) => ({ src: `photo:${p.id}`, label: p.caption || "Foto", photo: p.src, page: { title: p.caption || "", text: "", photo: p.src } })),
    letters: a.letters.map((l) => ({ src: `letter:${l.id}`, label: `Para ${l.to} · ${fmtDate(l.date, "short")}`, text: l.body, page: { title: `Para ${l.to}`, text: `${l.body}${l.sign ? `\n\n${l.sign}` : ""}`, photo: "" } })),
    timeline: a.timeline.map((e) => ({ src: `moment:${e.id}`, label: `${e.title}${e.date ? ` · ${fmtDate(e.date, "short")}` : ""}`, photo: e.photo, text: e.description, page: { title: e.title, text: e.description, photo: e.photo } })),
  }[tab];

  const toggle = (s) => setSel((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]));
  const confirm = () => {
    const pick = items.filter((i) => sel.includes(i.src));
    if (onImport(pick.map((i) => ({ ...i.page, source: i.src })))) { setSel([]); onClose(); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Traer recuerdos al libro" maxWidth="max-w-2xl" testId="libro-import-modal">
      <p className="text-sm text-[#a9bacb] mb-4">Se agrega una <b className="text-[#f8fafc]">copia editorial</b> como página nueva. Si después editás la página, el original no cambia (y viceversa).</p>
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setSel([]); }} className={`rounded-full px-4 py-1.5 text-sm border ${tab === t.key ? "border-[#d4af37] gold-text bg-[#d4af37]/10" : "border-[#d4af37]/30 text-[#d5dfea]"}`} data-testid={`libro-import-tab-${t.key}`}>{t.label}</button>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="text-[#d5dfea] py-6">No hay nada guardado en esta sección todavía.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-2 max-h-[45vh] overflow-y-auto fancy-scroll pr-1">
          {items.map((i) => {
            const done = used.has(i.src);
            return (
              <li key={i.src}>
                <label className={`flex items-center gap-3 rounded-xl border px-3 py-2 cursor-pointer ${sel.includes(i.src) ? "border-[#d4af37] bg-[#d4af37]/10" : "border-[#d4af37]/25"} ${done ? "opacity-60" : ""}`} data-testid={`libro-import-item-${i.src}`}>
                  <input type="checkbox" checked={sel.includes(i.src)} onChange={() => toggle(i.src)} className="accent-[#d4af37]" />
                  {i.photo && <img src={i.photo} alt="" className="w-10 h-10 object-cover rounded" />}
                  <span className="min-w-0">
                    <span className="block text-sm text-[#f8fafc] truncate">{i.label}</span>
                    {i.text && <span className="block text-xs text-[#a9bacb] truncate">{i.text}</span>}
                    {done && <span className="block text-[10px] gold-text">Ya está en el libro</span>}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex justify-end gap-3 mt-5">
        <GhostButton onClick={onClose} testId="libro-import-cancel">Cancelar</GhostButton>
        <GoldButton onClick={confirm} disabled={!sel.length} testId="libro-import-confirm">Agregar {sel.length || ""}</GoldButton>
      </div>
    </Modal>
  );
}
