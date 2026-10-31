// Configuración central de marca, enlaces e interruptores.
export const BRAND = {
  appName: "Ecos del Alma",
  formerAppName: "Mensajes Ancestrales",
  formerNames: ["Mensajes Ancestrales", "Altares del Alma"],
  brandName: "La Gata y la Magia",
  editorialCredit: "Editado por La Gata y la Magia",
  email: "lagataylamagia@gmail.com",
  instagram: "lagataylamagia",
  instagramUrl: "https://www.instagram.com/lagataylamagia",
  // PENDIENTE: completar la URL pública definitiva antes de publicar.
  appUrl: "",
  logos: {
    goldFull: "/brand/logo-gold-full.png",
    goldHorizontal: "/brand/logo-gold-horizontal.png",
    whiteFull: "/brand/logo-white-full.png",
    whiteHorizontal: "/brand/logo-white-horizontal.png",
  },
};

export const FEATURES = {
  payments: false,
  ads: false,
  contactCapture: true,
};

export const CONTACT = {
  // Vacío = los contactos quedan pendientes en el navegador (no llegan a ninguna planilla).
  endpoint: process.env.REACT_APP_CONTACT_ENDPOINT || "",
  consentVersion: "2026-06-v1",
  consentScope: "novedades, propuestas y otras herramientas de La Gata y la Magia por email",
  consentText:
    "Acepto que La Gata y la Magia use mi nombre y email para enviarme novedades, propuestas y otras herramientas del proyecto. Puedo pedir la baja cuando quiera.",
};

// Límites técnicos de seguridad/capacidad (no comerciales).
export const LIMITS = {
  oracleCards: 21,
  letters: 100,
  photos: 300,
  folders: 5,
  approxStorageChars: 5 * 1024 * 1024,
};

// Propuesta comercial futura (NO aplicada mientras payments=false).
export const COMMERCIAL_PROPOSAL = { letters: 30, bookPages: 15, timelineEvents: 20 };
