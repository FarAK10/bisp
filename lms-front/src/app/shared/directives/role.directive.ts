import {
  AfterViewInit,
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { Role } from '../../core/constants';
import { doesUserHasPermission } from '../../core/utils/permission';
import { AuthStore } from '../../store/auth';

@Directive({
  selector: '[permission]',
  standalone: true,
})
export class PermissionDirective implements AfterViewInit {
  roles = input<Role[]>([], { alias: 'permission' });
  authStrore = inject(AuthStore);
  user = this.authStrore.user;

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<ElementRef<HTMLElement>>,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.checkPermissions();
  }

  private checkPermissions(): void {
    const user = this.user();
    if (doesUserHasPermission(user.roles as Role[], this.roles())) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
