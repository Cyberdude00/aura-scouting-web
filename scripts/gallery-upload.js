// Script para subir todo el material optimizado de un modelo a Cloudinary y guardar los links
// Requiere: npm install cloudinary dotenv
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configuración desde variables de entorno o .env
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'TU_CLOUD_NAME',
	api_key: process.env.CLOUDINARY_API_KEY || 'TU_API_KEY',
	api_secret: process.env.CLOUDINARY_API_SECRET || 'TU_API_SECRET',
});

const MODEL_FOLDER = process.argv[2]; // Ejemplo: scripts/gallery-upload.js "./material-optimizado/maximo"

// Archivos a ignorar (ocultos, de sistema, Mac, etc.)
const IGNORE_PATTERNS = [/^\./, /^\._/, /.DS_Store$/, /.XnViewSort$/i];
const BASE_CLOUDINARY = 'aura/gallery/models';
const OUTPUT = 'links-subidos-cloudinary.txt';

if (!MODEL_FOLDER) {
	console.error('Debes pasar la carpeta del modelo optimizado como argumento.');
	process.exit(1);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
	const files = fs.readdirSync(dirPath);
	files.forEach(function(file) {
		// Ignorar archivos ocultos y de sistema
		if (IGNORE_PATTERNS.some((pat) => pat.test(file))) return;
		const fullPath = path.join(dirPath, file);
		if (fs.statSync(fullPath).isDirectory()) {
			getAllFiles(fullPath, arrayOfFiles);
		} else {
			arrayOfFiles.push(fullPath);
		}
	});
	return arrayOfFiles;
}

async function uploadAll() {
	       const files = getAllFiles(MODEL_FOLDER);
	       let allLinks = [];
	       // Obtener la ruta absoluta de 'models' para calcular la ruta relativa correcta
	       const MODELS_ROOT = path.resolve(MODEL_FOLDER.split(/models[\\\/]/i)[0] + 'models');
	       for (const file of files) {
		       // Ruta relativa desde 'models'
		       const relFromModels = path.relative(MODELS_ROOT, file);
		       // Carpeta cloudinary: aura/gallery/models/[relativa desde models]/(sin el nombre del archivo)
		       const cloudFolder = `${BASE_CLOUDINARY}/${path.dirname(relFromModels).replace(/\\/g, '/')}`;
		       try {
			       const res = await cloudinary.uploader.upload(file, {
				       folder: cloudFolder,
				       resource_type: file.match(/\.(mp4|mov|avi|mkv|webm)$/i) ? 'video' : 'image',
				       use_filename: true,
				       unique_filename: false,
				       overwrite: true,
			       });
			       allLinks.push(`${relFromModels}: ${res.secure_url}`);
			       console.log(`✔️  Subido: ${file} → ${res.secure_url}`);
		       } catch (err) {
			       console.error(`❌ Error subiendo ${file}:`, err.message);
		       }
	       }
	       fs.writeFileSync(OUTPUT, allLinks.join('\n'), 'utf8');
	       console.log(`\nListo! Links guardados en ${OUTPUT}`);
}

uploadAll();
