import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer>
      &copy; 2025 Aura Scouting. All rights reserved.
      <p lang="zh" class="chinese-text">
        欢迎来到Aura Scouting。我们专注于发掘具有潜力的国际模特。
      </p>
    </footer>
  `,
  styles: `
    footer {
      background-color: var(--color-dark);
      color: #fff;
      text-align: center;
      padding: 15px;
      font-size: 0.9rem;
      position: relative;
    }

    .chinese-text {
      font-family: var(--font-main);
      font-weight: 200;
      font-size: 0.9rem;
      opacity: 0.75;
      margin-top: 8px;
    }
  `,
})
export class FooterComponent {

}
