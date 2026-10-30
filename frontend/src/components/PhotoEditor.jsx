import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Modal, GoldButton, GhostButton } from "./common";
import { getCroppedImg, fileToDataUrl, shrinkDataUrl } from "../lib/image";
import { Upload, ZoomIn } from "lucide-react";

// Reusable photo picker + cropper. onSave({ photo, photoCropped, crop })
export default function PhotoEditor({ open, onClose, initialPhoto = "", aspect = 1, title = "Ajustar foto", onSave, round = false }) {
  const [src, setSrc] = useState(initialPhoto);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState(null);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (open) {
      setSrc(initialPhoto);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setAreaPixels(null);
    }
  }, [open, initialPhoto]);

  const onCropComplete = useCallback((_, pixels) => setAreaPixels(pixels), []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const shrunk = await shrinkDataUrl(dataUrl, 1600, 0.86);
    setSrc(shrunk);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const save = async () => {
    if (!src) return;
    setBusy(true);
    try {
      let cropped = src;
      if (areaPixels) cropped = await getCroppedImg(src, areaPixels, 900);
      const ok = onSave({ photo: src, photoCropped: cropped, crop: { ...crop, zoom } });
      if (ok !== false) onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-xl" testId="photo-editor-modal">
      {!src ? (
        <label
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d4af37]/40 py-16 cursor-pointer hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all"
          data-testid="photo-upload-dropzone"
        >
          <Upload className="w-10 h-10 gold-text" strokeWidth={1.2} />
          <span className="text-[#cbd5e1]">Subí una foto desde tu dispositivo</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} data-testid="photo-file-input" />
        </label>
      ) : (
        <>
          <div
            className={`relative w-full h-72 bg-[#152438] overflow-hidden ${round ? "rounded-full mx-auto" : "rounded-xl"}`}
            style={round ? { width: 288, height: 288 } : {}}
          >
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={round ? "round" : "rect"}
              showGrid={!round}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex items-center gap-3 mt-5">
            <ZoomIn className="w-5 h-5 gold-text shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#d4af37]"
              data-testid="photo-zoom-slider"
            />
          </div>
          <label className="mt-4 inline-flex items-center gap-2 text-sm gold-text cursor-pointer hover:text-[#fef08a] transition-colors">
            <Upload className="w-4 h-4" /> Cambiar foto
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} data-testid="photo-change-input" />
          </label>
        </>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <GhostButton onClick={onClose} testId="photo-cancel">Cancelar</GhostButton>
        <GoldButton onClick={save} disabled={!src || busy} testId="photo-save">
          {busy ? "Guardando…" : "Guardar foto"}
        </GoldButton>
      </div>
    </Modal>
  );
}
