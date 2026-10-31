# Probar Ecos del Alma desde tu navegador

La propuesta de cambios es [PR #1](https://github.com/ideasto/Altaresdelalma/pull/1). Esta guía usa la rama `feat/ecos-del-alma-completo`, sin fusionarla ni desplegarla en producción.

## Abrir la aplicación

Este chat de configuración permite ejecutar y probar servidores internamente, pero no ofrece una función para publicar un puerto con una URL accesible desde tu navegador. No hay un botón de vista previa que podamos habilitar aquí mediante el borrador del entorno.

La alternativa preparada es **GitHub Codespaces**: un entorno de desarrollo privado que se abre en el navegador. Necesitás entrar con tu cuenta de GitHub, tener acceso al repositorio y tener Codespaces disponible en tu cuenta.

1. Abrí **[la rama para probar Ecos del Alma](https://github.com/ideasto/Altaresdelalma/tree/feat/ecos-del-alma-completo)**.
2. Pulsá el botón verde **Code** (Código).
3. Elegí la pestaña **Codespaces**.
4. Pulsá **Create codespace on feat/ecos-del-alma-completo**. GitHub puede mostrar opciones de máquina y región antes de **Create codespace**. Conservá las opciones predeterminadas. No hace falta fusionar la PR.
5. Esperá mientras GitHub prepara el entorno e instala dependencias. La primera apertura puede tardar varios minutos.
6. La app debería abrirse en otra pestaña al terminar la compilación. **Si no se abre:** abajo en el editor de Codespaces elegí **PORTS / PUERTOS**. En la fila **3000 — Ecos del Alma · abrir aplicación**, pulsá el icono de globo **Open in Browser / Abrir en el navegador**. También está en el menú de clic derecho de esa fila. Si no ves la pestaña Ports, abrí el menú **Terminal → New Terminal**, y junto a TERMINAL buscá PORTS.

Abrí el enlace del puerto, no el archivo `index.html`, la vista del repositorio ni una captura. Es una aplicación real: permite escribir, cargar fotos y descargar archivos. Mantené el puerto **Private / Privado**; tu sesión de GitHub permite abrirlo sin hacerlo público.

Si no aparece el puerto 3000, pegá este único comando en la terminal de Codespaces y presioná Enter:

```sh
bash .devcontainer/start-preview.sh
```

El registro de arranque se guarda en `frontend/node_modules/.cache/ecos-preview/server.log`. Si aparece un error, copiá el texto del error para revisarlo. No hace falta introducir claves ni configurar MongoDB.

## Qué probar

- Inicio: creá un espacio con un nombre de prueba. Si se solicita registro, completalo y aceptá el consentimiento solo si estás de acuerdo. Sin un endpoint configurado, el contacto queda pendiente en ese navegador y no se simula ningún envío.
- **Libro de Recuerdos:** abrí el libro y tocá el lápiz de la tapa o contratapa. Podés editar ahí mismo los campos de la pieza. Con **Agregar página**, escribí título y relato sobre el papel marfil, elegí una foto y guardá. Usá **PDF** para descargar el libro.
- **Cartas:** pulsá **Nueva carta**, escribí en la hoja y guardá. Abrí la carta para descargar el PDF individual o usá **PDF de todas**.
- **Galería:** pulsá **Agregar fotos** y elegí archivos de tu computadora. El botón **PDF** descarga las fotos completas con sus pies; podés elegir el marco fino.
- **Mazo Oráculo:** agregá algunas frases sobre las cartas. Probá **Mezclar y sacar**, **Saltear la mezcla** y el sonido opcional. **PDF** descarga frentes y dorsos de 63 × 90 mm.
- **Línea de Tiempo:** agregá momentos con fecha completa, parcial o sin fecha. **PDF** descarga la cronología apaisada.

Para probar los cinco PDF necesitás guardar algún contenido en cada módulo. El navegador descarga los archivos: buscá el icono de descargas de tu navegador si no se abre una ventana.

Los recuerdos se guardan en tu navegador para la dirección de esta vista previa. No se copian automáticamente desde Emergent u otra dirección. Podés traerlos con **Restaurar** usando un respaldo tuyo. Con **Descargar mi santuario** guardás una copia para llevarla después a otro enlace. Registrar nombre y email no sincroniza recuerdos en la nube.

Cuando termines, detené el Codespace desde el menú de Codespaces de GitHub (**Stop codespace / Detener Codespace**). Tu cuenta de GitHub gestiona su disponibilidad, cuota y facturación. Detenerlo no equivale a publicar o fusionar la aplicación.

## Configuración y verificación

- `.devcontainer/devcontainer.json`: imagen oficial `mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm`, puerto 3000, apertura de navegador, instalación y arranque automáticos.
- `.devcontainer/install.sh`: instala con la versión de Yarn fijada por el proyecto, sin modificar el manifiesto ni crear un lockfile.
- `.devcontainer/start-preview.sh`: inicia el servidor si hace falta y evita duplicarlo al reconectar. Los procesos no se conservan en una instantánea; se arrancan al adjuntarse al entorno.
- Se verificaron JSON, sintaxis de scripts y respuesta HTTP de la app en este entorno. La compilación con Node 22 se registra en el informe de estado. La creación de un Codespace y su URL externa requieren la cuenta del usuario y **no se ejecutaron desde este chat**.

No se configuró una publicación de producción ni se creó otra PR.
