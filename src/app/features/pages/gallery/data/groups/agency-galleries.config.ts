export interface AgencyGalleryConfig {
  galleryKey: string;
  galleryName: string;
  modelIds: Array<{
    id: string;
    status: 'on' | 'off';
    fullbook?: 'on' | 'off';
  }>;
}

export const agencyGalleriesConfig: AgencyGalleryConfig[] = [
    {
      galleryKey: 'boys',
      galleryName: 'Boys',
      modelIds: [
        { id: 'adan', status: 'on', fullbook: 'on' },
        { id: 'alan-marquez', status: 'on', fullbook: 'on' },
        { id: 'angel-bret', status: 'on', fullbook: 'on' },
        { id: 'belisario', status: 'on', fullbook: 'on' },
        { id: 'bernardo-romano', status: 'on', fullbook: 'on' },
        { id: 'emmanuel', status: 'on', fullbook: 'on' },
        { id: 'joaquin-garcia', status: 'on', fullbook: 'on' },
        { id: 'juan-toffalo', status: 'on', fullbook: 'on' },
        { id: 'laurencio-leal', status: 'on', fullbook: 'on' },
        { id: 'lautaro-rodriguez', status: 'on', fullbook: 'on' },
        { id: 'lucas-tarrago', status: 'on', fullbook: 'on' },
        { id: 'manu-llofrein', status: 'on', fullbook: 'on' },
        { id: 'maximo', status: 'on', fullbook: 'on' },
        { id: 'salih-topcouglu', status: 'on', fullbook: 'on' },
        { id: 'santiago-poggi', status: 'on', fullbook: 'on' },
        { id: 'santiago-zezular', status: 'on', fullbook: 'on' },
        { id: 'fran-mazzei', status: 'on', fullbook: 'on' },
      ]
    },
    {
      galleryKey: 'girls',
      galleryName: 'Girls',
      modelIds: [
        { id: 'agos-martinez', status: 'on', fullbook: 'on' },
        { id: 'antonella', status: 'on', fullbook: 'on' },
        { id: 'alicia-vallecilla', status: 'on', fullbook: 'on' },
        { id: 'elina', status: 'on', fullbook: 'on' },
        { id: 'doga-bursali', status: 'on', fullbook: 'on' },
        { id: 'elina', status: 'on', fullbook: 'on' },
        { id: 'emilia-bryan', status: 'on', fullbook: 'on' },
        { id: 'eugenia-lagrenade', status: 'on', fullbook: 'on' },
        { id: 'eva', status: 'on', fullbook: 'on' },
        { id: 'felicitas', status: 'on', fullbook: 'on' },
        { id: 'genesis', status: 'on', fullbook: 'on' },
        { id: 'isabel-deutsch', status: 'on', fullbook: 'on' },
        { id: 'luciana-imoberdorf', status: 'on', fullbook: 'on' },
        { id: 'mafer', status: 'on', fullbook: 'on' },
        { id: 'mariana-arias', status: 'on', fullbook: 'on' },
        { id: 'moana', status: 'on', fullbook: 'on' },
        { id: 'pilar', status: 'on', fullbook: 'on' },
        { id: 'victoria', status: 'on', fullbook: 'on' },
        { id: 'zoe', status: 'on', fullbook: 'on' }
      ]
    },
  {
    galleryKey: 'korea',
    galleryName: 'KOREA',
        modelIds: [
      { id: 'adan', status: 'on', fullbook: 'off' },
      { id: 'angel-bret', status: 'on', fullbook: 'off' },
      { id: 'emmanuel', status: 'on', fullbook: 'off' },
      { id: 'santiago-poggi', status: 'on', fullbook: 'off' },
      { id: 'alan-marquez', status: 'on', fullbook: 'off' },
      { id: 'belisario', status: 'on', fullbook: 'off' },
      { id: 'bernardo-romano', status: 'on', fullbook: 'off' },
      { id: 'joaquin-garcia', status: 'on', fullbook: 'off' },
      { id: 'juan-toffalo', status: 'on', fullbook: 'off' },
      { id: 'laurencio-leal', status: 'on', fullbook: 'off' },
      { id: 'fran-mazzei', status: 'on', fullbook: 'off' },
      { id: 'lautaro-rodriguez', status: 'on', fullbook: 'off' },
      { id: 'maximo', status: 'on', fullbook: 'off' },
      { id: 'manu-llofrein', status: 'on', fullbook: 'off' },
      { id: 'felicitas', status: 'on', fullbook: 'off' },
      { id: 'eva', status: 'on', fullbook: 'off' },
      { id: 'emilia-bryan', status: 'on', fullbook: 'off' },
      { id: 'alicia-vallecilla', status: 'on', fullbook: 'off' },
      { id: 'luciana-imoberdorf', status: 'on', fullbook: 'off' },
      { id: 'isabel-deutsch', status: 'on', fullbook: 'off' },
      { id: 'doga-bursali', status: 'on', fullbook: 'off' },
      { id: 'genesis', status: 'on', fullbook: 'off' },
      { id: 'elina', status: 'on', fullbook: 'off' },
      { id: 'eugenia-lagrenade', status: 'on', fullbook: 'off' },
      { id: 'victoria', status: 'on', fullbook: 'off' },
      { id: 'zoe', status: 'on', fullbook: 'off' },
      { id: 'agos-martinez', status: 'on', fullbook: 'off' },
      { id: 'moana-buezas', status: 'on', fullbook: 'off' },
      { id: 'pilar', status: 'off', fullbook: 'off' },
      { id: 'mariana-arias', status: 'off', fullbook: 'off' },
      { id: 'lucas-tarrago', status: 'off', fullbook: 'off' },
      { id: 'santiago-zezular', status: 'off', fullbook: 'off' },
      { id: 'salih-topcouglu', status: 'off', fullbook: 'off' },
    ],
  },
  {
    galleryKey: 'china',
    galleryName: 'CHINA',
    modelIds: [
      { id: 'adan', status: 'on', fullbook: 'off' },
      { id: 'alan-marquez', status: 'on', fullbook: 'off' },
      { id: 'angel-bret', status: 'on', fullbook: 'off' },
      { id: 'santiago-poggi', status: 'on', fullbook: 'off' },
      { id: 'bernardo-romano', status: 'on', fullbook: 'off' },
      { id: 'salih-topcouglu', status: 'on', fullbook: 'off' },
      { id: 'joaquin-garcia', status: 'on', fullbook: 'off' },
      { id: 'juan-toffalo', status: 'on', fullbook: 'off' },
      { id: 'laurencio-leal', status: 'on', fullbook: 'off' },
      { id: 'lautaro-rodriguez', status: 'on', fullbook: 'off' },
      { id: 'maximo', status: 'on', fullbook: 'off' },
      { id: 'fran-mazzei', status: 'on', fullbook: 'off' },
      { id: 'manu-llofrein', status: 'on', fullbook: 'off' },
      { id: 'belisario', status: 'on', fullbook: 'off' },
      { id: 'felicitas', status: 'on', fullbook: 'off' },
      { id: 'eva', status: 'on', fullbook: 'off' },
      { id: 'antonella', status: 'on', fullbook: 'off' },
      { id: 'emilia-bryan', status: 'on', fullbook: 'off' },
      { id: 'eugenia-lagrenade', status: 'on', fullbook: 'off' },
      { id: 'mafer', status: 'on', fullbook: 'off' },
      { id: 'isabel-deutsch', status: 'on', fullbook: 'off' },
      { id: 'doga-bursali', status: 'on', fullbook: 'off' },
      { id: 'victoria', status: 'on', fullbook: 'off' },
      { id: 'pilar', status: 'off', fullbook: 'off' },
      { id: 'agos-martinez', status: 'off', fullbook: 'off' },
      { id: 'elina', status: 'off', fullbook: 'off' },
      { id: 'emmanuel', status: 'off', fullbook: 'on' },
      { id: 'lucas-tarrago', status: 'off', fullbook: 'off' },
      { id: 'santiago-zezular', status: 'off', fullbook: 'off' },
    ],
  },
  {
    galleryKey: 'japan',
    galleryName: 'JAPAN',
    modelIds: [     
      { id: 'adan', status: 'on', fullbook: 'off' },
      { id: 'angel-bret', status: 'on', fullbook: 'off' },
      { id: 'emmanuel', status: 'on', fullbook: 'off' },
      { id: 'santiago-poggi', status: 'on', fullbook: 'off' },
      { id: 'alan-marquez', status: 'on', fullbook: 'on' },
      { id: 'belisario', status: 'on', fullbook: 'off' },
      { id: 'bernardo-romano', status: 'on', fullbook: 'off' },
      { id: 'joaquin-garcia', status: 'on', fullbook: 'off' },
      { id: 'juan-toffalo', status: 'on', fullbook: 'off' },
      { id: 'laurencio-leal', status: 'on', fullbook: 'off' },
      { id: 'lautaro-rodriguez', status: 'on', fullbook: 'off' },
      { id: 'maximo', status: 'on', fullbook: 'off' },
      { id: 'manu-llofrein', status: 'on', fullbook: 'on' },
      { id: 'salih-topcouglu', status: 'on', fullbook: 'off' },
      { id: 'fran-mazzei', status: 'on', fullbook: 'off' },
      { id: 'felicitas', status: 'on', fullbook: 'off' },
      { id: 'antonella', status: 'on', fullbook: 'off' },
      { id: 'eva', status: 'on', fullbook: 'off' },
      { id: 'emilia-bryan', status: 'on', fullbook: 'off' },
      { id: 'alicia-vallecilla', status: 'on', fullbook: 'off' },
      { id: 'luciana-imoberdorf', status: 'on', fullbook: 'off' },
      { id: 'mafer', status: 'on', fullbook: 'off' },
      { id: 'isabel-deutsch', status: 'on', fullbook: 'off' },
      { id: 'doga-bursali', status: 'on', fullbook: 'off' },
      { id: 'genesis', status: 'on', fullbook: 'off' },
      { id: 'elina', status: 'on', fullbook: 'off' },
      { id: 'eugenia-lagrenade', status: 'on', fullbook: 'off' },
      { id: 'victoria', status: 'on', fullbook: 'off' },
      { id: 'agos-martinez', status: 'on', fullbook: 'off' },
      { id: 'zoe', status: 'on', fullbook: 'off' },
      { id: 'moana-buezas', status: 'on', fullbook: 'off' },
      { id: 'pilar', status: 'on', fullbook: 'off' },
      { id: 'santiago-zezular', status: 'on', fullbook: 'off' },
      { id: 'lucas-tarrago', status: 'on', fullbook: 'off' },
    ],
  },
  {
    galleryKey: 'kin-agency',
    galleryName: 'KIN AGENCY',
    modelIds: [
      { id: 'isabel-deutsch', status: 'on', fullbook: 'on' },
      { id: 'luciana-imoberdorf', status: 'on', fullbook: 'on' }
    ]
  },
  {
    galleryKey: 'lacoco-models',
    galleryName: 'LACOCO MODELS',
    modelIds: [
      { id: 'agos-martinez', status: 'on', fullbook: 'on' }
    ]
  },
  {
    galleryKey: 'ever-models',
    galleryName: 'EVER MODELS',
    modelIds: [
      { id: 'juan-toffalo', status: 'on', fullbook: 'on' }
    ]
  },
  {
    galleryKey: 'nous',
    galleryName: 'NOUS',
    modelIds: [
      { id: 'juan-toffalo', status: 'on', fullbook: 'on' }
    ]
  },
  {
    galleryKey: 'asset',
    galleryName: 'ASSET',
    modelIds: [
      { id: 'manu-llofrein', status: 'on', fullbook: 'on' }
    ]
  },
  {
    galleryKey: 'eli-models',
    galleryName: 'Eli Models',
    modelIds: [
      { id: 'isabel-deutsch', status: 'on', fullbook: 'on' },
      { id: 'salih-topcouglu', status: 'on', fullbook: 'on' },
      { id: 'manu-llofrein', status: 'on', fullbook: 'on' }
    ]
  },
  {
    galleryKey: 'adm-models',
    galleryName: 'ADM models',
    modelIds: [
      { id: 'isabel-deutsch', status: 'on', fullbook: 'off' },
      { id: 'manu-llofrein', status: 'on', fullbook: 'off' }
    ]
  },
  {
    galleryKey: 'hong-kong',
    galleryName: 'HONG KONG',
    modelIds: [
      // Girls
      { id: 'alicia-vallecilla', status: 'on', fullbook: 'off' },
      { id: 'antonella', status: 'on', fullbook: 'off' },
      { id: 'elina', status: 'on', fullbook: 'off' },
      { id: 'emilia-bryan', status: 'on', fullbook: 'off' },
      { id: 'eugenia-lagrenade', status: 'on', fullbook: 'off' },
      { id: 'eva', status: 'on', fullbook: 'off' },
      { id: 'felicitas', status: 'on', fullbook: 'off' },
      { id: 'mafer', status: 'on', fullbook: 'off' },
      { id: 'victoria', status: 'on', fullbook: 'off' },
      { id: 'doga-bursali', status: 'on', fullbook: 'off' },
      // Boys
      { id: 'adan', status: 'on', fullbook: 'off' },
      { id: 'alan-marquez', status: 'on', fullbook: 'off' },
      { id: 'angel-bret', status: 'on', fullbook: 'off' },
      { id: 'belisario', status: 'on', fullbook: 'off' },
      { id: 'bernardo-romano', status: 'on', fullbook: 'off' },
      { id: 'emmanuel', status: 'on', fullbook: 'off' },
      { id: 'joaquin-garcia', status: 'on', fullbook: 'off' },
      { id: 'laurencio-leal', status: 'on', fullbook: 'off' },
      { id: 'lautaro-rodriguez', status: 'on', fullbook: 'off' },
      { id: 'salih-topcouglu', status: 'on', fullbook: 'off' },
      { id: 'santiago-poggi', status: 'on', fullbook: 'off' },
      { id: 'santiago-zezular', status: 'on', fullbook: 'off' }
    ]
  },
  {
    galleryKey: 'thailand',
    galleryName: 'THAILAND',
    modelIds: [
      // Girls
      { id: 'alicia-vallecilla', status: 'on', fullbook: 'off' },
      { id: 'antonella', status: 'on', fullbook: 'off' },
      { id: 'elina', status: 'on', fullbook: 'off' },
      { id: 'emilia-bryan', status: 'on', fullbook: 'off' },
      { id: 'eugenia-lagrenade', status: 'on', fullbook: 'off' },
      { id: 'eva', status: 'on', fullbook: 'off' },
      { id: 'felicitas', status: 'on', fullbook: 'off' },
      { id: 'mafer', status: 'on', fullbook: 'off' },
      { id: 'victoria', status: 'on', fullbook: 'off' },
      { id: 'genesis', status: 'on', fullbook: 'off' },
      { id: 'doga-bursali', status: 'on', fullbook: 'off' },
      // Boys
      { id: 'adan', status: 'on', fullbook: 'off' },
      { id: 'alan-marquez', status: 'on', fullbook: 'off' },
      { id: 'angel-bret', status: 'on', fullbook: 'off' },
      { id: 'belisario', status: 'on', fullbook: 'off' },
      { id: 'bernardo-romano', status: 'on', fullbook: 'off' },
      { id: 'emmanuel', status: 'on', fullbook: 'off' },
      { id: 'joaquin-garcia', status: 'on', fullbook: 'off' },
      { id: 'laurencio-leal', status: 'on', fullbook: 'off' },
      { id: 'lautaro-rodriguez', status: 'on', fullbook: 'off' },
      { id: 'salih-topcouglu', status: 'on', fullbook: 'off' },
      { id: 'santiago-poggi', status: 'on', fullbook: 'off' },
      { id: 'santiago-zezular', status: 'on', fullbook: 'off' }
    ]
  },
  {
    galleryKey: 'new',
    galleryName: 'new',
    modelIds: [
      { id: 'fran-mazzei', status: 'on', fullbook: 'off' },
      { id: 'antonella', status: 'on', fullbook: 'off' }
    ]
  },
];
