import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  imports: [],
  template: `
    <section id="contact">
      <h2>Contact Us</h2>
      <label>Get in touch with us for any inquiries or collaborations.</label>
      <h3>DIRECTORS</h3>
      <a href="mailto:emma@aurascouting.com">emma@aurascouting.com</a>
      <a href="mailto:magali@aurascouting.com">magali@aurascouting.com</a>
      <h3>INQUIRIES</h3>
      <a href="mailto:info@aurascouting.com">info@aurascouting.com</a>
      <h3>Follow Us:</h3>
      <a href="https://instagram.com/aurascouting" target="_blank" rel="noopener">Instagram</a>
    </section>
  `,
  styleUrl: './contact-us.component.scss',
})
export class ContactUsComponent {

}
