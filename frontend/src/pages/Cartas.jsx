import ShareDialog from "../components/ShareDialog";
import React, { useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { PageHeader, Modal, ConfirmDialog, GoldButton, GhostButton } from "../components/common";
import LetterEditor, { letterText } from "../components/cartas/LetterEditor";
import { lettersPdf } from "../lib/pdf/letters";
import { copyText, downloadText } from "../lib/drafts";
import { fmtDate, plural } from "../lib/format";
import { LIMITS } from "../config/brand";
import { toast } from "sonner";
import { FileDown, Plus, Copy, Share2, Pencil, Trash2, FileText } from "lucide-react";

function LetterPreview({ letter, onOpen }) {
  return (
    <button onClick={onOpen} className="paper-sheet selectable rounded-xl text-left w-full min-w-0 p-5" data-testid={`carta-${letter.id}`}>
      <div className="flex flex-wrap justify-between gap-x-3 text-xs text-[var(--paper-muted)]"><span>Para {letter.to}</span><span>{fmtDate(letter.date, "short")}</span></div>
      <p className="font-hand text-[22px] ruled-letter ruled-letter--preview text-[var(--paper-ink)] mt-2 line-clamp-3 whitespace-pre-line">{letter.body}</p>
      {letter.sign && <p className="font-hand text-lg text-right text-[var(--paper-muted)] mt-1 truncate">{letter.sign}</p>}
    </button>
  );
}

export default function Cartas() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { getAvatar, updateAvatar, removeItem } = useStore();
  const avatar = getAvatar(id);
  const [editorOpen, setEditorOpen] = useState(params.get("nueva") === "1");
  const [editing, setEditing] = useState(null);
  const [reading, setReading] = useState(null);
  const [del, setDel] = useState(null);
  const [shareItems, setShareItems] = useState(null);

  if (!avatar) return <Link to="/" className="gold-text underline block p-10">Volver</Link>;
  const letters = avatar.letters;

  const openCreate = () => {
    if (letters.length >= LIMITS.letters) return toast.error(`Llegaste al máximo de ${LIMITS.letters} cartas en este espacio.`);
    setEditing(null);
    setEditorOpen(true);
  };

  const save = async (draft) => {
    const ok = editing
      ? await updateAvatar(id, (a) => ({ letters: a.letters.map((l) => (l.id === editing.id ? { ...l, ...draft } : l)) }))
      : await updateAvatar(id, (a) => ({ letters: [{ id: crypto.randomUUID(), ...draft }, ...a.letters] }));
    if (ok) { toast.success(editing ? "Carta actualizada." : "Carta guardada."); if (editing) setReading({ ...editing, ...draft }); }
    return ok;
  };

  const pdf = (list, name) => toast.promise(lettersPdf(list, name), { loading: "Generando PDF…", success: "PDF descargado.", error: "Error al generar el PDF." });


  return (
    <div className="pb-10">
      <PageHeader title="Cartas" subtitle={avatar.name}>
        <GhostButton onClick={() => (letters.length ? pdf(letters, `cartas-${avatar.name}.pdf`) : toast.error("No hay cartas para exportar."))} testId="cartas-pdf-all"><FileDown className="w-4 h-4" /> PDF de todas</GhostButton>
        <GoldButton onClick={openCreate} testId="cartas-add" className="px-5 py-2.5"><Plus className="w-4 h-4" /> Nueva carta</GoldButton>
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
        <p className="text-[#d5dfea] mb-8 font-hand text-2xl">Algo que hoy quieras contarle, recordar o dejar escrito. Podés parar y volver cuando quieras.</p>
        {letters.length === 0 ? (
          <div className="glass rounded-3xl py-16 text-center">
            <div className="paper-sheet w-56 h-32 rounded-xl mx-auto mb-6 p-5" aria-hidden="true"><div className="ruled-letter h-full" /></div>
            <p className="text-[#d5dfea] mb-5">Todavía no escribiste ninguna carta.</p>
            <GoldButton onClick={openCreate} testId="cartas-add-empty"><Plus className="w-4 h-4" /> Escribir la primera</GoldButton>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#a9bacb] mb-4" data-testid="cartas-count">{plural(letters.length, "carta", "cartas")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {letters.map((l) => <LetterPreview key={l.id} letter={l} onOpen={() => setReading(l)} />)}
            </div>
          </>
        )}
      </div>

      <Modal open={!!reading && !editorOpen} onClose={() => setReading(null)} title="" surface="paper" maxWidth="max-w-2xl" testId="carta-reader">
        {reading && (
          <>
            <div className="paper-sheet rounded-2xl p-6 sm:p-9 select-text" data-testid="carta-reader-sheet">
              <p className="text-right text-sm text-[var(--paper-muted)] mb-4">{fmtDate(reading.date)}</p>
              <p className="font-heading text-3xl text-center text-[var(--paper-ink)] mb-5">Para {reading.to}</p>
              <p className="font-hand text-[26px] ruled-letter text-[var(--paper-ink)] whitespace-pre-wrap">{reading.body}</p>
              {reading.sign && <p className="font-hand text-[26px] text-right text-[var(--paper-ink)] mt-6">{reading.sign}</p>}
            </div>
            <div className="flex flex-wrap gap-2 mt-5 justify-end">
              <GhostButton className="py-2" onClick={async () => toast.success((await copyText(letterText(reading))) ? "Texto copiado." : "No se pudo copiar.")} testId="carta-copy"><Copy className="w-4 h-4" /> Copiar</GhostButton>
              <GhostButton className="py-2" onClick={() => downloadText(letterText(reading), "carta")} testId="carta-txt"><FileText className="w-4 h-4" /> Texto</GhostButton>
              <GhostButton className="py-2" onClick={() => pdf([reading], `carta-${avatar.name}.pdf`)} testId={`carta-pdf-${reading.id}`}><FileDown className="w-4 h-4" /> PDF</GhostButton>
              <GhostButton className="py-2" onClick={() => setShareItems([{ title: `Para ${reading.to}`, subtitle: fmtDate(reading.date), text: [reading.body, reading.sign].filter(Boolean).join("\n\n"), handwritten: true }])} testId="carta-share"><Share2 className="w-4 h-4" /> Compartir</GhostButton>
              <GhostButton className="py-2" onClick={() => { setEditing(reading); setEditorOpen(true); }} testId={`carta-edit-${reading.id}`}><Pencil className="w-4 h-4" /> Editar</GhostButton>
              <button className="rounded-full px-4 py-2 text-sm text-red-200 border border-red-400/50 hover:bg-red-500/15 inline-flex items-center gap-2" onClick={() => setDel(reading)} data-testid={`carta-delete-${reading.id}`}><Trash2 className="w-4 h-4" /> Eliminar</button>
            </div>
          </>
        )}
      </Modal>

      <LetterEditor open={editorOpen} onClose={() => setEditorOpen(false)} editing={editing} spaceId={id} spaceName={avatar.name} onSave={save} />

      <ShareDialog items={shareItems} onClose={() => setShareItems(null)} />

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={() => {
          const target = del;
          setDel(null);
          setReading(null);
          removeItem(id, "letters", target.id, "Carta eliminada.");
        }}
        title="¿Eliminar esta carta?"
        message="La carta se borra de este espacio. Vas a poder deshacerlo unos segundos; después es definitivo."
        testId="carta-delete-confirm"
      />
    </div>
  );
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
