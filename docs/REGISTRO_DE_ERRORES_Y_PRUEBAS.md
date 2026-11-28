# Registro de errores y pruebas del memorial

## Qué pasó en noviembre de 2026

| Error | Consecuencia | Comprobación para la siguiente entrega |
| --- | --- | --- |
| Di por resuelto el contraste al comprobar los colores definidos en CSS y el modo oscuro de Chromium. | Dark Reader vuelve a colorear la página de otra forma. En las capturas el papel marfil pasó a marrón (RGB 36, 29, 7) y la tinta se aclaró. | Reproducir primero la captura. Cuando el fallo es de color, comprobar también los píxeles renderizados. Probar el modo normal, el modo oscuro de Chromium y el motor de Dark Reader por separado si alguno interviene. |
| Apliqué cambios de azul en varios lugares, sin separar desde el principio fondo, cabecera y tarjeta. | Se oscureció el fondo en el navegador de la usuaria y quedaron cabeceras y paneles de distintos colores. | Mantener los valores del degradado aprobado. Usar un solo color de superficie para cabeceras y paneles (#1E5682). Comparar la captura antes y después y confirmar que cambió la zona pedida. |
| Probé la miniatura de una carta y la usé como evidencia de todo el módulo. | La carta abierta y los editores todavía podían aparecer oscuros. | Abrir lista, lectura, editor y carta revelada. Probar un texto guardado y otro recién escrito. Revisar tanto escritorio como un ancho de celular. |
| Probé compartir el mazo desde la lista, sin recorrer la acción de sacar una carta. | La carta guardada tenía un icono de compartir, pero la carta recién sacada carecía de esa acción. | Entrar desde el panel, sacar una carta y compartirla desde el resultado. El archivo debe corresponder a la misma carta que aparece en la lista. |
| La exportación esperaba las fuentes que ya se usaban en pantalla. | La primera imagen del mazo podía dibujar la frase con una cursiva de reemplazo. | Cargar las fuentes del PNG antes de medir el texto. Comparar la primera descarga de la lista con la carta revelada en una sesión nueva. |
| Informé que estaba corregido antes de cubrir el recorrido y el navegador donde se veía el fallo. | La usuaria tuvo que volver a probar lo mismo y mandar más capturas. | Publicar después de observar el resultado en una compilación de prueba. Repetir el recorrido en el dominio público y aclarar qué se simuló en lugar de prometer que se probó en un equipo concreto. |

## Qué revisar cuando cambia una acción de exportación

1. Abrir cada acción desde donde la encontraría la persona: foto ampliada y selección en la galería, carta escrita abierta, pieza guardada y pieza recién sacada del mazo, momento e historia, tapa, página y contratapa.
2. Comparar el contenido de la vista previa y la descarga. Confirmar que se genera un PNG válido y que se puede avanzar por imágenes sucesivas. En la prueba del menú nativo, simular la acción con confirmación explícita, cancelación y error. Mantener disponible la descarga de imagen.
3. Descargar los PDF de galería, mazo, cronología, cartas y libro. Abrir los archivos y comprobar que tienen contenido, tamaño y orientación correctos. Incluir la descarga de una carta individual, la medida de 63 × 90 mm en el mazo y el final de los textos largos de cartas y libro.
4. Repetir en un ancho de celular y en escritorio, con un espacio ficticio. Usar la compilación de producción y volver a ejecutar en el enlace publicado. Informar por separado las comprobaciones que requieren un dispositivo o una red social real.

Las pruebas de navegador están en `tests/browser/sharing.py` e `independent.py`. Se ejecutan con Playwright y Chromium. La segunda necesita PyMuPDF para abrir los PDF. `MEMORIA_TEST_URL` permite usar una compilación local o el dominio público. `MEMORIA_TEST_WIDTH` selecciona el ancho y `MEMORIA_TEST_OUTPUT` el directorio de resultados. Los archivos de prueba se generan con datos ficticios.
