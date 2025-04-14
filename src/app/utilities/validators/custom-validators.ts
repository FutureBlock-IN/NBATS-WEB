import { ValidatorFn, Validators } from "@angular/forms";

export class CustomValidators{
  static nameValidator(): ValidatorFn{
    return Validators.compose([
      Validators.required,
      Validators.maxLength(50),
    ]) as ValidatorFn;
  }

  static emailValidator(): ValidatorFn{
    return Validators.compose([
      Validators.required,
      Validators.email,
      Validators.maxLength(100)
    ]) as ValidatorFn;
  }

  static phoneValidator(): ValidatorFn{
    return Validators.compose([
      Validators.required,
      Validators.pattern('^\\d{10}$')
    ]) as ValidatorFn;
  }

  static addressValidator(): ValidatorFn{
    return Validators.compose([
      Validators.required,
      Validators.maxLength(256),
      Validators.minLength(3)
    ]) as ValidatorFn;
  }

  static zipValidator(): ValidatorFn{
    return Validators.compose([
      Validators.required,
      Validators.pattern('^\\d{5}$')
    ]) as ValidatorFn;
  }
}