import { SbRoutes } from './../model/sb-routes';
import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { SbLayoutConfigurationService } from './sb-layout-configuration.service';

@Injectable({
  providedIn: 'root'
})
export class SbMenuService {
  routes: SbRoutes;

  constructor(
    private layoutConfigurationService: SbLayoutConfigurationService
  ) { }

  async getMenuConfiguration(): Promise<MenuItem[]> {
    return await this.layoutConfigurationService.getMenus().toPromise();
  }

  async getRoutesConfiguration(): Promise<SbRoutes> {
    if (!this.routes) {
      const sbRoutes = await this.layoutConfigurationService
        .getRoutes()
        .toPromise();
      this.routes = sbRoutes;
    }
    return Promise.resolve(this.routes);
  }

  clear() {
    if (this.routes) {
      this.routes = undefined;
    }
  }
}
