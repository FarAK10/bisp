import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  forwardRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroup,
  FormControl,
  Validators,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ScheduleFormValue } from './types/shedule-form';
import { EventType } from '../../../../../../core/constants/events';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { createSelectItem } from '../../../../../../core/utils/object-transform';
import { WeekEnum } from '../../../../../../core/constants/week';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzTimePickerModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ScheduleFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ScheduleFormComponent),
      multi: true,
    },
  ],
})
export class ScheduleFormComponent implements ControlValueAccessor, Validator {
  cdr = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);
  weekDays = createSelectItem(WeekEnum);

  eventTypes = [
    { value: EventType.Lecture, label: 'Lecture' },
    { value: EventType.Seminar, label: 'Seminar' },
  ];

  form = new FormGroup({
    id: new FormControl(null),
    startTime: new FormControl<Date | null>(null, [Validators.required]),
    endTime: new FormControl<Date | null>(null, [Validators.required]),
    dayOfWeek: new FormControl<number | null>(null, [Validators.required]),
    type: new FormControl<EventType | null>(null, [Validators.required]),
    roomNumber: new FormControl('', [Validators.required]),
    lectureId: new FormControl<number | null>(null),
  });

  private onChange: (value: ScheduleFormValue) => void = () => {};
  private onTouched: () => void = () => {};
  validate(control: AbstractControl): ValidationErrors | null {
    // Check if the form is valid
    if (!this.form.valid) {
      return { invalidSchedule: true };
    }

    // Custom validation: Ensure startTime is before endTime
    const { startTime, endTime } = this.form.value;
    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return { invalidTimeRange: 'Start time must be before end time.' };
    }

    return null;
  }

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (this.onChange) {
          this.onChange(value as ScheduleFormValue);
        }
      });
    this.form.markAllAsTouched();
  }

  writeValue(value: ScheduleFormValue): void {
    if (value) {
      this.form.patchValue(value, { emitEvent: false });
      this.cdr.markForCheck();
    }
  }

  registerOnChange(fn: (value: ScheduleFormValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }
}
