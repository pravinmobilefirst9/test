import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { AppComponent } from './app.component';
import { AppConfig } from './config/app.config';
import { SbAuthenticationService } from 'src/app/auth/sb-authentication.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-footer',
  template: `
    <div class="footer sb-footer-wrapper">
      <div class="card clearfix">
        <span class="footer-text-left">Swimbird Portfolio Platform</span>
        <span class="material-icons ui-icon-copyright"></span>
        <span>Swimbird AB</span>
        <div>
          <div class="footer-text-right">
            <span style="font-size: 12px;">Client: {{version}} | Server: {{serverVersion}}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppFooterComponent implements AfterViewInit {

  version: String;
  serverVersion: String;

  constructor(
    public app: AppComponent,
    private appConfig: AppConfig,
    private authentication: SbAuthenticationService,
    private http: HttpClient,
  ) {}

  ngAfterViewInit(): void {
    const headers = this.authentication.getHeaderWithToken();
    this.http.get(this.appConfig.gatewayBaseUrl + '/app/buildVersion', {headers: headers})
    .toPromise().then(response => {
      this.serverVersion = response['version'];
    });

    setTimeout(() => {
      this.version = this.appConfig.buildVersion;
    }, 100);
  }
}
