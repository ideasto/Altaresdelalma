import React from "react";
import { SpaceSymbol } from "./Symbols";

// Foto circular fija (sin flotación) con borde dorado fino.
export default function SpacePhoto({ space, size = 150, interactive = false, onClick, testId }) {
  const Tag = interactive ? "button" : "div";
  return (
    <Tag
      type={interactive ? "button" : undefined}
      onClick={onClick}
      data-testid={testId}
      aria-label={interactive ? "Editar foto" : undefined}
      className={`relative rounded-full overflow-hidden flex items-center justify-center bg-[#1d3349] shrink-0 ${interactive ? "selectable cursor-pointer" : ""}`}
      style={{ width: size, height: size, border: "1.5px solid hsl(46 65% 52% / 0.85)", boxShadow: "0 0 18px hsl(46 80% 65% / 0.18)" }}
    >
      {space.photoCropped ? (
        <img src={space.photoCropped} alt={space.name} className="w-full h-full object-cover" />
      ) : (
        <span className="gold-text opacity-70 flex items-center justify-center" style={{ width: size * 0.36, height: size * 0.36 }}><SpaceSymbol symbol={space.symbol} className="w-full h-full" /></span>
      )}
    </Tag>
  );
}

export function yearsOf(a) {
  const y = (d) => (d ? d.slice(0, 4) : "");
  const b = y(a.birth), p = y(a.passing);
  if (b && p) return `${b} – ${p}`;
  return b || p || "";
}
