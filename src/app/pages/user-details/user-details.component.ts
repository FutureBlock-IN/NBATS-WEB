import { Component, Input } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { OrganizationUserService } from '../../services/api-services/organizationUser.service';
import { ResponseUserDTO } from '../../models/serviceModels/user/responseUser';
import { CommonModule, NgIf } from '@angular/common';
import {
  UserDetailsCardComponent,
  UserUpdateEvent,
} from '../../components/shared-comps/user-details-card/user-details-card.component';
import { ItemSelectorComponent } from '../../components/shared-comps/item-selector/item-selector.component';
import { EventService } from '../../services/api-services/event.service';
import { ResponseEventDTO } from '../../models/serviceModels/event/responseEvent';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { EventUserService } from '../../services/api-services/eventUser.service';
import { UploadService } from '../../services/api-services/uploadFile.service';
import { AppConstants } from '../../app-Constants/app.constants';
import { NotificationPopupComponent } from '../../components/shared-comps/notification-popup/notification-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-participant-details',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    UserDetailsCardComponent,
    ItemSelectorComponent,
    MatTabsModule,
    MatIconModule
  ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
})
export class UserDetailsComponent {
  participant: any;
  isLoading: boolean = true;
  events: ResponseEventDTO[] = [];
  isLoadingEvents = true;
  eventIds: number[] = [];
  selectedEventIds: Set<number> = new Set<number>();
  isParticipantRoute: boolean = false;
  isStaffRoute: boolean = false;
  areEventsChanged: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private participantService: OrganizationUserService,
    private eventUserService: EventUserService,
    private eventService: EventService,
    private uploadService: UploadService,
    private appConstants: AppConstants,
    private dialog: MatDialog,
    private router: Router
  ) {}
  currentRoute: string = '';
  async ngOnInit(): Promise<void> {
    try {
      this.setCurrentUserPhase();
      await this.loadUser();
      await this.loadEvents();
      await this.loadSelectedEvents();
      console.log(this.loadEvents, 'LoadEvents');
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }
  setCurrentUserPhase() {
    this.currentRoute = this.router.url;
    if (this.currentRoute.includes('/p')) {
      this.isParticipantRoute = true;
      this.isStaffRoute = false;
    } else {
      this.isStaffRoute = true;
      this.isParticipantRoute = false;
    }
  }

  async loadUser(): Promise<void> {
    const UserId = this.route.snapshot.params['UserId'];

    try {
      this.isLoading = true;
      const participant: ResponseUserDTO =
        await this.participantService.getOrganizationUserById(UserId);
      this.participant = participant;
      console.log(participant, 'PEData');
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      this.isLoading = false;
    }
  }

  loadSelectedEvents(): void {
    this.eventUserService.getEventsByUserId(this.participant.id).subscribe({
      next: (data) => {
        console.log(data, 'staffData');
        this.eventIds = data.map((eventUser) => eventUser.event.id);

        this.selectedEventIds = new Set(this.eventIds);
      },
      error: (error) => {
        console.error('Error retrieving events:', error);
        this.showNotification(
          'Error',
          'Failed to load events. Please try again later.',
          'ok'
        );
      },
    });
  }

  loadEvents(): void {
    this.eventService.getEventsByOwnerID().subscribe({
      next: (events) => {
        this.events = events;
        console.log(events, 'EventStaff');
        this.isLoadingEvents = false;
      },
      error: (err) => {
        console.error('Error loading events', err);
        this.isLoadingEvents = false;
      },
    });
  }

  onEventSelect(eventId: number): void {
    console.log('Selected event:', eventId);

    if (eventId && !this.eventIds.includes(eventId)) {
      this.eventIds.push(eventId);

      this.eventUserService
        .assignUser(eventId, this.participant.id)
        .subscribe(() => {
          console.log('Event users assigned successfully');
        });
    } else if (this.eventIds.includes(eventId)) {
      this.eventIds = this.eventIds.filter((id) => id !== eventId);

      this.eventUserService
        .deleteUser(eventId, this.participant.id)
        .subscribe(() => {
          console.log('Event users deleted successfully');
        });
    }

    this.areEventsChanged = true;
  }

  onSaveChanges(userUpdateEvent: UserUpdateEvent): void {
    if (userUpdateEvent.file) {
      this.uploadImage(userUpdateEvent.file)
        .then((logoUrl: string) => {
          userUpdateEvent.user.logoUrl = logoUrl;
          this.updateUser(userUpdateEvent.user);
        })
        .catch((err) => {
          this.showNotification(
            'Error',
            `Image upload failed: ${err.message}`,
            'ok'
          );
        });
    } else {
      this.updateUser(userUpdateEvent.user);
    }
  }

  updateUser(updatedUser: ResponseUserDTO): void {
    this.participantService.updateUser(updatedUser).subscribe({
      next: () => {
        console.log('User updated successfully');
        this.showNotification('Success', `User updated successfully`, 'ok');
      },
      error: (err) => {
        this.showNotification(
          'Error',
          `User update failed: ${err.message}`,
          'ok'
        );
      },
    });
  }

  uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      this.uploadService
        .uploadImage(this.appConstants.organizationUserContainerName, file)
        .subscribe({
          next: (logoUrl: string) => {
            resolve(logoUrl);
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }
  navigateToHome() {
    if (this.areEventsChanged)
      this.showNotification(
        'Success',
        this.isParticipantRoute
          ? this.appConstants.eventAssignmentUpdatedForParticipant
          : this.appConstants.eventAssignmentUpdatedForStaff,
        'ok'
      );
    if (this.isParticipantRoute) {
      this.router.navigate(['/home/participants']);
    } else {
      this.router.navigate(['/home/staff']);
    }
  }

  showNotification(title: string, message: string, buttonName: string): void {
    this.dialog.open(NotificationPopupComponent, {
      data: {
        title,
        message,
        buttonName,
      },
    });
  }
}
