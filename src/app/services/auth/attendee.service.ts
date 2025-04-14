import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalHeaders } from './GlobalHeaders';
import { environment } from '../../../environments/environment.development';
import { Attendee } from '../../models/serviceModels/attendee';

@Injectable({
  providedIn: 'root'
})
export class AttendeeService {
  private apiUrl = `${environment.ApiUrl.uri}`;

  constructor(private http: HttpClient) { }

  createAttendee(attendee: Attendee): Observable<any> {
    const api = '${environment.ApiUrl.uri}/attendees';
    const headers = GlobalHeaders.getHeaders();
    return this.http.post(api, { headers });
  }

  getAllAttendees(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getAttendeeById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateAttendee(id: number, attendee: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, attendee);
  }

  deleteAttendee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}