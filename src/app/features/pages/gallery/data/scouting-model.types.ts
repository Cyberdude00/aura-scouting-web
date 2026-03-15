export interface ScoutingModel {
  name: string;
  gender?: string;
  photo: string;
  height?: string;
  measurements?: string;
  hair?: string;
  eyes?: string;
  shoe?: string;
  book?: string[];
  extraMaterial?: string[];
  polas?: string[];
  extraSnaps?: string[];
  videos?: string[];
  fullMaterialData?: FullMaterialMedia;
  portfolio?: string[];
  instagram?: string[];
}

export interface FullMaterialMedia {
  extraMaterial?: string[];
  polas?: string[];
  extraSnaps?: string[];
  videos?: string[];
}

export interface GalleryModel {
  id: string;
  name: string;
  gender?: string;
  cover: string;
  height?: string;
  measurements?: string;
  hair?: string;
  eyes?: string;
  shoe?: string;
  ongoingTrip: boolean;
  fullMaterial?: boolean;
  fullMaterialMedia?: string[];
  portfolio: string[];
  instagram: string[];
  book?: string[];
  polas?: string[];
  extraMaterial?: string[];
  extraSnaps?: string[];
  videos?: string[];
}

export interface GalleryGroup {
  galleryKey: string;
  galleryName: string;
  models: GalleryModel[];
}
