import {
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { EventActivityDTO } from '../../../models/serviceModels/eventActivity/eventActivity';
import { EventScheduleResponseDTO } from '../../../models/serviceModels/event/eventScheduleResponse';
import { MainResponseEvent } from '../../../models/serviceModels/event/mainResponseEvent';
import { EventService } from '../../../services/api-services/event.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificationPopupComponent } from '../../../components/shared-comps/notification-popup/notification-popup.component';
import { CommonModule } from '@angular/common';
import { UserActivityCardComponent } from '../../../components/shared-comps/user-activity-card/user-activity-card.component';

import { Event } from '../../../models/serviceModels/event/baseEvent';
import { UserActivityDetailsCardComponent } from '../user-activity-details-card/user-activity-details-card.component';
import { AppConstants } from '../../../app-Constants/app.constants';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-event-activity-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserActivityDetailsCardComponent,
    MatIcon,
  ],
  templateUrl: './event-activity-details.component.html',
  styleUrl: './event-activity-details.component.css',
})
export class EventActivityDetailsComponent {
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
  currentView: string = 'card';
  selectedSchedule: number | null = null;

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
    private appConstants: AppConstants
  ) {}

  ngOnInit(): void {
    this.eventSchedules = history.state.eventSchedules;
    this.selectScheduleId = history.state.scheduleIndex;

    this.route.paramMap.subscribe((params) => {
      const eventId = Number(params.get('EventId'));
      if (eventId) {
        // console.log(eventId, 'Data');
        this.fetchEventDetails(eventId);
        // console.log(eventId, 'RecurId');
      }
    });
  }

  selectedIndex: number = 0;

  steps: { label: string; content: TemplateRef<any> | null }[] = [
    { label: 'Participants', content: null },
    { label: 'Staff', content: null },
  ];

  @ViewChild('participantTemplate', { static: false })
  participantTemplate!: TemplateRef<any>;
  @ViewChild('staffTemplate', { static: false })
  staffTemplate!: TemplateRef<any>;


  ngAfterViewInit(): void {
    this.steps[0].content = this.participantTemplate;
    this.steps[1].content = this.staffTemplate;
    this.cdRef.detectChanges();
  }

  fetchEventDetails(eventId: number): void {
    this.eventService.getFullEventByEventId(eventId).subscribe({
      next: (response: any) => {
        this.event = response;
        this.title = response;
        this.eventDetails = response;

        // console.log(response, 'eventSchedules');
        this.eventSchedule = (
          response.eventScheduleConfig?.eventSchedule || []
        ).map((schedule: any) => ({
          ...schedule,
          formattedStartTime: this.formatTime(schedule.startTime),
          formattedEndTime: this.formatTime(schedule.endTime),
          formattedDate: this.formatDate(schedule.startTime),
        }));

        // console.log(this.eventSchedule, 'Formatted Event Schedule');
      },
      error: (err) => {
        this.isStaffListLoading = false;
        this.isParticipantListLoading = false;
        this.showNotification('Error', `${err.message}`, 'ok');
      },
    });
  }

  getEventActivityDate(eventId: number, eventDate: string): void {
    this.loading = true; // ✅ Show spinner while fetching
    this.eventService.getEventActivityByIdDate(eventId, eventDate).subscribe({
      next: (response) => {
        this.eventSelectedEvents = response;

        this.participants = response.filter(
          (activity) => activity.eventUser.role === 'participant'
        );
        this.staff = response.filter(
          (activity) =>
            activity.eventUser.role === 'staff' ||
            activity.eventUser.role === 'admin'
        );

        // console.log('Participants:', this.participants);
        // console.log('Staff:', this.staff);
        this.loading = false; // ✅ Hide spinner once done
        // console.log('ResponseEventDateEvnetId', this.eventSelectedEvents);
      },
      
      error: (err) => {
        console.log('Error fetching eventActivity:', err);
        this.loading = false; // ✅ Also hide spinner on error
      },
    });
  }

  onEventSelect(event: any): void {
    this.route.paramMap.subscribe((params) => {
      const eventId = Number(params.get('EventId'));
      if (eventId) {
        const [Id, eventDate] = event.target.value.split(',');

        this.getEventActivityDate(Number(eventId), eventDate);
      }
    });
  }

  getDefaultUserImage(): string {
    return this.appConstants.profilePlaceholderUrl;
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

  formatDate(date: string | undefined): string {
    if (!date) return '';

    const utcDate = new Date(date);

    const day = utcDate.getDate().toString().padStart(2, '0');
    const month = (utcDate.getMonth() + 1).toString().padStart(2, '0');
    const year = utcDate.getFullYear();

    return `${year}-${month}-${day}`;
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

  getEventActivity(EventId: number) {
    this.loading = true;
    this.eventService.getEventActivity(EventId).subscribe({
      next: (response: EventActivityDTO[]) => {
        // console.log(response, 'ResponseData');
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

  displayDateAndTime() {
    const timestamp = this.eventSchedules[this.selectScheduleId].startTime;
    const date = new Date(timestamp);

    const optionsDate: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const optionsTime: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };

    const formattedDate = new Intl.DateTimeFormat('en-US', optionsDate).format(
      date
    );
    const formattedTime = new Intl.DateTimeFormat('en-US', optionsTime).format(
      date
    );

    return `${formattedDate} ${formattedTime}`;
  }

  dashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  setView(view: string): void {
    this.currentView = view;
  }


  onClick(index: number): void {
    this.selectedIndex = index;
    this.selectedTab = index === 0 ? 'participants' : 'staff';
  }
  
   
}
