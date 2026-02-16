import { Component } from '@angular/core';

@Component({
  selector: 'app-home-intro',
  imports: [],
  template: `
    <section id="our-name">
      <img src="images/aura-scouting-logo.png" alt="Aura Scouting Logo" id="our-name-logo" loading="eager">
      <h1 id="our-name-text">
        We offer models and agencies the opportunity to shine<br>on the global stage.
      </h1>
    </section>
  `,
  styleUrl: './home-intro.component.scss',
})
export class HomeIntroComponent {

}
