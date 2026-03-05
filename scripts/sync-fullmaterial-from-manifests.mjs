import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_MANIFESTS_DIR = 'src/app/features/pages/gallery/data/gallery-model-config/models/_cloudinary-manifests';
const DEFAULT_TARGETS = [
  'src/app/features/pages/gallery/data/gallery-models-boys.data.ts',
  'src/app/features/pages/gallery/data/gallery-models-girls.data.ts',
];
const DEFAULT_SOURCE_FILTER = 'models media/optimized';

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
    manifestsDir: DEFAULT_MANIFESTS_DIR,
    sourceFilter: DEFAULT_SOURCE_FILTER,
    recentMinutes: 0,
    targets: [...DEFAULT_TARGETS],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === '--manifests-dir' && next) {
      args.manifestsDir = next;
      i += 1;
      continue;
    }

    if (current === '--source-filter' && next) {
      args.sourceFilter = next;
      i += 1;
      continue;
    }

    if (current === '--recent-minutes' && next) {
      args.recentMinutes = Number(next) || 0;
      i += 1;
      continue;
    }

    if (current === '--targets' && next) {
      args.targets = next.split(',').map((entry) => entry.trim()).filter(Boolean);
      i += 1;
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

function classify(relativePath, secureUrl) {
  const rel = String(relativePath || '')
    .toLowerCase()
    .replace(/\\/g, '/')
    .replace(/\s+/g, ' ')
    .trim();

  const relNoSpaces = rel.replace(/\s+/g, '');
  const url = String(secureUrl || '').toLowerCase();

  if (rel.includes('/videos/') || rel.startsWith('videos/') || /\.(mp4|mov|webm|m4v|avi|mkv)(\?|#|$)/i.test(url)) {
    return 'videos';
  }

  if (rel.includes('extra material') || relNoSpaces.includes('extramaterial')) {
    return 'extraMaterial';
  }

  if (rel.includes('extra polas') || relNoSpaces.includes('extrapolas')) {
    return 'polas';
  }

  if (/^polas\//.test(rel) || rel.includes('/polas/')) {
    return 'polas';
  }

  if (rel.includes('extra snaps') || relNoSpaces.includes('extrasnaps')) {
    return 'extraSnaps';
  }

  return null;
}

function addUnique(target, value) {
  if (!value || typeof value !== 'string') {
    return;
  }
  if (!target.includes(value)) {
    target.push(value);
  }
}

function renderArray(indent, items) {
  if (!items.length) {
    return '[]';
  }

  return `\n${indent}[\n${items.map((url) => `${indent}  "${url}"`).join(',\n')}\n${indent}]`;
}

function resolveModelKey(name) {
  const slug = slugify(name);
  return MODEL_ALIASES.get(slug) || slug;
}

function buildSectionsByModel(manifestsDirAbs, sourceFilter, recentMinutes) {
  const files = fs.readdirSync(manifestsDirAbs)
    .filter((entry) => entry.endsWith('.uploaded.json'))
    .map((entry) => ({
      name: entry,
      abs: path.join(manifestsDirAbs, entry),
      mtime: fs.statSync(path.join(manifestsDirAbs, entry)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  const now = Date.now();
  const byModel = new Map();
  let considered = 0;

  for (const file of files) {
    if (recentMinutes > 0) {
      const maxAgeMs = recentMinutes * 60 * 1000;
      if (now - file.mtime > maxAgeMs) {
        continue;
      }
    }

    const json = JSON.parse(fs.readFileSync(file.abs, 'utf8'));
    const source = String(json.sourceFolder || '').toLowerCase().replace(/\\/g, '/');

    if (sourceFilter && !source.includes(sourceFilter.toLowerCase().replace(/\\/g, '/'))) {
      continue;
    }

    considered += 1;

    const modelName = String(json.modelFolderName || '').trim();
    if (!modelName) {
      continue;
    }

    const key = resolveModelKey(modelName);
    const existing = byModel.get(key) || {
      extraMaterial: [],
      polas: [],
      extraSnaps: [],
      videos: [],
    };

    for (const item of json.items || []) {
      const secureUrl = item?.secureUrl;
      const section = classify(item?.relativePath, secureUrl);
      if (!section) {
        continue;
      }
      addUnique(existing[section], secureUrl);
    }

    byModel.set(key, existing);
  }

  return { byModel, considered };
}

function updateTargetFile(absPath, byModel) {
  const content = fs.readFileSync(absPath, 'utf8');
  let updatedModels = 0;

  const updated = content.replace(
    /(\{[\s\S]*?"name"\s*:\s*"([^"]+)"[\s\S]*?"videos"\s*:\s*\[[\s\S]*?\],)(\s*"fullMaterialData"\s*:\s*\{[\s\S]*?\},)?(\s*"instagram"\s*:)/g,
    (full, firstPart, modelName, _existingFullMaterial, instagramPart) => {
      const key = resolveModelKey(modelName);
      const sections = byModel.get(key);
      if (!sections) {
        return full;
      }

      const total = sections.extraMaterial.length + sections.polas.length + sections.extraSnaps.length + sections.videos.length;
      if (total === 0) {
        return full;
      }

      const match = firstPart.match(/^(\s*)"name"/m);
      const baseIndent = match ? match[1] : '    ';
      const valueIndent = `${baseIndent}    `;

      const fullMaterialBlock =
        `${baseIndent}"fullMaterialData": {\n` +
        `${baseIndent}  "extraMaterial": ${renderArray(valueIndent, sections.extraMaterial)},\n` +
        `${baseIndent}  "polas": ${renderArray(valueIndent, sections.polas)},\n` +
        `${baseIndent}  "extraSnaps": ${renderArray(valueIndent, sections.extraSnaps)},\n` +
        `${baseIndent}  "videos": ${renderArray(valueIndent, sections.videos)}\n` +
        `${baseIndent}},`;

      updatedModels += 1;
      return `${firstPart}\n${fullMaterialBlock}${instagramPart}`;
    },
  );

  fs.writeFileSync(absPath, updated, 'utf8');
  return updatedModels;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifestsDirAbs = path.resolve(args.manifestsDir);
  const targetAbs = args.targets.map((entry) => path.resolve(entry));

  const { byModel, considered } = buildSectionsByModel(manifestsDirAbs, args.sourceFilter, args.recentMinutes);

  let totalUpdated = 0;
  for (const filePath of targetAbs) {
    totalUpdated += updateTargetFile(filePath, byModel);
  }

  console.log(`manifests considered: ${considered}`);
  console.log(`models with classified sections: ${byModel.size}`);
  console.log(`models updated in targets: ${totalUpdated}`);
  for (const filePath of targetAbs) {
    console.log(`updated file: ${filePath}`);
  }
}

main();
