import { SbAuthenticationService } from '../auth/sb-authentication.service';
import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Message } from 'primeng/primeng';
import { Router, ActivatedRoute } from '@angular/router';
import { SbPropertiesService } from 'src/services/sb-properties.service';
import { AppConfig } from '../config/app.config';
import { HttpClient } from '@angular/common/http';
import { Sbmessage } from 'src/model/sb-messages';

@Component({
  selector: 'app-sb-forgot-password',
  template: `
  <div class="card login-panel ui-fluid sb-login-panel">
  <app-sb-messages [messages]="msgs"></app-sb-messages>
  <div class="ui-g">
    <div class="ui-g-12">
      <span class="md-inputfield">
        <input pInputText #email id="email" type="text" autocomplete="off"
          class="ui-inputtext ui-corner-all ui-state-default ui-widget">
        <label>E-mail</label>
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
export class SbForgotPasswordComponent implements OnInit, OnDestroy {
  @ViewChild('email', { static: true }) email: ElementRef;

  msgs: Sbmessage[] = [];

  baseUrl: String;

  constructor(
    private config: AppConfig,
    private router: Router,
    private renderer: Renderer2,
    private http: HttpClient,
    private route: ActivatedRoute
) {
    this.baseUrl = config['gatewayBaseUrl'];
    if (this.route.snapshot.queryParams.expired) {
      const message: Message = {summary: 'Sorry, your token expired!', detail: 'We need to resend your token link.', severity: 'error'};
      this.msgs = [message];
    }
  }

  submit() {
    const emailString = this.email.nativeElement.value;
    this.http.get(this.baseUrl + '/reset/password', {params: {'email': emailString}})
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
      this.msgs = error;
    });
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
