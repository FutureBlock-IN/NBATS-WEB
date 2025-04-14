import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConstants } from '../../../app-Constants/app.constants';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent {
  private _createdOn!: Date;

  constructor(public appConstants: AppConstants) {}  
  @Input() firstName!: string;
  @Input() lastName!: string;
  @Input() logoUrl!: string | null; 

  @Input()
  set createdOn(value: string | Date) {
    this._createdOn = typeof value === 'string' ? new Date(value) : value;
  }

  get createdOn(): Date {
    return this._createdOn;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US').format(date);
  }

  getProfilePlaceholderImageUrl(): string {
    return this.logoUrl ? this.logoUrl : this.appConstants.profilePlaceholderUrl;
  }
}
