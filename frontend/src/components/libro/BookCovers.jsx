import React from "react";
import { BrandLogo } from "../Logo";
import { BRAND } from "../../config/brand";
import { bookTitle } from "../../lib/format";
import { Image as ImageIcon, Pencil } from "lucide-react";

const coverBg = { background: "linear-gradient(150deg, hsl(205 42% 30%), hsl(214 46% 16%))" };

export function BookCover({ a, onEdit }) {
  const cover = a.bookMeta.coverPhoto || a.photoCropped;
  return (
    <div className="book-depth rounded-r-xl rounded-l-sm aspect-[3/4] flex flex-col items-center justify-center p-8 relative" style={coverBg} data-testid="libro-cover">
      <div className="absolute inset-4 rounded-lg border-2 border-[#d4af37]/55 pointer-events-none" />
      <div className="absolute inset-[22px] rounded-md border border-[#d4af37]/20 pointer-events-none" />
      <button className="absolute top-6 right-6 icon-btn bg-[#152438]/80 border border-[#d4af37]/50 z-10" onClick={onEdit} title="Editar tapa" aria-label="Editar tapa" data-testid="libro-cover-edit"><Pencil className="w-4 h-4" /></button>
      <div className="bg-[#fdfbf5] p-1.5 rounded-sm shadow-xl" style={{ width: 168, height: 168 }}>
        {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-[#e9e1cd]"><ImageIcon className="w-10 h-10 text-[#b39a5a]" /></div>}
      </div>
      <h2 className="font-heading text-3xl sm:text-4xl gold-gradient-text mt-7 text-center leading-tight break-words max-w-full" data-testid="libro-cover-title">{bookTitle(a)}</h2>
      {a.bookMeta.subtitle && <p className="font-hand text-2xl text-[#e7eef6] mt-2 text-center" data-testid="libro-cover-subtitle">{a.bookMeta.subtitle}</p>}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1">
        <BrandLogo variant="goldFull" className="h-8 w-auto opacity-90" alt="" />
        <p className="font-ui text-[9px] tracking-[0.25em] uppercase text-[#d4bf75]">{BRAND.editorialCredit}</p>
      </div>
    </div>
  );
}

export function BookBack({ a, onEdit }) {
  const { backText, closing } = a.bookMeta;
  return (
    <div className="book-depth rounded-r-xl rounded-l-sm aspect-[3/4] flex flex-col p-9 relative" style={coverBg} data-testid="libro-back">
      <div className="absolute inset-4 rounded-lg border-2 border-[#d4af37]/55 pointer-events-none" />
      <button className="absolute top-6 right-6 icon-btn bg-[#152438]/80 border border-[#d4af37]/50 z-10" onClick={onEdit} title="Editar contratapa" aria-label="Editar contratapa" data-testid="libro-back-edit"><Pencil className="w-4 h-4" /></button>
      <h3 className="font-heading text-3xl gold-gradient-text text-center mt-6 break-words" data-testid="libro-back-title">{bookTitle(a)}</h3>
      <div className="w-16 h-px bg-[#d4af37]/70 mx-auto my-5" />
      <div className="flex-1 overflow-y-auto fancy-scroll">
        {backText ? (
          <p className="font-heading text-lg leading-relaxed text-[#e7eef6] whitespace-pre-wrap text-center" data-testid="libro-back-text">{backText}</p>
        ) : (
          <p className="font-heading italic text-base leading-relaxed text-[#a9bacb] text-center" data-testid="libro-back-placeholder">
            Ejemplo orientativo (no se imprime): «Este libro reúne fotos, palabras y momentos de una vida querida…». Tocá el lápiz para escribir tu propia reseña.
          </p>
        )}
        {closing && <p className="font-hand text-2xl text-[#fde68a] text-center mt-5" data-testid="libro-back-closing">{closing}</p>}
      </div>
      <div className="flex flex-col items-center gap-1 mt-4">
        <BrandLogo variant="goldHorizontal" className="h-7 w-auto" alt="" />
        <p className="font-ui text-[9px] tracking-[0.25em] uppercase text-[#d4bf75]">{BRAND.editorialCredit}</p>
      </div>
    </div>
  );
}
