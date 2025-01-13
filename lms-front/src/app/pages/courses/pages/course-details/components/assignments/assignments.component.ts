import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AssignmentFileResponseDto, AssignmentFilesControllerClient, AssignmentResponseDto, AssignmentsControllerClient, FileParameter, GetUserDto, LectureDto, LectureMaterialsControllerClient, LecturesControllerClient, Role } from '../../../../../../core/api/lms-api';
import { COURSES_ROUTES } from '../../../../../../core/constants/routes/courses';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FileService } from '../../../../../../core/services/file.service';
import { AuthStore } from '../../../../../../store/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AssignmentFormComponent, IAssignmentFormData } from './components/assignment-form/assignment-form.component';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { take } from 'rxjs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { ROOT_ROUTES } from '../../../../../../core/constants';
import { PermissionDirective } from '../../../../../../shared/directives/role.directive';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [NzCollapseModule,NzButtonModule,NzBadgeModule,CommonModule,NzIconModule,NzModalModule,NzUploadModule,NzTagModule,NzPopconfirmModule,PermissionDirective],
  templateUrl: './assignments.component.html',
  styleUrl: './assignments.component.less',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class AssignmentsComponent implements OnInit {
route = inject(ActivatedRoute)
  professor = input.required<GetUserDto>()
  lectures = signal<LectureDto[]>([]);
  courseId = signal(+this.route.snapshot.params[COURSES_ROUTES.courseId])
  private authStore = inject(AuthStore);
  private message = inject(NzMessageService);
  private assignmentsClient = inject(AssignmentsControllerClient);
  private  assignmentFilesClient = inject(AssignmentFilesControllerClient)
  private destroyRef = inject(DestroyRef)
  private fileService = inject(FileService)
  private modalService = inject(NzModalService);
  private router = inject(Router)

  userRole = this.authStore.selectedRole

  user = this.authStore.user
  isSelfTaughtCourse = computed(()=> this.userRole()=== Role.Professor && this.professor().id ===this.user().id )
  assignments = signal<AssignmentResponseDto[]>([])
  uploadHeaders = {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  };
  loadAssignments() {
    this.assignmentsClient.getAssignmentsByCourse(this.courseId()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(assignments=>{
       this.assignments.set(assignments)
    })
  
  }
  goToAssignmnetDetails(assignment:AssignmentResponseDto):void {
    this.router.navigate([ROOT_ROUTES.assignments,assignment.id]);

  }
  viewSubmissions(assignment:AssignmentResponseDto):void {
    this.router.navigate([ROOT_ROUTES.assignments,assignment.id,ROOT_ROUTES.submissions]);
  }
  customUploadRequest = (assignmentId: number) => {
    return (item: any) => {
      const fileParam: FileParameter = {
        data: item.file,
        fileName: item.file.name
      };
      
      return this.assignmentFilesClient.uploadAssignmentFile(assignmentId, fileParam)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            item.onSuccess();
            this.message.success('File uploaded successfully');
            this.loadAssignments();
          },
          error: (error) => {
            item.onError(error);
            this.message.error('Failed to upload file');
            console.error('Upload error:', error);
          }
        });
    };
  };

  ngOnInit(): void {
    this.loadAssignments();
  }
  beforeUpload = (file: NzUploadFile): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type!)) {
      this.message.error('You can only upload PDF, DOC, DOCX, XLS, XLSX files!');
      return false;
    }
    
    const isLessThan50M = file.size! / 1024 / 1024 < 50;
    if (!isLessThan50M) {
      this.message.error('File must be smaller than 50MB!');
      return false;
    }
    
    return true;
  };
  addAssignment() {
    const data :IAssignmentFormData = {
      courseId: this.courseId(),
      assignment: null
    }
    const modal = this.modalService.create({
      nzTitle: 'Create New Assignment',
      nzContent: AssignmentFormComponent,
      nzFooter: null,
      nzWidth: 720,
      nzData:data,
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.loadAssignments();
      }
    });
  }

  deleteAssignment(assignmentId: number) {
    this.assignmentsClient.deleteAssignment(assignmentId).subscribe(
      () => {
        this.message.success('Assignment deleted successfully');
        this.loadAssignments();
      },
      (error) => {
        console.error('Error deleting assignment', error);
        this.message.error('Failed to delete assignment');
      }
    );
  }
  
  deleteAssignmentFile(assignmentId: number, fileId: number) {
    this.assignmentFilesClient.deleteFileById(fileId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.message.success('File deleted successfully');
          this.loadAssignments();
        },
        error: (error) => {
          this.message.error('Failed to delete file');
          console.error('Error:', error);
        }
      });
  }
  getFileIcon(mimetype: string): string {
    if (mimetype.includes('pdf')) return 'file-pdf';
    if (mimetype.includes('image')) return 'file-image';
    if (mimetype.includes('video')) return 'video-camera';
    return 'file';
  }

  editAssignment(assigmnet:AssignmentResponseDto):void{
    const data :IAssignmentFormData = {
      courseId: this.courseId(),
      assignment: assigmnet
    }
    const modal = this.modalService.create({
      nzTitle: 'Create New Assignment',
      nzContent: AssignmentFormComponent,
      nzFooter: null,
      nzWidth: 720,
      nzData:data,
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.loadAssignments();
      }
    });
  }
  handleUploadChange(event: NzUploadChangeParam): void {
    if (event.type === 'error') {
      this.message.error('Failed to upload file');
    }
  }
  downloadAssignmentFile(file:AssignmentFileResponseDto):void {
      this.assignmentFilesClient.downloadAssignmentFile(file.id).subscribe(downloadedFile=>{
        this.fileService.downloadFile(downloadedFile.data,file.originalFileName)
      })

  }
}
