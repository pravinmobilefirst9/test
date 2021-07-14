import { SbWidgetContext } from './../model/sb-widget-context';
import { SbWidgetDefinitionInterface } from '../model/sb-widget-definition-interface';
import { Injectable } from '@angular/core';
import { SbLayoutConfigurationService } from './sb-layout-configuration.service';

@Injectable({
  providedIn: 'root'
})
export class SbWidgetService {

  constructor(
    private layoutConfigurationService: SbLayoutConfigurationService
  ) { }

  widgetDefinitionMap: Map<string, SbWidgetDefinitionInterface>;
  widgetContextMap: Map<string, SbWidgetContext>;
  widgetsLoaded = false;

  async resolveWidget(widgetId: string): Promise<SbWidgetDefinitionInterface> {
    if (!this.widgetsLoaded) {
      await this.loadWidgets();
    }
    return this.widgetDefinitionMap.get(widgetId);
  }

  async resolveContext(widgetId: string): Promise<SbWidgetContext> {
    if (!this.widgetsLoaded) {
      await this.loadWidgets();
    }
    return this.widgetContextMap.get(widgetId);
  }

  async loadWidgets() {
    await this.layoutConfigurationService
      .getWidgets()
      .toPromise()
      .then(
        res => {
          // Assuming always getting one widget response
          const contextMap = new Map<string, SbWidgetContext>(
            res.widgetContexts.map(
              w => [w.widgetId, w] as [string, SbWidgetContext]
            )
          );
          const definitonMap = new Map<string, SbWidgetDefinitionInterface>(
            res.widgetDefinitions.map(
              w => [w.widgetId, w] as [string, SbWidgetDefinitionInterface]
            )
          );
          this.widgetContextMap = contextMap;
          this.widgetDefinitionMap = definitonMap;
          this.widgetsLoaded = true;
        },
        err => {
          console.log('Could not load widgets: ' + err);
        }
      );
  }

  clear() {
    if (this.widgetsLoaded) {
      this.widgetContextMap = new Map<string, SbWidgetContext>();
      this.widgetDefinitionMap = new Map<string, SbWidgetDefinitionInterface>();
      this.widgetsLoaded = false;
    }
  }
}
