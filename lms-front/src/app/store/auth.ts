import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
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
import { Observable, pipe, tap, switchMap, from, finalize } from 'rxjs';
import {
  GetUserDto,
  UserControllerClient,
  LoginDto,
} from '../core/api/lms-api';
import { StorageService } from '../core/services/storage.service';
import { AuthService } from '../core/services/auth.service';

interface AuthState {
  user: GetUserDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
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

    const loadUser = (): Observable<GetUserDto> => {
      patchState(store, { isLoading: true });

      return userClient.getUserProfile().pipe(
        tap({
          next: (user: GetUserDto) => {
            patchState(store, { user, error: null });
          },
          error: (error) => {
            patchState(store, { error: error.message });
          },
          finalize: () => {
            patchState(store, { isLoading: false });
          },
        })
      );
    };

    const signIn = rxMethod<LoginDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((credentials) =>
          authService.signIn(credentials).pipe(
            switchMap(() => loadUser()),
            tap({
              next: () => {
                router.navigate(['']);
              },
              error: (error) => patchState(store, { error: error.message }),
              complete() {
                patchState(store, { isLoading: false });
              },
            })
          )
        )
      )
    );

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
    };
  }),
  withHooks({
    onInit(store) {
      if (store.isAuthenticated() && !store.user()) {
      }
    },
  })
) {}
