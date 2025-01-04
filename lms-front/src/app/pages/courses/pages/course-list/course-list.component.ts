import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseListComponent {

}
