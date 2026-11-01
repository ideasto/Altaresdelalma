# Frontend de Ecos del Alma

Node 22.x y Yarn 1.22.22 mediante Corepack.

```sh
corepack yarn install --frozen-lockfile --non-interactive
corepack yarn start
CI=true corepack yarn build
```

La salida es `build/`. No necesita backend, credenciales ni servicios de Emergent. Las fuentes son locales. `REACT_APP_CONTACT_ENDPOINT` es opcional y queda vacío por defecto.

- [Guía del repositorio](../README.md)
- [Independencia, auditoría y ajustes exactos de Vercel](../docs/INDEPENDENCIA_Y_VERCEL.md)
- [Uso desde Codespaces](../docs/PROBAR_EN_NAVEGADOR.md)
