# Project Components
- MainLayout
- Navigation
- Footer
- AboutUs
- ScoutingServices
- HowWeWork
- Home
- HomeIntro
- Contact
- ConnectInfo
- GalleryGroup
- PortfolioModal
- ModelGrid
- MediaViewer
- GalleryHeader
- Measurements
- ModelSubmissionForm
---
## Descripción breve de cada componente
- **MainLayout**: Estructura principal de la app, incluye navegación y footer.
- **Navigation**: Barra superior con enlaces a secciones.
- **Footer**: Pie de página con info legal y mensaje extra.
- **AboutUs**: Presentación y misión de la agencia.
- **ScoutingServices**: Lista y descripción de servicios de scouting.
- **HowWeWork**: Explica el proceso de scouting y soporte.
- **Home**: Página principal, incluye intro, servicios, contacto, etc.
- **HomeIntro**: Sección de bienvenida y logo.
- **Contact**: Información y enlaces de contacto.
- **ConnectInfo**: Explica la red de agencias y conexiones.
- **GalleryGroup**: Página de galería, lista todos los modelos.
- **PortfolioModal**: Modal para ver/descargar el portfolio de un modelo.
- **ModelGrid**: Grid de modelos, muestra fotos y permite selección.
- **MediaViewer**: Visualizador de imágenes/videos en grande.
- **GalleryHeader**: Encabezado de galería, muestra el nombre del grupo.
- **Measurements**: Permite cambiar sistema métrico/imperial y descargar fullbook.
- **ModelSubmissionForm**: Formulario para enviar datos de nuevos modelos.

## Inicio rápido

1. Requisitos: Node.js 20+, npm
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Arranca el proyecto:
   ```bash
   npm run start
   ```
   - Home: `http://localhost:4200/`
   - Galería: `http://localhost:4200/gallery/korea`
4. Build de validación:
   ```bash
   npm run build -- --configuration development
   ```

## Edición de datos

- Modelos: `src/app/features/pages/gallery/data/gallery-models.data.ts`
- Configuración de galerías: `src/app/features/pages/gallery/data/groups/agency-galleries.config.ts`
- Material extra: `src/app/features/pages/gallery/data/catalog/full-material-catalog.ts`

## Crear nueva galería

1. Agrega bloque en `agency-galleries.config.ts` con `galleryKey`, `galleryName`, y modelos.
2. Accede en `/gallery/<nombre>`.

## SEO

- Edita SEO en `gallery-page-seo.service.ts` y `seo.service.ts`.
- Ruta SEO: `gallery/:group` en `app.routes.ts`.

## Flujo de cambios

1. Edita datos/modelos/config.
2. Ejecuta build.
3. Verifica en navegador.
4. Commit.

## Scripts útiles

- Optimizar imágenes: `npm run gallery:optimize`
- Subir a Cloudinary: `npm run gallery:upload`
- Sincronizar: `npm run gallery:sync`
- Actualizar todo: `npm run gallery:update`
- Prune preview/aplicar: `npm run gallery:prune:preview` / `npm run gallery:prune:apply`

## Checklist antes de commit

- Build sin errores
- Galería funcional
- Modelos con foto y portfolio
- Config revisada

## Troubleshooting

- Si un modelo no aparece: revisa foto, portfolio y config.
- Si no aparece botón fullbook: revisa config y material extra.
- Si SEO no cambia: revisa servicios y rutas.

---
# aura-scouting-web
## 1) Cómo arrancar el proyecto

### Requisitos

- Node.js 20+
- npm

### Primer inicio

```bash
npm install
npm run start
```

App local:

- Home: `http://localhost:4200/`
- Galería: `http://localhost:4200/gallery/korea`

### Build de validación

```bash
npm run build -- --configuration development
```

---

## 2) Qué archivo tocar según lo que quieras cambiar

### Cambiar datos de un modelo (foto, portfolio, medidas)

- `src/app/features/pages/gallery/data/gallery-models.data.ts`

### Elegir en qué galerías aparece cada modelo

- `src/app/features/pages/gallery/data/groups/agency-galleries.config.ts`

Formato por modelo:

```ts
{ id: 'adan', status: 'on', fullbook: 'off' }
```

### Activar/desactivar estado y fullbook

- `status: 'on' | 'off'`
  - `'off'` muestra `Ongoing Trip`
  - `'on'` lo oculta
- `fullbook: 'on' | 'off'`
  - `'on'` habilita botón/uso de fullbook
  - `'off'` usa solo material base

### Cargar material fullbook extra

- `src/app/features/pages/gallery/data/catalog/full-material-catalog.ts`

### Ejemplo rápido (caso real)

"Quiero activar fullbook de `emmanuel` en `china`":

1. En `agency-galleries.config.ts`, busca el bloque `galleryKey: 'china'`.
2. Busca `{ id: 'emmanuel', ... }`.
3. Cambia `fullbook: 'off'` a `fullbook: 'on'`.
4. Verifica que exista contenido en `full-material-catalog.ts` para `emmanuel`.
5. Ejecuta build y prueba en `/gallery/china`.

---

## 3) Crear una galería nueva

No hace falta crear ruta nueva. Ya existe `gallery/:group`.

Pasos:

1. Agrega un bloque en:
   - `src/app/features/pages/gallery/data/groups/agency-galleries.config.ts`
