// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { ROLES } from './auth/roles.const';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'auth/popup-callback',
    loadComponent: () =>
      import('./pages/auth/auth-popup-callback.component').then(
        (m) => m.AuthPopupCallbackComponent
      ),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'programas',
        canActivate: [RoleGuard],
        data: {
          roles: [
            ROLES.SUPERADMIN,
            ROLES.ADMIN,
            ROLES.COORD_PROGRAMA,
            ROLES.COORD_CURSO,
            ROLES.DOCENTE,
          ],
        },
        loadComponent: () =>
          import('./components/programas/programas.component').then(
            (m) => m.ProgramasComponent
          ),
      },
      {
        path: 'cursos',
        canActivate: [RoleGuard],
        data: {
          roles: [
            ROLES.SUPERADMIN,
            ROLES.ADMIN,
            ROLES.COORD_PROGRAMA,
            ROLES.COORD_CURSO,
            ROLES.DOCENTE,
          ],
        },
        loadComponent: () =>
          import('./components/cursos/cursos.component').then(
            (m) => m.CursosComponent
          ),
      },
      {
        path: 'cronogramas',
        canActivate: [RoleGuard],
        data: {
          roles: [
            ROLES.SUPERADMIN,
            ROLES.ADMIN,
            ROLES.COORD_PROGRAMA,
            ROLES.COORD_CURSO,
            ROLES.DOCENTE,
          ],
        },
        loadComponent: () =>
          import('./components/cronogramas/cronogramas.component').then(
            (m) => m.CronogramasComponent
          ),
      },
      {
        path: 'asignar-coordinadores',
        canActivate: [RoleGuard],
        data: {
          roles: [
            ROLES.SUPERADMIN,
            ROLES.ADMIN,
          ],
        },
        loadComponent: () =>
          import('./components/asiganar-coordinador/asiganar-coordinador.component').then(
            (m) => m.AsiganarCoordinadorComponent
          ),
      },
      {
        path: 'docentes',
        canActivate: [RoleGuard],
        data: {
          roles: [
            ROLES.SUPERADMIN,
            ROLES.ADMIN,
          ],
        },
        loadComponent: () =>
          import('./components/docentes/docentes.component').then(
            (m) => m.DocentesComponent
          ),
      },
      {
        path: 'planes-estudio',
        canActivate: [RoleGuard],
        data: {
          roles: [
            ROLES.SUPERADMIN,
            ROLES.ADMIN,
            ROLES.COORD_PROGRAMA,
            ROLES.COORD_CURSO,
            ROLES.DOCENTE,
          ],
        },
        loadComponent: () =>
          import('./components/planes-estudio/planes-estudio.component').then(
            (m) => m.PlanesEstudioComponent
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./components/perfil/perfil.component').then(
            (m) => m.PerfilComponent
          ),
      },
      {
        path: 'registro',
        canActivate: [RoleGuard],
        data: { roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
        loadComponent: () =>
          import('./components/registro/registro.component').then(
            (m) => m.RegistroComponent
          ),
      },
      {
        path: 'estados-servidor',
        canActivate: [RoleGuard],
        data: { roles: [ROLES.SUPERADMIN, ROLES.ADMIN] },
        loadComponent: () =>
          import('./components/estado-servidor/estado-servidor.component').then(
            (m) => m.EstadoServidorComponent
          ),
      },
      {
        path: 'solicitudes-cambio',
        canActivate: [RoleGuard],
        data: {
          roles: [
            ROLES.SUPERADMIN,
            ROLES.ADMIN,
            ROLES.COORD_PROGRAMA,
            ROLES.COORD_CURSO,
          ],
        },
        loadComponent: () =>
          import('./components/solicitudes-cambio/solicitudes-cambio.component').then(
            (m) => m.SolicitudesCambioComponent
          ),
      },
      {
        path: '',
        redirectTo: 'programas',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
