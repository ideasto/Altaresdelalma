import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { CatLogo } from "../components/Logo";
import { Sparkles, Milestone, Images, Mail, BookOpen, ArrowLeft, ArrowRight, Cat, User } from "lucide-react";

const PORTALS = [
  { key: "oraculo", title: "Mazo Oráculo", desc: "Escribí hasta 21 cartas y consultá su sabiduría.", icon: Sparkles, span: "lg:col-span-2 lg:row-span-2", count: (a) => a.cards.length },
  { key: "linea", title: "Línea de Tiempo", desc: "Los momentos que marcaron su historia.", icon: Milestone, span: "", count: (a) => a.timeline.length },
  { key: "galeria", title: "Galería de Fotos", desc: "Hasta 100 fotos en carpetas.", icon: Images, span: "", count: (a) => a.gallery.photos.length },
  { key: "cartas", title: "Cartas", desc: "Escribile de puño y letra, cuando lo necesites.", icon: Mail, span: "", count: (a) => a.letters.length },
  { key: "libro", title: "Libro de Recuerdos", desc: "Un álbum encuadernado para hojear.", icon: BookOpen, span: "", count: (a) => a.book.length },
];

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAvatar } = useStore();
  const avatar = getAvatar(id);

  if (!avatar) {
    return (
      <div className="max-w-xl mx-auto px-6 pt-24 text-center">
        <p className="text-[#94a3b8] mb-4">Este espacio ya no existe.</p>
        <Link to="/" className="gold-text underline">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div>
      {/* hero header */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
          <button className="icon-btn mb-6" onClick={() => navigate("/")} data-testid="dashboard-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left mb-10">
            <div
              className="rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[#0b1a2f] float-soft"
              style={{ width: 120, height: 120, border: "2px solid rgba(212,175,55,0.7)", boxShadow: "0 0 30px rgba(212,175,55,0.3)" }}
            >
              {avatar.photoCropped ? (
                <img src={avatar.photoCropped} alt={avatar.name} className="w-full h-full object-cover" />
              ) : (
                <span className="gold-text opacity-60">{avatar.kind === "animal" ? <Cat className="w-12 h-12" /> : <User className="w-12 h-12" />}</span>
              )}
            </div>
            <div>
              <p className="font-ui text-xs tracking-[0.3em] uppercase text-[#94a3b8] mb-1">Su espacio sagrado</p>
              <h1 className="font-heading text-4xl sm:text-6xl gold-gradient-text leading-none">{avatar.name}</h1>
              <p className="text-[#cbd5e1] mt-2 font-hand text-2xl">Honramos tu luz, siempre.</p>
            </div>
          </div>
        </div>
      </div>

      {/* bento portals */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-[200px]">
          {PORTALS.map(({ key, title, desc, icon: Icon, span, count }) => (
            <button
              key={key}
              onClick={() => navigate(`/avatar/${id}/${key}`)}
              data-testid={`portal-${key}`}
              className={`glass portal-card rounded-3xl p-6 text-left flex flex-col justify-between relative overflow-hidden group ${span}`}
            >
              <div className="absolute -top-8 -right-8 opacity-10 gold-text group-hover:opacity-20 transition-opacity">
                <Icon className="w-40 h-40" strokeWidth={0.8} />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className="rounded-2xl p-3 bg-[#d4af37]/10 gold-text group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
                  <Icon className="w-6 h-6" />
                </span>
                <span className="font-ui text-xs text-[#94a3b8]">{count(avatar)} ítems</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-heading text-2xl sm:text-3xl text-[#f8fafc] mb-1">{title}</h3>
                <p className="text-[#94a3b8] text-sm leading-snug">{desc}</p>
                <span className="inline-flex items-center gap-1 gold-text text-sm mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Entrar <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-center py-12 opacity-40 gold-text">
          <CatLogo size={34} />
        </div>
      </div>
    </div>
  );
}
