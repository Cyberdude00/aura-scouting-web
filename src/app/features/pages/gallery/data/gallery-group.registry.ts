import { GalleryGroup, GalleryModel, ScoutingModel } from './scouting-model.types';
import { modelCatalog } from './catalog/model-catalog';
import { agencyGalleriesConfig } from './groups/agency-galleries.config';
import { ongoingTripStatusByModelId } from './status/ongoing-trip-status.config';
import { slugifyValue } from '../utils/gallery-string.utils';

function resolveOngoingTrip(id: string, model: ScoutingModel): boolean {
  const configuredStatus = ongoingTripStatusByModelId[id];

  if (configuredStatus === 'on') {
    return true;
  }

  if (configuredStatus === 'off') {
    return false;
  }

  return model.availability === 'off';
}

function normalizeModel(model: ScoutingModel): GalleryModel {
  const id = slugifyValue(model.name);
  const portfolio = (model.portfolio ?? []).filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  );

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
    ongoingTrip: resolveOngoingTrip(id, model),
    portfolio,
    instagram,
    download: model.download,
  };
}

function createGalleryGroup(galleryKey: string, galleryName: string, models: ScoutingModel[]): GalleryGroup {
  return {
    galleryKey,
    galleryName,
    models: models.map(normalizeModel),
  };
}

function resolveModels(modelIds: string[]): ScoutingModel[] {
  return modelIds
    .map((id) => modelCatalog[id])
    .filter((model): model is ScoutingModel => Boolean(model));
}

export const galleryGroupRegistry: Record<string, GalleryGroup> = agencyGalleriesConfig.reduce((acc, group) => {
  acc[group.galleryKey] = createGalleryGroup(group.galleryKey, group.galleryName, resolveModels(group.modelIds));
  return acc;
}, {} as Record<string, GalleryGroup>);

export function getGalleryGroup(galleryKey: string): GalleryGroup | null {
  return galleryGroupRegistry[galleryKey.toLowerCase()] ?? null;
}
