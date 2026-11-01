import React, { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { PageHeader, Modal, ConfirmDialog, GoldButton, GhostButton, Field, TextInput } from "../components/common";
import FolderCards from "../components/galeria/FolderCards";
import PhotoTile from "../components/galeria/PhotoTile";
import { StorageMeter } from "../components/StorageBits";
import { galleryPdf } from "../lib/pdf/gallery";
import { fileToDataUrl, shrinkDataUrl } from "../lib/image";
import { plural } from "../lib/format";
import { LIMITS } from "../config/brand";
import { toast } from "sonner";
import { Images, FileDown, Upload, ChevronLeft, ChevronRight, Share2, X } from "lucide-react";

export default function Galeria() {
  const { id } = useParams();
  const { getAvatar, updateAvatar, removeItem, undoRemoved } = useStore();
  const avatar = getAvatar(id);
  const fileRef = useRef(null);

  const [printFrame, setPrintFrame] = useState(true);
  const [active, setActive] = useState("all");
  const [folderForm, setFolderForm] = useState(null);
  const [delFolder, setDelFolder] = useState(null);
  const [delPhoto, setDelPhoto] = useState(null);
  const [movePhoto, setMovePhoto] = useState(null);
  const [caption, setCaption] = useState(null);
  const [lightbox, setLightbox] = useState(-1);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState([]);

  if (!avatar) return <Link to="/" className="gold-text underline block p-10">Volver</Link>;
  const { folders, photos } = avatar.gallery;
  const visible = active === "all" ? photos : active === "general" ? photos.filter((p) => !p.folderId) : photos.filter((p) => p.folderId === active);
  const folderName = (fid) => folders.find((f) => f.id === fid)?.name;
  const setPhotos = (fn) => updateAvatar(id, (a) => ({ gallery: { ...a.gallery, photos: fn(a.gallery.photos) } }));

  const upload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    if (photos.length + files.length > LIMITS.photos) return toast.error(`Hasta ${LIMITS.photos} fotos por espacio (te quedan ${LIMITS.photos - photos.length}).`);
    setUploading(true);
    try {
      const folderId = active === "all" || active === "general" ? null : active;
      const added = [];
      for (const f of files) added.push({ id: crypto.randomUUID(), src: await shrinkDataUrl(await fileToDataUrl(f), 2400, 0.9), folderId, caption: "" });
      if (await setPhotos((ph) => [...ph, ...added])) return toast.success(`${plural(added.length, "foto agregada", "fotos agregadas")}.`);
      let fit = 0;
      for (const p of added) { if (!await updateAvatar(id, (a) => ({ gallery: { ...a.gallery, photos: [...a.gallery.photos, p] } }), { silent: true })) break; fit++; }
      toast.error(fit ? `Solo entraron ${fit} de ${added.length} fotos: el navegador no tiene más lugar.` : "No entró ninguna foto: el navegador no tiene más lugar.", { description: "Descargá un respaldo y liberá espacio borrando fotos de esta app que ya no necesites acá." });
    } catch {
      toast.error("No se pudo leer alguna de las fotos.");
    } finally {
      setUploading(false);
    }
  };

  const saveFolder = async () => {
    const name = folderForm.name.trim();
    if (!name) return toast.error("Poné un nombre a la carpeta.");
    const ok = folderForm.mode === "create"
      ? await updateAvatar(id, (a) => ({ gallery: { ...a.gallery, folders: [...a.gallery.folders, { id: crypto.randomUUID(), name }] } }))
      : await updateAvatar(id, (a) => ({ gallery: { ...a.gallery, folders: a.gallery.folders.map((f) => (f.id === folderForm.id ? { ...f, name } : f)) } }));
    if (ok) { toast.success(folderForm.mode === "create" ? "Carpeta creada." : "Carpeta renombrada."); setFolderForm(null); }
  };

  const removeFolder = async (moveToGeneral) => {
    const fid = delFolder.id;
    const ok = await updateAvatar(id, (a) => ({
      gallery: {
        folders: a.gallery.folders.filter((f) => f.id !== fid),
        photos: moveToGeneral ? a.gallery.photos.map((p) => (p.folderId === fid ? { ...p, folderId: null } : p)) : a.gallery.photos.filter((p) => p.folderId !== fid),
      },
    }));
    if (ok) { toast.success(moveToGeneral ? "Carpeta eliminada; sus fotos pasaron a General." : "Carpeta y fotos eliminadas definitivamente."); if (active === fid) setActive("all"); setDelFolder(null); }
  };

  const exportPdf = (list, label) => {
    if (!list.length) return toast.error("No hay fotos para exportar.");
    return toast.promise(galleryPdf(list, { perPage: 2, frame: printFrame, title: `${avatar.name} · ${label}` }, `galeria-${avatar.name}.pdf`), { loading: "Generando galería…", success: "PDF descargado.", error: "No se pudo generar el PDF." });
  };

  const sharePhoto = async (p) => {
    try {
      const blob = await (await fetch(p.src)).blob();
      const file = new File([blob], "foto.jpg", { type: blob.type || "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) return await navigator.share({ files: [file], title: p.caption || avatar.name });
      const a = document.createElement("a"); a.href = p.src; a.download = "foto.jpg"; a.click();
      toast.success("Tu dispositivo no permite compartir directo: descargamos la foto.");
    } catch (e) { if (e?.name !== "AbortError") toast.error("No se pudo compartir la foto."); }
  };

  const toggle = (pid) => setSelected((s) => (s.includes(pid) ? s.filter((x) => x !== pid) : [...s, pid]));
  const selPhotos = photos.filter((p) => selected.includes(p.id));
  const activeLabel = active === "all" ? "Todas las fotos" : active === "general" ? "General" : folderName(active);
  const lb = visible[lightbox];

  return (
    <div className="pb-10">
      <PageHeader title="Galería de Fotos" subtitle={avatar.name}>
        <GhostButton onClick={() => exportPdf(visible, activeLabel)} testId="galeria-pdf"><FileDown className="w-4 h-4" /> PDF de esta vista</GhostButton>
        <GoldButton onClick={() => fileRef.current?.click()} testId="galeria-upload" className="px-5 py-2.5"><Upload className="w-4 h-4" /> {uploading ? "Subiendo…" : "Agregar fotos"}</GoldButton>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={upload} data-testid="galeria-file-input" />
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
        <FolderCards folders={folders} photos={photos} active={active} setActive={setActive} canCreate={folders.length < LIMITS.folders}
          onRename={(f) => setFolderForm({ mode: "rename", name: f.name, id: f.id })} onDelete={setDelFolder} onCreate={() => setFolderForm({ mode: "create", name: "" })} />

        {selected.length > 0 && (
          <div className="glass-strong rounded-2xl px-4 py-3 mb-5 flex flex-wrap items-center gap-3 sticky top-24 z-30" data-testid="galeria-selection-bar">
            <span className="text-sm text-[#f8fafc]">{plural(selected.length, "foto seleccionada", "fotos seleccionadas")}</span>
            <GhostButton className="py-1.5" onClick={() => exportPdf(selPhotos, "Selección")} testId="galeria-export-selection"><FileDown className="w-4 h-4" /> PDF</GhostButton>
            {selected.length === 1 && <GhostButton className="py-1.5" onClick={() => sharePhoto(selPhotos[0])} testId="galeria-share-selection"><Share2 className="w-4 h-4" /> Compartir</GhostButton>}
            <button className="icon-btn ml-auto" onClick={() => setSelected([])} aria-label="Quitar selección" data-testid="galeria-clear-selection"><X className="w-4 h-4" /></button>
          </div>
        )}

        {visible.length === 0 ? (
          <div className="glass rounded-3xl py-16 text-center">
            <Images className="w-14 h-14 gold-text mx-auto mb-4" strokeWidth={1} />
            <p className="text-[#d5dfea] mb-5">No hay fotos acá todavía.</p>
            <GoldButton onClick={() => fileRef.current?.click()} testId="galeria-upload-empty"><Upload className="w-4 h-4" /> Agregar fotos</GoldButton>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
            {visible.map((p, idx) => (
              <PhotoTile key={p.id} p={p} folderName={active === "all" ? folderName(p.folderId) : ""} selected={selected.includes(p.id)} onToggle={() => toggle(p.id)}
                onOpen={() => setLightbox(idx)} onMove={() => setMovePhoto(p)} onCaption={() => setCaption({ id: p.id, text: p.caption })} onDelete={() => setDelPhoto(p)} />
            ))}
          </div>
        )}
        <label className="flex gap-2 items-center mt-6 text-sm"><input type="checkbox" checked={printFrame} onChange={e => setPrintFrame(e.target.checked)} /> Marco fino en el PDF de fotos</label>
        {(avatar.removedItems || []).filter(r => r.path === "gallery.photos").map(r => <button key={r.item.id} className="ghost-gold rounded-full px-4 py-2 mt-3 mr-2" onClick={() => undoRemoved(id, r.item.id)}>Recuperar foto eliminada {r.item.caption}</button>)}
        <StorageMeter className="max-w-md mt-8" />
        <p className="text-xs text-[#7f93a8] mt-2 max-w-xl">Las fotos se guardan como copias reducidas para que entren en el navegador; para imprimir en grande conservá tus originales.</p>
      </div>

      <Modal open={!!folderForm} onClose={() => setFolderForm(null)} title={folderForm?.mode === "rename" ? "Renombrar carpeta" : "Nueva carpeta"} maxWidth="max-w-md" testId="galeria-folder-modal">
        <Field label="Nombre de la carpeta">
          <TextInput value={folderForm?.name || ""} onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })} placeholder="Ej: Viajes, Sonrisas…" maxLength={40} data-testid="galeria-folder-name-input" onKeyDown={(e) => e.key === "Enter" && saveFolder()} />
        </Field>
        <div className="flex justify-end gap-3">
          <GhostButton onClick={() => setFolderForm(null)} testId="galeria-folder-cancel">Cancelar</GhostButton>
          <GoldButton onClick={saveFolder} testId="galeria-folder-save">Guardar</GoldButton>
        </div>
      </Modal>

      <Modal open={!!delFolder} onClose={() => setDelFolder(null)} title="Eliminar carpeta" maxWidth="max-w-md" testId="galeria-folder-delete-modal">
        <p className="text-[#d5dfea] mb-6">¿Qué hacemos con las fotos de <span className="gold-text">{delFolder?.name}</span>?</p>
        <div className="flex flex-col gap-3">
          <GoldButton onClick={() => removeFolder(true)} testId="galeria-folder-move-general">Moverlas a General</GoldButton>
          <button className="rounded-full px-5 py-3 text-sm font-semibold bg-red-500/90 text-white hover:bg-red-500" onClick={() => removeFolder(false)} data-testid="galeria-folder-delete-all">Eliminar la carpeta y sus fotos (definitivo)</button>
          <GhostButton onClick={() => setDelFolder(null)} testId="galeria-folder-delete-cancel">Cancelar</GhostButton>
        </div>
      </Modal>

      <Modal open={!!movePhoto} onClose={() => setMovePhoto(null)} title="Mover foto" maxWidth="max-w-md" testId="galeria-move-modal">
        <div className="flex flex-col gap-2">
          {[{ id: null, name: "General" }, ...folders].map((f) => (
            <button key={f.id || "general"} className={`text-left rounded-xl px-4 py-3 border ${(movePhoto?.folderId || null) === f.id ? "border-[#d4af37] gold-text" : "border-[#d4af37]/25 text-[#d5dfea] hover:border-[#d4af37]/60"}`}
              onClick={async () => { if (await setPhotos((ph) => ph.map((p) => (p.id === movePhoto.id ? { ...p, folderId: f.id } : p)))) { toast.success("Foto movida."); setMovePhoto(null); } }} data-testid={`galeria-move-to-${f.id || "general"}`}>
              {f.name}
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={!!caption} onClose={() => setCaption(null)} title="Pie de foto" maxWidth="max-w-md" testId="galeria-caption-modal">
        <TextInput value={caption?.text || ""} onChange={(e) => setCaption({ ...caption, text: e.target.value })} maxLength={120} placeholder="Opcional" data-testid="galeria-caption-input" />
        <div className="flex justify-end gap-3 mt-5">
          <GhostButton onClick={() => setCaption(null)} testId="galeria-caption-cancel">Cancelar</GhostButton>
          <GoldButton onClick={async () => { if (await setPhotos((ph) => ph.map((p) => (p.id === caption.id ? { ...p, caption: caption.text.trim() } : p)))) { toast.success("Pie guardado."); setCaption(null); } }} testId="galeria-caption-save">Guardar</GoldButton>
        </div>
      </Modal>

      <Modal open={lightbox >= 0} onClose={() => setLightbox(-1)} title="" maxWidth="max-w-3xl" testId="galeria-lightbox">
        {lb && (
          <div className="relative">
            <img src={lb.src} alt={lb.caption || ""} className="w-full max-h-[70vh] object-contain rounded-xl" />
            {lb.caption && <p className="text-center text-[#f8fafc] mt-3 font-hand text-2xl">{lb.caption}</p>}
            {visible.length > 1 && (
              <>
                <button className="icon-btn absolute left-2 top-1/2 -translate-y-1/2 bg-[#152438]/80" onClick={() => setLightbox((lightbox - 1 + visible.length) % visible.length)} aria-label="Anterior" data-testid="lightbox-prev"><ChevronLeft className="w-6 h-6" /></button>
                <button className="icon-btn absolute right-2 top-1/2 -translate-y-1/2 bg-[#152438]/80" onClick={() => setLightbox((lightbox + 1) % visible.length)} aria-label="Siguiente" data-testid="lightbox-next"><ChevronRight className="w-6 h-6" /></button>
              </>
            )}
            <div className="flex justify-center mt-3"><GhostButton className="py-2" onClick={() => sharePhoto(lb)} testId="lightbox-share"><Share2 className="w-4 h-4" /> Compartir esta foto</GhostButton></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!delPhoto}
        onClose={() => setDelPhoto(null)}
        onConfirm={() => { removeItem(id, "gallery.photos", delPhoto.id, "Foto eliminada."); setSelected((s) => s.filter((x) => x !== delPhoto.id)); setDelPhoto(null); }}
        title="¿Eliminar esta foto?"
        message="Se borra de la galería. Vas a poder deshacerlo unos segundos."
        testId="galeria-photo-delete-confirm"
      />
    </div>
  );
}
