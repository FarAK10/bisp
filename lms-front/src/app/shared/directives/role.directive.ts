import { Directive, AfterViewInit, input, inject, Injector, ViewContainerRef, TemplateRef, ElementRef, DestroyRef, ChangeDetectorRef, effect } from "@angular/core";
import { Role } from "../../core/constants";
import { AuthStore } from "../../store/auth";

@Directive({
  selector: '[permission]',
  standalone: true,
})
export class PermissionDirective implements AfterViewInit {
  roles = input<Role[]>([], { alias: 'permission' });
  authStrore = inject(AuthStore);
  user = this.authStrore.user;
  selectedRole = this.authStrore.selectedRole;
  injector = inject(Injector);

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<ElementRef<HTMLElement>>,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    effect(() => {
      const role = this.selectedRole();
      this.checkPermissions(role);
    }, { injector: this.injector });
  }

  private checkPermissions(role: Role): void {
    const isRoleIncluded = this.roles().includes(role);

    this.viewContainer.clear();

    if (isRoleIncluded) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.cdr.markForCheck(); 
    }
  }
}
