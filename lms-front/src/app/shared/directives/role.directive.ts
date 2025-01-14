import { Directive, Input, OnInit, inject, Injector, ViewContainerRef, TemplateRef, ElementRef, DestroyRef, ChangeDetectorRef, effect } from "@angular/core";
import { Role } from "../../core/constants";
import { AuthStore } from "../../store/auth";

@Directive({
  selector: '[permission]',
  standalone: true,
})
export class PermissionDirective implements OnInit {
  @Input('permission') roles: Role[] = [];
  
  private authStore = inject(AuthStore);
  private viewContainer = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef);
  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    effect(() => {
      const role = this.authStore.selectedRole();
      this.checkPermissions(role);
    }, { injector: this.injector });
  }

  private checkPermissions(role: Role): void {
    const isRoleIncluded = this.roles.includes(role);
    
    this.viewContainer.clear();

    if (isRoleIncluded) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.cdr.markForCheck();
    }
  }
}