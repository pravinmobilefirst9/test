import { AppConfig } from '../config/app.config';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SbAuthenticationService } from 'src/app/auth/sb-authentication.service';

// Todo - Perhaps use npm package for jtw stuff like: https://www.npmjs.com/package/@auth0/angular-jwt
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private auth: SbAuthenticationService,
    private appConfig: AppConfig
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      this.isRequestToTrustedBackend(request) &&
      !this.isTokenRequest(request) &&
      this.auth.hasValidToken()
    ) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.getToken()}`
        }
      });
    }
    return next.handle(request);
  }

  isRequestToTrustedBackend(request: HttpRequest<any>): boolean {
    const gwUrl = this.appConfig.gatewayBaseUrl;
    const lcUrl = this.appConfig.layoutConfigurationBaseUrl;
    const prUrl = this.appConfig.propertiesConfigurationBaseUrl;
    const fcUrl = this.appConfig.formConfigBaseUrl;
    const wUrl = this.appConfig.widgetDataBaseUrl;
    return (
      request.url.includes(prUrl) ||
      request.url.includes(gwUrl) ||
      request.url.includes(lcUrl) ||
      request.url.includes(fcUrl) ||
      request.url.includes(wUrl)
    );
  }

  isTokenRequest(request: HttpRequest<any>): boolean {
    return request.url.includes('oauth/token');
  }
}
