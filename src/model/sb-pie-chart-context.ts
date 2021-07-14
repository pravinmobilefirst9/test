import { SbWidgetContext } from './sb-widget-context';

export interface SbPieChartContext extends SbWidgetContext {
  lineWidth?: number;
  lineType?: string;
  filled?: string;
  chartOptions?: any;
  donut?: boolean;
  rootSeriesName?: string;
}
