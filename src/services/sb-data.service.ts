import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/config/app.config';
import { SbHost } from 'src/model/sb-host-enum';
import { SbPath } from 'src/model/sb-path';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SbDataService {
  widgetDataBaseUrl: string;
  constructor(private http: HttpClient, private config: AppConfig) {}

  public getData(urlPath: string): Observable<any> {
    return this.http.get(urlPath).pipe(share());
  }

  public getDataWithParams(
    path: SbPath,
    params: HttpParams,
    defaultBasePath: SbHost
  ): Observable<any> {
    const resourceUrl = this.getResourceUrl(path, defaultBasePath);
    return this.http.get(resourceUrl, { params }).pipe(share());
  }

  public getResourceUrl(path: SbPath, defaultBasePath?: SbHost) {
    const resource =
      path.resource === '' || path.resource.startsWith('/')
        ? path.resource
        : '/' + path.resource;
    return this.config.getBaseUrl(path, defaultBasePath) + resource;
  }

  public getResource(
    path: SbPath,
    defaultBasePath: SbHost,
    id: string
  ): Observable<any> {
    const resourceUrl = this.getSingleResourceUrl(path, defaultBasePath, id);
    return this.http.get(resourceUrl).pipe(share());
  }

  public getSingleResourceUrl(
    path: SbPath,
    defaultBasePath: SbHost,
    id: string
  ): string {
    const resourceUrl = this.getResourceUrl(path, defaultBasePath);
    return `${resourceUrl}/${id}`;
  }
}
