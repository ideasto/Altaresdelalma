import React, { useLayoutEffect, useRef } from "react";
import { BOOK_FONTS } from "../../lib/format";

// The same sheet is used for reading and writing, without a separate form.
export function WritingArea({ value, className = "", style, ...props }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const field = ref.current;
    if (!field) return;
    const fit = () => { field.style.height = "auto"; field.style.height = `${field.scrollHeight + 2}px`; };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(field);
    return () => observer.disconnect();
  }, [value, className, style?.fontSize]);
  return <textarea ref={ref} value={value} rows={1} style={style} {...props} className={`w-full resize-none overflow-hidden bg-transparent border-0 outline-none ${className}`} />;
}

export default function BookPage({ page, children, onChange }) {
  const font = BOOK_FONTS[page.font] || BOOK_FONTS.serif;
  return <div className="paper-sheet piece-editor book-depth rounded-r-xl rounded-l-sm min-h-[560px] p-7 relative">
    <div className="absolute inset-3 rounded-lg border border-[#c9a94a]/40 pointer-events-none" />
    <div className="relative pt-2">
      {onChange ? <WritingArea aria-label="Título de la página" placeholder="Título de esta página" maxLength={90} value={page.title} onChange={e => onChange({ ...page, title: e.target.value })} style={{ textAlign: "center" }} className="font-heading text-3xl text-center mb-4" data-testid="libro-title-input" /> : page.title && <h3 className="font-heading text-3xl text-center text-[#2b2114] mb-4 break-words">{page.title}</h3>}
      {children || (page.photo && <div className="bg-white p-1.5 shadow mb-4"><img src={page.photo} alt="" className="max-h-56 w-full object-contain" /></div>)}
      {onChange ? <WritingArea aria-label="Texto de la página" placeholder="Aquel día…" value={page.text} onChange={e => onChange({ ...page, text: e.target.value })} className={`${font.css} leading-relaxed min-h-64`} style={{ fontSize: font.px[page.size || "m"] }} data-testid="libro-text-input" /> : page.text && <p className={`${font.css} leading-relaxed text-[#2b2114] whitespace-pre-wrap break-words`} style={{ fontSize: font.px[page.size || "m"] }}>{page.text}</p>}
    </div>
  </div>;
}
