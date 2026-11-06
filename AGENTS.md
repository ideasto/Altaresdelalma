# Instrucciones para futuras tareas de Codex

## Comunicación

Hablar directamente a la persona usuaria, sin emplear su nombre como vocativo. No usar fórmulas «sí, [nombre]», «bueno, [nombre]» o equivalentes. Esta preferencia es aplicable a todas las tareas que lean este repositorio; no implica que el archivo se cargue en chats ajenos al proyecto.

## Repositorio y despliegues

- Usar el checkout existente. Cada tarea en nube ya está aislada; no crear worktrees salvo solicitud explícita.
- Conservar la rama `feat/ecos-del-alma-completo` y la PR #1 mientras no se indique otra cosa.
- Reutilizar el único proyecto Vercel `altaresdelalma`, del equipo `la-gatayla-magia`. Identificadores y enlace en `docs/VISTA_PREVIA_VERCEL.md`. No crear proyectos duplicados.
- Desarrollo: frontend, Node 22.x, Yarn 1.22.22, instalación con lockfile congelado. Ejecutar compilación con CI=true.
- El 2026-11-06 la persona usuaria autorizó publicar la revisión 40d3dc0 en producción en este mismo proyecto. Usar un único enlace principal: https://altaresdelalma.vercel.app. No crear otro proyecto ni pedir que gestione enlaces por cada revisión. La rama Git de producción sigue siendo main; no se ha autorizado fusionarla. Las actualizaciones de la rama de trabajo generan Previews automáticamente; para actualizar el enlace principal hay que desplegar explícitamente la revisión aprobada con target production y comprobar READY. No confundir un push a esta rama con una actualización del enlace principal.
- Si se usa la API REST para una Preview, especificar `target: "staging"` de forma explícita y comprobar el target devuelto. El primer intento sin target fue marcado production por Vercel y se canceló; no confiar en el valor predeterminado.
- Preservar la protección de acceso de Vercel. Los accesos de automatización para pruebas deben ser temporales, sin imprimir secretos y revocarse al terminar.
- Credenciales: usar VERCEL_TOKEN del entorno a través de la ruta HTTPS configurada. No imprimirlo, copiarlo al repositorio ni exponerlo al frontend.
- Los recuerdos están guardados en el navegador por origen. Mantener el enlace de rama estable y recomendar respaldo antes de cambiar de dirección.
