import fs from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    manifestsDir: 'src/app/features/pages/gallery/data/import/models/_cloudinary-manifests',
    modelsFile: 'src/app/features/pages/gallery/data/gallery-models.data.ts',
    legacyFiles: [
      'src/app/features/pages/gallery/data/import/models/models-korea-feb.js',
      'src/app/features/pages/gallery/data/import/models/models-japan.js',
      'src/app/features/pages/gallery/data/import/models/models-china-feb.js',
    ],
    dryRun: false,
    preserveCurrentOrder: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === '--manifests-dir' && next) {
      args.manifestsDir = next;
      i += 1;
      continue;
    }

    if (current === '--models-file' && next) {
      args.modelsFile = next;
      i += 1;
      continue;
    }

    if (current === '--legacy-files' && next) {
      args.legacyFiles = next.split(',').map((entry) => entry.trim()).filter(Boolean);
      i += 1;
      continue;
    }

    if (current === '--dry-run') {
      args.dryRun = true;
    }

    if (current === '--preserve-current-order') {
      args.preserveCurrentOrder = true;
    }

    if (current === '--legacy-order') {
      args.preserveCurrentOrder = false;
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

const MODEL_ALIASES = new Map([
  ['agos-martinez', 'agostina-martinez'],
  ['angel-bret', 'angel'],
  ['bernardo-romano', 'bernardo'],
  ['emilia-bryan', 'emilia'],
  ['luciana-imoberdorf', 'luciana-imoberdof'],
  ['moana-buezas', 'moana'],
  ['pilar-sampaio', 'pilar'],
  ['salih-topcouglu', 'salih'],
]);

function resolveAliasSlug(modelName) {
  const slug = slugify(modelName);
  return MODEL_ALIASES.get(slug) || slug;
}

function basenameKey(value) {
  const fileName = path.basename(value).replace(/\.[^.]+$/, '');
  return slugify(fileName);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractLegacyModelOrders(content) {
  const result = new Map();
  const modelRegex = /\{[\s\S]*?name:\s*"([^"]+)"[\s\S]*?portfolio:\s*\[([\s\S]*?)\][\s\S]*?\},?/g;

  let match;
  while ((match = modelRegex.exec(content)) !== null) {
    const modelName = match[1];
    const portfolioBody = match[2];

    const urls = [];
    for (const line of portfolioBody.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) {
        continue;
      }
      const urlMatch = trimmed.match(/^"([^"]+)"/);
      if (urlMatch) {
        urls.push(urlMatch[1]);
      }
    }

    if (urls.length === 0) {
      continue;
    }

    const keys = urls.map((entry) => basenameKey(entry));
    result.set(slugify(modelName), keys);
  }

  return result;
}

function findLegacyOrderForModel(legacyOrdersByModel, modelName) {
  const modelSlug = resolveAliasSlug(modelName);

  if (legacyOrdersByModel.has(modelSlug)) {
    return legacyOrdersByModel.get(modelSlug);
  }

  for (const [legacySlug, keys] of legacyOrdersByModel.entries()) {
    if (legacySlug.includes(modelSlug) || modelSlug.includes(legacySlug)) {
      return keys;
    }
  }

  return null;
}

function resolveDatasetModelName(modelsContent, manifestModelName) {
  const allNames = Array.from(modelsContent.matchAll(/name:\s*"([^"]+)"/g)).map((match) => match[1]);
  const bySlug = new Map(allNames.map((name) => [slugify(name), name]));

  const direct = bySlug.get(slugify(manifestModelName));
  if (direct) {
    return direct;
  }

  const aliased = bySlug.get(resolveAliasSlug(manifestModelName));
  if (aliased) {
    return aliased;
  }

  return null;
}

