// SVG de los símbolos (mismos trazos que los íconos de pantalla), para rasterizar en PDF.
export const SYMBOL_PATHS = {
  paw: '<ellipse cx="12" cy="16" rx="4.2" ry="3.4"/><circle cx="6.5" cy="10.5" r="1.7"/><circle cx="9.8" cy="6.8" r="1.7"/><circle cx="14.2" cy="6.8" r="1.7"/><circle cx="17.5" cy="10.5" r="1.7"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
  person: '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 20c.8-4 3.6-6.2 7-6.2s6.2 2.2 7 6.2"/>',
  moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
  flower: '<circle cx="12" cy="10" r="2"/><path d="M12 8c0-3 3-3 3-1s-1 3-3 3M14 10c3 0 3 3 1 3s-3-1-3-3M12 12c0 3-3 3-3 1s1-3 3-3M10 10c-3 0-3-3-1-3s3 1 3 3"/><path d="M12 12v8M12 17c-2-1-3.5-1-4.5 0"/>',
  feather: '<path d="M19 4C11 5 6 11 6 18l1 1c7 0 12-5 13-13z"/><path d="M6 19l7-8"/>',
};

export function symbolSvg(key, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96"><g fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${SYMBOL_PATHS[key] || SYMBOL_PATHS.star}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
