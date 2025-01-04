import { Routes } from '@angular/router';
import { AppRoute, NavigationItem } from '../../types/navigation';
export function buildNavigation(routes: AppRoute[]): NavigationItem[] {
  return routes.map((route) => ({
    title: route.title,
    icon: route.icon,
    url: `/${route.path}`, // Ensure proper URL formatting
    roles: route.roles,
    children: route.children ? buildNavigation(route.children) : undefined,
  }));
}

export function buildRoutes(appRoutes: AppRoute[]): Routes {
  return appRoutes.map((route) => {
    const angularRoute: any = {
      path: route.path,
      loadChildren: route.loadChildren,
      data: { roles: route.roles },
    };

    if (route.children && route.children.length > 0) {
      angularRoute.children = buildRoutes(route.children);
    }

    return angularRoute;
  });
}
