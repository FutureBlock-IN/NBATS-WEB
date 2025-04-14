import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class authAPI {
    constructor(private http: HttpClient) { }

    createUser(user: any) {
        return this.http.post('http://localhost:3000/api/auth/signup', user).pipe(
            catchError(this.handleError)
        );
    }

    loginUser(user: any) {
        return this.http.post('http://localhost:3000/api/auth/login', user).pipe(
            catchError(this.handleError)
        );
    }

    getProfile() {
        return this.http.get('http://localhost:3000/api/auth/profile').pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: any) {
        // Handle the error here
        // For example, log it or return a user-friendly error message
        console.error('An error occurred:', error.error);
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }
}