import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { PhoneNumberValidator } from '../../utilities/validators/phone-number-validator';

@Directive({
  selector: '[validPhoneNumber]',
  standalone: true,  // Mark the directive as standalone
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhoneNumberValidatorDirective),
      multi: true
    }
  ]
})
export class PhoneNumberValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return PhoneNumberValidator.validPhoneNumber()(control);
  }
}
