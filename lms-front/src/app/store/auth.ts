import { computed, inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  Observable,
  pipe,
  tap,
  switchMap,
  from,
  finalize,
  catchError,
  throwError,
} from 'rxjs';
import {
  GetUserDto,
  UserControllerClient,
  LoginDto,
} from '../core/api/lms-api';
import { StorageService } from '../core/services/storage.service';
import { AuthService } from '../core/services/auth.service';
import { Role, STORAGE_KEY } from '../core/constants';

interface AuthState {
  user: GetUserDto | null;
  isLoading: boolean;
  error: string | null;
  selectedRole:Role,
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  selectedRole:localStorage.getItem(localStorage.getItem(STORAGE_KEY.user_role)) as Role || null,
};

@Injectable({ providedIn: 'root' })
export class AuthStore extends signalStore(
  withState(initialState),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => {
      const jwt = inject(JwtHelperService);
      const storage = inject(StorageService);
      const token = storage.accessToken;

      return !!token && !jwt.isTokenExpired(token);
    }),
    userRoles: computed(() => user()?.roles),
  })),
  withMethods((store) => {
    const userClient = inject(UserControllerClient);
    const router = inject(Router);
    const storage = inject(StorageService);
    const authService = inject(AuthService);
    const route = inject(ActivatedRoute);

    const loadUser = (): Observable<GetUserDto> => {
      patchState(store, { isLoading: true });

      return userClient.getUserProfile().pipe(
        tap({
          next: (user: GetUserDto) => {
            const userRole =  storage.userRole || user.roles[0] as Role;

            patchState(store, { user, error: null,selectedRole:userRole });

         
            console.log(store.selectedRole())
          },
          finalize: () => {
            patchState(store, { isLoading: false });
          },
        }),
        catchError((error) => {
          patchState(store, { error: error.message });
          return throwError(() => error);
        })
      );
    };

    const signIn = (credentials: LoginDto): Observable<GetUserDto> => {
      patchState(store, { isLoading: true, error: null });

      return authService.signIn(credentials).pipe(
        switchMap(() => loadUser()),
        tap({
          next: () => {
            const query = route.snapshot.queryParams['returnUrl'];
            if (query) {
              router.navigateByUrl(query);
              return;
            }
            router.navigate(['']);
          },
          complete: () => {
            patchState(store, { isLoading: false });
          },
        }),
        catchError((error) => {
          patchState(store, {
            error: error.message,
            isLoading: false,
          });
          return throwError(() => error);
        })
      );
    };
    const setRole = (role:Role) => {
       patchState(store,{selectedRole:role})
       storage.userRole = role;
    }

    return {
      loadUser,
      signIn,
      refreshToken() {
        return authService.refreshToken();
      },
      signOut() {
        authService.signOut();
        patchState(store, { user: null });
      },
      setRole
    };
  }),
  withHooks({
    onInit(store) {
      if (store.isAuthenticated() && !store.user()) {
        //   store.loadUser();
      }
    },
  })
) {}
