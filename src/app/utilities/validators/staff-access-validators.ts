import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from '../../app-Constants/app.constants';
import { VALIDATION_MESSAGES } from '../constants/validation-strings';
import { NotificationPopupComponent } from '../../components/shared-comps/notification-popup/notification-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { UserRole } from '../enums/user-roles.enums';

@Injectable({
  providedIn: 'root'
})
export class StaffAccessValidator{
    validationMessages = VALIDATION_MESSAGES;
    
  constructor(
    private router: Router,
    private appConstants: AppConstants,
    private dialog: MatDialog,
  ) {}

  navigateToAddStaff(): void {
    const userRole = localStorage.getItem('role');
    if (userRole === UserRole.Owner || userRole === UserRole.Admin) {
      console.log('Navigation allowed');
      this.router.navigate([this.appConstants.addStaffPageRoute]);
    } else {
      console.error(this.validationMessages.accessDenied.error);
      this.showNotification('Error', this.validationMessages.accessDenied.error, 'ok');
    }
  }

  showNotification(title: string, message: string, buttonName: string): void {
    this.dialog.open(NotificationPopupComponent, {
      data: {
        title,
        message,
        buttonName
      }
    });
  }
}
