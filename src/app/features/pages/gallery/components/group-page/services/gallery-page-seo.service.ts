import { Injectable } from '@angular/core';
import { SeoService } from '../../../../../core/services/seo.service';
import { GalleryGroup } from '../../../data';

@Injectable()
export class GalleryPageSeoService {
  constructor(private readonly seoService: SeoService) {}

  applyGalleryTags(gallery: GalleryGroup): void {
    const slug = `gallery/${gallery.galleryKey}`;
    this.seoService.generateTags({
      title: `${gallery.galleryName} Gallery`,
      description: `Discover selected models from ${gallery.galleryName} in Aura Scouting's international gallery.`,
      keywords: `aura scouting, ${gallery.galleryName.toLowerCase()}, model gallery, scouting models`,
      image: 'https://www.aurascouting.com/images/aura-scouting-logo.png',
      slug,
    });
    this.seoService.setCanonical(`https://www.aurascouting.com/${slug}`);
    this.seoService.setRobotsIndex(false);
  }
}