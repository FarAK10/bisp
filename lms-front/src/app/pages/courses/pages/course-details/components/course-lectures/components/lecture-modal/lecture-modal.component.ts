import { Component, computed, inject, input, output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LectureDto, LecturesControllerClient, UpdateLectureDto } from '../../../../../../../../core/api/lms-api';
import { MessageService } from '../../../../../../../../core/services';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
interface ModalData {
  courseId: number;
  lecture?: LectureDto;
}
@Component({
  selector: 'app-lecture-modal',
  standalone: true,
  imports: [ReactiveFormsModule,NzInputModule,],
  templateUrl: './lecture-modal.component.html',
  styleUrl: './lecture-modal.component.less'
})
export class LectureModalComponent {
  fb = inject(FormBuilder);
  readonly modalData = inject<ModalData>(NZ_MODAL_DATA);
  private modal = inject(NzModalRef); 

  lectureClient = inject(LecturesControllerClient);
  messageService = inject(MessageService);
  courseId = input<number>(this.modalData.courseId);
  lecture = input<LectureDto>(this.modalData.lecture);
  close = output<void>();
  save = output<UpdateLectureDto>();

  lectureForm: FormGroup =this.fb.group({
    title: ['', Validators.required],
    description: ['']
  });
  isEdit = computed(() => !!this.lecture());
  titleControl = computed(() => this.lectureForm.get('title'));

 

  ngOnInit() {
    if (this.lecture()) {
      this.lectureForm.patchValue({
        title: this.lecture()?.title,
        description: this.lecture()?.description
      });
    }
  }

  submitForm() {
    if (this.lectureForm.valid) {
      const formData = this.lectureForm.value;
      
      const request = this.isEdit()
        ? this.lectureClient.updateLecture(this.lecture()!.id, formData)
        : this.lectureClient.createLecture(this.courseId(), formData);

      request.subscribe({
        next: (response) => {
          this.messageService.onNotifySuccess(`Lecture ${this.isEdit() ? 'updated' : 'created'} successfully`);
          this.save.emit(response);
          this.modal.close(true);
          
        },
        error: (error) => {
          this.messageService.onNotifySuccess('Failed to save lecture');
          console.error('Error:', error);
        }
      });
    }
  }
}
