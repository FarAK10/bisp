import { Routes } from '@angular/router';
import { UserRoutes } from '../../core/constants/routes/users';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-list/user-list.component').then(
        (c) => c.UserListComponent
      ),
  },
  {
    path: UserRoutes.create,
    loadComponent: () =>
      import('./pages/user-form/user-form.component').then(
        (c) => c.UserFormComponent
      ),
  },
  {
    path: `:${UserRoutes.userId}`,
    loadComponent: () =>
      import('./pages/user-form/user-form.component').then(
        (c) => c.UserFormComponent
      ),
  },
];
