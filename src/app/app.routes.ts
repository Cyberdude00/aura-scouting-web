import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/pages/home/home.component')
            .then(m => m.HomeComponent)
      },
      {
        path: 'gallery/:group',
        loadComponent: () =>
          import('./features/pages/gallery/components/group-page/gallery-group-page.component')
            .then(m => m.GalleryGroupPageComponent)
      }
    ]
  }
];