function reorderByLegacy(manifestItems, legacyKeys) {
  if (!legacyKeys || legacyKeys.length === 0) {
    return manifestItems;
  }

  const indexed = manifestItems.map((item, index) => ({
    ...item,
    key: basenameKey(item.relativePath || item.secureUrl || `item-${index}`),
  }));

  const used = new Set();
  const ordered = [];

  for (const legacyKey of legacyKeys) {
    const candidateIndex = indexed.findIndex((entry, idx) => !used.has(idx) && entry.key === legacyKey);
    if (candidateIndex >= 0) {
      used.add(candidateIndex);
      ordered.push(indexed[candidateIndex]);
    }
  }

  for (let i = 0; i < indexed.length; i += 1) {
    if (!used.has(i)) {
      ordered.push(indexed[i]);
    }
  }

  return ordered;
}

function formatPortfolio(urls) {
  const lines = urls.map((url) => `      "${url}",`);
  return `portfolio: [\n${lines.join('\n')}\n    ],`;
}

function extractPortfolioUrlsFromBlock(block) {
  const match = block.match(/portfolio:\s*\[([\s\S]*?)\],/m);
  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

function reorderByCurrentBlockOrder(manifestUrls, currentBlockUrls) {
  if (!currentBlockUrls.length) {
    return manifestUrls;
  }

  const withKey = manifestUrls.map((url, index) => ({
    url,
    index,
    key: basenameKey(url),
  }));

  const ordered = [];
  const used = new Set();

  for (const currentUrl of currentBlockUrls) {
    const targetKey = basenameKey(currentUrl);
    const foundIndex = withKey.findIndex((entry, idx) => !used.has(idx) && entry.key === targetKey);
    if (foundIndex >= 0) {
      used.add(foundIndex);
      ordered.push(withKey[foundIndex].url);
    }
  }

  for (let i = 0; i < withKey.length; i += 1) {
    if (!used.has(i)) {
      ordered.push(withKey[i].url);
    }
  }

  return ordered;
}

function choosePhotoUrl(orderedItems, legacyOrderKeys, currentPhoto) {
  if (!orderedItems.length) {
    return currentPhoto;
  }

  if (legacyOrderKeys?.length) {
    const currentPhotoKey = basenameKey(currentPhoto || '');
    const matched = orderedItems.find((item) => basenameKey(item.relativePath || item.secureUrl) === currentPhotoKey);
    if (matched?.secureUrl) {
      return matched.secureUrl;
    }

    const firstLegacy = legacyOrderKeys[0];
    const byLegacy = orderedItems.find((item) => basenameKey(item.relativePath || item.secureUrl) === firstLegacy);
    if (byLegacy?.secureUrl) {
      return byLegacy.secureUrl;
    }
  }

  return orderedItems[0].secureUrl || currentPhoto;
}

async function loadUploadedManifests(manifestsDirAbs) {
  const entries = await fs.readdir(manifestsDirAbs, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.uploaded.json'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const output = [];
  for (const fileName of files) {
    const absPath = path.join(manifestsDirAbs, fileName);
    const raw = await fs.readFile(absPath, 'utf8');
    const json = JSON.parse(raw);

    if (json?.uploaded && json?.modelFolderName) {
      output.push({
        fileName,
        absPath,
        manifest: json,
      });
    }
  }

  return output;
}

async function buildLegacyOrders(legacyFilesAbs) {
  const merged = new Map();

  for (const filePath of legacyFilesAbs) {
    let content;
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch {
      continue;
    }

    const orders = extractLegacyModelOrders(content);
    for (const [modelSlug, keys] of orders.entries()) {
      if (!merged.has(modelSlug) || merged.get(modelSlug).length === 0) {
        merged.set(modelSlug, keys);
      }
    }
  }

  return merged;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));

  const manifestsDirAbs = path.resolve(args.manifestsDir);
  const modelsFileAbs = path.resolve(args.modelsFile);
  const legacyFilesAbs = args.legacyFiles.map((entry) => path.resolve(entry));

  const manifests = await loadUploadedManifests(manifestsDirAbs);
  if (manifests.length === 0) {
    throw new Error(`No uploaded manifests found in ${manifestsDirAbs}`);
  }

  let modelsContent = await fs.readFile(modelsFileAbs, 'utf8');
  const legacyOrdersByModel = await buildLegacyOrders(legacyFilesAbs);

  const manifestBySlug = new Map();
  for (const { fileName, manifest } of manifests) {
    const secureItems = (manifest.items || [])
      .filter((item) => typeof item?.secureUrl === 'string' && item.secureUrl.length > 0);

    const legacyKeys = findLegacyOrderForModel(legacyOrdersByModel, manifest?.modelFolderName || '');
    const orderedItems = reorderByLegacy(secureItems, legacyKeys);
    const secureUrls = orderedItems.map((item) => item.secureUrl);

    if (!manifest?.modelFolderName || secureUrls.length === 0) {
      continue;
    }

    const modelSlug = slugify(manifest.modelFolderName);
    manifestBySlug.set(modelSlug, { fileName, modelName: manifest.modelFolderName, secureUrls });

    const aliasSlug = resolveAliasSlug(manifest.modelFolderName);
    if (aliasSlug !== modelSlug && !manifestBySlug.has(aliasSlug)) {
      manifestBySlug.set(aliasSlug, { fileName, modelName: manifest.modelFolderName, secureUrls });
    }
  }

  let appliedCount = 0;
  const warnings = [];
  const matchedManifestKeys = new Set();

  const modelBlockRegex = /(\{\s*[\s\S]*?name:\s*"([^"]+)"[\s\S]*?\},\s*\/\/ === End Model ===)/g;

  modelsContent = modelsContent.replace(modelBlockRegex, (fullBlock, block, modelNameInBlock) => {
    const datasetSlug = slugify(modelNameInBlock);
    const manifestEntry = manifestBySlug.get(datasetSlug) || manifestBySlug.get(resolveAliasSlug(modelNameInBlock));

    if (!manifestEntry) {
      return fullBlock;
    }

    const urls = manifestEntry.secureUrls;
    if (!urls || urls.length === 0) {
      warnings.push(`No secure URLs in manifest: ${manifestEntry.fileName}`);
      return fullBlock;
    }

    matchedManifestKeys.add(slugify(manifestEntry.modelName));

    const currentBlockUrls = extractPortfolioUrlsFromBlock(block);
    const finalUrls = args.preserveCurrentOrder
      ? reorderByCurrentBlockOrder(urls, currentBlockUrls)
      : urls;

    if (!finalUrls.length) {
      warnings.push(`No URLs to apply after ordering: ${manifestEntry.fileName}`);
      return fullBlock;
    }

    let nextBlock = block.replace(/photo:\s*"[^"]*",/, `photo: "${finalUrls[0]}",`);
    nextBlock = nextBlock.replace(/portfolio:\s*\[[\s\S]*?\],/, formatPortfolio(finalUrls));

    if (nextBlock !== block) {
      appliedCount += 1;
    }

    return nextBlock;
  });

  for (const { fileName, manifest } of manifests) {
    const key = slugify(manifest.modelFolderName || '');
    if (key && !matchedManifestKeys.has(key) && !matchedManifestKeys.has(resolveAliasSlug(manifest.modelFolderName))) {
      warnings.push(`Model not found in dataset: ${manifest.modelFolderName} (${fileName})`);
    }
  }

  if (args.dryRun) {
    console.log('Dry run complete. No file changes written.');
    console.log(`Order mode: ${args.preserveCurrentOrder ? 'preserve-current-order' : 'legacy-order'}`);
    console.log(`Manifests processed: ${manifests.length}`);
    console.log(`Models updated: ${appliedCount}`);
    if (warnings.length > 0) {
      console.log('Warnings:');
      for (const warning of warnings) {
        console.log(`- ${warning}`);
      }
    }
    return;
  }

  await fs.writeFile(modelsFileAbs, modelsContent, 'utf8');

  console.log('Cloudinary manifests synced to gallery models file.');
  console.log(`Order mode: ${args.preserveCurrentOrder ? 'preserve-current-order' : 'legacy-order'}`);
  console.log(`Manifests processed: ${manifests.length}`);
  console.log(`Models updated: ${appliedCount}`);
  if (warnings.length > 0) {
    console.log('Warnings:');
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }
  console.log(`File: ${modelsFileAbs}`);
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
