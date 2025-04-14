import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCardComponent } from '../../components/service-comps/event-card/event-card.component';
import { BehaviorSubject, scheduled } from 'rxjs';
import { Event } from '../../models/serviceModels/event/baseEvent';
import { EventService } from '../../services/api-services/event.service';
import { ResponseEventDTO } from '../../models/serviceModels/event/responseEvent';
import { Router } from '@angular/router';
import { MainResponseEvent } from '../../models/serviceModels/event/mainResponseEvent';
import { EventScheduleResponseDTO } from '../../models/serviceModels/event/eventScheduleResponse';
import { EventScheduleConfigResponseDTO } from '../../models/serviceModels/event/eventScheduleConfigResponse';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-events',
  standalone: true,
  imports: [EventCardComponent, CommonModule, FormsModule, MatIcon],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent implements OnInit {
  constructor(private eventService: EventService, private router: Router) {}
  areEventsAvailable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    true
  );
  events: ResponseEventDTO[] = [];
  searchTerm: string = '';
  scheduleIndexes: { [key: number]: number } = {};
  ngOnInit(): void {
    this.getEvents();
  }
  isLoading = false;
  getEvents() {
    this.isLoading = true;
    this.eventService.getEventsByOwnerID().subscribe({
      next: (data: any[]) => {
        const upCommingEvents = this.getUpcomingOrCurrentEvents(data);
        this.events = upCommingEvents || [];
        this.areEventsAvailable.next(this.events.length > 0);
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
    const month = (utcDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = utcDate.getFullYear();

    return `${day}-${month}-${year}`;
  }

  formatTime(time: string | undefined): string {
    if (!time) return '';

    const utcDate = new Date(time);

    const hours = utcDate.getHours();
    const minutes = utcDate.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12; // Adjust hours to 12-hour format

    return `${adjustedHours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')} ${period}`;
  }

  getUpcomingOrCurrentEvents(
    events: MainResponseEvent[]
  ): ResponseEventDTO[] | undefined {
    const currentDateTime = new Date();
    const upcomingEvents = events
      .filter((event) => {
        const schedules = event.eventScheduleConfig?.eventSchedule;
        return schedules?.some((schedule) =>
          this.isEventUpcomingOrOngoing(schedule, currentDateTime)
        );
      })
      .map((event) => {
        const scheduleIndex = this.getUpcomingScheduleIndex(
          event.eventScheduleConfig?.eventSchedule || [],
          currentDateTime
        );
        this.scheduleIndexes[event.id] = scheduleIndex;
        return this.mapToMainResponseEvent(event, scheduleIndex);
      })
      .sort((a, b) => {
        const aStartDateTime = new Date(`${a.startDate}T${a.startTime}`);
        const bStartDateTime = new Date(`${b.startDate}T${b.startTime}`);
        return aStartDateTime.getTime() - bStartDateTime.getTime();
      });

    return upcomingEvents.length > 0 ? upcomingEvents : undefined;
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

  filteredParticipants() {
    if (!this.searchTerm) {
      return this.events;
    }

    return this.events.filter((events) =>
      `${events.title} ${events.type}`
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase())
    );
  }

  navigateToAddEvent(): void {
    this.router.navigate(['/home/events/addEvent']);
  }

  navigateToEventDetailsPage(event: ResponseEventDTO): void {
    this.router.navigate(['/home/eventDetails'], {
      state: { event: event, scheduleIndex: this.scheduleIndexes[event.id] },
    });
  }
}
