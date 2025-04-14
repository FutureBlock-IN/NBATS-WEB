import { Component, Input } from '@angular/core';
import { ResponseUserDTO } from '../../../models/serviceModels/user/responseUser';
import { EventActivityDTO } from '../../../models/serviceModels/eventActivity/eventActivity';
import { AppConstants } from '../../../app-Constants/app.constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-activity-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-activity-card.component.html',
  styleUrl: './user-activity-card.component.css'
})
export class UserActivityCardComponent {
  constructor(private appConstants: AppConstants) { }
  @Input() user?: EventActivityDTO;

  getProfilePlaceholderImageUrl(): string {
    return this.user?.organzationUser.logoUrl ? this.user?.organzationUser.logoUrl : this.appConstants.profilePlaceholderUrl;
  }
  formatDate(date: string | undefined): string {
    if (!date) {
      return 'N/A'; 
    }
    const localDate = new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return localDate;
  }
  formatOnlyDate(date: string | undefined): string {
    if (!date) {
      return 'N/A';
    }
    const localDate = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
    return localDate;
  }
  
}
