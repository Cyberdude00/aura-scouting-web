import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelSubmissionForm } from './model-submission-form.component';

describe('SubmissionFormComponent', () => {
  let component: ModelSubmissionForm;
  let fixture: ComponentFixture<ModelSubmissionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelSubmissionForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelSubmissionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
