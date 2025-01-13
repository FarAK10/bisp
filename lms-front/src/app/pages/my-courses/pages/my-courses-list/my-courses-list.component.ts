import { Component, computed, inject } from '@angular/core';
import { CourseCardComponent } from '../../../../shared/components';
import { AuthStore } from '../../../../store/auth';
import { Role, ROOT_ROUTES } from '../../../../core/constants';
import { CourseControllerClient, GetCourseDto } from '../../../../core/api/lms-api';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-my-courses-list',
  standalone: true,
  imports: [CourseCardComponent,NzButtonModule],
  templateUrl: './my-courses-list.component.html',
  styleUrl: './my-courses-list.component.less'
})
export class MyCoursesListComponent {
  authStore = inject(AuthStore);
  courseClient = inject(CourseControllerClient)
  router = inject(Router);
  route = inject(ActivatedRoute)

  selectedRole = this.authStore.selectedRole;

  isProffessor = computed(()=> this.selectedRole()===Role.Professor)

  
  courses$ = toObservable(this.isProffessor).pipe(
     switchMap((isProff:boolean)=> {
       return isProff?  this.courseClient.getProfessorCourses() : this.courseClient.getStudentCourses();
     })
  )

  courses = toSignal(this.courses$)
  viewDetails(course:GetCourseDto){
    this.router.navigate([ROOT_ROUTES.courses,course.id],{})

  }
  
}
