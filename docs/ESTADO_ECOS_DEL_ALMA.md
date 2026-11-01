# Estado de Ecos del Alma

## Alcance y referencia

Trabajo en `feat/ecos-del-alma-completo`, desde `790043b9bc346ad39a2ba98b6401d2a2d65b4db4`. La última captura de Sole es la referencia aprobada: distribución estable, marfil, marcos claros, dorado cálido y azul moderadamente más luminoso y saturado. No se publica ni se fusiona con main.

## Implementación

- Guardado asíncrono esperado por consumidores de espacios, fotos, cartas, mazo, cronología y libro; botones principales bloquean solicitudes duplicadas. Editores conservan contenido cuando la escritura falla.
- Borradores pendientes protegidos hasta recuperar/descartar; texto de cartas y páginas recuperable, guardado al cerrar cuando corresponde. Foto y tipografía de página incluidas en borrador; si localStorage no permite guardarlo, se ofrece copiar/descargar texto.
- IndexedDB: reemplazo en una única transacción, aborto explícito ante errores sincrónicos, reinserción segura de imágenes al reintentar. Migración compara contenido completo, incluyendo imágenes y papelera, y marca verificación antes de retirar la copia localStorage. Arranque único también en StrictMode.
- Lectura localStorage independiente de la posibilidad de escritura. Respaldos inválidos se rechazan antes de mutar estado; propiedades desconocidas del espacio y elementos actuales se conservan. Compatibilidad anterior limitada a los alias ya existentes: no se agregó un formato histórico inventado.
- Papelera conservada en respaldos globales; fotos eliminadas conservan el archivo dentro de un registro recuperable por espacio. Botón de recuperación disponible en Galería tras recargar.
- Cinco exportadores paginados existentes conectados a sus pantallas, sustituyendo exportación por capturas. Libro consecutivo, cartas con renglones y continuación, mazo 63 × 90 mm con dorsos espejados, cronología apaisada con referencias y continuación, fotos completas y marco opcional.
- El marco del mazo es una recreación vectorial que ya estaba en el repositorio (`lib/deckFrame.js`), no el original aprobado. No se imprime la palabra «provisional». Ahora se usa también en la vista de carta.
- Tapa/contratapa editables en la composición compartida de lectura y edición; página y carta sobre papel marfil. Título independiente, foto visible y opciones clásica/manuscrita y tres tamaños; agregar página arriba y al final; traer recuerdos conservado.
- Frase del mazo editable sobre la pieza, sin estrella decorativa; medición según la fuente y tamaño físico del PDF. Firma de carta nueva tomada del contacto, editable y eliminable.
- Fondo y superficies azules con profundidad; footer sin franja opaca. Logo original conservado y enlace al inicio. Sin flotación de foto principal. Foco y movimiento reducido conservados.
- Fechas parciales o ausentes; punto dorado predeterminado y símbolos opcionales. Orden manual para momentos sin fecha.
- Vista favorita por módulo, predeterminada a la más reciente; posiciones estables. Mezcla, giro y salto conservados; tono breve Web Audio opcional, silenciado inicialmente y preferencia recordada.
- Recordatorio discreto de respaldo solo con cambios nuevos. Se aclara almacenamiento en navegador sin sincronización. Pagos/publicidad siguen apagados. Contactos sin endpoint quedan pendientes, nunca simulados como enviados; respaldos sin datos de contacto.

## Evidencia ejecutada

- `yarn build`: última compilación de producción correcta, 15,57 s; verificación de whitespace sin errores.
- Navegador Chromium real, escritorio 1440 × 1050 y celular 390 × 844 sin desborde horizontal.
- IndexedDB: 24 JPEG sintéticos de 1800 × 1200, 34.682.960 caracteres codificados (~33,1 MiB); cinco páginas, textos largos y papelera. Lectura completa comprobada y restauración en otro contexto limpio, sin imágenes faltantes. No implica capacidad ilimitada: depende de cuota y dispositivo.
- Error de cuota inyectado durante reemplazo: datos anteriores intactos. Error de escritura inyectado en UI: editor y borrador conservados, recuperación y posterior guardado correcto.
- Lectura con localStorage lleno; rechazo de tres respaldos malformados. Recuperación de foto con archivo tras eliminar y recargar. Opciones de restauración reiniciadas al abrir nuevamente.
- Edición del libro, mezcla, giro, salto y preferencia de sonido comprobados en navegador, sin errores JavaScript. La salida acústica física no se escucha desde esta máquina.
- Cinco PDF descargados: libro 13 páginas; cartas 5; mazo 4 (11 cartas con hoja incompleta y reversos); cronología 6 apaisadas; galería 3. Texto seleccionable y finales de textos largos comprobados con PyMuPDF. A4 vertical 210 × 297 mm, cronología 297 × 210 mm.
- Integraciones externas bloqueadas intencionalmente durante los tests del navegador. No se verificaron envíos de contactos, Instagram, analítica ni descarga de fuentes externas. Los PDF usan fuentes locales. No hay endpoint real de contactos configurado.

