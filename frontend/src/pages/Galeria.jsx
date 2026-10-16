import React, { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { PageHeader, Modal, ConfirmDialog, GoldButton, GhostButton, EditPencil, TrashButton, Field, TextInput } from "../components/common";
import { makeSheet, renderPdf } from "../lib/pdf";
import { fileToDataUrl, shrinkDataUrl } from "../lib/image";
import { toast } from "sonner";
import { Images, FileDown, Upload, FolderPlus, Folder, FolderOpen, ChevronLeft, ChevronRight, FolderInput } from "lucide-react";

const MAX_PHOTOS = 100;
const MAX_FOLDERS = 5;

export default function Galeria() {
  const { id } = useParams();
  const { getAvatar, updateAvatar } = useStore();
  const avatar = getAvatar(id);
  const fileRef = useRef(null);

  const [active, setActive] = useState("all");
  const [folderForm, setFolderForm] = useState(null); // {mode:'create'|'rename', name, id?}
  const [delFolder, setDelFolder] = useState(null);
  const [delPhoto, setDelPhoto] = useState(null);
  const [movePhoto, setMovePhoto] = useState(null);
  const [lightbox, setLightbox] = useState(-1);
  const [uploading, setUploading] = useState(false);

  if (!avatar) return <Link to="/" className="gold-text underline block p-10">Volver</Link>;
  const { folders, photos } = avatar.gallery;
  const visible = active === "all" ? photos : photos.filter((p) => p.folderId === active);

  const upload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (photos.length + files.length > MAX_PHOTOS) return toast.error(`Máximo ${MAX_PHOTOS} fotos (te quedan ${MAX_PHOTOS - photos.length}).`);
    setUploading(true);
    try {
      const folderId = active === "all" ? null : active;
      const added = [];
      for (const f of files) {
        const d = await fileToDataUrl(f);
        const s = await shrinkDataUrl(d, 1400, 0.82);
        added.push({ id: crypto.randomUUID(), src: s, folderId });
      }
      updateAvatar(id, (a) => ({ gallery: { ...a.gallery, photos: [...a.gallery.photos, ...added] } }));
      toast.success(`${added.length} foto(s) agregada(s).`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const saveFolder = () => {
    const name = folderForm.name.trim();
    if (!name) return toast.error("Poné un nombre a la carpeta.");
    if (folderForm.mode === "create") {
      if (folders.length >= MAX_FOLDERS) return toast.error(`Máximo ${MAX_FOLDERS} carpetas.`);
      const f = { id: crypto.randomUUID(), name };
      updateAvatar(id, (a) => ({ gallery: { ...a.gallery, folders: [...a.gallery.folders, f] } }));
      toast.success("Carpeta creada.");
    } else {
      updateAvatar(id, (a) => ({ gallery: { ...a.gallery, folders: a.gallery.folders.map((f) => (f.id === folderForm.id ? { ...f, name } : f)) } }));
      toast.success("Carpeta renombrada.");
    }
    setFolderForm(null);
  };

  const removeFolder = (moveToGeneral) => {
    updateAvatar(id, (a) => {
      const fid = delFolder.id;
      let ph = a.gallery.photos;
      if (moveToGeneral) ph = ph.map((p) => (p.folderId === fid ? { ...p, folderId: null } : p));
      else ph = ph.filter((p) => p.folderId !== fid);
      return { gallery: { folders: a.gallery.folders.filter((f) => f.id !== fid), photos: ph } };
    });
    toast.success(moveToGeneral ? "Carpeta eliminada, fotos movidas a la galería general." : "Carpeta y sus fotos eliminadas.");
    if (active === delFolder.id) setActive("all");
    setDelFolder(null);
  };

  const doMove = (folderId) => {
    updateAvatar(id, (a) => ({ gallery: { ...a.gallery, photos: a.gallery.photos.map((p) => (p.id === movePhoto.id ? { ...p, folderId } : p)) } }));
    toast.success("Foto movida.");
    setMovePhoto(null);
  };

  const exportPdf = () => {
    if (visible.length === 0) return toast.error("No hay fotos para exportar.");
    const folderName = active === "all" ? "Todas las fotos" : folders.find((f) => f.id === active)?.name;
    const chunks = [];
    for (let i = 0; i < visible.length; i += 6) chunks.push(visible.slice(i, i + 6));
    const sheets = chunks.map((chunk) => {
      const { sheet, content } = makeSheet({ title: "Galería", subtitle: `${avatar.name} · ${folderName}` });
      const grid = document.createElement("div");
      Object.assign(grid.style, { display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap: "16px", height: "100%" });
      chunk.forEach((p) => {
        const box = document.createElement("div");
        Object.assign(box.style, { border: "1px solid #c9a94a", borderRadius: "8px", overflow: "hidden", background: "#f0ead9" });
        const img = document.createElement("img");
        img.src = p.src; img.crossOrigin = "anonymous";
        Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover" });
        box.appendChild(img); grid.appendChild(box);
      });
      content.appendChild(grid);
      return sheet;
    });
    toast.promise(renderPdf(sheets, `galeria-${avatar.name}.pdf`), {
      loading: "Generando galería…", success: "PDF descargado.", error: "Error al generar el PDF.",
    });
  };

  const folderName = (fid) => folders.find((f) => f.id === fid)?.name;

  return (
    <div className="pb-10">
      <PageHeader title="Galería de Fotos" subtitle={avatar.name}>
        <GhostButton onClick={exportPdf} testId="galeria-pdf"><FileDown className="w-4 h-4" /> PDF</GhostButton>
        <GoldButton onClick={() => fileRef.current?.click()} testId="galeria-upload" className="px-5 py-2.5">
          <Upload className="w-4 h-4" /> {uploading ? "Subiendo…" : "Subir fotos"}
        </GoldButton>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={upload} data-testid="galeria-file-input" />
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
        {/* folder tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <FolderChip active={active === "all"} onClick={() => setActive("all")} icon={FolderOpen} label={`Todas (${photos.length})`} testId="galeria-folder-all" />
          {folders.map((f) => (
            <div key={f.id} className="relative group">
              <FolderChip
                active={active === f.id}
                onClick={() => setActive(f.id)}
                icon={Folder}
                label={`${f.name} (${photos.filter((p) => p.folderId === f.id).length})`}
                testId={`galeria-folder-${f.id}`}
              />
              <div className={`absolute -top-2 -right-2 flex gap-0.5 bg-[#0b1a2f] rounded-full border border-[#d4af37]/40 transition-opacity ${active === f.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                <EditPencil onClick={() => setFolderForm({ mode: "rename", name: f.name, id: f.id })} testId={`galeria-folder-rename-${f.id}`} />
                <TrashButton onClick={() => setDelFolder(f)} testId={`galeria-folder-delete-${f.id}`} />
              </div>
            </div>
          ))}
          {folders.length < MAX_FOLDERS && (
            <button className="ghost-gold rounded-full px-4 py-2 text-sm inline-flex items-center gap-2" onClick={() => setFolderForm({ mode: "create", name: "" })} data-testid="galeria-new-folder">
              <FolderPlus className="w-4 h-4" /> Nueva carpeta
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <div className="glass rounded-3xl py-16 text-center">
            <span className="gold-text float-soft inline-block mb-4"><Images className="w-14 h-14" strokeWidth={1} /></span>
            <p className="text-[#cbd5e1] mb-5">No hay fotos en este espacio todavía.</p>
            <GoldButton onClick={() => fileRef.current?.click()} testId="galeria-upload-empty"><Upload className="w-4 h-4" /> Subir fotos</GoldButton>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
            {visible.map((p, idx) => (
              <div key={p.id} className="relative group mb-4 break-inside-avoid rounded-xl overflow-hidden glass" data-testid={`galeria-photo-${p.id}`}>
                <img src={p.src} alt="" className="w-full cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setLightbox(idx)} />
                {p.folderId && active === "all" && (
                  <span className="absolute bottom-2 left-2 text-[10px] bg-[#0b1a2f]/80 gold-text px-2 py-0.5 rounded-full">{folderName(p.folderId)}</span>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0b1a2f]/70 rounded-full p-0.5">
                  <button className="icon-btn" onClick={() => setMovePhoto(p)} data-testid={`galeria-move-${p.id}`} title="Mover a carpeta"><FolderInput className="w-4 h-4" /></button>
                  <TrashButton onClick={() => setDelPhoto(p)} testId={`galeria-delete-${p.id}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* folder form */}
      <Modal open={!!folderForm} onClose={() => setFolderForm(null)} title={folderForm?.mode === "rename" ? "Renombrar carpeta" : "Nueva carpeta"} maxWidth="max-w-md" testId="galeria-folder-modal">
        <Field label="Nombre de la carpeta">
          <TextInput value={folderForm?.name || ""} onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })} placeholder="Ej: Viajes, Sonrisas…" data-testid="galeria-folder-name-input" onKeyDown={(e) => e.key === "Enter" && saveFolder()} />
        </Field>
        <div className="flex justify-end gap-3">
          <GhostButton onClick={() => setFolderForm(null)} testId="galeria-folder-cancel">Cancelar</GhostButton>
          <GoldButton onClick={saveFolder} testId="galeria-folder-save">Guardar</GoldButton>
        </div>
      </Modal>

      {/* delete folder (two options) */}
      <Modal open={!!delFolder} onClose={() => setDelFolder(null)} title="Eliminar carpeta" maxWidth="max-w-md" testId="galeria-folder-delete-modal">
        <p className="text-[#cbd5e1] mb-6">
          La carpeta <span className="gold-text">{delFolder?.name}</span> tiene fotos. ¿Qué querés hacer con ellas?
        </p>
        <div className="flex flex-col gap-3">
          <GoldButton onClick={() => removeFolder(true)} testId="galeria-folder-move-general">Mover fotos a la galería general</GoldButton>
          <button className="rounded-full px-5 py-3 text-sm font-semibold bg-red-500/90 text-white hover:bg-red-500 transition-all" onClick={() => removeFolder(false)} data-testid="galeria-folder-delete-all">
            Borrar la carpeta y todas sus fotos
          </button>
          <GhostButton onClick={() => setDelFolder(null)} testId="galeria-folder-delete-cancel">Cancelar</GhostButton>
        </div>
      </Modal>

      {/* move photo */}
      <Modal open={!!movePhoto} onClose={() => setMovePhoto(null)} title="Mover foto" maxWidth="max-w-md" testId="galeria-move-modal">
        <div className="flex flex-col gap-2">
          <button className={`text-left rounded-xl px-4 py-3 border transition-all ${!movePhoto?.folderId ? "border-[#d4af37] gold-text" : "border-[#d4af37]/25 text-[#cbd5e1] hover:border-[#d4af37]/60"}`} onClick={() => doMove(null)} data-testid="galeria-move-general">
            Galería general
          </button>
          {folders.map((f) => (
            <button key={f.id} className={`text-left rounded-xl px-4 py-3 border transition-all ${movePhoto?.folderId === f.id ? "border-[#d4af37] gold-text" : "border-[#d4af37]/25 text-[#cbd5e1] hover:border-[#d4af37]/60"}`} onClick={() => doMove(f.id)} data-testid={`galeria-move-to-${f.id}`}>
              {f.name}
            </button>
          ))}
          {folders.length === 0 && <p className="text-[#94a3b8] text-sm">Creá una carpeta para organizar tus fotos.</p>}
        </div>
      </Modal>

      {/* lightbox */}
      <Modal open={lightbox >= 0} onClose={() => setLightbox(-1)} title="" maxWidth="max-w-3xl" testId="galeria-lightbox">
        {lightbox >= 0 && visible[lightbox] && (
          <div className="relative">
            <img src={visible[lightbox].src} alt="" className="w-full max-h-[70vh] object-contain rounded-xl" />
            {visible.length > 1 && (
              <>
                <button className="icon-btn absolute left-2 top-1/2 -translate-y-1/2 bg-[#0b1a2f]/80" onClick={() => setLightbox((lightbox - 1 + visible.length) % visible.length)} data-testid="lightbox-prev"><ChevronLeft className="w-6 h-6" /></button>
                <button className="icon-btn absolute right-2 top-1/2 -translate-y-1/2 bg-[#0b1a2f]/80" onClick={() => setLightbox((lightbox + 1) % visible.length)} data-testid="lightbox-next"><ChevronRight className="w-6 h-6" /></button>
              </>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!delPhoto}
        onClose={() => setDelPhoto(null)}
        onConfirm={() => { updateAvatar(id, (a) => ({ gallery: { ...a.gallery, photos: a.gallery.photos.filter((p) => p.id !== delPhoto.id) } })); toast.success("Foto eliminada."); setDelPhoto(null); }}
        title="¿Eliminar esta foto?"
        message="La foto se borrará de la galería."
        testId="galeria-photo-delete-confirm"
      />
    </div>
  );
}

function FolderChip({ active, onClick, icon: Icon, label, testId }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`rounded-full px-4 py-2 text-sm inline-flex items-center gap-2 border transition-all ${active ? "border-[#d4af37] bg-[#d4af37]/15 gold-text shadow-[0_0_14px_rgba(212,175,55,0.3)]" : "border-[#d4af37]/25 text-[#cbd5e1] hover:border-[#d4af37]/60"}`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}
