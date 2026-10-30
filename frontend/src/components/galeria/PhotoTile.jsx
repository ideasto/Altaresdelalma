import React from "react";
import { TrashButton } from "../common";
import { FolderInput, MessageSquareText, Check } from "lucide-react";

export default function PhotoTile({ p, folderName, selected, onToggle, onOpen, onMove, onCaption, onDelete }) {
  return (
    <figure className={`mb-4 break-inside-avoid rounded-xl overflow-hidden glass ${selected ? "ring-2 ring-[#d4af37]" : ""}`} data-testid={`galeria-photo-${p.id}`}>
      <div className="relative bg-[#fdfbf5] p-1.5">
        <button className="block w-full" onClick={onOpen} aria-label="Ampliar foto" data-testid={`galeria-open-${p.id}`}>
          <img src={p.src} alt={p.caption || ""} className="w-full rounded-sm" />
        </button>
        <button
          onClick={onToggle}
          role="checkbox"
          aria-checked={selected}
          aria-label="Seleccionar"
          className={`absolute top-3 left-3 w-7 h-7 rounded-full border-2 flex items-center justify-center ${selected ? "bg-[#d4af37] border-[#d4af37] text-[#152438]" : "bg-[#152438]/60 border-white/80 text-transparent"}`}
          data-testid={`galeria-select-${p.id}`}
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
      <figcaption className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          {p.caption && <p className="text-sm text-[#f8fafc] truncate" data-testid={`galeria-caption-${p.id}`}>{p.caption}</p>}
          {folderName && <p className="text-[10px] gold-text truncate">{folderName}</p>}
        </div>
        <div className="flex shrink-0">
          <button className="icon-btn" onClick={onCaption} title="Pie de foto" aria-label="Pie de foto" data-testid={`galeria-caption-edit-${p.id}`}><MessageSquareText className="w-4 h-4" /></button>
          <button className="icon-btn" onClick={onMove} title="Mover a carpeta" aria-label="Mover a carpeta" data-testid={`galeria-move-${p.id}`}><FolderInput className="w-4 h-4" /></button>
          <TrashButton onClick={onDelete} testId={`galeria-delete-${p.id}`} />
        </div>
      </figcaption>
    </figure>
  );
}
