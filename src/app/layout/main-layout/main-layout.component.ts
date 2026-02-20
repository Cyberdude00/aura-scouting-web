import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  constructor(private readonly router: Router) {}

  get isGalleryRoute(): boolean {
    return this.router.url.startsWith('/gallery/');
  }

}
