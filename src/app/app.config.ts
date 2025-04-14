import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuth0 } from '@auth0/auth0-angular';
import { HTTP_INTERCEPTORS, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { authHeaderInterceptor } from './services/interceptors/service.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authHeaderInterceptor])),
    provideAnimationsAsync(), 
    provideAuth0({
      domain: 'dev-pxifdjwakxjjtsa0.us.auth0.com',
      clientId: 'fkTzgjwNX29ppeGS4rbeAOnaWwLsjrZw',
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: "samisen_nbats"
      }
    }),
    // Register the interceptor as a provider
  ]
};
