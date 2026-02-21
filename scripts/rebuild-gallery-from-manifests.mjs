import fs from 'node:fs/promises';
import path from 'node:path';

const MANIFESTS_DIR = 'src/app/features/pages/gallery/data/import/models/_cloudinary-manifests';
const MODELS_FILE = 'src/app/features/pages/gallery/data/gallery-models.data.ts';
const GROUPS_FILE = 'src/app/features/pages/gallery/data/groups/agency-galleries.config.ts';
const LEGACY_FILES = {
  korea: 'src/app/features/pages/gallery/data/import/models/models-korea-feb.js',
  japan: 'src/app/features/pages/gallery/data/import/models/models-japan.js',
  china: 'src/app/features/pages/gallery/data/import/models/models-china-feb.js',
};

const NAME_ALIASES = new Map([
  ['angel', 'angel-bret'],
  ['agostina-martinez', 'agos-martinez'],
  ['bernardo', 'bernardo-romano'],
  ['emilia', 'emilia-bryan'],
  ['luciana-imoberdof', 'luciana-imoberdorf'],
  ['moana', 'moana-buezas'],
  ['pilar', 'pilar-sampaio'],
  ['salih', 'salih-topcouglu'],
  ['mafer-bezanilla', 'mafer'],
]);

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function resolveAlias(slug) {
  return NAME_ALIASES.get(slug) || slug;
}

function getFileNameFromPath(value) {
  const normalized = String(value || '').replaceAll('\\', '/');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || normalized;
}

function toLegacyFileKey(value) {
  const fileName = getFileNameFromPath(value).toLowerCase();
  const noExt = fileName.replace(/\.[a-z0-9]+$/i, '');
  return noExt.replace(/[^a-z0-9]+/g, '');
}

function getRelativeGroup(relativePath) {
  const lower = String(relativePath || '').replaceAll('\\', '/').toLowerCase();
  if (lower.startsWith('book/')) return 'book';
  if (lower.startsWith('polas/') || lower.startsWith('snaps/')) return 'polas';
  return 'other';
}

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function reorderByLegacy(baseItems, legacyOrderKeys) {
  if (!Array.isArray(legacyOrderKeys) || legacyOrderKeys.length === 0) {
    return baseItems;
  }

  const buckets = new Map();
  for (const item of baseItems) {
    const key = toLegacyFileKey(item.relativePath || item.secureUrl || '');
    if (!buckets.has(key)) {
      buckets.set(key, []);
    }
    buckets.get(key).push(item);
  }

  const ordered = [];
  const taken = new Set();

  for (const key of legacyOrderKeys) {
    const list = buckets.get(key);
    if (!list || list.length === 0) {
      continue;
    }

    const item = list.shift();
    ordered.push(item);
    taken.add(item);
  }

  for (const item of baseItems) {
    if (!taken.has(item)) {
      ordered.push(item);
    }
  }

  return ordered;
}

function orderManifestItems(items) {
  const copy = [...items];
  const grouped = {
    book: [],
    polas: [],
    other: [],
  };

  for (const item of copy) {
    grouped[getRelativeGroup(item.relativePath)].push(item);
  }

  grouped.book.sort((x, y) => naturalCompare(x.relativePath || '', y.relativePath || ''));
  grouped.polas.sort((x, y) => naturalCompare(x.relativePath || '', y.relativePath || ''));
  grouped.other.sort((x, y) => naturalCompare(x.relativePath || '', y.relativePath || ''));

  return [...grouped.book, ...grouped.polas, ...grouped.other];
}

function extractLegacyCountryOrder(content) {
  const names = [];
  const seen = new Set();
  const regex = /name\s*:\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const slug = slugify(match[1]);
    if (!seen.has(slug)) {
      seen.add(slug);
      names.push(slug);
    }
  }
  return names;
}

function extractLegacyModelPortfolioOrder(content) {
  const bySlug = new Map();
  const modelRegex = /\{[\s\S]*?name:\s*"([^"]+)"[\s\S]*?portfolio:\s*\[([\s\S]*?)\][\s\S]*?\},\s*\/\/ === End Model ===/g;

  let match;
  while ((match = modelRegex.exec(content)) !== null) {
    const slug = resolveAlias(slugify(match[1]));
    if (bySlug.has(slug)) {
      continue;
    }

    const listBlock = match[2];
    const urlMatches = [...listBlock.matchAll(/"([^"]+)"/g)].map((item) => item[1]);
    const keys = urlMatches
      .map((item) => toLegacyFileKey(item))
      .filter((item) => item.length > 0);

    bySlug.set(slug, keys);
  }

  return bySlug;
}

function extractExistingMetadata(content) {
  const out = new Map();
  const blockRegex = /\{[\s\S]*?name:\s*"([^"]+)"[\s\S]*?\},\s*\/\/ === End Model ===/g;
  let blockMatch;
  while ((blockMatch = blockRegex.exec(content)) !== null) {
    const block = blockMatch[0];
    const name = blockMatch[1];
    const slug = slugify(name);

    const pick = (field) => {
      const m = block.match(new RegExp(`${field}:\\s*"([^"]*)"`));
      return m ? m[1] : '';
    };

    out.set(slug, {
      name,
      height: pick('height'),
      measurements: pick('measurements'),
      hair: pick('hair'),
      eyes: pick('eyes'),
      shoe: pick('shoe'),
      availability: pick('availability') || 'on',
    });
  }
  return out;
}

