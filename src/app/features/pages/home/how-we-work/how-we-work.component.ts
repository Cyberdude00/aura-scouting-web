import { Component } from '@angular/core';

@Component({
  selector: 'app-how-we-work',
  imports: [],
  template: `
    <section id="how">
      <div class="image-frame">
        <img src="images/aura-scouting-mexico.jpg" alt="Scouting process in Mexico" loading="lazy" class="how-image">
      </div>
      <div class="text-frame">
        <h2>How we work</h2>
        <h3>• Scouting & Evaluation</h3>
        <h3>• Placement & Negotiation</h3>
        <h3>• Document Assistance</h3>
        <h3>• Comprehensive Support</h3>
        <h3>• Performance Monitoring</h3>
        <h3>• Payment Review</h3>
      </div>
    </section>
  `,
  styleUrl: './how-we-work.component.scss',
})
export class HowWeWorkComponent {

}
