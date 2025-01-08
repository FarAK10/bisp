import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { GetCourseDto } from '../../../../../../core/api/lms-api';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [NzCardModule, CommonModule, NzButtonModule],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseCardComponent {
  course = input.required<GetCourseDto>();
  onViewCourse = output<GetCourseDto>();

  viewCourse() {
    this.onViewCourse.emit(this.course());
  }
}
