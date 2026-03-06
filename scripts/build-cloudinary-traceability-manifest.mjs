import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_MANIFESTS_DIR =
  'src/app/features/pages/gallery/data/gallery-model-config/models/_cloudinary-manifests';
const DEFAULT_DATA_FILES = [
  'src/app/features/pages/gallery/data/gallery-models-boys.data.ts',
  'src/app/features/pages/gallery/data/gallery-models-girls.data.ts',
];

function parseArgs(argv) {
  const args = {
    manifestsDir: DEFAULT_MANIFESTS_DIR,
    dataFiles: [...DEFAULT_DATA_FILES],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === '--manifests-dir' && next) {
      args.manifestsDir = next;
      i += 1;
      continue;
    }

    if (current === '--data-files' && next) {
      args.dataFiles = next
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
      i += 1;
    }
  }

  return args;
}

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseCloudinaryUrl(url) {
  const marker = '/upload/';
  const markerIdx = url.indexOf(marker);
  if (markerIdx < 0) {
    return null;
  }

  const remainder = url.slice(markerIdx + marker.length);
  const versionless = remainder.replace(/^v\d+\//, '');
  const withoutQuery = versionless.split('?')[0];
  const publicId = withoutQuery.replace(/\.[^.\/]+$/, '');
  const segments = publicId.split('/');

  const modelsIdx = segments.indexOf('models');
  if (modelsIdx < 0 || modelsIdx + 2 >= segments.length) {
    return null;
  }

  return {
    publicId,
    gender: segments[modelsIdx + 1],
    modelSlug: segments[modelsIdx + 2],
  };
}

function ensureModel(summary, gender, modelSlug) {
  const key = `${gender}/${modelSlug}`;
  if (!summary.models[key]) {
    summary.models[key] = {
      gender,
      modelSlug,
      cloudUploaded: 0,
      cloudPreview: 0,
      codeUrls: 0,
    };
  }
  return summary.models[key];
}

async function listJsonFiles(dirPath, fileSuffix) {
  let entries = [];
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(fileSuffix))
    .map((entry) => path.join(dirPath, entry.name));
}

async function buildSummary(args) {
  const manifestsDirAbs = path.resolve(args.manifestsDir);
  const uploadedDirAbs = path.join(manifestsDirAbs, 'uploaded');
  const previewDirAbs = path.join(manifestsDirAbs, 'preview');

  const summary = {
    generatedAt: new Date().toISOString(),
    source: {
      manifestsDir: path.relative(process.cwd(), manifestsDirAbs),
      dataFiles: args.dataFiles,
    },
    totals: {
      uploadedManifestFiles: 0,
      previewManifestFiles: 0,
      uploadedItems: 0,
      previewItems: 0,
      codeUrls: 0,
      modelsTracked: 0,
    },
    models: {},
  };

  const uploadedFiles = [
    ...(await listJsonFiles(uploadedDirAbs, '.uploaded.json')),
    ...(await listJsonFiles(manifestsDirAbs, '.uploaded.json')),
  ];
  const seenUploaded = new Set();

  for (const filePath of uploadedFiles) {
    const fileName = path.basename(filePath);
    if (seenUploaded.has(fileName)) {
      continue;
    }
    seenUploaded.add(fileName);

    const raw = await fs.readFile(filePath, 'utf8');
    const manifest = JSON.parse(raw);
    summary.totals.uploadedManifestFiles += 1;

    const gender = slugify(manifest?.gender || 'unknown');
    const modelSlug = slugify(manifest?.modelFolderName || manifest?.modelQuery || fileName);
    const target = ensureModel(summary, gender, modelSlug);

    const count = Array.isArray(manifest?.items) ? manifest.items.length : 0;
    target.cloudUploaded += count;
    summary.totals.uploadedItems += count;
  }

  const previewFiles = [
    ...(await listJsonFiles(previewDirAbs, '.preview.json')),
    ...(await listJsonFiles(manifestsDirAbs, '.preview.json')),
  ];
  const seenPreview = new Set();

  for (const filePath of previewFiles) {
    const fileName = path.basename(filePath);
    if (seenPreview.has(fileName)) {
      continue;
    }
    seenPreview.add(fileName);

    const raw = await fs.readFile(filePath, 'utf8');
    const manifest = JSON.parse(raw);
    summary.totals.previewManifestFiles += 1;

    const gender = slugify(manifest?.gender || 'unknown');
    const modelSlug = slugify(manifest?.modelFolderName || manifest?.modelQuery || fileName);
    const target = ensureModel(summary, gender, modelSlug);

    const count = Array.isArray(manifest?.items) ? manifest.items.length : 0;
    target.cloudPreview += count;
    summary.totals.previewItems += count;
  }

  const urlRegex = /https:\/\/res\.cloudinary\.com[^"'\s,]+/g;
  for (const filePath of args.dataFiles) {
    const absPath = path.resolve(filePath);
    let content;

    try {
      content = await fs.readFile(absPath, 'utf8');
    } catch {
      continue;
    }

    const matches = content.match(urlRegex) ?? [];
    for (const url of matches) {
      const parsed = parseCloudinaryUrl(url);
      if (!parsed) {
        continue;
      }

      const target = ensureModel(summary, parsed.gender, parsed.modelSlug);
      target.codeUrls += 1;
      summary.totals.codeUrls += 1;
    }
  }

  summary.totals.modelsTracked = Object.keys(summary.models).length;
  return summary;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const manifestsDirAbs = path.resolve(args.manifestsDir);
  const traceabilityDirAbs = path.join(manifestsDirAbs, 'traceability');

  await fs.mkdir(traceabilityDirAbs, { recursive: true });

  const summary = await buildSummary(args);
  const summaryPath = path.join(traceabilityDirAbs, '_traceability-summary.json');

  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

  console.log('Cloudinary traceability manifest generated');
  console.log(`- Output: ${path.relative(process.cwd(), summaryPath)}`);
  console.log(`- Models tracked: ${summary.totals.modelsTracked}`);
  console.log(`- Uploaded manifest files: ${summary.totals.uploadedManifestFiles}`);
  console.log(`- Preview manifest files: ${summary.totals.previewManifestFiles}`);
  console.log(`- Code URLs: ${summary.totals.codeUrls}`);
}

run().catch((error) => {
  console.error(error?.message || 'Failed to build Cloudinary traceability manifest.');
  process.exit(1);
});
