import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { createSelectItem } from '../../../../core/utils/object-transform';
import { Role, ROOT_ROUTES } from '../../../../core/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { UserRoutes } from '../../../../core/constants/routes/users';
import { filter, map, switchMap } from 'rxjs';
import {
  CreateUserDto,
  UpdateUserDto,
  UserControllerClient,
} from '../../../../core/api/lms-api';
import { MessageService } from '../../../../core/services';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    NzInputModule,
    NzSelectModule,
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent implements OnInit {
  route = inject(ActivatedRoute);
  userClient = inject(UserControllerClient);
  messageService = inject(MessageService);
  router = inject(Router);
  userId = toSignal(
    this.route.params.pipe(map((params) => params[UserRoutes.userId]))
  );

  selectedUser$ = toObservable(this.userId).pipe(
    filter((id) => !!id),
    switchMap((id) => this.userClient.getUserById(id))
  );

  isEditMode = computed(() => !!this.userId());

  constructor() {}
  ngOnInit(): void {
    if (this.isEditMode()) {
      const passwordControl = this.createUserForm.controls.password;
      passwordControl.clearValidators();
      passwordControl.updateValueAndValidity();
      this.selectedUser$.subscribe((user) => {
        this.createUserForm.patchValue(user);
      });
    }
  }
  label = computed(() => (this.isEditMode() ? 'Edit User' : 'Create User'));
  createUserForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { validators: [Validators.required] }),
    firstName: new FormControl('', { validators: [Validators.required] }),
    lastName: new FormControl('', { validators: [Validators.required] }),
    roles: new FormControl([], { validators: [Validators.required] }),
  });
  roles = createSelectItem(Role);

  onSubmit(): void {
    if (this.isEditMode()) {
      this.updateUser();
    } else {
      this.addUser();
    }
  }
  back(): void {
    this.router.navigate([ROOT_ROUTES.users]);
  }

  private addUser(): void {
    const formValue = this.createUserForm.value;
    const user: CreateUserDto = {
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      roles: formValue.roles,
    };
    this.userClient.create(user).subscribe({
      next: () => {
        this.messageService.onNotifySuccess('User created successfully');
        this.back();
      },
      error: () => {
        this.messageService.onNotifyError('Failed to create user');
      },
    });
  }
  private updateUser(): void {
    const formValue = this.createUserForm.value;
    const user: UpdateUserDto = {
      id: this.userId(),
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      roles: formValue.roles,
    };
    this.userClient.update(this.userId(), user).subscribe({
      next: () => {
        this.messageService.onNotifySuccess('User updated successfully');
        this.back();
      },
      error: () => {
        this.messageService.onNotifyError('Failed to update user');
      },
    });
  }
}
