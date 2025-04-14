import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AppHttpHeaders {
    getDefaultHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'accept': 'text/plain'
        });
    }
}