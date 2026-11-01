import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import SpacePhoto from "../components/SpacePhoto";
import HeaderPhrase from "../components/HeaderPhrase";
import PhotoEditor from "../components/PhotoEditor";
import SpaceForm from "../components/SpaceForm";
import { EditPencil } from "../components/common";
import { GalleryPreview, OraclePreview, TimelinePreview, LettersPreview, BookPreview } from "../components/dashboard/ModulePreviews";
import { plural } from "../lib/format";
import { Sparkles, Milestone, Images, Mail, BookOpen, ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { toast } from "sonner";

const MODULES = [
  { key: "galeria", title: "Galería de Fotos", icon: Images, Preview: GalleryPreview, span: "sm:col-span-2 lg:row-span-2", minH: "min-h-[300px] lg:min-h-0",
    count: (a) => a.gallery.photos.length && plural(a.gallery.photos.length, "foto", "fotos"), action: (a) => (a.gallery.photos.length ? "Ver fotos y carpetas" : "Agregar fotos") },
  { key: "oraculo", title: "Mazo Oráculo", icon: Sparkles, Preview: OraclePreview,
    count: (a) => a.cards.length && plural(a.cards.length, "carta", "cartas"), action: (a) => (a.cards.length ? "Sacar una carta" : "Crear mi primera carta"), query: (a) => (a.cards.length ? "?consultar=1" : "?nueva=1") },
  { key: "linea", title: "Línea de Tiempo", icon: Milestone, Preview: TimelinePreview,
    count: (a) => a.timeline.length && plural(a.timeline.length, "momento", "momentos"), action: (a) => (a.timeline.length ? "Ver su historia" : "Agregar un momento"), query: (a) => (a.timeline.length ? "" : "?nueva=1") },
  { key: "cartas", title: "Cartas", icon: Mail, Preview: LettersPreview,
    count: (a) => a.letters.length && plural(a.letters.length, "carta", "cartas"), action: (a) => (a.letters.length ? "Ver mis cartas" : "Escribir una carta"), query: (a) => (a.letters.length ? "" : "?nueva=1") },
  { key: "libro", title: "Libro de Recuerdos", icon: BookOpen, Preview: BookPreview,
    count: (a) => a.book.length && plural(a.book.length, "página", "páginas"), action: (a) => (a.book.length || a.bookMeta.title ? "Abrir el libro" : "Crear mi libro") },
];

function ModuleCard({ m, a, onFavorite }) {
  const [personalizing, setPersonalizing] = useState(false);
  const to = `/espacio/${a.id}/${m.key}`;
  const Icon = m.icon;
  const count = m.count(a);
  const items = { galeria: a.gallery.photos, oraculo: a.cards, linea: a.timeline, cartas: a.letters, libro: a.book }[m.key];
  return (
    <div className={`glass portal-card rounded-3xl relative overflow-hidden flex flex-col p-5 ${m.span || ""} ${m.minH || "min-h-[230px]"}`} data-testid={`portal-${m.key}`}>
      <Link to={to} className="absolute inset-0 z-0" aria-label={m.title} data-testid={`portal-link-${m.key}`} />
      <div className="relative z-10 pointer-events-none flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="rounded-xl p-2 bg-[#d4af37]/12 gold-text"><Icon className="w-5 h-5" /></span>
          <h3 className={`font-heading text-[#f8fafc] ${m.key === "galeria" ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{m.title}</h3>
        </div>
        {count ? <span className="font-ui text-xs text-[#a9bacb]" data-testid={`portal-count-${m.key}`}>{count}</span> : null}
      </div>
      <div className="relative z-10 pointer-events-none flex-1 py-4 min-h-[110px]"><m.Preview a={a} /></div>
      {items.length > 0 && <div className="relative z-10 self-end">
        <button className="icon-btn" aria-label={`Personalizar vista de ${m.title}`} aria-expanded={personalizing} onClick={() => setPersonalizing(v => !v)}><Pencil className="w-3.5 h-3.5" /></button>
        {personalizing && <select autoFocus className="bg-[#234766] text-xs text-[#d5dfea] w-full mb-2" aria-label={`Vista favorita de ${m.title}`} value={a.favorites?.[m.key] || ""} onChange={async e => { if (await onFavorite(m.key, e.target.value)) setPersonalizing(false); }}><option value="">Más reciente</option>{items.map(x => <option key={x.id} value={x.id}>{(x.title || x.caption || x.message || x.body || "Foto").slice(0, 45)}</option>)}</select>}
      </div>}
      <Link to={to + (m.query ? m.query(a) : "")} className="relative z-10 self-start inline-flex items-center gap-1 gold-text text-sm hover:text-[#fde68a]" data-testid={`portal-action-${m.key}`}>
        {m.action(a)} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAvatar, updateAvatar } = useStore();
  const avatar = getAvatar(id);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (!avatar) {
    return (
      <div className="max-w-xl mx-auto px-6 pt-24 text-center">
        <p className="text-[#a9bacb] mb-4">Este espacio no existe en este navegador.</p>
        <Link to="/" className="gold-text underline">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
        <button className="icon-btn mb-6" onClick={() => navigate("/")} data-testid="dashboard-back" aria-label="Volver al inicio"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left mb-10" data-testid="space-header">
          <SpacePhoto space={avatar} size={128} interactive onClick={() => setPhotoOpen(true)} testId="header-photo" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl gold-gradient-text leading-tight break-words" data-testid="header-name">{avatar.name}</h1>
              <EditPencil onClick={() => setEditOpen(true)} testId="header-name-edit" title="Editar nombre, símbolo y fechas" />
            </div>
            <HeaderPhrase phrase={avatar.phrase} onSave={(phrase) => updateAvatar(id, { phrase })} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[240px] gap-5">
          {MODULES.map((m) => <ModuleCard key={m.key} m={m} a={avatar} onFavorite={(key, value) => updateAvatar(id, a => ({ favorites: { ...a.favorites, [key]: value } }))} />)}
        </div>
      </div>

      <PhotoEditor open={photoOpen} onClose={() => setPhotoOpen(false)} initialPhoto={avatar.photo} round title={`Foto de ${avatar.name}`} onSave={(d) => updateAvatar(id, d)} />
      <SpaceForm open={editOpen} onClose={() => setEditOpen(false)} editing={avatar} onUpdate={async (d) => { const ok = await updateAvatar(id, d); if (ok) toast.success("Espacio actualizado."); return ok; }} />
    </div>
  );
}
