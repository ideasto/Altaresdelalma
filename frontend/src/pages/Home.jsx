import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { BrandLockup } from "../components/Logo";
import { ConfirmDialog, GoldButton, EditPencil, TrashButton, Plus } from "../components/common";
import PhotoEditor from "../components/PhotoEditor";
import SpaceForm from "../components/SpaceForm";
import SpacePhoto, { yearsOf } from "../components/SpacePhoto";
import { SpaceSymbol } from "../components/Symbols";
import RestoreDialog from "../components/RestoreDialog";
import TrashDialog from "../components/TrashDialog";
import ContactDialog from "../components/ContactDialog";
import { StorageMeter } from "../components/StorageBits";
import AdSlot from "../components/AdSlot";
import { exportBackup, parseBackup } from "../lib/storage";
import { toast } from "sonner";
import { Download, Upload, ArrowRight, Pencil, Trash2, UserRound, HelpCircle } from "lucide-react";

const pill = "ghost-gold rounded-full px-4 py-2 text-xs sm:text-sm inline-flex items-center gap-2";

export default function Home() {
  const { avatars, trash, createAvatar, updateAvatar, deleteAvatar } = useStore();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [photoFor, setPhotoFor] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [restoreData, setRestoreData] = useState(null);
  const [trashOpen, setTrashOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const onCreate = async (data) => {
    const a = await createAvatar(data);
    if (!a) return false;
    toast.success(`Creaste el espacio de ${a.name}.`);
    setPhotoFor(a);
    return true;
  };
  const onUpdate = async (data) => {
    const ok = await updateAvatar(editing.id, data);
    if (ok) toast.success("Espacio actualizado.");
    return ok;
  };

  const handleRestore = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setRestoreData({ ...parseBackup(await file.text()), loadedAt: Date.now() });
    } catch (err) {
      toast.error(err.message || "No se pudo leer el archivo de respaldo.");
    }
  };

  const backupAll = () => {
    if (!avatars.length && !trash.length) return toast.error("Todavía no hay espacios para respaldar.");
    exportBackup(avatars, null, trash);
    toast.success("Descargaste una copia para restaurar tus recuerdos.", { description: "Incluye fotos y textos. No incluye tus datos de contacto." });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-10">
        <BrandLockup />
        <div className="flex items-center gap-2 flex-wrap">
          <button className={pill} onClick={backupAll} data-testid="backup-button"><Download className="w-4 h-4" /> Descargar respaldo</button>
          <button className={pill} onClick={() => fileRef.current?.click()} data-testid="restore-button"><Upload className="w-4 h-4" /> Restaurar</button>
          <button className={pill} onClick={() => setTrashOpen(true)} data-testid="trash-button"><Trash2 className="w-4 h-4" /> Papelera{trash.length ? ` (${trash.length})` : ""}</button>
          <button className={pill} onClick={() => setContactOpen(true)} data-testid="contact-button"><UserRound className="w-4 h-4" /> Tus datos</button>
          <button className="icon-btn" onClick={() => window.dispatchEvent(new Event("altares:help"))} title="Ayuda" aria-label="Ayuda" data-testid="help-button"><HelpCircle className="w-5 h-5" /></button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleRestore} data-testid="restore-file-input" />
        </div>
      </div>

      <div className="mb-10 fade-up max-w-3xl mx-auto text-center">
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#f8fafc] mb-4">
          Un lugar para los recuerdos <span className="gold-gradient-text">que querés conservar</span>
        </h1>
        <p className="text-[#d5dfea] leading-relaxed text-base">
          Podés empezar con una foto, una frase o algo que hoy quieras escribir. Reuní tus recuerdos y dales forma en un libro para imprimir. Lo demás puede esperar.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {avatars.map((a) => (
          <div key={a.id} className="glass portal-card rounded-3xl p-6 text-center relative w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]" data-testid={`space-card-${a.id}`}>
            <div className="absolute top-3 right-3 flex gap-1">
              <button className="icon-btn" title="Descargar respaldo de este espacio" aria-label="Respaldo de este espacio" onClick={() => exportBackup(avatars, a)} data-testid={`space-backup-${a.id}`}><Download className="w-4 h-4" /></button>
              <EditPencil onClick={() => { setEditing(a); setFormOpen(true); }} testId={`space-edit-${a.id}`} />
              <TrashButton onClick={() => setConfirmDel(a)} testId={`space-delete-${a.id}`} />
            </div>
            <div className="relative inline-block mt-6">
              <SpacePhoto space={a} size={150} />
              <button className="absolute bottom-1 right-1 icon-btn bg-[#1d3349] border border-[#d4af37]/50" onClick={() => setPhotoFor(a)} data-testid={`space-photo-edit-${a.id}`} title="Foto y recorte" aria-label="Foto y recorte">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-heading text-3xl gold-gradient-text mt-4 break-words">{a.name}</h3>
            <p className="text-[#a9bacb] text-sm flex items-center justify-center gap-2 mt-1 min-h-5">
              {a.symbol && <SpaceSymbol symbol={a.symbol} className="w-4 h-4 gold-text" />}
              {yearsOf(a)}
            </p>
            <GoldButton onClick={() => navigate(`/espacio/${a.id}`)} testId={`space-enter-${a.id}`} className="mt-5 w-full">
              Entrar a su espacio <ArrowRight className="w-4 h-4" />
            </GoldButton>
          </div>
        ))}

        <button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          data-testid="create-space-button"
          className={`glass portal-card rounded-3xl p-6 flex flex-col items-center justify-center gap-4 border-dashed border-[#d4af37]/45 group w-full ${avatars.length ? "sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] min-h-[320px]" : "max-w-2xl min-h-[250px] sm:min-h-[270px]"}`}
        >
          <span className="rounded-full p-5 border border-[#d4af37]/55 gold-text group-hover:shadow-[0_0_22px_rgba(212,175,55,0.45)] transition-shadow">
            <Plus className="w-8 h-8" />
          </span>
          <span className="font-heading text-2xl text-[#f8fafc]">Crear un espacio</span>
          <span className="text-[#a9bacb] text-sm">Para alguien que querés recordar · no hace falta completarlo hoy</span>
        </button>
      </div>

      <StorageMeter className="max-w-md mx-auto mb-10" />
      <AdSlot placement="home-after-spaces" />

      <SpaceForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} onCreate={onCreate} onUpdate={onUpdate} />

      <PhotoEditor
        open={!!photoFor}
        onClose={() => setPhotoFor(null)}
        initialPhoto={photoFor?.photo || ""}
        round
        title={`Foto de ${photoFor?.name || ""}`}
        onSave={(data) => updateAvatar(photoFor.id, data)}
      />

      {restoreData && <RestoreDialog key={restoreData.loadedAt} data={restoreData} onClose={() => setRestoreData(null)} />}
      <TrashDialog open={trashOpen} onClose={() => setTrashOpen(false)} />
      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={async () => {
          if (await deleteAvatar(confirmDel.id)) toast.success("El espacio pasó a la papelera.", { description: "Podés recuperarlo desde «Papelera»." });
          setConfirmDel(null);
        }}
        title="¿Borrar este espacio?"
        message={`El espacio de ${confirmDel?.name} pasa a la papelera con todo su contenido. Podés recuperarlo desde ahí; el borrado definitivo se hace desde la papelera.`}
        confirmLabel="Mover a la papelera"
        testId="space-delete-confirm"
      />
    </div>
  );
}
