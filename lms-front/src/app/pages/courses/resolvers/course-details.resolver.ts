import { inject, Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CourseControllerClient,
  UserControllerClient,
} from '../../../core/api/lms-api';
import { Role } from '../../../core/constants';

@Injectable({
  providedIn: 'root',
})
export class CourseDetailsResolver implements Resolve<any> {
  courseClient = inject(CourseControllerClient);
  userClient = inject(UserControllerClient);

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const courseId = route.params['courseId'];
    const courseDetails$ = courseId
      ? this.courseClient.getById(+courseId).pipe(catchError(() => of(null)))
      : of(null);

    const professors$ = this.userClient
      .getAllUsers(undefined, undefined, Role.Professor)
      .pipe(
        map((res) => res.data),
        catchError(() => of([]))
      );

    return forkJoin({
      courseDetails: courseDetails$,
      professors: professors$,
    });
  }
}
