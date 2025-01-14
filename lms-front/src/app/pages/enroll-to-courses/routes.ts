import { Routes } from "@angular/router";

export const routes:Routes = [
    {
        path:'',
        loadComponent:()=>import('./pages/courses-to-enroll/courses-to-enroll.component').then(c=>c.CoursesToEnrollComponent)
    }
]