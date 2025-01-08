import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  signal,
} from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import {
  GetUserDto,
  UserControllerClient,
  UserTableResponseDto,
} from '../../../../core/api/lms-api';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../../core/services';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [NzTableModule, CommonModule, FormsModule, NzButtonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  userClient = inject(UserControllerClient);
  router = inject(Router);
  route = inject(ActivatedRoute);
  messageService = inject(MessageService);
  page$ = new BehaviorSubject<number>(1);
  pageSize$ = new BehaviorSubject<number>(10);
  updateTable$ = new BehaviorSubject<boolean>(true);
  tableRes$ = combineLatest([
    this.page$,
    this.pageSize$,
    this.updateTable$,
  ]).pipe(
    switchMap(([page, pageSize]) => this.userClient.getAllUsers(page, pageSize))
  );
  tableRes = toSignal(this.tableRes$);
  users = computed(() => this.tableRes()?.data);

  total = computed(() => this.tableRes()?.count);
  onPageIndexChange(index: number) {
    this.page$.next(index);
  }
  onPageSizeChange(size: number) {
    this.pageSize$.next(size);
  }
  onCreate(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }
  onEdit(selectedUser: GetUserDto): void {
    this.router.navigate([selectedUser.id], { relativeTo: this.route });
  }
  onDelete(selectedUser: GetUserDto): void {
    this.userClient.remove(selectedUser.id).subscribe(() => {
      this.messageService.onNotifySuccess('User deleted successfully');
      this.updateTable$.next(true);
    });
  }
}
