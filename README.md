# aura-scouting-web

Guía rápida para no operar la galería y Cloudinary.

## Qué hace cada comando

- `npm run gallery:optimize`
	- Optimiza imágenes locales (sin tocar originales, crea salida optimizada).
- `npm run gallery:upload`
	- Sube a Cloudinary con control anti-duplicados.
	- Si algo ya existe, lo salta y no lo sube de nuevo.
- `npm run gallery:sync`
	- Toma manifests `.uploaded.json` y mete los links en el proyecto.
	- Por defecto preserva el orden actual que ya tengas en cada modelo.
- `npm run gallery:update`
	- Corre todo en orden: upload -> sync -> build.

## Flujo normal para agregar modelos a galerias

1. Agregas nuevas carpetas/fotos de modelos.
2. (Opcional) `npm run gallery:optimize`
3. `npm run gallery:update`
4. Revisas que build quede OK.
5. Commit y push.

## Para ejecutar solo una parte y no todo

- Solo subir:
	- `npm run gallery:upload`
- Solo sincronizar links:
	- `npm run gallery:sync`
- Sincronizar usando orden legacy (si lo quieres forzar):
	- `npm run gallery:sync -- --legacy-order`
- Subir un modelo puntual:
	- `npm run gallery:upload -- --model adan --limit 1`
- Excluir modelos:
	- `npm run gallery:upload -- --exclude adan,alan-marquez`

## Variables de entorno (Cloudinary)

Antes de subir, necesitas estas 3:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

PowerShell (ejemplo):

```powershell
$env:CLOUDINARY_CLOUD_NAME="TU_CLOUD"
$env:CLOUDINARY_API_KEY="TU_KEY"
$env:CLOUDINARY_API_SECRET="TU_SECRET"
```

## Notas importantes

- El script de upload compara para no duplicar.
- Si no tienes `python` en terminal, prueba con:
	- `py scripts/optimize-models-images.py`
- La media local está ignorada por git para no subir galerías pesadas.

## Checklist rápido antes de commit

- `npm run build` en verde.
- `gallery-models.data.ts` con links correctos.
- Sin modelos rotos (sin `photo` o sin `portfolio`).
