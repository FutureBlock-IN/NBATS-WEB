import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PhoneNumberValidator {
  static validPhoneNumber(): ValidatorFn {
    const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?)[-.\s]?\d{3}[-.\s]?\d{4}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      const isValid = phoneRegex.test(control.value);
      return isValid ? null : { invalidPhoneNumber: true };
    };
  }
}
