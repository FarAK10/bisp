import { Routes } from "@angular/router";
import { COURSES_ROUTES } from "../../core/constants/routes/courses";

export const routes:Routes = [
     {
        path: '',
        loadComponent:()=> import('./pages/my-courses-list/my-courses-list.component').then(c=>c.MyCoursesListComponent)
     },
     {
      path: `:${COURSES_ROUTES.courseId}`,
      loadComponent: ()=> import('./pages/course-details/course-details.component').then(c=> c.CourseDetailsComponent)
     }
]