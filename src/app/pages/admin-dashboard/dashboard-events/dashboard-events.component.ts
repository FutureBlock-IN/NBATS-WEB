import { ChangeDetectorRef, Component } from '@angular/core';
import { ResponseEventDTO } from '../../../models/serviceModels/event/responseEvent';
import { EventScheduleResponseDTO } from '../../../models/serviceModels/event/eventScheduleResponse';
import { UserEventsResponse } from '../../../models/serviceModels/eventUser/EventUserResponse';
import { MainResponseEvent } from '../../../models/serviceModels/event/mainResponseEvent';
import { BehaviorSubject } from 'rxjs';
import { EventActivityDTO } from '../../../models/serviceModels/eventActivity/eventActivity';
import { CacheService } from '../../../services/api-services/cache.service';
import { EventService } from '../../../services/api-services/event.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllEventCardComponent } from '../all-event-card/all-event-card.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AllEventCardComponent,
    MatIcon,
  ],
  templateUrl: './dashboard-events.component.html',
  styleUrl: './dashboard-events.component.css',
})
export class DashboardEventsComponent {
  constructor(
    private eventService: EventService,
    private router: Router,
    private cacheService: CacheService,
    private cdr: ChangeDetectorRef
  ) {}
  event?: MainResponseEvent;
  eventAll: EventActivityDTO[] = [];
  areEventsAvailable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    true
  );
  events: ResponseEventDTO[] = [];
  scheduleIndexes: { [key: number]: number } = {};
  scheduleIndex: number = 0;
  eventSchedule?: EventScheduleResponseDTO;
  searchTerm: string = '';
  eventUsersMap: Map<number, any[]> = new Map();

  ngOnInit(): void {
    this.getAllEventDashboard();
    
  }

  isLoading = false;

   
  




  getAllEventDashboard() {
    this.isLoading = true;
    this.eventService.getAllEventsDashboard().subscribe({
      next: (data: any[]) => {
        console.log("AllEvnts", data); // Check the full data received
        const allEvents = this.getUpcomingOrCurrentEvents(data);
        this.events = allEvents || []; // Show all events
        this.areEventsAvailable.next(this.events.length > 0);
        this.events.forEach((event) => {
          this.getEventUsersByEventId(event.id); // Fetch users for each event
        });
  
        this.isLoading = false;
      },
      error: (error) => {
        this.areEventsAvailable.next(false);
        this.isLoading = false;
      },
    });
  }


   
  

  mapToMainResponseEvent(
    event: MainResponseEvent,
    upcomingScheduleIndex: number = 0
  ): ResponseEventDTO {
    const eventSchedule =
      event.eventScheduleConfig?.eventSchedule?.[upcomingScheduleIndex];

    return {
      id: event.id,
      createdOn: event.createdOn,
      updatedOn: event.updatedOn,
      startDate: this.formatDate(eventSchedule?.startTime?.split('T')[0]) || '',
      startTime: this.formatTime(eventSchedule?.startTime) || '',
      endTime: this.formatTime(eventSchedule?.endTime) || '',
      description: event.description,
      locationNotes: event.locationNotes,
      status: event.status,
      title: event.title,
      type: event.type,
      logoUrl: event.logoUrl,
      eventSchedule: eventSchedule,
    };
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';

    const utcDate = new Date(date);

    const day = utcDate.getDate().toString().padStart(2, '0');
    const month = (utcDate.getMonth() + 1).toString().padStart(2, '0');
    const year = utcDate.getFullYear();

    return `${day}-${month}-${year}`;
  }

  formatTime(time: string | undefined): string {
    if (!time) return '';

    const utcDate = new Date(time);

    const hours = utcDate.getHours();
    const minutes = utcDate.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;

    return `${adjustedHours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')} ${period}`;
  }

  getUpcomingOrCurrentEvents(
    events: MainResponseEvent[]
  ): ResponseEventDTO[] | undefined {
    // Simply map all events without filtering by current or upcoming schedules
    const allEvents = events
      .map((event) => {
        const scheduleIndex = 0; // Default to the first schedule
        this.scheduleIndexes[event.id] = scheduleIndex;
        return this.mapToMainResponseEvent(event, scheduleIndex); // Map each event
      })
      .sort((a, b) => {
        // Sort events by their start date and time
        const aStartDateTime = new Date(`${a.startDate}T${a.startTime}`);
        const bStartDateTime = new Date(`${b.startDate}T${b.startTime}`);
        return aStartDateTime.getTime() - bStartDateTime.getTime();
      });
  
    return allEvents.length > 0 ? allEvents : undefined;
  }
  

  isEventUpcomingOrOngoing(
    schedule: EventScheduleResponseDTO,
    currentDateTime: Date
  ): boolean {
    const eventEndDateTime = this.getEventEndDateTime(schedule);
    return eventEndDateTime >= currentDateTime;
  }

  getUpcomingScheduleIndex(
    schedules: EventScheduleResponseDTO[],
    currentDateTime: Date
  ): number {
    return schedules.findIndex((schedule) =>
      this.isEventUpcomingOrOngoing(schedule, currentDateTime)
    );
  }

  getEventEndDateTime(schedule: EventScheduleResponseDTO): Date {
    if (!schedule.endTime) return new Date(0);

    const [datePart, timePart] = schedule.endTime.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));

    const istOffsetMinutes = 5 * 60 + 30;
    utcDate.setMinutes(utcDate.getMinutes() + istOffsetMinutes);

    return utcDate;
  }

  fetchEventDetails(eventId: number): void {
    this.eventService.getFullEventByEventId(eventId).subscribe({
      next: (response: any) => {
        this.event = response;
        this.eventSchedule = this.event?.eventScheduleConfig?.eventSchedule[0];
        this.isLoading = false;
      },
      error: (err) => {},
    });
  }

  getEventUsersByEventId(eventId: number) {
    this.eventService.getEventUsersbyEventId(eventId).subscribe({
      next: (response: UserEventsResponse[]) => {
        if (!response || !Array.isArray(response)) {
          return;
        }

        const staffCount = response.filter(
          (user) => user.role === 'staff'
        ).length;
        const participantCount = response.filter(
          (user) => user.role === 'participant'
        ).length;
        const adminCount = response.filter(
          (user) => user.role === 'admin'
        ).length;

        this.events.forEach((event: ResponseEventDTO) => {
          if (event.id === eventId) {
            event.roles = {
              staff: staffCount,
              participants: participantCount,
              admins: adminCount,
            };
          }
        });
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }

  // navigateToEventDetailsPage(event: ResponseEventDTO): void {
  //   this.router.navigate([`eventActivityDetails/${event.id}`], {
  //     state: { event: event, scheduleIndex: this.scheduleIndexes[event.id] },
  //   });
  // }


  selectedIndex:number = 0

  navigateToEventDetailsPage(event: ResponseEventDTO): void {
    // Pass the current selectedIndex as part of the router state
    this.router.navigate([`eventActivityDetails/${event.id}`], {
      state: { 
        event: event, 
        scheduleIndex: this.scheduleIndexes[event.id], 
        selectedIndex: this.selectedIndex  // Save the current tab index
      },
    });
  }
  



  filteredEvents() {
    if (!this.searchTerm) {
      return this.events;
    }

    return this.events.filter((events) =>
      `${events.title} ${events.type}`
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase())
    );
  }
}
