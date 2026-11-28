#!/usr/bin/env bash
set -euo pipefail
ECOS_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
ECOS_RUN_DIR="$ECOS_ROOT/frontend/node_modules/.cache/ecos-preview"
mkdir -p "$ECOS_RUN_DIR"
# A second browser attachment must not start another server.
exec 9>"$ECOS_RUN_DIR/start.lock"
flock 9
if curl --noproxy '*' -fsS --max-time 3 http://127.0.0.1:3000/ >/dev/null 2>&1; then
  echo 'Ecos del Alma ya está en marcha. Abrí Ports → puerto 3000 → Open in Browser.'
  exit 0
fi
if [ -f "$ECOS_RUN_DIR/server.pid" ] && kill -0 "$(cat "$ECOS_RUN_DIR/server.pid")" 2>/dev/null; then
  echo 'Ecos del Alma está arrancando. Abrí Ports → puerto 3000 → Open in Browser.'
  exit 0
fi
cd "$ECOS_ROOT/frontend"
nohup env COREPACK_ENABLE_DOWNLOAD_PROMPT=0 BROWSER=none HOST=0.0.0.0 PORT=3000 corepack yarn start >"$ECOS_RUN_DIR/server.log" 2>&1 < /dev/null 9>&- &
echo "$!" > "$ECOS_RUN_DIR/server.pid"
echo 'Arrancando Ecos del Alma. Al terminar la compilación se abrirá la aplicación.'
echo 'Si no se abre sola: Ports → puerto 3000 → Open in Browser (icono de globo).'
echo "Registro de arranque: $ECOS_RUN_DIR/server.log"
