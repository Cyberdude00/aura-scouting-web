import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Navigation } from "../header/header.component";
import { Footer } from "../footer/footer.component";
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, Navigation, Footer, RouterOutlet],
  templateUrl: './main-layout.component.html',
})
export class MainLayout {
  constructor(private readonly router: Router) {}

  get isGalleryRoute(): boolean {
    return this.router.url.startsWith('/gallery/');
  }

}
