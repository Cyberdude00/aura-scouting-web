
import JSZip from 'jszip';

function sanitize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'model';
}

function extensionFromUrl(url: string): string {
  const clean = url.split('?')[0].split('#')[0];
  const dot = clean.lastIndexOf('.');
  if (dot < 0) {
    return 'jpg';
  }
  const ext = clean.slice(dot + 1).toLowerCase();
  return ext || 'jpg';
}

export interface ModelMaterialSections {
  book: string[];
  extraMaterial: string[];
  polas: string[];
  extraSnaps: string[];
  videos: string[];
}

export async function downloadFullMaterialZip(modelName: string, material: ModelMaterialSections): Promise<void> {
  // Unir todas las secciones en una sola lista
  const allMedia: string[] = [
    ...material.book,
    ...material.extraMaterial,
    ...material.polas,
    ...material.extraSnaps,
    ...material.videos,
  ].filter((url) => typeof url === 'string' && url.trim().length > 0);

  if (!allMedia.length) {
    return;
  }

  const zip = new JSZip();
  const baseName = sanitize(modelName);

  await Promise.all(
    allMedia.map(async (url, index) => {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const ext = extensionFromUrl(url);
      // Nombre de archivo original (última parte de la URL)
      const originalName = url.split('/').pop()?.split('?')[0] || `${baseName}_${String(index + 1).padStart(2, '0')}.${ext}`;
      zip.file(originalName, blob);
    }),
  );

  const archiveBlob = await zip.generateAsync({ type: 'blob' });
  const archiveName = `${baseName}_material.zip`;
  const url = URL.createObjectURL(archiveBlob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = archiveName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}
