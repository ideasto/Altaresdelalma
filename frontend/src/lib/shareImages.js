import { BRAND } from "../config/brand";
import { DECK_FRAME_URL } from "./deckFrame";

// Social images are composed separately from the UI: no buttons, hidden fields,
// personal contact data or clipped scrolling areas are captured.
export function wrapShareText(ctx, text, width) {
  const result = [];
  const segments = typeof Intl.Segmenter === "function" ? new Intl.Segmenter("es", { granularity: "grapheme" }) : null;
  for (const paragraph of String(text || "").replace(/\r\n?/g, "\n").split("\n")) {
    if (!paragraph) { result.push(""); continue; }
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (line && ctx.measureText(`${line} ${word}`).width > width) { result.push(line); line = ""; }
      const chars = segments ? [...segments.segment(word)].map(s => s.segment) : Array.from(word);
      for (const char of chars) {
        if (ctx.measureText(line + char).width > width && line) { result.push(line); line = ""; }
        line += char;
      }
      // Keep word spaces without making long words overflow.
      line += " ";
    }
    result.push(line.trimEnd());
  }
  return result;
}

function loadPhoto(src) {
  return new Promise((resolve, reject) => {
    if (!src?.startsWith("data:image/")) return reject(new Error("No se pudo leer la foto guardada."));
    const image = new Image();
    const timer = setTimeout(() => reject(new Error("La foto tardó demasiado en abrirse.")), 12000);
    image.onload = () => { clearTimeout(timer); resolve(image); };
    image.onerror = () => { clearTimeout(timer); reject(new Error("No se pudo preparar una foto. No se exportó una imagen incompleta.")); };
    image.src = src;
  });
}

export async function prepareShareImages(items, signal) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Este navegador no permite preparar imágenes.");
  const files = [];
  try {
    for (const item of items) {
      if (signal?.aborted) throw new DOMException("Preparación cancelada", "AbortError");
      canvas.width = 1080; canvas.height = 1350;
      if (item.kind === "photo") {
        await loadPhoto(item.photo);
        const blob = await (await fetch(item.photo)).blob();
        const extension = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
        files.push(new File([blob], `foto-${files.length + 1}.${extension}`, { type: blob.type }));
        continue;
      }
      if (item.kind === "card") {
        ctx.font = 'italic 56px "Cormorant Garamond", Georgia, serif';
        const message = wrapShareText(ctx, item.text, 820);
        ctx.font = 'bold 44px "Cormorant Garamond", Georgia, serif';
        const name = wrapShareText(ctx, item.title, 820);
        if (message.length * 74 + name.length * 58 < 1020) {
          const frame = await loadPhoto(DECK_FRAME_URL);
          canvas.height = 1543;
          ctx.drawImage(frame, 0, 0, 1080, 1543);
          ctx.fillStyle = "#2b2114"; ctx.textAlign = "center";
          ctx.font = 'italic 56px "Cormorant Garamond", Georgia, serif';
          let y = Math.max(230, (1450 - message.length * 74 - name.length * 58 - 60) / 2);
          message.forEach(line => { ctx.fillText(line, 540, y); y += 74; });
          y += 60; ctx.font = 'bold 44px "Cormorant Garamond", Georgia, serif';
          name.forEach(line => { ctx.fillText(line, 540, y); y += 58; });
          ctx.fillStyle = "#806d47"; ctx.font = '24px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(BRAND.brandName, 540, 1420); ctx.textAlign = "left";
          const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("No se pudo crear la imagen.")), "image/png"));
          files.push(new File([blob], `carta-${files.length + 1}.png`, { type: "image/png" }));
          continue;
        }
      }
      const photo = item.photo ? await loadPhoto(item.photo) : null;
      ctx.font = 'bold 52px "Cormorant Garamond", Georgia, serif';
      const heading = wrapShareText(ctx, item.title, 880);
      ctx.font = '32px "Plus Jakarta Sans", sans-serif';
      const subtitle = wrapShareText(ctx, item.subtitle, 880).filter(Boolean);
      ctx.font = item.handwritten ? '46px Caveat, cursive' : '40px "Cormorant Garamond", Georgia, serif';
      const body = wrapShareText(ctx, item.text, 880);
      const lineHeight = item.handwritten ? 60 : 54;
      // Content is paginated at a fixed readable size, never shrunk or cropped.
      let hi = 0, si = 0, bi = 0, photoDone = !photo, part = 0;
      do {
        if (signal?.aborted) throw new DOMException("Preparación cancelada", "AbortError");
        ctx.fillStyle = "#fdfbf5"; ctx.fillRect(0, 0, 1080, 1350);
        ctx.strokeStyle = "#bc963d"; ctx.lineWidth = 3; ctx.strokeRect(36, 36, 1008, 1278);
        ctx.lineWidth = 1; ctx.strokeRect(48, 48, 984, 1254);
        const contentHeight = heading.length * 64 + subtitle.length * 46 + (photo ? 376 : 0) + body.length * lineHeight + 28;
        let y = part === 0 && contentHeight < 950 ? Math.max(120, (1250 - contentHeight) / 2) : 120;
        ctx.fillStyle = "#244966"; ctx.font = 'bold 52px "Cormorant Garamond", Georgia, serif';
        while (hi < heading.length && y + 64 < 1200) { ctx.fillText(heading[hi++], 100, y); y += 64; }
        ctx.fillStyle = "#69583c"; ctx.font = '32px "Plus Jakarta Sans", sans-serif';
        while (hi === heading.length && si < subtitle.length && y + 46 < 1200) { ctx.fillText(subtitle[si++], 100, y); y += 46; }
        y += 28;
        if (hi === heading.length && si === subtitle.length && !photoDone && y + 340 < 1200) {
          const ratio = Math.min(880 / photo.naturalWidth, 340 / photo.naturalHeight);
          const w = photo.naturalWidth * ratio, h = photo.naturalHeight * ratio;
          ctx.drawImage(photo, (1080 - w) / 2, y, w, h); y += h + 36; photoDone = true;
        }
        ctx.fillStyle = "#2b2114";
        ctx.font = item.handwritten ? '46px Caveat, cursive' : '40px "Cormorant Garamond", Georgia, serif';
        while (hi === heading.length && si === subtitle.length && photoDone && bi < body.length && y + lineHeight < 1210) {
          ctx.fillText(body[bi++], 100, y); y += lineHeight;
        }
        ctx.fillStyle = "#806d47"; ctx.font = '22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(BRAND.brandName, 100, 1275);
        ctx.textAlign = "right"; ctx.fillText(String(++part), 980, 1275); ctx.textAlign = "left";
        const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("No se pudo crear la imagen.")), "image/png"));
        files.push(new File([blob], `recuerdo-${files.length + 1}.png`, { type: "image/png" }));
      } while (hi < heading.length || si < subtitle.length || !photoDone || bi < body.length);
    }
    return files;
  } finally { canvas.width = 1; canvas.height = 1; }
}
