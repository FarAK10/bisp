import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { GetCourseDto } from '../../../core/api/lms-api';
import { EventType } from '../../../core/constants/events';
import { WeekEnum } from '../../../core/constants/week';
@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [NzCardModule, CommonModule, NzButtonModule,NzTagModule],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseCardComponent {
  course = input.required<GetCourseDto>();
  week = WeekEnum
  EventType = EventType;

}
