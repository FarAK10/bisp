import { Routes } from "@angular/router";
import { ASSIGNMETS_PAGES } from "../../core/constants/routes/assignments";
import { ROOT_ROUTES } from "../../core/constants";

export const routes:Routes = [
     {
        path: `:${ASSIGNMETS_PAGES.assignmnetId}`,
        loadChildren:()=> import('./pages/routes').then(r=>r.routes)
     }
]