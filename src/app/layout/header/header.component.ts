import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  template: `
    <nav>
      <ul>
        <li><a (click)="scrollTo('about')" style="cursor: pointer;">Who we are</a></li>
        <li><a (click)="scrollTo('services')" style="cursor: pointer;">Our services</a></li>
        <li><a (click)="scrollTo('model-submission')" style="cursor: pointer;">Model Submission</a></li>
        <li><a (click)="scrollTo('contact')" style="cursor: pointer;">Contact us</a></li>
      </ul>
    </nav>
  `,
  styles: `
    nav {
      position: fixed;
      top: 0;
      width: 100%;
      background: var(--color-dark);
      font-family: var(--font-main);
      padding: 10px 0;
      z-index: 1000;
      color: var(--color-accent);
      transition: background-color 0.3s ease;
    }

    nav ul {
      list-style: none;
      text-align: center;
    }

    nav ul li {
      display: inline;
      margin: 0 4%;
    }

    nav ul li a {
      font-weight: normal;
      transition: color 0.3s ease;
    }

    nav ul li a:hover {
      color: #181a1b;
    }

    nav a:focus {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
  `,
})
export class HeaderComponent {
    scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }
}