## Entregables y ejecución

`artifacts/` contiene capturas de escritorio/celular, comparación de estilos anteriores aplicada a la composición actual, edición y mazo, cinco PDF sintéticos y reportes JSON. Son datos de prueba, no recuerdos de Sole.

```sh
cd /workspace/Altaresdelalma/frontend
corepack yarn install --frozen-lockfile --non-interactive
corepack yarn build
BROWSER=none HOST=0.0.0.0 PORT=3000 corepack yarn start
```

Pruebas: con servidor en 3000, desde la raíz ejecutar:

```sh
node - <<'JS'
require('./frontend/node_modules/webpack')(require('./tests/browser/webpack.cjs'), (err, stats) => {
  if (err) throw err;
  console.log(stats.toString({all:false, errors:true}));
  process.exitCode = stats.hasErrors() ? 1 : 0;
});
JS
python tests/browser/validate.py
python tests/browser/ui.py
python tests/browser/inspect_pdfs.py
```

Requieren Playwright, Chromium en `/usr/bin/chromium` y PyMuPDF para inspección de PDF. No requieren MongoDB. El entorno ya tiene estas herramientas. Las pruebas usan contextos aislados y datos sintéticos, nunca el perfil real de la usuaria.

## Límites y revisión pendiente

- Falta una muestra real del formato histórico para validar migraciones adicionales. Los originales históricos no se borran.
- Comprobación geométrica automatizada no reemplaza una prueba física de impresora: doble faz al 100 %, volteo por borde largo y prueba de una hoja antes de imprimir el mazo completo.
- Los campos editables representan el contenido de la pieza; las continuaciones de textos largos se resuelven al exportar. La pantalla puede desplazarse para leer todo el texto; no es una previsualización de cada salto físico de página.
- No hay pagos, anuncios, sincronización remota ni integración comercial completa. Faltan URL pública, endpoint de contactos y decisiones legales/comerciales.
- La PR ya existe: [PR #1](https://github.com/ideasto/Altaresdelalma/pull/1), confirmada por Sole. No se creó otra. Se conserva la rama `feat/ecos-del-alma-completo` y no se modifica main ni se despliega en producción.

## Vista previa interactiva

Este chat no proporciona publicación de puertos ni URL de vista previa. Se volvió a iniciar la app de esta rama y se verificaron internamente la página y su JavaScript por HTTP. No se presenta un enlace de loopback como si fuera accesible desde el navegador de Sole.

La alternativa preparada es GitHub Codespaces, con instalación, arranque y puerto 3000 automáticos en `.devcontainer/`. La guía para Sole está en [PROBAR_EN_NAVEGADOR.md](PROBAR_EN_NAVEGADOR.md): abrir la rama → Code → Codespaces → Create codespace on feat/ecos-del-alma-completo. Al terminar, Ports → 3000 → Open in Browser si no se abre sola. La creación requiere su cuenta de GitHub; no se lanzó un Codespace desde este chat y no se afirma que exista una URL externa todavía.

La imagen oficial de Node 22 fue comprobada en el registro de Microsoft. JSON y sintaxis de scripts válidos. El helper de arranque reconoce el servidor ya activo y no lo duplica. Compilación correcta con Node 22.23.4 (advertencias de dependencias de hooks ya existentes, sin errores). Se verificó el reinicio con el helper bajo Node 22 y la respuesta de la página y su JavaScript. Codespaces como servicio externo todavía requiere la creación por parte de Sole.

## Independencia de Emergent y preparación para Vercel

Se retiraron los dos paquetes de edición de Emergent, sus adaptadores e inyección de scripts, PostHog hacia Emergent, metadatos de arranque y el requisito Python sin uso. Se conservaron los recursos y la lógica del producto. Las fuentes se sirven localmente. Los archivos históricos de pruebas no se eliminaron por coincidir con un nombre.

Node 22.x y Yarn 1.22.22 fijados, `frontend/yarn.lock` versionado, Codespaces usa instalación congelada. `frontend/vercel.json` contiene instalación, build, salida `build` y rutas de SPA respetando archivos existentes. Para el futuro proyecto único, Root Directory `frontend`, Production Branch `main` tras revisar y fusionar la PR #1; no se desplegó.

Prueba nueva en una copia temporal sin dependencias, build ni .env, con caché nueva: 1.499 descargas solo desde `registry.yarnpkg.com`, integridad y hash del lockfile intactos. Compilación con Node 22.23.4 y `CI=true` correcta y sin advertencias ESLint; servidor de desarrollo limpio también compila. Prueba Chromium del build estático: nueve rutas con apertura directa y recarga, ruta antigua, fuentes locales, cinco módulos y cinco descargas PDF, edición de tapa, carga de foto y guardado/recarga de carta. Cero solicitudes externas, errores JavaScript o respuestas HTTP fallidas. Regresión de borradores y recuperación pasada contra ese build.

Evidencia: `artifacts/independiente/`. Configuración exacta y guía de permisos de GitHub: [INDEPENDENCIA_Y_VERCEL.md](INDEPENDENCIA_Y_VERCEL.md). No se pudieron inspeccionar desde la API las GitHub Apps, webhooks ni permisos de cuenta; la ausencia de workflows/hook activos en el checkout no prueba que Emergent carezca de acceso externo. Sole debe revisar y revocar los accesos concretos descritos en esa guía. No se mostraron secretos, no se creó otro repositorio/proyecto y no se fusionó ni desplegó.


## Revisión directa posterior · edición dentro del libro

Se cerró la diferencia entre «campos sobre papel» y escribir en el libro: tapa, contratapa y páginas se editan ahora en el mismo lugar del lector. La hoja interior comparte composición de lectura y escritura, con título y texto que crecen sin achicar la letra. Las herramientas de foto y tipografía permanecen disponibles; los borradores, el guardado asíncrono y las recuperaciones se conservan. Al editar se bloquean navegación, exportación e importación para no confundir el contenido pendiente con el guardado.

Los favoritos del panel se eligen desde un botón de personalización en lugar de mostrar cinco selectores permanentemente. Las posiciones de los módulos y el azul aprobado se conservan. Los títulos de tapa/contratapa admiten varias líneas. Las páginas físicas de continuación del libro PDF ahora reciben números consecutivos.

Validación de esta revisión: compilación estricta con Node 22; Chromium contra la compilación estática; escritura sin pérdida de foco, fallo de cuota inyectado, editor y borrador conservados, dos cierres sin recuperar, recuperación y guardado, recarga y móvil sin desborde. Cinco módulos y cinco PDF descargados por los botones reales, sin solicitudes externas ni errores JavaScript. Se repitió el roundtrip de 24 imágenes (~33 MiB codificados), rechazo de tres respaldos inválidos, lectura con localStorage lleno, reemplazo atómico fallido y restauración en contexto limpio.

Evidencia nueva de edición en `artifacts/revision-inline/`. Prueba reproducible: instalar Playwright para Node y ejecutar `ECOS_TEST_BASE_URL=http://127.0.0.1:3100 CHROMIUM_PATH=/ruta/a/chromium node tests/browser/inline-edit.cjs` contra el build servido. `tests/browser/validate.py` admite `CHROMIUM_PATH` y `ECOS_TEST_OUTPUT`; `independent.py` admite `CHROMIUM_PATH`.

La vista en pantalla crece con el texto; el PDF conserva A4 y pagina el contenido. No se simula una previsualización exacta de cada salto de imprenta. Vercel, impresión física, envío de contactos y percepción acústica del sonido siguen pendientes de verificación externa. Esta revisión no activa pagos ni publica la aplicación.
