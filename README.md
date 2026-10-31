# Ecos del Alma · La Gata y la Magia

Aplicación React para conservar fotos, cartas, un mazo de frases, un libro y una cronología en el navegador. Exporta respaldos JSON y cinco productos PDF. No necesita un backend ni una cuenta de Emergent.

## Desarrollo

Node **22.x**, Yarn **1.22.22** mediante Corepack. El lockfile versionado es `frontend/yarn.lock`.

```sh
cd frontend
# Si usás nvm: nvm install && nvm use
corepack yarn install --frozen-lockfile --non-interactive
corepack yarn start
```

Compilación de producción, con las mismas comprobaciones estrictas de CI:

```sh
cd frontend
CI=true corepack yarn build
```

La salida es `frontend/build`. Para Codespaces, la configuración en `.devcontainer/` instala y arranca automáticamente. [Guía para probar desde el navegador](docs/PROBAR_EN_NAVEGADOR.md).

## Importación futura en Vercel

[Configuración exacta, auditoría y permisos](docs/INDEPENDENCIA_Y_VERCEL.md). Usar un único proyecto, Root Directory `frontend` y Production Branch `main` después de revisar y fusionar la PR #1. No se ha desplegado esta versión.

## Datos y privacidad

Los recuerdos se guardan en IndexedDB de ese navegador y dirección. Un dominio nuevo no puede leer los datos de otro: antes de cambiar de enlace descargá el respaldo y restauralo en el nuevo. Los respaldos de recuerdos no incluyen datos de contacto. No hay analítica ni scripts de Emergent; las fuentes y recursos visuales se sirven con la aplicación.

`REACT_APP_CONTACT_ENDPOINT` es opcional. Vacío mantiene los contactos pendientes localmente y no envía nada. No configurar credenciales en variables `REACT_APP_*`: forman parte del frontend público. Pagos y publicidad están desactivados.

## Pruebas e informes

- [Estado de implementación](docs/ESTADO_ECOS_DEL_ALMA.md)
- `tests/browser/independent.py`: cinco módulos y descargas contra una compilación estática, con todo acceso externo bloqueado y registrado.
- `tests/browser/ui.py`: escritura fallida, borradores, edición, fotos y restauración. Permite `ECOS_TEST_BASE_URL` para apuntar a la compilación de producción.
- `tests/browser/validate.py` e `inspect_pdfs.py`: almacenamiento, respaldo y comprobación de PDF.
