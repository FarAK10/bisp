import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
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
  styleUrl: './submission-list.component.less'
})
export class SubmissionListComponent {
  private submissionClient = inject(SubmissionsControllerClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private destroyRef = inject(DestroyRef)
  private messageService = inject(MessageService)
  assignmentId = signal<number>(+this.route.snapshot[ASSIGNMETS_PAGES.assignmnetId])
  submissions = signal<SubmissionResponseDto[]>([])
  loadSubmissions() {
    this.submissionClient.getSubmissionsForAssignment(this.assignmentId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.submissions.set(data),
        error: () => this.messageService.onNotifyError('Failed to load submissions')
      });
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
    this.router.navigate([ROOT_ROUTES.submissions, submissionId]);
  }
}
