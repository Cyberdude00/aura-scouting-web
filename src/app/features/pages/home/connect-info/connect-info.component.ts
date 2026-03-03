import { Component } from '@angular/core';

@Component({
  selector: 'app-connect-info',
  imports: [],
  template: `
    <section id="why">
      <div class="home-connect-panel home-content-panel home-copy-block">
        <h2>Connect with Top Agencies</h2>
        <h3>• A strong network of agencies offering exclusive opportunities</h3>
        <h3>• A secure and transparent process from selection to contract</h3>
        <h3>• Comprehensive support before, during, and after each experience</h3>
        <h3>• Collaboration with mother agencies for long-term careers</h3>
      </div>
    </section>
  `,
  styles: [`
    #why {
      background-image: var(--background-auras-argentina);
      background-size: cover;
      background-position: center;
      padding: 100px 20px;
      display: flex;
      justify-content: center;
    }

    #why .home-connect-panel {
      max-width: 900px;
    }
  `],
})
export class ConnectInfoComponent {

}
