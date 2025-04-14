import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { EventUserResponse, UserEventsResponse } from '../../models/serviceModels/eventUser/EventUserResponse';

@Injectable({
  providedIn: 'root'
})
export class EventUserService {
  private apiUrl = `${environment.ApiUrl.uri}`;

  constructor(private http: HttpClient) { }

  getUsers(eventId: number): Observable<EventUserResponse[]> {
    const url = `${this.apiUrl}/api/EventUser`;

    const params = new HttpParams().set('eventId', eventId.toString());
  
    return this.http.get<any>(url, { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error?.error || 'Failed to retrieve users';
        console.error('Error retrieving users:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getEventsByUserId(userId: number): Observable<UserEventsResponse[]>{
    const url = `${this.apiUrl}/api/EventUser/List`;

    const params = new HttpParams().set('organizationUserId', userId.toString());

    return this.http.get<UserEventsResponse[]>(url, { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error?.error || 'Failed to retrieve events';
        console.error('Error retrieving events:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  deleteUser(eventId: number, organizationUserId: number): Observable<any> {
    const url = `${this.apiUrl}/api/EventUser`;
  
    const body = {
      eventId: eventId,
      organizationUserId: organizationUserId
    };
  
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    return this.http.request<any>('DELETE', url, { headers, body }).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error?.error || 'Failed to delete user';
        console.error('Error deleting user:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  

  assignUser(eventId: number, organizationUserId: number): Observable<any> {
    const url = `${this.apiUrl}/api/EventUser`;
    const body = {
      eventId: eventId,
      organizationUserId: organizationUserId
    };

    return this.http.post<any>(url, body).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error?.error || 'Failed to assign user';
        console.error('Error assigning user:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
