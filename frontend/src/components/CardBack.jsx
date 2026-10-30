import React from "react";
import { BrandLogo } from "./Logo";

// Dorso ilustrado de las cartas del mazo, con el logo oficial.
export default function CardBack({ className = "", logo = true }) {
  return (
    <div
      className={`w-full h-full rounded-xl flex items-center justify-center relative overflow-hidden ${className}`}
      style={{ background: "linear-gradient(160deg, hsl(205 42% 30%), hsl(214 46% 17%))", border: "1px solid hsl(46 65% 52% / 0.6)" }}
    >
      <div className="absolute inset-2 rounded-lg border border-[#d4af37]/45" />
      <div className="absolute inset-[13px] rounded-md border border-[#d4af37]/20" />
      {logo && <BrandLogo variant="goldFull" className="relative z-10 w-[58%] h-auto opacity-95" alt="" />}
    </div>
  );
}
