import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BRAND } from "../config/brand";

export const A4 = { w: 794, h: 1123 }; // px at ~96dpi
const FRAME_URL = "/frame-a4.png";
const LOGO_URL = BRAND.logos.goldFull;


export function makeSheet({ title = "", subtitle = "" } = {}) {
  const sheet = document.createElement("div");
  Object.assign(sheet.style, {
    width: A4.w + "px",
    height: A4.h + "px",
    position: "relative",
    background: "#fdfbf7",
    boxSizing: "border-box",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: "#2b2114",
    overflow: "hidden",
  });

  // ornate frame overlay
  const frame = document.createElement("img");
  frame.src = FRAME_URL;
  frame.crossOrigin = "anonymous";
  Object.assign(frame.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    objectFit: "fill",
    pointerEvents: "none",
  });
  sheet.appendChild(frame);

  // header
  const header = document.createElement("div");
  Object.assign(header.style, {
    position: "absolute",
    top: "62px",
    left: "72px",
    right: "72px",
    textAlign: "center",
  });
  header.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;gap:10px;">
      <img src="${LOGO_URL}" style="height:44px;width:auto;" />
      <div style="font-size:26px;letter-spacing:2px;color:#b8922c;font-weight:600;">${BRAND.appName}</div>
    </div>
    <div style="font-size:12px;letter-spacing:5px;text-transform:uppercase;color:#9c8a66;margin-top:2px;">${BRAND.brandName}</div>
    ${title ? `<div style="font-size:34px;color:#2b2114;margin-top:18px;font-weight:600;">${escapeHtml(title)}</div>` : ""}
    ${subtitle ? `<div style="font-size:18px;color:#6b5a3e;font-style:italic;margin-top:2px;">${escapeHtml(subtitle)}</div>` : ""}
    <div style="width:120px;height:1px;background:#c9a94a;margin:14px auto 0;"></div>
  `;
  sheet.appendChild(header);

  const content = document.createElement("div");
  Object.assign(content.style, {
    position: "absolute",
    top: title ? "190px" : "150px",
    left: "80px",
    right: "80px",
    bottom: "80px",
    overflow: "hidden",
  });
  sheet.appendChild(content);

  // footer
  const footer = document.createElement("div");
  Object.assign(footer.style, {
    position: "absolute",
    bottom: "46px",
    left: "72px",
    right: "72px",
    textAlign: "center",
    fontSize: "11px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "#9c8a66",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  });
  footer.textContent = `${BRAND.brandName} · ${BRAND.email} · @${BRAND.instagram}`;
  sheet.appendChild(footer);

  return { sheet, content };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function waitImages(root) {
  const imgs = Array.from(root.querySelectorAll("img"));
  return Promise.all(
    imgs.map(
      (img) =>
        img.complete && img.naturalWidth
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = res;
              img.onerror = res;
            })
    )
  );
}

export async function renderPdf(sheets, filename) {
  const wrap = document.createElement("div");
  Object.assign(wrap.style, { position: "fixed", left: "-10000px", top: "0", zIndex: "-1" });
  sheets.forEach((s) => wrap.appendChild(s));
  document.body.appendChild(wrap);

  await waitImages(wrap);
  await new Promise((r) => setTimeout(r, 120));

  const pdf = new jsPDF("p", "mm", "a4");
  for (let i = 0; i < sheets.length; i++) {
    const canvas = await html2canvas(sheets[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fdfbf7",
      logging: false,
    });
    const img = canvas.toDataURL("image/jpeg", 0.92);
    if (i > 0) pdf.addPage();
    pdf.addImage(img, "JPEG", 0, 0, 210, 297, undefined, "FAST");
  }
  pdf.save(filename);
  wrap.remove();
}

// Capture a live on-screen element (used for the Memory Book, keeping the exact look)
export async function elementToPdf(element, filename, orientation = "p") {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: null, logging: false });
  const img = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF(orientation, "mm", "a4");
  const pw = orientation === "p" ? 210 : 297;
  const ph = orientation === "p" ? 297 : 210;
  const ratio = canvas.height / canvas.width;
  let w = pw - 16;
  let h = w * ratio;
  if (h > ph - 16) { h = ph - 16; w = h / ratio; }
  pdf.addImage(img, "JPEG", (pw - w) / 2, (ph - h) / 2, w, h, undefined, "FAST");
  pdf.save(filename);
}

// Helpers to build common content blocks
export function elImageBox(src, w, h) {
  const box = document.createElement("div");
  Object.assign(box.style, {
    width: w + "px",
    height: h + "px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: "#f0ead9",
    border: "1px solid #d8c9a3",
  });
  const img = document.createElement("img");
  img.src = src;
  img.crossOrigin = "anonymous";
  Object.assign(img.style, { maxWidth: "100%", maxHeight: "100%", objectFit: "cover", width: "100%", height: "100%" });
  box.appendChild(img);
  return box;
}
