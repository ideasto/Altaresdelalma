import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { BrandLockup } from "./Logo";
import { Instagram, Mail } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="celestial-bg" />
      <div className="star-field" />

      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <footer
        className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-[#d4af37]/25"
        data-testid="brand-footer"
      >
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <BrandLockup compact />
          <div className="hidden sm:flex items-center gap-5 text-[#94a3b8] text-sm font-ui">
            <span className="flex items-center gap-1.5">
              <Instagram className="w-4 h-4 gold-text" /> lagataylamagia
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 gold-text" /> lagataylamagia@gmail.com
            </span>
          </div>
        </div>
      </footer>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(11,26,47,0.92)",
            border: "1px solid rgba(212,175,55,0.3)",
            color: "#f8fafc",
            backdropFilter: "blur(12px)",
          },
        }}
      />
    </div>
  );
}
