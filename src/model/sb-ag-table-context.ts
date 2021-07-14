import { SbWidgetContext } from 'src/model/sb-widget-context';
import { ColDef, GridOptions } from 'ag-grid-community';
import { SbPath } from './sb-path';
import { FieldMapping } from 'src/app/sb-form-configuration/sb-form-context';
import { RoutingConfig } from './sb-routing-config';

export interface DoubleClick {
  targetURL: string;
  idField?: string;
  routingConfig?: RoutingConfig;
}

export interface Button {
  label: string;
  icon?: string;
  targetURL: string;
}

export interface DefaultEditorConfig {
  path: SbPath;
}

export interface CellEditorsConfig {
  default: DefaultEditorConfig;
}

export interface SbMenuItem {
  name: String;
  accessRight: String;
  guard?: String;
  action: {
    path: SbPath
  };
}

export interface SbAgTableContext extends SbWidgetContext {
  saveStateEnabled?: boolean;
  sideBar?: boolean;
  showAdvancedToolbar?: boolean;
  columnConfig: ColDef[];
  defaultColumnConfig?: any;
  paginated?: boolean;
  pageSize?: number;
  doubleClick?: DoubleClick;
  buttons?: Button[];
  sizeColumnsToFit?: boolean;
  cellEditorConfig?: CellEditorsConfig;
  editType?: string;
  fieldMapping?: FieldMapping[];
  suppressExcelExport?: boolean;
  contextMenuItems?: SbMenuItem[];
  idKey?: string;
  compactMode?: boolean;
  // 0https://www.ag-grid.com/javascript-grid-properties/
  gridOptions?: GridOptions;
  enableUserTabs?: boolean;
}
