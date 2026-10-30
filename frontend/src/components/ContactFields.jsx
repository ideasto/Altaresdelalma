import React from "react";
import { Link } from "react-router-dom";
import { Field, TextInput } from "./common";
import { CONTACT, BRAND } from "../config/brand";

// Campos de registro (tu nombre, tu email, aceptación explícita no premarcada).
export default function ContactFields({ value, onChange, showConsent = true }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <div className="rounded-2xl border border-[#d4af37]/25 bg-[#152438]/40 p-4 mt-2" data-testid="contact-fields">
      <p className="font-ui text-xs uppercase tracking-wider gold-text mb-3">Tus datos</p>
      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Tu nombre">
          <TextInput value={value.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" maxLength={80} data-testid="contact-name-input" />
        </Field>
        <Field label="Tu email">
          <TextInput type="email" value={value.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" maxLength={120} data-testid="contact-email-input" />
        </Field>
      </div>
      <p className="text-[#d5dfea] text-sm leading-relaxed mb-3">
        {BRAND.brandName} va a usar tu email para enviarte novedades, propuestas y otras herramientas del proyecto. No se envían tus cartas, fotos ni el nombre de tu ser amado.
      </p>
      {showConsent && (
        <label className="flex items-start gap-3 cursor-pointer" data-testid="contact-consent-label">
          <input
            type="checkbox"
            checked={!!value.accepted}
            onChange={(e) => set("accepted", e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#d4af37] shrink-0"
            data-testid="contact-consent-checkbox"
          />
          <span className="text-sm text-[#d5dfea] leading-relaxed">
            {CONTACT.consentText}{" "}
            <Link to="/terminos" target="_blank" className="gold-text underline">Términos</Link> ·{" "}
            <Link to="/privacidad" target="_blank" className="gold-text underline">Privacidad</Link>
          </span>
        </label>
      )}
    </div>
  );
}
