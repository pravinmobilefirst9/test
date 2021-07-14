import { SbStorageService } from './../../../services/sb-storage.service';
import { BaseWidgetComponent } from './../base-widget/base-widget.component';
import { Message, ConfirmationService, MenuItem } from 'primeng/api';
import { SbAgTableContext } from 'src/model/sb-ag-table-context';
import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef, Renderer2, SimpleChanges } from '@angular/core';
import { SbDataService } from 'src/services/sb-data.service';
import { FormattingFunctions } from './formatting-functions';
import 'ag-grid-enterprise';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import * as math from 'mathjs';
import {
  ColDef,
  GridApi,
  ColumnApi,
  ValueSetterParams,
  RowNode,
  GridOptions,
  GetMainMenuItemsParams
} from 'ag-grid-community';
import { Router, ActivatedRoute } from '@angular/router';
import { Button } from '../../../model/sb-ag-table-context';
import { SbEventBusService } from '../../../services/sb-event-bus.service';
import { SbPropertiesService } from '../../../services/sb-properties.service';
import { SbHost } from 'src/model/sb-host-enum';
import { HttpClient } from '@angular/common/http';
import { transformModel, uuidv4 } from 'src/app/utils';
import { FieldMapping } from 'src/app/sb-form-configuration/sb-form-context';
import { SbPath } from '../../../model/sb-path';
import { SbAuthenticationService } from '../../auth/sb-authentication.service';
import { SbEventTopic } from 'src/services/sb-event-topic';
import * as dot from 'dot-prop';
import { NgxSpinnerService } from 'ngx-spinner';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AppComponent } from 'src/app/app.component';
import { NONE_TYPE } from '@angular/compiler';
import { async } from '@angular/core/testing';
import { SbEvent } from 'src/services/sb-event';
import { Sbmessage } from 'src/model/sb-messages';
import { SbConfirmDialogComponent } from 'src/app/sb-confirm-dialog/sb-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import getNumericCellEditor from './cell-editor-functions';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-sb-ag-table',
  templateUrl: './sb-ag-table.component.html',
  styleUrls: ['./sb-ag-table.component.scss']
})
export class SbAgTableComponent extends BaseWidgetComponent
  implements OnInit, OnDestroy {
  @Input() context: SbAgTableContext;
  @ViewChild('agGrid', { static: true }) agGridDomElement: ElementRef;

  @ViewChild('agGridView', { static: true }) agGridDomElementView: ElementRef;
  public clientName: string =environment.client.clientName; // imported from environments.ts
  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;
  public printLayout:boolean;

  private viewGridApi: GridApi;
  private viewColumnApi: ColumnApi;

  msgs: Sbmessage[] = [];
  gridOptions: GridOptions;
  editType: String;
  columnDefs: ColDef[];
  defaultColDef: any;
  sideBar;
  initialDataLoaded = false;
  saveEnabled = false;
  paginated: boolean;
  pageSize: number;
  buttons: Button[];
  rowData: any[];
  columnTypes: any;
  initialRowHeight = 32;
  rowHeight = 32;
  isCondensed = false;
  compactIcon = 'fa ui-icon-unfold-less';
  compactTooltip = 'Compact View';
  autoHeightIcon = 'fa ui-icon-import-export';
  autoHeightToolTip = 'Auto height';
  domLayout: string;
  showAdvancedToolbar: boolean;
  displayDropdown = false;
  display = 'none';
  rightPanelView = '';
  displayTableViewPanel = false;
  selectedColumns: string[] = [];
  view: any;
  singleView: any;
  views: any = [];
  tabViews: any = [];
  view_name: string;
  items: MenuItem[];
  viewId: number;
  viewColumnDefs: ColDef[];
  viewRowData: any[];
  viewGridOptions: GridOptions;
  originalColumnList = [];
  subscription: Subscription;
  submitSubscription: Subscription;
  cancelSubscription: Subscription;
  /**
   * Function for custom aggregation values in group footers
   * Any column using custom aggregation must:
   *
   * 1. define an aggFunc in the colDef
   *  Can be a random string if the aggregationFunctionResult from the values
   *  in the column should not be used as part of the custom function.
   *  Ex. "aggFunc": "custom" if aggregated value of columns cell values should not be used.
   *  Ex. "aggFunc": "sum" if the sum of all this columns values should be used as part of
   *  the custom aggregation function (customAggFunc).
   *
   * 2. define a customAggFunc in the colDef (property not part of ag-grid ColDef api)
   *  Should be a math expression after replacing colId properties with results from aggregation functions.
   *  Ex. "customAggFunc": "colId.otherColumnIdOne * colId.otherColumnIdTwo"
   *  [NOTE] For this to work the other colDefs refered to must have colId properties set.
   *  If not they will be assigned "field" value as id, or in case of valueGetters they will get random integer values.
   *  (field value can be used but avoid it for clarity by setting colId explicitly)
   *
   * 3. Use the prefix colId. followed by the colId for the columns used in the aggregation expression.
   *  Ex. "customAggFunc": "colId.marketValue - colId.acquisitionValue"
   *  [NOTE] If one colId partially matches another it can cause issues with string replacements in this function.
   *  Ex. Avoid: "customAggFunc": "colId.change - colId.changeInMarketValue"
  */
  groupAddGroupNodesFunc: (nodes: RowNode[]) => any = function (nodes: RowNode[]) {

    if (this.gridColumnApi && nodes.length > 0) {
      const aggColumns = this.gridColumnApi.getValueColumns();
      // Store all cell value arrays in values object for each column based on colId
      const values = {};
      nodes.forEach(node => {
        // const data = node.group ? node.aggData : node.data; Todo - why check if group here?
        aggColumns.forEach(col => {
          // Should only happen during first iteration
          if (!values.hasOwnProperty(col.colId)) {
            values[col.colId] = [];
          }
          values[col.colId].push(this.gridApi.getValue(col.colId, node));
        });
      });

      const aggFuncs = this.gridApi.aggFuncService.aggFuncsMap;
      const result = {};
      const customAggValues = [];
      const aggColIds = [];
      aggColumns.forEach(col => {
        aggColIds.push(col.colId);
        if (aggFuncs.hasOwnProperty(col.colDef.aggFunc)) {
          // Use standard ag-grid, or registered custom, aggFunc.
          result[col.colId] = aggFuncs[col.colDef.aggFunc](values[col.colId]);
        }
        if (col.userProvidedColDef.customAggFunc) {
          // Save column to do math calculation on other aggregation results.
          // Has to be done after all others are done if using results from other aggregation functions.
          customAggValues.push(col);
        }
      });

      customAggValues.forEach(col => {
        const customFuncString: string = col.userProvidedColDef.customAggFunc;
        let customFuncResult: string = customFuncString;
        aggColIds.forEach(colId => {
          customFuncResult = customFuncResult.replace('colId.' + colId, result[colId]);
        });
        try {
          const colRes = math.eval(customFuncResult);
          // Todo: Use precision (math.format(colRes, {precision: n})) or rounding (math.round(colRes, n))
          // checking type of number since math expressions can return NaN if dividing by zero.
          result[col.colId] = colRes ? colRes : 0;
        } catch (error) {
          console.log('Error in aggregation function: Could not evaluate: ' + customFuncResult);
          result[col.colId] = 0;
        }
      });
      return result;
    }
    return {};
  }.bind(this);

  constructor(
    dateFormatter: DatePipe,
    numberFormatter: DecimalPipe,
    percentageFormatter: PercentPipe,
    dataService: SbDataService,
    private router: Router,
    private http: HttpClient,
    eventBus: SbEventBusService,
    activatedRoute: ActivatedRoute,
    propertiesService: SbPropertiesService,
    private confirmationService: ConfirmationService,
    private storageService: SbStorageService,
    private renderer: Renderer2,
    protected spinner: NgxSpinnerService,
    public dialog: MatDialog,
      // Referenced by child component (ContextMenu)
    protected authenticationService: SbAuthenticationService
  ) {
    super(dataService, eventBus, activatedRoute, spinner);
    this.autoTriggerDataLoad = true;
    this.responseHandler = this.setData;
    const formattingFunctions = new FormattingFunctions(
      dateFormatter,
      numberFormatter,
      percentageFormatter,
      propertiesService
    );
    this.columnTypes = formattingFunctions.columnTypes;
    this.rowHeight = this.initialRowHeight;
  }

  getRowNodeId(data) {
    if (this.context.idKey) {
      return '' + data[this.context.idKey];
    } else if (data.hasOwnProperty('id')) {
      return data.id;
    } else {
      return uuidv4();
    }
  }

  toggleDropdown() {
    this.displayDropdown = !this.displayDropdown;

    if (this.displayDropdown) {
      this.display = 'block';
    } else {
      this.display = 'none';
    }
  }

  toggleViewRightPanel(panelView, viewId) {
    this.displayTableViewPanel = !this.displayTableViewPanel;
    this.rightPanelView = panelView;
    this.selectedColumns = [];
    if (panelView === 'update' && viewId !== null) {
      this.getSingleView(viewId);
    } else {
      this.view_name = '';
      this.viewId = null;
      this.selectedColumns = [];
    }
  }

  async getSingleView(id) {
    await this.http.get('http://localhost:3000/views/' + id).subscribe(
      async response => {
        this.singleView = response;
        await this.patchViewDetails(this.singleView);
      },
      error => {
        console.log(error);
      });
  }

  patchViewDetails(view) {
    this.selectedColumns = [];
    this.viewColumnDefs = [];
    this.viewGridApi.setColumnDefs([]);
    if (view) {
      this.view_name = view.view_name;
      this.viewId = view.id;
      this.viewColumnDefs = view.columnConfig;
      this.viewGridApi.setColumnDefs(this.viewColumnDefs);
      for (let i = 0; i <= view.columnConfig.length; i++) {
        const columnHeader = view.columnConfig[i];
        if (columnHeader) {
          this.selectedColumns.push(columnHeader.headerName);
        }
      }
    }

    this.viewGridApi.sizeColumnsToFit();
  }

  createColumnConfig(selectedColumns) {
    const columnConfig = [];

    for (let i = 0; i <= this.context.columnConfig.length; i++) {
      const context_columnConfig = this.context.columnConfig[i];
      if (context_columnConfig) {
        for (let j = 0; j <= this.selectedColumns.length; j++) {
          const selectedColumn = this.selectedColumns[j];
          if (selectedColumn) {
            if (context_columnConfig.headerName === selectedColumn && context_columnConfig.field) {
              columnConfig.push({
                headerName: selectedColumn,
                field: context_columnConfig.field,
                colId: context_columnConfig && context_columnConfig.colId ? context_columnConfig.colId : selectedColumn.toLowerCase(),
                type: context_columnConfig && context_columnConfig.type ? context_columnConfig.type : []
              });
            }
            if (context_columnConfig.headerName === selectedColumn && context_columnConfig.valueGetter) {
              columnConfig.push({
                headerName: selectedColumn,
                valueGetter: context_columnConfig.valueGetter,
                colId: context_columnConfig && context_columnConfig.colId ? context_columnConfig.colId : selectedColumn.toLowerCase(),
                type: context_columnConfig && context_columnConfig.type ? context_columnConfig.type : []
              });
            }
          }
        }
      }
    }

    return columnConfig;
  }

  async createView() {
    this.view = {
      view_name: this.view_name,
      columnConfig: this.createColumnConfig(this.selectedColumns),
      widget_id: this.context.widgetId
    };

    await this.http.post('http://localhost:3000/views', this.view).subscribe(
      response => {
        this.getViews();
      },
      error => {
        console.log(error);
      });
    this.displayTableViewPanel = false;
  }

  async updateView() {
    this.view = {
      view_name: this.view_name,
      columnConfig: this.createColumnConfig(this.selectedColumns),
      widget_id: this.context.widgetId
    };

    await this.http.put('http://localhost:3000/views/' + this.viewId, this.view).subscribe(
      response => {
        this.getViews();
      },
      error => {
        console.log(error);
      });
    this.displayTableViewPanel = false;
  }

  async deleteView(id) {
    await this.http.delete('http://localhost:3000/views/' + id).subscribe(
      response => {
        this.getViews();
      },
      error => {
        console.log(error);
      });
  }

  getViews() {
    this.tabViews = [];
    this.http.get('http://localhost:3000/views').subscribe(
      response => {
        if (response) {
          this.views = response;
          for (let i = 0; i <= this.views.length; i++) {
            const view = this.views[i];
            if (view && view.widget_id === this.context.widgetId) {
              this.tabViews.push(view);
            }
          }
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  onTabChange(event) {
    if (event.index === 0) {
      this.gridApi.setColumnDefs(this.originalColumnList);
    } else {
      this.viewGridApi.setColumnDefs([]);
      this.getSingleView(event.index);
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.context.columnConfig, event.previousIndex, event.currentIndex);
  }

  ngOnInit() {
    this.originalColumnList = [...this.context.columnConfig];
    // this.getViews(); Todo - use this when it works
    // TODO - remove this for tabView handling
    this.context.enableUserTabs = false;

    this.rowData = [];

    this.gridOptions = Object.assign({}, this.context.gridOptions ? this.context.gridOptions : {}, {
      context: {
        componentParent: this
      },
      getContextMenuItems: (params) => { this.getContextMenuItems(params); },
      getRowNodeId: (data) => {
        return this.getRowNodeId(data);
      },
      getRowHeight: () => {
        return this.rowHeight;
      },
      components: {
        numericCellEditor: getNumericCellEditor()
      }
    });
    super.ngOnInit();

    this.editType = this.context.editType;
    this.sideBar = 'columns';
    this.saveEnabled = this.context.saveStateEnabled;
    this.columnDefs = this.context.columnConfig;
    this.defaultColDef = this.context.defaultColumnConfig;
    this.sideBar = this.context.sideBar || false;
    this.paginated = this.context.paginated || false;
    this.pageSize = this.context.paginated && this.context.pageSize ? this.context.pageSize : undefined;
    this.buttons = this.context.buttons || [];
    this.domLayout = this.context.gridOptions ? this.context.gridOptions.domLayout : undefined;
    this.showAdvancedToolbar = this.context.showAdvancedToolbar;
    // Loading of initial cell editor values
    this.columnDefs.forEach(cd => {
      cd.valueSetter = this.onCellEditingChanged.bind(this);
      if (cd.editable) {
        cd.suppressKeyboardEvent = this.onKeyDown.bind(this);
      } else {
        cd.editable = this.editable.bind(this);
      }

      cd.cellStyle = this.cellStyle.bind(this);

      if (cd.cellEditorParams && cd.cellEditorParams.path) {
        const url = this.dataService.getResourceUrl(cd.cellEditorParams.path);
        this.dataService.getData(url).subscribe(
          response => {
            cd.cellEditorParams.values = response;
          },
          () => {
            console.error('Failed to load initial cell data values' + cd.field);
          }
        );
      }
    });
    this.registerEventListeners();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    // Todo - if this happens on logout - the user name is not available and will be stored as n/a
    this.saveTableState();
  }

  private setData(responseData) {
    if (this.paginated && responseData.content) {
      this.rowData = responseData.content;
    } else {
      this.rowData = responseData;
    }
  }

  onModelUpdated() {
    if (!this.initialDataLoaded && this.gridApi) {
      this.initColumnSizing();
      // Todo - use if condition whether or not to use this - calling restoreTableState will always happen after column resizing
      // this.restoreTableState(); // Todo - fix loading of table states
      this.initialDataLoaded = true;
    }
  }

  initColumnSizing() {
    if (this.context.sizeColumnsToFit) {
      this.gridApi.sizeColumnsToFit();
    } else {
      this.gridColumnApi.autoSizeAllColumns();
    }
  }

  registerEventListeners(): any {
    const sub = this.eventBus.getObservable(SbEventTopic.TabPanelTabChange).subscribe(event => {
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
        }
      });
    });
    this.subscriptions.push(sub);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
    this.gridColumnApi = params.columnApi;
    if (this.sideBar) {
      this.gridApi.closeToolPanel();
    }
    if (this.context.sizeColumnsToFit) {
      window.addEventListener('resize', function () {
        setTimeout(function () {
          if (params && params.api) {
            params.api.sizeColumnsToFit();
          }
        });
      });
    }
    this.registerPrintListener();
    // Forcing the aggregation functions to trigger again after grid ready since we need the gridColumnApi for calculating aggregates.
    this.gridApi.refreshClientSideRowModel('aggregate');
    this.initColumnSizing();
     // this.restoreTableState();
  }

  onViewGridReady(params) {
    this.viewGridApi = params.api;
    this.viewColumnApi = params.columnApi;
  }

  registerPrintListener() {
    const sub = this.eventBus.getObservable(SbEventTopic.Print).subscribe(
      event => {
        if (event) {
          if (event.payload === 'Printing') {
            this.setPrinterFriendly();
          } else if (event.payload === 'notPrint') { // Condition to set ag-grid outside print preview component
            this.resetLayoutAfterPrint();
          } else {
              this.initColumnSizing();
              this.toggleCompactMode(true);
          }
        }
      },
      error => console.log(error)
    );
    this.subscriptions.push(sub);
  }
  onAutoHeight() {
    // Toggle domLayout (we do not need to consider print here since it's just applied when printing)
    this.domLayout = this.domLayout === 'autoHeight' ? 'normal' : 'autoHeight';
    this.autoHeightToolTip = this.domLayout === 'autoHeight' ? 'Fixed Height (Scroll)' : 'Auto Adjust Height';
    this.autoHeightIcon = this.domLayout === 'autoHeight' ? 'fa ui-icon-crop-7-5' : 'fa ui-icon-import-export';
    this.gridApi.setDomLayout(this.domLayout);
  }
  onShrinkColumnsToFit() {
    this.gridApi.sizeColumnsToFit();
  }
  onAutoSizeAll() {
    this.gridColumnApi.autoSizeAllColumns();
  }
  onResetLayout() {
    this.gridColumnApi.resetColumnState();
    this.gridColumnApi.resetColumnGroupState();
    const originalDomLayout = this.context.gridOptions ? this.context.gridOptions.domLayout : undefined;
    this.gridApi.setDomLayout(originalDomLayout);
    this.domLayout = originalDomLayout;
    // Todo DRY
    this.autoHeightToolTip = this.domLayout === 'autoHeight' ? 'Fixed Height (Scroll)' : 'Auto Adjust Height';
    this.autoHeightIcon = this.domLayout === 'autoHeight' ? 'fa ui-icon-crop-7-5' : 'fa ui-icon-import-export';
    this.toggleCompactMode(this.context.compactMode);
    this.initColumnSizing();
  }
  onCondensed() {
    this.toggleCompactMode(!this.isCondensed);
  }

  toggleCompactMode(compact: boolean) {
    if (compact) {
      this.isCondensed = true;
      this.compactIcon = 'fa ui-icon-unfold-more';
      this.compactTooltip = 'Normal View';
      this.setRowHeights(20, 34);
    } else {
      this.isCondensed = false;
      this.compactIcon = 'fa ui-icon-unfold-less';
      this.compactTooltip = 'Compact View';
      this.setRowHeights(32, 28);
    }
  }

  setPrinterFriendly() {
    this.isCondensed = true;
    this.setRowHeights(20, 34);
    this.gridApi.setDomLayout('print');
  }

  resetLayoutAfterPrint() {
    this.isCondensed = false;
    this.gridApi.setDomLayout(this.domLayout);
    this.setRowHeights(32, 28);
  }

  setRowHeights(rowHeight: number, headerHeight: number) {
    this.rowHeight = rowHeight;
    this.gridApi.setHeaderHeight(headerHeight);
    this.gridApi.resetRowHeights();
    this.gridApi.refreshGroupRows();
  }

  exportExcel() {
    this.gridApi.exportDataAsExcel();
  }

  exportCsv() {
    this.gridApi.exportDataAsCsv();
  }

  getMainMenuItems() {
    // params.defaultItems.push('rowGroup');
    // params.defaultItems.push('rowUnGroup');
    return ['pinSubMenu', 'autoSizeThis', 'autoSizeAll', 'valueAggSubMenu',
      'rowGroup', 'rowUnGroup', 'resetColumns', 'expandAll', 'contractAll'];
  }

  saveTableState() {
    if (this.gridColumnApi && this.gridApi) {
      this.storageService.localSet(this.context.widgetId, 'colState', this.gridColumnApi.getColumnState());
      this.storageService.localSet(this.context.widgetId, 'sortState', this.gridApi.getSortModel());
      this.storageService.localSet(this.context.widgetId, 'filterState', this.gridApi.getFilterModel());
    }
  }

  isSaved(): boolean {
    return this.storageService.localGet(this.context.widgetId, 'colState') ? true : false;
  }

  onKeyDown(event) {
    const keyboardEvent = event.event as KeyboardEvent;
    if (keyboardEvent.key === 'Backspace' || keyboardEvent.key === 'Delete') {
      event.newValue = undefined;
      this.onCellEditingChanged(event);
      this.gridApi.stopEditing(true);
      return true;
    }
  }

  restoreTableState() {
    const columnState = this.storageService.localGet(this.context.widgetId, 'colState');
    if (columnState) {
      this.gridColumnApi.setColumnState(columnState);
    }
    const sortState = this.storageService.localGet(this.context.widgetId, 'sortState');
    if (sortState) {
      this.gridApi.setSortModel(sortState);
    }
    const filterState = this.storageService.localGet(this.context.widgetId, 'filterState');
    if (filterState) {
      this.gridApi.setFilterModel(filterState);
    }
  }

  resetTableState() {
    this.gridColumnApi.resetColumnState();
    this.gridApi.setFilterModel(null);
    this.gridApi.setSortModel(null);
    this.storageService.localRemove(this.context.widgetId, 'colState');
    this.storageService.localRemove(this.context.widgetId, 'sortState');
    this.storageService.localRemove(this.context.widgetId, 'filterState');
  }

  onRowClicked() { }

  displayDropDownButton() {
    return this.showAdvancedToolbar || (this.buttons && this.buttons.length > 0) || !this.context.suppressExcelExport;
  }

  /**
   * Trigger an event that makes it possible to listen to row selects in tables.
   * Will only work if we have "rowSelection" set to "single" (and probably "multiple but it might not make sense to use it there")
   * in gridOptions.
   * @param event event from ag grid containing rowData as .data property (as received from server side model).
   */
  onRowSelected(event) {
    /*
    * onRowSelected is fired twice in ag-grid - first for the row selected and then for the row deselected.
    * Only publish first row until we have a need for a "TableRowDeselected" event.
    * Annoyingly there is no flag telling which one is which --> check event.node.selected for the one currently selected.
    */
    if (!event.node.selected) {
      return;
    }
    const payload: SbEvent = {
      source: this.context.widgetId,
      topic: SbEventTopic.TableRowSelected,
      payload: event.data
    };
    this.eventBus.emit(payload);
  }

  onRowDoubleClicked(event) {
    if (this.context.doubleClick) {
      const routingConfig = this.context.doubleClick.routingConfig;
      if (routingConfig && routingConfig.url) {
        const params = {};
        routingConfig.queryParameters.forEach(qp => {
          params[qp.queryParamName] =
            event.data[qp.sourcePath] || qp.defaultValue;
        });
        this.router.navigate([routingConfig.url], { queryParams: params });
      } else {
        const targetURL = '/' + this.context.doubleClick.targetURL;
        const id = this.context.doubleClick.idField
          ? event.data[this.context.doubleClick.idField]
          : null;
        this.router.navigate([targetURL, id]);
      }
    }
  }

  buttonClicked(targetURL) {
    this.router.navigate([targetURL]);
  }

  getMappedValues(
    api: GridApi,
    rowNode: RowNode,
    fieldMappings: FieldMapping[]
  ) {
    const temporaryObject = {};
    fieldMappings.forEach(fm => {
      temporaryObject[fm.source] = api.getValue(fm.source, rowNode);
    });
    return temporaryObject;
  }

  getContextMenuItems(params) {
    const rowData = params.node.data;
    const componentParent = params.context.componentParent;
    // union mellan default och de satta i context.
    const menuItems = params.context.componentParent.context.contextMenuItems;
    if (!menuItems) {
      return params.defaultItems;
    }

    const authenticationService = <SbAuthenticationService>componentParent.authenticationService;
    const filteredItems = menuItems.filter(menuItem => {
      let expressionGuard = true;
      if (menuItem.guard) {
        const f = new Function('data', menuItem.guard);
        expressionGuard = f(rowData);
      }
      return menuItem.accessRight ? authenticationService.isAuthorized(menuItem.accessRight) && expressionGuard : expressionGuard;
    });

    return [...filteredItems.map(menuItem => ({
      'name': menuItem.name,
      'guard': menuItem.guard,
      'params': params,
      'parent': params.context.componentParent,
      'actionPath': menuItem.action,
      'action': function () {
        this.params.context.componentParent.menuSelected(this);
      },
      'accessRight': menuItem.accessRight
    })), ...params.defaultItems];
  }

  editable(params) {
    if (params.colDef.hasOwnProperty('editable.expression.path')) {
      const path = params.colDef['editable.expression.path'];
      return dot.get(params.data, path, false);
    } else {
      return false;
    }
  }

  cellStyle(params) {
    if (!this.editable(params) && params.colDef.hasOwnProperty('editable.expression.path')) {
      return { backgroundColor: 'lightgray' };
    } else {
      return null;
    }
  }

  menuSelected({ actionPath: { path = {}, requestMapping = [] } = {}, params: { api, node: { data }, value} }) {
    const gridApi = <GridApi>api;
    // Post to end-point defined in path
    const requestParams = transformModel(data, false, requestMapping);
    const method = (<SbPath>path).httpMethod || 'POST';
    const url = this.dataService.getResourceUrl(<SbPath>path);
    const dialogRef = this.dialog.open(SbConfirmDialogComponent, {
      width: '500px',
      hasBackdrop: true,
      disableClose: true,
      data: {
        title: "Confirmation",
        message: `Please confirm your action?`,
        cancelText: `No`,
        confirmText: `Yes`
      }
    });
    this.submitSubscription = dialogRef.componentInstance.submitConfirm
    .subscribe(data => {
      this.http.request(method, url, { params: requestParams }).subscribe(
        response => {
          (<any[]>response).forEach(rowData => {
            const rowId = this.getRowNodeId(rowData);
            const rowNode = gridApi.getRowNode(rowId);
            if (method === 'DELETE') {
              gridApi.updateRowData({ remove: [rowData] });
            } else if (rowNode) {
              rowNode.setData(rowData);
              gridApi.flashCells({
                rowNodes: [rowNode]
              });
            }
          });
        },
        () => {
          console.error('Failed!');
        }
      );
    });

    dialogRef.afterClosed().subscribe(() => {
      this.submitSubscription.unsubscribe();
    });
  }

  onCellEditingChanged(params: ValueSetterParams): boolean {
    if (
      this.context.cellEditorConfig &&
      this.context.cellEditorConfig.default
    ) {
      const path = this.context.cellEditorConfig.default.path;
      const method = path.httpMethod || 'POST';
      const temporaryObject = this.getMappedValues(
        params.api,
        params.node,
        this.context.fieldMapping
      );
      Object.assign(temporaryObject, params.data);
      temporaryObject[params.colDef.field] = params.newValue;
      temporaryObject['newValue'] = params.newValue;
      temporaryObject['sourceField'] = params.colDef.field;
      const url = this.dataService.getResourceUrl(path, SbHost.GatewayBaseUrl);
      const body = transformModel(
        temporaryObject,
        false,
        this.context.fieldMapping
      );
      this.http
        .request(method, url, {
          body
        })
        .subscribe(
          response => {
            params.node.setData(response);
            params.api.flashCells({
              rowNodes: [params.node],
              columns: [params.colDef.field]
            });
            console.log('Successfully saved cell value: ' + params.newValue);
          },
          err => {
            console.error('Failed to save cell value: ' + params.newValue);
            // alert('Failed to save cell value.');
            params.data[params.colDef.field] = params.oldValue;
            this.msgs = [];
            this.msgs.push({
              severity: 'error',
              summary: 'Failed to update row',
              detail: err
            });
          }
        );
    } else {
      console.warn(
        'No cell editor configuration found in widget configuration.'
      );
    }
    return true;
  }
}
