import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

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
  private doc = inject(DOCUMENT);

  constructor(
    private title: Title,
    private meta: Meta
  ) {}

  generateTags(config: SeoTag): void {
    const normalizedTitle = config.title.trim();
    const title = normalizedTitle.toLowerCase().includes('aura scouting')
      ? normalizedTitle
      : `${normalizedTitle} | Aura Scouting`;
    const url = `${this.baseUrl}${config.slug ? '/' + config.slug : ''}`;

    this.title.setTitle(title);

    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({ name: 'keywords', content: config.keywords });
    this.meta.updateTag({ name: 'author', content: 'Aura Scouting' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:image', content: config.image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Aura Scouting' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: config.image });
    this.meta.updateTag({ name: 'twitter:site', content: '@aurascouting' });
  }

  setRobotsIndex(allowIndex: boolean): void {
    const robotsContent = allowIndex
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, nofollow';
    this.meta.updateTag({ name: 'robots', content: robotsContent });
    this.meta.updateTag({ name: 'googlebot', content: robotsContent });
  }

  setCanonical(url: string): void {
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
