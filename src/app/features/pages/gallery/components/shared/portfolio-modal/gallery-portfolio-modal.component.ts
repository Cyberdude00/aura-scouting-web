import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GalleryModel } from '../../../data/scouting-model.types';
import { GalleryMeasurementSystemComponent } from '../measurement-system/gallery-measurement-system.component';
import { isVideoMedia } from '../../../utils/gallery-media.utils';
import { downloadMediaFile } from '../../../utils/gallery-download.utils';

@Component({
  selector: 'app-gallery-portfolio-modal',
  standalone: true,
  imports: [CommonModule, GalleryMeasurementSystemComponent],
  templateUrl: './gallery-portfolio-modal.component.html',
  styleUrl: './gallery-portfolio-modal.component.scss',
})
export class GalleryPortfolioModalComponent {
  @Input() model: GalleryModel | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() mediaSelected = new EventEmitter<number>();

  closeModal(): void {
    this.closed.emit();
  }

  openMedia(index: number): void {
    this.mediaSelected.emit(index);
  }

  isVideo(mediaPath: string): boolean {
    return isVideoMedia(mediaPath);
  }

  async downloadMedia(event: Event, mediaPath: string, index: number): Promise<void> {
    event.stopPropagation();
    if (!this.model) {
      return;
    }

    await downloadMediaFile(mediaPath, `${this.model.name}-${index + 1}`);
  }

  trackByPortfolioItem(index: number, mediaPath: string): string {
    return `${index}-${mediaPath}`;
  }
}
