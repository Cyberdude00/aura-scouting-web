import { Component } from '@angular/core';

@Component({
  selector: 'app-our-scouting-services',
  imports: [],
  template: `
    <section id="services">
      <div class="image-frame">
        <img src="images/aura-scouting-asia.webp" alt="Scouting services in Asia" loading="lazy"
          class="services-image">
      </div>
      <div class="text-frame">
        <h2>Our scouting services</h2>
        <h3>• Connections with Agencies in America, Asia & Europe</h3>
        <h3>• Work Permit & Relocation Management</h3>
        <h3>• Scouting & Talent Development</h3>
        <h3>• Mentorship & Continuous Support</h3>
      </div>
    </section>
  `,
  styleUrl: './our-scouting-services.component.scss',
})
export class OurScoutingServicesComponent {

}
