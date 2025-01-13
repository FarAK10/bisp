import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseWithLecturesResponseDto } from '../../../../core/api/lms-api';
import { CommonModule } from '@angular/common';
import { CourseLecturesComponent } from './components/course-lectures/course-lectures.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { CourseInfoComponent } from './components/course-info/course-info.component';
import { AssignmentsComponent } from './components/assignments/assignments.component';
import { AssignmentFormComponent } from "./components/assignments/components/assignment-form/assignment-form.component";

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, CourseInfoComponent, CourseLecturesComponent, NzCardModule, NzTabsModule, AssignmentsComponent, AssignmentFormComponent],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.less'
})
export class CourseDetailsComponent {
  router = inject(Router);
  route = inject(ActivatedRoute)
  course =signal<CourseWithLecturesResponseDto>(this.route.snapshot.data['data']);
}
