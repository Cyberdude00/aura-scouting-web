import { fullMaterialCatalog } from '../catalog/full-material-catalog';
import { GalleryModel, ScoutingModel } from '../scouting-model.types';
import { slugifyValue } from '../../utils';

export function resolveOngoingTrip(status: 'on' | 'off', model: ScoutingModel): boolean {
  if (status === 'off') {
    return true;
  }

  if (status === 'on') {
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

function buildOrderedPortfolio(modelId: string, basePortfolio: string[], fullbookOn: boolean): string[] {
  const base = splitPortfolioBySection(basePortfolio);

  if (!fullbookOn) {
    return [...base.book, ...base.polas, ...base.other];
  }

  const full = fullMaterialCatalog[modelId] ?? { fullbook: [] };
  return [...base.book, ...full.fullbook, ...base.polas, ...base.other];
}

export function toGalleryModel(
  model: ScoutingModel,
  status: 'on' | 'off',
  fullbookStatus: 'on' | 'off' | undefined,
): GalleryModel {
  const id = slugifyValue(model.name);
  const basePortfolio = (model.portfolio ?? []).filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  );
  const fullbookOn = fullbookStatus === 'on';
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
    fullMaterial: fullbookOn,
    portfolio,
    instagram,
    download: model.download,
  };
}