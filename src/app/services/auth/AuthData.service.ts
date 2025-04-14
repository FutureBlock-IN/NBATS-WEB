import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // This makes the service available throughout your application
})
export class AuthDataService {
  private authToken: string | null = null;
  private role: string | null = null;
  private organizationId: string | null = null;
  private email: string | null = null;
constructor(){
  this.authToken = localStorage.getItem('auth0-token');
  this.role = localStorage.getItem('role');
  this.organizationId = localStorage.getItem('organizationId');
  this.email = localStorage.getItem('email');
}
initialize(): Promise<void> {
  return new Promise<void>((resolve) => {
    this.authToken = localStorage.getItem('auth0-token');
    this.role = localStorage.getItem('role');
    this.organizationId = localStorage.getItem('organizationId');
    this.email = localStorage.getItem('email');
    resolve();
  });
}
  setAuthData( role: string, organizationId: string, email: string): void {
    this.role = role;
    this.organizationId = organizationId;
    this.email = email;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  getRole(): string | null {
    return this.role;
  }

  getOrganizationId(): string | null {
    return this.organizationId;
  }

  getEmail(): string | null {
    return this.email;
  }

  clearAuthData(): void {
    this.authToken = null;
    this.role = null;
    this.organizationId = null;
    this.email = null;
  }
}
