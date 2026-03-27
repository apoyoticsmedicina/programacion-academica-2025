// src/environments/environment.dev.ts

import type { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  name: 'dev',

  // 👇 ajusta esto a tu backend de pruebas cuando lo tengas
  apiBaseUrl: 'http://localhost:3000',
  backendUrl: 'http://localhost:3000',

  auth: {
    popupCallbackPath: '/auth/popup-callback',
    storageKeyPrefix: 'udea-academica-dev',
  },

  devAuth: {
    enabled: true,
    devKey: 'dAgWYEUZfn11vaErF6VtwHM9dSFaVyIVdvpCXmhPauE=',
  },

};
