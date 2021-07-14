import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import {
  createUserFormFields,
  userModel
} from '../sb-form-configuration/sb-user-form';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { SbAuthenticationService } from 'src/app/auth/sb-authentication.service';
import { Message } from 'primeng/primeng';
import { AppConfig } from '../config/app.config';
import { Sbmessage } from 'src/model/sb-messages';

@Component({
  selector: 'app-sb-user-form',
  templateUrl: './sb-user-form.component.html',
  styleUrls: ['./sb-user-form.component.scss']
})
export class SbUserFormComponent implements OnInit {
  form = new FormGroup({});
  model = userModel;
  fields: FormlyFieldConfig[] = createUserFormFields;
  options: FormlyFormOptions = {};
  gatewayBaseUrl: string;
  msgs: Sbmessage[] = [];
  title = 'Add User';

  constructor(
    private http: HttpClient,
    private authenticationService: SbAuthenticationService,
    private appConfig: AppConfig
  ) {
    this.gatewayBaseUrl = appConfig.gatewayBaseUrl;
  }

  ngOnInit() { }

  submit(model) {
    if (this.form.valid) {
      const token = this.authenticationService.userInfo.details.tokenValue;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      });
      console.log(JSON.stringify(this.model));
      this.http
        .post(
          `${this.gatewayBaseUrl}/users/`,
          {
            email: this.model.userInfo.email,
            password: this.model.password.password,
            roles: [this.model.userInfo.roles]
          },
          {
            headers: headers
          }
        )
        .subscribe(
          data => console.log('Success: ' + data),
          error => {
            this.msgs = [];
            this.msgs.push({
              severity: 'error',
              summary: 'Failed to save user',
              detail: error.error
            });
            console.error('Failure: ' + JSON.stringify(error));
          }
        );
      console.log(model);
    } else {
      console.log(`Form is not valid ${this.form.errors}`);
    }
  }
}
