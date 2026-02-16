import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

export interface SeoTag {
  title: string;
  description: string;
  keywords: string;
  image: string;
  slug: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private baseUrl = 'https://www.aurascouting.com';
  private platformId = inject(PLATFORM_ID);
  private doc = inject(DOCUMENT);

  constructor(
    private title: Title,
    private meta: Meta
  ) {}

  generateTags(config: SeoTag): void {
    const title = `${config.title} | Aura Scouting`;
    const url = `${this.baseUrl}${config.slug ? '/' + config.slug : ''}`;

    this.title.setTitle(title);

    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({ name: 'keywords', content: config.keywords });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:image', content: config.image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: config.image });
  }

  setCanonical(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
