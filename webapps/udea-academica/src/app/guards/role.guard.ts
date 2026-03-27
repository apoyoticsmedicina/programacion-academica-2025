// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import type { RolUsuario } from '../dto/roles.dto';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
        const allowed = route.data['roles'] as RolUsuario[] | undefined;

        // Si la ruta no declara roles, no restringimos por rol
        if (!allowed || allowed.length === 0) return true;

        const user = this.auth.getCurrentUser();
        if (!user) {
            // Si no hay usuario, AuthGuard debería atraparlo, pero por si acaso:
            return this.router.createUrlTree(['/login']);
        }

        if (allowed.includes(user.rol)) return true;

        // ⛔ Sin permisos: redirige a perfil (o dashboard/programas)
        return this.router.createUrlTree(['/dashboard/perfil'], {
            queryParams: { denied: 1 },
        });
    }
}
