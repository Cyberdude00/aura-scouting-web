import { galleryModels } from '../gallery-models.data';
import { ScoutingModel } from '../scouting-model.types';
import { slugifyValue } from '../../utils';

const sourceModels: ScoutingModel[] = [...galleryModels];

export const modelCatalog: Record<string, ScoutingModel> = sourceModels.reduce((acc, model) => {
  acc[slugifyValue(model.name)] = model;
  return acc;
}, {} as Record<string, ScoutingModel>);
