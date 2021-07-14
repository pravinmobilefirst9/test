import { SbWidgetDefinitionInterface } from 'src/model/sb-widget-definition-interface';
import { SbWidgetContext } from './sb-widget-context';

export interface SbWidget {
  widgetContexts: SbWidgetContext[];
  widgetDefinitions: SbWidgetDefinitionInterface[];
}
