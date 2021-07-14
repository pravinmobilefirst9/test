import { SbAuthenticationService } from '../auth/sb-authentication.service';
import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Message } from 'primeng/primeng';
import { Router } from '@angular/router';
import { SbPropertiesService } from 'src/services/sb-properties.service';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../config/app.config';
import { Sbmessage } from 'src/model/sb-messages';

@Component({
  selector: 'app-sb-forgot-password',
  template: `
  <div class="card login-panel ui-fluid sb-login-panel">
  <app-sb-messages [messages]="msgs"></app-sb-messages>
  <div class="ui-g">
    <div class="ui-g-12">
      <span class="md-inputfield">
        <input pPassword #password id="pass" type="password" [feedback]="false" autocomplete="off"
          class="ui-inputtext ui-corner-all ui-state-default ui-widget">
        <label>Password</label>
      </span>
    </div>
    <div class="ui-g-12">
      <span class="md-inputfield">
        <input pPassword #password2 id="pass" type="password" [feedback]="false" autocomplete="off"
          class="ui-inputtext ui-corner-all ui-state-default ui-widget">
        <label>Confirm Password</label>
      </span>
    </div>
    <div class="ui-g-12">
      <button (click)="submit()" type="button"
        class="ui-button ui-widget ui-state-default ui-corner-all">
        <span class="ui-button-text ui-c">Submit</span>
      </button>
      <button (click)="back()" type="button"
        class="secondary flat ui-button ui-widget ui-state-default">
        <span class="ui-button-text ui-c">Back to login</span>
      </button>
    </div>
  </div>
</div>

`})
export class SbResetPasswordComponent implements OnInit, OnDestroy {
  @ViewChild('password', { static: true }) password: ElementRef;
  @ViewChild('password2', { static: true }) password2: ElementRef;

  msgs: Sbmessage[] = [];

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private http: HttpClient,
    private config: AppConfig
  ) {
  }

  submit() {
    const passwordValue: String = this.password.nativeElement.value;
    const passwordValue2: String = this.password2.nativeElement.value;
    if (passwordValue.length === 0) {
      const message: Message = {detail: 'Password cannot be empty', severity: 'error'};
      this.msgs = [message];
    } else if (passwordValue !== passwordValue2) {
      const message: Message = {detail: 'Passwords did not match', severity: 'error'};
      this.msgs = [message];
    } else {
      this.http.post(this.config.gatewayBaseUrl + '/password/save', {password: passwordValue}, {withCredentials: true})
      .subscribe(response => {
        if (response.hasOwnProperty('error')) {
          const message: Message = {detail: response['error'], severity: 'error'};
          this.msgs = [message];
        } else if (response.hasOwnProperty('message')) {
          const message: Message = {detail: response['message'], severity: 'success'};
          this.msgs = [message];
        }
      },
      error => {
        const message: Message = {detail: error.error, severity: 'error'};
        this.msgs = [message];
    });
    }
  }

  back() {
    this.router.navigate(['/']);
  }

  ngOnInit() {
    this.renderer.addClass(document.body, 'sb-login-body');
  }
  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'sb-login-body');
  }
}
