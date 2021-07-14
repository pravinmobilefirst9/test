import { SbColumnFilterType } from './sb-column-filter-type-enum';
import { ColDef } from 'ag-grid-community';

export interface SbTableColumnConfig {
  fieldName: string;
  sideBar?: boolean;
  sortable?: boolean;
  filterType?: SbColumnFilterType;
  columnConfig: ColDef[];
  defaultColumnConfig?: ColDef[];
}
