import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet />
    </main>
    <app-footer></app-footer>
  `,
  styles: `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
      overflow-x: hidden;
    }

    main {
      font-family: var(--font-main);
      font-weight: 200;
      background-color: var(--color-bg);
      color: var(--color-text-light);
      position: relative;
      overflow-x: hidden;
    }

    a {
      text-decoration: none;
      color: inherit;
    }
  `,
})
export class MainLayoutComponent {

}
