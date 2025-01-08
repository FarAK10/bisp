import { buildNavigation } from '../../shared/utils/navigation';
import { AppRoute, NavigationItem } from '../../types/navigation';
import { Role } from './roles';
import { ROOT_ROUTES } from './routes';

export const APP_ROUTES: AppRoute[] = [
  {
    path: ROOT_ROUTES.users,
    loadChildren: () =>
      import('../../pages/users/routes').then((m) => m.routes),
    title: 'Users',
    icon: 'user',
    roles: [Role.Admin],
  },
  {
    path: ROOT_ROUTES.courses,
    loadChildren: () =>
      import('../../pages/courses/routes').then((m) => m.routes),
    title: 'Courses',
    icon: 'book',
    roles: [Role.Admin, Role.Professor],
  },
];
export const NAVIGATION: NavigationItem[] = buildNavigation(APP_ROUTES);
