import fs from 'node:fs/promises';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.avi', '.webm', '.mkv']);
const IGNORED_FILE_NAMES = new Set(['.ds_store', '.xnviewsort']);

function parseArgs(argv) {
  const args = {
    genders: ['boys', 'girls'],
    sourceRoot: 'src/app/features/pages/gallery/data/gallery-model-config/models',
    manifestOut: 'src/app/features/pages/gallery/data/gallery-model-config/models/_cloudinary-manifests',
    cloudinaryBaseFolder: 'aura/gallery/models',
    exclude: [],
    model: '',
    upload: false,
    pruneRemote: false,
    applyPrune: false,
    limit: 0,
    checkpointEvery: 1,
    resumeLast: false,
    media: 'images',
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

    if (current === '--checkpoint-every' && next) {
      const value = Number(next);
      args.checkpointEvery = Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
      i += 1;
      continue;
    }

    if (current === '--media' && next) {
      const value = String(next).trim().toLowerCase();
      if (value === 'images' || value === 'videos' || value === 'all') {
        args.media = value;
      }
      i += 1;
      continue;
    }

    if (current === '--upload') {
      args.upload = true;
    }

    if (current === '--prune-remote') {
      args.pruneRemote = true;
    }

    if (current === '--apply-prune') {
      args.applyPrune = true;
    }

    if (current === '--resume-last') {
      args.resumeLast = true;
    }
  }

  return args;
}

async function listRemotePublicIdsByPrefix(cloudinary, prefix, resourceType = 'image') {
  const ids = [];
  let nextCursor;

  do {
    const response = await cloudinary.api.resources({
      type: 'upload',
      resource_type: resourceType,
      prefix,
      max_results: 500,
      next_cursor: nextCursor,
    });

    for (const resource of response?.resources || []) {
      if (typeof resource?.public_id === 'string' && resource.public_id.length > 0) {
        ids.push(resource.public_id);
      }
    }

    nextCursor = response?.next_cursor;
  } while (nextCursor);

  return ids;
}

async function deleteRemotePublicIds(cloudinary, publicIds, resourceType = 'image') {
  if (!publicIds.length) {
    return { deleted: 0 };
  }

  let deleted = 0;
  for (let i = 0; i < publicIds.length; i += 100) {
    const chunk = publicIds.slice(i, i + 100);
    const response = await cloudinary.api.delete_resources(chunk, {
      resource_type: resourceType,
      type: 'upload',
      invalidate: false,
    });

    for (const value of Object.values(response?.deleted || {})) {
      if (value === 'deleted') {
        deleted += 1;
      }
    }
  }

  return { deleted };
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

async function walkImageFiles(dirPath, mediaMode = 'images') {
  const output = [];

  function acceptsExtension(extension, mediaMode) {
    if (mediaMode === 'videos') {
      return VIDEO_EXTENSIONS.has(extension);
    }
    if (mediaMode === 'all') {
      return IMAGE_EXTENSIONS.has(extension) || VIDEO_EXTENSIONS.has(extension);
    }
    return IMAGE_EXTENSIONS.has(extension);
  }

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
      if (!acceptsExtension(extension, mediaMode)) {
        continue;
      }

      output.push(absolutePath);
    }
  }

  await walk(dirPath);
  output.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  return output;
}

