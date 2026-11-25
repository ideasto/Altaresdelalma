import ShareDialog from "../components/ShareDialog";
import React, { useEffect, useRef, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { PageHeader, Modal, ConfirmDialog, GoldButton, GhostButton, EditPencil, TrashButton, TextInput, TextArea } from "../components/common";
import { DECK_FRAME_URL } from "../lib/deckFrame";
import CardBack from "../components/CardBack";
import { deckPdf, deckFits, initDeckProbe } from "../lib/pdf/deck";
import { copyText } from "../lib/drafts";
import { plural } from "../lib/format";
import { LIMITS } from "../config/brand";
import { toast } from "sonner";
import { Sparkles, FileDown, Plus, Star, Copy, SkipForward, Share2 } from "lucide-react";

const HINTS = ["Una frase que decía", "Un chiste o expresión suya", "Su esencia", "Algo que dejó en vos", "Palabras que vos escribís hoy"];

function DeckPaper({ children, className = "", testId }) {
  return (
    <div className={`paper-sheet relative rounded-xl ${className}`} data-testid={testId}>
      <img src={DECK_FRAME_URL} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full rounded-[inherit] pointer-events-none" />
      {children}
    </div>
  );
}

function CardFace({ card, fixed = false }) {
  return (
    <DeckPaper className={`w-full flex flex-col items-center justify-center gap-3 p-6 ${fixed ? "h-full" : "min-h-full"}`} testId="deck-paper-face">
      <p tabIndex={fixed ? 0 : undefined} className={`relative font-heading italic text-center text-2xl sm:text-3xl leading-snug w-full whitespace-pre-wrap [overflow-wrap:anywhere] ${fixed ? "min-h-0 overflow-y-auto" : ""}`}>{card.message}</p>
      <div className="relative w-10 h-px shrink-0 bg-[#c9a94a]" />
      <p className="relative font-ui text-[11px] tracking-[0.2em] uppercase text-[var(--paper-muted)] text-center max-w-full [overflow-wrap:anywhere]">{card.name}</p>
    </DeckPaper>
  );
}

const reducedMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Consultation({ cards, autoFocus }) {
  const [sound, setSound] = useState(() => { try { return localStorage.getItem("ecos_sound") === "on"; } catch { return false; } });
  const audio = useRef(null);
  const tone = (hz) => {
    if (!sound) return;
    try { const Ctx = window.AudioContext || window.webkitAudioContext; const ctx = audio.current || (audio.current = new Ctx()); ctx.resume(); const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = hz; o.type = "sine"; g.gain.setValueAtTime(0.035, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + .16); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + .17); } catch { /* Audio optional. */ }
  };
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
    clear(); tone(660);
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
    tone(220); setPhase("shuffling");
    timers.current.push(setTimeout(() => reveal(pick), 1400));
  };

  return (
    <section className="glass rounded-3xl p-6 sm:p-8 mb-10" ref={ref} data-testid="oraculo-consult-area">
      <button className="ghost-gold rounded-full px-3 py-1 text-xs float-right" aria-pressed={sound} onClick={() => setSound(v => { try { localStorage.setItem("ecos_sound", !v ? "on" : "off"); } catch {} return !v; })} data-testid="oraculo-sound">Sonido {sound ? "activado" : "silenciado"}</button>
      <h2 className="font-heading text-3xl text-[#f8fafc] mb-1">Sacar una carta</h2>
      <p className="text-xs text-[#a9bacb] mb-4">Es un gesto simbólico: sale al azar una de las cartas que escribiste. La pregunta no cambia el resultado.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <TextInput value={question} onChange={(e) => setQuestion(e.target.value)} aria-label="Pregunta opcional" placeholder="¿Qué frase quiero reencontrar hoy? (opcional)" maxLength={140} data-testid="oraculo-question-input" onKeyDown={(e) => e.key === "Enter" && consult()} />
        <GoldButton onClick={consult} disabled={phase === "shuffling"} testId="oraculo-consult" className="shrink-0"><Sparkles className="w-4 h-4" /> {phase === "reveal" ? "Sacar otra" : "Mezclar y sacar"}</GoldButton>
      </div>
      {phase !== "idle" && (
        <div className="mt-8 flex flex-col items-center">
          {question && <p className="font-hand text-3xl text-[#fde68a] mb-6 text-center" data-testid="oraculo-question-shown">“{question}”</p>}
          <div className="flip-scene w-full max-w-[220px] aspect-[7/10]">
            {phase === "shuffling" ? (
              <div className="relative w-full h-full" data-testid="oraculo-shuffling">
                {[0, 1, 2].map((i) => <div key={i} className="absolute inset-0 shuffling" style={{ animationDelay: `${i * 0.07}s` }}><CardBack logo={i === 2} /></div>)}
              </div>
            ) : (
              <div className={`flip-inner ${flipped ? "is-flipped" : ""}`} data-testid="oraculo-result-card">
                <div className="flip-face"><CardBack /></div>
                <div className="flip-face flip-back">{result && <CardFace card={result} fixed />}</div>
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
  useEffect(() => { initDeckProbe(); }, []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ message: "", name: "" });
  const [delCard, setDelCard] = useState(null);
  const [shareItems, setShareItems] = useState(null);

  const openCreate = () => {
    if (avatar.cards.length >= LIMITS.oracleCards) return toast.error(`El mazo llegó a su máximo de ${LIMITS.oracleCards} cartas.`);
    setEditing(null);
    setDraft({ message: "", name: avatar.name });
    setFormOpen(true);
  };
  useEffect(() => { if (avatar && params.get("nueva") === "1") openCreate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!avatar) return <Link to="/" className="gold-text underline block p-10">Volver</Link>;
  const cards = avatar.cards;

  const openEdit = (c) => { setEditing(c); setDraft({ message: c.message, name: c.name }); setFormOpen(true); };

  const saveCard = async () => {
    const card = { ...draft, message: draft.message.trim(), name: draft.name.trim() };
    if (!deckFits(card.message).fits) return toast.error("La frase no entra en una carta de 63 × 90 mm. Acortala para conservar una letra legible.");
    if (!card.message) return toast.error("Escribí una frase para la carta.");
    const ok = editing
      ? await updateAvatar(id, (a) => ({ cards: a.cards.map((c) => (c.id === editing.id ? { ...c, ...card } : c)) }))
      : await updateAvatar(id, (a) => ({ cards: [...a.cards, { id: crypto.randomUUID(), ...card }] }));
    if (ok) { toast.success(editing ? "Carta actualizada." : "Carta sumada al mazo."); setFormOpen(false); }
  };

  const exportPdf = () => {
    if (!cards.length) return toast.error("No hay cartas para exportar.");
    if (cards.some(c => !deckFits(c.message).fits)) return toast.error("Una frase excede la carta física. Acortala antes de imprimir.");
    return toast.promise(deckPdf(cards, `mazo-${avatar.name}.pdf`), { loading: "Generando mazo…", success: "PDF descargado. Imprimí al 100 %, doble faz, borde largo.", error: "No se pudo generar el PDF." });
  };

  return (
    <div className="pb-10">
      <PageHeader title="Mazo de recuerdos" subtitle={avatar.name}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {cards.map((c) => (
              <div key={c.id} className="min-w-0 w-full max-w-[19rem] mx-auto" data-testid={`oraculo-card-${c.id}`}>
                <div className="grid min-h-[18rem] sm:aspect-[7/10]"><CardFace card={c} /></div>
                <div className="flex justify-center gap-1 mt-2">
                  <button className="icon-btn" title="Copiar texto" aria-label="Copiar texto" onClick={async () => toast.success((await copyText(c.message)) ? "Frase copiada." : "No se pudo copiar.")} data-testid={`oraculo-copy-${c.id}`}><Copy className="w-4 h-4" /></button>
                  <button className="icon-btn" title="Compartir carta" aria-label="Compartir carta" onClick={() => setShareItems([{ kind: "card", title: c.name || avatar.name, text: c.message }])} data-testid={`oraculo-share-${c.id}`}><Share2 className="w-4 h-4" /></button>
                  <EditPencil onClick={() => openEdit(c)} testId={`oraculo-edit-${c.id}`} />
                  <TrashButton onClick={() => setDelCard(c)} testId={`oraculo-delete-${c.id}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar carta" : "Nueva carta"} surface="paper" testId="oraculo-form-modal">
        <p className="text-sm text-[#d5dfea] mb-2">Escribí una frase para este mazo. Si necesitás una idea para empezar, puede ser:</p>
        <p className="text-xs text-[#e7d5a0] mb-4 leading-relaxed">{HINTS.join(" · ")}. Son ejemplos; escribí libremente en la carta.</p>
        <DeckPaper className="w-full max-w-[280px] mx-auto min-h-[330px] aspect-[7/10] p-7 sm:p-9 flex flex-col gap-4 justify-center mb-5" testId="deck-paper-editor">
          <textarea aria-label="Frase sobre la carta" className="relative bg-transparent text-center font-heading italic text-2xl w-full resize-none" rows={5} value={draft.message} onChange={e => setDraft({ ...draft, message: e.target.value })} placeholder="Una frase breve…" data-testid="oraculo-message-input" />
          <div className="relative w-10 h-px shrink-0 bg-[#c9a94a] mx-auto" />
          <input maxLength={40} aria-label="Firma" className="relative bg-transparent text-center w-full text-sm" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} data-testid="oraculo-name-input" />
        </DeckPaper>
        {!deckFits(draft.message).fits && <p role="alert" className="text-amber-200 text-sm mb-4">Esta frase excede la carta física de 63 × 90 mm. Acortala antes de guardar.</p>}
        <div className="flex flex-wrap justify-end gap-3">
          <GhostButton onClick={() => setFormOpen(false)} testId="oraculo-form-cancel">Cancelar</GhostButton>
          <GoldButton onClick={saveCard} testId="oraculo-form-save">{editing ? "Guardar" : "Sumar al mazo"}</GoldButton>
        </div>
      </Modal>

      <ShareDialog items={shareItems} onClose={() => setShareItems(null)} />

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
