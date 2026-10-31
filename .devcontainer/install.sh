#!/usr/bin/env bash
set -euo pipefail
ECOS_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ECOS_ROOT/frontend"
# Use the packageManager pin in package.json, retaining its integrity check.
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack yarn install --frozen-lockfile --non-interactive
