import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable()
export class GalleryOverlayScrollService {
  private isScrollLocked = false;
  private savedScrollY = 0;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  sync(shouldLock: boolean): void {
    if (shouldLock) {
      this.lockBackgroundScroll();
      return;
    }

    this.unlockBackgroundScroll();
  }

  destroy(): void {
    this.unlockBackgroundScroll();
  }

  private lockBackgroundScroll(): void {
    if (this.isScrollLocked) {
      return;
    }

    const canUseWindow = typeof window !== 'undefined';
    this.savedScrollY = canUseWindow ? window.scrollY || this.document.documentElement.scrollTop || 0 : 0;

    const body = this.document.body;
    const html = this.document.documentElement;

    body.classList.add('gallery-overlay-open');
    html.classList.add('gallery-overlay-open');

    body.style.position = 'fixed';
    body.style.top = `-${this.savedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    this.isScrollLocked = true;
  }

  private unlockBackgroundScroll(): void {
    if (!this.isScrollLocked) {
      return;
    }

    const body = this.document.body;
    const html = this.document.documentElement;

    body.classList.remove('gallery-overlay-open');
    html.classList.remove('gallery-overlay-open');

    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';

    if (typeof window !== 'undefined') {
      window.scrollTo(0, this.savedScrollY);
    }

    this.isScrollLocked = false;
  }
}