import { Component } from '@angular/core';
import { HomeIntroComponent } from "./home-intro/home-intro.component";
import { WhoWeAreComponent } from "./who-we-are/who-we-are.component";
import { OurScoutingServicesComponent }
  from "./our-scouting-services/our-scouting-services.component";
import { HowWeWorkComponent } from "./how-we-work/how-we-work.component";
import { ConnectInfoComponent } from "./connect-info/connect-info.component";
import { ModelSubmissionFormComponent }
  from "../../model-submission/components/model-submission-form.component";
import { ContactUsComponent } from "./contact-us/contact-us.component";

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
export class HomeComponent {

}
