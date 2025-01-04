import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseFormComponent {

}
