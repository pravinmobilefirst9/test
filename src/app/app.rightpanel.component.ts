import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { AppComponent } from './app.component';
import { ScrollPanel } from 'primeng/scrollpanel';
import { AppConfig } from './config/app.config';
import { HttpClient } from '@angular/common/http';
import { SbAuthenticationService } from './auth/sb-authentication.service';

@Component({
  selector: 'app-rightpanel',
  template: `
    <div
      class="layout-rightpanel"
      [ngClass]="{ 'layout-rightpanel-active': app.rightPanelActive }"
      (click)="app.onRightPanelClick()"
    >
      <p-scrollPanel #scrollRightPanel [style]="{ height: '100%' }">
        <div class="layout-rightpanel-wrapper">
          <div class="layout-rightpanel-header">
            <div class="weather-day">About</div>
          </div>

          <div class="layout-rightpanel-content">
            <h2>Client build version</h2>
            <span>{{version}}</span>
            <h2>Server build version</h2>
            <span>{{serverVersion}}</span>
          </div>
        </div>
      </p-scrollPanel>
    </div>
  `
})
export class AppRightpanelComponent implements AfterViewInit {
  @ViewChild('scrollRightPanel', { static: true }) rightPanelMenuScrollerViewChild: ScrollPanel;

  constructor(public app: AppComponent, private appConfig: AppConfig, private http: HttpClient, private authentication: SbAuthenticationService) {}
  version: String;
  serverVersion: String;

  ngAfterViewInit() {
    const headers = this.authentication.getHeaderWithToken();
    this.http.get(this.appConfig.gatewayBaseUrl + '/app/buildVersion', {headers: headers})
    .toPromise().then(response => {
      console.log('Server version: ' + response['version']);
      this.serverVersion = response['version'];
    });

    setTimeout(() => {
      this.version = this.appConfig.buildVersion;
      this.rightPanelMenuScrollerViewChild.moveBar();
    }, 100);
  }
}
