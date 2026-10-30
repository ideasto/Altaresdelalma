import React, { useEffect, useState } from "react";
import { Modal, GoldButton, GhostButton } from "./common";
import ContactFields from "./ContactFields";
import { getContact, saveContact, syncContact, validEmail, requestUnsubscribe, contactStatusLabel } from "../lib/contact";
import { BRAND } from "../config/brand";
import { toast } from "sonner";

export default function ContactDialog({ open, onClose }) {
  const [c, setC] = useState(null);
  const [v, setV] = useState({ name: "", email: "", accepted: false });

  useEffect(() => {
    if (!open) return;
    const cur = getContact();
    setC(cur);
    setV({ name: cur?.name || "", email: cur?.email || "", accepted: !!cur?.consent });
  }, [open]);

  const save = async () => {
    if (!v.name.trim() || !validEmail(v.email)) return toast.error("Revisá tu nombre y email.");
    if (!v.accepted) return toast.error("Necesitamos tu aceptación explícita.");
    saveContact(v);
    setC(await syncContact());
    toast.success("Tus datos quedaron guardados en este navegador.");
  };

  const unsubscribe = async () => {
    requestUnsubscribe();
    setC(await syncContact());
    toast.success("Registramos tu pedido de baja.", { description: "Se enviará cuando la planilla esté conectada. También podés escribirnos por email." });
  };

  return (
    <Modal open={open} onClose={onClose} title="Tus datos" maxWidth="max-w-xl" testId="contact-dialog">
      <p className="text-xs text-[#a9bacb] mb-1" data-testid="contact-status">Estado: {contactStatusLabel(c)}</p>
      {c?.consent && <p className="text-xs text-[#7f93a8] mb-2">Aceptado el {new Date(c.consent.acceptedAt).toLocaleString("es-AR")} · texto {c.consent.version}</p>}
      <ContactFields value={v} onChange={setV} />
      <div className="flex flex-wrap justify-between gap-3 mt-5">
        {c && !c.unsubscribeRequested ? (
          <button className="text-sm text-[#a9bacb] underline" onClick={unsubscribe} data-testid="contact-unsubscribe">Pedir la baja de comunicaciones</button>
        ) : c?.unsubscribeRequested ? (
          <span className="text-sm text-[#a9bacb]" data-testid="contact-unsubscribed">Baja solicitada · <a className="gold-text underline" href={`mailto:${BRAND.email}?subject=Baja`}>escribir por email</a></span>
        ) : <span />}
        <div className="flex gap-3">
          <GhostButton onClick={onClose} testId="contact-close">Cerrar</GhostButton>
          <GoldButton onClick={save} testId="contact-save">Guardar</GoldButton>
        </div>
      </div>
    </Modal>
  );
}
