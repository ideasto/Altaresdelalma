import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { BrandLockup } from "../components/Logo";
import { Modal, ConfirmDialog, GoldButton, GhostButton, EditPencil, TrashButton, Field, TextInput, Plus } from "../components/common";
import PhotoEditor from "../components/PhotoEditor";
import { exportBackup, parseBackup } from "../lib/storage";
import { toast } from "sonner";
import { Download, Upload, Cat, Dog, User, ArrowRight, Pencil } from "lucide-react";

function KindIcon({ kind, className }) {
  if (kind === "animal") return <Cat className={className} strokeWidth={1.4} />;
  return <User className={className} strokeWidth={1.4} />;
}

function AvatarPhoto({ avatar, size = 150 }) {
  return (
    <div
      className="relative rounded-full mx-auto overflow-hidden flex items-center justify-center bg-[#0b1a2f]"
      style={{
        width: size,
        height: size,
        border: "2px solid rgba(212,175,55,0.7)",
        boxShadow: "0 0 24px rgba(212,175,55,0.25)",
      }}
    >
      {avatar.photoCropped ? (
        <img src={avatar.photoCropped} alt={avatar.name} className="w-full h-full object-cover" />
      ) : (
        <span className="gold-text opacity-60">
          <KindIcon kind={avatar.kind} className="w-14 h-14" />
        </span>
      )}
    </div>
  );
}