2. Define:
   - `galleryKey` (ej. `singapore`)
   - `galleryName` (ej. `SINGAPORE`)
   - `modelIds` con sus `id`, `status` y `fullbook`
3. Abre:
   - `http://localhost:4200/gallery/singapore`

### Ejemplo mínimo de bloque

```ts
{
   galleryKey: 'singapore',
   galleryName: 'SINGAPORE',
   modelIds: [
      { id: 'adan', status: 'on', fullbook: 'off' },
      { id: 'emmanuel', status: 'on', fullbook: 'on' },
   ],
}
```

---

## 4) SEO: cómo se administra

### Dónde se define el SEO de galería

- `src/app/features/pages/gallery/components/group-page/services/gallery-page-seo.service.ts`

Ahí se define por galería:

- título
- descripción
- keywords
- canonical
- robots

### Servicio base SEO

- `src/app/features/core/services/seo.service.ts`

### Ruta que dispara el SEO por galería

- `src/app/app.routes.ts` → `gallery/:group`

---

## 5) Flujo recomendado para cambios de galería

1. Edita modelo(s) en `gallery-models.data.ts`
2. Ajusta aparición/status/fullbook en `agency-galleries.config.ts`
3. Si aplica, agrega fullbook en `full-material-catalog.ts`
4. Ejecuta:
   - `npm run build -- --configuration development`
5. Verifica en browser:
   - `http://localhost:4200/gallery/korea` (o la galería que cambiaste)

### Flujo diario sugerido (rápido)

1. `npm run start`
2. Edita modelos/config/fullbook
3. Revisa visualmente la galería afectada
4. `npm run build -- --configuration development`
5. Commit

---

## 6) Scripts Cloudinary

### Comandos

- `npm run gallery:optimize`
- `npm run gallery:upload`
- `npm run gallery:prune:preview`
- `npm run gallery:prune:apply`
- `npm run gallery:sync`
- `npm run gallery:update`

### Cómo usarlos (flujo recomendado)

1. (Opcional) Optimiza imágenes locales:
   - `npm run gallery:optimize`
2. Sube archivos a Cloudinary:
   - `npm run gallery:upload`
3. Sincroniza manifests al dataset de galería:
   - `npm run gallery:sync`
4. Valida build:
   - `npm run build -- --configuration development`

Atajo (todo en uno):

- `npm run gallery:update`

### ¿Cuándo usar cada script?

- `gallery:optimize`: cuando agregas imágenes nuevas pesadas y quieres optimizar antes de subir.
- `gallery:upload`: sube solo nuevas (no resube ni reemplaza existentes).
- `gallery:prune:preview`: detecta qué se borraría en Cloudinary comparando con tus carpetas locales (sin borrar).
- `gallery:prune:apply`: borra en Cloudinary lo que ya no existe localmente (usar después de revisar preview).
- `gallery:sync`: cuando ya existen manifests y quieres reflejar URLs en `gallery-models.data.ts`.
- `gallery:update`: cuando quieres ejecutar upload + sync + build en una sola corrida.

### Flujo seguro para "agregar más fotos" (sin duplicar ni reemplazar)

1. Copia nuevas imágenes en las mismas carpetas/modelos.
2. Ejecuta:
   - `npm run gallery:upload`
3. Sincroniza dataset:
   - `npm run gallery:sync`
4. Valida build:
   - `npm run build -- --configuration development`

### Flujo seguro para "si borro fotos locales"

1. Preview de borrados remotos:
   - `npm run gallery:prune:preview`
2. Si el preview está correcto, aplica borrado remoto:
   - `npm run gallery:prune:apply`
3. Luego sincroniza para que también se quite del portfolio en código:
   - `npm run gallery:sync`

### Ejecuciones parciales útiles

- Solo subir un modelo:
  - `npm run gallery:upload -- --model adan --limit 1`
- Preview de prune solo para un modelo:
   - `npm run gallery:prune:preview -- --model emmanuel --limit 1`
- Aplicar prune solo para un modelo:
   - `npm run gallery:prune:apply -- --model emmanuel --limit 1`
- Excluir modelos en upload:
  - `npm run gallery:upload -- --exclude adan,alan-marquez`
- Sincronizar con orden legacy:
  - `npm run gallery:sync -- --legacy-order`

### Variables de entorno

```powershell
$env:CLOUDINARY_CLOUD_NAME="TU_CLOUD"
$env:CLOUDINARY_API_KEY="TU_KEY"
$env:CLOUDINARY_API_SECRET="TU_SECRET"
```

### Rutas de assets/manifests

- `src/app/features/pages/gallery/data/gallery-model-config/models/`

---

## 7) Checklist antes de commit

- Build en verde
- Galería abre sin errores
- Modelo con `photo` + `portfolio` válido
- Status/fullbook revisado en config

---

## 8) Troubleshooting rápido

- No aparece un modelo en la galería:
   - Revisa que tenga `photo` y al menos un item en `portfolio`.
   - Revisa que su `id` esté incluido en la galería correcta (`agency-galleries.config.ts`).
- No aparece botón fullbook:
   - Revisa `fullbook: 'on'` en la galería.
   - Revisa que exista contenido en `full-material-catalog.ts` para ese `id`.
- SEO no cambia:
   - Revisa `gallery-page-seo.service.ts` y que estés entrando por `gallery/:group`.
