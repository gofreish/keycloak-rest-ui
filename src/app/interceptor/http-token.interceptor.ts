import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { KeycloakService } from '../service/keycloak.service';
import { KEYCLOAK_CONFIG } from '../keycloak-config';

export const httpTokenInterceptor: HttpInterceptorFn = (req, next) => {
    const kcService: KeycloakService = inject(KeycloakService);
    const authToken = kcService.keycloack.token;

    const headers: { [name:string]: string|string[]} 
        = req.url.startsWith(KEYCLOAK_CONFIG.url) 
        ? 
        {
            Authorization: `Bearer ${authToken}`
        } 
        : 
        {
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${authToken}`
        };
    // Clone the request and add the authorization header
    const authReq = req.clone({
        setHeaders: headers
    });

    return next(authReq);
};
