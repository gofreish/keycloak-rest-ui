import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { KeycloakService } from '../service/keycloak.service';

export const httpTokenInterceptor: HttpInterceptorFn = (req, next) => {
    const kcService: KeycloakService = inject(KeycloakService);
    const authToken = kcService.keycloack.token;

    // Clone the request and add the authorization header
    const authReq = req.clone({
        setHeaders: {
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${authToken}`
        }
    });
    return next(authReq)
    .pipe(
        catchError((err: any) => {
          if (err instanceof HttpErrorResponse) {
            console.log("Status error: ", err.status);
            
            // Handle HTTP errors
            if (err.status === 401) {
              // Specific handling for unauthorized errors         
              console.error('Unauthorized request:', err);
              // You might trigger a re-authentication flow or redirect the user here
            } else {
              // Handle other HTTP error codes
              console.error('HTTP error:', err);
            }
          } else {
            // Handle non-HTTP errors
            console.error('An error occurred:', err);
          }
    
          // Re-throw the error to propagate it further
          return throwError(() => err); 
        })
    );
};
