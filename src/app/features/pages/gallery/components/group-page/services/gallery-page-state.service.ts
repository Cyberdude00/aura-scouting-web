import { Injectable } from '@angular/core';
import { GalleryModel } from '../../../data';

@Injectable()
export class GalleryPageStateService {
  selectedModel: GalleryModel | null = null;
  selectedMediaIndex: number | null = null;

  reset(): void {
    this.selectedModel = null;
    this.selectedMediaIndex = null;
  }

  openModel(model: GalleryModel): void {
    this.selectedModel = model;
    this.selectedMediaIndex = null;
  }

  closeModel(): void {
    this.selectedModel = null;
    this.selectedMediaIndex = null;
  }

  openMedia(index: number): void {
    this.selectedMediaIndex = index;
  }

  closeMediaViewer(): void {
    this.selectedMediaIndex = null;
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
}