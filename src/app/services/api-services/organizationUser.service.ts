import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { ResponseUserDTO } from '../../models/serviceModels/user/responseUser';
import { AppHttpHeaders } from '../auth/AppHttpHeaders.service';
import { OrganizationData } from '../../models/authModels/organization';
import { baseUser } from '../../models/serviceModels/user/baseUser';
import { UpdateUserDTO } from '../../models/serviceModels/user/updateUser';
@Injectable({
  providedIn: 'root',
})
export class OrganizationUserService {
  private apiUrl = `${environment.ApiUrl.uri}`;
  constructor(private http: HttpClient, private httpHeaders: AppHttpHeaders) {}

  getUsersByRole(role: string): Observable<ResponseUserDTO[]> {
    const url = `${this.apiUrl}/api/OrganizationUser/filter-by-role?role=${role}`;
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http.get<ResponseUserDTO[]>(url, { headers });
  }

  async getOrganizationUserById(id: number): Promise<ResponseUserDTO> {
    const url = `${this.apiUrl}/api/OrganizationUser/${id}`;
    const headers = this.httpHeaders.getDefaultHeaders();

    try {
      const response = await firstValueFrom(
        this.http.get<ResponseUserDTO>(url, { headers })
      );
      return response;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  CreateOrganization(OrganizationData: OrganizationData) {
    const url = `${environment.ApiUrl.uri}/api/signup/register-organization`;

    return this.http
      .post<any>(url, OrganizationData, {
        headers: {
          'Content-Type': 'application/json',
          accept: 'text/plain',
        },
      })
      .pipe();
  }

  createUser(userData: baseUser): Observable<ResponseUserDTO> {
    const url = `${this.apiUrl}/api/OrganizationUser`;
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http.post<ResponseUserDTO>(url, userData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error?.error || 'Failed to create user';
        console.error('Error creating user:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateUser(userData: UpdateUserDTO): Observable<void> {
    const url = `${this.apiUrl}/api/OrganizationUser`;
    const headers = this.httpHeaders.getDefaultHeaders();
    return this.http.put<void>(url, userData, { headers });
  }
  createChildGuardian(childId: number, guardianId: number): Observable<any> {
    const url = `${this.apiUrl}/api/ChildGuardian`;
    const body = {
      childId: childId,
      guardianId: guardianId,
    };
    return this.http.post<any>(url, body).pipe();
  }
}
