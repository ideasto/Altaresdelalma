import React, { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Toaster } from "sonner";
import { BrandLogo } from "./Logo";
import { BRAND } from "../config/brand";
import { Instagram, Mail, HelpCircle } from "lucide-react";
import Welcome, { welcomeSeen } from "./Welcome";
import StorageGate from "./StorageGate";
import { syncContact } from "../lib/contact";

export default function Layout() {
  const [welcome, setWelcome] = useState(() => !welcomeSeen());

  useEffect(() => {
    syncContact();
    const onOnline = () => syncContact();
    const onHelp = () => setWelcome(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("altares:help", onHelp);
    const t = setInterval(syncContact, 60000);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("altares:help", onHelp); clearInterval(t); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="celestial-bg" />
      <div className="star-field" />

      <main className="flex-1 pb-10">
        <StorageGate>
          <Outlet />
        </StorageGate>
      </main>

      <footer className="border-t border-[#d4af37]/25 glass-strong" data-testid="brand-footer">
        <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo variant="goldHorizontal" className="h-9 w-auto" />
            <span className="text-[#a9bacb] text-xs font-ui hidden md:inline">· {BRAND.appName}</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center text-[#a9bacb] text-sm font-ui">
            <a href={BRAND.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#f8fafc]" data-testid="footer-instagram">
              <Instagram className="w-4 h-4 gold-text" /> {BRAND.instagram}
            </a>
            <a href={`mailto:${BRAND.email}`} className="flex items-center gap-1.5 hover:text-[#f8fafc]" data-testid="footer-email">
              <Mail className="w-4 h-4 gold-text" /> {BRAND.email}
            </a>
            <button onClick={() => setWelcome(true)} className="flex items-center gap-1.5 hover:text-[#f8fafc]" data-testid="footer-help">
              <HelpCircle className="w-4 h-4 gold-text" /> Ayuda
            </button>
            <Link to="/terminos" className="hover:text-[#f8fafc]" data-testid="footer-terms">Términos</Link>
            <Link to="/privacidad" className="hover:text-[#f8fafc]" data-testid="footer-privacy">Privacidad</Link>
          </div>
        </div>
      </footer>

      <Welcome open={welcome} onClose={() => setWelcome(false)} />

      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "rgba(27,46,66,0.96)", border: "1px solid rgba(212,175,55,0.35)", color: "#f8fafc", backdropFilter: "blur(12px)" },
        }}
      />
    </div>
  );
}
