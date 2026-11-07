# Compartir recuerdos

La aplicación prepara archivos; no publica contenido automáticamente ni convierte un espacio privado en una página pública.

- Galería: seleccionar una o varias fotos y pulsar Compartir. Desde la foto ampliada también se comparte esa foto. Se conserva la copia guardada de la foto, sin fotografiar los controles de pantalla.
- Mazo de recuerdos: botón Compartir carta debajo de cada pieza. Se genera una imagen con marco y frase.
- Cartas: al abrir una carta, Compartir prepara imágenes del texto. Permanecen Copiar, Texto y PDF.
- Libro: Compartir tapa, página o contratapa actúa sobre lo que se está viendo. Se desactiva mientras se edita para no confundir un borrador con el contenido guardado.
- Línea de tiempo: Compartir historia prepara los momentos en su orden; cada momento tiene además su propio botón para compartir solo ese contenido.

La vista previa muestra todas las imágenes preparadas. Los textos largos se reparten a un tamaño legible. No se incluyen los datos de contacto ni recuerdos de otros módulos. Si el navegador admite compartir archivos, un segundo clic abre el menú nativo; los destinos dependen del dispositivo y de las aplicaciones instaladas. No se promete que Instagram u otra red aparezca en todos los equipos.

Si el navegador no lo admite, o rechaza los archivos, se puede descargar cada imagen y adjuntarla desde la aplicación elegida. El botón de descarga corresponde a la imagen visible, con navegación Anterior/Siguiente. Copiar texto sigue disponible. Cancelar el menú nativo no se muestra como error ni como publicación completada.

El PDF y el respaldo cumplen otras funciones: el primero es para leer/imprimir; el segundo es una copia restaurable del espacio. Compartir una imagen no crea un enlace de edición o de sincronización.

## Validación

- Node 22, compilación CI estricta.
- `node tests/browser/share-images.cjs`: texto y títulos extensos, palabras largas, contenido final conservado en imágenes sucesivas.
- `python tests/browser/sharing.py`: cinco módulos; dos fotos; tapa/página; historia/momento; PNG descargable; interacción nativa simulada con activación explícita; cancelación y error; alternativa de descarga; sin desborde a 390 px; ideas que conservan texto previo.
- Regresión de rutas, recargas, imágenes, edición, guardado de carta y cinco PDF con Chromium y contenido sintético. Cero solicitudes externas y errores JavaScript en esas pruebas locales.
- No se envió contenido a redes sociales reales ni se usaron recuerdos personales en las pruebas.
