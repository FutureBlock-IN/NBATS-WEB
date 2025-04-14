import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/themes/theme.service';

@Component({
  selector: 'app-check-action-popup',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './check-action-success-popup.component.html',
  styleUrls: ['./check-action-success-popup.component.css']
})
export class CheckActionPopupComponent {
  fallbackImageUrl:string = '../../../../assets/images/eventPlaceholder.jpg'
  constructor(
    public themeSignal:ThemeService,

    public dialogRef: MatDialogRef<CheckActionPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string, name: string, message: string, type?: string , showImage?:boolean}
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  confirmAction(): void {
    this.dialogRef.close({ actionConfirmed: true });
  }

  cancelAction(): void {
    this.dialogRef.close({ actionConfirmed: false });
  }
  handleImageUrl(imageUrl: string): string {
    // Check if the URL is valid (basic check)
    const img = new Image();
    img.src = imageUrl;

    // If the image is loaded successfully, return the valid URL
    return img.complete && img.naturalHeight !== 0 ? imageUrl : this.fallbackImageUrl;
  }
}
