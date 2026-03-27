// src/app/directives/has-role.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import type { RolUsuario } from '../dto/roles.dto';

@Directive({
    selector: '[hasRole]',
    standalone: true,
})
export class HasRoleDirective implements OnDestroy {
    private roles: RolUsuario[] = [];
    private sub: Subscription;

    @Input('hasRole') set setRoles(value: RolUsuario[] | RolUsuario) {
        this.roles = Array.isArray(value) ? value : [value];
        this.render();
    }

    constructor(
        private tpl: TemplateRef<unknown>,
        private vcr: ViewContainerRef,
        private auth: AuthService
    ) {
        // Re-render cuando cambie usuario (login/logout/restore)
        this.sub = this.auth.currentUser$.subscribe(() => this.render());
    }

    private render() {
        this.vcr.clear();

        const user = this.auth.getCurrentUser();
        if (!user) return;

        if (this.roles.length === 0 || this.roles.includes(user.rol)) {
            this.vcr.createEmbeddedView(this.tpl);
        }
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }
}
