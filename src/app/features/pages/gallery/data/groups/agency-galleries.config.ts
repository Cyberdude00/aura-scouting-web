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
      { id: 'manu-llofrein', status: 'on', fullbook: 'off' },
      { id: 'belisario', status: 'on', fullbook: 'off' },
      { id: 'felicitas', status: 'on', fullbook: 'off' },
      { id: 'eva', status: 'on', fullbook: 'off' },
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
      { id: 'felicitas', status: 'on', fullbook: 'off' },
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
      { id: 'santiago-zezular', status: 'on', fullbook: 'off' },
      { id: 'lucas-tarrago', status: 'on', fullbook: 'off' },
      { id: 'pilar', status: 'off', fullbook: 'off' },
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
];
