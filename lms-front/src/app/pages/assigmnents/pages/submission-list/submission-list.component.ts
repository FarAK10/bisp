import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { SubmissionResponseDto, SubmissionsControllerClient } from '../../../../core/api/lms-api';
import { ASSIGNMETS_PAGES } from '../../../../core/constants/routes/assignments';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from '../../../../core/services';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ROOT_ROUTES } from '../../../../core/constants';

@Component({
  selector: 'app-submission-list',
  standalone: true,
  imports: [CommonModule,
    NzTableModule,
    NzButtonModule,NzTagModule],
  templateUrl: './submission-list.component.html',
  styleUrl: './submission-list.component.less',
  changeDetection:ChangeDetectionStrategy.OnPush,
})
export class SubmissionListComponent implements OnInit {
  private submissionClient = inject(SubmissionsControllerClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private destroyRef = inject(DestroyRef)
  private messageService = inject(MessageService)
  assignmentId = signal<number>(+this.route.snapshot.params[ASSIGNMETS_PAGES.assignmnetId])
  submissions = signal<SubmissionResponseDto[]>([])
  loadSubmissions() {
    this.submissionClient.getSubmissionsForAssignment(this.assignmentId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.submissions.set(data),
        error: () => this.messageService.onNotifyError('Failed to load submissions')
      });
  }
 ngOnInit(): void {
   this.loadSubmissions();
 }
  getStatus(submission: SubmissionResponseDto): string {
    if (submission.grade !== null) return 'Graded';
    return 'Pending Review';
  }

  getStatusColor(submission: SubmissionResponseDto): string {
    if (submission.grade !== null) return 'green';
    return 'orange';
  }
  viewSubmission(submissionId: number) {
    this.router.navigate([submissionId],{relativeTo:this.route});
  }
}
