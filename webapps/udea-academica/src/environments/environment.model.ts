// src/environments/environment.model.ts

/** Contrato común para TODOS los environments */
export interface Environment {
    /** Flag estándar de Angular */
    production: boolean;

    /** Nombre del ambiente: local | dev | prod */
    name: 'local' | 'dev' | 'prod';

    /** URL base del backend (API REST) */
    apiBaseUrl: string;

    /** Alias por si en algún sitio se usó backendUrl */
    backendUrl: string;

    /** Config específica de autenticación en el front */
    auth: {
        /** Ruta interna donde el backend redirige el popup */
        popupCallbackPath: string;
        /** Prefijo para keys en localStorage / sessionStorage */
        storageKeyPrefix: string;
    };

    devAuth?: {
        enabled: boolean;
        devKey: string;
    };

}
