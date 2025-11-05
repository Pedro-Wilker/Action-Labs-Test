import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * Application Configuration
 *
 * Why this approach:
 * - Standalone application configuration (Angular 15+ pattern)
 * - HttpClient provided for API service dependency injection
 * - Error handling and zone change detection optimized for performance
 * - Future-proof configuration that supports modern Angular features
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()) // Enable HTTP client for API services
  ]
};
