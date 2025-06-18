import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
// import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: 'programas',
        loadComponent: () =>
          import(
            './components/programas/programas.component'
          ).then((m) => m.ProgramasComponent)
      },
      {
        path: '',
        redirectTo: 'programas',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
