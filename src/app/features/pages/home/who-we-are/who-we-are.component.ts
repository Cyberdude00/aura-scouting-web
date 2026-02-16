import { Component } from '@angular/core';

@Component({
  selector: 'app-who-we-are',
  imports: [],
  template: `
    <section id="about">
      <div class="big">
        <div class="small">
          <h2>Who we are</h2>
        </div>
        <div class="small">
          <h3>• As a global scouting agency, we specialize in discovering and promoting talent from diverse
            backgrounds, celebrating each individual’s unique beauty.</h3>
          <h3>• We provide structured access to global opportunities, acting as intermediaries between agencies to
            secure top-tier placements.</h3>
        </div>
      </div>
    </section>
  `,
  styleUrl: './who-we-are.component.scss',
})
export class WhoWeAreComponent {

}
