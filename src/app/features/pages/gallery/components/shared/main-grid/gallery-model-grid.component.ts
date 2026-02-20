import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GalleryModel } from '../../../data/scouting-model.types';

@Component({
  selector: 'app-gallery-model-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-model-grid.component.html',
  styleUrl: './gallery-model-grid.component.scss',
})
export class GalleryModelGridComponent {
  @Input() models: GalleryModel[] = [];
  @Output() modelSelected = new EventEmitter<GalleryModel>();

  openModel(model: GalleryModel): void {
    this.modelSelected.emit(model);
  }

  trackByModelId(_: number, model: GalleryModel): string {
    return model.id;
  }
}
