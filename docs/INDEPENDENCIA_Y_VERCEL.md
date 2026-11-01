# Ecos del Alma independiente y preparación de Vercel

La rama de trabajo sigue siendo `feat/ecos-del-alma-completo` y la propuesta es [PR #1](https://github.com/ideasto/Altaresdelalma/pull/1). No se creó otro repositorio, otro proyecto de alojamiento ni un despliegue.

## Auditoría y cambios

| Elemento encontrado | Acción y motivo |
| --- | --- |
| `@emergentbase/overlay` y `@emergentbase/visual-edits` descargados de `assets.emergent.sh` | Retirados del manifiesto y de CRACO. Inyectaban herramientas del editor y su overlay, no funciones del producto. |
| Adaptadores `emergentOverlayCraco`, `withVisualEdits` e inyección de middleware/Babel | Retirados. Se conservan el alias `@`, el control de hooks, la configuración de observación de archivos y el adaptador compatible con webpack-dev-server 5. |
| `assets.emergent.sh/scripts/emergent-main.js` | Retirado del HTML. También desaparece la posibilidad de que ese script inyecte insignias o herramientas remotas. No había una insignia de Emergent en los componentes actuales. |
| PostHog con destino `ap.emergent.sh` | Retirado por completo del HTML: inicializador, carga remota, configuración de grabación y clave pública de proyecto. No se reemplaza por otra analítica. |
| Manejador global que silenciaba `DataCloneError` de `PerformanceServerTiming` | Retirado junto con los scripts de plataforma. No se ocultan errores del navegador para sostener una integración eliminada. |
| Identificador sin uso `home-emergent-link` y selector de wrappers de depuración | Retirados; no son funciones de la app. |
| `emergentintegrations==0.2.2` en requisitos de Python | Retirado. No existe ningún import de este paquete en el backend; el frontend no usa ese backend. |
| `.emergent/emergent.yml` y dos marcadores de arranque/restauración | Retirados. El manifiesto solo tenía metadatos de imagen, trabajo y fecha: no era un pipeline de despliegue. |
| Resultados históricos bajo `.emergent/testing/`, `test_reports/` y referencias en documentos antiguos | Conservados como evidencia histórica; no se ejecutan ni se incluyen en el frontend. No se borró todo por coincidir con una palabra. |
| `.gitconfig` versionado | Solo contiene identidad de autor. Git no lo incluye automáticamente, y la configuración local inspeccionada no lo incluye. No concede permisos ni despliega. Se conserva. No se publican aquí valores de identidad o credenciales. |
| Comprobaciones de salud en `frontend/plugins/health-check` | Conservadas: código local, sin llamadas de plataforma y desactivado por defecto. Útil para desarrollo, no necesario en Vercel. |
| Google Fonts en HTML | Sustituido por fuentes locales: Cormorant y Caveat ya estaban en `public/fonts`; Plus Jakarta Sans se empaqueta desde `@fontsource/plus-jakarta-sans@5.3.0`, con licencia local. Mismos nombres tipográficos y recursos de marca. |

Logo original, imágenes, marfil, azules y dorados, animaciones, cinco módulos, claves de IndexedDB/localStorage y formatos de respaldos no se cambiaron. El único ajuste funcional de código de edición fue estabilizar la referencia de `rebase` del hook de borradores y declarar su dependencia: elimina dos avisos de hooks que impedirían compilar con `CI=true`, sin desactivar comprobaciones.

## Dependencias externas que quedan

| Etapa | Requisitos |
| --- | --- |
| Instalación/compilación | Node **22.x**, Corepack, Yarn **1.22.22**, paquetes públicos del registro npm/Yarn. `frontend/yarn.lock` fija versiones, URLs e integridad. La instalación de prueba con caché vacía realizó 1.499 descargas, todas de `registry.yarnpkg.com`. Corepack puede descargar Yarn desde `registry.npmjs.org` cuando todavía no está instalado. |
| App funcionando | Archivos estáticos del mismo dominio; fuentes, imágenes de marca y librerías incluidas. IndexedDB/localStorage y APIs normales del navegador. No requiere API, MongoDB, credenciales, analítica o dominio de Emergent. |
| Contactos opcionales | `REACT_APP_CONTACT_ENDPOINT`, solo si Sole decide conectar un endpoint real en otro trabajo. Vacío no envía datos y conserva el estado pendiente local. No es necesario para usar los cinco módulos. |
| Enlaces voluntarios | Instagram y correo de La Gata y la Magia se abren cuando la persona pulsa esos enlaces; no son dependencias de arranque ni de PDF. |
| Codespaces opcional | Cuenta de GitHub y descarga de su imagen oficial de Microsoft. Es una alternativa de desarrollo; Vercel no necesita Codespaces. |

Se conserva CRACO/Create React App por compatibilidad con la app actual, sin reescribirla. Hay dependencias antiguas y avisos de pares/resoluciones durante Yarn; el bloqueo hace reproducible la instalación, no convierte esas dependencias en modernas. Una migración de herramienta de compilación puede evaluarse por separado.

## Verificación ejecutada

1. Copia temporal del frontend **sin `node_modules`, `build` ni `.env`** y caché de Yarn nueva. Node 22.23.4. Instalación con `--frozen-lockfile --non-interactive`; hash del lockfile intacto.
2. Build de esa copia con `CI=true corepack yarn build`: correcto, sin avisos ESLint. No se usó `CI=false`, ni se desactivó TLS/integridad.
3. Compilación servida localmente con las reglas de `frontend/vercel.json`: primero archivo existente y luego fallback a `index.html`.
4. Chromium contra esa compilación, bloqueando y registrando **todas** las solicitudes a otros orígenes. Se comprueban entrada directa y recarga de inicio, panel, cinco módulos, términos y privacidad; también la redirección antigua `/avatar/:id/libro`.
5. Fuentes locales, carga de foto, edición de tapa y guardado/recarga de carta. Cinco PDF descargados desde los botones reales de la interfaz.
6. Prueba de escritura fallida/borradores y restauración contra el build estático mediante `tests/browser/ui.py`.

Los resultados definitivos se guardan en `artifacts/independiente/`. La prueba externa real de Vercel queda pendiente porque Sole pidió **no desplegar**. El servidor local valida las mismas reglas estáticas, no se presenta como una prueba ejecutada en Vercel.

Repetir sobre una instalación limpia y Node 22:

```sh
cd frontend
corepack yarn install --frozen-lockfile --non-interactive
CI=true corepack yarn build
cd ..
python tests/browser/serve_static.py --root frontend/build --port 3100
```

En otra terminal desde la raíz del repositorio:

```sh
python tests/browser/independent.py
ECOS_TEST_BASE_URL=http://127.0.0.1:3100 python tests/browser/ui.py
```

Se necesita Playwright y Chromium para estas pruebas, no para compilar o alojar el sitio. Los ejemplos son datos sintéticos, no recuerdos reales.

## Un único proyecto de Vercel, cuando Sole autorice publicar

**Por ahora no pulses Deploy ni crees el proyecto.** Primero revisar y fusionar la PR #1; la fuente de la versión principal será `main` de este mismo repositorio.

Cuando decidas importar:

1. Entrar a Vercel → **Add New… → Project → Import Git Repository**.
2. Elegir **`ideasto/Altaresdelalma`**. Si Vercel ya muestra un proyecto vinculado a ese repositorio, abrir sus ajustes y reutilizarlo: no importar un segundo proyecto. No crear un repositorio nuevo.
3. Revisar estos valores antes de autorizar el despliegue:

| Ajuste | Valor exacto |
| --- | --- |
| Repositorio | `ideasto/Altaresdelalma` |
| Production Branch | **`main`**, después de fusionar la PR revisada |
| Root Directory | **`frontend`** |
| Framework Preset | **Create React App** |
| Node.js Version | **22.x** |
| Install Command | `corepack yarn install --frozen-lockfile --non-interactive` |
| Build Command | `corepack yarn build` |
| Output Directory | **`build`** (relativa a `frontend`, no `frontend/build`) |
| Environment Variable | `ENABLE_EXPERIMENTAL_COREPACK=1` para habilitar la versión de Yarn fijada por `packageManager`; aplicar a Production y Preview si se utilizan previews |
| Contactos | Dejar **sin definir** `REACT_APP_CONTACT_ENDPOINT` hasta disponer de una integración real |
| Backend / base de datos | Ninguno para esta SPA |
| Credenciales de Emergent | Ninguna; no copiar claves o variables de ese servicio |

`frontend/vercel.json` deja escritos preset, instalación, build, salida y rutas. `frontend/.nvmrc`, `.node-version` y `package.json → engines.node` fijan Node 22 para desarrollo y selección de versión. Production Branch y Root Directory son ajustes del proyecto en Vercel, no quedan fijados por cambiar el nombre de una rama o el archivo JSON.

Los archivos estáticos —incluidas fuentes y PDF generados por el navegador— se sirven correctamente; para rutas de React sin archivo físico se devuelve `index.html`. No hay backend al que redirigir `/api`.

En Vercel, **Production corresponde a `main`**. Las vistas de ramas son Preview y no deben promocionarse a Production para saltarse la revisión. No activar automatizaciones de despliegue mientras la publicación no esté autorizada.

Al usar el futuro dominio de Vercel, descargar antes **Descargar mi santuario** desde el dominio anterior y luego **Restaurar** en el nuevo. El almacenamiento del navegador está separado por dominio; cambiar de alojamiento no traslada los recuerdos automáticamente.

## Automatizaciones y permisos de cuenta

**Comprobado en este checkout:** no hay workflows versionados en `.github/workflows`, ni hooks locales activos (solo los ejemplos estándar de Git). La configuración retirada de `.emergent` era metadato, no una tarea ejecutable. Los scripts actuales de instalación/arranque no llaman a Emergent ni despliegan. Conservar una PR abierta o quitar esos archivos no revoca el acceso de una aplicación de GitHub.

**No se pudo comprobar desde aquí:** instalaciones de GitHub Apps, OAuth, webhooks, deploy keys, permisos personales y conexiones de la cuenta de Emergent. No hay una API de GitHub disponible con permiso para inspeccionar esas pantallas. Por eso no afirmamos que Emergent haya perdido la capacidad de hacer commits o despliegues desde su servicio.

Sole debe revisar, sin compartir valores secretos:

- GitHub → foto de perfil → **Settings → Applications → Installed GitHub Apps**. Si aparece Emergent o su aplicación de conexión, abrir **Configure** y quitar el acceso a `Altaresdelalma` o desinstalarla si ya no se utiliza.
- En **Applications → Authorized OAuth Apps**, revocar la autorización relacionada con Emergent si existe. Revisar también **Authorized GitHub Apps** si la conexión aparece allí.
- Repositorio → **Settings → Webhooks**: identificar por nombre/dominio y desactivar o quitar únicamente los webhooks de Emergent.
- Repositorio → **Settings → Deploy keys** y **Collaborators and teams / Manage access**: retirar únicamente claves o accesos creados para esa plataforma, una vez identificados.
- **Settings → Secrets and variables → Actions** y permisos de Actions: revisar si quedaron credenciales o conexiones usadas por una automatización antigua. No mostrar ni copiar los valores. En este checkout no hay un workflow activo que las use.
- En Emergent, desconectar el repositorio y desactivar el despliegue/auto-sync del proyecto anterior. No borrar recuerdos almacenados en el navegador antes de exportarlos.
- En GitHub, proteger `main` con revisión de PR y limitar escrituras directas según las opciones de la cuenta. Esta tarea no cambia permisos de cuenta automáticamente.

El objetivo es revocar accesos concretos de la plataforma anterior, no borrar integraciones legítimas de GitHub/Codespaces o del futuro proyecto único de Vercel.
