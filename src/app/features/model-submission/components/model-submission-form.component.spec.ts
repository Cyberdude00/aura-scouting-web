import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelSubmissionFormComponent } from './model-submission-form.component';

describe('SubmissionFormComponent', () => {
  let component: ModelSubmissionFormComponent;
  let fixture: ComponentFixture<ModelSubmissionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelSubmissionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelSubmissionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
