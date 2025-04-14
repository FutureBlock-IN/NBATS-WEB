import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export function startDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const selectedStartDate = new Date(control.value);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set current time to midnight to only compare dates, not times

    return selectedStartDate >= currentDate ? null : { invalidStartDate: true };
  };
}

export function endDateValidator(startDateControl: AbstractControl | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!startDateControl || !startDateControl.value || !control.value) {
      return null; // No validation if startDateControl is null or if values are missing
    }

    const selectedEndDate = new Date(control.value);
    const selectedStartDate = new Date(startDateControl.value);

    return selectedEndDate >= selectedStartDate ? null : { invalidEndDate: true };
  };
}


export function setupEndDateValidator(formGroup: FormGroup, startDateControlName: string, endDateControlName: string): void {
  const startDateControl = formGroup.get(startDateControlName);
  const endDateControl = formGroup.get(endDateControlName);

  if (!startDateControl || !endDateControl) {
    return;
  }

  // Set up the validator for the end date
  endDateControl.setValidators([endDateValidator(startDateControl)]);

  // Subscribe to start date changes to revalidate the end date
  startDateControl.valueChanges.subscribe(() => {
    endDateControl.updateValueAndValidity();
  });
}
