import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';      // ← importa esto

import { App } from './app/app';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient()                                      // ← y añádelo aquí
  ]
}).catch(err => console.error(err));
