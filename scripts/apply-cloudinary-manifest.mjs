import fs from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = {
    manifest: 'src/app/features/pages/gallery/data/import/models/_cloudinary-manifests/boys-adan.uploaded.json',
    modelsFile: 'src/app/features/pages/gallery/data/gallery-models.data.ts',
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === '--manifest' && next) {
      args.manifest = next;
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatPortfolio(urls) {
  const lines = urls.map((url) => `      "${url}",`);
  return `portfolio: [\n${lines.join('\n')}\n    ],`;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const manifestPath = path.resolve(args.manifest);
  const modelsFilePath = path.resolve(args.modelsFile);

  const manifestRaw = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);

  if (!manifest?.uploaded) {
    throw new Error(`Manifest is not an uploaded manifest: ${manifestPath}`);
  }

  const modelName = manifest.modelFolderName;
  const secureUrls = (manifest.items || [])
    .map((item) => item.secureUrl)
    .filter((url) => typeof url === 'string' && url.length > 0);

  if (!modelName || secureUrls.length === 0) {
    throw new Error('Manifest missing modelFolderName or secure URLs');
  }

  const modelsContent = await fs.readFile(modelsFilePath, 'utf8');

  const modelBlockRegex = new RegExp(
    `\\{[\\s\\S]*?name:\\s*"${escapeRegExp(modelName)}"[\\s\\S]*?\\},\\s*\\/\\/ === End Model ===`,
    'm',
  );

  const modelBlockMatch = modelsContent.match(modelBlockRegex);
  if (!modelBlockMatch) {
    throw new Error(`Model block not found for name: ${modelName}`);
  }

  const modelBlock = modelBlockMatch[0];

  const photoUpdatedBlock = modelBlock.replace(
    /photo:\s*"[^"]*",/,
    `photo: "${secureUrls[0]}",`,
  );

  const portfolioUpdatedBlock = photoUpdatedBlock.replace(
    /portfolio:\s*\[[\s\S]*?\],/,
    formatPortfolio(secureUrls),
  );

  if (portfolioUpdatedBlock === modelBlock) {
    throw new Error(`No changes applied for model: ${modelName}`);
  }

  const updatedContent = modelsContent.replace(modelBlock, portfolioUpdatedBlock);

  if (args.dryRun) {
    console.log('Dry run complete. No file changes written.');
    console.log(`Model: ${modelName}`);
    console.log(`URLs to apply: ${secureUrls.length}`);
    console.log(`Manifest: ${manifestPath}`);
    return;
  }

  await fs.writeFile(modelsFilePath, updatedContent, 'utf8');

  console.log('Updated model links from Cloudinary manifest.');
  console.log(`Model: ${modelName}`);
  console.log(`URLs applied: ${secureUrls.length}`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`File: ${modelsFilePath}`);
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
