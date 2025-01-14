import { Component, inject, OnInit, signal } from '@angular/core';
import { CourseCardComponent } from '../../../../shared/components';
import { Router, ActivatedRoute } from '@angular/router';
import { CourseControllerClient, GetCourseDto } from '../../../../core/api/lms-api';
import { MessageService } from '../../../../core/services';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courses-to-enroll',
  standalone: true,
  imports: [CourseCardComponent,NzButtonModule,CommonModule],
  templateUrl: './courses-to-enroll.component.html',
  styleUrl: './courses-to-enroll.component.less'
})
export class CoursesToEnrollComponent  implements OnInit{
  courseClient = inject(CourseControllerClient);
  router = inject(Router);
  route = inject(ActivatedRoute);
  messageService = inject(MessageService);
  courses = signal<GetCourseDto[]>([])

  ngOnInit(): void {
    this.getCourses();
  }
  getCourses(){
     this.courseClient.getCoursesToEnroll().subscribe(courses=>{
       this.courses.set(courses)
     })
  }


   enroll(course:GetCourseDto):void {
    this.courseClient.enroll(course.id).subscribe({
      next:()=> {
        this.messageService.onNotifySuccess('Course Enrolled successfully');
        this.getCourses();
      },
      error:(err)=> {
        console.log(err)
        this.messageService.onNotifyError(err.message)
      }
    })
    }
}
