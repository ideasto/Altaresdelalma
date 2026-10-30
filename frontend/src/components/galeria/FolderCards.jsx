import React from "react";
import { EditPencil, TrashButton } from "../common";
import { plural } from "../../lib/format";
import { Folder, FolderPlus } from "lucide-react";

function FolderCard({ name, photos, active, onOpen, actions, testId }) {
  const prev = photos.slice(0, 3);
  return (
    <div className={`glass rounded-2xl p-3 relative selectable ${active ? "border-[#d4af37]" : ""}`} data-testid={testId}>
      <button className="w-full text-left" onClick={onOpen} aria-pressed={active} data-testid={`${testId}-open`}>
        <div className="grid grid-cols-3 gap-1 h-20 mb-2 rounded-lg overflow-hidden bg-[#152438]/60">
          {prev.length ? prev.map((p) => <img key={p.id} src={p.src} alt="" className="w-full h-full object-cover" />) : <div className="col-span-3 flex items-center justify-center"><Folder className="w-7 h-7 gold-text opacity-60" strokeWidth={1.2} /></div>}
        </div>
        <p className={`text-sm truncate ${active ? "gold-text" : "text-[#f8fafc]"}`}>{name}</p>
        <p className="text-xs text-[#a9bacb]">{plural(photos.length, "foto", "fotos")}</p>
      </button>
      {actions && <div className="absolute top-1 right-1 flex bg-[#152438]/85 rounded-full">{actions}</div>}
    </div>
  );
}

export default function FolderCards({ folders, photos, active, setActive, onRename, onDelete, onCreate, canCreate }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8" data-testid="galeria-folders">
      <FolderCard name="Todas" photos={photos} active={active === "all"} onOpen={() => setActive("all")} testId="galeria-folder-all" />
      <FolderCard name="General" photos={photos.filter((p) => !p.folderId)} active={active === "general"} onOpen={() => setActive("general")} testId="galeria-folder-general" />
      {folders.map((f) => (
        <FolderCard
          key={f.id}
          name={f.name}
          photos={photos.filter((p) => p.folderId === f.id)}
          active={active === f.id}
          onOpen={() => setActive(f.id)}
          testId={`galeria-folder-${f.id}`}
          actions={<><EditPencil onClick={() => onRename(f)} testId={`galeria-folder-rename-${f.id}`} title="Renombrar" /><TrashButton onClick={() => onDelete(f)} testId={`galeria-folder-delete-${f.id}`} /></>}
        />
      ))}
      {canCreate && (
        <button className="rounded-2xl border border-dashed border-[#d4af37]/45 flex flex-col items-center justify-center gap-2 gold-text min-h-[130px] selectable" onClick={onCreate} data-testid="galeria-new-folder">
          <FolderPlus className="w-6 h-6" /> <span className="text-sm">Nueva carpeta</span>
        </button>
      )}
    </div>
  );
}
