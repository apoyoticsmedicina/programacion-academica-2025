import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FooterToggleService {
  private _visible$ = new BehaviorSubject<boolean>(false);
  /** Observable público para suscribirse */
  readonly visible$ = this._visible$.asObservable();

  /** Devuelve el valor actual */
  get visible(): boolean {
    return this._visible$.value;
  }

  /** Cambia el estado */
  toggle() {
    this._visible$.next(!this._visible$.value);
  }

  /** Forzar visible/invisible */
  setVisible(v: boolean) {
    this._visible$.next(v);
  }
}

