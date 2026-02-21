import fs from 'node:fs/promises';
import path from 'node:path';

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

function resolveAliasSlug(name) {
  const slug = slugify(name);
  return MODEL_ALIASES.get(slug) || slug;
}

function buildModelBlockIndex(legacyContent) {
  const index = new Map();
  const blockRegex = /\/\/\s*===\s*Model:[\s\S]*?\{[\s\S]*?name:\s*"([^"]+)"[\s\S]*?\},\s*\/\/\s*===\s*End Model ===/g;

  let match;
  while ((match = blockRegex.exec(legacyContent)) !== null) {
    const fullBlock = match[0];
    const modelName = match[1];
    const modelSlug = slugify(modelName);

    if (!index.has(modelSlug)) {
      index.set(modelSlug, { modelName, block: fullBlock });
    }
  }

  return index;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const manifestsDirAbs = path.resolve(args.manifestsDir);
  const modelsFileAbs = path.resolve(args.modelsFile);
  const legacyFilesAbs = args.legacyFiles.map((entry) => path.resolve(entry));

  const modelsContent = await fs.readFile(modelsFileAbs, 'utf8');
  const datasetNames = Array.from(modelsContent.matchAll(/name:\s*"([^"]+)"/g)).map((match) => match[1]);
  const datasetBySlug = new Map(datasetNames.map((name) => [slugify(name), name]));

  const manifestFiles = (await fs.readdir(manifestsDirAbs))
    .filter((fileName) => fileName.endsWith('.uploaded.json'))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const manifestModelNames = [];
  for (const fileName of manifestFiles) {
    const raw = await fs.readFile(path.join(manifestsDirAbs, fileName), 'utf8');
    const json = JSON.parse(raw);
    if (json?.uploaded && json?.modelFolderName) {
      manifestModelNames.push(json.modelFolderName);
    }
  }

  const missingModelNames = manifestModelNames.filter((name) => {
    const exact = datasetBySlug.has(slugify(name));
    const aliased = datasetBySlug.has(resolveAliasSlug(name));
    return !exact && !aliased;
  });

  if (missingModelNames.length === 0) {
    console.log('No missing models to import from legacy.');
    return;
  }

  const legacyIndex = new Map();
  for (const legacyPath of legacyFilesAbs) {
    let content;
    try {
      content = await fs.readFile(legacyPath, 'utf8');
    } catch {
      continue;
    }

    const indexed = buildModelBlockIndex(content);
    for (const [slug, data] of indexed.entries()) {
      if (!legacyIndex.has(slug)) {
        legacyIndex.set(slug, data);
      }
    }
  }

  const blocksToInsert = [];
  const notFound = [];

  for (const modelName of missingModelNames) {
    const slug = slugify(modelName);
    const bySlug = legacyIndex.get(slug);

    if (bySlug) {
      blocksToInsert.push(bySlug.block);
      continue;
    }

    const fuzzy = Array.from(legacyIndex.entries()).find(([legacySlug]) => legacySlug.includes(slug) || slug.includes(legacySlug));
    if (fuzzy) {
      blocksToInsert.push(fuzzy[1].block);
      continue;
    }

    notFound.push(modelName);
  }

  if (blocksToInsert.length === 0) {
    console.log('No matching legacy blocks found for missing models.');
    if (notFound.length > 0) {
      console.log('Not found:');
      for (const item of notFound) {
        console.log(`- ${item}`);
      }
    }
    return;
  }

  const insertion = `\n\n${blocksToInsert.join('\n\n')}\n`;
  const updatedContent = modelsContent.replace(/\n\];\s*$/, `${insertion}\n];\n`);

  if (args.dryRun) {
    console.log('Dry run complete. No file changes written.');
    console.log(`Missing models detected: ${missingModelNames.length}`);
    console.log(`Blocks ready to import: ${blocksToInsert.length}`);
    if (notFound.length > 0) {
      console.log('Not found in legacy:');
      for (const item of notFound) {
        console.log(`- ${item}`);
      }
    }
    return;
  }

  await fs.writeFile(modelsFileAbs, updatedContent, 'utf8');

  console.log('Imported missing models from legacy into dataset.');
  console.log(`Missing models detected: ${missingModelNames.length}`);
  console.log(`Blocks imported: ${blocksToInsert.length}`);
  if (notFound.length > 0) {
    console.log('Not found in legacy:');
    for (const item of notFound) {
      console.log(`- ${item}`);
    }
  }
  console.log(`File: ${modelsFileAbs}`);
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
