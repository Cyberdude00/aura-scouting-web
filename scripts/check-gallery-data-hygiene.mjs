import { readFileSync } from 'node:fs';
import path from 'node:path';

const dataFiles = [
  path.resolve('src/app/features/pages/gallery/data/gallery-models-boys.data.ts'),
  path.resolve('src/app/features/pages/gallery/data/gallery-models-girls.data.ts'),
];

const urlRegex = /https:\/\/res\.cloudinary\.com[^"'\s,]+/g;

const allOccurrences = [];

for (const filePath of dataFiles) {
  const content = readFileSync(filePath, 'utf8');
  const matches = content.match(urlRegex) ?? [];

  for (const url of matches) {
    allOccurrences.push({ filePath, url });
  }
}

const byUrl = new Map();

for (const item of allOccurrences) {
  const list = byUrl.get(item.url) ?? [];
  list.push(item.filePath);
  byUrl.set(item.url, list);
}

const duplicates = [...byUrl.entries()]
  .filter(([, files]) => files.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

const totals = {
  totalUrls: allOccurrences.length,
  uniqueUrls: byUrl.size,
  duplicateUniqueUrls: duplicates.length,
};

console.log('Gallery data hygiene report');
console.log(`- Total URLs: ${totals.totalUrls}`);
console.log(`- Unique URLs: ${totals.uniqueUrls}`);
console.log(`- Duplicate unique URLs: ${totals.duplicateUniqueUrls}`);

if (duplicates.length > 0) {
  console.log('\nTop duplicate URLs (first 30):');

  for (const [url, files] of duplicates.slice(0, 30)) {
    const uniqueFiles = [...new Set(files)].map((f) => path.relative(process.cwd(), f));
    console.log(`- ${files.length}x | ${url}`);
    console.log(`  files: ${uniqueFiles.join(', ')}`);
  }
}
