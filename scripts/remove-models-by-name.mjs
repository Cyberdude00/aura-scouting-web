import fs from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    modelsFile: 'src/app/features/pages/gallery/data/gallery-models.data.ts',
    names: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === '--models-file' && next) {
      args.modelsFile = next;
      i += 1;
      continue;
    }

    if (current === '--names' && next) {
      args.names = next.split(',').map((n) => n.trim()).filter(Boolean);
      i += 1;
      continue;
    }
  }

  return args;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.names.length === 0) {
    throw new Error('Missing --names');
  }

  const modelsFileAbs = path.resolve(args.modelsFile);
  let content = await fs.readFile(modelsFileAbs, 'utf8');

  let removed = 0;
  for (const name of args.names) {
    const regex = new RegExp(
      `\\n\\s*\\/\\/ === Model:[\\s\\S]*?name:\\s*"${escapeRegExp(name)}"[\\s\\S]*?\\},\\s*\\/\\/ === End Model ===\\n?`,
      'g',
    );
    const before = content;
    content = content.replace(regex, '\n');
    if (content !== before) {
      removed += 1;
    }
  }

  content = content.replace(/\n{3,}/g, '\n\n');
  await fs.writeFile(modelsFileAbs, content, 'utf8');

  console.log(`Removed models: ${removed}`);
  console.log(`File: ${modelsFileAbs}`);
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
