import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { httpTokenInterceptor } from './interceptor/http-token.interceptor';
import { KeycloakService } from './service/keycloak.service';

export const appConfig: ApplicationConfig = {
  providers: [
    //provideClientHydration(),
        provideAnimations(),
        provideZoneChangeDetection({ eventCoalescing: true }), 
        provideRouter(routes),
        provideHttpClient(
            withInterceptors([
                httpTokenInterceptor
            ])
        ),
        {
            provide: APP_INITIALIZER,
            deps: [KeycloakService],
            useFactory: kcFactory,
            multi: true
        }
    ]
};

export function kcFactory(ksService: KeycloakService) {
    return () => ksService.init();
}