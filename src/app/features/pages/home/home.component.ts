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
      title: 'International Model Scouting Agency',
      description:
        'Aura Scouting is an international model scouting agency connecting new faces with leading agencies across America, Europe, and Asia.',
      keywords: 'aura scouting, model scouting agency, international model agency, new faces, fashion scouting, talent development',
      image: 'https://www.aurascouting.com/images/aura-scouting-logo.png',
      slug: '',
    });
    this.seoService.setCanonical('https://www.aurascouting.com/');
    this.seoService.setRobotsIndex(true);
  }

}
