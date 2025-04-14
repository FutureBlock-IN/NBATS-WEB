import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-notification-popup',
  standalone: true,
  imports: [],
  templateUrl: './notification-popup.component.html',
  styleUrl: './notification-popup.component.css'
})
export class NotificationPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<NotificationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {message:string , title:string , buttonName:string}) {

  }
  closeDialog(){
    this.dialogRef.close()
  }
}
