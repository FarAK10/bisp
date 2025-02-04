import { Injectable } from '@angular/core';
import {
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthStore } from '../../store/auth';
import { Role } from '../../core/constants'; // Ensure correct path

@Injectable({
  providedIn: 'root',
})
export class RolesGuard implements CanActivateChild {
  constructor(private authStore: AuthStore, private router: Router) {}

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const requiredRoles: Role[] = childRoute.data['roles'];
    console.log('RolesGuard - requiredRoles:', requiredRoles);

    return this.hasRequiredRoles(requiredRoles).pipe(
      map((hasRoles) => {
        if (hasRoles) {
          return true;
        } else {
          // Redirect to unauthorized page
          return false;
        }
      }),
      catchError((error) => {
        return of(false);
      })
    );
  }

  /**
   * Checks if the user has at least one of the required roles.
   * @param requiredRoles Array of roles required to access the route.
   */
  private hasRequiredRoles(requiredRoles: Role[]): Observable<boolean> {
  
    const userRole = this.authStore.selectedRole();
    if(!requiredRoles || requiredRoles.length===0){
      return of(true);
    }
    if(requiredRoles.includes(userRole)) {
      return of(true)
    } 
    return of(false)
    
  }
}
