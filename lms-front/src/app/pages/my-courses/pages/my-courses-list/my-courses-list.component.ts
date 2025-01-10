import { Component } from '@angular/core';
import { CourseCardComponent } from '../../../../shared/components';

@Component({
  selector: 'app-my-courses-list',
  standalone: true,
  imports: [CourseCardComponent],
  templateUrl: './my-courses-list.component.html',
  styleUrl: './my-courses-list.component.less'
})
export class MyCoursesListComponent {
  
}
