// Marco del mazo: RECREACIÓN PROVISIONAL del marco aprobado (esquinas doradas con filigrana).
// No es el archivo original: reemplazar por el recurso original cuando esté disponible.
const corner = `
  <path d="M28 120 C28 70 40 40 70 30 C95 22 120 28 128 46" />
  <path d="M40 112 C42 78 52 56 76 48 C94 42 108 46 112 58" />
  <path d="M128 46 C134 60 124 72 112 66 C104 62 106 52 114 52" />
  <path d="M28 120 C20 104 34 92 44 100 C50 106 44 114 38 110" />
  <path d="M70 30 C66 16 80 10 88 18" />
  <path d="M30 70 C16 66 12 80 20 88" />
  <circle cx="56" cy="56" r="4" />`;

export const DECK_FRAME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 630 900" width="630" height="900">
  <rect x="0" y="0" width="630" height="900" rx="30" fill="#fbf8f0"/>
  <g fill="none" stroke="#b8933a" stroke-linecap="round">
    <rect x="22" y="22" width="586" height="856" rx="18" stroke-width="3"/>
    <rect x="34" y="34" width="562" height="832" rx="12" stroke-width="1.2"/>
    <g stroke-width="2.6" id="c">${corner}</g>
    <g stroke-width="2.6" transform="translate(630 0) scale(-1 1)">${corner}</g>
    <g stroke-width="2.6" transform="translate(0 900) scale(1 -1)">${corner}</g>
    <g stroke-width="2.6" transform="translate(630 900) scale(-1 -1)">${corner}</g>
  </g>
</svg>`;

export const DECK_FRAME_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(DECK_FRAME_SVG)}`;
