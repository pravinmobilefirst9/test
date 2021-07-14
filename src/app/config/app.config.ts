import { SbHost } from './../../model/sb-host-enum';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SbPath } from 'src/model/sb-path';

@Injectable()
export class AppConfig {
  public gatewayBaseUrl: string = null;
  public formConfigBaseUrl: string = null;
  public widgetDataBaseUrl: string = null;
  public mockDataBaseUrl: string = null;
  public layoutConfigurationBaseUrl: string = null;
  public propertiesConfigurationBaseUrl: string = null;
  public environment: string = null;
  public bypassLogin: boolean;
  public basicAuthenticationHeader: string;
  public buildVersion: string;
  public defaultBaseCurrency: string = 'SEK';
  public theme: {
    cssTheme: string;
    appTitle: string;
  };
  constructor(private http: HttpClient) { }

  public load(): Promise<void | Object> {
    return this.http
      .get('assets/config/appconfig.json')
      .toPromise()
      .then(config => {
        this.gatewayBaseUrl = config['gatewayBaseUrl'];
        this.formConfigBaseUrl = config['formConfigBaseUrl'];
        this.widgetDataBaseUrl = config['widgetDataBaseUrl'];
        this.mockDataBaseUrl = config['mockDataBaseUrl'];
        this.layoutConfigurationBaseUrl = config['layoutConfigurationBaseUrl'];
        this.propertiesConfigurationBaseUrl =
          config['propertiesConfigurationBaseUrl'];
        this.bypassLogin = config['bypassLogin'];
        this.environment = config['environment'];
        this.basicAuthenticationHeader = config['basicAuthenticationHeader'];
        this.buildVersion = config['buildVersion'];
        this.defaultBaseCurrency = config['baseCurrency'];
        this.theme = {
          cssTheme: config['cssTheme'],
          appTitle: config['appTitle']
        };
      });
  }
  // Todo - move this to private method in data-service when no
  // data requests are going through non-generic getData(url: string).
  public getBaseUrl(path: SbPath, defaultBasePath: SbHost): string {
    const config = this;
    if (path.host) {
      return path.host;
    }
    const hostEnum = path.hostEnum ? path.hostEnum : defaultBasePath;
    return this.getBaseUrlFromHost(hostEnum);
  }

  public getBaseUrlFromHost(hostEnum: SbHost): string {
    const config = this;
    switch (hostEnum) {
      case SbHost.FormConfigBaseUrl:
        return config.formConfigBaseUrl;
      case SbHost.GatewayBaseUrl:
        return config.gatewayBaseUrl;
      case SbHost.WidgetDataBaseUrl:
        return config.widgetDataBaseUrl;
      case SbHost.MockDataBaseUrl:
        return config.mockDataBaseUrl;
      case SbHost.LayoutConfigurationBaseUrl:
        return config.layoutConfigurationBaseUrl;
      default:
        throw new Error('Could not find host name');
    }
  }
}
