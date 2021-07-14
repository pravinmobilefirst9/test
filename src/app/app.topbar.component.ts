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
@Component({
  selector: 'app-topbar',
  template: `
    <div class="topbar clearfix" z-index="20">
      <p-confirmDialog></p-confirmDialog>
      <a id="menu-buttons" href="#" class="menu-buttons-harburger" (click)="app.onMenuButtonClick($event)">
        <i class="material-icons">menu</i>
      </a>
      <div>
        <div class="topbarLogo"></div>
      </div>
      <div class="topbar-right">
        <a
          id="topbar-menu-button"
          href="#"
          (click)="app.onTopbarMenuButtonClick($event)"
        >
          <i class="material-icons" style="color: #37464e;">more_vert</i>
        </a>
        <ul
          class="topbar-items animated fadeInDown" style="width: max-content;top: 58px;background: white;"
          [ngClass]="{ 'topbar-items-visible': app.topbarMenuActive }"
        >
          <li
            #profile
            class="profile-item"
            *ngIf="app.profileMode === 'top' || app.isHorizontal()"
            [ngClass]="{ 'active-top-menu': app.activeTopbarItem === profile }"
          >
            <ul class="ultima-menu animated fadeInDown">
              <li role="menuitem">
                <a href="#" (click)="app.onTopbarSubItemClick($event)">
                  <i class="material-icons">person</i>
                  <span>Profile</span>
                </a>
              </li>
              <li role="menuitem">
                <a href="#" (click)="app.onTopbarSubItemClick($event)">
                  <i class="material-icons">security</i>
                  <span>Privacy</span>
                </a>
              </li>
              <li role="menuitem">
                <a href="#" (click)="app.onTopbarSubItemClick($event)">
                  <i class="material-icons">settings_applications</i>
                  <span>Settings</span>
                </a>
              </li>
              <li role="menuitem">
                <a (click)="onLogout()">
                  <i class="material-icons">power_settings_new</i>
                  <span>Logout</span>
                </a>
              </li>
            </ul>
          </li>
          <li
            #user_menu
            [ngClass]="{ 'active-top-menu': app.activeTopbarItem === user_menu }"
          >
            <a href="#" (click)="app.onTopbarItemClick($event, user_menu)">
              <i class="topbar-icon material-icons arrow-btn" style="color: #22606c !important">account_circle</i>
              <span class="topbar-item-name" style="padding-right: 10px;">{{ userName }}</span>
              <i class="topbar-icon material-icons arrow-btn" style="font-size: 26px;color: #22606c !important">keyboard_arrow_down</i>
            </a>
            <ul class="ultima-menu animated fadeInDown cell-standard-value topbar-dropdown" style="width: min-content;padding: 8px 13px;">
              <li role="menuitem" class="" style="cursor:pointer; font-size: 17px;" >
                <a>
                  <i class="topbar-icon material-icons arrow-btn">person</i>
                  <span class="topbar-item-name">{{ userName }}</span>
                </a>
              </li>
              <li role="menuitem" class="" style="cursor: pointer;display: flex;white-space: pre-wrap;flex-direction: row;padding: 2px 12px;">
                <span *ngFor="let roles of userRoles" class="topbar_userRoles" title="User Role">{{roles.toLowerCase()}}</span>
              </li>
              <li role="menuitem" class="p-col-12">
                <a href="#">
                  <i class="material-icons">settings</i>
                  <span>Settings</span>
                </a>
              </li>              
              <hr />
              <li role="menuitem" class="p-col-12">
                <a (click)="onLogout()">
                  <i class="material-icons">power_settings_new</i>
                  <span>Logout</span>
                </a>
              </li>              
            </ul>
          </li>
          <li
            #settings
            [ngClass]="{ 'active-top-menu': app.activeTopbarItem === settings }"
          >
            <a href="#" (click)="app.onTopbarItemClick($event, settings)" style="margin: 4px auto;display: flex;flex-direction: row;">
              <i class="topbar-icon material-icons arrow-btn" style="font-size: 24px;color: #22606c !important;">monetization_on</i>
              <span style="font-weight: 600;font-size: 20px;vertical-align: super;color: #22606c !important;line-height: 1.3;" class="">{{baseCurrency}}</span>
              <i class="topbar-icon material-icons arrow-btn" style="font-size: 26px;color: #b24c66 !important;color: #22606c !important;/* margin-left: -14px; */">keyboard_arrow_down</i>
            </a>
            <ul class="ultima-menu animated fadeInDown cell-standard-value topbar-dropdown">
              <li class="p-col-12 p-lg-offset-3"><span style="font-weight:400;font-size: small;margin-top: 4px;vertical-align: bottom;">Base CCY </span><span style="font-weight:600;font-size: large;margin-top: 4px;">{{baseCurrency}}</span></li>
              <li role="menuitem" class="" style="cursor:pointer" >
                <a (click)="onCurrencySelected('SEK')">
                  <span>SEK</span>
                </a>
              </li>
              <li role="menuitem" class="" style="cursor:pointer">
                <a  (click)="onCurrencySelected('USD')">
                  <span>USD</span>
                </a>
              </li>
              <li role="menuitem" class="" style="cursor:pointer">
                <a (click)="onCurrencySelected('EUR')">
                  <span>EUR</span>
                </a>
              </li>
              <li role="menuitem" class="" style="cursor:pointer">
                <a (click)="onCurrencySelected('GBP')">
                  <span>GBP</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class AppTopbarComponent implements AfterViewInit, OnDestroy {
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
    public confirmationService: ConfirmationService
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
