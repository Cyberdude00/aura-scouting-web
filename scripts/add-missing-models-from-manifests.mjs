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

function formatPortfolio(urls) {
  return urls.map((url) => `      "${url}",`).join('\n');
}

function createModelBlock(modelName, gender, urls) {
  const safeUrls = urls.length > 0 ? urls : [''];
  const photo = safeUrls[0] || '';

  return `\n  // === Model: ${modelName} ===\n  {\n    name: "${modelName}",\n    gender: "${gender}",\n    photo: "${photo}",\n    height: "",\n    measurements: "",\n    hair: "",\n    eyes: "",\n    shoe: "",\n    availability: "on",\n    portfolio: [\n${formatPortfolio(safeUrls)}\n    ],\n    instagram: []\n  }, // === End Model ===\n`;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const manifestsDirAbs = path.resolve(args.manifestsDir);
  const modelsFileAbs = path.resolve(args.modelsFile);

  const modelsContent = await fs.readFile(modelsFileAbs, 'utf8');
  const datasetNames = Array.from(modelsContent.matchAll(/name:\s*"([^"]+)"/g)).map((match) => match[1]);
  const datasetSlugs = new Set(datasetNames.map((name) => slugify(name)));

  const entries = await fs.readdir(manifestsDirAbs, { withFileTypes: true });
  const manifestFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.uploaded.json'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const blocks = [];

  for (const fileName of manifestFiles) {
    const raw = await fs.readFile(path.join(manifestsDirAbs, fileName), 'utf8');
    const manifest = JSON.parse(raw);

    const modelName = manifest?.modelFolderName;
    const gender = manifest?.gender?.toLowerCase() === 'girls' ? 'Girls' : 'Boys';
    const urls = (manifest?.items || [])
      .map((item) => item?.secureUrl)
      .filter((url) => typeof url === 'string' && url.length > 0);

    if (!modelName || urls.length === 0) {
      continue;
    }

    const modelSlug = slugify(modelName);
    const aliasSlug = resolveAliasSlug(modelName);

    if (datasetSlugs.has(modelSlug) || datasetSlugs.has(aliasSlug)) {
      continue;
    }

    blocks.push(createModelBlock(modelName, gender, urls));
    datasetSlugs.add(modelSlug);
  }

  if (blocks.length === 0) {
    console.log('No missing models found to add from manifests.');
    return;
  }

  const insertion = blocks.join('\n');
  const updatedContent = modelsContent.replace(/\n\];\s*$/, `${insertion}\n];\n`);

  if (args.dryRun) {
    console.log('Dry run complete. No file changes written.');
    console.log(`Models to add: ${blocks.length}`);
    return;
  }

  await fs.writeFile(modelsFileAbs, updatedContent, 'utf8');

  console.log('Added missing models from uploaded manifests.');
  console.log(`Models added: ${blocks.length}`);
  console.log(`File: ${modelsFileAbs}`);
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
