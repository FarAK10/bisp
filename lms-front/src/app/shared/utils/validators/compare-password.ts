import { AbstractControl, ValidatorFn } from '@angular/forms';

export function confirmPasswordValidator(
  firstControlName: string,
  secondControlName: string
): ValidatorFn {
  return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
    const passwordControl = formGroup.get(firstControlName);
    const confirmationPasswordControl = formGroup.get(secondControlName);

    if (!passwordControl || !confirmationPasswordControl) {
      return null;
    }

    const password = passwordControl.value;
    const confirmPassword = confirmationPasswordControl.value;

    if (!confirmPassword) {
      confirmationPasswordControl.setErrors(
        confirmationPasswordControl.hasError('required')
          ? { required: true }
          : null
      );
      return null;
    }

    if (password !== confirmPassword) {
      confirmationPasswordControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmationPasswordControl.hasError('passwordMismatch')) {
        confirmationPasswordControl.setErrors(null);
      }
      return null;
    }
  };
}
