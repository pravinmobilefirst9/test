import { SbWidgetContext } from 'src/model/sb-widget-context';
export interface SbGaugeContext extends SbWidgetContext {
  title?: string;
  chartOptions?: any;
  min: number;
  max: number;
}
