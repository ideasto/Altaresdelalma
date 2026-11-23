# Revisión de interfaz y producto · 23 de noviembre de 2026

## Corrección visual

La tarjeta de un único espacio tenía un ancho máximo en el contenedor, pero conservaba el ancho de una columna de tres en pantallas grandes. Por eso medía apenas unos 124 px en una ventana ancha y comprimía la foto, las fechas y el botón. Ahora ocupa un panel central de hasta 672 px; el botón usa todo el ancho disponible. Dos espacios ocupan dos columnas desde 640 px y tres o más pasan a tres columnas desde 1024 px. El enlace para crear otro espacio queda debajo y sin competir con el recuerdo principal.

La compilación de producción pasó. Comprobé en el enlace principal, en un navegador de prueba separado y con nombres inventados:

| Estado o recorrido | Resultado observado |
| --- | --- |
| Sin espacios | Una invitación central para crear el primero. |
| Un espacio | Panel central ancho; foto, nombre y botón sin apretarse. |
| Dos espacios | Dos tarjetas de ancho similar, sin tercera columna vacía. |
| Tres espacios | Tres tarjetas de 347 px y botones de 281 px en una ventana de 1363 px, sin desplazamiento horizontal. |
| Panel, galería, mazo, cartas y libro | Se abrieron y se creó contenido de ejemplo; la galería vacía mostró solo «Todas» y «Nueva carpeta». |
| Línea de tiempo | Al cargar 1999 y luego 1988 se mostró primero 1988. |
| Tapa, página y PDF | La frase de tapa y el texto de página conservaron saltos de línea; el PDF del libro se descargó. |
| Compartir carta | Mostró una vista previa de la pieza elegida y la alternativa de descargar la imagen cuando el navegador no admite compartir archivos. |

Al recorrer formularios detecté y corregí controles sin nombre accesible: la selección de íconos del momento, el cuerpo y la firma de una carta, y el botón para quitar la foto del momento. El selector de íconos pasa de siete a cinco columnas bajo 640 px para que sus botones no se superpongan en pantallas angostas. La comprobación visual se realizó en una ventana de escritorio; la vista móvil y la impresión física siguen requiriendo una comprobación con un dispositivo y papel reales.

## Investigación y decisiones de diseño

| Hallazgo | Aplicación propuesta | Prioridad |
| --- | --- | --- |
| La experiencia digital del duelo varía entre personas y momentos; conviene que el producto simplifique las elecciones y no imponga un recorrido. [Cook et al., 2025](https://www.tandfonline.com/doi/full/10.1080/13576275.2025.2451093) | Mantener el inicio con una acción sencilla y la opción de continuar luego. Mostrar ayuda contextual en tapa, PDF y respaldo, sin obligar a completar todos los módulos. | Alta |
| Una revisión de 4 revisiones y 35 estudios encontró resultados prometedores para apoyos en línea, pero formatos y poblaciones muy distintos; no demuestra eficacia clínica de este memorial. [Laranjeira et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11673319/) | Presentar la app como espacio para recuerdos, sin prometer tratamiento del duelo. Si se agregan recursos de apoyo, distinguirlos del producto. | Alta |
| El control sobre quién ve un recuerdo es una decisión central. Our Memory Book ofrece niveles público, enlace y privado, exportación PDF y archivos de respaldo. [FAQ del producto](https://ourmemorybook.com/faq/) | Antes de cualquier enlace público o colaboración familiar, diseñar permisos, revocación y propiedad de los contenidos. En el estado actual, compartir solamente la pieza que la persona elige sigue siendo más claro. | Alta |
| WCAG 2.2 recomienda contraste legible, redistribución del contenido sin pérdida y objetivos táctiles mínimos de 24 × 24 CSS px. [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Verificar contrastes de azules/dorados y controles en celular y con zoom; no medir calidad por el aspecto en una sola ventana. | Alta |
| Otra app de memoria ofrece avisos de fechas importantes que pueden pausarse y PDF para conservar fuera de la app. [AngelMemoryBook, ficha oficial](https://apps.apple.com/us/app/angelmemorybook/id6781133433) | Si se evalúan recordatorios, que sean optativos y pausables. No activar aniversarios por defecto. Mantener una explicación visible de la diferencia entre PDF y respaldo restaurable. | Media |

### Próximos experimentos concretos

1. Comparar dos variantes de la tapa con usuarios reales: texto centrado frente a posición vertical seleccionable en tres lugares, conservando los saltos de línea en pantalla y PDF. Revisar además el marco blanco con una foto real y una de bajo contraste.
2. Hacer una prueba de impresión física del PDF con márgenes, sangrado y corte; una previsualización en pantalla no prueba el resultado de imprenta.
3. Probar la comprensión de «Descargar PDF», «Descargar respaldo» y «Restaurar» con personas que no participaron del desarrollo. La primera acción produce una pieza legible; la segunda conserva datos editables.
4. Evaluar compartir una selección de páginas o momentos con una vista previa y confirmación. Un enlace a un memorial privado no serviría sin una arquitectura de publicación y permisos.

No se propone una puntuación de actividad, presión para volver ni una simulación de la voz de alguien fallecido. Son decisiones de producto que requieren investigación y consentimiento explícito, no un ajuste visual.
