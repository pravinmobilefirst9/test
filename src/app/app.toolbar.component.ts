import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { AppComponent } from './app.component';
import { SbAuthenticationService } from 'src/app/auth/sb-authentication.service';
import { Observable, Subscription } from 'rxjs';
import { UserInfo } from './auth/user-info';
import { AppConfig } from './config/app.config';
import { HttpClient } from '@angular/common/http';
import { SbEventBusService } from '../services/sb-event-bus.service';
import { SbEventTopic } from 'src/services/sb-event-topic';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import {TooltipModule} from 'primeng/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-toolbar',
  template: `
    <mat-toolbar color="primary">
      <button
        type="button"
        aria-label="Toggle sidenav"
        mat-icon-button
        (click)="drawer.toggle()"
        *ngIf="isHandset$ | async">
        <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
      </button>
      <span>Logo</span>
    </mat-toolbar>
  `
})
export class AppToolbarComponent implements AfterViewInit, OnDestroy {
  observable: Observable<UserInfo>;
  subscription: Subscription;
  baseCurrency: String = '';
  userDetails: string;
  userName: string;
  userRoles: string[];
  version: String;
  serverVersion: any;

  constructor(
    public app: AppComponent,
    private appConfig: AppConfig,
    private authentication: SbAuthenticationService,
    private http: HttpClient,
    private eventBusService: SbEventBusService,
    private router: Router,
    public confirmationService: ConfirmationService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.baseCurrency = appConfig.defaultBaseCurrency;

    this.eventBusService.getObservable(SbEventTopic.BaseCurrencySelected).subscribe(
      event => {
        if (event != null && event.source === 'base-currency-selection') {
          this.baseCurrency = event.payload.value;
        }
      },
      error => console.log(error)
    );

   }


  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches),
    shareReplay()
  );
  
  ngAfterViewInit(): void {
    const headers = this.authentication.getHeaderWithToken();
    this.http.get(this.appConfig.gatewayBaseUrl + '/app/buildVersion', {headers: headers})
    .toPromise().then(response => {
      console.log('Server version: ' + response['version']);
      this.serverVersion = response['version'];
    });

    if (this.authentication.isAuthenticated()) {
      setTimeout(() => {
        this.version = this.appConfig.buildVersion;
        this.observable = this.authentication.userInfoSubject;
        this.subscription = this.observable.subscribe(userInfo => {
          this.userDetails = userInfo.toString();
          this.userName = userInfo.username;
          this.userRoles = userInfo.uglyfyRoles();
        });
        console.log('userdetails:  ' + this.userDetails);
        console.log('userName:  ' + this.userName);
      });
    }

  }

  onLogout() {
    this.confirmationService.confirm({
      header: 'Logout',
      message: `Press Yes to confirm logout.`,
      icon: 'fa fa-question-circle',
      accept: () => {
        this.router.navigate(['logout']);
      }
    });
  }
  
  onCurrencySelected(currency: string) {
    this.eventBusService.emit({
      source: 'base-currency-selection',
      topic: SbEventTopic.BaseCurrencySelected,
      payload: {
        value: currency
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
