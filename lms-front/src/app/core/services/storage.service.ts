import { Injectable } from '@angular/core';
import { STORAGE_KEY } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  get accessToken(): string {
    return localStorage.getItem(STORAGE_KEY.access_token);
  }

  set accessToken(accessToken: string) {
    localStorage.setItem(STORAGE_KEY.access_token, accessToken);
  }

  get refreshToken(): string {
    return localStorage.getItem(STORAGE_KEY.refresh_token);
  }

  set refreshToken(accessToken: string) {
    localStorage.setItem(STORAGE_KEY.refresh_token, accessToken);
  }

  removeAccessToken(): void {
    localStorage.removeItem(STORAGE_KEY.access_token);
  }

  removeRefreshToken(): void {
    localStorage.removeItem(STORAGE_KEY.refresh_token);
  }
}
