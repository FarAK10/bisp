import { Component, computed, effect, inject, model } from '@angular/core';
import { CourseCardComponent } from '../../../../shared/components';
import { AuthStore } from '../../../../store/auth';
import { Role, ROOT_ROUTES } from '../../../../core/constants';
import { CourseControllerClient, EnrollmentResponseDtoStatus, GetCourseDto, Status } from '../../../../core/api/lms-api';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionDirective } from '../../../../shared/directives/role.directive';
import { MessageService } from '../../../../core/services';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { createSelectItem } from '../../../../core/utils/object-transform';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-courses-list',
  standalone: true,
  imports: [CourseCardComponent,NzButtonModule,PermissionDirective,NzSelectModule,FormsModule,CommonModule],
  templateUrl: './my-courses-list.component.html',
  styleUrl: './my-courses-list.component.less'
})
export class MyCoursesListComponent {
  authStore = inject(AuthStore);
  courseClient = inject(CourseControllerClient)
  messageService = inject(MessageService)
  router = inject(Router);
  route = inject(ActivatedRoute)
  statuses = createSelectItem(Status)
  selectedEnrolledStatus = model(Status.ENROLLED)

  role =Role
  selectedRole = this.authStore.selectedRole;

  isProffessor = computed(()=> this.selectedRole()===Role.Professor)
  reloadTrigger$ = new BehaviorSubject(true)
  
 

  studentCourses$ = toObservable(this.selectedEnrolledStatus).pipe(switchMap(status=> {
     return  this.courseClient.getStudentCourses(status)
  }))


  
  
  courses$ = toObservable(this.isProffessor).pipe(
    switchMap((isProff: boolean) => {
      return this.reloadTrigger$.pipe(
        switchMap(() => 
          isProff ? 
            this.courseClient.getProfessorCourses() : 
            this.studentCourses$
        )
      )
    })
  )

  constructor(){
    
  }

  courses = toSignal(this.courses$)
  viewDetails(course:GetCourseDto){
    this.router.navigate([ROOT_ROUTES.courses,course.id],{})

  }
  unEnroll(course:GetCourseDto){
    this.courseClient.unenroll(course.id).subscribe({
      next:()=>{
        this.reloadTrigger$.next(true )
        this.messageService.onNotifySuccess('You have successfully unrolled from '+ course.title )

      },
      error:(err)=>{
           this.messageService.onNotifyError(err.message)
      }
    })
  }
  
}
