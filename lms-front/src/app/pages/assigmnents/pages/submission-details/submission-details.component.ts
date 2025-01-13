import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, take } from 'rxjs';
import { AssignmentsControllerClient, FileParameter, GradeSubmissionDto, SubmissionResponseDto, SubmissionsControllerClient } from '../../../../core/api/lms-api';
import { SUBMISSION_PAGES } from '../../../../core/constants/routes/submission';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthStore } from '../../../../store/auth';
import { ASSIGNMETS_PAGES } from '../../../../core/constants/routes/assignments';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-submission-details',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzButtonModule,
    NzUploadModule,
    NzIconModule,
    NzTagModule,
    NzMessageModule],
  templateUrl: './submission-details.component.html',
  styleUrl: './submission-details.component.less'
})
export class SubmissionDetailsComponent {
  private submissionClient = inject(SubmissionsControllerClient);
  private assignmentClient = inject(AssignmentsControllerClient)
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private destroyRef = inject(DestroyRef);
  private authStore = inject(AuthStore);
  user = this.authStore.user
  
  submission = signal<SubmissionResponseDto | null>(null);

  assignmentId = signal(+this.route.params[ASSIGNMETS_PAGES.assignmnetId])

  assignmentDetails$ =  toObservable(this.assignmentId).pipe(switchMap(assignmentId=> this.assignmentClient.getAssignmentById(assignmentId)))
  assignmentDetails = toSignal(this.assignmentDetails$)
  
  gradeForm = this.fb.group({
    grade: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
    feedback: ['']
  });

  uploadHeaders = {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  };

  canSubmit(): boolean {
    if (!this.assignmentDetails()) return false;
    
    const dueDate = new Date(this.assignmentDetails().dueDate);
    const now = new Date();
    return now <= dueDate;
  }

  ngOnInit() {
    const assignmentId = this.route.snapshot.queryParams['assignmentId'];
    
    if (this.isStudentSubmission()) {
      // Load student's submission and assignment details
      this.loadStudentSubmissionAndDetails(assignmentId);
    } else {
      // Load professor's view of student submission
      const studentId = this.route.snapshot.params[SUBMISSION_PAGES.studentId];
      this.loadSubmission(studentId, assignmentId);
    }
  }
  loadStudentSubmissionAndDetails(assignmentId: string) {
    this.submissionClient.getStudentSubmissionByAssignment(this.user().id,+assignmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.submission.set(response);
        },
        error: () => this.message.error('Failed to load submission details')
      });
  }
  isStudentSubmission(): boolean {
    return this.route.snapshot.url[0]?.path === SUBMISSION_PAGES.submit;
  }

  loadSubmission(studentId: string, assignmentId: string) {
    this.submissionClient.getStudentSubmissionByAssignment(+studentId, +assignmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.submission.set(data);
          if (data.grade) {
            this.gradeForm.patchValue({
              grade: data.grade,
              feedback: data.feedback
            });
          }
        },
        error: () => this.message.error('Failed to load submission')
      });
  }

  submitGrade() {
    if (this.gradeForm.valid && this.submission()) {
      const formValue = this.gradeForm.value;
      const gradeDTO:GradeSubmissionDto  = {
           grade: formValue.grade,
           feedback:formValue.feedback,
      }
      this.submissionClient.gradeSubmission(
        this.submission()!.id,
        gradeDTO
      ).pipe(take(1)).subscribe({
        next: () => {
          this.message.success('Grade submitted successfully');
          this.goBack();
        },
        error: () => this.message.error('Failed to submit grade')
      });
    }
  }

  customUploadRequest = (item: any) => {
    const assignmentId = this.route.snapshot.params['assignmentId'];
    const fileParam: FileParameter = {
      data: item.file,
      fileName: item.file.name
    };
    
    return this.submissionClient.submitAssignment(assignmentId, fileParam)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          item.onSuccess();
          this.message.success('File uploaded successfully');
        },
        error: () => {
          item.onError();
          this.message.error('Failed to upload file');
        }
      });
  };

  beforeUpload = (file: any): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      this.message.error('Only PDF, DOC, DOCX, XLS, XLSX files are allowed!');
      return false;
    }
    
    const isLessThan50M = file.size / 1024 / 1024 < 50;
    if (!isLessThan50M) {
      this.message.error('File must be smaller than 50MB!');
      return false;
    }
    
    return true;
  };

  handleUploadChange(info: any) {
    if (info.file.status === 'done') {
      this.loadSubmission(
        this.route.snapshot.params['studentId'],
        this.route.snapshot.queryParams['assignmentId']
      );
    }
  }

  downloadFile(file: any) {
    this.submissionClient.downloadSubmissionFile(file.id).subscribe(response => {
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalFileName;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  goBack() {
    this.router.navigate(['../'], { 
      relativeTo: this.route,
      queryParamsHandling: 'preserve'
    });
  }

  getFileIcon(mimetype: string): string {
    if (mimetype.includes('pdf')) return 'file-pdf';
    if (mimetype.includes('doc')) return 'file-word';
    if (mimetype.includes('xls')) return 'file-excel';
    return 'file';
  }
}
