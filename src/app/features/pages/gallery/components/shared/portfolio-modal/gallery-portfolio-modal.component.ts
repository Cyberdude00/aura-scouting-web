import { downloadFullMaterialZip, ModelMaterialSections } from '../../../utils';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GalleryModel } from '../../../data';
import { Measurements } from '../measurement-system/gallery-measurement-system.component';
import { downloadMediaFile, isVideoMedia } from '../../../utils';

@Component({
  selector: 'app-gallery-portfolio-modal',
  standalone: true,
  imports: [Measurements],
  templateUrl: './gallery-portfolio-modal.component.html',
  styleUrl: './gallery-portfolio-modal.component.scss',
})
export class PortfolioModal {
    async downloadAllMaterial(): Promise<void> {
      if (!this.model) return;

      const material: ModelMaterialSections = {
        book: this.model.book || [],
        polas: this.model.polas || [],
        extraMaterial: this.model.fullMaterial ? (this.model.extraMaterial || []) : [],
        extraSnaps: this.model.fullMaterial ? (this.model.extraSnaps || []) : [],
        videos: this.model.fullMaterial ? (this.model.videos || []) : [],
      };
      await downloadFullMaterialZip(this.model.name, material);
    }
  @Input() model: GalleryModel | null = null;
  @Input() initialIndex: number = 0;
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
