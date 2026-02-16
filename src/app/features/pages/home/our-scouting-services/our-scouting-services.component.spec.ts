import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurScoutingServicesComponent } from './our-scouting-services.component';

describe('OurScoutingServicesComponent', () => {
  let component: OurScoutingServicesComponent;
  let fixture: ComponentFixture<OurScoutingServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurScoutingServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurScoutingServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
