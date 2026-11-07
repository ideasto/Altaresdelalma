import React, { useState } from "react";

export default function WritingIdeas({ onChoose, letter = false }) {
  const [open, setOpen] = useState(false);
  const ideas = letter
    ? ["Hoy quería contarte…", "Una escena que recuerdo…", "Algo que no sé cómo nombrar…"]
    : ["Una frase que quiero conservar…", "Aquel día…", "Un recuerdo pequeño de todos los días…"];
  return <div className="my-4" data-testid="writing-ideas">
    <button type="button" className="gold-text underline text-sm" aria-expanded={open} onClick={() => setOpen(v => !v)}>Una idea para empezar</button>
    {open && <div className="glass rounded-xl p-4 mt-2">
      <p className="text-sm text-[#d5dfea] mb-3">Elegí una frase si hoy te sirve. Se agrega al final de tu texto; podés cambiarla o borrarla. No hace falta terminar ni seguir un orden.</p>
      <div className="flex flex-wrap gap-2">{ideas.map(idea => <button type="button" key={idea} className="ghost-gold rounded-xl px-3 py-2 text-sm text-left" onClick={() => { onChoose(idea); setOpen(false); }}>{idea}</button>)}</div>
    </div>}
  </div>;
}
