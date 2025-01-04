// interceptors/auth.interceptor.ts

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service'; // Our new service

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const authService = inject(AuthService);

  // Attach bearer token if present
  const authToken = storageService.accessToken;
  console.log('Auth token:', authToken);
  const authRequest = authToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${authToken}` } })
    : req;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // If server says "unauthorized", attempt refresh
      if (error.status === 401) {
        return handle401Error(authRequest, next);
      }
      // Otherwise, throw the error as-is
      return throwError(() => error);
    })
  );

  function handle401Error(
    originalRequest: HttpRequest<unknown>,
    nextHandler: HttpHandlerFn
  ): Observable<HttpEvent<unknown>> {
    return authService.refreshToken().pipe(
      switchMap((newToken: string) => {
        // Recreate request with new token
        const newRequest = originalRequest.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` },
        });
        return nextHandler(newRequest);
      }),
      catchError((refreshError) => {
        // If refresh fails, we can sign out or redirect user
        authService.signOut();
        return throwError(() => refreshError);
      })
    );
  }
};
