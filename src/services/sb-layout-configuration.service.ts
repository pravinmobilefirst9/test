import { MenuItem } from 'primeng/primeng';
import { AppConfig } from './../app/config/app.config';
import { Injectable } from '@angular/core';
import { SbGrid } from 'src/model/sb-grid';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SbPanel } from 'src/model/sb-panel';
import { SbWidget } from 'src/model/sb-widget';
import { SbHost } from 'src/model/sb-host-enum';
import { SbRoutes } from 'src/model/sb-routes';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SbLayoutConfigurationService {
  gridPath = 'grids';
  widgetPath = 'widgets';
  panelPath = 'panels';
  menuPath = 'menus';
  routesPath = 'routes';
  routes: SbRoutes;

  constructor(private http: HttpClient, private config: AppConfig) { }

  getGrids(): Observable<SbGrid[]> {
    const baseUrl = this.config.getBaseUrlFromHost(
      SbHost.LayoutConfigurationBaseUrl
    );
    return this.http.get<SbGrid[]>(baseUrl + this.gridPath).pipe(share());
  }

  getPanels(): Observable<SbPanel[]> {
    const baseUrl = this.config.getBaseUrlFromHost(
      SbHost.LayoutConfigurationBaseUrl
    );
    return this.http.get<SbPanel[]>(baseUrl + this.panelPath).pipe(share());
  }

  getWidgets(): Observable<SbWidget> {
    const baseUrl = this.config.getBaseUrlFromHost(
      SbHost.LayoutConfigurationBaseUrl
    );
    return this.http.get<SbWidget>(baseUrl + this.widgetPath).pipe(share());
  }

  getMenus(): Observable<MenuItem[]> {
    const baseUrl = this.config.getBaseUrlFromHost(
      SbHost.LayoutConfigurationBaseUrl
    );
    return this.http.get<MenuItem[]>(baseUrl + this.menuPath).pipe(share());
  }

  getRoutes(): Observable<SbRoutes> {
    const baseUrl = this.config.getBaseUrlFromHost(
      SbHost.LayoutConfigurationBaseUrl
    );
    return this.http.get<SbRoutes>(baseUrl + this.routesPath).pipe(share());
  }
}
