import React from "react";
import { PageHeader } from "../components/common";
import { BRAND, CONTACT } from "../config/brand";

const TEXTS = {
  terminos: {
    title: "Términos de uso",
    body: [
      `${BRAND.appName} es una herramienta de ${BRAND.brandName}, gratuita en esta etapa, para alojar recuerdos de seres amados: escribir, guardar fotos, armar una historia, crear un mazo personal y editar un libro imprimible.`,
      "No promete sanar el duelo ni recibir comunicaciones de alguien fallecido. El mazo es un juego simbólico con frases escritas por vos.",
      "Tus recuerdos se guardan solo en este navegador. Si borrás los datos del navegador o cambiás de dispositivo, se pierden salvo que tengas un respaldo descargado. No hay sincronización ni recuperación remota.",
      "Sos responsable del contenido que cargás y de tener derecho a usar las fotos.",
    ],
  },
  privacidad: {
    title: "Privacidad",
    body: [
      "Tus cartas, fotos, nombres de seres amados y demás contenido de los espacios no salen de tu navegador ni se envían a ningún servidor de La Gata y la Magia.",
      `Al crear tu primer espacio te pedimos tu nombre y email. Con tu aceptación, ${BRAND.brandName} los usa para enviarte ${CONTACT.consentScope}. Registramos la fecha y la versión del texto aceptado (${CONTACT.consentVersion}).`,
      `Podés corregir tus datos o pedir la baja desde «Tus datos» en el inicio, o escribiendo a ${BRAND.email}.`,
      "Los respaldos que descargás incluyen tus recuerdos y no incluyen tu registro de contacto.",
    ],
  },
};

export default function Legal({ kind }) {
  const t = TEXTS[kind];
  return (
    <div>
      <PageHeader title={t.title} subtitle={BRAND.appName} />
      <div className="max-w-3xl mx-auto px-5 pt-8" data-testid={`legal-${kind}`}>
        <p className="text-xs text-amber-200 mb-5">Borrador para revisar antes de publicar. No constituye asesoramiento legal.</p>
        {t.body.map((p) => <p key={p} className="text-[#d5dfea] leading-relaxed mb-4">{p}</p>)}
      </div>
    </div>
  );
}
