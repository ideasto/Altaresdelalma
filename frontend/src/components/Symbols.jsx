import React from "react";

// Símbolos opcionales (SVG propios, no emojis). No clasifican ni cambian funciones.
const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

const SHAPES = {
  paw: (
    <g {...P}>
      <ellipse cx="12" cy="16" rx="4.2" ry="3.4" />
      <circle cx="6.5" cy="10.5" r="1.7" /><circle cx="9.8" cy="6.8" r="1.7" />
      <circle cx="14.2" cy="6.8" r="1.7" /><circle cx="17.5" cy="10.5" r="1.7" />
    </g>
  ),
  heart: <path {...P} d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  star: <path {...P} d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />,
  person: <g {...P}><circle cx="12" cy="7.5" r="3.5" /><path d="M5 20c.8-4 3.6-6.2 7-6.2s6.2 2.2 7 6.2" /></g>,
  moon: <path {...P} d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />,
  flower: (
    <g {...P}>
      <circle cx="12" cy="10" r="2" />
      <path d="M12 8c0-3 3-3 3-1s-1 3-3 3M14 10c3 0 3 3 1 3s-3-1-3-3M12 12c0 3-3 3-3 1s1-3 3-3M10 10c-3 0-3-3-1-3s3 1 3 3" />
      <path d="M12 12v8M12 17c-2-1-3.5-1-4.5 0" />
    </g>
  ),
  feather: <g {...P}><path d="M19 4C11 5 6 11 6 18l1 1c7 0 12-5 13-13z" /><path d="M6 19l7-8" /></g>,
};

export const SYMBOL_OPTIONS = [
  { key: "", label: "Ninguno" },
  { key: "heart", label: "Corazón" },
  { key: "star", label: "Estrella" },
  { key: "paw", label: "Huellita" },
  { key: "person", label: "Figura" },
  { key: "moon", label: "Luna" },
  { key: "flower", label: "Flor" },
  { key: "feather", label: "Pluma" },
];

export function SpaceSymbol({ symbol, className = "w-5 h-5" }) {
  const shape = SHAPES[symbol] || SHAPES.heart;
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{shape}</svg>;
}

export function SymbolPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2" role="radiogroup" aria-label="Símbolo opcional">
      {SYMBOL_OPTIONS.map((o) => (
        <button
          key={o.key || "none"}
          type="button"
          role="radio"
          aria-checked={value === o.key}
          title={o.label}
          onClick={() => onChange(o.key)}
          data-testid={`symbol-${o.key || "none"}`}
          className={`selectable rounded-xl border px-2 py-2.5 flex flex-col items-center gap-1 text-[11px] ${value === o.key ? "border-[#d4af37] bg-[#d4af37]/12 gold-text" : "border-[#d4af37]/25 text-[#a9bacb]"}`}
        >
          {o.key ? <SpaceSymbol symbol={o.key} className="w-5 h-5" /> : <span className="w-5 h-5 rounded-full border border-dashed border-current" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
