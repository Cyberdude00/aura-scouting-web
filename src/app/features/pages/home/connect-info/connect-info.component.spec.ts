import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectInfoComponent } from './connect-info.component';

describe('ConnectInfoComponent', () => {
  let component: ConnectInfoComponent;
  let fixture: ComponentFixture<ConnectInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
