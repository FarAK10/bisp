import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AssignmentResponseDto, AssignmentsControllerClient, CreateAssignmentDto, UpdateAssignmentDto } from '../../../../../../../../core/api/lms-api';
import { MessageService } from '../../../../../../../../core/services';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

export interface IAssignmentFormData {
  assignment?: AssignmentResponseDto;
  courseId: number;
}

@Component({
  selector: 'app-assignment-form',
  standalone: true,
  imports: [NzFormModule, NzInputModule, ReactiveFormsModule, NzUploadModule, NzDatePickerModule, NzButtonModule],
  templateUrl: './assignment-form.component.html',
  styleUrl: './assignment-form.component.less',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class AssignmentFormComponent implements OnInit {
  assignmentForm = new FormGroup({
    title: new FormControl('', { validators: [Validators.required] }),
    description: new FormControl(''),
    dueDate: new FormControl(new Date(), [Validators.required]),
  });

  assignmentClient = inject(AssignmentsControllerClient);
  fileList: any[] = [];
  messageService = inject(MessageService);
  data = inject<IAssignmentFormData>(NZ_MODAL_DATA);
  modalRef = inject(NzModalRef);

  ngOnInit() {
    if (this.data.assignment) {
      this.assignmentForm.patchValue({
        title: this.data.assignment.title,
        description: this.data.assignment.description,
        dueDate: new Date(this.data.assignment.dueDate)
      });
      this.fileList = this.data.assignment.files || [];
    }
  }

  submitForm(): void {
    if (this.assignmentForm.valid) {
      const formValue = this.assignmentForm.value;

      if (this.data.assignment) {
        this.updateAssignment(formValue);
      } else {
        this.createAssignment({dueDate:formValue.dueDate,title:formValue.title, description:formValue.description});
      }
    }
  }

 
  createAssignment(assignment: CreateAssignmentDto) {
    this.assignmentClient.createAssignment(this.data.courseId, assignment).subscribe(
      {
        next:  (response) => {
          this.messageService.onNotifySuccess('Assignment created successfully');
          this.modalRef.close(response);
  
        },
        error: (error) => {
          this.messageService.onNotifyError('Failed to create assignment');
          console.error('Error creating assignment:', error);
        }
      }
     
      
    );
  }

  updateAssignment(assignment: UpdateAssignmentDto) {
    this.assignmentClient.updateAssignment(this.data.assignment.id, assignment).subscribe(
      (response) => {
        this.messageService.onNotifySuccess('Assignment updated successfully');
        this.modalRef.close(response);
      },
      (error) => {
        this.messageService.onNotifyError('Failed to update assignment');
        console.error('Error updating assignment:', error);
      }
    );
  }

  handleFileChange(info: NzUploadChangeParam): void {
    this.fileList = info.fileList;
  }
}