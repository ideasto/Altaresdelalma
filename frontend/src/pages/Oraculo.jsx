import React, { useEffect, useRef, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { PageHeader, Modal, ConfirmDialog, GoldButton, GhostButton, EditPencil, TrashButton, Field, TextInput, TextArea } from "../components/common";
import CardBack from "../components/CardBack";
import { makeSheet, renderPdf } from "../lib/pdf";
import { copyText } from "../lib/drafts";
import { plural } from "../lib/format";
import { LIMITS } from "../config/brand";
import { toast } from "sonner";
import { Sparkles, FileDown, Plus, Star, Copy, SkipForward } from "lucide-react";

const HINTS = ["Una frase que decía", "Un chiste o expresión suya", "Su esencia", "Algo que dejó en vos", "Palabras que vos escribís hoy"];
const ORIGIN_LABEL = { recordada: "Palabras suyas", escrita: "Escrita por mí" };

function CardFace({ card }) {
  return (
    <div className="w-full h-full paper-sheet rounded-xl flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-2 rounded-lg border border-[#c9a94a]/70 pointer-events-none" />
      <div className="absolute inset-[10px] rounded-lg border border-[#c9a94a]/30 pointer-events-none" />
      <Star className="w-4 h-4 text-[#c9a94a] mb-2" strokeWidth={1.2} />
      <p className="font-heading italic text-center text-xl sm:text-2xl leading-snug text-[#2b2114] px-2 break-words">{card.message}</p>
      <div className="w-10 h-px bg-[#c9a94a] my-2.5" />
      <p className="font-ui text-[11px] tracking-[0.2em] uppercase text-[#6b5a3e] text-center">{card.name}</p>
      {card.origin && <p className="absolute bottom-3 text-[9px] tracking-wider uppercase text-[#9c8a66]">{ORIGIN_LABEL[card.origin]}</p>}
    </div>
  );
}

const reducedMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Consultation({ cards, autoFocus }) {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | shuffling | reveal
  const [result, setResult] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const timers = useRef([]);
  const ref = useRef(null);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);
  useEffect(() => { if (autoFocus) setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }, [autoFocus]);

  const reveal = (pick) => {
    clear();
    setResult(pick);
    setPhase("reveal");
    if (reducedMotion()) return setFlipped(true);
    timers.current.push(setTimeout(() => setFlipped(true), 250));
  };

  const consult = () => {
    if (phase === "shuffling") return;
    if (!cards.length) return toast.error("Primero creá al menos una carta en el mazo.");
    clear();
    setFlipped(false);
    const pick = cards[Math.floor(Math.random() * cards.length)];
    setResult(pick);
    if (reducedMotion()) return reveal(pick);
    setPhase("shuffling");
    timers.current.push(setTimeout(() => reveal(pick), 1400));
  };

  return (
    <section className="glass rounded-3xl p-6 sm:p-8 mb-10" ref={ref} data-testid="oraculo-consult-area">
      <h2 className="font-heading text-3xl text-[#f8fafc] mb-1">Sacar una carta</h2>
      <p className="text-xs text-[#a9bacb] mb-4">Es un gesto simbólico: sale al azar una de las cartas que escribiste. La pregunta no cambia el resultado.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <TextInput value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="¿Qué frase quiero reencontrar hoy? (opcional)" maxLength={140} data-testid="oraculo-question-input" onKeyDown={(e) => e.key === "Enter" && consult()} />
        <GoldButton onClick={consult} disabled={phase === "shuffling"} testId="oraculo-consult" className="shrink-0"><Sparkles className="w-4 h-4" /> {phase === "reveal" ? "Sacar otra" : "Mezclar y sacar"}</GoldButton>
      </div>
      {phase !== "idle" && (
        <div className="mt-8 flex flex-col items-center">
          {question && <p className="font-hand text-3xl text-[#fde68a] mb-6 text-center" data-testid="oraculo-question-shown">“{question}”</p>}
          <div className="flip-scene" style={{ width: 220, height: 314 }}>
            {phase === "shuffling" ? (
              <div className="relative w-full h-full" data-testid="oraculo-shuffling">
                {[0, 1, 2].map((i) => <div key={i} className="absolute inset-0 shuffling" style={{ animationDelay: `${i * 0.07}s` }}><CardBack logo={i === 2} /></div>)}
              </div>
            ) : (
              <div className={`flip-inner ${flipped ? "is-flipped" : ""}`} data-testid="oraculo-result-card">
                <div className="flip-face"><CardBack /></div>
                <div className="flip-face flip-back">{result && <CardFace card={result} />}</div>
              </div>
            )}
          </div>
          {phase === "shuffling" && (
            <button className="mt-5 text-sm text-[#a9bacb] hover:text-white inline-flex items-center gap-1.5" onClick={() => reveal(result)} data-testid="oraculo-skip">
              <SkipForward className="w-4 h-4" /> Saltear la mezcla
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default function Oraculo() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { getAvatar, updateAvatar, removeItem } = useStore();
  const avatar = getAvatar(id);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ message: "", name: "", origin: "", hint: "" });
  const [delCard, setDelCard] = useState(null);

  const openCreate = () => {
    if (avatar.cards.length >= LIMITS.oracleCards) return toast.error(`El mazo llegó a su máximo de ${LIMITS.oracleCards} cartas.`);
    setEditing(null);
    setDraft({ message: "", name: avatar.name, origin: "", hint: "" });
    setFormOpen(true);
  };
  useEffect(() => { if (avatar && params.get("nueva") === "1") openCreate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!avatar) return <Link to="/" className="gold-text underline block p-10">Volver</Link>;
  const cards = avatar.cards;

  const openEdit = (c) => { setEditing(c); setDraft({ message: c.message, name: c.name, origin: c.origin, hint: c.hint }); setFormOpen(true); };

  const saveCard = () => {
    const card = { ...draft, message: draft.message.trim(), name: draft.name.trim() };
    if (!card.message) return toast.error("Escribí una frase para la carta.");
    const ok = editing
      ? updateAvatar(id, (a) => ({ cards: a.cards.map((c) => (c.id === editing.id ? { ...c, ...card } : c)) }))
      : updateAvatar(id, (a) => ({ cards: [...a.cards, { id: crypto.randomUUID(), ...card }] }));
    if (ok) { toast.success(editing ? "Carta actualizada." : "Carta sumada al mazo."); setFormOpen(false); }
  };

  const exportPdf = () => {
    if (!cards.length) return toast.error("No hay cartas para exportar.");
    const chunks = [];
    for (let i = 0; i < cards.length; i += 6) chunks.push(cards.slice(i, i + 6));
    const sheets = chunks.map((chunk) => {
      const { sheet, content } = makeSheet({ title: "Mazo Oráculo", subtitle: avatar.name });
      const grid = document.createElement("div");
      Object.assign(grid.style, { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px", height: "100%" });
      chunk.forEach((c) => {
        const card = document.createElement("div");
        Object.assign(card.style, { border: "2px solid #c9a94a", borderRadius: "10px", padding: "22px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#fffdf8" });
        card.innerHTML = `<div style="font-size:24px;font-style:italic;color:#2b2114;line-height:1.3;">${esc(c.message)}</div><div style="width:40px;height:1px;background:#c9a94a;margin:12px 0;"></div><div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6b5a3e;font-family:'Plus Jakarta Sans',sans-serif;">${esc(c.name)}</div>`;
        grid.appendChild(card);
      });
      content.appendChild(grid);
      return sheet;
    });
    toast.promise(renderPdf(sheets, `mazo-${avatar.name}.pdf`), { loading: "Generando PDF del mazo…", success: "PDF descargado.", error: "No se pudo generar el PDF." });
  };

  return (
    <div className="pb-10">
      <PageHeader title="Mazo Oráculo" subtitle={avatar.name}>
        <GhostButton onClick={exportPdf} testId="oraculo-pdf"><FileDown className="w-4 h-4" /> PDF</GhostButton>
        <GoldButton onClick={openCreate} testId="oraculo-add" className="px-5 py-2.5"><Plus className="w-4 h-4" /> Nueva carta</GoldButton>
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
        <Consultation cards={cards} autoFocus={params.get("consultar") === "1"} />

        <h2 className="font-heading text-2xl text-[#f8fafc] mb-5">Tu mazo <span className="text-[#a9bacb] text-lg" data-testid="oraculo-count">({plural(cards.length, "carta", "cartas")} · máx. {LIMITS.oracleCards})</span></h2>
        {cards.length === 0 ? (
          <div className="glass rounded-3xl py-14 text-center">
            <div className="relative w-28 h-36 mx-auto mb-6">{[-8, 0, 8].map((r, i) => <div key={i} className="absolute inset-0" style={{ transform: `rotate(${r}deg)` }}><CardBack logo={i === 1} /></div>)}</div>
            <p className="text-[#d5dfea] mb-5 max-w-md mx-auto">Escribí frases suyas, chistes, su esencia o palabras tuyas. Esas serán las cartas del mazo.</p>
            <GoldButton onClick={openCreate} testId="oraculo-add-empty"><Plus className="w-4 h-4" /> Crear mi primera carta</GoldButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {cards.map((c) => (
              <div key={c.id} data-testid={`oraculo-card-${c.id}`}>
                <div className="aspect-[7/10]"><CardFace card={c} /></div>
                <div className="flex justify-center gap-1 mt-2">
                  <button className="icon-btn" title="Copiar texto" aria-label="Copiar texto" onClick={async () => toast.success((await copyText(c.message)) ? "Frase copiada." : "No se pudo copiar.")} data-testid={`oraculo-copy-${c.id}`}><Copy className="w-4 h-4" /></button>
                  <EditPencil onClick={() => openEdit(c)} testId={`oraculo-edit-${c.id}`} />
                  <TrashButton onClick={() => setDelCard(c)} testId={`oraculo-delete-${c.id}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar carta" : "Nueva carta"} testId="oraculo-form-modal">
        <p className="font-ui text-xs uppercase tracking-wider text-[#a9bacb] mb-2">Ideas (opcional)</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {HINTS.map((h) => (
            <button key={h} onClick={() => setDraft({ ...draft, hint: draft.hint === h ? "" : h })} className={`rounded-full px-3 py-1 text-xs border transition-colors ${draft.hint === h ? "border-[#d4af37] gold-text bg-[#d4af37]/10" : "border-[#d4af37]/30 text-[#d5dfea]"}`} data-testid={`oraculo-hint-${HINTS.indexOf(h)}`}>{h}</button>
          ))}
        </div>
        <Field label={`Frase (${draft.message.length}/90)`}>
          <TextArea rows={3} maxLength={90} value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} placeholder={draft.hint ? `${draft.hint}…` : "Una frase breve…"} data-testid="oraculo-message-input" />
        </Field>
        <Field label="¿De quién son estas palabras?">
          <div className="grid grid-cols-2 gap-2">
            {[["recordada", "Las decía de verdad"], ["escrita", "Las escribo yo"]].map(([v, l]) => (
              <button key={v} onClick={() => setDraft({ ...draft, origin: draft.origin === v ? "" : v })} className={`rounded-xl border px-3 py-2.5 text-sm ${draft.origin === v ? "border-[#d4af37] gold-text bg-[#d4af37]/10" : "border-[#d4af37]/25 text-[#d5dfea]"}`} data-testid={`oraculo-origin-${v}`}>{l}</button>
            ))}
          </div>
        </Field>
        <Field label="Nombre o firma al pie (opcional)">
          <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={40} data-testid="oraculo-name-input" />
        </Field>
        <div className="my-4 flex justify-center"><div className="w-40 aspect-[7/10]"><CardFace card={{ message: draft.message || "Tu frase acá", name: draft.name, origin: draft.origin }} /></div></div>
        <div className="flex justify-end gap-3">
          <GhostButton onClick={() => setFormOpen(false)} testId="oraculo-form-cancel">Cancelar</GhostButton>
          <GoldButton onClick={saveCard} testId="oraculo-form-save">{editing ? "Guardar" : "Sumar al mazo"}</GoldButton>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delCard}
        onClose={() => setDelCard(null)}
        onConfirm={() => { removeItem(id, "cards", delCard.id, "Carta quitada del mazo."); setDelCard(null); }}
        title="¿Eliminar esta carta?"
        message="La frase se quita del mazo. Vas a poder deshacerlo unos segundos."
        testId="oraculo-delete-confirm"
      />
    </div>
  );
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
