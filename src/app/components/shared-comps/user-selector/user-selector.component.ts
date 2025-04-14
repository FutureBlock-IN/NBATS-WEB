import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { EventUserService } from '../../../services/api-services/eventUser.service';
import { ItemSelectorComponent } from '../../../components/shared-comps/item-selector/item-selector.component'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [CommonModule, ItemSelectorComponent],
  templateUrl: './user-selector.component.html',
  styleUrl: './user-selector.component.css'
})
export class UserSelectorComponent implements OnInit {
  @Input() users: any[] = []; // List of all staff/participants
  @Input() selectedUsers: number[] = []; // List of already selected users (for edit)
  @Input() isLoading: boolean = false;
  @Input() itemType: string = 'user'; // Can be 'staff' or 'participant'
  @Input() noItemsMessage: any;
  @Input() defaultImageUrl: string = '../../../../assets/images/userPlaceholder.jpg';
  @Input() eventId: number | undefined; // Event ID for editing (undefined for creation)
  
  @Output() userSelectionChanged = new EventEmitter<number[]>(); // Emit selected users

  constructor(private eventUserService: EventUserService) {}

  ngOnInit() {
    // You can initialize other data if needed
  }

  addUserToSelected(userId: number): void {
    if (!this.selectedUsers.includes(userId)) {
      this.selectedUsers.push(userId);
    } else {
      this.selectedUsers = this.selectedUsers.filter(id => id !== userId);
    }
    this.userSelectionChanged.emit(this.selectedUsers);
  }

  saveChanges(): void {
    if (this.eventId) {
      this.assignSelectedUsers();
    } else {
      console.log('No event ID provided for saving changes.');
    }
  }

  private assignSelectedUsers(): void {
    if (this.selectedUsers.length > 0) {
      this.selectedUsers.forEach(userId => {
        this.assignUserInBackground(userId);
      });
    } else {
      console.warn('No users selected for assignment');
    }
  }

  private assignUserInBackground(userId: number): void {
    if (!this.eventId) return;

    this.eventUserService.assignUser(this.eventId, userId).subscribe({
      next: (response) => {
        console.log('User assigned successfully', response);
      },
      error: (error) => {
        console.error('Error:', error.message);
      }
    });
  }
}