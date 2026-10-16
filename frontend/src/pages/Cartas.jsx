import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { PageHeader, Modal, ConfirmDialog, GoldButton, GhostButton, EditPencil, TrashButton, Field, TextInput, TextArea } from "../components/common";
import { makeSheet, renderPdf } from "../lib/pdf";
import { toast } from "sonner";
import { Mail, FileDown, Plus } from "lucide-react";

const MAX = 100;
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d) => {
  if (!d) return "";
  try { return new Date(d + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return d; }
};

function LetterSheet({ letter, avatarName }) {
  return (
    <div className="paper-sheet rounded-2xl p-7 sm:p-10 relative" style={{ minHeight: 320 }}>
      <div className="absolute inset-3 rounded-xl border border-[#c9a94a]/40 pointer-events-none" />
      <p className="text-right font-ui text-sm text-[#6b5a3e] mb-5">{fmt(letter.date)}</p>
      <p className="font-heading text-3xl text-center text-[#2b2114] mb-5">Para {letter.to || avatarName}</p>
      <p className="font-hand text-[26px] leading-relaxed text-[#2b2114] whitespace-pre-wrap">{letter.body}</p>
      {letter.sign && <p className="font-hand text-[26px] text-right text-[#2b2114] mt-6">{letter.sign}</p>}
    </div>
  );
}

export default function Cartas() {
  const { id } = useParams();
  const { getAvatar, updateAvatar } = useStore();
  const avatar = getAvatar(id);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ date: today(), to: "", body: "", sign: "" });
  const [del, setDel] = useState(null);

  if (!avatar) return <Link to="/" className="gold-text underline block p-10">Volver</Link>;
  const letters = avatar.letters;

  const openCreate = () => {
    if (letters.length >= MAX) return toast.error(`Llegaste al máximo de ${MAX} cartas.`);
    setEditing(null);
    setDraft({ date: today(), to: avatar.name, body: "", sign: "" });
    setFormOpen(true);
  };
  const openEdit = (l) => { setEditing(l); setDraft({ date: l.date, to: l.to, body: l.body, sign: l.sign }); setFormOpen(true); };

  const save = () => {
    if (!draft.body.trim()) return toast.error("Escribí el cuerpo de la carta.");
    if (editing) {
      updateAvatar(id, (a) => ({ letters: a.letters.map((l) => (l.id === editing.id ? { ...l, ...draft } : l)) }));
      toast.success("Carta actualizada.");
    } else {
      updateAvatar(id, (a) => ({ letters: [{ id: crypto.randomUUID(), ...draft }, ...a.letters] }));
      toast.success("Carta guardada.");
    }
    setFormOpen(false);
  };

  const buildLetterSheet = (l) => {
    const { sheet, content } = makeSheet({});
    const el = document.createElement("div");
    el.style.height = "100%";
    el.innerHTML = `
      <div style="text-align:right;font-size:15px;color:#6b5a3e;font-family:'Plus Jakarta Sans',sans-serif;margin-bottom:24px;">${fmt(l.date)}</div>
      <div style="text-align:center;font-size:34px;color:#2b2114;margin-bottom:22px;">Para ${escapeHtml(l.to || avatar.name)}</div>
      <div style="font-family:'Caveat',cursive;font-size:30px;line-height:1.5;color:#2b2114;white-space:pre-wrap;">${escapeHtml(l.body)}</div>
      ${l.sign ? `<div style="font-family:'Caveat',cursive;font-size:30px;text-align:right;color:#2b2114;margin-top:28px;">${escapeHtml(l.sign)}</div>` : ""}`;
    content.appendChild(el);
    return sheet;
  };

  const exportOne = (l) =>
    toast.promise(renderPdf([buildLetterSheet(l)], `carta-${avatar.name}.pdf`), {
      loading: "Generando carta…", success: "PDF descargado.", error: "Error al generar el PDF.",
    });

  const exportAll = () => {
    if (letters.length === 0) return toast.error("No hay cartas para exportar.");
    toast.promise(renderPdf(letters.map(buildLetterSheet), `cartas-${avatar.name}.pdf`), {
      loading: "Generando todas las cartas…", success: "PDF descargado.", error: "Error al generar el PDF.",
    });
  };

  return (
    <div className="pb-10">
      <PageHeader title="Cartas" subtitle={avatar.name}>
        <GhostButton onClick={exportAll} testId="cartas-pdf-all"><FileDown className="w-4 h-4" /> PDF (todas)</GhostButton>
        <GoldButton onClick={openCreate} testId="cartas-add" className="px-5 py-2.5"><Plus className="w-4 h-4" /> Nueva carta</GoldButton>
      </PageHeader>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-8">
        <p className="text-center text-[#94a3b8] mb-8 font-hand text-2xl">
          Escribile lo que no alcanzaste a decir. {letters.length}/{MAX}
        </p>

        {letters.length === 0 ? (
          <div className="glass rounded-3xl py-16 text-center">
            <span className="gold-text float-soft inline-block mb-4"><Mail className="w-14 h-14" strokeWidth={1} /></span>
            <p className="text-[#cbd5e1] mb-5">Aún no escribiste ninguna carta.</p>
            <GoldButton onClick={openCreate} testId="cartas-add-empty"><Plus className="w-4 h-4" /> Escribir la primera</GoldButton>
          </div>
        ) : (
          <div className="space-y-8">
            {letters.map((l) => (
              <div key={l.id} className="relative group" data-testid={`carta-${l.id}`}>
                <LetterSheet letter={l} avatarName={avatar.name} />
                <div className="absolute top-4 right-4 flex gap-1 bg-[#fffdf8]/80 rounded-full p-0.5">
                  <button className="icon-btn" style={{ color: "#b8922c" }} onClick={() => exportOne(l)} data-testid={`carta-pdf-${l.id}`} title="Descargar PDF">
                    <FileDown className="w-4 h-4" />
                  </button>
                  <EditPencil onClick={() => openEdit(l)} testId={`carta-edit-${l.id}`} />
                  <TrashButton onClick={() => setDel(l)} testId={`carta-delete-${l.id}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar carta" : "Nueva carta"} maxWidth="max-w-xl" testId="cartas-form-modal">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha"><TextInput type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} data-testid="carta-date-input" /></Field>
          <Field label="Para"><TextInput value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} data-testid="carta-to-input" /></Field>
        </div>
        <Field label="Tu carta">
          <TextArea rows={7} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Querido/a…" className="font-hand text-2xl leading-relaxed" data-testid="carta-body-input" />
        </Field>
        <Field label="Firma"><TextInput value={draft.sign} onChange={(e) => setDraft({ ...draft, sign: e.target.value })} placeholder="Ej: Tu hija que te ama" className="font-hand text-xl" data-testid="carta-sign-input" /></Field>
        <div className="flex justify-end gap-3">
          <GhostButton onClick={() => setFormOpen(false)} testId="carta-form-cancel">Cancelar</GhostButton>
          <GoldButton onClick={save} testId="carta-form-save">{editing ? "Guardar" : "Guardar carta"}</GoldButton>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={() => { updateAvatar(id, (a) => ({ letters: a.letters.filter((l) => l.id !== del.id) })); toast.success("Carta eliminada."); setDel(null); }}
        title="¿Eliminar esta carta?"
        message="La carta se borrará de este espacio."
        testId="carta-delete-confirm"
      />
    </div>
  );
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
