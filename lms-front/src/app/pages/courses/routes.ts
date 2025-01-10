import { Routes } from '@angular/router';
import { COURSES_ROUTES } from '../../core/constants/routes/courses';
import { CourseDetailsResolver } from './resolvers/course-details.resolver';
import { CourseWithLecturesResolver } from './resolvers/course-with-lectures.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/course-list/course-list.component').then(
        (m) => m.CourseListComponent
      ),
  },
  {
    path: `${COURSES_ROUTES.edit}/:${COURSES_ROUTES.courseId}`,
    loadComponent: () =>
      import('./pages/course-form/course-form.component').then(
        (c) => c.CourseFormComponent
      ),
    resolve: { data: CourseDetailsResolver },
  },
  {
    path:`:${COURSES_ROUTES.courseId}`,
    loadComponent:()=> import('./pages/course-details/course-details.component').then(c=>c.CourseDetailsComponent),
    resolve: { data: CourseWithLecturesResolver },

    
  }
];
