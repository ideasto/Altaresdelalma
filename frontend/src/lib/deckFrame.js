// Geometría editorial discreta: márgenes generosos y facetas en las esquinas.
// La misma imagen se usa en pantalla y en los frentes del PDF.
export const DECK_FRAME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 630 900" width="630" height="900">
  <rect width="630" height="900" fill="#fbf8f0"/>
  <g fill="none" stroke="#a88740">
    <path d="M32 110 V32 H110 M520 32 H598 V110 M598 790 V868 H520 M110 868 H32 V790" stroke-width="3"/>
    <path d="M48 105 V48 H105 M525 48 H582 V105 M582 795 V852 H525 M105 852 H48 V795" stroke-width="1.4" opacity=".65"/>
    <path d="M315 45 l11 11 -11 11 -11 -11 Z M315 833 l11 11 -11 11 -11 -11 Z" stroke-width="1.5"/>
  </g>
</svg>`;
export const DECK_FRAME_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(DECK_FRAME_SVG)}`;
