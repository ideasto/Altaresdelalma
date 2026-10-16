import React from "react";

// Geometric gold line-art cat — brand mark for "La Gata y la Magia"
export function CatLogo({ size = 40, className = "", strokeWidth = 1.6 }) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* ears */}
      <path d="M31 50 L35 16 L52 40" />
      <path d="M69 50 L65 16 L48 40" />
      {/* head */}
      <path d="M31 50 L35 72 L50 82 L65 72 L69 50" />
      <path d="M35 72 L50 63 L65 72" />
      {/* third-eye diamond */}
      <path d="M50 44 L54 50 L50 56 L46 50 Z" />
      {/* whisker hints */}
      <path d="M44 62 L40 60 M56 62 L60 60" opacity="0.7" />
      {/* body */}
      <path d="M38 74 L29 112 L50 119 L71 112 L62 74" />
      <path d="M50 82 L50 119" opacity="0.6" />
      <path d="M38 74 L50 97 L62 74" opacity="0.6" />
      {/* tail */}
      <path d="M71 112 C93 110 91 84 76 88" />
    </svg>
  );
}

// Circular foil seal used at the end of the Memory Book
export function CatSeal({ size = 120, className = "" }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "9999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#b8922c",
        border: "2px solid rgba(184,146,44,0.7)",
        boxShadow: "0 0 0 4px rgba(184,146,44,0.12), inset 0 0 18px rgba(184,146,44,0.15)",
        background: "radial-gradient(circle at 35% 30%, #f4e4b0, #d4af37 60%, #a67c20)",
      }}
    >
      <div style={{ color: "#5a4410" }}>
        <CatLogo size={size * 0.44} strokeWidth={2} />
      </div>
    </div>
  );
}

export function BrandLockup({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="gold-text float-soft">
        <CatLogo size={compact ? 30 : 38} />
      </span>
      <div className="leading-tight">
        <div className="font-heading gold-gradient-text text-lg sm:text-xl tracking-wide">
          La Gata y la Magia
        </div>
        <div className="font-ui text-[10px] sm:text-xs text-[#94a3b8] tracking-[0.25em] uppercase">
          Mensajes Ancestrales
        </div>
      </div>
    </div>
  );
}
