import { SbWidgetContext } from './sb-widget-context';
import { SbPath } from './sb-path';
import { SbLinechartDaterange } from './sb-linechart/sb-linechart-daterange';

export interface SbLineChartContext extends SbWidgetContext {
  lineWidth?: number;
  lineType?: string;
  filled?: string;
  stacked?: boolean;
  chartOptions?: any;
  rangeSelector?: SbLinechartDaterange;
  // either percentage or value
  compare?: string;
  comparisonPath?: SbPath;
  availableCompareValuesPath?: SbPath;
}
