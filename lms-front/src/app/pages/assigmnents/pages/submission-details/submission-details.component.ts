import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, take, tap } from 'rxjs';
import { AssignmentFileResponseDto, AssignmentFilesControllerClient, AssignmentsControllerClient, FileParameter, GPTFeedbackDto, GradeSubmissionDto, SubmissionFileResponseDto, SubmissionResponseDto, SubmissionsControllerClient } from '../../../../core/api/lms-api';
import { SUBMISSION_PAGES } from '../../../../core/constants/routes/submission';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthStore } from '../../../../store/auth';
import { ASSIGNMETS_PAGES } from '../../../../core/constants/routes/assignments';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FileService } from '../../../../core/services/file.service';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { GptFeedbackComponent } from './components/gpt-feedback/gpt-feedback.component';

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
    NzPopconfirmModule,
    NzIconModule,
    NzTagModule,
    GptFeedbackComponent,
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
  private fileService = inject(FileService)
  private assignmentFileClient = inject(AssignmentFilesControllerClient)

  user = this.authStore.user
  
  submission = signal<SubmissionResponseDto | null>(null);

  assignmentId = signal(+this.route.snapshot.params[ASSIGNMETS_PAGES.assignmnetId])

  assignmentDetails$ =  toObservable(this.assignmentId).pipe(tap(console.log),switchMap(assignmentId=> this.assignmentClient.getAssignmentById(assignmentId)))
  assignmentDetails = toSignal(this.assignmentDetails$)

   // New signals for GPT analysis feedback
   gptFeedback = signal<GPTFeedbackDto | null>(null);
   loadingAnalysis = signal(false);
  
  gradeForm = this.fb.group({
    grade: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
    feedback: ['']
  });
  studentId = signal(+this.route.snapshot.params[SUBMISSION_PAGES.studentId])
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
    this.loadData()
  }
  triggerAnalysis() {
    this.loadingAnalysis.set(true);
    this.submissionClient.analyzeSubmission(this.assignmentId())
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (feedback: GPTFeedbackDto) => {
          this.gptFeedback.set(feedback);
          this.loadingAnalysis.set(false);
          this.message.success('Submission analyzed successfully!');
        },
        error: () => {
          this.loadingAnalysis.set(false);
          this.message.error('Failed to analyze submission');
        }
      });
  }
  loadData():void {
    console.log(this.route.snapshot.params)

    if (this.isStudentSubmission()) {
      this.loadStudentSubmissionAndDetails();
    } else {
      console.log(this.route.snapshot.params)
    
      this.loadSubmission(this.studentId(), this.assignmentId());
    }
  }
  loadStudentSubmissionAndDetails() {
    this.submissionClient.getStudentSubmissionByAssignment(this.user().id,this.assignmentId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.submission.set(response);
        },
        error: () => this.message.error('Failed to load submission details')
      });
  }
  isStudentSubmission(): boolean {
    return  !this.studentId();
  }
  downloadAssignmentFile(file:AssignmentFileResponseDto):void {
     this.assignmentFileClient.downloadAssignmentFile(file.id).subscribe(
       {
        next: (res)=> {
             this.fileService.downloadFile(res.data,file.originalFileName)
        },
        error: (err)=> {
           this.message.error(err.message)
        }
       }
     )

  }

  deleteSumbissionFile(fileId:number):void {
      this.submissionClient.deleteSubmissionFile(fileId).subscribe(
         {
          next:()=> {
             this.message.success("Submission is deleted!")
             this.loadData();
          },
          error:()=> {
             this.message.error("Oops smth went wrong!")
          }
         }
      )
   
  }

  loadSubmission(studentId: number, assignmentId:  number) {
    this.submissionClient.getStudentSubmissionByAssignment(+studentId,this.assignmentId()) 
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
    const fileParam: FileParameter = {
      data: item.file,
      fileName: item.file.name
    };
    
    return this.submissionClient.submitAssignment(this.assignmentId(), fileParam)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadData();
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
  handleUploadChange(event: NzUploadChangeParam): void {
    if (event.type === 'error') {
      this.message.error('Failed to upload file');
    }
  }

  downloadFile(file: SubmissionFileResponseDto) {
    this.submissionClient.downloadSubmissionFile(file.id).pipe(take(1)).subscribe(response => {
        this.fileService.downloadFile(response.data,file.originalFileName)
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
