import { Routes } from '@angular/router';
import { COURSES_ROUTES } from '../../core/constants/routes/courses';
import { CourseDetailsResolver } from './resolvers/course-details.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/course-list/course-list.component').then(
        (m) => m.CourseListComponent
      ),
  },
  {
    path: `:${COURSES_ROUTES.courseId}`,
    loadComponent: () =>
      import('./pages/course-form/course-form.component').then(
        (c) => c.CourseFormComponent
      ),
    resolve: { data: CourseDetailsResolver },
  },
];
