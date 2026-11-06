# Revisión conjunta de Ecos del Alma

## Punto de partida

Revisión iniciada el 2026-11-06. Se trabaja en la rama existente y en la vista previa de Vercel. La persona usuaria autorizó publicar la revisión actual y seguir revisando la aplicación desde un enlace principal único. La publicación no significa que la revisión del producto esté terminada.

Vista previa estable: https://altaresdelalma-git-feat-ecos-del-alma-completo-la-gatayla-magia.vercel.app

El informe `artifacts/vercel-preview/verificacion.json` registra pruebas técnicas previas de rutas, recarga, cinco módulos y PDF, fotos, edición de tapa y guardado de carta. Es evidencia de funcionamiento; no sustituye la aprobación visual de la persona usuaria.

## Recorrido propuesto

1. Inicio y creación de un espacio: claridad de textos, aspecto y primeros pasos.
2. Panel del espacio: foto principal, navegación y favoritos.
3. Libro: tapa, páginas, edición, fotos y PDF.
4. Cartas: escritura, firma, recuperación y PDF.
5. Galería, cronología y mazo: carga, orden, edición y exportación.
6. Respaldo y restauración: explicación del almacenamiento y recuperación.
7. Celular: lectura, edición y botones en pantallas pequeñas.

En cada paso, registrar lo observado por la persona usuaria y los hallazgos reproducibles. Corregir, comprobar y actualizar la misma vista previa antes de pasar al siguiente bloque. Evitar cambiar el diseño aprobado sin una observación concreta.

## Pendientes comprobados en el código

| Pendiente | Situación actual | Qué falta |
| --- | --- | --- |
| Marco del mazo | `frontend/src/lib/deckFrame.js` identifica una recreación vectorial | Compararla durante la revisión y decidir si se conserva o se aporta el original |
| Contactos | No hay endpoint configurado; los datos permanecen pendientes en el navegador | Elegir el destino de recepción y conectar un servicio real si se desea esa función |
| Dirección definitiva | `BRAND.appUrl` está vacío | Definir al preparar producción; no es necesario para revisar la app |
| Impresión | Los PDF tienen comprobación digital previa | Prueba física de una hoja y doble faz del mazo |
| Sonido | Implementado y opcional | Escucha desde el dispositivo de la persona usuaria |
| Migración histórica adicional | No hay muestra real de formatos antiguos adicionales | Validar solo si se necesita importar esos datos |

Los recuerdos se guardan por navegador y dirección. Mantener la URL estable de rama y hacer respaldo antes de cambiar de dirección. No hay sincronización entre dispositivos. Pagos y anuncios están desactivados; no se presume que deban activarse.

## Primera sesión

Pendiente: abrir Inicio en la vista previa y recoger la primera observación. Todavía no se introdujeron cambios visuales o funcionales como parte de esta revisión.
