import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  imports: [],
  template: `
    <section id="contact">
      <h2>Contact Us</h2>
      <label>Get in touch with us for any inquiries or collaborations.</label>
      <h3>DIRECTORS</h3>
      <a href="mailto:emma@aurascouting.com" class="link-accent">emma@aurascouting.com</a>
      <a href="mailto:magali@aurascouting.com" class="link-accent">magali@aurascouting.com</a>
      <h3>INQUIRIES</h3>
      <a href="mailto:info@aurascouting.com" class="link-accent">info@aurascouting.com</a>
      <h3>Follow Us:</h3>
      <a href="https://instagram.com/aurascouting" class="link-accent" target="_blank" rel="noopener">Instagram</a>
    </section>
  `,
  styles: [`
    #contact {
      background-color: var(--color-dark);
      color: var(--color-bg);
      padding-top: var(--space-8);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    #contact h2 {
      font-size: clamp(2rem, 5vw, 3rem);
      margin-bottom: 20px;
    }

    #contact h3 {
      margin-top: var(--space-4);
    }

    #contact a {
      margin: var(--space-1) var(--space-1);
    }
  `],
})
export class Contact {

}
