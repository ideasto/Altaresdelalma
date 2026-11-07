import React, { useEffect, useState } from "react";
import { Modal, GoldButton, GhostButton } from "./common";
import { prepareShareImages } from "../lib/shareImages";
import { copyText } from "../lib/drafts";

export default function ShareDialog({ items, onClose }) {
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    if (!items) return;
    let active = true, created = [];
    const controller = new AbortController();
    setFiles([]); setUrls([]); setIndex(0); setError(""); setNotice("");
    prepareShareImages(items, controller.signal).then(result => {
      if (!active) return;
      created = result.map(file => URL.createObjectURL(file)); setFiles(result); setUrls(created);
    }).catch(e => { if (active) setError(e.message || "No se pudieron preparar las imágenes."); });
    return () => { active = false; controller.abort(); created.forEach(url => URL.revokeObjectURL(url)); };
  }, [items]);

  let canShare = false;
  try { canShare = !!files.length && !!navigator.share && !!navigator.canShare && navigator.canShare({ files }); } catch { /* Download remains available. */ }
  const share = async () => {
    // Called by a second explicit click, after image generation, preserving the
    // user activation that mobile browsers require for the native share sheet.
    setSharing(true); setNotice("");
    try { await navigator.share({ files }); }
    catch (e) { if (e.name !== "AbortError") setNotice("No se abrió el menú de compartir. Podés descargar las imágenes y adjuntarlas desde tu red social."); }
    finally { setSharing(false); }
  };
  const download = () => {
    const a = document.createElement("a"); a.href = urls[index]; a.download = files[index].name; a.click();
  };
  return <Modal open={!!items} onClose={onClose} title="Compartir un recuerdo" maxWidth="max-w-xl" testId="share-dialog">
    <p className="text-sm text-[#d5dfea] mb-4">Revisá lo que elegiste. Solo se prepara este contenido; tu espacio completo sigue en tu navegador.</p>
    {!files.length && !error && <p role="status">Preparando imágenes…</p>}
    {error && <p role="alert">{error}</p>}
    {!!files.length && <>
      <img src={urls[index]} alt={`Vista previa de la imagen ${index + 1} de ${files.length}`} className="max-h-80 mx-auto rounded-lg" data-testid="share-preview" />
      <div className="flex justify-center items-center gap-4 my-4">
        <GhostButton disabled={index === 0} onClick={() => setIndex(i => i - 1)} testId="share-prev">Anterior</GhostButton>
        <span className="text-sm" data-testid="share-count">{index + 1} de {files.length}</span>
        <GhostButton disabled={index === files.length - 1} onClick={() => setIndex(i => i + 1)} testId="share-next">Siguiente</GhostButton>
      </div>
      <p className="text-sm text-[#d5dfea] mb-4">{canShare ? `Se abrirá el menú de tu dispositivo con ${files.length === 1 ? "esta imagen" : `las ${files.length} imágenes`}. Las aplicaciones disponibles dependen de tu dispositivo.` : "Este navegador no permite compartir estos archivos directamente. Descargá cada imagen y adjuntala en Instagram, WhatsApp u otra aplicación."} Los textos largos se reparten en varias imágenes, sin cortarlos.</p>
      <div className="flex flex-wrap justify-end gap-2">
        <GhostButton onClick={async () => setNotice((await copyText(items.map(x => [x.title, x.subtitle, x.text].filter(Boolean).join("\n")).join("\n\n"))) ? "Texto copiado." : "No se pudo copiar el texto.")} testId="share-copy">Copiar texto</GhostButton>
        <GhostButton onClick={download} testId="share-download">Descargar imagen {files.length > 1 ? index + 1 : ""}</GhostButton>
        {canShare && <GoldButton disabled={sharing} onClick={share} testId="share-native">Compartir {files.length > 1 ? "todas" : "imagen"}</GoldButton>}
      </div>
    </>}
    {notice && <p role="status" className="text-sm mt-4">{notice}</p>}
  </Modal>;
}
