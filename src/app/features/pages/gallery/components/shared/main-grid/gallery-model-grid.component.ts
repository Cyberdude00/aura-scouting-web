import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GalleryModel } from '../../../data';
import { isVideoMedia } from '../../../utils';

@Component({
  selector: 'app-gallery-model-grid',
  standalone: true,
  templateUrl: './gallery-model-grid.component.html',
  styleUrl: './gallery-model-grid.component.scss',
})
export class ModelGrid {
  private readonly defaultCover = '/images/aura-scouting-logo.png';

  @Input() models: GalleryModel[] = [];
  @Output() modelSelected = new EventEmitter<GalleryModel>();

  resolveCover(model: GalleryModel): string {
    return model.cover || this.resolvePortfolioFallback(model) || this.defaultCover;
  }

  onCoverError(event: Event, model: GalleryModel): void {
    const image = event.target as HTMLImageElement;
    const fallback = this.resolvePortfolioFallback(model) || this.defaultCover;

    if (image.src.endsWith(fallback)) {
      return;
    }

    image.src = fallback;
  }

  openModel(model: GalleryModel): void {
    this.modelSelected.emit(model);
  }

  trackByModelId(_: number, model: GalleryModel): string {
    return model.id;
  }

  private resolvePortfolioFallback(model: GalleryModel): string | null {
    const imageFromPortfolio = model.portfolio.find((item) => !isVideoMedia(item));
    return imageFromPortfolio ?? null;
  }
}
