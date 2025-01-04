import { NgTemplateOutlet } from '@angular/common';
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NAVIGATION } from '../../../../core/constants/navigation';
import { NavigationItem } from '../../../../types/navigation';
import { PermissionDirective } from '../../../../shared/directives/role.directive';

@Component({
  selector: 'dash-base-sider',
  standalone: true,
  imports: [
    NzMenuModule,
    NzIconDirective,
    NgTemplateOutlet,
    RouterLink,
    PermissionDirective,
  ],
  templateUrl: './base-sider.component.html',
  styleUrl: './base-sider.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseSiderComponent {
  navigation: NavigationItem[] = NAVIGATION;
  isCollapsed = input<boolean>();

  constructor() {
    console.log(this.navigation);
  }
}
