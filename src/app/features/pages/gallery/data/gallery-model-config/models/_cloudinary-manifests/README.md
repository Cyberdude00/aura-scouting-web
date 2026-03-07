# Cloudinary Manifests (Trazabilidad)

Esta carpeta queda organizada por propósito para tener trazabilidad clara entre Cloudinary, local y código.

## Estructura

- `uploaded/`
  - Manifests canónicos por modelo (`*.uploaded.json`).
  - Son la referencia principal de lo que está subido en Cloudinary.
- `preview/`
  - Manifests de dry-run (`*.preview.json`).
  - Útiles para planear subidas futuras comparando local vs naming de Cloudinary.
- `progress/`
  - Estado de ejecución (`_upload-progress.json`, `_dryrun-progress.json`).
  - Sirve para reanudar corridas (`--resume-last`).
- `traceability/`
  - Reportes consolidados para auditoría (`_traceability-summary.json`).
  - Cruza información de `uploaded/`, `preview/` y URLs usadas en código.

## Política recomendada

- Mantener siempre: `uploaded/` + `traceability/`.
- Mantener opcionalmente: `preview/` si se está planificando otra tanda.
- Limpiar periódicamente: `progress/` cuando no haya corrida en pausa.

## Comandos

- Subida: `npm run gallery:upload`
- Sync a código: `npm run gallery:sync`
- Reporte trazabilidad: `npm run gallery:manifest:trace`
- Higiene de datos: `npm run gallery:hygiene`
