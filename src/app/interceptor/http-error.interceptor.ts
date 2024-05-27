import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req)
    .pipe(
        catchError((err: any) => {
            let message = "";
          if (err instanceof HttpErrorResponse) {
            console.log("Status error: ", err.status);
            
            switch (err.status) {
                case 401:
                    message = "Vous n'êtes pas authorisé";       
                    console.error('Unauthorized request:', err);
                    break;
                case 409:
                    message = "Un conflit à été détecté";       
                    console.error('Conflict:', err);
                    break;
            
                default:
                    message = "Une erreur s'est produite";
                    console.error('HTTP error:', err);
                    break;
            }
          } else {
            // Handle non-HTTP errors
            message = "Une erreur s'est produite";
            console.error('An error occurred:', err);
          }
    
          return throwError(() => message); 
        })
    );
}