export interface ScoutingModel {
  name: string;
  gender?: string;
  photo: string;
  height?: string;
  measurements?: string;
  bust?: string;
  waist?: string;
  hips?: string;
  hair?: string;
  eyes?: string;
  shoe?: string;
  availability?: 'on' | 'off' | string;
  portfolio?: string[];
  instagram?: string[];
  download?: string;
}

export interface GalleryModel {
  id: string;
  name: string;
  gender?: string;
  cover: string;
  height?: string;
  measurements?: string;
  bust?: string;
  waist?: string;
  hips?: string;
  hair?: string;
  eyes?: string;
  shoe?: string;
  ongoingTrip: boolean;
  portfolio: string[];
  instagram: string[];
  download?: string;
}

export interface GalleryGroup {
  galleryKey: string;
  galleryName: string;
  models: GalleryModel[];
}
