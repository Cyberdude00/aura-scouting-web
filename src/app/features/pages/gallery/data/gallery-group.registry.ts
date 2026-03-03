import { GalleryGroup, GalleryModel, ScoutingModel } from './scouting-model.types';
import { fullMaterialCatalog } from './catalog/full-material-catalog';
import { modelCatalog } from './catalog/model-catalog';
import { agencyGalleriesConfig } from './groups/agency-galleries.config';
import { slugifyValue } from '../utils';

function resolveOngoingTrip(status: 'on' | 'off', model: ScoutingModel): boolean {
  const configuredStatus = status;

  if (configuredStatus === 'off') {
    return true;
  }
  if (configuredStatus === 'on') {
    return false;
  }
  return model.availability === 'off';
}

function splitPortfolioBySection(items: string[]): { book: string[]; polas: string[]; other: string[] } {
  return items.reduce(
    (acc, item) => {
      if (item.includes('/book/')) {
        acc.book.push(item);
        return acc;
      }

      if (item.includes('/polas/')) {
        acc.polas.push(item);
        return acc;
      }

      acc.other.push(item);
      return acc;
    },
    { book: [] as string[], polas: [] as string[], other: [] as string[] },
  );
}

function buildOrderedPortfolio(
  modelId: string,
  basePortfolio: string[],
  fullbookOn: boolean,
): string[] {
  const base = splitPortfolioBySection(basePortfolio);

  if (!fullbookOn) {
    return [...base.book, ...base.polas, ...base.other];
  }

  const full = fullMaterialCatalog[modelId] ?? { fullbook: [] };
  return [
    ...base.book,
    ...full.fullbook,
    ...base.polas,
    ...base.other,
  ];
}

function normalizeModel(
  model: ScoutingModel,
  status: 'on' | 'off',
  fullbookStatus: 'on' | 'off' | undefined,
): GalleryModel {
  const id = slugifyValue(model.name);
  const basePortfolio = (model.portfolio ?? []).filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  );
  const fullbookOn = fullbookStatus === 'on';
  const fullMaterial = fullbookOn;
  const portfolio = buildOrderedPortfolio(id, basePortfolio, fullbookOn);

  const instagram = (model.instagram ?? []).filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  );

  return {
    id,
    name: model.name,
    gender: model.gender,
    cover: model.photo,
    height: model.height,
    measurements: model.measurements,
    bust: model.bust,
    waist: model.waist,
    hips: model.hips,
    hair: model.hair,
    eyes: model.eyes,
    shoe: model.shoe,
    ongoingTrip: resolveOngoingTrip(status, model),
    fullMaterial,
    portfolio,
    instagram,
    download: model.download,
  };
}

function createGalleryGroup(
  galleryKey: string,
  galleryName: string,
  models: Array<{
    model: ScoutingModel;
    status: 'on' | 'off';
    fullbook: 'on' | 'off' | undefined;
  }>,
): GalleryGroup {
  return {
    galleryKey,
    galleryName,
    models: models.map(({ model, status, fullbook }) => normalizeModel(model, status, fullbook)),
  };
}

function resolveModels(
  modelIds: Array<{ id: string; status: 'on' | 'off'; fullbook?: 'on' | 'off' }>,
): Array<{
  model: ScoutingModel;
  status: 'on' | 'off';
  fullbook: 'on' | 'off' | undefined;
}> {
  return modelIds
    .map(({ id, status, fullbook }) => ({ model: modelCatalog[id], status, fullbook }))
    .filter((item): item is {
      model: ScoutingModel;
      status: 'on' | 'off';
      fullbook: 'on' | 'off' | undefined;
    } => {
      if (!item.model) {
        return false;
      }

      const hasPhoto = typeof item.model.photo === 'string' && item.model.photo.trim().length > 0;
      const hasPortfolio = Array.isArray(item.model.portfolio)
        && item.model.portfolio.some((media) => typeof media === 'string' && media.trim().length > 0);

      return hasPhoto && hasPortfolio;
    });
}

export const galleryGroupRegistry: Record<string, GalleryGroup> = agencyGalleriesConfig.reduce((acc, group) => {
  acc[group.galleryKey] = createGalleryGroup(group.galleryKey, group.galleryName, resolveModels(group.modelIds));
  return acc;
}, {} as Record<string, GalleryGroup>);

export function getGalleryGroup(galleryKey: string): GalleryGroup | null {
  const normalizedKey = galleryKey.toLowerCase();
  const legacyAliases: Record<string, string> = {
    corea: 'korea',
    japon: 'japan',
  };

  const resolvedKey = legacyAliases[normalizedKey] ?? normalizedKey;
  return galleryGroupRegistry[resolvedKey] ?? null;
}
