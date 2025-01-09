import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import {
  CourseControllerClient,
  CreateCourseDto,
  GetCourseDto,
  Role,
  UpdateCourseDto,
  UserControllerClient,
} from '../../../../core/api/lms-api';
import { map, startWith } from 'rxjs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { MessageService, ProgressService } from '../../../../core/services';
import { Router, ActivatedRoute } from '@angular/router';
import { COURSES_ROUTES } from '../../../../core/constants/routes/courses';
import { toSignal } from '@angular/core/rxjs-interop';
import { ScheduleFormValue } from './component/schedule-form/types/shedule-form';
import { ScheduleFormComponent } from './component/schedule-form/schedule-form.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [
    NzCardModule,
    NzButtonModule,
    ReactiveFormsModule,
    CommonModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    ScheduleFormComponent,
  ],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseFormComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  loaderService = inject(ProgressService);
  userClient = inject(UserControllerClient);
  courseClient = inject(CourseControllerClient);
  messageService = inject(MessageService);
  courseId = signal(+this.route.snapshot.params[COURSES_ROUTES.courseId]);
  isEdit = computed(() => !!this.courseId());
  label = computed(() => (this.isEdit() ? 'Edit' : 'Create'));
  isLoading = this.loaderService.loading;
  resolvedData = signal(this.route.snapshot.data['data']);
  professors = computed(() => this.resolvedData()?.professors);
  courseDetails: Signal<GetCourseDto> = computed(
    () => this.resolvedData()?.courseDetails
  );

  courseForm = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.maxLength(100),
    ]),
    description: new FormControl('', [
      Validators.required,
      Validators.maxLength(500),
    ]),
    professorId: new FormControl(null, [Validators.required]),

    schedules: new FormArray<FormControl<ScheduleFormValue | null>>([]),
  });

  ngOnInit(): void {
    if (this.isEdit()) {
      const course = this.courseDetails();
      this.courseForm.patchValue({
        professorId: course.professor.id,
        description: course.description,
        title: course.title,
      });
      course.schedules?.forEach((schedule) => {
        this.addSchedule();
        const lastIndex = this.schedules.length - 1;
        this.schedules.at(lastIndex).patchValue(schedule);
      });
    }
  }
  get schedules() {
    return this.courseForm.get('schedules') as FormArray;
  }

  addSchedule() {
    this.schedules.push(
      new FormControl<ScheduleFormValue | null>(null, Validators.required)
    );
  }

  removeSchedule(index: number) {
    this.schedules.removeAt(index);
  }
  submit(): void {
    if (this.isEdit()) {
      this.editCourse();
    } else {
      this.createCourse();
    }
  }

  private createCourse(): void {
    const formValue = this.courseForm.value;
    const courseDTO: CreateCourseDto = {
      description: formValue.description,
      professorId: formValue.professorId,
      title: formValue.title,
      schedules: formValue.schedules,
    };
    this.courseClient.create(courseDTO).subscribe({
      next: () => {
        this.messageService.onNotifySuccess('Course created successfully');
        this.back();
      },
      error: () => {
        this.messageService.onNotifyError('Failed to create course');
      },
    });
  }

  back(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
  private editCourse(): void {
    const formValue = this.courseForm.value;

    const newSchedules = formValue.schedules.filter((schedule) => !schedule.id);
    const updateCourses = formValue.schedules.filter((schedule) => schedule.id);
    const courseDTO: UpdateCourseDto = {
      id: this.courseId(),
      description: formValue.description,
      professorId: formValue.professorId,
      title: formValue.title,
      updatedSchedules: updateCourses,
      newSchedules: newSchedules,
    };
    this.courseClient.update(this.courseId(), courseDTO).subscribe({
      next: () => {
        this.messageService.onNotifySuccess('Course updated successfully');
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.messageService.onNotifyError(err.message);
      },
    });
  }
}
