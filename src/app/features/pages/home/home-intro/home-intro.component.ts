import { Component } from '@angular/core';

@Component({
  selector: 'app-home-intro',
  imports: [],
  template: `
    <section id="our-name">
      <img src="/images/aura-scouting-logo.png" alt="Aura Scouting Logo" id="our-name-logo" loading="eager">
      <h1 id="our-name-text">
        <span class="intro-copy intro-copy-desktop">
          We offer models and agencies the opportunity<br>to shine on the global stage.
        </span>
        <span class="intro-copy intro-copy-mobile">
          We offer models and agencies<br>the opportunity to shine<br>on the global stage.
        </span>
      </h1>
    </section>
  `,
  styleUrl: './home-intro.component.scss',
})
export class HomeIntroComponent {

}
