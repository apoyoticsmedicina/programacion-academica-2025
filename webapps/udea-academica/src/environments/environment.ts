// src/environments/environment.ts

import type { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  name: 'prod',

  apiBaseUrl: 'http://localhost:3000',
  backendUrl: 'http://localhost:3000',

  auth: {
    popupCallbackPath: '/auth/popup-callback',
    storageKeyPrefix: 'udea-academica',
  },
};
