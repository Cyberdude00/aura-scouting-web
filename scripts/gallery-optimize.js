// Script para optimizar imágenes y videos de la galería
const { execSync } = require('child_process');
const path = require('path');

try {
	// Optimiza imágenes
	execSync(`python scripts/optimize-models-images.py`, { stdio: 'inherit' });
	// Optimiza videos
	execSync(`python scripts/optimize-models-videos.py`, { stdio: 'inherit' });
	console.log('Optimización completa de imágenes y videos.');
} catch (err) {
	console.error('Error al optimizar:', err.message);
	process.exit(1);
}
