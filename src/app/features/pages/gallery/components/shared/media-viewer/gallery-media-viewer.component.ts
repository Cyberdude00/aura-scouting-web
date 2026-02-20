import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { isVideoMedia } from '../../../utils/gallery-media.utils';
import { downloadMediaFile } from '../../../utils/gallery-download.utils';

@Component({
  selector: 'app-gallery-media-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-media-viewer.component.html',
  styleUrl: './gallery-media-viewer.component.scss',
})
export class GalleryMediaViewerComponent {
  @Input() mediaPath: string | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  private touchStartX = 0;
  private touchStartY = 0;

  isVideo(mediaPath: string): boolean {
    return isVideoMedia(mediaPath);
  }

  get canDownloadImage(): boolean {
    return Boolean(this.mediaPath && !this.isVideo(this.mediaPath));
  }

  stopDownloadPropagation(event: Event): void {
    event.stopPropagation();
  }

  async downloadCurrentMedia(event: Event): Promise<void> {
    event.stopPropagation();
    if (!this.mediaPath || this.isVideo(this.mediaPath)) {
      return;
    }

    await downloadMediaFile(this.mediaPath, 'gallery-photo');
  }

  closeViewer(): void {
    this.closed.emit();
  }

  showNext(): void {
    this.next.emit();
  }

  showPrevious(): void {
    this.previous.emit();
  }

  onTouchStart(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  onTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      this.showNext();
      return;
    }

    this.showPrevious();
  }
}
