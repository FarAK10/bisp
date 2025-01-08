import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { API_BASE_URL } from './core/api/lms-api';
import { JWT_OPTIONS, JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { jwtOptionsFactory } from './core/utils/jwt-factory';
import { StorageService } from './core/services/storage.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([LoadingInterceptor, AuthInterceptor])),
    {
      provide: API_BASE_URL,
      useValue: 'http://localhost:3000',
    },
    importProvidersFrom(
      JwtModule.forRoot({
        jwtOptionsProvider: {
          provide: JWT_OPTIONS,
          useFactory: jwtOptionsFactory,
          deps: [StorageService],
        },
      })
    ),
    provideNzI18n(en_US),
    importProvidersFrom(BrowserAnimationsModule),
  ],
};
