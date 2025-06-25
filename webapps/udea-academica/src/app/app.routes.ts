// src/app/app.routes.ts
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
          import('./components/programas/programas.component')
            .then(m => m.ProgramasComponent)
      },
      {
        path: 'cursos',
        loadComponent: () =>
          import('./components/cursos/cursos.component')
            .then(m => m.CursosComponent)
      },
      {
        path: 'cronograma',
        loadComponent: () =>
          import('./components/cronograma/cronograma.component')
            .then(m => m.CronogramaComponent)
      },
      {
        path: 'docentes',
        loadComponent: () =>
          import('./components/docentes/docentes.component')
            .then(m => m.DocentesComponent)
      },
      {
        path: 'planes-estudio',
        loadComponent: () =>
          import('./components/planes-estudio/planes-estudio.component')
            .then(m => m.PlanesEstudioComponent)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./components/perfil/perfil.component')
            .then(m => m.PerfilComponent)
      },
      // redirigir a “programas” si estás en /dashboard
      {
        path: '',
        redirectTo: 'programas',
        pathMatch: 'full'
      }
    ]
  },
  // cualquier otra ruta vuelve al dashboard
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
