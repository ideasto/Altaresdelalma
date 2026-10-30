# PRD — Altares del Alma · La Gata y la Magia

## Problema original
App web (antes «Mensajes Ancestrales») para alojar el amor y los recuerdos de seres amados: espacios independientes con Galería, Mazo Oráculo, Línea de Tiempo, Cartas y Libro de Recuerdos. Guardado en localStorage + respaldo JSON, sin cuentas. Estética azul + dorado, marca La Gata y la Magia, PDFs A4. El prompt maestro actualizado (Altares_del_Alma_Prompt_Maestro_Actualizado.md) define 5 entregas.

## Decisiones del usuario
- localStorage + respaldo/restauración (sin backend). Oráculo: carta al azar entre las escritas por el usuario.
- Logo oficial: PDF «LA GATA Y LA MAGIA LOGO» → `public/brand/*.png` (dorado y blanco, completo y horizontal).
- Junio 2026: pidió **Entregas 1 y 2 juntas**. URL de Google Sheets: **todavía no** (contactos quedan pendientes). Imagen Gemini: ignorar.
- Idioma: español rioplatense.

## Arquitectura
- SPA React. Rutas `/`, `/espacio/:id` (+ `oraculo|linea|galeria|cartas|libro`), `/terminos`, `/privacidad`; `/avatar/:id/*` redirige.
- Config central: `src/config/brand.js` (nombre, logos, email, URLs, FEATURES payments=false / ads=false / contactCapture=true, LIMITS, COMMERCIAL_PROPOSAL no aplicada).
- Store: `src/store/StoreContext.jsx` — `commit()` escribe primero y solo actualiza pantalla si la escritura terminó; `removeItem` con Deshacer; papelera de espacios.
- `src/lib/storage.js` — estados first/ok/migrated/corrupt/inaccessible, normalización, migración de formato viejo, respaldo v2, validación y aplicación de restauración.
- `src/lib/contact.js` — registro separado, consentimiento con fecha/versión/alcance, envío a `REACT_APP_CONTACT_ENDPOINT` (vacío), reintento con backoff y deduplicación. Doc: `/app/docs/CONTACTOS_APPS_SCRIPT.md`.
- PostHog (script de plataforma) con enmascarado de textos/inputs y bloqueo de imágenes en grabaciones.

## Implementado
### V1 (2026-06): módulos básicos, PDF por html2canvas.
### Entregas 1 + 2 (2026-06)
- Guardado fiable, aviso inline con descargar/copiar si falla, borradores en Cartas y Libro, pantalla para datos ilegibles / almacenamiento bloqueado, medidor de espacio, compresión 1600px.
- «Descargar mi santuario» (todo o por espacio, sin contacto), restauración con vista previa: cancelar / combinar (copia, reemplazar o saltear duplicados) / reemplazar con confirmación y descarga previa.
- Papelera de espacios; Deshacer en cartas, mazo, fotos, momentos y páginas.
- «Crear un espacio»: nombre, símbolo SVG opcional, fechas opcionales; registro obligatorio en el primer espacio (casilla no premarcada, Términos/Privacidad en borrador), «Tus datos» con baja.
- Visual: paleta HSL del prompt, degradado azul luminoso, logo oficial, sin flotación, hover escala 1.03, movimiento reducido, pie no fijo, bienvenida salteable + Ayuda.
- Panel: cabecera con foto fija, nombre editable, frase opcional; Galería destacada + 4 módulos con vistas previas vacías/con contenido.
- Cartas en sobres + lector (copiar, texto, PDF, compartir, editar, eliminar). Mazo con ayudas y origen; consulta separada, mezcla salteable, sin consultas simultáneas. Galería con carpetas con vista previa, pies, selección múltiple, compartir foto. Libro con título libre, subtítulo, tapa independiente, contratapa (título repetido, reseña, cierre, crédito), reordenar, importar copias desde fotos/cartas/momentos.

## Testing
- iteration_1: V1 OK. iteration_2: Entregas 1+2, 18 escenarios OK; bug de estado en RestoreDialog corregido y verificado.

## Pendiente / backlog
- P0 Entrega 3: 5 PDFs con maquetación propia (cartas sin cortar, mazo 63×90 mm 3×3 con dorsos, libro A4 consecutivo, cronología apaisada con uniones, galería con tamaños estándar). Hoy los PDF siguen siendo capturas (html2canvas) y pueden cortar textos largos.
- P1 Entrega 4: compartir piezas como imagen. P1 Entrega 5: estructura de cobros (Mercado Pago/PayPal) y publicidad apagadas.
- Pendiente de la creadora: URL de Apps Script, URL pública de la app, revisar textos legales, una muestra real del formato viejo para afinar la migración (hoy usa alias tolerantes).
- Fechas aproximadas/desconocidas en la línea de tiempo (Entrega 3D).
