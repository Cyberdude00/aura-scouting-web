import { koreaModels } from '../korea.models';
import { ScoutingModel } from '../scouting-model.types';
import { slugifyValue } from '../../utils/gallery-string.utils';

const sourceModels: ScoutingModel[] = [...koreaModels];

export const modelCatalog: Record<string, ScoutingModel> = sourceModels.reduce((acc, model) => {
  acc[slugifyValue(model.name)] = model;
  return acc;
}, {} as Record<string, ScoutingModel>);

export const allModelIds = Object.keys(modelCatalog);
