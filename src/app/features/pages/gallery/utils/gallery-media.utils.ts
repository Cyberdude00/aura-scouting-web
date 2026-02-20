const VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|mov)$/i;

export function isVideoMedia(mediaPath: string): boolean {
  return VIDEO_EXTENSION_PATTERN.test(mediaPath);
}