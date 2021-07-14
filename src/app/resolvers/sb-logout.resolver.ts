import { SbCacheService } from './../../services/sb-cache.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { SbAuthenticationService } from '../auth/sb-authentication.service';
import { UserIdleService } from 'angular-user-idle';

@Injectable()
export class LogoutResolver implements Resolve<any> {
  constructor(
    private router: Router,
    private authenticationService: SbAuthenticationService,
    private cacheService: SbCacheService,
    private idleService: UserIdleService
  ) { }

  resolve(route: ActivatedRouteSnapshot) {
    try {
      this.authenticationService.logout();
      this.cacheService.invalidateCaches();
      // Todo - Clear Session Storage ?
      this.idleService.stopWatching();
      this.router.navigate(['login']);
      return 'Logout successful';
    } catch (error) {
      console.log(error);
      this.router.navigate(['login']);
      return 'Logout failed';
    }
  }
}
