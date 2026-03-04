export interface FullMaterialMedia {
  fullbook: string[];
}

import { fullMaterialCatalogBoys } from './full-material-boys.catalog';
import { fullMaterialCatalogGirls } from './full-material-girls.catalog';

export const fullMaterialCatalog: Record<string, FullMaterialMedia> = {
  ...fullMaterialCatalogBoys,
  ...fullMaterialCatalogGirls,
};
