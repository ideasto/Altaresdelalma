import React from "react";
import { Modal, GoldButton } from "./common";
import { BrandLogo } from "./Logo";
import { BRAND } from "../config/brand";

const KEY = "altares_welcome_seen";
export const welcomeSeen = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return true; } };
const markSeen = () => { try { localStorage.setItem(KEY, "1"); } catch { /* noop */ } };

export const PROMPTS = [
  "Una frase que decía seguido.",
  "Algo que te hacía reír.",
  "Un lugar que era de ustedes.",
  "Algo que dejó en vos.",
  "Lo que le contarías hoy.",
];

export default function Welcome({ open, onClose }) {
  const close = () => { markSeen(); onClose(); };
  return (
    <Modal open={open} onClose={close} title={`Bienvenida a ${BRAND.appName}`} maxWidth="max-w-lg" testId="welcome-modal">
      <div className="flex justify-center mb-4"><BrandLogo variant="goldFull" className="h-24 w-auto" /></div>
      <p className="text-[#d5dfea] leading-relaxed mb-3">
        Un lugar para alojar el amor y los recuerdos de quienes querés: escribir, guardar fotos, armar su historia, crear un mazo propio y un libro para imprimir.
      </p>
      <p className="text-[#a9bacb] text-sm leading-relaxed mb-4">
        Cabe todo: ternura, nostalgia, humor, tristeza o todo junto. No hay tareas ni orden obligatorio. Tus recuerdos se guardan solo en este navegador; descargá un respaldo cada tanto.
      </p>
      <p className="font-ui text-xs uppercase tracking-wider text-[#a9bacb] mb-2">Si querés una idea para empezar</p>
      <ul className="mb-6 space-y-1" data-testid="welcome-prompts">
        {PROMPTS.map((p) => <li key={p} className="font-hand text-xl text-[#f8fafc]">· {p}</li>)}
      </ul>
      <div className="flex justify-end gap-3">
        <button className="text-sm text-[#a9bacb] hover:text-white px-3" onClick={close} data-testid="welcome-skip">Saltear</button>
        <GoldButton onClick={close} testId="welcome-start">Empezar</GoldButton>
      </div>
      <p className="text-[11px] text-[#7f93a8] mt-4">Podés volver a ver esto desde «Ayuda».</p>
    </Modal>
  );
}
