import {
  ChangeDetectionStrategy,
  Component,
  signal,
  input,
} from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { GetCourseDto } from '../../../../../../core/api/lms-api';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [NzCardModule],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseCardComponent {
  course = input.required<GetCourseDto>();

  enrollInCourse() {}
  viewCourse() {}
}
