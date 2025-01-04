import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthStore } from '../../store/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authStore: AuthStore, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkUserAuthenticated().pipe(
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return true;
        } else {
          // Redirect to login page
          return this.router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url },
          });
        }
      }),
      catchError((error) => {
        console.error('AuthGuard error:', error);
        // In case of error, redirect to login
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }

  /**
   * Checks if the user is authenticated.
   * If authenticated but user data isn't loaded, it triggers loading the user.
   */
  private checkUserAuthenticated(): Observable<boolean> {
    if (this.authStore.isAuthenticated()) {
      if (this.authStore.user()) {
        // User is authenticated and user data is loaded
        return of(true);
      } else {
        // User is authenticated but user data isn't loaded, load it
        return this.authStore.loadUser().pipe(
          map(() => !!this.authStore.user()),
          catchError(() => of(false)),
          take(1)
        );
      }
    } else {
      // User is not authenticated
      return of(false);
    }
  }
}
