import { allModelIds } from '../catalog/model-catalog';

export interface AgencyGalleryConfig {
  galleryKey: string;
  galleryName: string;
  modelIds: string[];
}

export const agencyGalleriesConfig: AgencyGalleryConfig[] = [
  {
    galleryKey: 'korea',
    galleryName: 'Korea',
    modelIds: allModelIds,
  },
  {
    galleryKey: 'japan',
    galleryName: 'Japan Models',
    modelIds: ['emmanuel', 'adan', 'maximo'],
  },
  {
    galleryKey: 'china',
    galleryName: 'China Models',
    modelIds: ['angel', 'alan-marquez', 'lucas-tarrago'],
  },
  {
    galleryKey: 's2',
    galleryName: 'S2 Models',
    modelIds: ['santiago-poggi', 'emmanuel', 'adan'],
  },
];
