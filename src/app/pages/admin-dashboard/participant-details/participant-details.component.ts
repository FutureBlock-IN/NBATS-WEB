import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { EventActivityDTO } from '../../../models/serviceModels/eventActivity/eventActivity';
import { EventScheduleResponseDTO } from '../../../models/serviceModels/event/eventScheduleResponse';
import { MainResponseEvent } from '../../../models/serviceModels/event/mainResponseEvent';
import { EventService } from '../../../services/api-services/event.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificationPopupComponent } from '../../../components/shared-comps/notification-popup/notification-popup.component';
import { ResponseUserDTO } from '../../../models/serviceModels/user/responseUser';
import { Router, RouterModule } from '@angular/router';
import { AppConstants } from '../../../app-Constants/app.constants';
import { OrganizationUserService } from '../../../services/api-services/organizationUser.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Event } from '../../../models/serviceModels/event/baseEvent';
import { EventUserService } from '../../../services/api-services/eventUser.service';
import { UploadService } from '../../../services/api-services/uploadFile.service';
import { UserUpdateEvent } from '../../../components/shared-comps/user-details-card/user-details-card.component';
import { ResponseEventDTO } from '../../../models/serviceModels/event/responseEvent';
import { UserActivityDetailsCardComponent } from '../user-activity-details-card/user-activity-details-card.component';

@Component({
  selector: 'app-participant-details',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserActivityDetailsCardComponent,
    NgIf,
  ],
  templateUrl: './participant-details.component.html',
  styleUrl: './participant-details.component.css',
})
export class ParticipantDetailsComponent implements OnInit {
  participant: any;
  isLoading: boolean = true;
  events: ResponseEventDTO[] = [];
  isLoadingEvents = true;
  eventIds: number[] = [];
  selectedEventIds: Set<number> = new Set<number>();
  isParticipantRoute: boolean = false;
  isStaffRoute: boolean = false;
  areEventsChanged: boolean = false;
  eventSelected: any[] = [];

  selectedTab: string = 'participants';
  participants: EventActivityDTO[] = [];
  staff: EventActivityDTO[] = [];
  loading: boolean = false;
  eventSchedules: EventScheduleResponseDTO[] = [];
  selectScheduleId: number = 0;
  event?: MainResponseEvent;
  eventSchedule: EventScheduleResponseDTO[] = [];

  NoParticipants: boolean = false;
  NoStaff: boolean = false;
  isStaffListLoading: boolean = false;
  isParticipantListLoading: boolean = false;
  selectedEvent: number | null = null;
  eventDetails: any[] = [];
  title?: Event;
  eventSelectedEvents: any[] = [];

  selectedSchedule: number | null = null;
  currentView: string = 'card';
  staffId: string | null = null;

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

  selectedIndex: number = 0;

  steps: { label: string; content: TemplateRef<any> | null }[] = [
    { label: 'Participants', content: null },
    { label: 'Staff', content: null },
  ];

  @ViewChild('participantTemplate', { static: false })
  participantTemplate!: TemplateRef<any>;
  @ViewChild('staffTemplate', { static: false })
  staffTemplate!: TemplateRef<any>;

  onClick(index: number): void {
    this.selectedIndex = index;
  }

  ngAfterViewInit(): void {
    this.steps[0].content = this.participantTemplate;
    this.steps[1].content = this.staffTemplate;
  }

  currentRoute: string = '';
  async ngOnInit(): Promise<void> {
    try {
      this.route.paramMap.subscribe((params) => {
        this.staffId = params.get('id');
      });

      this.setCurrentUserPhase();
      await this.loadUser();
      await this.loadEvents();
      await this.loadSelectedEvents();
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
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      this.isLoading = false;
    }
  }

  loadSelectedEvents(): void {
    this.eventUserService.getEventsByUserId(this.participant.id).subscribe({
      next: (data) => {
        this.eventSelectedEvents = data;
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
        this.isLoadingEvents = false;
      },
      error: (err) => {
        console.error('Error loading events', err);
        this.isLoadingEvents = false;
      },
    });
  }

  onEventSelect(eventId: number): void {
    if (eventId && !this.eventIds.includes(eventId)) {
      this.eventIds.push(eventId);

      this.eventUserService
        .assignUser(eventId, this.participant.id)
        .subscribe(() => {});
    } else if (this.eventIds.includes(eventId)) {
      this.eventIds = this.eventIds.filter((id) => id !== eventId);

      this.eventUserService
        .deleteUser(eventId, this.participant.id)
        .subscribe(() => {});
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

  getEventActivity(EventId: number, EventUserId: number) {
    this.loading = true;
    this.eventService.getEventActivityByUserId(EventId, EventUserId).subscribe({
      next: (response: EventActivityDTO[]) => {
        this.participants = response.filter(
          (activity) => activity.eventUser.role === 'participant'
        );
        this.staff = response.filter(
          (activity) =>
            activity.eventUser.role === 'staff' ||
            activity.eventUser.role === 'admin'
        );
        this.loading = false;
      },
      error: (error: any) => {
        console.error(error);
        this.loading = false;
      },
    });
  }

  getDefaultUserImage(): string {
    return this.appConstants.profilePlaceholderUrl;
  }

  onStaffSelect(event: any): void {
    this.route.paramMap.subscribe((params) => {
      const [eventUserId, eventId] = event.target.value.split(',');
      if (eventUserId) {
        this.getEventActivity(eventId, eventUserId);
      }
    });
  }

  formatTime(time: string | undefined): string {
    if (!time) return '';

    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;

    return `${adjustedHours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')} ${period}`;
  }

  setView(view: string): void {
    this.currentView = view;
  }

  dashboard() {
    this.router.navigateByUrl('/dashboard');
  }
}
