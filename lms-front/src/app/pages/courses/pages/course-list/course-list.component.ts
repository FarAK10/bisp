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
import { CourseCardComponent } from '../../../../shared/components';
import { COURSES_ROUTES } from '../../../../core/constants/routes/courses';
import { Role } from '../../../../core/constants';
import { PermissionDirective } from '../../../../shared/directives/role.directive';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    NzTableModule,
    CommonModule,
    FormsModule,
    NzButtonModule,
    CourseCardComponent,
    PermissionDirective,
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
  role = Role
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
    this.router.navigate([COURSES_ROUTES.edit,course.id], { relativeTo: this.route });
  }
  viewDetails(course: GetCourseDto): void {
    this.router.navigate([course.id], { relativeTo: this.route });
  }  
  onDelete(course: GetCourseDto): void {
    this.courseClient.remove(course.id).subscribe(() => {
      this.messageService.onNotifySuccess('Course deleted successfully');
      this.updateTable$.next(true);
    });
  }
  enroll(course:GetCourseDto):void {
  this.courseClient.enroll(course.id).subscribe({
    next:()=> {
      this.messageService.onNotifySuccess('Course deleted successfully');
    },
    error:(err)=> {
      console.log(err)
      this.messageService.onNotifyError(err.message)
    }
  })
  }
}
