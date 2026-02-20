function getExtensionFromUrl(url: string): string {
  const cleanUrl = url.split('?')[0].split('#')[0];
  const dotIndex = cleanUrl.lastIndexOf('.');
  if (dotIndex === -1) {
    return 'jpg';
  }

  const ext = cleanUrl.slice(dotIndex + 1).toLowerCase();
  return ext || 'jpg';
}

function sanitizeFileName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'photo';
}

function buildFileName(baseName: string, mediaPath: string): string {
  const ext = getExtensionFromUrl(mediaPath);
  return `${sanitizeFileName(baseName)}.${ext}`;
}

export async function downloadMediaFile(mediaPath: string, baseName: string): Promise<void> {
  try {
    const response = await fetch(mediaPath, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = buildFileName(baseName, mediaPath);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(objectUrl);
  } catch {
    const anchor = document.createElement('a');
    anchor.href = mediaPath;
    anchor.download = buildFileName(baseName, mediaPath);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}