function modelToBlock(model) {
  const portfolioLines = model.portfolio.map((url) => `      "${url}",`).join('\n');

  return `  // === Model: ${model.name} ===\n  {\n    name: "${model.name}",\n    gender: "${model.gender}",\n    photo: "${model.photo}",\n    height: "${model.height}",\n    measurements: "${model.measurements}",\n    hair: "${model.hair}",\n    eyes: "${model.eyes}",\n    shoe: "${model.shoe}",\n    availability: "${model.availability}",\n    portfolio: [\n${portfolioLines}\n    ],\n    instagram: []\n  }, // === End Model ===`;
}

function buildModelsFile(models) {
  const blocks = models.map(modelToBlock).join('\n\n');
  return `import { ScoutingModel } from './scouting-model.types';\n\nexport const galleryModels: ScoutingModel[] = [\n${blocks}\n];\n`;
}

function buildGroupsFile(countryIds) {
  const renderIds = (ids) => ids.map((id) => `      '${id}',`).join('\n');

  return `export interface AgencyGalleryConfig {\n  galleryKey: string;\n  galleryName: string;\n  modelIds: string[];\n}\n\nexport const agencyGalleriesConfig: AgencyGalleryConfig[] = [\n  {\n    galleryKey: 'korea',\n    galleryName: 'KOREA',\n    modelIds: [\n${renderIds(countryIds.korea)}\n    ],\n  },\n  {\n    galleryKey: 'japan',\n    galleryName: 'JAPAN',\n    modelIds: [\n${renderIds(countryIds.japan)}\n    ],\n  },\n  {\n    galleryKey: 'china',\n    galleryName: 'CHINA',\n    modelIds: [\n${renderIds(countryIds.china)}\n    ],\n  },\n];\n`;
}

async function run() {
  const modelsFileAbs = path.resolve(MODELS_FILE);
  const groupsFileAbs = path.resolve(GROUPS_FILE);
  const manifestsDirAbs = path.resolve(MANIFESTS_DIR);

  const existingContent = await fs.readFile(modelsFileAbs, 'utf8');
  const existingMeta = extractExistingMetadata(existingContent);

  const manifests = (await fs.readdir(manifestsDirAbs))
    .filter((name) => name.endsWith('.uploaded.json'))
    .sort((a, b) => naturalCompare(a, b));

  const manifestModels = new Map();
  const legacyOrders = {};
  const legacyPortfolioOrderBySlug = new Map();

  for (const [country, relPath] of Object.entries(LEGACY_FILES)) {
    const raw = await fs.readFile(path.resolve(relPath), 'utf8');
    legacyOrders[country] = extractLegacyCountryOrder(raw);

    const portfolios = extractLegacyModelPortfolioOrder(raw);
    for (const [slug, keys] of portfolios.entries()) {
      if (!legacyPortfolioOrderBySlug.has(slug) && keys.length > 0) {
        legacyPortfolioOrderBySlug.set(slug, keys);
      }
    }
  }

  for (const fileName of manifests) {
    const raw = await fs.readFile(path.join(manifestsDirAbs, fileName), 'utf8');
    const json = JSON.parse(raw);

    if (!json?.uploaded || !json?.modelFolderName || !Array.isArray(json?.items)) {
      continue;
    }

    const slug = slugify(json.modelFolderName);
    const ordered = orderManifestItems(
      json.items.filter((item) => typeof item?.secureUrl === 'string' && item.secureUrl.length > 0),
    );

    const legacyOrderKeys = legacyPortfolioOrderBySlug.get(resolveAlias(slug));
    const orderedWithLegacy = reorderByLegacy(ordered, legacyOrderKeys);

    if (orderedWithLegacy.length === 0) {
      continue;
    }

    manifestModels.set(slug, {
      slug,
      name: json.modelFolderName,
      gender: json.gender?.toLowerCase() === 'girls' ? 'Girls' : 'Boys',
      portfolio: orderedWithLegacy.map((item) => item.secureUrl),
      photo: orderedWithLegacy[0].secureUrl,
    });
  }

  const allManifestSlugs = new Set(manifestModels.keys());
  const legacyUnion = new Set([
    ...legacyOrders.korea,
    ...legacyOrders.japan,
    ...legacyOrders.china,
  ].map((slug) => resolveAlias(slug)));

  const newSlugs = [...allManifestSlugs].filter((slug) => !legacyUnion.has(slug));

  const countryIds = { korea: [], japan: [], china: [] };

  for (const country of ['korea', 'japan', 'china']) {
    const mapped = legacyOrders[country]
      .map((slug) => resolveAlias(slug))
      .filter((slug, idx, arr) => arr.indexOf(slug) === idx)
      .filter((slug) => allManifestSlugs.has(slug));

    const additions = newSlugs
      .filter((slug) => !mapped.includes(slug))
      .sort((a, b) => naturalCompare(a, b));

    countryIds[country] = [...mapped, ...additions];
  }

  const finalModels = [...allManifestSlugs]
    .sort((a, b) => naturalCompare(a, b))
    .map((slug) => {
      const base = manifestModels.get(slug);
      const meta = existingMeta.get(slug);

      return {
        name: base.name,
        gender: base.gender,
        photo: base.photo,
        portfolio: base.portfolio,
        height: meta?.height ?? '',
        measurements: meta?.measurements ?? '',
        hair: meta?.hair ?? '',
        eyes: meta?.eyes ?? '',
        shoe: meta?.shoe ?? '',
        availability: meta?.availability ?? 'on',
      };
    });

  await fs.writeFile(modelsFileAbs, buildModelsFile(finalModels), 'utf8');
  await fs.writeFile(groupsFileAbs, buildGroupsFile(countryIds), 'utf8');

  console.log(`Models written: ${finalModels.length}`);
  console.log(`New models added to all countries: ${newSlugs.length}`);
  console.log(`- ${newSlugs.join(', ') || '(none)'}`);
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
