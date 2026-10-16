# PRD — Mensajes Ancestrales · La Gata y la Magia

## Problema original
App web para personas en duelo. Permite crear uno o varios avatares (personas o animales fallecidos), personalizar su foto (editable con lápiz), y dentro de cada avatar acceder a varios espacios: Oráculo, Línea de Tiempo, Galería, Cartas y Libro de Recuerdos. Casi todo editable (lápiz) y borrable (tacho). Cada espacio exporta a PDF A4 imprimible con la marca. Estética mística-moderna: azul profundo + dorado, glassmorphism, brillos, sin emojis. Emotivo pero con onda, no bajón.

## Decisiones del usuario
- Guardado: **localStorage** + respaldo/restauración JSON (sin cuentas, sin backend).
- Oráculo: la carta de respuesta sale **al azar entre las cartas que escribió el usuario**.
- Tipografías: **Cormorant Garamond** (títulos), **Caveat** (manuscrito), Plus Jakarta Sans (UI).
- **Multi-avatar**: cada avatar con su propio mazo, cartas, galería, línea de tiempo y libro.

## Arquitectura
- SPA React (CRA + craco). Datos en `localStorage` clave `ma_data_v1`. Sin backend ni API keys.
- Router: `/`, `/avatar/:id`, y subrutas `oraculo | linea | galeria | cartas | libro`.
- Store: `src/store/StoreContext.jsx` (persistencia instantánea en cada cambio).
- PDF cliente: `src/lib/pdf.js` (jsPDF + html2canvas, hojas A4 con marco dorado ornamentado `public/frame-a4.png` + sello del gato).
- Fotos: recorte/zoom con `react-easy-crop`, guardadas como dataURL (reducidas para aliviar localStorage).

## Implementado (2026-06)
- **Home**: santuario de avatares (crear/editar/eliminar), foto circular editable con lápiz, botones Respaldar/Restaurar (JSON).
- **Dashboard**: hub bento con 5 portales + foto y nombre del avatar.
- **Mazo Oráculo**: cartas (frase ≤90 + nombre), máx 21, CRUD con lápiz/tacho; Consultar Oráculo = pregunta visible → barajado 3s → flip 3D → carta al azar; PDF del mazo.
- **Cartas**: hoja crema (fecha, "Para X", cuerpo en Caveat, firma), máx 100, CRUD; PDF por carta y de todas.
- **Línea de Tiempo**: vertical alternada con línea dorada, íconos elegibles, foto opcional, CRUD; export con cabecera de imagen ajustable → PDF.
- **Galería**: subir hasta 100 fotos, hasta 5 carpetas (crear/renombrar/mover), borrar carpeta pregunta mover-a-general o borrar-todo; lightbox; PDF.
- **Libro de Recuerdos**: tapa con foto 160px editable (default avatar), páginas con profundidad, navegación, contratapa con sello del gato; PDF (html2canvas) con marca.
- **Marca**: footer fijo (z alto, nunca tapado por modales) con logo gato geométrico inline; sello en la contratapa del libro. Sin emojis.

## Testing
- iteration_1: 100% de los flujos frontend solicitados OK (sin backend). Persistencia tras reload verificada.

## Backlog / próximos
- P1: Subir audios/mensajes de voz por avatar.
- P2: Música ambiental mística on/off.
- P2: Compartir una carta o carta del oráculo como imagen.
- P2: Temas de color alternativos por avatar.
