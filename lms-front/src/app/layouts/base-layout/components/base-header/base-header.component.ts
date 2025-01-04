import {
  Component,
  ChangeDetectionStrategy,
  model,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { AuthStore } from '../../../../store/auth';

@Component({
  selector: 'dash-base-header',
  standalone: true,
  imports: [NzIconDirective, NzButtonModule],
  templateUrl: './base-header.component.html',
  styleUrl: './base-header.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseHeaderComponent {
  isCollapsed = model<boolean>(false);
  authStore = inject(AuthStore);

  toggleIcon = computed<string>(() =>
    this.isCollapsed() ? 'menu-unfold' : 'menu-fold'
  );

  constructor(private router: Router) {}

  toggleMenu(): void {
    this.isCollapsed.set(!this.isCollapsed());
  }

  logout(): void {
    this.authStore.signOut();
  }
}
