import { Routes } from '@angular/router';
import { Role, ROOT_ROUTES } from './core/constants';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { BaseLayoutComponent } from './layouts/base-layout/base-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { APP_ROUTES } from './core/constants/navigation';
import { buildRoutes } from './shared/utils/navigation';
const protectedRoutes: Routes = buildRoutes(APP_ROUTES);

export const routes: Routes = [
  {
    path: ROOT_ROUTES.auth,
    loadChildren: () => import('./pages/auth/routes').then((m) => m.routes),
  },

  {
    path: '',
    component: BaseLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [RolesGuard],
    children: protectedRoutes,
  },
];
