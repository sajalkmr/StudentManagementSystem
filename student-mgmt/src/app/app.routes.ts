import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'register', loadComponent: () => import('./components/registration/registration.component').then(m => m.RegistrationComponent) },
  { path: 'marks', loadComponent: () => import('./components/marks-entry/marks-entry.component').then(m => m.MarksEntryComponent) },
  { path: 'report', loadComponent: () => import('./components/report/report.component').then(m => m.ReportComponent) }
];
