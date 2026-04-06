import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { HasRoleDirective } from '../../directives/has-role.directive';
import { ROLES } from '../../auth/roles.const';
import {
  EstadoServidorService,
  EstadoServidorDTO,
} from '../../services/estado-servidor.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, HasRoleDirective],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  ROLES = ROLES;

  effectiveEstado: EstadoServidorDTO | null = null;
  loadingEstado = false;

  showAsignarCoordinadores = false;
  showSolicitudesCambio = false;
  showCronogramas = false;

  constructor(private estadoServidorSrv: EstadoServidorService) { }

  ngOnInit(): void {
    this.loadEstadoServidor();
  }

  private loadEstadoServidor(): void {
    this.loadingEstado = true;

    this.estadoServidorSrv.effective()
      .pipe(finalize(() => (this.loadingEstado = false)))
      .subscribe({
        next: (row) => {
          this.effectiveEstado = row ?? null;
          this.applyEstadoVisibility();
        },
        error: (err) => {
          console.error(err);
          this.effectiveEstado = null;
          this.applyEstadoVisibility();
        },
      });
  }

  private normalizeEstado(value: string | null | undefined): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private applyEstadoVisibility(): void {
    const estado = this.normalizeEstado(this.effectiveEstado?.estado);

    const isIdle = estado === 'idle (lectura)';
    const isSolicitudes = estado === 'solicitudes de cambio';
    const isRevisiones = estado === 'revisiones';
    const isAprobacion = estado === 'aprobacion';
    const isCronogramas = estado === 'cronogramas';

    this.showAsignarCoordinadores = isIdle;
    this.showSolicitudesCambio = isSolicitudes || isRevisiones || isAprobacion;
    this.showCronogramas = isCronogramas || isIdle;

    console.log('[Sidebar] estado efectivo:', this.effectiveEstado?.estado);
    console.log('[Sidebar] visibilidad:', {
      showAsignarCoordinadores: this.showAsignarCoordinadores,
      showSolicitudesCambio: this.showSolicitudesCambio,
      showCronogramas: this.showCronogramas,
    });
  }
}