function getResourceTypeForPath(filePath) {
  const extension = path.extname(String(filePath || '').toLowerCase());
  if (VIDEO_EXTENSIONS.has(extension)) {
    return 'video';
  }
  return 'image';
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

async function tryGetExistingResource(cloudinary, publicId, resourceType = 'image') {
  try {
    const resource = await cloudinary.api.resource(publicId, { resource_type: resourceType });
    return resource?.secure_url || null;
  } catch (error) {
    const statusCodeRaw = error?.http_code || error?.statusCode || error?.error?.http_code;
    const statusCode = Number(statusCodeRaw);
    const message = String(error?.message || error?.error?.message || '').toLowerCase();

    if (
      statusCode === 404
      || message.includes('resource not found')
      || message.includes('http 404')
    ) {
      return null;
    }
    throw error;
  }
}

async function processModel({ gender, modelFolderName, args, manifestIndex, cloudinary }) {
  const modelFolderAbs = path.resolve(args.sourceRoot, gender, modelFolderName);
  const imageFiles = await walkImageFiles(modelFolderAbs, args.media);

  if (imageFiles.length === 0) {
    console.log(`No matching ${args.media} files found in ${gender}/${modelFolderName}; skipping.`);
    return {
      manifest: {
        modelQuery: modelFolderName,
        gender,
        modelFolderName,
        sourceFolder: modelFolderAbs,
        totalImages: 0,
        uploaded: args.upload,
        generatedAt: new Date().toISOString(),
        items: [],
        completed: true,
        checkpointEvery: args.checkpointEvery,
      },
      uploadedCount: 0,
      skippedCount: 0,
      pruneCandidatesCount: 0,
      prunedCount: 0,
    };
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
    completed: false,
    checkpointEvery: args.checkpointEvery,
  };

  let uploadedCount = 0;
  let skippedCount = 0;
  let pruneCandidatesCount = 0;
  let prunedCount = 0;
  let processedCount = 0;

  async function checkpoint(force = false) {
    if (typeof args.onManifestCheckpoint !== 'function') {
      return;
    }

    if (!force && args.checkpointEvery > 1 && processedCount % args.checkpointEvery !== 0) {
      return;
    }

    manifest.generatedAt = new Date().toISOString();
    await args.onManifestCheckpoint(manifest);
  }

  await checkpoint(true);

  const expectedPublicIds = new Set();

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
    const resourceType = getResourceTypeForPath(absFile);
    expectedPublicIds.add(publicId);

    if (!args.upload) {
      manifest.items.push(item);
      processedCount += 1;
      await checkpoint();
      continue;
    }

    const fromManifest = manifestIndex.get(publicId);
    if (fromManifest) {
      manifest.items.push({ ...item, secureUrl: fromManifest, skipped: true, reason: 'existing-manifest' });
      skippedCount += 1;
      processedCount += 1;
      await checkpoint();
      continue;
    }

    const fromCloudinary = await tryGetExistingResource(cloudinary, publicId, resourceType);
    if (fromCloudinary) {
      manifest.items.push({ ...item, secureUrl: fromCloudinary, skipped: true, reason: 'already-on-cloudinary' });
      manifestIndex.set(publicId, fromCloudinary);
      skippedCount += 1;
      processedCount += 1;
      await checkpoint();
      continue;
    }

    const result = await cloudinary.uploader.upload(absFile, {
      resource_type: resourceType,
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
    processedCount += 1;
    await checkpoint();
    console.log(`[${index + 1}/${imageFiles.length}] uploaded ${gender}/${modelFolderName}/${item.relativePath}`);
  }

  if (args.pruneRemote) {
    const modelPrefix = `${args.cloudinaryBaseFolder}/${gender}/${slugify(modelFolderName)}/`
      .replace(/\/+/g, '/')
      .toLowerCase();

    const pruneResourceTypes = args.media === 'videos'
      ? ['video']
      : args.media === 'all'
        ? ['image', 'video']
        : ['image'];

    const stalePublicIds = [];
    for (const resourceType of pruneResourceTypes) {
      const remotePublicIds = await listRemotePublicIdsByPrefix(cloudinary, modelPrefix, resourceType);
      const staleForType = remotePublicIds.filter((publicId) => !expectedPublicIds.has(publicId));
      stalePublicIds.push(...staleForType.map((publicId) => ({ publicId, resourceType })));
    }

    pruneCandidatesCount = stalePublicIds.length;

    if (stalePublicIds.length > 0) {
      if (args.applyPrune) {
        let deleted = 0;
        for (const resourceType of ['image', 'video']) {
          const ids = stalePublicIds.filter((entry) => entry.resourceType === resourceType).map((entry) => entry.publicId);
          if (ids.length === 0) {
            continue;
          }
          const result = await deleteRemotePublicIds(cloudinary, ids, resourceType);
          deleted += result.deleted;
        }
        prunedCount = deleted;
      } else {
        console.log(`Prune preview ${gender}/${modelFolderName}: ${stalePublicIds.length} remote files would be deleted.`);
      }
    }

    manifest.prune = {
      enabled: true,
      applied: args.applyPrune,
      candidates: pruneCandidatesCount,
      deleted: prunedCount,
    };
  }

  manifest.completed = true;
  await checkpoint(true);

  return { manifest, uploadedCount, skippedCount, pruneCandidatesCount, prunedCount };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const excludedSlugs = new Set(args.exclude.map((value) => slugify(value)));
  const manifestOutAbs = path.resolve(args.manifestOut);
  const uploadProgressFileAbs = path.join(manifestOutAbs, '_upload-progress.json');
  const progressFileAbs = path.join(
    manifestOutAbs,
    args.upload ? '_upload-progress.json' : '_dryrun-progress.json',
  );

  if (args.resumeLast && !args.model) {
    try {
      const rawProgress = await fs.readFile(uploadProgressFileAbs, 'utf8');
      const progress = JSON.parse(rawProgress);
      const failedGender = progress?.failedModel?.gender;
      const failedModel = progress?.failedModel?.model;
      if (failedGender && failedModel) {
        args.genders = [String(failedGender).toLowerCase()];
        args.model = String(failedModel);
        console.log(`Resuming from progress file: ${failedGender}/${failedModel}`);
      }
    } catch {
      // no progress file yet
    }
  }

  const models = await getModelDirectories(args.sourceRoot, args.genders, excludedSlugs, args.model);
  if (models.length === 0) {
    throw new Error('No model directories found with current filters.');
  }

  const queue = args.limit > 0 ? models.slice(0, args.limit) : models;
  const manifestIndex = await loadUploadedManifestIndex(manifestOutAbs);

  if (args.applyPrune && !args.pruneRemote) {
    throw new Error('Invalid flags: --apply-prune requires --prune-remote');
  }

  let cloudinary = null;
  if (args.upload || args.pruneRemote) {
    cloudinary = await resolveCloudinaryCredentials();
  }

  await ensureManifestDirectory(manifestOutAbs);

  async function saveProgress(payload) {
    await fs.writeFile(progressFileAbs, JSON.stringify(payload, null, 2), 'utf8');
  }

  console.log(`Mode: ${args.upload ? 'UPLOAD' : 'DRY RUN'}`);
  if (args.pruneRemote) {
    console.log(`Prune mode: ${args.applyPrune ? 'APPLY' : 'PREVIEW'}`);
  }
  console.log(`Models to process: ${queue.length}`);

  let totalUploaded = 0;
  let totalSkipped = 0;
  let totalPruneCandidates = 0;
  let totalPruned = 0;

  await saveProgress({
    status: 'running',
    mode: args.upload ? 'upload' : 'dry-run',
    sourceRoot: path.resolve(args.sourceRoot),
    startedAt: new Date().toISOString(),
    queueLength: queue.length,
    queue: queue.map((entry) => ({ gender: entry.gender, model: entry.model })),
    currentIndex: -1,
    currentModel: null,
    completedModels: 0,
    totals: {
      uploaded: totalUploaded,
      skipped: totalSkipped,
      pruneCandidates: totalPruneCandidates,
      pruned: totalPruned,
    },
  });

  for (let i = 0; i < queue.length; i += 1) {
    const item = queue[i];
    console.log(`\n[${i + 1}/${queue.length}] ${item.gender}/${item.model}`);

    await saveProgress({
      status: 'running',
      mode: args.upload ? 'upload' : 'dry-run',
      sourceRoot: path.resolve(args.sourceRoot),
      startedAt: new Date().toISOString(),
      queueLength: queue.length,
      queue: queue.map((entry) => ({ gender: entry.gender, model: entry.model })),
      currentIndex: i,
      currentModel: { gender: item.gender, model: item.model },
      completedModels: i,
      totals: {
        uploaded: totalUploaded,
        skipped: totalSkipped,
        pruneCandidates: totalPruneCandidates,
        pruned: totalPruned,
      },
    });

    const manifestFileName = `${slugify(item.gender)}-${slugify(item.model)}${args.upload ? '.uploaded' : '.preview'}.json`;
    const manifestPath = path.join(manifestOutAbs, manifestFileName);

    let result;
    try {
      result = await processModel({
        gender: item.gender,
        modelFolderName: item.model,
        args: {
          ...args,
          onManifestCheckpoint: async (manifest) => {
            await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
          },
        },
        manifestIndex,
        cloudinary,
      });
    } catch (error) {
      await saveProgress({
        status: 'paused',
        mode: args.upload ? 'upload' : 'dry-run',
        sourceRoot: path.resolve(args.sourceRoot),
        pausedAt: new Date().toISOString(),
        queueLength: queue.length,
        queue: queue.map((entry) => ({ gender: entry.gender, model: entry.model })),
        currentIndex: i,
        currentModel: { gender: item.gender, model: item.model },
        completedModels: i,
        failedModel: { gender: item.gender, model: item.model },
        totals: {
          uploaded: totalUploaded,
          skipped: totalSkipped,
          pruneCandidates: totalPruneCandidates,
          pruned: totalPruned,
        },
      });
      throw error;
    }

    totalUploaded += result.uploadedCount;
    totalSkipped += result.skippedCount;
    totalPruneCandidates += result.pruneCandidatesCount;
    totalPruned += result.prunedCount;

    console.log(`Saved manifest: ${manifestFileName}`);
    if (args.upload) {
      console.log(`Uploaded: ${result.uploadedCount} | Skipped(existing): ${result.skippedCount}`);
    }
    if (args.pruneRemote) {
      console.log(
        `${args.applyPrune ? 'Deleted remote' : 'Prune candidates'}: ${args.applyPrune ? result.prunedCount : result.pruneCandidatesCount}`,
      );
    }

    await saveProgress({
      status: 'running',
      mode: args.upload ? 'upload' : 'dry-run',
      sourceRoot: path.resolve(args.sourceRoot),
      updatedAt: new Date().toISOString(),
      queueLength: queue.length,
      queue: queue.map((entry) => ({ gender: entry.gender, model: entry.model })),
      currentIndex: i,
      currentModel: { gender: item.gender, model: item.model },
      completedModels: i + 1,
      totals: {
        uploaded: totalUploaded,
        skipped: totalSkipped,
        pruneCandidates: totalPruneCandidates,
        pruned: totalPruned,
      },
    });
  }

  console.log('\nSummary:');
  if (args.upload) {
    console.log(`- Uploaded: ${totalUploaded}`);
    console.log(`- Skipped existing: ${totalSkipped}`);
  }
  if (args.pruneRemote) {
    console.log(`- Prune candidates: ${totalPruneCandidates}`);
    if (args.applyPrune) {
      console.log(`- Deleted remote: ${totalPruned}`);
    }
  }
  console.log(`- Models processed: ${queue.length}`);

  await saveProgress({
    status: 'done',
    mode: args.upload ? 'upload' : 'dry-run',
    sourceRoot: path.resolve(args.sourceRoot),
    finishedAt: new Date().toISOString(),
    queueLength: queue.length,
    queue: queue.map((entry) => ({ gender: entry.gender, model: entry.model })),
    completedModels: queue.length,
    totals: {
      uploaded: totalUploaded,
      skipped: totalSkipped,
      pruneCandidates: totalPruneCandidates,
      pruned: totalPruned,
    },
  });
}

run().catch((error) => {
  const safeMessage =
    (typeof error?.message === 'string' && error.message)
      || (typeof error?.error?.message === 'string' && error.error.message)
      || 'Unexpected error while running Cloudinary batch script.';

  const statusCode = error?.http_code || error?.statusCode || error?.error?.http_code;
  if (statusCode) {
    console.error(`${safeMessage} (HTTP ${statusCode})`);
  } else {
    console.error(safeMessage);
  }
  process.exit(1);
});
