import { SbDataService } from 'src/services/sb-data.service';
import { DecimalPipe, DatePipe, PercentPipe } from '@angular/common';
import { FormattingFunctions } from '../sb-ag-table/formatting-functions';
import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { SbPieChartData } from 'src/model/sb-pie-chart-data';
import { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import 'ag-grid-enterprise';
import { SbTablePieContext } from 'src/model/sb-table-pie-context';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { SbEventTopic } from 'src/services/sb-event-topic';
import { BaseWidgetComponent } from '../base-widget/base-widget.component';
import { ActivatedRoute } from '@angular/router';
import { SbPropertiesService } from '../../../services/sb-properties.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sb-table-pie',
  templateUrl: './sb-table-pie.component.html',
  styleUrls: ['./sb-table-pie.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SbTablePieComponent extends BaseWidgetComponent
  implements OnInit, OnDestroy {
  @Input() context: SbTablePieContext;
  public clientName: string =environment.client.clientName; // imported from environments.ts
  private gridApi: GridApi;
  columnDefs: ColDef[];
  Highcharts = Highcharts;
  updateFlag = false;
  columnTypes: any;
  chartInstance: Highcharts.Chart;
  domLayout: string;
  gridStyle: any;
  gridOptions: GridOptions;
  chartOptions: Highcharts.Options = {
    chart: {
      // Making highcharts just use css styling, no presentational attributes are applied to the chart SVG
      // https://api.highcharts.com/highcharts/chart.styledMode
      styledMode: true,
      type: 'pie',
      height: 200,
      width: 200,
      events: {
        // Having to call load data after chart is redrawn due to getting calculated values from highcharts series.
        redraw: function (e) {
          this.loadTableData(e);
        }.bind(this),
        drilldown: function (e) {
          this.drillDownOccured();
        }.bind(this)
      }
    },
    title: {
      text: ''
    },
    plotOptions: {
      pie: {
        cursor: 'pointer',
        dataLabels: {
          enabled: false
        },
        showInLegend: false
      }
    },
    lang: {
      drillUpText: '<<'
    },
    tooltip: {
      formatter: function () {
        return (
          '<b>' +
          this.point.name +
          '</b><br/>' +
          '<b>' +
          Highcharts.numberFormat(this.point.percentage, 2) +
          '%</b><br/>'
        );
      },
      valueDecimals: 2,
      shared: true
    }
  };
  rowData: any[];
  oneToOneFlag = true;
  showDrillUpButton = false;
  drillDownLevel = 0;
  constructor(
    dateFormatter: DatePipe,
    numberFormatter: DecimalPipe,
    percentageFormatter: PercentPipe,
    dataService: SbDataService,
    eventBus: SbEventBusService,
    activatedRoute: ActivatedRoute,
    propertiesService: SbPropertiesService,
    protected spinner: NgxSpinnerService
  ) {
    super(dataService, eventBus, activatedRoute, spinner);
    this.responseHandler = this.setData;
    const formattingFunctions = new FormattingFunctions(
      dateFormatter,
      numberFormatter,
      percentageFormatter,
      propertiesService
    );
    this.columnTypes = formattingFunctions.columnTypes;
  }

  ngOnInit() {
    this.columnDefs = this.context.columnConfig;
    this.addCellClassRules(this.columnDefs);
    super.ngOnInit();
    this.registerEventListeners();
    this.gridOptions = { domLayout: 'autoHeight' };
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  addCellClassRules(colDefs: ColDef[]) {
    const labelColDef = colDefs.find(cd => cd.field === 'label');
    if (labelColDef.hasOwnProperty('cellClassRules')) {
      labelColDef.cellClassRules['sb-drilldown-table-label'] = function (
        params
      ) {
        return params.data ? params.data.hasDrillDown : false;
      };
    } else {
      labelColDef['cellClassRules'] = {
        'sb-drilldown-table-label': function (params) {
          return params.data ? params.data.hasDrillDown : false;
        }
      };
    }
  }

  registerEventListeners() {
    const sub = this.eventBus
      .getObservable(SbEventTopic.TabPanelTabChange)
      .subscribe(event => {
        setTimeout(() => {
          if (this.gridApi) {
            this.gridApi.sizeColumnsToFit();
          }
        });
      });
    this.subscriptions.push(sub);
  }

  setData(responseData: any) {
    const data: SbPieChartData[] = responseData;
    // We could ignore negative values here as well but that should be done on the server side
    const pieChartSeriesData = this.context.includeZeroValues ? data : data.filter(d => d.dataPoint !== 0);
    const seriesGroups = this.groupBySeriesName(pieChartSeriesData);
    const rootSeriesName =
      this.context.rootSeriesName || seriesGroups.keys().next().value;
    const drillDownSeries = [];
    const series = [];
    seriesGroups.forEach((value: SbPieChartData[], key: string) => {
      if (key !== rootSeriesName) {
        drillDownSeries.push(this.getSeriesFromPieChartData(value, key));
      } else {
        series.push(this.getSeriesFromPieChartData(value, key));
      }
    });

    this.chartOptions = Object.assign({}, this.chartOptions, {
      series: series,
      drilldown: drillDownSeries
        ? {
          series: drillDownSeries,
          drillUpButton: this.getDrillUpButtonStyle()
        }
        : {}
    });
  }

  groupBySeriesName(
    seriesData: SbPieChartData[]
  ): Map<string, SbPieChartData[]> {
    const map = new Map();
    seriesData.forEach(data => {
      const key = data.seriesName;
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [data]);
      } else {
        collection.push(data);
      }
    });
    return map;
  }

  getDrillUpButtonStyle() {
    return {
      relativeTo: 'spacingBox',
      position: {
        y: 0,
        x: 0
      },
      theme: {
        r: 5
      }
    };
  }

  addSeriesData(dataSeries: any) {
    const pieChartSeriesData: SbPieChartData[] = dataSeries;
    const series = this.getSeriesFromPieChartData(
      pieChartSeriesData,
      this.context.rootSeriesName
    );
    this.chartOptions = Object.assign({}, this.chartOptions, {
      series: series
    });
  }

  getSeriesFromPieChartData(sbData: SbPieChartData[], seriesName: string) {
    const data = sbData.map(d => ({
      name: d.displayName,
      y: d.dataPoint,
      drilldown: d.drilldownId
    }));
    return {
      name: seriesName,
      data: data,
      id: seriesName,
      innerSize: '60%'
    };
  }

  loadTableData(e: any) {
    const chart: Highcharts.Chart = e.target;
    if (chart.series.length > 0) {
      this.rowData = this.getRowData(chart.series);
    }
  }

  getRowData(
    seriesData: any[]
  ): {
    groupColumn: string;
    roundBullet: string;
    label: string;
    percentValue: number;
    numericValue: number;
  }[] {
    return seriesData[0].points.map(p => ({
      groupColumn: 'x',
      roundBullet: `pie-table-button-color-${p.colorIndex}`,
      label: p.name,
      numericValue: p.y,
      percentValue: p.percentage * 0.01,
      hasDrillDown: p.drilldown ? true : false
    }));
  }

  onGridReady(params) {
    this.gridApi = params.api;

    window.addEventListener('resize', function () {
      setTimeout(function () {
        if (params && params.api) {
          params.api.sizeColumnsToFit();
        }
      });
    });
  }

  onModelUpdated() {
    if (this.gridApi && this.columnDefs) {
      if (this.gridApi) {
        this.gridApi.sizeColumnsToFit();
      }
    }
  }
  onCellMouseOver(event) {
    const rowIndex = event.rowIndex;
    if (rowIndex > -1 && rowIndex < this.chartInstance.series[0].data.length) {
      const HOVER_STATE = 'hover';
      this.chartInstance.series[0].data[rowIndex].setState(HOVER_STATE);
    }
  }
  onCellMouseOut(event) {
    const rowIndex = event.rowIndex;
    const NORMAL_STATE = '';
    if (rowIndex > -1 && rowIndex < this.chartInstance.series[0].data.length) {
      this.chartInstance.series[0].data[rowIndex].setState(NORMAL_STATE);
    }
  }

  onRowClicked(event) {
    if (event.data.hasDrillDown) {
      // @ts-ignore: Ignore evaluation
      this.chartInstance.series[0].data[event.rowIndex].doDrilldown(false);
    }
  }

  saveChartInstance(chart: Highcharts.Chart) {
    this.chartInstance = chart;
  }

  drillUp() {
    this.chartInstance.drillUp();
    this.drillDownLevel -= 1;
    this.showDrillUpButton = this.drillDownLevel !== 0 ? true : false;
  }

  drillDownOccured() {
    this.drillDownLevel += 1;
    this.showDrillUpButton = true;
  }
}
