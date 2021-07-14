import { ColDef } from 'ag-grid-community';
import { SbWidgetContext } from './sb-widget-context';

export interface SbTablePieContext extends SbWidgetContext {
  donut?: boolean;
  rootSeriesName?: string;
  columnConfig: ColDef[];
  defaultColumnConfig?: any;
  includeZeroValues: boolean;
}
