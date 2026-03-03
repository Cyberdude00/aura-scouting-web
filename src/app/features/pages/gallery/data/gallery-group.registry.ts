import { GalleryGroup, ScoutingModel } from './scouting-model.types';
import { modelCatalog } from './catalog/model-catalog';
import { agencyGalleriesConfig } from './groups/agency-galleries.config';
import { toGalleryModel } from './mappers/gallery-model.mapper';

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
    models: models.map(({ model, status, fullbook }) => toGalleryModel(model, status, fullbook)),
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
