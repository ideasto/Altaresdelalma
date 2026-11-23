# Revisión de interfaz y producto · 23 de noviembre de 2026

## Corrección visual

La tarjeta de un único espacio tenía un ancho máximo en el contenedor, pero conservaba el ancho de una columna de tres en pantallas grandes. Por eso medía apenas unos 124 px en una ventana ancha y comprimía la foto, las fechas y el botón. Ahora ocupa un panel central de hasta 672 px; el botón usa todo el ancho disponible. Dos espacios ocupan dos columnas desde 640 px y tres o más pasan a tres columnas desde 1024 px. El enlace para crear otro espacio queda debajo y sin competir con el recuerdo principal.

La compilación de producción pasó. Falta registrar aquí la comprobación visual final por tamaños y estados, que se realiza con contenido de ejemplo sin tocar recuerdos de usuarios.

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
