import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { GalleryModel } from '../../../data';

@Injectable()
export class GalleryCoverPreloadService {
  private readonly preloadedHrefs = new Set<string>();
  private readonly managedLinks: HTMLLinkElement[] = [];

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  preload(models: GalleryModel[], limit = 8): void {
    const covers = models
      .map((model) => model.cover)
      .filter((cover): cover is string => typeof cover === 'string' && cover.trim().length > 0)
      .slice(0, limit);

    for (const href of covers) {
      if (this.preloadedHrefs.has(href)) {
        continue;
      }

      const link = this.document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;

      this.document.head.appendChild(link);
      this.preloadedHrefs.add(href);
      this.managedLinks.push(link);
    }
  }

  destroy(): void {
    for (const link of this.managedLinks) {
      link.remove();
    }

    this.managedLinks.length = 0;
    this.preloadedHrefs.clear();
  }
}