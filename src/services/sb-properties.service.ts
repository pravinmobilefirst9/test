import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from 'src/app/config/app.config';
import { Observable } from 'rxjs';
import { SbAuthenticationService } from '../app/auth/sb-authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SbPropertiesService {
  properties: any;

  constructor(
    private http: HttpClient,
    private config: AppConfig,
    private authService: SbAuthenticationService
  ) {}

  public loadProperties(): Promise<any> {
    const headers = this.authService.getHeaderWithToken();
    const url = this.config.propertiesConfigurationBaseUrl;
    return this.http
      .get(url, { headers })
      .toPromise()
      .then(content => {
        this.properties = content;
      });
  }

  public getProperty(key: string): string {
    return this.properties ? this.properties[key] || key : key;
  }
}
