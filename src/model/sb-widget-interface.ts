import { SbWidgetType } from './sb-widget-type.enum';

export interface SbWidget {
  widgetId: string;
  widgetType: SbWidgetType;
  index?: number;
}
