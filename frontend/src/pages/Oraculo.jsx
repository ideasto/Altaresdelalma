import React, { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { CatLogo } from "../components/Logo";
import { PageHeader, Modal, ConfirmDialog, GoldButton, GhostButton, EditPencil, TrashButton, Field, TextInput, TextArea } from "../components/common";
import { makeSheet, renderPdf } from "../lib/pdf";
import { toast } from "sonner";
import { Sparkles, FileDown, Plus, Wand2, Star } from "lucide-react";

const MAX_CARDS = 21;

function CardFace({ card }) {
  return (
    <div className="w-full h-full paper-sheet rounded-xl flex flex-col items-center justify-center p-5 relative">
      <div className="absolute inset-2 rounded-lg border border-[#c9a94a]/70 pointer-events-none" />
      <div className="absolute inset-[10px] rounded-lg border border-[#c9a94a]/30 pointer-events-none" />
      <Star className="w-5 h-5 text-[#c9a94a] mb-3" strokeWidth={1.2} />
      <p className="font-heading italic text-center text-2xl leading-snug text-[#2b2114] px-2">
        {card.message}
      </p>
      <div className="w-10 h-px bg-[#c9a94a] my-3" />
      <p className="font-ui text-xs tracking-[0.2em] uppercase text-[#6b5a3e]">{card.name}</p>
    </div>
  );
}

function CardBack({ className = "" }) {
  return (
    <div className={`w-full h-full rounded-xl flex items-center justify-center relative overflow-hidden ${className}`}
      style={{ background: "linear-gradient(160deg,#112240,#0b1a2f)", border: "1px solid rgba(212,175,55,0.5)" }}>
      <div className="absolute inset-2 rounded-lg border border-[#d4af37]/40" />
      <div className="star-field opacity-40" style={{ position: "absolute" }} />
      <span className="gold-text relative z-10 float-soft"><CatLogo size={64} strokeWidth={1.3} /></span>
    </div>
  );
}

export default function Oraculo() {
  const { id } = useParams();
  const { getAvatar, updateAvatar } = useStore();
  const avatar = getAvatar(id);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ message: "", name: "" });
  const [delCard, setDelCard] = useState(null);

  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | shuffling | reveal
  const [result, setResult] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [showText, setShowText] = useState(false);
  const consultRef = useRef(null);

  if (!avatar) return <Link to="/" className="gold-text underline block p-10">Volver</Link>;
  const cards = avatar.cards;

  const saveCard = () => {
    const msg = draft.message.trim();
    if (!msg) return toast.error("Escribí una frase para la carta.");
    if (!draft.name.trim()) return toast.error("Falta el nombre al pie de la carta.");
    if (editing) {
      updateAvatar(id, (a) => ({ cards: a.cards.map((c) => (c.id === editing.id ? { ...c, ...draft } : c)) }));
      toast.success("Carta actualizada.");
    } else {
      if (cards.length >= MAX_CARDS) return toast.error(`El mazo llegó a su máximo de ${MAX_CARDS} cartas.`);
      updateAvatar(id, (a) => ({ cards: [...a.cards, { id: crypto.randomUUID(), ...draft, message: msg, name: draft.name.trim() }] }));
      toast.success("Carta añadida al mazo.");
    }
    setFormOpen(false);
  };

  const openCreate = () => {
    if (cards.length >= MAX_CARDS) return toast.error(`El mazo llegó a su máximo de ${MAX_CARDS} cartas.`);
    setEditing(null);
    setDraft({ message: "", name: avatar.name });
    setFormOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setDraft({ message: c.message, name: c.name });
    setFormOpen(true);
  };

  const consult = () => {
    if (cards.length === 0) return toast.error("Primero creá al menos una carta en el mazo.");
    setResult(null);
    setFlipped(false);
    setShowText(false);
    setPhase("shuffling");
    setTimeout(() => consultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    setTimeout(() => {
      const pick = cards[Math.floor(Math.random() * cards.length)];
      setResult(pick);
      setPhase("reveal");
      setTimeout(() => setFlipped(true), 120);
      setTimeout(() => setShowText(true), 1050);
    }, 3000);
  };

  const exportPdf = async () => {
    if (cards.length === 0) return toast.error("No hay cartas para exportar.");
    const chunks = [];
    for (let i = 0; i < cards.length; i += 6) chunks.push(cards.slice(i, i + 6));
    const sheets = chunks.map((chunk, idx) => {
      const { sheet, content } = makeSheet({ title: "Mazo Oráculo", subtitle: avatar.name });
      const grid = document.createElement("div");
      Object.assign(grid.style, { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px", height: "100%" });
      chunk.forEach((c) => {
        const card = document.createElement("div");
        Object.assign(card.style, {
          border: "2px solid #c9a94a", borderRadius: "10px", padding: "22px",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center",
          background: "#fffdf8",
        });
        card.innerHTML = `
          <div style="font-size:24px;font-style:italic;color:#2b2114;line-height:1.3;">${escapeHtml(c.message)}</div>
          <div style="width:40px;height:1px;background:#c9a94a;margin:12px 0;"></div>
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6b5a3e;font-family:'Plus Jakarta Sans',sans-serif;">${escapeHtml(c.name)}</div>`;
        grid.appendChild(card);
      });
      content.appendChild(grid);
      return sheet;
    });
    toast.promise(renderPdf(sheets, `oraculo-${avatar.name}.pdf`), {
      loading: "Generando PDF del mazo…",
      success: "PDF descargado.",
      error: "No se pudo generar el PDF.",
    });
  };

  return (
    <div className="pb-10">
      <PageHeader title="Mazo Oráculo" subtitle={avatar.name}>
        <GhostButton onClick={exportPdf} testId="oraculo-pdf"><FileDown className="w-4 h-4" /> PDF</GhostButton>
        <GoldButton onClick={openCreate} testId="oraculo-add" className="px-5 py-2.5">
          <Plus className="w-4 h-4" /> Nueva carta
        </GoldButton>
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
        {/* Consultation */}
        <div className="glass rounded-3xl p-6 sm:p-8 mb-10" ref={consultRef}>
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="w-5 h-5 gold-text" />
            <h2 className="font-heading text-2xl sm:text-3xl text-[#f8fafc]">Consultar el Oráculo</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <TextInput
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Hacé tu pregunta al universo…"
              data-testid="oraculo-question-input"
              onKeyDown={(e) => e.key === "Enter" && consult()}
            />
            <GoldButton onClick={consult} testId="oraculo-consult" className="shrink-0">
              <Sparkles className="w-4 h-4" /> Consultar
            </GoldButton>
          </div>

          {phase !== "idle" && (
            <div className="mt-8 flex flex-col items-center">
              {question && (
                <p className="font-hand text-3xl text-[#fef08a] mb-6 text-center" data-testid="oraculo-question-shown">
                  “{question}”
                </p>
              )}
              <div className="flip-scene" style={{ width: 240, height: 340 }}>
                {phase === "shuffling" ? (
                  <div className="relative w-full h-full" data-testid="oraculo-shuffling">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="absolute inset-0 shuffling" style={{ animationDelay: `${i * 0.08}s` }}>
                        <CardBack />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`flip-inner ${flipped ? "is-flipped" : ""}`} data-testid="oraculo-result-card">
                    <div className="flip-face"><CardBack /></div>
                    <div className="flip-face flip-back">
                      <div className={showText ? "answer-in w-full h-full" : "w-full h-full opacity-0"}>
                        {result && <CardFace card={result} />}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {phase === "shuffling" && <p className="text-[#94a3b8] mt-5 animate-pulse">Barajando el mazo…</p>}
            </div>
          )}
        </div>

        {/* Deck grid */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-2xl text-[#f8fafc]">El mazo <span className="text-[#94a3b8] text-lg">({cards.length}/{MAX_CARDS})</span></h2>
        </div>

        {cards.length === 0 ? (
          <div className="glass rounded-3xl py-16 text-center">
            <span className="gold-text float-soft inline-block mb-4"><Sparkles className="w-14 h-14" strokeWidth={1} /></span>
            <p className="text-[#cbd5e1] mb-5">Todavía no hay cartas. Creá las frases que querés recibir del oráculo.</p>
            <GoldButton onClick={openCreate} testId="oraculo-add-empty"><Plus className="w-4 h-4" /> Crear primera carta</GoldButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {cards.map((c) => (
              <div key={c.id} className="relative group" data-testid={`oraculo-card-${c.id}`}>
                <div className="aspect-[5/7]">
                  <CardFace card={c} />
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0b1a2f]/70 rounded-full p-0.5">
                  <EditPencil onClick={() => openEdit(c)} testId={`oraculo-edit-${c.id}`} />
                  <TrashButton onClick={() => setDelCard(c)} testId={`oraculo-delete-${c.id}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card form */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar carta" : "Nueva carta"} testId="oraculo-form-modal">
        <Field label={`Frase (${draft.message.length}/90)`}>
          <TextArea
            rows={3}
            maxLength={90}
            value={draft.message}
            onChange={(e) => setDraft({ ...draft, message: e.target.value })}
            placeholder="Una frase breve y luminosa…"
            data-testid="oraculo-message-input"
          />
        </Field>
        <Field label="Nombre al pie">
          <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ej: Abuela Rosa" data-testid="oraculo-name-input" />
        </Field>
        <div className="my-4 flex justify-center">
          <div className="w-40 aspect-[5/7]"><CardFace card={{ message: draft.message || "Tu frase aquí", name: draft.name || avatar.name }} /></div>
        </div>
        <div className="flex justify-end gap-3">
          <GhostButton onClick={() => setFormOpen(false)} testId="oraculo-form-cancel">Cancelar</GhostButton>
          <GoldButton onClick={saveCard} testId="oraculo-form-save">{editing ? "Guardar" : "Añadir al mazo"}</GoldButton>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delCard}
        onClose={() => setDelCard(null)}
        onConfirm={() => {
          updateAvatar(id, (a) => ({ cards: a.cards.filter((c) => c.id !== delCard.id) }));
          toast.success("Carta eliminada.");
          setDelCard(null);
        }}
        title="¿Eliminar esta carta?"
        message="La frase se quitará del mazo del oráculo."
        testId="oraculo-delete-confirm"
      />
    </div>
  );
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
