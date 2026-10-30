import { CONTACT, FEATURES } from "../config/brand";

// Registro de contacto/marketing: separado de los recuerdos y de cualquier lógica Pro.
const KEY = "altares_contact_v1";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validEmail = (e) => EMAIL_RE.test(String(e || "").trim());

export function getContact() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeContact(c) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
    return true;
  } catch {
    return false;
  }
}

const fingerprint = (c) => `${c.email.trim().toLowerCase()}|${c.name.trim()}|${c.unsubscribeRequested ? "baja" : "alta"}`;

export function saveContact({ name, email, accepted }) {
  const prev = getContact();
  const now = new Date().toISOString();
  const c = {
    ...(prev || {}),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    consent: accepted
      ? prev?.consent && prev.email === email.trim().toLowerCase()
        ? prev.consent
        : { acceptedAt: now, version: CONTACT.consentVersion, scope: CONTACT.consentScope, text: CONTACT.consentText }
      : prev?.consent || null,
    updatedAt: now,
  };
  const fp = fingerprint(c);
  if (c.sentFingerprint !== fp) {
    c.status = "pending";
    c.attempts = 0;
    c.nextAttemptAt = 0;
  }
  writeContact(c);
  return c;
}

export function requestUnsubscribe() {
  const c = getContact();
  if (!c) return null;
  c.unsubscribeRequested = { at: new Date().toISOString() };
  c.status = "pending";
  c.attempts = 0;
  c.nextAttemptAt = 0;
  writeContact(c);
  return c;
}

// Evita fórmulas en Google Sheets.
const safeCell = (v) => {
  const s = String(v || "").replace(/[\u0000-\u001f]/g, " ").slice(0, 200);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
};

let inFlight = false;

export async function syncContact() {
  if (!FEATURES.contactCapture || inFlight) return getContact();
  const c = getContact();
  if (!c || c.status === "sent" || !c.consent) return c;
  if (!CONTACT.endpoint) {
    if (c.status !== "pending-no-endpoint") writeContact({ ...c, status: "pending-no-endpoint" });
    return getContact();
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) return c;
  if (c.nextAttemptAt && Date.now() < c.nextAttemptAt) return c;
  inFlight = true;
  try {
    const body = {
      action: c.unsubscribeRequested ? "unsubscribe" : "subscribe",
      name: safeCell(c.name),
      email: safeCell(c.email),
      consentAt: c.consent.acceptedAt,
      consentVersion: c.consent.version,
      consentScope: c.consent.scope,
      source: "altares-del-alma",
    };
    const res = await fetch(CONTACT.endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json && json.ok === true) {
      writeContact({ ...c, status: "sent", sentAt: new Date().toISOString(), sentFingerprint: fingerprint(c), attempts: 0, nextAttemptAt: 0 });
    } else throw new Error("respuesta inválida");
  } catch {
    const attempts = (c.attempts || 0) + 1;
    const wait = Math.min(30000 * 2 ** attempts, 6 * 3600 * 1000);
    writeContact({ ...c, status: "pending", attempts, nextAttemptAt: Date.now() + wait });
  } finally {
    inFlight = false;
  }
  return getContact();
}

export function contactStatusLabel(c) {
  if (!c) return "Sin registrar";
  if (c.status === "sent") return "Contacto confirmado por la planilla";
  if (c.status === "pending-no-endpoint" || !CONTACT.endpoint) return "Guardado en este navegador · pendiente (todavía no hay planilla conectada)";
  return "Guardado en este navegador · pendiente de envío (se reintenta solo)";
}
