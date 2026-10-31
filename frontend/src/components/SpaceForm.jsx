import React, { useEffect, useState } from "react";
import { Modal, Field, TextInput, GoldButton, GhostButton } from "./common";
import { SymbolPicker } from "./Symbols";
import ContactFields from "./ContactFields";
import { getContact, saveContact, syncContact, validEmail } from "../lib/contact";
import { toast } from "sonner";

const empty = { name: "", symbol: "", birth: "", passing: "" };

// Crear / editar un espacio. Al crear el primero pide tus datos (obligatorios).
export default function SpaceForm({ open, onClose, editing, onCreate, onUpdate }) {
  const [form, setForm] = useState(empty);
  const [contact, setContact] = useState({ name: "", email: "", accepted: false });
  const [known, setKnown] = useState(null);
  const [fixing, setFixing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(editing ? { name: editing.name, symbol: editing.symbol, birth: editing.birth, passing: editing.passing } : empty);
    const c = getContact();
    setKnown(c && c.consent ? c : null);
    setContact({ name: c?.name || "", email: c?.email || "", accepted: !!c?.consent });
    setFixing(false);
  }, [open, editing]);

  const needContact = !editing && (!known || fixing);

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Escribí el nombre de tu ser amado.");
    if (needContact) {
      if (!contact.name.trim()) return toast.error("Escribí tu nombre.");
      if (!validEmail(contact.email)) return toast.error("Revisá tu email, parece incompleto.");
      if (!contact.accepted) return toast.error("Para crear el espacio necesitamos tu aceptación explícita.");
    }
    const data = { ...form, name: form.name.trim() };
    const ok = editing ? await onUpdate(data) : await onCreate(data);
    if (!ok) return;
    if (needContact) {
      if (!saveContact(contact)) toast.error("Tus datos no se pudieron guardar en este navegador.", { description: "Podés cargarlos después desde «Tus datos»." });
      syncContact();
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Editar espacio" : "Crear un espacio"} maxWidth="max-w-xl" testId="space-form-modal">
      <Field label="Nombre del ser amado">
        <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Papá Jorge" maxLength={60} data-testid="space-name-input" />
      </Field>
      <Field label="Símbolo (opcional)">
        <SymbolPicker value={form.symbol} onChange={(symbol) => setForm({ ...form, symbol })} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Fecha de nacimiento (opcional)">
          <TextInput type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} data-testid="space-birth-input" />
        </Field>
        <Field label="Fecha de partida (opcional)">
          <TextInput type="date" value={form.passing} onChange={(e) => setForm({ ...form, passing: e.target.value })} data-testid="space-passing-input" />
        </Field>
      </div>
      {!editing && <p className="text-xs text-[#a9bacb] -mt-2 mb-3">La foto la podés agregar después de crear el espacio.</p>}

      {!editing && known && !fixing && (
        <p className="text-sm text-[#a9bacb] mb-3" data-testid="contact-known">
          Te registraste como <span className="text-[#f8fafc]">{known.name}</span> ({known.email}).{" "}
          <button className="gold-text underline" onClick={() => setFixing(true)} data-testid="contact-fix">Corregir</button>
        </p>
      )}
      {needContact && <ContactFields value={contact} onChange={setContact} />}

      <div className="flex justify-end gap-3 mt-5">
        <GhostButton onClick={onClose} testId="space-form-cancel">Cancelar</GhostButton>
        <GoldButton onClick={submit} testId="space-form-save">{editing ? "Guardar" : "Crear el espacio"}</GoldButton>
      </div>
    </Modal>
  );
}
