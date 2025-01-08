import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, switchMap } from 'rxjs';
import {
  UserControllerClient,
  GetUserDto,
  CourseControllerClient,
  GetCourseDto,
} from '../../../../core/api/lms-api';
import { MessageService } from '../../../../core/services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CourseCardComponent } from './components/course-card/course-card.component';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    NzTableModule,
    CommonModule,
    FormsModule,
    NzButtonModule,
    CourseCardComponent,
  ],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseListComponent {
  courseClient = inject(CourseControllerClient);
  router = inject(Router);
  route = inject(ActivatedRoute);
  messageService = inject(MessageService);
  page$ = new BehaviorSubject<number>(1);
  pageSize$ = new BehaviorSubject<number>(10);
  updateTable$ = new BehaviorSubject<boolean>(true);
  tableRes$ = combineLatest([
    this.page$,
    this.pageSize$,
    this.updateTable$,
  ]).pipe(
    switchMap(([page, pageSize]) => this.courseClient.getAll(page, pageSize))
  );
  tableRes = toSignal(this.tableRes$);
  courses = computed(() => this.tableRes()?.data);

  total = computed(() => this.tableRes()?.count);
  onPageIndexChange(index: number) {
    this.page$.next(index);
  }
  onPageSizeChange(size: number) {
    this.pageSize$.next(size);
  }
  onCreate(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }
  onEdit(course: GetCourseDto): void {
    this.router.navigate([course.id], { relativeTo: this.route });
  }
  onDelete(course: GetCourseDto): void {
    this.courseClient.remove(course.id).subscribe(() => {
      this.messageService.onNotifySuccess('Course deleted successfully');
      this.updateTable$.next(true);
    });
  }
}
