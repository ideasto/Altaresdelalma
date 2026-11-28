import React from "react";
import CardBack from "../CardBack";
import { CardFace } from "../DeckCard";
import { fmtDate, bookTitle } from "../../lib/format";
import { ImageIcon } from "lucide-react";

const Frame = ({ src, className = "" }) => (
  <div className={`memory-photo-frame overflow-hidden rounded-md shadow-md ${className}`}>
    <img src={src} alt="" className="w-full h-full object-cover" />
  </div>
);

export function GalleryPreview({ a }) {
  const photos = [...a.gallery.photos].reverse().sort((x, y) => Number(y.id === a.favorites?.galeria) - Number(x.id === a.favorites?.galeria)).slice(0, 3);
  if (!photos.length) {
    return (
      <div className="flex items-center justify-center gap-3 h-full" data-testid="preview-galeria-empty">
        {[-6, 4].map((r, i) => (
          <div key={i} className="w-24 h-28 sm:w-32 sm:h-36 rounded-md border-2 border-dashed border-[#d4af37]/45 flex items-center justify-center" style={{ transform: `rotate(${r}deg)` }}>
            <ImageIcon className="w-8 h-8 gold-text opacity-60" strokeWidth={1.2} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3 h-full items-center" data-testid="preview-galeria-photos">
      {photos.map((p, i) => <Frame key={p.id} src={p.src} className={`aspect-[4/5] ${i === 1 ? "-translate-y-1" : ""}`} />)}
    </div>
  );
}

export function OraclePreview({ a }) {
  const n = a.cards.length;
  const favorite = a.cards.find(x => x.id === a.favorites?.oraculo) || a.cards[n - 1];
  return (
    <div className="relative h-full flex items-center justify-center" data-testid={n ? "preview-oraculo-deck" : "preview-oraculo-empty"}>
      {favorite ? <CardFace card={favorite} compact /> : (
        [-1, 0, 1].map((offset) => (
          <div key={offset} className="absolute w-16 h-[92px] opacity-75" style={{ transform: `translateX(${offset * 18}px) rotate(${offset * 8}deg)` }}>
            <CardBack logo={offset === 0} />
          </div>
        ))
      )}
    </div>
  );
}

export function TimelinePreview({ a }) {
  const moments = [...a.timeline].reverse().sort((x, y) => Number(y.id === a.favorites?.linea) - Number(x.id === a.favorites?.linea)).slice(0, 2);
  return (
    <div className="relative h-full flex flex-col justify-center" data-testid={moments.length ? "preview-linea-moments" : "preview-linea-empty"}>
      <svg viewBox="0 0 200 40" className="w-full h-8" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 30 C 50 0, 90 40, 140 14 S 190 10, 198 20" fill="none" stroke="hsl(46 65% 52%)" strokeWidth="2" strokeDasharray={moments.length ? "0" : "4 5"} />
      </svg>
      {moments.map((m) => (
        <div key={m.id} className="flex items-center gap-2 mt-1.5 min-w-0">
          {m.photo ? <img src={m.photo} alt="" className="w-7 h-7 rounded-full object-cover border border-[#d4af37]/70" /> : <span className="w-2 h-2 rounded-full bg-[#d4af37] ml-2.5 mr-2.5" />}
          <span className="text-xs text-[#a9bacb] shrink-0">{fmtDate(m.date, "short") || "Sin fecha"}</span>
          <span className="text-sm text-[#f8fafc] truncate">{m.title}</span>
        </div>
      ))}
    </div>
  );
}

export function LettersPreview({ a }) {
  const last = a.letters.find(x => x.id === a.favorites?.cartas) || a.letters[0];
  return (
    <div className="paper-sheet rounded-lg w-full max-w-[240px] mx-auto p-3" data-testid={last ? "preview-cartas-last" : "preview-cartas-empty"}>
      {last ? (
        <>
          <p className="text-[10px] text-[var(--paper-muted)] text-right">{fmtDate(last.date, "short")}</p>
          <p className="font-hand text-lg ruled-letter ruled-letter--mini line-clamp-3 whitespace-pre-line">{last.body}</p>
        </>
      ) : (
        <div className="ruled-letter ruled-letter--mini h-[66px]" aria-hidden="true" />
      )}
    </div>
  );
}

export function BookPreview({ a }) {
  const has = a.book.length > 0 || a.bookMeta.title || a.bookMeta.coverPhoto;
  const page = a.book.find(x => x.id === a.favorites?.libro) || a.book[a.book.length - 1];
  const cover = page?.photo || a.bookMeta.coverPhoto || a.photoCropped;
  return (
    <div className="h-full flex items-center justify-center" data-testid={has ? "preview-libro-cover" : "preview-libro-empty"}>
      <div className="book-depth rounded-r-md rounded-l-sm w-[70px] h-[94px] p-1.5 flex flex-col items-center justify-center gap-1.5" style={{ backgroundColor: "var(--memorial-panel-blue)", border: "1px solid hsl(46 65% 52% / 0.6)" }}>
        {has && cover ? <img src={cover} alt="" className="w-10 h-10 object-cover rounded-sm border border-[#d4af37]" /> : <div className="w-10 h-10 rounded-sm border border-dashed border-[#d4af37]/60" />}
        <p className="font-heading text-[10px] leading-tight text-center gold-text line-clamp-2">{page?.title || (has ? bookTitle(a) : "Tu libro")}</p>
      </div>
    </div>
  );
}
