import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryGroup, GalleryModel, getGalleryGroup } from '../../data';
import { GalleryHeaderComponent } from '../shared/header/gallery-header.component';
import { GalleryModelGridComponent } from '../shared/main-grid/gallery-model-grid.component';
import { GalleryPortfolioModalComponent } from '../shared/portfolio-modal/gallery-portfolio-modal.component';
import { GalleryMediaViewerComponent } from '../shared/media-viewer/gallery-media-viewer.component';
import { GalleryOverlayScrollService } from './services/gallery-overlay-scroll.service';
import { GalleryPageSeoService } from './services/gallery-page-seo.service';
import { GalleryPageStateService } from './services/gallery-page-state.service';

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
  providers: [GalleryPageStateService, GalleryOverlayScrollService, GalleryPageSeoService],
  templateUrl: './gallery-group-page.component.html',
  styleUrl: './gallery-group-page.component.scss',
})
export class GalleryGroupPageComponent implements OnDestroy {
  gallery: GalleryGroup | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly pageState: GalleryPageStateService,
    private readonly overlayScroll: GalleryOverlayScrollService,
    private readonly pageSeo: GalleryPageSeoService,
  ) {
    this.route.paramMap.subscribe((params) => {
      const galleryParam = params.get('group') ?? '';
      this.gallery = getGalleryGroup(galleryParam);
      this.pageState.reset();
      this.syncBodyScrollLock();

      if (this.gallery) {
        this.pageSeo.applyGalleryTags(this.gallery);
      }
    });
  }

  ngOnDestroy(): void {
    this.overlayScroll.destroy();
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
    this.pageState.openModel(model);
    this.syncBodyScrollLock();
  }

  closeModel(): void {
    this.pageState.closeModel();
    this.syncBodyScrollLock();
  }

  openMedia(index: number): void {
    this.pageState.openMedia(index);
    this.syncBodyScrollLock();
  }

  closeMediaViewer(): void {
    this.pageState.closeMediaViewer();
    this.syncBodyScrollLock();
  }

  showNextMedia(): void {
    this.pageState.showNextMedia();
  }

  showPrevMedia(): void {
    this.pageState.showPrevMedia();
  }

  get selectedModel(): GalleryModel | null {
    return this.pageState.selectedModel;
  }

  get selectedMediaIndex(): number | null {
    return this.pageState.selectedMediaIndex;
  }

  get selectedMediaPath(): string | null {
    return this.pageState.selectedMediaPath;
  }

  private syncBodyScrollLock(): void {
    this.overlayScroll.sync(this.selectedModel !== null || this.selectedMediaIndex !== null);
  }
}
