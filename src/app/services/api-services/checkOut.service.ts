import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { AppHttpHeaders } from '../auth/AppHttpHeaders.service';

@Injectable({
  providedIn: 'root'
})
export class CheckOutService {
  private apiUrl = `${environment.ApiUrl.uri}`;

  constructor(private http: HttpClient, private httpHeaders: AppHttpHeaders) { }

  checkOutUser(eventId: number, eventScheduleId: number, eventUserId: number, guardianId: number | null): Observable<any> {
    const url = `${this.apiUrl}/api/CheckOut`;
    const body = {
      eventId: eventId,
      eventScheduleId: eventScheduleId,
      eventUserId: eventUserId,
      guardianId: guardianId
    };
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http.post<any>(url, body, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.error || 'Failed to check out user';
        console.error('Error checking out user:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
