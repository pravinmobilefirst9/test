import { SbWidgetContext } from '../sb-widget-context';
import { SbTableRowSelectionMode } from './sb-table-row-slection-mode';

export interface SbDataTableContext extends SbWidgetContext {
  sideBar?: boolean;
  paging?: boolean;
  pageSize?: number;
  columnResize?: boolean;
  stickyHeaders?: boolean;
  verticalScroll?: boolean;
  horizontalScroll?: boolean;
  globalFilter?: boolean;
  rowSelectionMode?: SbTableRowSelectionMode;
  columnConfig: any[];
}
