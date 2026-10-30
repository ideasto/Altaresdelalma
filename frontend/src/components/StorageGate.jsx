import React, { useRef, useState } from "react";
import { useStore } from "../store/StoreContext";
import { GoldButton, GhostButton, ConfirmDialog } from "./common";
import { downloadFile, parseBackup, todayLocal } from "../lib/storage";
import { toast } from "sonner";
import { AlertTriangle, Download, Upload, RotateCw } from "lucide-react";

// Pantalla para datos ilegibles o almacenamiento inaccesible. Nunca sobrescribe sin confirmar.
export default function StorageGate({ children }) {
  const { boot, resetStorage } = useStore();
  const fileRef = useRef(null);
  const [confirm, setConfirm] = useState(false);

  if (boot.status !== "corrupt" && boot.status !== "inaccessible") return children;

  const restore = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const parsed = parseBackup(await f.text());
      if (!resetStorage(parsed.list)) toast.error("No entró en el almacenamiento. El contenido anterior sigue sin tocar.");
      else toast.success(`Restauramos ${parsed.summary.spaces} espacio(s).`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 pt-16" data-testid="storage-gate">
      <div className="glass rounded-3xl p-7 sm:p-9">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-7 h-7 gold-text" />
          <h1 className="font-heading text-3xl sm:text-4xl text-[#f8fafc]">
            {boot.status === "corrupt" ? "No pudimos leer tus recuerdos guardados" : "El navegador no permite guardar"}
          </h1>
        </div>
        {boot.status === "corrupt" ? (
          <>
            <p className="text-[#d5dfea] leading-relaxed mb-3">
              Hay datos guardados en este navegador, pero están dañados o incompletos. No los borramos ni los reemplazamos.
            </p>
            <p className="text-[#a9bacb] text-sm mb-6">Podés descargar el contenido tal como está (para intentar recuperarlo), restaurar un respaldo o, solo si estás de acuerdo, empezar de cero.</p>
            <div className="flex flex-wrap gap-3">
              <GoldButton onClick={() => downloadFile(boot.raw, `altares-contenido-ilegible-${todayLocal()}.txt`, "text/plain")} testId="gate-download-raw">
                <Download className="w-4 h-4" /> Descargar contenido ilegible
              </GoldButton>
              <GhostButton onClick={() => fileRef.current?.click()} testId="gate-restore"><Upload className="w-4 h-4" /> Restaurar un respaldo</GhostButton>
              <button className="text-sm text-red-300 hover:text-red-200 underline px-2" onClick={() => setConfirm(true)} data-testid="gate-reset">Empezar de cero</button>
            </div>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={restore} data-testid="gate-restore-input" />
          </>
        ) : (
          <>
            <p className="text-[#d5dfea] leading-relaxed mb-3">
              Este navegador bloquea el almacenamiento local (puede pasar en modo incógnito o con cookies bloqueadas). Sin eso, nada de lo que escribas quedaría guardado.
            </p>
            <p className="text-[#a9bacb] text-sm mb-6">Probá con una ventana normal o habilitá el almacenamiento del sitio y volvé a intentar.</p>
            <GoldButton onClick={() => window.location.reload()} testId="gate-retry"><RotateCw className="w-4 h-4" /> Reintentar</GoldButton>
          </>
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); if (resetStorage([])) toast.success("Empezaste de cero."); }}
        title="¿Empezar de cero?"
        message="Esto borra definitivamente el contenido ilegible de este navegador. Te recomendamos descargarlo antes."
        confirmLabel="Borrar y empezar"
        testId="gate-reset-confirm"
      />
    </div>
  );
}
