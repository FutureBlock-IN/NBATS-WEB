import { HttpHeaders } from '@angular/common/http';
import { AuthorizationProps } from '../secrets/secretKey';


export class GlobalHeaders {
  static basicAuthService = new AuthorizationProps();

  static getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': this.basicAuthService.getbasicAuth(),
      'Content-Type': 'application/json'
    });
  }
}