import { SbAuthenticationService } from '../auth/sb-authentication.service';
import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Message } from 'primeng/primeng';
import { Router } from '@angular/router';
import { SbPropertiesService } from 'src/services/sb-properties.service';
import { UserIdleService } from 'angular-user-idle';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sbmessage } from 'src/model/sb-messages';

@Component({
  selector: 'app-sb-login',
  templateUrl: './sb-login.component.html',
  styleUrls: ['./sb-login.component.scss']
})
export class SbLoginComponent implements OnInit, OnDestroy {
  @ViewChild('user', { static: true }) userElement: ElementRef;
  @ViewChild('password', { static: true }) passwordElement: ElementRef;

  loginForm: FormGroup;

  msgs: Sbmessage[] = [];

  constructor(
    private authentication: SbAuthenticationService,
    private propertiesService: SbPropertiesService,
    private router: Router,
    private renderer: Renderer2,
    private idleService: UserIdleService,
    private formBuilder: FormBuilder
  ) {

  }

  ngOnInit() {
    this.renderer.addClass(document.body, 'sb-login-body');

    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  login() {
    this.msgs = [];
    const user = this.loginForm.value.username;
    const password = this.loginForm.value.password;
    this.authentication
      .authenticateUser(user, password)
      .then(() => {
        this.msgs = [];
        this.msgs.push({
          severity: 'success',
          summary: 'Login Success'
        });
      })
      .then(() => {
        console.log('Start watching for idle activity');
        this.idleService.startWatching();
      })
      .then(() => {
        this.propertiesService.loadProperties();
      })
      .then(() => {
        this.router.navigate(['/']);
      })
      .catch(err => {
        const errorMessage = err.error_description || err.error;
        this.msgs = [];
        this.msgs.push({
          severity: 'error',
          summary: 'Invalid Username or Password',
          detail: errorMessage
        });
        console.error('Error during login: ' + JSON.stringify(err));
      });
  }

  forgotPassword() {
    this.router.navigate(['forgot-password']);
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'sb-login-body');
  }
}
