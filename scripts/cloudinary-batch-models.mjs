import fs from 'node:fs/promises';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const IGNORED_FILE_NAMES = new Set(['.ds_store', '.xnviewsort']);

function parseArgs(argv) {
  const args = {
    genders: ['boys', 'girls'],
    sourceRoot: 'src/app/features/pages/gallery/data/import/models',
    manifestOut: 'src/app/features/pages/gallery/data/import/models/_cloudinary-manifests',
    cloudinaryBaseFolder: 'aura/gallery/models',
    exclude: [],
    model: '',
    upload: false,
    limit: 0,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === '--genders' && next) {
      args.genders = next.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
      i += 1;
      continue;
    }

    if (current === '--source-root' && next) {
      args.sourceRoot = next;
      i += 1;
      continue;
    }

    if (current === '--manifest-out' && next) {
      args.manifestOut = next;
      i += 1;
      continue;
    }

    if (current === '--base-folder' && next) {
      args.cloudinaryBaseFolder = next;
      i += 1;
      continue;
    }

    if (current === '--exclude' && next) {
      args.exclude = next.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
      i += 1;
      continue;
    }

    if (current === '--model' && next) {
      args.model = next;
      i += 1;
      continue;
    }

    if (current === '--limit' && next) {
      const value = Number(next);
      args.limit = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
      i += 1;
      continue;
    }

    if (current === '--upload') {
      args.upload = true;
    }
  }

  return args;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toPosix(relativePath) {
  return relativePath.replaceAll('\\', '/');
}

function toCloudinaryPublicId(baseFolder, gender, modelFolderName, relImagePath) {
  const modelSlug = slugify(modelFolderName);
  const relNoExt = toPosix(relImagePath).replace(/\.[^.]+$/, '');

  return `${baseFolder}/${gender}/${modelSlug}/${relNoExt}`
    .replace(/\/+/g, '/')
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, '-');
}

function toCloudinaryAssetFolder(publicId) {
  const normalized = publicId.replace(/\/+$/g, '');
  const idx = normalized.lastIndexOf('/');
  return idx <= 0 ? normalized : normalized.slice(0, idx);
}

async function walkImageFiles(dirPath) {
  const output = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }

      const lowerName = entry.name.toLowerCase();
      if (entry.name.startsWith('._') || IGNORED_FILE_NAMES.has(lowerName)) {
        continue;
      }

      const extension = path.extname(lowerName);
      if (!IMAGE_EXTENSIONS.has(extension)) {
        continue;
      }

      output.push(absolutePath);
    }
  }

  await walk(dirPath);
  output.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  return output;
}

async function getModelDirectories(sourceRoot, genders, excludedSlugs, modelFilter) {
  const output = [];
  const normalizedFilter = slugify(modelFilter || '');

  for (const gender of genders) {
    const genderRoot = path.resolve(sourceRoot, gender);

    let entries = [];
    try {
      entries = await fs.readdir(genderRoot, { withFileTypes: true });
    } catch {
      continue;
    }

    const dirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => {
        const slug = slugify(name);
        if (excludedSlugs.has(slug)) {
          return false;
        }
        if (!normalizedFilter) {
          return true;
        }
        return slug === normalizedFilter || slug.includes(normalizedFilter);
      })
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    for (const model of dirs) {
      output.push({ gender, model });
    }
  }

  return output;
}

async function ensureManifestDirectory(manifestOut) {
  await fs.mkdir(manifestOut, { recursive: true });
}

async function loadUploadedManifestIndex(manifestOutAbs) {
  const index = new Map();
  let entries = [];

  try {
    entries = await fs.readdir(manifestOutAbs, { withFileTypes: true });
  } catch {
    return index;
  }

  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.uploaded.json'))
    .map((entry) => entry.name);

  for (const fileName of files) {
    try {
      const raw = await fs.readFile(path.join(manifestOutAbs, fileName), 'utf8');
      const json = JSON.parse(raw);
      for (const item of json?.items || []) {
        if (typeof item?.publicId === 'string' && typeof item?.secureUrl === 'string') {
          index.set(item.publicId, item.secureUrl);
        }
      }
    } catch {
      // ignore broken manifests
    }
  }

  return index;
}

async function resolveCloudinaryCredentials() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET');
  }

  const { v2: cloudinary } = await import('cloudinary');
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

async function tryGetExistingResource(cloudinary, publicId) {
  try {
    const resource = await cloudinary.api.resource(publicId, { resource_type: 'image' });
    return resource?.secure_url || null;
  } catch (error) {
    const statusCode = error?.http_code || error?.statusCode;
    if (statusCode === 404) {
      return null;
    }
    throw error;
  }
}

