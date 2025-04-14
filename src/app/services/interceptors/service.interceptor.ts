import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthDataService } from '../auth/AuthData.service';

export const authHeaderInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authDataService = inject(AuthDataService);

  // Get dynamic values from AuthService
  const authToken = authDataService.getAuthToken();
  const role = authDataService.getRole();
  const organizationId = authDataService.getOrganizationId();
  const email = authDataService.getEmail();

  // Clone the request to add the common headers if they exist
  const modifiedReq = req.clone({
    setHeaders: {
      'accept': '*/*',
      'authorization': `bearer ${authToken}`,
      'role': role || '',
      'organizationId': organizationId || '',
      'email': email || ''
    }
  });

  // Pass the modified request to the next handler
  return next(modifiedReq);
};
