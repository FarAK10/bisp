import { Routes } from "@angular/router";

export const routes:Routes = [
     {
        path: '',
        loadComponent:()=> import('./pages/my-courses-list/my-courses-list.component').then(c=>c.MyCoursesListComponent)
     }
]