async function processModel({ gender, modelFolderName, args, manifestIndex, cloudinary }) {
  const modelFolderAbs = path.resolve(args.sourceRoot, gender, modelFolderName);
  const imageFiles = await walkImageFiles(modelFolderAbs);

  if (imageFiles.length === 0) {
    throw new Error(`No images found in ${gender}/${modelFolderName}`);
  }

  const manifest = {
    modelQuery: modelFolderName,
    gender,
    modelFolderName,
    sourceFolder: modelFolderAbs,
    totalImages: imageFiles.length,
    uploaded: args.upload,
    generatedAt: new Date().toISOString(),
    items: [],
  };

  let uploadedCount = 0;
  let skippedCount = 0;

  for (let index = 0; index < imageFiles.length; index += 1) {
    const absFile = imageFiles[index];
    const relFromModel = path.relative(modelFolderAbs, absFile);
    const publicId = toCloudinaryPublicId(args.cloudinaryBaseFolder, gender, modelFolderName, relFromModel);
    const assetFolder = toCloudinaryAssetFolder(publicId);
    const item = {
      localPath: absFile,
      relativePath: toPosix(relFromModel),
      publicId,
      assetFolder,
    };

    if (!args.upload) {
      manifest.items.push(item);
      continue;
    }

    const fromManifest = manifestIndex.get(publicId);
    if (fromManifest) {
      manifest.items.push({ ...item, secureUrl: fromManifest, skipped: true, reason: 'existing-manifest' });
      skippedCount += 1;
      continue;
    }

    const fromCloudinary = await tryGetExistingResource(cloudinary, publicId);
    if (fromCloudinary) {
      manifest.items.push({ ...item, secureUrl: fromCloudinary, skipped: true, reason: 'already-on-cloudinary' });
      manifestIndex.set(publicId, fromCloudinary);
      skippedCount += 1;
      continue;
    }

    const result = await cloudinary.uploader.upload(absFile, {
      resource_type: 'image',
      public_id: publicId,
      asset_folder: assetFolder,
      overwrite: false,
      unique_filename: false,
      use_filename: false,
      invalidate: false,
    });

    manifest.items.push({ ...item, secureUrl: result.secure_url, skipped: false });
    manifestIndex.set(publicId, result.secure_url);
    uploadedCount += 1;
    console.log(`[${index + 1}/${imageFiles.length}] uploaded ${gender}/${modelFolderName}/${item.relativePath}`);
  }

  return { manifest, uploadedCount, skippedCount };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const excludedSlugs = new Set(args.exclude.map((value) => slugify(value)));
  const manifestOutAbs = path.resolve(args.manifestOut);

  const models = await getModelDirectories(args.sourceRoot, args.genders, excludedSlugs, args.model);
  if (models.length === 0) {
    throw new Error('No model directories found with current filters.');
  }

  const queue = args.limit > 0 ? models.slice(0, args.limit) : models;
  const manifestIndex = await loadUploadedManifestIndex(manifestOutAbs);

  let cloudinary = null;
  if (args.upload) {
    cloudinary = await resolveCloudinaryCredentials();
  }

  await ensureManifestDirectory(manifestOutAbs);

  console.log(`Mode: ${args.upload ? 'UPLOAD' : 'DRY RUN'}`);
  console.log(`Models to process: ${queue.length}`);

  let totalUploaded = 0;
  let totalSkipped = 0;

  for (let i = 0; i < queue.length; i += 1) {
    const item = queue[i];
    console.log(`\n[${i + 1}/${queue.length}] ${item.gender}/${item.model}`);

    const result = await processModel({
      gender: item.gender,
      modelFolderName: item.model,
      args,
      manifestIndex,
      cloudinary,
    });

    const manifestFileName = `${slugify(item.gender)}-${slugify(item.model)}${args.upload ? '.uploaded' : '.preview'}.json`;
    const manifestPath = path.join(manifestOutAbs, manifestFileName);
    await fs.writeFile(manifestPath, JSON.stringify(result.manifest, null, 2), 'utf8');

    totalUploaded += result.uploadedCount;
    totalSkipped += result.skippedCount;

    console.log(`Saved manifest: ${manifestFileName}`);
    if (args.upload) {
      console.log(`Uploaded: ${result.uploadedCount} | Skipped(existing): ${result.skippedCount}`);
    }
  }

  console.log('\nSummary:');
  if (args.upload) {
    console.log(`- Uploaded: ${totalUploaded}`);
    console.log(`- Skipped existing: ${totalSkipped}`);
  }
  console.log(`- Models processed: ${queue.length}`);
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
