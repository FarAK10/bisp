import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { AuthControllerClient, LoginDto } from '../../../../core/api/lms-api';
import { AuthStore } from '../../../../store/auth';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../../core/services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzInputModule,
    NzFormModule,
    NzButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  authStore = inject(AuthStore);
  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      validators: [Validators.required],
    }),
  });
  route = inject(ActivatedRoute);
  router = inject(Router);
  isloading = this.authStore.isLoading;
  messageService = inject(MessageService);
  constructor() {}

  ngOnInit(): void {
    if (this.authStore.isAuthenticated()) {
      const query = this.route.snapshot.queryParams['returnUrl'];
      this.router.navigateByUrl(query);
    }
  }

  login(): void {
    const formValue = this.loginForm.value;
    const loginDTO: LoginDto = {
      email: formValue.email,
      password: formValue.password,
    };
    this.authStore.signIn(loginDTO).subscribe({
      next: () => {
        const query = this.route.snapshot.queryParams['returnUrl'];
        this.messageService.onNotifySuccess('Login successfully');

        if (query) {
          this.router.navigateByUrl(query);
          return;
        }
        this.router.navigate(['']);
      },
      error: (error) => {
        this.messageService.onNotifyError(error);
      },
    });
  }
}
