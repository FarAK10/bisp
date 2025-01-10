import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { FileParameter, GetUserDto, LectureDto, LectureMaterialsControllerClient, LecturesControllerClient } from '../../../../../../core/api/lms-api';
import { LectureModalComponent } from './components/lecture-modal/lecture-modal.component';
import { take, takeUntil } from 'rxjs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ActivatedRoute } from '@angular/router';
import { COURSES_ROUTES } from '../../../../../../core/constants/routes/courses';
import { AuthStore } from '../../../../../../store/auth';
import { Role } from '../../../../../../core/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FileService } from '../../../../../../core/services/file.service';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'app-course-lectures',
  standalone: true,
  imports: [
    CommonModule,
    NzCollapseModule,
    NzBadgeModule,
    NzIconModule,
    NzUploadModule,
    NzModalModule,
    NzPopconfirmModule
  ],
  templateUrl: './course-lectures.component.html',
  styleUrl: './course-lectures.component.less'
})
export class CourseLecturesComponent  implements OnInit{
  route = inject(ActivatedRoute)
  professor = input.required<GetUserDto>()
  lectures = signal<LectureDto[]>([]);
  courseId = signal(+this.route.snapshot.params[COURSES_ROUTES.courseId])
  private modal = inject(NzModalService);
  private authStore = inject(AuthStore);
  private message = inject(NzMessageService);
  private lectureClient = inject(LecturesControllerClient);
  private materialClient = inject(LectureMaterialsControllerClient);
  private destroyRef = inject(DestroyRef)
  private fileService = inject(FileService)
  userRole = this.authStore.selectedRole
  user = this.authStore.user
  isSelfTaughtCourse = computed(()=> this.userRole()=== Role.Professor && this.professor().id ===this.user().id )

  uploadHeaders = {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  };

  ngOnInit(): void {
    this.loadLectures();
  }

  private loadLectures() {
    this.lectureClient.getLecturesByCourse(this.courseId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lectures) => {
          this.lectures.set(lectures);
        },
        error: (error) => {
          this.message.error('Failed to load lectures');
          console.error('Error:', error);
        }
      });
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

  // In your component file:
  customUploadRequest = (lectureId: number) => {
    return (item: any) => {
      const fileParam: FileParameter = {
        data: item.file,
        fileName: item.file.name,
        
      };
      
      return this.materialClient.uploadMaterial(lectureId, fileParam)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            item.onSuccess();
            this.message.success('File uploaded successfully');
            this.loadLectures();
          },
          error: (error) => {
            item.onError(error);
            this.message.error('Failed to upload file');
            console.error('Upload error:', error);
          }
        });
    };
  };

  openLectureModal(lecture?: LectureDto) {
    const modalRef = this.modal.create({
      nzTitle: lecture ? 'Edit Lecture' : 'Add New Lecture',
      nzContent: LectureModalComponent,
      nzFooter: null,
      nzData: {
        courseId: this.courseId(),
        lecture: lecture
      }
    });

    modalRef.afterClose.pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((result) => {
      if (result) {
        this.loadLectures();
      }
    });
  }

  editLecture(event: Event, lecture: LectureDto) {
    event.stopPropagation();
    this.openLectureModal(lecture);
  }

  deleteLecture( lectureId: number) {
    this.lectureClient.deleteLecture(lectureId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.message.success('Lecture deleted successfully');
          this.loadLectures();
        },
        error: (error) => {
          this.message.error('Failed to delete lecture');
          console.error('Error:', error);
        }
      });
  }

  handleUploadChange(event: NzUploadChangeParam): void {
    if (event.type === 'error') {
      this.message.error('Failed to upload file');
    }
  }

  downloadMaterial(materialId: number,fileName:string) {
    this.materialClient.downloadMaterial(materialId).subscribe(res=> {
      console.log(res)
        this.fileService.downloadFile(res.data,fileName)
    })
  }

  deleteMaterial( lectureId: number, materialId: number) {
    this.materialClient.deleteMaterial(materialId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.message.success('Material deleted successfully');
          this.loadLectures();
        },
        error: (error) => {
          this.message.error('Failed to delete material');
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
}