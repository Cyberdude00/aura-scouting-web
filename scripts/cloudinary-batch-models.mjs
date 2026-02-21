import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

function parseArgs(argv) {
  const args = {
    genders: ['boys', 'girls'],
    sourceRoot: 'src/app/features/pages/gallery/data/import/models',
    manifestOut: 'src/app/features/pages/gallery/data/import/models/_cloudinary-manifests',
    cloudinaryBaseFolder: 'aura/gallery/models',
    exclude: ['adan'],
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
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function getModelDirectories(sourceRoot, genders, excludedSlugs) {
  const output = [];

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
      .filter((name) => !excludedSlugs.has(slugify(name)))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    for (const model of dirs) {
      output.push({ gender, model });
    }
  }

  return output;
}

function runPilotScriptForModel({ gender, model, args }) {
  const scriptPath = path.resolve('scripts/cloudinary-pilot-model.mjs');

  const commandArgs = [
    scriptPath,
    '--gender',
    gender,
    '--model',
    model,
    '--source-root',
    args.sourceRoot,
    '--manifest-out',
    args.manifestOut,
    '--base-folder',
    args.cloudinaryBaseFolder,
  ];

  if (args.upload) {
    commandArgs.push('--upload');
  }

  return new Promise((resolve) => {
    const child = spawn(process.execPath, commandArgs, {
      stdio: 'inherit',
      shell: false,
    });

    child.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const excludedSlugs = new Set(args.exclude.map((value) => slugify(value)));

  const models = await getModelDirectories(args.sourceRoot, args.genders, excludedSlugs);

  if (models.length === 0) {
    throw new Error('No model directories found to process with current filters.');
  }

  const queue = args.limit > 0 ? models.slice(0, args.limit) : models;

  console.log(`Mode: ${args.upload ? 'UPLOAD' : 'DRY RUN'}`);
  console.log(`Total models to process: ${queue.length}`);
  console.log(`Excluded slugs: ${Array.from(excludedSlugs).join(', ') || '(none)'}`);

  let okCount = 0;
  const failed = [];

  for (let i = 0; i < queue.length; i += 1) {
    const item = queue[i];
    console.log(`\n[${i + 1}/${queue.length}] ${item.gender}/${item.model}`);

    const success = await runPilotScriptForModel({ gender: item.gender, model: item.model, args });

    if (success) {
      okCount += 1;
    } else {
      failed.push(`${item.gender}/${item.model}`);
    }
  }

  console.log('\nBatch Summary:');
  console.log(`- Success: ${okCount}`);
  console.log(`- Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('- Failed models:');
    for (const item of failed) {
      console.log(`  - ${item}`);
    }
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