export default function Home() {
  const { avatars, createAvatar, updateAvatar, deleteAvatar, replaceAll } = useStore();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", kind: "persona", birth: "", passing: "" });
  const [photoFor, setPhotoFor] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", kind: "persona", birth: "", passing: "" });
    setFormOpen(true);
  };
  const openEdit = (a) => {
    setEditing(a);
    setForm({ name: a.name, kind: a.kind, birth: a.birth, passing: a.passing });
    setFormOpen(true);
  };

  const saveForm = () => {
    if (!form.name.trim()) return toast.error("Poné un nombre para honrar su memoria.");
    if (editing) {
      updateAvatar(editing.id, { ...form });
      toast.success("Recuerdo actualizado.");
    } else {
      const a = createAvatar({ ...form });
      toast.success(`Creaste el espacio de ${form.name}.`);
      setPhotoFor(a);
    }
    setFormOpen(false);
  };

  const handleRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const list = parseBackup(text);
      replaceAll(list);
      toast.success("Recuerdos restaurados correctamente.");
    } catch {
      toast.error("No se pudo leer el archivo de respaldo.");
    }
    e.target.value = "";
  };

  const years = (a) => {
    const b = a.birth ? new Date(a.birth).getFullYear() : "";
    const p = a.passing ? new Date(a.passing).getFullYear() : "";
    if (b && p) return `${b} – ${p}`;
    if (b) return `${b}`;
    if (p) return `${p}`;
    return "";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14">
      {/* top brand + backup */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-10">
        <BrandLockup />
        <div className="flex items-center gap-2">
          <button className="ghost-gold rounded-full px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-2" onClick={() => exportBackup(avatars)} data-testid="backup-button">
            <Download className="w-4 h-4" /> Respaldar recuerdos
          </button>
          <button className="ghost-gold rounded-full px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-2" onClick={() => fileRef.current?.click()} data-testid="restore-button">
            <Upload className="w-4 h-4" /> Restaurar
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleRestore} data-testid="restore-file-input" />
        </div>
      </div>

      {/* hero */}
      <div className="text-center mb-12 fade-up">
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#f8fafc] mb-3">
          Un santuario para <span className="gold-gradient-text">quienes amamos</span>
        </h1>
        <p className="text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
          Creá un espacio para cada persona o animal que partió. Escribí cartas, consultá su oráculo,
          atesorá fotos y momentos. El duelo, con luz y con onda.
        </p>
      </div>

      {/* grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {avatars.map((a) => (
          <div key={a.id} className="glass portal-card rounded-3xl p-6 text-center relative" data-testid={`avatar-card-${a.id}`}>
            <div className="absolute top-3 right-3 flex gap-1">
              <EditPencil onClick={() => openEdit(a)} testId={`avatar-edit-${a.id}`} />
              <TrashButton onClick={() => setConfirmDel(a)} testId={`avatar-delete-${a.id}`} />
            </div>
            <div className="relative inline-block mt-2">
              <AvatarPhoto avatar={a} />
              <button
                className="absolute bottom-1 right-1 icon-btn bg-[#0b1a2f]/90 border border-[#d4af37]/50"
                onClick={() => setPhotoFor(a)}
                data-testid={`avatar-photo-edit-${a.id}`}
                title="Ajustar foto"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-heading text-3xl text-[#f8fafc] mt-4">{a.name}</h3>
            <p className="text-[#94a3b8] text-sm flex items-center justify-center gap-2 mt-1">
              <KindIcon kind={a.kind} className="w-4 h-4 gold-text" />
              {years(a) || (a.kind === "animal" ? "Compañero del alma" : "Siempre presente")}
            </p>
            <GoldButton onClick={() => navigate(`/avatar/${a.id}`)} testId={`avatar-enter-${a.id}`} className="mt-5 w-full">
              Entrar a su espacio <ArrowRight className="w-4 h-4" />
            </GoldButton>
          </div>
        ))}

        {/* create card */}
        <button
          onClick={openCreate}
          data-testid="create-avatar-button"
          className="glass portal-card rounded-3xl p-6 min-h-[320px] flex flex-col items-center justify-center gap-4 border-dashed border-[#d4af37]/40 group"
        >
          <span className="rounded-full p-5 border border-[#d4af37]/50 gold-text group-hover:shadow-[0_0_24px_rgba(212,175,55,0.5)] transition-all">
            <Plus className="w-8 h-8" />
          </span>
          <span className="font-heading text-2xl text-[#f8fafc]">Crear nuevo avatar</span>
          <span className="text-[#94a3b8] text-sm">Una persona o un animal para recordar</span>
        </button>
      </div>

      {/* create / edit form */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar avatar" : "Nuevo avatar"} testId="avatar-form-modal">
        <Field label="Nombre">
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Abuela Rosa / Michi" data-testid="avatar-name-input" />
        </Field>
        <Field label="¿Quién es?">
          <div className="flex gap-3">
            {[{ v: "persona", l: "Persona", I: User }, { v: "animal", l: "Animal", I: Dog }].map(({ v, l, I }) => (
              <button
                key={v}
                onClick={() => setForm({ ...form, kind: v })}
                data-testid={`avatar-kind-${v}`}
                className={`flex-1 rounded-xl border px-4 py-3 flex items-center justify-center gap-2 transition-all ${
                  form.kind === v ? "border-[#d4af37] bg-[#d4af37]/10 gold-text" : "border-[#d4af37]/25 text-[#94a3b8] hover:border-[#d4af37]/50"
                }`}
              >
                <I className="w-4 h-4" /> {l}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nacimiento">
            <TextInput type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} data-testid="avatar-birth-input" />
          </Field>
          <Field label="Partida">
            <TextInput type="date" value={form.passing} onChange={(e) => setForm({ ...form, passing: e.target.value })} data-testid="avatar-passing-input" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <GhostButton onClick={() => setFormOpen(false)} testId="avatar-form-cancel">Cancelar</GhostButton>
          <GoldButton onClick={saveForm} testId="avatar-form-save">{editing ? "Guardar" : "Crear"}</GoldButton>
        </div>
      </Modal>

      <PhotoEditor
        open={!!photoFor}
        onClose={() => setPhotoFor(null)}
        initialPhoto={photoFor?.photo || ""}
        round
        title={`Foto de ${photoFor?.name || ""}`}
        onSave={(data) => updateAvatar(photoFor.id, data)}
      />

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => {
          deleteAvatar(confirmDel.id);
          toast.success("Espacio eliminado.");
          setConfirmDel(null);
        }}
        title="¿Eliminar este espacio?"
        message={`Se borrarán todas las cartas, fotos y recuerdos de ${confirmDel?.name}. Esta acción no se puede deshacer. Te recomendamos respaldar antes.`}
        testId="avatar-delete-confirm"
      />
    </div>
  );
}
