import React from "react";
import { DECK_FRAME_URL } from "../lib/deckFrame";

export function DeckPaper({ children, className = "", testId }) {
  return (
    <div className={`paper-sheet relative rounded-xl ${className}`} data-testid={testId}>
      <img src={DECK_FRAME_URL} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full rounded-[inherit] pointer-events-none" />
      {children}
    </div>
  );
}

export function CardFace({ card, fixed = false, compact = false }) {
  if (compact) {
    return (
      <DeckPaper className="w-24 aspect-[7/10] grid place-items-center px-2.5 py-4">
        <p className="relative text-center font-heading font-semibold text-base leading-tight line-clamp-4 [overflow-wrap:anywhere]">{card.message}</p>
      </DeckPaper>
    );
  }

  return (
    <DeckPaper className={`w-full flex flex-col items-center justify-center gap-3 p-6 ${fixed ? "h-full" : "min-h-full"}`} testId="deck-paper-face">
      <p tabIndex={fixed ? 0 : undefined} className={`relative font-heading font-semibold text-center text-2xl sm:text-3xl leading-snug w-full whitespace-pre-wrap [overflow-wrap:anywhere] ${fixed ? "min-h-0 overflow-y-auto" : ""}`}>{card.message}</p>
      <div className="relative w-10 h-px shrink-0 bg-[#c9a94a]" />
      <p className="relative font-ui text-[11px] tracking-[0.2em] uppercase text-[var(--paper-muted)] text-center max-w-full [overflow-wrap:anywhere]">{card.name}</p>
    </DeckPaper>
  );
}
