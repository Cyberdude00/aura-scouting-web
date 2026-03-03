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

export async function downloadFullbookZip(modelName: string, mediaUrls: string[]): Promise<void> {
  if (!mediaUrls.length) {
    return;
  }

  const zip = new JSZip();
  const baseName = sanitize(modelName);

  await Promise.all(
    mediaUrls.map(async (url, index) => {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const ext = extensionFromUrl(url);
      const fileName = `${baseName}_fullbook_${String(index + 1).padStart(2, '0')}.${ext}`;
      zip.file(fileName, blob);
    }),
  );

  const archiveBlob = await zip.generateAsync({ type: 'blob' });
  const archiveName = `${baseName}_fullbook.zip`;
  const url = URL.createObjectURL(archiveBlob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = archiveName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}
