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

- `yarn build`: compilación de producción correcta. Verificar última ejecución en la entrega.
- Navegador Chromium real, escritorio 1440 × 1050 y celular 390 × 844 sin desborde horizontal.
- IndexedDB: 24 JPEG sintéticos de 1800 × 1200, 34.691.540 caracteres codificados (~33,1 MiB); cinco páginas, textos largos y papelera. Lectura completa comprobada y restauración en otro contexto limpio, sin imágenes faltantes. No implica capacidad ilimitada: depende de cuota y dispositivo.
- Error de cuota inyectado durante reemplazo: datos anteriores intactos. Error de escritura inyectado en UI: editor y borrador conservados, recuperación y posterior guardado correcto.
- Lectura con localStorage lleno; rechazo de tres respaldos malformados. Recuperación de foto con archivo tras eliminar y recargar. Opciones de restauración reiniciadas al abrir nuevamente.
- Edición del libro, mezcla, giro, salto y preferencia de sonido comprobados en navegador, sin errores JavaScript. La salida acústica física no se escucha desde esta máquina.
- Cinco PDF descargados: libro 13 páginas; cartas 5; mazo 4 (11 cartas con hoja incompleta y reversos); cronología 6 apaisadas; galería 3. Texto seleccionable y finales de textos largos comprobados con PyMuPDF. A4 vertical 210 × 297 mm, cronología 297 × 210 mm.
- Integraciones externas bloqueadas intencionalmente durante los tests del navegador. No se verificaron envíos de contactos, Instagram, analítica ni descarga de fuentes externas. Los PDF usan fuentes locales. No hay endpoint real de contactos configurado.

## Entregables y ejecución

`artifacts/` contiene capturas de escritorio/celular, comparación de estilos anteriores aplicada a la composición actual, edición y mazo, cinco PDF sintéticos y reportes JSON. Son datos de prueba, no recuerdos de Sole.

```sh
cd /workspace/Altaresdelalma/frontend
corepack yarn install --no-lockfile --non-interactive
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
```

Requieren Playwright, Chromium en `/usr/bin/chromium` y PyMuPDF para inspección de PDF. No requieren MongoDB. El entorno ya tiene estas herramientas. Las pruebas usan contextos aislados y datos sintéticos, nunca el perfil real de la usuaria.

## Límites y revisión pendiente

- Falta una muestra real del formato histórico para validar migraciones adicionales. Los originales históricos no se borran.
- Comprobación geométrica automatizada no reemplaza una prueba física de impresora: doble faz al 100 %, volteo por borde largo y prueba de una hoja antes de imprimir el mazo completo.
- Los campos editables representan el contenido de la pieza; las continuaciones de textos largos se resuelven al exportar. La pantalla puede desplazarse para leer todo el texto; no es una previsualización de cada salto físico de página.
- No hay pagos, anuncios, sincronización remota ni integración comercial completa. Faltan URL pública, endpoint de contactos y decisiones legales/comerciales.
- Estado de PR: por actualizar tras guardar commits y probar publicación de la rama. `gh api user` devolvió Forbidden; `api.github.com` no está permitido en la política del entorno. No se modificó la configuración de red ni se pidió un token.
