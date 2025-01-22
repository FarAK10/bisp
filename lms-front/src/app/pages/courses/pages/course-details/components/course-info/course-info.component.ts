import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CourseWithLecturesResponseDto } from '../../../../../../core/api/lms-api';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { CommonModule } from '@angular/common';
import { WeekEnum } from '../../../../../../core/constants/week';
import { EventType } from '../../../../../../core/constants/events';

@Component({
  selector: 'app-course-info',
  standalone: true,
  imports: [NzAvatarModule,NzCardModule,NzDescriptionsModule,CommonModule],
  templateUrl: './course-info.component.html',
  styleUrl: './course-info.component.less',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class CourseInfoComponent {
   course = input.required<CourseWithLecturesResponseDto>()
   weeksENum = WeekEnum
   event  = EventType
}
