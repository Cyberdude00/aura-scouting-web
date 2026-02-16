import { Routes } from '@angular/router';

export const MODEL_SUBMISSION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/model-submission-form.component')
        .then(m => m.ModelSubmissionFormComponent)
  }
];
