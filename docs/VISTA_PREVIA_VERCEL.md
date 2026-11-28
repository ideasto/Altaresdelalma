# Enlace principal activo

Desde el 2026-11-06 se usa **https://altaresdelalma.vercel.app** como enlace principal único. La persona usuaria autorizó publicar la revisión 40d3dc0; el despliegue dpl_Hj3nVQkJDZNMTCrNHYWsSfWiyzKn alcanzó READY con target production. No se creó otro proyecto ni se fusionó main.

La persona usuaria autorizó después explícitamente el acceso sin cuenta de Vercel para sus personas de prueba y futuras visitas. Se aplicó protección estándar prod_deployment_urls_and_all_previews y se comprobó el dominio principal con un contexto de Chromium nuevo, sin cuenta, cookies, token ni bypass: HTTP 200, aplicación renderizada y sin errores JavaScript. Las vistas previas siguen protegidas.

La rama de trabajo sigue generando Previews al hacer push. Para actualizar el enlace principal hay que desplegar explícitamente una revisión aprobada en producción; un push a la rama de trabajo por sí solo no lo actualiza. Las versiones previas son historial del mismo proyecto, no proyectos duplicados. Las instrucciones históricas siguientes describen la preparación inicial, anterior a esta autorización.

Si se cargaron recuerdos en otro enlace, exportar un respaldo desde ese enlace e importarlo en el principal: el almacenamiento del navegador está separado por dirección.

---

# Vista previa de Ecos del Alma en Vercel

## Abrir la aplicación

**[Abrir Ecos del Alma](https://altaresdelalma-git-feat-ecos-del-alma-completo-la-gatayla-magia.vercel.app)**

Es la URL estable de la rama. Vercel mantiene la protección de acceso: si aparece su inicio de sesión, usar la cuenta que pertenece a LaGataylaMagia. La aplicación almacena recuerdos en el navegador; una cuenta de Vercel no sincroniza esos recuerdos.

Enlace de la revisión verificada: https://altaresdelalma-f2aybee9b-la-gatayla-magia.vercel.app

Registro de compilación: https://vercel.com/la-gatayla-magia/altaresdelalma/dpl_D8ngksUuYYK7zifEWNg127qxRQ4F

## Proyecto único

- Equipo: LaGataylaMagia (`la-gatayla-magia`).
- Proyecto: `altaresdelalma`; ID `prj_c5tb83IggVe72A7ju7J7L1YXNJte`.
- Equipo ID: `team_SZRvBxHq4U9ncmkNyALbmenX`. Estos identificadores no son credenciales.
- GitHub: `ideasto/Altaresdelalma`.
- Rama de trabajo: `feat/ecos-del-alma-completo`; revisión funcional verificada `a257360df96a0c71f2a42cd80e4b78a5500e7adc`.
- PR #1 existente; no se creó otra PR ni otro repositorio.
- Production Branch: `main`; no se fusionó ni modificó.
- Root Directory `frontend`, Node `22.x`, preset Create React App, salida `build`.
- Instalación `corepack yarn install --frozen-lockfile --non-interactive`.
- Build `corepack yarn build`; variable de build no secreta `ENABLE_EXPERIMENTAL_COREPACK=1`.
- Sin credenciales de aplicación ni endpoint de contactos configurados. Sin servicios de Emergent.

## Flujo para próximas tareas

Codex modifica y prueba el código en GitHub; Vercel compila y aloja la app. No se edita el código directamente en Vercel. Reutilizar este proyecto y mantener main como versión principal. Los pushes a la rama de trabajo deben producir Previews; comprobar la integración y el resultado, sin asumir que un push equivale a un despliegue exitoso. Si hace falta desplegar por API, indicar explícitamente target staging. Mantener producción pendiente de autorización.

El archivo local `frontend/.vercel/project.json` vincula la CLI con este proyecto; está ignorado por Git. Se puede reconstruir con los identificadores anteriores. Nunca guardar ahí el token de acceso.

## Validación ejecutada

- Rama sincronizada en avance rápido con GitHub, sin cambios de main.
- Node 22, instalación congelada y compilación CI=true correctas.
- Pruebas locales y en el despliegue real de Vercel: nueve rutas con apertura directa/recarga, redirección antigua, cinco módulos y cinco descargas PDF, carga de foto, edición de tapa, guardado y recarga de carta, escritorio y celular.
- Las solicitudes a orígenes externos se bloquearon y registraron: cero solicitudes externas, cero errores JavaScript, cero respuestas HTTP fallidas.
- Se mantuvo la protección de Vercel. Se generó un acceso de automatización temporal únicamente para las pruebas y se revocó al terminar. No se guarda ni comparte ese acceso.
- Los datos de pruebas son sintéticos y sus contextos del navegador aislados; no se modificaron recuerdos reales.

## Incidencia corregida

Vercel clasificó el primer intento sin campo target como production, aunque se solicitó sin ese destino basándose en la documentación. Se canceló inmediatamente y la API confirmó CANCELED. El despliegue aceptado y verificado usa target staging y estado READY. No se fusionó main ni se promovió un despliegue a producción.

El entorno de Codex ya pudo autenticar la API de Vercel y operar sobre el proyecto. No hace falta repetir la creación del token para las próximas tareas mientras el acceso siga válido.
