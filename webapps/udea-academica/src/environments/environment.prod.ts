// src/environments/environment.prod.ts

import type { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  name: 'prod',

  // 👇 aquí la URL real del backend en producción (por ahora localhost)
  apiBaseUrl: 'http://localhost:3000',
  backendUrl: 'http://localhost:3000',

  auth: {
    popupCallbackPath: '/auth/popup-callback',
    storageKeyPrefix: 'udea-academica',
  },
};
