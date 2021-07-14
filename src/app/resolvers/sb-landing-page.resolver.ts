import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { SbMenuService } from '../../services/sb-menu.service';

@Injectable()
export class LandingPageResolver implements Resolve<any> {
  constructor(private router: Router, private menuService: SbMenuService) {}
  resolve(route: ActivatedRouteSnapshot): any {
    try {
      this.menuService.getRoutesConfiguration().then(routes => {
        console.log('Redirecting to url: ' + routes.landingPage);
        this.router.navigate([routes.landingPage]);
      });
    } catch (error) {
      console.log(error);
      this.router.navigate(['not-found']);
    }
  }
}
