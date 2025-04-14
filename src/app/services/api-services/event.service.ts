import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { AppHttpHeaders } from '../auth/AppHttpHeaders.service';
import { Event } from '../../models/serviceModels/event/baseEvent';
import { createEventDTO } from '../../models/serviceModels/event/createEvent';
import { ResponseEventDTO } from '../../models/serviceModels/event/responseEvent';
import { PostEventScheduleConfigDTO } from '../../models/serviceModels/event/baseEventSchedule';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { EventActivityDTO } from '../../models/serviceModels/eventActivity/eventActivity';
import { MainResponseEvent } from '../../models/serviceModels/event/mainResponseEvent';
import { EventScheduleResponseDTO } from '../../models/serviceModels/event/eventScheduleResponse';
import { CacheService } from './cache.service';
import { UserEventsResponse } from '../../models/serviceModels/eventUser/EventUserResponse';
@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(
    private http: HttpClient,
    private httpHeaders: AppHttpHeaders,   
  ) {}

 
  getEventsByOwnerID() {
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http.get<ResponseEventDTO[]>(`${environment.ApiUrl.uri}/api/Event`, { headers });
} 

  createEventRecord(event: createEventDTO) {
    const headers = this.httpHeaders.getDefaultHeaders();
    const body = {
      title: event.title,
      type: event.type,
      status: event.status,
      description: event.description,
      locationNotes: event.locationNotes,
      logoUrl: event.logoUrl,
    };
    return this.http.post(`${environment.ApiUrl.uri}/api/Event`, body, {
      headers,
    });
  }
  getEventByEventId(eventId: number) {
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http.get<ResponseEventDTO>(
      `${environment.ApiUrl.uri}/api/Event/${eventId}`,
      { headers }
    );
  }

  getAllEventsDashboard(): Observable<ResponseEventDTO[]> {
    const headers = this.httpHeaders.getDefaultHeaders();
    
    return this.http.get<ResponseEventDTO[]>(
      `${environment.ApiUrl.uri}/api/Event/allevents`, 
      { headers }
    );
  }
  

  getEventActivity(eventId: number) {
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http
      .get<EventActivityDTO[]>(
        `${environment.ApiUrl.uri}/api/EventActivity?eventId=${eventId}`,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error checking email:', error);
          return throwError(() => new Error('Failed to check email'));
        })
      );
  }

  getEventActivityByIdDate(eventId: number, eventDate: string) {
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http
      .get<EventActivityDTO[]>(
        `${environment.ApiUrl.uri}/api/EventActivity/eventactivitybydate?eventId=${eventId}&eventDate=${eventDate}`,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching event activity:', error);
          return throwError(() => new Error('Failed to fetch event activity'));
        })
      );
  }

  getEventActivityByUserId(eventId: number, eventUserId: number) {
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http
      .get<EventActivityDTO[]>(
        `${environment.ApiUrl.uri}/api/EventActivity/eventactivitybyeventuser?eventId=${eventId}&eventUserId=${eventUserId}`,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching event activity:', error);
          return throwError(() => new Error('Failed to fetch event activity'));
        })
      );
  }

  getFullEventByEventId(eventId: number) {
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http.get<MainResponseEvent>(
      `${environment.ApiUrl.uri}/api/Event/${eventId}`,
      { headers }
    );
  }

  getEventUsersbyEventId(eventId: number): Observable<UserEventsResponse[]> {
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http.get<UserEventsResponse[]>(
      `${environment.ApiUrl.uri}/api/EventUser?eventId=${eventId}`,
      { headers }
    );
  }

  createEventScheduleConfig(config: PostEventScheduleConfigDTO) {
    const {
      eventId,
      startTime,
      endTime,
      duration,
      recurring,
      repeat,
      weekDays,
    } = config;

    let finalConfig: any = {
      eventId,
      startTime,
      endTime,
      duration,
      recurring,
    };

    if (recurring) {
      finalConfig = {
        ...finalConfig,
        repeat,
        weekDays,
      };
    }

    return this.http.post(
      `${environment.ApiUrl.uri}/api/EventScheduleConfig`,
      finalConfig
    );
  }

  UpdateEventScheduleConfig(config: PostEventScheduleConfigDTO) {
    const {
      eventId,
      startTime,
      endTime,
      duration,
      recurring,
      repeat,
      weekDays,
    } = config;

    let finalConfig: any = {
      eventId,
      startTime,
      endTime,
      duration,
      recurring,
    };

    if (recurring) {
      finalConfig = {
        ...finalConfig,
        repeat,
        weekDays,
      };
    }

    return this.http.put(
      `${environment.ApiUrl.uri}/api/EventScheduleConfig`,
      finalConfig
    );
  }

  updateEvent(event: Event, id: number) {
    const headers = this.httpHeaders.getDefaultHeaders();
    const body = {
      eventId: id,
      title: event.title,
      type: event.type,
      status: event.status,
      description: event.description,
      locationNotes: event.locationNotes,
      logoUrl: event.logoUrl,
    };
    return this.http.put(`${environment.ApiUrl.uri}/api/Event/`, body, {
      headers,
    });
  }

  startEventSchedule(id: number): Observable<{
    id: number;
    startTime: string;
    endTime: string;
    checkoutStartedTime: string;
    inProgress: boolean;
    checkoutEndedTime: string;
  }> {
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http.post<{
      id: number;
      startTime: string;
      endTime: string;
      checkoutStartedTime: string;
      inProgress: boolean;
      checkoutEndedTime: string;
    }>(`${environment.ApiUrl.uri}/api/EventSchedule/${id}/start`, null, {
      headers,
    });
  }

  endEventSchedule(id: number): Observable<{
    id: number;
    startTime: string;
    endTime: string;
    checkoutStartedTime: string;
    inProgress: boolean;
    checkoutEndedTime: string;
  }> {
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http.post<{
      id: number;
      startTime: string;
      endTime: string;
      checkoutStartedTime: string;
      inProgress: boolean;
      checkoutEndedTime: string;
    }>(`${environment.ApiUrl.uri}/api/EventSchedule/${id}/end`, null, {
      headers,
    });
  }
}
