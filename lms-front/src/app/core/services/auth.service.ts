// core/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthControllerClient,
  RefreshTokenDto,
  TokenResponseDto,
  LoginDto,
} from '../api/lms-api';
import { StorageService } from './storage.service';
import { Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authClient = inject(AuthControllerClient);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  /**
   * Sign in: calls login endpoint and stores the tokens.
   */
  signIn(credentials: LoginDto): Observable<TokenResponseDto> {
    return this.authClient.login(credentials).pipe(
      tap((response: TokenResponseDto) => {
        // Save tokens
        this.storageService.accessToken = response.accessToken;
        this.storageService.refreshToken = response.refreshToken;
      })
    );
  }

  /**
   * Refresh token: calls refresh endpoint and updates tokens.
   */
  refreshToken(): Observable<string> {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: this.storageService.refreshToken,
    };

    return this.authClient.refreshTokens(refreshTokenDto).pipe(
      tap((response: TokenResponseDto) => {
        this.storageService.accessToken = response.accessToken;
        this.storageService.refreshToken = response.refreshToken;
      }),
      // Return the new access token for chaining
      map(() => this.storageService.accessToken!)
    );
  }

  /**
   * Clear tokens and redirect to login (or wherever).
   */
  signOut(): void {
    this.storageService.removeAccessToken();
    this.storageService.removeRefreshToken();
    this.router.navigate(['/login']); // Or your desired route
  }
}
