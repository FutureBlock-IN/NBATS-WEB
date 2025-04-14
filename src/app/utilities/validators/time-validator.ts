import { AbstractControl, ValidatorFn } from '@angular/forms';

export function timeGreaterThanCurrentTimeValidator(startDateControl: AbstractControl): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!startDateControl || !control.value) {
      return null;
    }

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    const startDate = new Date(startDateControl.value);
    const selectedTimeParts = control.value.split(':');
    const selectedHours = parseInt(selectedTimeParts[0], 10);
    const selectedMinutes = parseInt(selectedTimeParts[1], 10);

    if (startDate.toDateString() === now.toDateString()) {
      if (
        selectedHours < currentHours ||
        (selectedHours === currentHours && selectedMinutes <= currentMinutes)
      ) {
        return { timeInvalid: true };
      }
    }

    return null;
  };
}
