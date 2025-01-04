import { LoadingInterceptor } from './../../core/interceptors/loading.interceptor';
import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';
import { AUTH_ROUTES } from '../../core/constants/routes/auth';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: AUTH_ROUTES.login,
        loadComponent: () =>
          import('./pages/login/login.component').then((c) => c.LoginComponent),
      },
    ],
  },
];
