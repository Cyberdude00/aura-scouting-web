import fs from 'node:fs/promises';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const IGNORED_FILE_NAMES = new Set(['.ds_store', '.xnviewsort']);

function parseArgs(argv) {
  const args = {
    model: 'adan',
    gender: 'boys',
    sourceRoot: 'src/app/features/pages/gallery/data/import/models',
    manifestOut: 'src/app/features/pages/gallery/data/import/models/_cloudinary-manifests',
    cloudinaryBaseFolder: 'aura/gallery/models',
    upload: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === '--model' && next) {
      args.model = next;
      i += 1;
      continue;
    }

    if (current === '--gender' && next) {
      args.gender = next;
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

    if (current === '--upload') {
      args.upload = true;
    }
  }

  return args;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function findModelDirectory(genderRoot, modelQuery) {
  const entries = await fs.readdir(genderRoot, { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  const normalizedQuery = slugify(modelQuery);

  const exact = dirs.find((name) => slugify(name) === normalizedQuery);
  if (exact) {
    return exact;
  }

  const contains = dirs.find((name) => slugify(name).includes(normalizedQuery));
  if (contains) {
    return contains;
  }

  throw new Error(`Model folder not found for query "${modelQuery}" inside ${genderRoot}`);
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
      const extension = path.extname(lowerName);

      if (entry.name.startsWith('._') || IGNORED_FILE_NAMES.has(lowerName)) {
        continue;
      }

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

  if (idx <= 0) {
    return normalized;
  }

  return normalized.slice(0, idx);
}

async function ensureManifestDirectory(manifestOut) {
  await fs.mkdir(manifestOut, { recursive: true });
}

async function run() {
  const args = parseArgs(process.argv.slice(2));

  const sourceRootAbs = path.resolve(args.sourceRoot);
  const genderRootAbs = path.join(sourceRootAbs, args.gender);
  const modelFolderName = await findModelDirectory(genderRootAbs, args.model);
  const modelFolderAbs = path.join(genderRootAbs, modelFolderName);

  const imageFiles = await walkImageFiles(modelFolderAbs);

  if (imageFiles.length === 0) {
    throw new Error(`No images found in ${modelFolderAbs}`);
  }

  const manifest = {
    modelQuery: args.model,
    gender: args.gender,
    modelFolderName,
    sourceFolder: modelFolderAbs,
    totalImages: imageFiles.length,
    uploaded: args.upload,
    generatedAt: new Date().toISOString(),
    items: [],
  };

  if (args.upload) {
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

    let index = 0;
    for (const absFile of imageFiles) {
      index += 1;
      const relFromModel = path.relative(modelFolderAbs, absFile);
      const publicId = toCloudinaryPublicId(args.cloudinaryBaseFolder, args.gender, modelFolderName, relFromModel);
      const assetFolder = toCloudinaryAssetFolder(publicId);

      const result = await cloudinary.uploader.upload(absFile, {
        resource_type: 'image',
        public_id: publicId,
        asset_folder: assetFolder,
        overwrite: true,
        unique_filename: false,
        use_filename: false,
        invalidate: true,
      });

      manifest.items.push({
        localPath: absFile,
        relativePath: toPosix(relFromModel),
        publicId,
        assetFolder,
        secureUrl: result.secure_url,
      });

      console.log(`[${index}/${imageFiles.length}] uploaded ${toPosix(relFromModel)}`);
    }
  } else {
    for (const absFile of imageFiles) {
      const relFromModel = path.relative(modelFolderAbs, absFile);
      const publicId = toCloudinaryPublicId(args.cloudinaryBaseFolder, args.gender, modelFolderName, relFromModel);

      manifest.items.push({
        localPath: absFile,
        relativePath: toPosix(relFromModel),
        publicId,
      });
    }
  }

  const manifestDirAbs = path.resolve(args.manifestOut);
  await ensureManifestDirectory(manifestDirAbs);

  const manifestFileName = `${slugify(args.gender)}-${slugify(modelFolderName)}${args.upload ? '.uploaded' : '.preview'}.json`;
  const manifestPath = path.join(manifestDirAbs, manifestFileName);

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`\nModel: ${modelFolderName}`);
  console.log(`Images: ${imageFiles.length}`);
  console.log(`Mode: ${args.upload ? 'UPLOAD' : 'DRY RUN'}`);
  console.log(`Manifest: ${manifestPath}`);
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
