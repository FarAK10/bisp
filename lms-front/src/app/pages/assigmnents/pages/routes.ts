import { Routes } from "@angular/router";
import { ROOT_ROUTES } from "../../../core/constants";
import { SUBMISSION_PAGES } from "../../../core/constants/routes/submission";

export const routes :Routes = [
     {
        path: ROOT_ROUTES.submissions,
        children: [
         {
            path:'',
            loadComponent: ()=> import('./submission-list/submission-list.component').then(c=>c.SubmissionListComponent),

         },
         {
            path: `:${SUBMISSION_PAGES.studentId}`,
            loadComponent:()=>import('./submission-details/submission-details.component').then(c=>c.SubmissionDetailsComponent)
    
         }
        ]
     },
     {
        path: SUBMISSION_PAGES.submit,
        loadComponent:()=>import('./submission-details/submission-details.component').then(c=>c.SubmissionDetailsComponent)
     },
   
]