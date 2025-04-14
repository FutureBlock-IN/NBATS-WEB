import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { catchError, shareReplay, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { AuthDataService } from '../auth/AuthData.service';

@Injectable({
  providedIn: 'root'
})
export class EmailCheckService {
  private apiUrl = `${environment.ApiUrl.uri}`;

  constructor(private http: HttpClient, private authDataService: AuthDataService) {}

  checkEmail(email: string): Observable<any[]> {
    const url = `${this.apiUrl}/api/signup/check-by-email?email=${encodeURIComponent(email)}`;
    const headers = new HttpHeaders().set('accept', 'application/json');
  
    return from(this.authDataService.initialize()).pipe(
      switchMap(() => {
        return this.http.get<any[]>(url, { headers });
      }),
      shareReplay({ bufferSize: 1, refCount: true, windowTime: 30000 }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error checking email:', error);
        return throwError(() => new Error('Failed to check email'));
      })
    );
  }
  
}
