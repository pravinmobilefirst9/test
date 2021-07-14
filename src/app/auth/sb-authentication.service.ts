import { Injectable, OnInit } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import qs from 'qs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AppConfig } from 'src/app/config/app.config';
import { Observable } from 'rxjs';
import { UserInfo } from './user-info';

@Injectable({
  providedIn: 'root'
})
export class SbAuthenticationService {
  userInfo;
  userInfoSubject = new BehaviorSubject<UserInfo>(
    new UserInfo('SWIP User', ['MANAGER', 'FINANCIAL ADVISOR'])
  );
  token: string;
  refresh_token: string;
  expires_in: number;

  constructor(private http: HttpClient, private appConfig: AppConfig) {
  }

  isAuthenticated(): boolean {
    return this.hasValidToken() || this.appConfig.bypassLogin;
  }

  hasValidToken(): boolean {
    // Todo - validate expired token etc here.
    return this.token ? true : false;
  }

  async authenticateUser(username, password): Promise<void> {
    await this.requestAccessToken(username, password)
      .toPromise()
      .then(res => {
        this.handleAuthenticationResponse(res);
        this.updateUserInfo();
      });
  }

  private refreshToken() {
    if (this.refreshToken) {

      const headers = this.getBasicAuthenticateHeaders();
      const body = {
        'grant_type': 'refresh_token',
        'refresh_token': this.refresh_token
      };

      this.http.post(
        `${this.appConfig.gatewayBaseUrl}/oauth/token`,
        qs.stringify(body),
        {
          headers: headers
        }
      ).toPromise().then(res => {
        this.handleAuthenticationResponse(res);
      });
    }
  }

  private requestAccessToken(username, password): Observable<Object> {
    const headers = this.getBasicAuthenticateHeaders();
    const body = {
      grant_type: 'password',
      username: username,
      password: password
    };

    return this.http.post(
      `${this.appConfig.gatewayBaseUrl}/oauth/token`,
      qs.stringify(body),
      {
        headers: headers
      }
    );
  }

  private handleAuthenticationResponse(res) {
    this.token = res['access_token'];
    this.refresh_token = res['refresh_token'];
    this.expires_in = res['expires_in'];
    if (this.expires_in) {
      setTimeout(() => this.refreshToken(), (this.expires_in * 1000) - 10000);
    }
  }

  private updateUserInfo(): any {
    this.getUserInfo().subscribe(
      userInfo => {
        this.userInfo = userInfo;
        this.publishUserInfo();
      },
      err => {
        // todo - how do we handle this?
        console.log('Could not load user information from token! ' + err);
      }
    );
  }

  private getBasicAuthenticateHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    if (this.appConfig.basicAuthenticationHeader) {
      headers = headers.set(
        'Authorization',
        this.appConfig.basicAuthenticationHeader
      );
    }
    return headers;
  }

  private publishUserInfo() {
    const userN = this.getUserName();
    const roles = this.getRoles();
    const userInfo = new UserInfo(userN, roles);
    this.userInfoSubject.next(userInfo);
  }

  getUserInfo(): Observable<any> {
    return this.http.get(`${this.appConfig.gatewayBaseUrl}/users/me`);
  }

  getToken() {
    return this.token;
  }

  getHeaderWithToken() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`
    });
    return headers;
  }

  addTokenToXhr(xhr) {
    xhr.setRequestHeader('Authorization', `Bearer ${this.getToken()}`);
  }

  getUserName() {
    if (this.userInfo) {
      return this.userInfo.details.decodedDetails.user_name;
    } else if (this.appConfig.bypassLogin) {
      return 'SWIP User';
    } else {
      return 'n/a';
    }
  }

  getScopes(): any[] {
    if (this.userInfo && this.userInfo.oauth2Request) {
      return this.userInfo.oauth2Request.scope;
    } else {
      return [];
    }
  }

  isAuthorized(accessright: String): Boolean {
    return this.getScopes().includes(accessright);
  }

  getRoles() {
    if (this.userInfo) {
      return this.userInfo.details.decodedDetails.authorities;
    } else {
      return [];
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    this.token = undefined;
    this.refresh_token = undefined;
    this.expires_in = undefined;
    this.userInfo = undefined;
  }
}
