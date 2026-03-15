  import { GalleryModel, ScoutingModel } from '../scouting-model.types';
  import { slugifyValue } from '../../utils';

function resolveCacheBuster(): string {
  return String((import.meta as any).env?.NG_APP_CACHE_BUSTER ?? '').trim();
}

function applyCacheBuster(url: string, cacheBuster: string): string {
  if (!cacheBuster || !url) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('v', cacheBuster);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function resolveOngoingTrip(status: 'on' | 'off'): boolean {
  return status === 'off';
}

type PortfolioSections = {
  book: string[];
  polas: string[];
  extraMaterial: string[];
  extraSnaps: string[];
  videos: string[];
  other: string[];
};

const normalizeMediaPath = (mediaPath: string) => mediaPath.toLowerCase();
const normalizeMediaKey = (mediaPath: string) => normalizeMediaPath(mediaPath).replace(/[^a-z]/g, '');

function detectSection(mediaPath: string): keyof PortfolioSections {
  const normalized = normalizeMediaPath(mediaPath);
  const key = normalizeMediaKey(mediaPath);
  if (/\.(mp4|webm|mov)(?:\?|#|$)/i.test(normalized) || normalized.includes('/videos/')) return 'videos';
  if (key.includes('extramaterial') || key.includes('extramateiral')) return 'extraMaterial';
  if (key.includes('extrasnaps') || key.includes('extrasnas')) return 'extraSnaps';
  if (/\/[^/]*book[^/]*\//.test(normalized) || key.includes('book')) return 'book';
  if (/\/[^/]*(polas|pola|snaps|snap)[^/]*\//.test(normalized) || key.includes('polas') || key.includes('snaps')) return 'polas';
  return 'other';
}

function emptySections(): PortfolioSections {
  return {
    book: [],
    polas: [],
    extraMaterial: [],
    extraSnaps: [],
    videos: [],
    other: [],
  };
}

function splitPortfolioBySection(items: string[]): PortfolioSections {
  return items.reduce((acc, item) => {
    acc[detectSection(item)].push(item);
    return acc;
  }, emptySections());
}

function collectBaseSections(model: ScoutingModel): PortfolioSections {
  const sections = emptySections();
  pushUnique(sections.book, model.book ?? []);
  pushUnique(sections.extraMaterial, model.extraMaterial ?? []);
  pushUnique(sections.polas, model.polas ?? []);
  pushUnique(sections.extraSnaps, model.extraSnaps ?? []);
  pushUnique(sections.videos, model.videos ?? []);
  const legacyPortfolio = (model.portfolio ?? []).filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  if (legacyPortfolio.length) {
    const splitLegacy = splitPortfolioBySection(legacyPortfolio);
    pushUnique(sections.book, splitLegacy.book);
    pushUnique(sections.extraMaterial, splitLegacy.extraMaterial);
    pushUnique(sections.polas, splitLegacy.polas);
    pushUnique(sections.extraSnaps, splitLegacy.extraSnaps);
    pushUnique(sections.videos, splitLegacy.videos);
    pushUnique(sections.other, splitLegacy.other);
  }
  return sections;
}

function pushUnique(target: string[], items: string[]) {
  for (const item of items) if (!target.includes(item)) target.push(item);
}

function normalizeFullMaterial(model: ScoutingModel): PortfolioSections {
  const sections = emptySections();
  const full = model.fullMaterialData;
  pushUnique(sections.extraMaterial, [...(model.extraMaterial ?? []), ...(full?.extraMaterial ?? [])]);
  pushUnique(sections.polas, [...(model.polas ?? []), ...(full?.polas ?? [])]);
  pushUnique(sections.extraSnaps, [...(model.extraSnaps ?? []), ...(full?.extraSnaps ?? [])]);
  pushUnique(sections.videos, [...(model.videos ?? []), ...(full?.videos ?? [])]);
  return sections;
}

function buildOrderedPortfolio(base: PortfolioSections, full: PortfolioSections, fullbookOn: boolean): string[] {
  if (!fullbookOn) return [...base.book, ...base.polas];
  return [
    ...base.book,
    ...full.extraMaterial,
    ...base.polas,
    ...full.polas,
    ...full.extraSnaps,
    ...full.videos,
  ];
}

export function toGalleryModel(
  model: ScoutingModel,
  status: 'on' | 'off',
  fullbookStatus: 'on' | 'off' | undefined,
): GalleryModel {
  const id = slugifyValue(model.name);
  const baseSections = collectBaseSections(model);
  const normalizedFull = normalizeFullMaterial(model);
  const fullbookOn = fullbookStatus === 'on';
  const cacheBuster = resolveCacheBuster();

  const book = (model.book ?? []).map(media => applyCacheBuster(media, cacheBuster));
  const polas = (model.polas ?? []).map(media => applyCacheBuster(media, cacheBuster));
  const extraMaterial = [...(model.extraMaterial ?? []), ...(model.fullMaterialData?.extraMaterial ?? [])].map(media => applyCacheBuster(media, cacheBuster));
  const extraSnaps = [...(model.extraSnaps ?? []), ...(model.fullMaterialData?.extraSnaps ?? [])].map(media => applyCacheBuster(media, cacheBuster));
  const videos = [...(model.videos ?? []), ...(model.fullMaterialData?.videos ?? [])].map(media => applyCacheBuster(media, cacheBuster));

  const instagram = (model.instagram ?? []).filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

  const fullMaterialMedia = [
    ...(model.fullMaterialData?.extraMaterial ?? []),
    ...(model.fullMaterialData?.polas ?? []),
    ...(model.fullMaterialData?.extraSnaps ?? []),
    ...(model.fullMaterialData?.videos ?? [])
  ].map(media => applyCacheBuster(media, cacheBuster));

  return {
    id,
    name: model.name,
    gender: model.gender,
    cover: applyCacheBuster(model.photo, cacheBuster),
    height: model.height,
    measurements: model.measurements,
    hair: model.hair,
    eyes: model.eyes,
    shoe: model.shoe,
    ongoingTrip: resolveOngoingTrip(status),
    fullMaterial: fullbookOn,
    fullMaterialMedia,
    book,
    polas,
    extraMaterial,
    extraSnaps,
    videos,
    instagram,
    portfolio: buildOrderedPortfolio(baseSections, normalizedFull, fullbookOn),
  };
}