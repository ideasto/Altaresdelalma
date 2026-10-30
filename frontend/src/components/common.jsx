import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, Trash2, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg", testId }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            data-testid={testId}
            className={`glass-strong relative z-10 w-full ${maxWidth} max-h-[88vh] overflow-y-auto fancy-scroll rounded-2xl p-6`}
            initial={{ scale: 0.92, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="font-heading text-2xl sm:text-3xl gold-gradient-text">{title}</h3>
              <button className="icon-btn" onClick={onClose} data-testid="modal-close" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Eliminar", danger = true, testId }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md" testId={testId}>
      <p className="text-[#cbd5e1] mb-6 leading-relaxed">{message}</p>
      <div className="flex justify-end gap-3">
        <button className="ghost-gold rounded-full px-5 py-2.5 text-sm" onClick={onClose} data-testid="confirm-cancel">
          Cancelar
        </button>
        <button
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
            danger
              ? "bg-red-500/90 text-white hover:bg-red-500 hover:shadow-[0_0_18px_rgba(248,113,113,0.5)]"
              : "gold-btn"
          }`}
          onClick={onConfirm}
          data-testid="confirm-accept"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function EditPencil({ onClick, testId, title = "Editar" }) {
  return (
    <button className="icon-btn" onClick={onClick} data-testid={testId} title={title} aria-label={title}>
      <Pencil className="w-4 h-4" />
    </button>
  );
}

export function TrashButton({ onClick, testId, title = "Eliminar" }) {
  return (
    <button className="icon-btn danger" onClick={onClick} data-testid={testId} title={title} aria-label={title}>
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

export function GoldButton({ children, onClick, className = "", testId, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={`gold-btn rounded-full px-6 py-3 text-sm sm:text-base inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className = "", testId, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      data-testid={testId}
      className={`ghost-gold rounded-full px-6 py-3 text-sm inline-flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle, onBack, children, backTestId }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-40 glass-strong border-b border-[#d4af37]/20 px-4 sm:px-8 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <button
            className="icon-btn shrink-0"
            onClick={() => (onBack ? onBack() : navigate(-1))}
            data-testid={backTestId || "page-back"}
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-heading text-2xl sm:text-4xl gold-gradient-text truncate">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-[#a9bacb] truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="gold-text mb-6 opacity-80">
        <Icon className="w-16 h-16" strokeWidth={1} />
      </div>
      <h3 className="font-heading text-2xl sm:text-3xl text-[#f8fafc] mb-2">{title}</h3>
      <p className="text-[#a9bacb] max-w-md mb-7 leading-relaxed">{message}</p>
      {action}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="font-ui text-xs uppercase tracking-wider text-[#a9bacb] mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl bg-[#152438]/60 border border-[#d4af37]/30 px-4 py-2.5 text-[#f8fafc] placeholder:text-[#7f93a8] outline-none focus:border-[#d4af37] focus:shadow-[0_0_14px_rgba(212,175,55,0.25)] transition-all";

export function TextInput(props) {
  return <input {...props} className={`${inputCls} ${props.className || ""}`} />;
}
export function TextArea(props) {
  return <textarea {...props} className={`${inputCls} resize-none ${props.className || ""}`} />;
}

export { Plus };
