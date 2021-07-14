import { FormConfigContext } from './../app/sb-form-configuration/sb-form-context';
import { Injectable } from '@angular/core';
import { SbDataService } from './sb-data.service';
import { SbHost } from 'src/model/sb-host-enum';
import { AppConfig } from 'src/app/config/app.config';
import { Observable } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { getObjectByKeyValue } from 'src/app/utils';

@Injectable({
  providedIn: 'root'
})
export class SbFormContextService {
  formPath = 'form-config';

  constructor(
    private dataService: SbDataService,
    private appConfig: AppConfig
  ) {}

  getFormConfig(id: string, entityId: string): Observable<FormConfigContext> {
    return this.dataService
      .getResource({ resource: this.formPath }, SbHost.FormConfigBaseUrl, id)
      .pipe(
        map(context => this.getContextWithOptionData(context)),
        flatMap(context => this.getContextWithModelData(context, entityId))
      );
  }

  private getContextWithOptionData(
    context: FormConfigContext
  ): FormConfigContext {
    if (context.optionDatas) {
      context.optionDatas.forEach(config => {
        const url = `${this.appConfig.getBaseUrl(
          context.path,
          SbHost.GatewayBaseUrl
        )}/${config.path}`;
        this.dataService.getData(url).subscribe(
          optionData => {
            const object = getObjectByKeyValue(
              'key',
              config.key,
              context.formlyFieldConfigs
            );
            if (object) {
              object.templateOptions.options = optionData;
            }
          },
          error => {
            console.error(error);
          }
        );
      });
    }
    return context;
  }

  private getContextWithModelData(
    context: FormConfigContext,
    entityId: string
  ): Observable<FormConfigContext> {
    if (entityId) {
      return this.getContextModel(entityId, context).pipe(
        map(model => {
          context.model = model;
          return context;
        })
      );
    } else {
      return new Observable<FormConfigContext>(observer => {
        context.model = Promise.resolve({});
        observer.next(context);
        observer.complete();
      });
    }
  }

  private getContextModel(
    entityId: string,
    context: FormConfigContext
  ): Observable<any> {
    return this.dataService.getResource(
      context.path,
      SbHost.GatewayBaseUrl,
      entityId
    );
  }
}
