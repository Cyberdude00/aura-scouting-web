import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryGroup, GalleryModel } from '../../data/scouting-model.types';
import { getGalleryGroup } from '../../data/gallery-group.registry';
import { GalleryHeaderComponent } from '../shared/header/gallery-header.component';
import { GalleryModelGridComponent } from '../shared/main-grid/gallery-model-grid.component';
import { GalleryPortfolioModalComponent } from '../shared/portfolio-modal/gallery-portfolio-modal.component';
import { GalleryMediaViewerComponent } from '../shared/media-viewer/gallery-media-viewer.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-gallery-group-page',
  standalone: true,
  imports: [
    CommonModule,
    GalleryHeaderComponent,
    GalleryModelGridComponent,
    GalleryPortfolioModalComponent,
    GalleryMediaViewerComponent,
  ],
  templateUrl: './gallery-group-page.component.html',
  styleUrl: './gallery-group-page.component.scss',
})
export class GalleryGroupPageComponent implements OnDestroy {
  gallery: GalleryGroup | null = null;
  selectedModel: GalleryModel | null = null;
  selectedMediaIndex: number | null = null;
  private isScrollLocked = false;
  private savedScrollY = 0;

  constructor(
    private readonly route: ActivatedRoute,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly seoService: SeoService,
  ) {
    this.route.paramMap.subscribe((params) => {
      const galleryParam = params.get('group') ?? '';
      this.gallery = getGalleryGroup(galleryParam);
      this.selectedModel = null;
      this.selectedMediaIndex = null;
      this.syncBodyScrollLock();

      if (this.gallery) {
        const slug = `gallery/${this.gallery.galleryKey}`;
        this.seoService.generateTags({
          title: `${this.gallery.galleryName} Gallery`,
          description: `Discover selected models from ${this.gallery.galleryName} in Aura Scouting's international gallery.`,
          keywords: `aura scouting, ${this.gallery.galleryName.toLowerCase()}, model gallery, scouting models`,
          image: 'https://www.aurascouting.com/images/aura-scouting-logo.png',
          slug,
        });
        this.seoService.setCanonical(`https://www.aurascouting.com/${slug}`);
        this.seoService.setRobotsIndex(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.unlockBackgroundScroll();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.selectedMediaIndex !== null) {
      if (event.key === 'Escape') {
        this.closeMediaViewer();
      }

      if (event.key === 'ArrowRight') {
        this.showNextMedia();
      }

      if (event.key === 'ArrowLeft') {
        this.showPrevMedia();
      }

      return;
    }

    if (event.key === 'Escape' && this.selectedModel) {
      this.closeModel();
      return;
    }

  }

  openModel(model: GalleryModel): void {
    this.selectedModel = model;
    this.selectedMediaIndex = null;
    this.syncBodyScrollLock();
  }

  closeModel(): void {
    this.selectedModel = null;
    this.selectedMediaIndex = null;
    this.syncBodyScrollLock();
  }

  openMedia(index: number): void {
    this.selectedMediaIndex = index;
    this.syncBodyScrollLock();
  }

  closeMediaViewer(): void {
    this.selectedMediaIndex = null;
    this.syncBodyScrollLock();
  }

  showNextMedia(): void {
    if (!this.selectedModel || this.selectedModel.portfolio.length === 0 || this.selectedMediaIndex === null) {
      return;
    }

    this.selectedMediaIndex = (this.selectedMediaIndex + 1) % this.selectedModel.portfolio.length;
  }

  showPrevMedia(): void {
    if (!this.selectedModel || this.selectedModel.portfolio.length === 0 || this.selectedMediaIndex === null) {
      return;
    }

    this.selectedMediaIndex =
      (this.selectedMediaIndex - 1 + this.selectedModel.portfolio.length) % this.selectedModel.portfolio.length;
  }

  get selectedMediaPath(): string | null {
    if (!this.selectedModel || this.selectedMediaIndex === null) {
      return null;
    }

    return this.selectedModel.portfolio[this.selectedMediaIndex] ?? null;
  }

  private syncBodyScrollLock(): void {
    if (this.selectedModel || this.selectedMediaIndex !== null) {
      this.lockBackgroundScroll();
      return;
    }

    this.unlockBackgroundScroll();
  }

  private lockBackgroundScroll(): void {
    if (this.isScrollLocked) {
      return;
    }

    this.savedScrollY = window.scrollY || this.document.documentElement.scrollTop || 0;

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

    window.scrollTo(0, this.savedScrollY);
    this.isScrollLocked = false;
  }
}
