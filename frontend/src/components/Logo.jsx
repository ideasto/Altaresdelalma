import React from "react";
import { BRAND } from "../config/brand";

// Logo oficial de La Gata y la Magia (extraído del PDF de marca).
export function BrandLogo({ variant = "goldFull", className = "", style, alt = BRAND.brandName }) {
  return <img src={BRAND.logos[variant]} alt={alt} className={className} style={style} draggable={false} />;
}

export function BrandLockup({ compact = false }) {
  return (
    <div className="flex items-center gap-3" data-testid="brand-lockup">
      <BrandLogo variant="goldFull" className={compact ? "h-10 w-auto" : "h-14 sm:h-16 w-auto"} alt="" />
      <div className="leading-tight">
        <div className="font-heading gold-gradient-text text-xl sm:text-2xl tracking-wide">{BRAND.appName}</div>
        <div className="font-ui text-[10px] sm:text-xs text-[#a9bacb] tracking-[0.25em] uppercase">{BRAND.brandName}</div>
      </div>
    </div>
  );
}

export function CatSeal({ size = 120, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <BrandLogo variant="goldFull" style={{ maxWidth: "100%", maxHeight: "100%" }} />
    </div>
  );
}
