// Script para listar todos los archivos de Cloudinary en las subcarpetas de Juan Toffalo
// Requiere instalar cloudinary: npm install cloudinary

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configuración desde variables de entorno o .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dcxaitngm',
  api_key: process.env.CLOUDINARY_API_KEY || '921915992471162',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'eAMAOJk3K9yggUqag_zx-_nT8C0',
});

const BASE = 'aura/gallery/models/boys/juan-toffalo';
const SUBFOLDERS = ['book', 'extra-material', 'extra-polas', 'polas', 'videos'];
const OUTPUT = 'juan-toffalo-cloudinary-links.txt';

async function fetchAllResources(prefix) {
  let next_cursor = undefined;
  let all = [];
  do {
    const res = await cloudinary.search
      .expression(`folder:${prefix}`)
      .max_results(500)
      .next_cursor(next_cursor)
      .execute();
    all = all.concat(res.resources);
    next_cursor = res.next_cursor;
  } while (next_cursor);
  return all;
}

(async () => {
  try {
    let allLinks = [];
    for (const sub of SUBFOLDERS) {
      const folder = `${BASE}/${sub}`;
      const resources = await fetchAllResources(folder);
      if (resources.length) {
        allLinks.push(`\n# ${sub}\n`);
        allLinks = allLinks.concat(resources.map(r => r.secure_url));
      }
    }
    if (!allLinks.length) {
      console.log('No se encontraron archivos en ninguna subcarpeta.');
      return;
    }
    fs.writeFileSync(OUTPUT, allLinks.join('\n'), 'utf8');
    console.log(`Listo! Se guardaron los links en ${OUTPUT}`);
  } catch (err) {
    console.error('Error:', err);
  }
})();
