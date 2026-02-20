import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-gallery-header',
  standalone: true,
  templateUrl: './gallery-header.component.html',
  styleUrl: './gallery-header.component.scss',
})
export class GalleryHeaderComponent {
  @Input({ required: true }) galleryName!: string;
}
