import { Component, OnInit } from '@angular/core';
import { HomeIntroComponent } from "./home-intro/home-intro.component";
import { WhoWeAreComponent } from "./who-we-are/who-we-are.component";
import { OurScoutingServicesComponent }
  from "./our-scouting-services/our-scouting-services.component";
import { HowWeWorkComponent } from "./how-we-work/how-we-work.component";
import { ConnectInfoComponent } from "./connect-info/connect-info.component";
import { ModelSubmissionFormComponent }
  from "../../model-submission/components/model-submission-form.component";
import { ContactUsComponent } from "./contact-us/contact-us.component";
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-home',
  imports: [
    HomeIntroComponent,
    WhoWeAreComponent,
    OurScoutingServicesComponent,
    HowWeWorkComponent,
    ConnectInfoComponent,
    ModelSubmissionFormComponent,
    ContactUsComponent
  ],
  template: `
    <app-home-intro />
    <app-who-we-are />
    <app-our-scouting-services />
    <app-how-we-work />
    <app-connect-info />
    <app-model-submission-form />
    <app-contact-us />
  `,
  styles: ``,
})
export class HomeComponent implements OnInit {
  constructor(private readonly seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.generateTags({
      title: 'Home',
      description:
        'Aura Scouting is an international scouting agency connecting models with agencies across America, Asia, and Europe.',
      keywords: 'model scouting, international models, agencies, talent development, aura scouting',
      image: 'https://www.aurascouting.com/images/aura-scouting-logo.png',
      slug: '',
    });
    this.seoService.setCanonical('https://www.aurascouting.com/');
    this.seoService.setRobotsIndex(true);
  }

}
