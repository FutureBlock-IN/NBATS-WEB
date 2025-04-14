import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validWeekdaysValidator(startDateKey: string, endDateKey: string, weekdaysKey: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const startDate = formGroup.get(startDateKey)?.value;
    const endDate = formGroup.get(endDateKey)?.value;
    const weekdays = formGroup.get(weekdaysKey)?.value;
    
    if (!startDate || !endDate || !weekdays) {
      return null;
    }

    const selectedWeekdays = Object.keys(weekdays).filter(day => weekdays[day]);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      console.log('Invalid Dates');
      return { invalidWeekays: 'Start date cannot be after end date.' };
    }

    const dateRangeWeekdays: string[] = [];
    for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
      const day = new Date(date).getDay();
      const weekDayString = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][day];
      dateRangeWeekdays.push(weekDayString);
    }

    const hasValidWeekdays = selectedWeekdays.every(day => dateRangeWeekdays.includes(day));
    console.log({ startDate, endDate, weekdays, selectedWeekdays, hasValidWeekdays });

    return hasValidWeekdays ? null : { invalidWeekdays: true };
  };
}

export function validWeekdaysValidator2(startDateKey: string, endDateKey: string, weekdaysKey: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const startDateValue = formGroup.get(startDateKey)?.value;
    const endDateValue = formGroup.get(endDateKey)?.value;
    const weekdays = formGroup.get(weekdaysKey)?.value;
    
    if (!startDateValue || !endDateValue || !weekdays) {
      return null;  // If either date is missing, skip validation.
    }

    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    // Validate date comparison: start date must be before or equal to end date
    if (startDate.getTime() > endDate.getTime()) {
      return { invalidDates: 'Start date cannot be after end date.' };
    }

    const selectedWeekdays = Object.keys(weekdays).filter(day => weekdays[day]);
    if (selectedWeekdays.length === 0) {
      return { invalidWeekdays: 'At least one weekday must be selected.' };
    }

    // Collect weekdays between startDate and endDate
    const dateRangeWeekdays: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayIndex = currentDate.getDay();  // 0 = Sunday, 6 = Saturday
      const weekdayString = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dayIndex];
      dateRangeWeekdays.push(weekdayString);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Ensure that all selected weekdays fall within the date range
    const isValid = selectedWeekdays.every(day => dateRangeWeekdays.includes(day));
    
    return isValid ? null : { invalidWeekdays: true };
  };
}

export function validWeekdaysValidator3(startDateKey: string, endDateKey: string, weekdaysKey: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const startDateValue = formGroup.get(startDateKey)?.value;
    const endDateValue = formGroup.get(endDateKey)?.value;
    const weekdays = formGroup.get(weekdaysKey)?.value;
    
    if (!startDateValue || !endDateValue || !weekdays) {
      return null;  // If either date or weekdays are missing, skip validation.
    }

    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    // Normalize startDate and endDate by setting time to 00:00:00 to compare only dates
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Validate date comparison: start date must be before or equal to end date
    if (startDate.getTime() > endDate.getTime()) {
      return { invalidDates: 'Start date cannot be after end date.' };
    }

    const selectedWeekdays = Object.keys(weekdays).filter(day => weekdays[day]);
    if (selectedWeekdays.length === 0) {
      return { invalidWeekdays: 'At least one weekday must be selected.' };
    }

    // Collect weekdays between startDate and endDate
    const dateRangeWeekdays: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayIndex = currentDate.getDay();  // 0 = Sunday, 6 = Saturday
      const weekdayString = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dayIndex];
      dateRangeWeekdays.push(weekdayString);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Ensure that all selected weekdays fall within the date range
    const isValid = selectedWeekdays.every(day => dateRangeWeekdays.includes(day));
    
    return isValid ? null : { invalidWeekdays: true };
  };
}
