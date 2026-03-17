// Script para subir todo el material optimizado de un modelo a Cloudinary y guardar los links
// Requiere: npm install cloudinary
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
const BASE_CLOUDINARY = 'aura/gallery/models';
const OUTPUT = 'links-subidos-cloudinary.txt';

if (!MODEL_FOLDER) {
	console.error('Debes pasar la carpeta del modelo optimizado como argumento.');
	process.exit(1);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
	const files = fs.readdirSync(dirPath);
	files.forEach(function(file) {
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
	const modelName = path.basename(MODEL_FOLDER);
	let allLinks = [];
	for (const file of files) {
		// Determina subcarpeta (book, polas, videos, etc)
		const rel = path.relative(MODEL_FOLDER, file);
		const parts = rel.split(path.sep);
		const subfolder = parts.length > 1 ? parts[0] : 'book';
		const cloudFolder = `${BASE_CLOUDINARY}/${modelName}/${subfolder}`;
		try {
			const res = await cloudinary.uploader.upload(file, {
				folder: cloudFolder,
				resource_type: file.match(/\.(mp4|mov|avi|mkv|webm)$/i) ? 'video' : 'image',
				use_filename: true,
				unique_filename: false,
				overwrite: true,
			});
			allLinks.push(`${subfolder}: ${res.secure_url}`);
			console.log(`✔️  Subido: ${file} → ${res.secure_url}`);
		} catch (err) {
			console.error(`❌ Error subiendo ${file}:`, err.message);
		}
	}
	fs.writeFileSync(OUTPUT, allLinks.join('\n'), 'utf8');
	console.log(`\nListo! Links guardados en ${OUTPUT}`);
}

uploadAll();
