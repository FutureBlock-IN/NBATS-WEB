import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = `${environment.ApiUrl.uri}/api/UploadFile`;

  constructor(private http: HttpClient) { }

  uploadImage(containerName: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('ContainerName', containerName);

    return this.http.post(`${this.apiUrl}`, formData, { responseType: 'text' }).pipe(
      map((response: string) => {
        console.log('Uploaded Image URL:', response);
        return response;
      })
    );
  }
}