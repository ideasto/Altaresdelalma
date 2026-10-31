import React from "react";
import { BrandLogo } from "../Logo";
import { BRAND } from "../../config/brand";
import { bookTitle } from "../../lib/format";
import { Image as ImageIcon, Pencil } from "lucide-react";

const coverBg = { background: "linear-gradient(150deg, hsl(205 47% 35%), hsl(214 49% 23%))" };

export function BookCover({ a, onEdit, onChange, onPhoto }) {
  const cover = a.bookMeta.coverPhoto || a.photoCropped;
  return (
    <div className="book-depth rounded-r-xl rounded-l-sm aspect-[210/297] flex flex-col items-center justify-start pt-10 pb-24 px-8 relative" style={coverBg} data-testid="libro-cover">
      <div className="absolute inset-4 rounded-lg border-2 border-[#d4af37]/55 pointer-events-none" />
      <div className="absolute inset-[22px] rounded-md border border-[#d4af37]/20 pointer-events-none" />
      {!onChange && <button className="absolute top-6 right-6 icon-btn bg-[#152438]/80 border border-[#d4af37]/50 z-10" onClick={onEdit} title="Editar tapa" aria-label="Editar tapa" data-testid="libro-cover-edit"><Pencil className="w-4 h-4" /></button>}
      {onChange ? <input aria-label="Título del libro" className="w-full bg-transparent text-center font-heading text-3xl gold-text mt-1" value={a.bookMeta.title} onChange={e => onChange({ ...a.bookMeta, title: e.target.value })} data-testid="libro-meta-title" /> : <h2 className="font-heading text-3xl sm:text-4xl gold-gradient-text text-center leading-tight break-words max-w-full" data-testid="libro-cover-title">{bookTitle(a)}</h2>}
      <button disabled={!onPhoto} onClick={onPhoto} aria-label="Elegir foto de tapa" className="bg-[#fdfbf5] p-1 rounded-sm shadow-xl my-5 w-[75%] aspect-square" data-testid="libro-meta-photo">
        {cover ? <img src={cover} alt="" className="w-full h-full object-contain" /> : <ImageIcon className="w-10 h-10 text-[#b39a5a] mx-auto" />}
      </button>
      {onChange ? <input aria-label="Frase opcional" placeholder="Frase opcional" className="w-full bg-transparent font-hand text-2xl text-center" value={a.bookMeta.subtitle} onChange={e => onChange({ ...a.bookMeta, subtitle: e.target.value })} data-testid="libro-meta-subtitle" /> : a.bookMeta.subtitle && <p className="font-hand text-2xl text-[#e7eef6] text-center">{a.bookMeta.subtitle}</p>}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1">
        <BrandLogo variant="goldFull" className="h-12 w-auto" alt="" />
        <p className="font-ui text-[9px] tracking-[0.25em] uppercase text-[#d4bf75]">{BRAND.editorialCredit}</p>
      </div>
    </div>
  );
}

export function BookBack({ a, onEdit, onChange }) {
  const { backText, closing } = a.bookMeta;
  return (
    <div className="book-depth rounded-r-xl rounded-l-sm aspect-[210/297] flex flex-col p-9 relative" style={coverBg} data-testid="libro-back">
      <div className="absolute inset-4 rounded-lg border-2 border-[#d4af37]/55 pointer-events-none" />
      {!onChange && <button className="absolute top-6 right-6 icon-btn bg-[#152438]/80 border border-[#d4af37]/50 z-10" onClick={onEdit} title="Editar contratapa" aria-label="Editar contratapa" data-testid="libro-back-edit"><Pencil className="w-4 h-4" /></button>}
      {onChange ? <input className="font-heading text-3xl gold-text bg-transparent text-center w-full mt-6" value={a.bookMeta.title} onChange={e => onChange({ ...a.bookMeta, title: e.target.value })} data-testid="libro-meta-title" aria-label="Título del libro" /> : <h3 className="font-heading text-3xl gold-gradient-text text-center mt-6 break-words" data-testid="libro-back-title">{bookTitle(a)}</h3>}
      <div className="w-16 h-px bg-[#d4af37]/70 mx-auto my-5" />
      <div className="flex-1 overflow-y-auto fancy-scroll">
        {onChange ? <textarea aria-label="Presentación" className="w-full bg-transparent font-heading text-lg min-h-48" value={backText} placeholder="Presentación del libro" onChange={e => onChange({ ...a.bookMeta, backText: e.target.value })} data-testid="libro-meta-backtext" /> : backText ? (
          <p className="font-heading text-lg leading-relaxed text-[#e7eef6] whitespace-pre-wrap text-center" data-testid="libro-back-text">{backText}</p>
        ) : (
          <p className="font-heading italic text-base leading-relaxed text-[#a9bacb] text-center" data-testid="libro-back-placeholder">
            Ejemplo orientativo (no se imprime): «Este libro reúne fotos, palabras y momentos de una vida querida…». Tocá el lápiz para escribir tu propia reseña.
          </p>
        )}
        {onChange ? <textarea aria-label="Cierre opcional" className="w-full bg-transparent font-hand text-2xl gold-text mt-5" value={closing} placeholder="Cierre opcional" onChange={e => onChange({ ...a.bookMeta, closing: e.target.value })} data-testid="libro-meta-closing" /> : closing && <p className="font-hand text-2xl text-[#fde68a] text-center mt-5" data-testid="libro-back-closing">{closing}</p>}
      </div>
      <div className="flex flex-col items-center gap-1 mt-4">
        <BrandLogo variant="goldHorizontal" className="h-7 w-auto" alt="" />
        <p className="font-ui text-[9px] tracking-[0.25em] uppercase text-[#d4bf75]">{BRAND.editorialCredit}</p>
      </div>
    </div>
  );
}
