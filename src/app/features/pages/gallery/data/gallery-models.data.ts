import { ScoutingModel } from './scouting-model.types';
import { galleryModelsBoys } from './gallery-models-boys.data';
import { galleryModelsGirls } from './gallery-models-girls.data';

export const galleryModels: ScoutingModel[] = [
  ...galleryModelsBoys,
  ...galleryModelsGirls,
];
