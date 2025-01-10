import {
  Component,
  ChangeDetectionStrategy,
  model,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { AuthStore } from '../../../../store/auth';
import { Role, ROOT_ROUTES } from '../../../../core/constants';
import { AUTH_ROUTES } from '../../../../core/constants/routes/auth';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { createSelectItem } from '../../../../core/utils/object-transform';
import { FormsModule } from '@angular/forms';
import { SelectItem } from '../../../../types/select-item';

@Component({
  selector: 'dash-base-header',
  standalone: true,
  imports: [NzIconDirective, NzButtonModule,NzSelectModule,FormsModule],
  templateUrl: './base-header.component.html',
  styleUrl: './base-header.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseHeaderComponent {
  isCollapsed = model<boolean>(false);
  authStore = inject(AuthStore);
  userRoles = this.authStore.userRoles;

  toggleIcon = computed<string>(() =>
    this.isCollapsed() ? 'menu-unfold' : 'menu-fold'
  );
   selectableRoles :SelectItem<string>[]= this.userRoles().map(role=> {
        return {
          label:role,
          value:role,
        }
   })

   selectedRole = model(this.authStore.selectedRole()) 

   onRoleSelect(role:Role){
    console.log(role)
     this.authStore.setRole(role)
   }

  constructor(private router: Router) {}

  toggleMenu(): void {
    this.isCollapsed.set(!this.isCollapsed());
  }

  logout(): void {
    this.authStore.signOut();
    this.router.navigate([ROOT_ROUTES.auth, AUTH_ROUTES.login]);
  }
}
